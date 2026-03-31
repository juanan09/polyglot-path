import { db } from '../db'
import { playerProgress, playerInventory, playerMissions, dialogueHistory, playerVocabulary, playerErrors } from '../db/schema'
import { eq, and, count } from 'drizzle-orm'

/**
 * Servicio de persistencia centralizado.
 * Todas las operaciones de escritura/lectura a PostgreSQL pasan por aquí.
 * Solo se invoca para usuarios autenticados (registrados).
 */

// ─── WRITE OPERATIONS ────────────────────────────────────────────────

/**
 * Guarda el vocabulario aprendido por el jugador.
 * Evita duplicados mediante onConflictDoNothing en el índice uq_user_word.
 */
export async function saveLearnedVocabulary(userId: string, vocabulary: { word: string, type: 'word' | 'phrase' | 'phrasal_verb' }[]) {
  if (!vocabulary.length) return

  for (const item of vocabulary) {
    try {
      await db.insert(playerVocabulary)
        .values({
          userId,
          word: item.word,
          wordType: item.type,
        })
        .onConflictDoNothing({ target: [playerVocabulary.userId, playerVocabulary.word] })
    } catch (error) {
      console.error('Error saving vocabulary term:', error)
    }
  }
}

/**
 * Guarda los errores gramaticales detectados.
 */
export async function saveGrammarErrors(userId: string, errors: string[]) {
  if (!errors.length) return

  const values = errors.map(errorDescription => ({
    userId,
    errorDescription,
  }))

  try {
    await db.insert(playerErrors).values(values)
  } catch (error) {
    console.error('Error saving grammar errors:', error)
  }
}

/**
 * Guarda o actualiza el progreso del jugador (upsert por userId).
 */
export async function savePlayerProgress(userId: string, state: {
  level?: number
  xp?: number
  currentLocation?: string | null
  activeMission?: string | null
  currentStoryId?: string | null
  currentStoryName?: string | null
  currentNpcId?: string | null
  // Telemetría
  grammarScore?: number
  vocabularyLearned?: number
  dialogueFrequency?: number
}) {
  const existing = await db.select().from(playerProgress).where(eq(playerProgress.userId, userId))

  if (existing.length > 0) {
    await db.update(playerProgress)
      .set({
        ...state,
        updatedAt: new Date(),
      })
      .where(eq(playerProgress.userId, userId))
  } else {
    await db.insert(playerProgress).values({
      userId,
      ...state,
      updatedAt: new Date(),
    })
  }
}

/**
 * Registra una misión completada.
 */
export async function saveCompletedMission(userId: string, missionId: string, storyId?: string | null) {
  // Verificar si ya existe esta misión para este usuario
  const existing = await db.select().from(playerMissions)
    .where(and(eq(playerMissions.userId, userId), eq(playerMissions.missionId, missionId)))

  if (existing.length > 0) {
    // Actualizar estado a 'completed'
    await db.update(playerMissions)
      .set({ status: 'completed', completedAt: new Date(), storyId })
      .where(and(eq(playerMissions.userId, userId), eq(playerMissions.missionId, missionId)))
  } else {
    await db.insert(playerMissions).values({
      userId,
      missionId,
      storyId,
      status: 'completed',
      completedAt: new Date(),
    })
  }
}

/**
 * Guarda items en el inventario del jugador (upsert por userId + itemId).
 */
export async function saveInventoryItems(userId: string, items: string[]) {
  for (const itemId of items) {
    const existing = await db.select().from(playerInventory)
      .where(and(eq(playerInventory.userId, userId), eq(playerInventory.itemId, itemId)))

    if (existing.length > 0) {
      await db.update(playerInventory)
        .set({ quantity: (existing[0]!.quantity || 1) + 1 })
        .where(and(eq(playerInventory.userId, userId), eq(playerInventory.itemId, itemId)))
    } else {
      await db.insert(playerInventory).values({
        userId,
        itemId,
        quantity: 1,
      })
    }
  }
}

/**
 * Guarda una entrada individual de diálogo en el historial.
 */
export async function saveDialogueEntry(
  userId: string,
  npcId: string,
  playerMessage: string,
  aiResponse: string,
  grammarScore?: number | null
) {
  await db.insert(dialogueHistory).values({
    userId,
    npcId,
    playerMessage,
    aiResponse,
    grammarScore,
  })

  // Tras guardar el diálogo, actualizamos el resumen pedagógico en player_progress
  await updatePedagogicalSummary(userId, grammarScore || 0)
}

/**
 * Actualiza el resumen estadístico de aprendizaje del jugador (Fase 11).
 * Recalcula medias y contadores de forma atómica para el TFM.
 */
export async function updatePedagogicalSummary(userId: string, newGrammarScore: number) {
  try {
    // 1. Obtener datos actuales de progreso y conteos reales
    const [progress] = await db.select().from(playerProgress).where(eq(playerProgress.userId, userId))
    const [vocabResult] = await db.select({ totalVocab: count() }).from(playerVocabulary).where(eq(playerVocabulary.userId, userId))
    const totalVocab = vocabResult?.totalVocab || 0
    
    if (!progress) return

    // 2. Calcular nueva media móvil de gramática
    // Formula: ((MediaActual * FrecuenciaActual) + NuevaNota) / (FrecuenciaActual + 1)
    const currentFreq = progress.dialogueFrequency || 0
    const currentScore = progress.grammarScore || 0
    const newAvgScore = Math.round(((currentScore * currentFreq) + newGrammarScore) / (currentFreq + 1))

    // 3. Actualizar tabla de progreso con los nuevos valores de telemetría
    await db.update(playerProgress)
      .set({
        grammarScore: newAvgScore,
        vocabularyLearned: totalVocab,
        dialogueFrequency: currentFreq + 1,
        updatedAt: new Date(),
      })
      .where(eq(playerProgress.userId, userId))
  } catch (error) {
    console.error('Error updating pedagogical summary:', error)
  }
}

// ─── READ OPERATIONS ─────────────────────────────────────────────────

/**
 * Carga el estado completo del jugador desde la base de datos.
 * Devuelve progreso, inventario y misiones completadas.
 */
export async function loadFullPlayerState(userId: string) {
  // Progreso general
  const [progress] = await db.select().from(playerProgress)
    .where(eq(playerProgress.userId, userId))

  // Inventario
  const inventory = await db.select().from(playerInventory)
    .where(eq(playerInventory.userId, userId))

  // Misiones completadas
  const missions = await db.select().from(playerMissions)
    .where(eq(playerMissions.userId, userId))

  const completedMissionIds = missions
    .filter(m => m.status === 'completed')
    .map(m => m.missionId)

  // Extraer historias únicas completadas (basadas en misiones completadas)
  const completedStories = Array.from(new Set(
    missions
      .filter(m => m.status === 'completed' && m.storyId)
      .map(m => m.storyId as string)
  ))

  return {
    progress: progress || null,
    inventory: inventory.map(item => item.itemId),
    completedMissions: completedMissionIds,
    completedStories,
    allMissions: missions,
  }
}
