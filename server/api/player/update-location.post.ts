import { defineEventHandler, readBody, createError } from 'h3'
import { savePlayerProgress } from '../../utils/persistenceService'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * POST /api/player/update-location
 * Updates the player's current location and NPC.
 * Only for authenticated users.
 */
export default defineEventHandler(async (event) => {
  // Verify session
  const session = await useSession(event, getSessionConfig())
  const userId = session.data?.userId as string | undefined

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const body = await readBody(event)
  const { currentLocation, currentNpcId } = body

  await savePlayerProgress(userId, {
    currentLocation,
    currentNpcId,
  })

  return { success: true }
})
