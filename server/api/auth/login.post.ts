import { defineEventHandler, readBody, createError } from 'h3'
import { compareSync } from 'bcryptjs'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import rateLimit from '../../utils/rateLimit'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * POST /api/auth/login
 * Inicia sesión con email + contraseña.
 */
export default defineEventHandler(async (event) => {
  // 🛡️ Verificar Rate Limit antes de procesar
  await rateLimit.check(event, 'login')

  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  // Buscar usuario
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()))

  if (!user || !user.passwordHash) {
    // 🛡️ Registrar fallo
    await rateLimit.recordFailure(event, 'login')
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  // Verificar contraseña
  const isValid = compareSync(password, user.passwordHash)
  if (!isValid) {
    // 🛡️ Registrar fallo
    await rateLimit.recordFailure(event, 'login')
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  // 🛡️ Login exitoso: Resetear Rate Limit
  await rateLimit.reset(event, 'login')

  // Establecer sesión H3
  const session = await useSession(event, getSessionConfig())
  await session.update({ userId: user.id, email: user.email, name: user.name })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  }
})
