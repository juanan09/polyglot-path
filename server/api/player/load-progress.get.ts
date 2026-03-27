import { defineEventHandler, createError } from 'h3'
import { loadFullPlayerState } from '../../utils/persistenceService'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * GET /api/player/load-progress
 * Carga el estado completo del jugador desde la base de datos.
 * Solo para usuarios autenticados.
 */
export default defineEventHandler(async (event) => {
  // Verificar sesión
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
