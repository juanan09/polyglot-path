import { defineEventHandler, createError } from 'h3'
import { loadFullPlayerState } from '../../utils/persistenceService'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * GET /api/player/load-progress
 * Loads the player's full state from the database.
 * Only for authenticated users.
 */
export default defineEventHandler(async (event) => {
  // Verify session
  const session = await useSession(event, getSessionConfig())
  const userId = session.data?.userId as string | undefined

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const playerState = await loadFullPlayerState(userId)

  return {
    success: true,
    data: playerState,
  }
})
