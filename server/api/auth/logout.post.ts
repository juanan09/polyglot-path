import { defineEventHandler } from 'h3'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * POST /api/auth/logout
 * Destruye la sesión H3 y limpia la cookie.
 */
export default defineEventHandler(async (event) => {
  const session = await useSession(event, getSessionConfig())
  await session.clear()

  return { success: true }
})
