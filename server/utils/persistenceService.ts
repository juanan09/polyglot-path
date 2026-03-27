import { db } from '../db'
import { playerProgress, playerInventory, playerMissions, dialogueHistory } from '../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Servicio de persistencia centralizado.
 * Todas las operaciones de escritura/lectura a PostgreSQL pasan por aquí.
 * Solo se invoca para usuarios autenticados (registrados).
 */

// ─── WRITE OPERATIONS ────────────────────────────────────────────────

/**
 * Guarda o actualiza el progreso del jugador (upsert por userId).
 */
export async function savePlayerProgress(userId: string, state: {
  level?: number
  xp?: number
  currentLocation?: string | null
  activeMission?: string | null
  currentStoryName?: string | null
  currentNpcId?: string | null
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

  return {
    progress: progress || null,
    inventory: inventory.map(item => item.itemId),
    completedMissions: missions
      .filter(m => m.status === 'completed')
      .map(m => m.missionId),
    allMissions: missions,
  }
}
