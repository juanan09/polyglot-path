import { defineEventHandler, readBody, createError } from 'h3'
import { hashSync } from 'bcryptjs'
import { db } from '../../db'
import { users, playerProgress } from '../../db/schema'
import { eq } from 'drizzle-orm'
import rateLimit from '../../utils/rateLimit'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * POST /api/auth/register
 * Registers a new user with email + password.
 * Automatically creates an initial player_progress record.
 */
export default defineEventHandler(async (event) => {
  // 🛡️ Verify Rate Limit before processing
  await rateLimit.check(event, 'register')

  const body = await readBody(event)
  const { email, password, name } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  // 🛡️ Password complexity validation (8+ chars, 1 uppercase, 1 number)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!passwordRegex.test(password)) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Password must be at least 8 characters long and contain at least one uppercase letter and one number' 
    })
  }

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()))
  if (existing.length > 0) {
    // 🛡️ Record failure (registration attempt with existing email)
    await rateLimit.recordFailure(event, 'register')
    throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists' })
  }

  // Hash password and create user
  const passwordHash = hashSync(password, 10)

  const [newUser] = await db.insert(users).values({
    email: email.toLowerCase().trim(),
    name: name?.trim() || 'Viajero',
    passwordHash,
    provider: 'local',
  }).returning()

  // Create initial progress record
  await db.insert(playerProgress).values({
    userId: newUser!.id,
  })

  // Set H3 session
  const session = await useSession(event, getSessionConfig())
  await session.update({ userId: newUser!.id, email: newUser!.email, name: newUser!.name })

  // 🛡️ Successful Registration: Reset Rate Limit
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
