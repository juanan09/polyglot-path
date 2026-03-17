import { defineEventHandler, readBody } from 'h3'
import { clearGameSession } from '../../utils/gameSession'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, npcId } = body

  if (!userId || !npcId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing userId or npcId',
    })
  }

  await clearGameSession(userId, npcId)
  
  return {
    success: true,
    message: 'Session cleared successfully'
  }
})
