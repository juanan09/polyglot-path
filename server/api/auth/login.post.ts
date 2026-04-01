import { defineEventHandler, readBody, createError } from 'h3'
import { compareSync } from 'bcryptjs'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import rateLimit from '../../utils/rateLimit'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * POST /api/auth/login
 * Login with email + password.
 */
export default defineEventHandler(async (event) => {
  // 🛡️ Verify Rate Limit before processing
  await rateLimit.check(event, 'login')

  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  // Find user
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()))

  if (!user?.passwordHash) {
    // 🛡️ Record failure
    await rateLimit.recordFailure(event, 'login')
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  // Verify password
  const isValid = compareSync(password, user.passwordHash)
  if (!isValid) {
    // 🛡️ Record failure
    await rateLimit.recordFailure(event, 'login')
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  // 🛡️ Successful Login: Reset Rate Limit
  await rateLimit.reset(event, 'login')

  // Set H3 session
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
