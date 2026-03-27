import { defineEventHandler } from 'h3'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * GET /api/auth/me
 * Devuelve el usuario actual a partir de la sesión H3, o null.
 */
export default defineEventHandler(async (event) => {
  const session = await useSession(event, getSessionConfig())

  if (!session.data?.userId) {
    return { user: null }
  }

  return {
    user: {
      id: session.data.userId,
      email: session.data.email,
      name: session.data.name,
    }
  }
})
