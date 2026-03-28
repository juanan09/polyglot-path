import { defineEventHandler, createError } from 'h3'
import { db } from '../../db'
import { playerVocabulary, playerErrors, dialogueHistory } from '../../db/schema'
import { eq, avg, count, desc } from 'drizzle-orm'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * Endpoint para obtener la telemetría pedagógica del jugador.
 * Solo disponible para usuarios registrados.
 */
export default defineEventHandler(async (event) => {
  // 1. Verificar sesión/autenticación
  const session = await useSession(event, getSessionConfig())
  const userId = session.data?.userId as string | undefined

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: You must be logged in to view telemetry'
    })
  }

  try {
    // 2. Obtener estadísticas de vocabulario
    const vocabularyList = await db.select().from(playerVocabulary)
      .where(eq(playerVocabulary.userId, userId))
      .orderBy(desc(playerVocabulary.learnedAt))

    const vocabularyStats = {
      total: vocabularyList.length,
      byType: {
        word: vocabularyList.filter(v => v.wordType === 'word').length,
        phrase: vocabularyList.filter(v => v.wordType === 'phrase').length,
        phrasal_verb: vocabularyList.filter(v => v.wordType === 'phrasal_verb').length,
      }
    }

    // 3. Obtener errores recientes
    const recentErrors = await db.select().from(playerErrors)
      .where(eq(playerErrors.userId, userId))
      .orderBy(desc(playerErrors.createdAt))
      .limit(20)

    // 4. Obtener progreso de gramática (Media y evolución)
    const dialogueStats = await db.select({
      avgScore: avg(dialogueHistory.grammarScore),
      totalInteractions: count(dialogueHistory.id)
    })
    .from(dialogueHistory)
    .where(eq(dialogueHistory.userId, userId))

    // 5. Interacciones por NPC
    const interactionsByNpc = await db.select({
      npcId: dialogueHistory.npcId,
      count: count(dialogueHistory.id)
    })
    .from(dialogueHistory)
    .where(eq(dialogueHistory.userId, userId))
    .groupBy(dialogueHistory.npcId)

    return {
      success: true,
      data: {
        vocabulary: {
          stats: vocabularyStats,
          list: vocabularyList
        },
        errors: recentErrors,
        performance: {
          averageGrammarScore: Number.parseFloat(dialogueStats[0]?.avgScore || '0'),
          totalInteractions: dialogueStats[0]?.totalInteractions || 0,
          interactionsByNpc
        }
      }
    }
  } catch (error) {
    console.error('Telemetry fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch pedagogical telemetry'
    })
  }
})
