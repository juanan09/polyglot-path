import { defineEventHandler, readBody, createError } from 'h3'
import { hashSync } from 'bcryptjs'
import { db } from '../../db'
import { users, playerProgress } from '../../db/schema'
import { eq } from 'drizzle-orm'
import rateLimit from '../../utils/rateLimit'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * POST /api/auth/register
 * Registra un nuevo usuario con email + contraseña.
 * Crea automáticamente un registro player_progress inicial.
 */
export default defineEventHandler(async (event) => {
  // 🛡️ Verificar Rate Limit antes de procesar
  await rateLimit.check(event, 'register')

  const body = await readBody(event)
  const { email, password, name } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  // 🛡️ Validación de complejidad de contraseña (8+ chars, 1 mayúscula, 1 número)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!passwordRegex.test(password)) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Password must be at least 8 characters long and contain at least one uppercase letter and one number' 
    })
  }

  // Verificar si el email ya existe
  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()))
  if (existing.length > 0) {
    // 🛡️ Registrar fallo (intento de registro con email ya existente)
    await rateLimit.recordFailure(event, 'register')
    throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists' })
  }

  // Hashear contraseña y crear usuario
  const passwordHash = hashSync(password, 10)

  const [newUser] = await db.insert(users).values({
    email: email.toLowerCase().trim(),
    name: name?.trim() || 'Viajero',
    passwordHash,
    provider: 'local',
  }).returning()

  // Crear registro de progreso inicial
  await db.insert(playerProgress).values({
    userId: newUser!.id,
  })

  // Establecer sesión H3
  const session = await useSession(event, getSessionConfig())
  await session.update({ userId: newUser!.id, email: newUser!.email, name: newUser!.name })

  // 🛡️ Registro exitoso: Resetear Rate Limit
  await rateLimit.reset(event, 'register')

  return {
    success: true,
    user: {
      id: newUser!.id,
      email: newUser!.email,
      name: newUser!.name,
    }
  }
})
