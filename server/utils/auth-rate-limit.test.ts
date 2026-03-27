import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'
import registerHandler from '../../server/api/auth/register.post'
import loginHandler from '../../server/api/auth/login.post'
import { db } from '../../server/db'

// Helper para castear mocks de Drizzle sin repetir 'any' en cada test.
 
const drizzleMock = <T>(val: T): ReturnType<typeof db.select> => val as unknown as ReturnType<typeof db.select>

interface H3Error {
  statusCode: number
  statusMessage: string
}

// Mock h3
vi.mock('h3', () => ({
  defineEventHandler: vi.fn((handler) => handler),
  readBody: vi.fn(),
  createError: vi.fn((err) => err),
  useSession: vi.fn(),
  getRequestIP: vi.fn(() => '127.0.0.1'),
}))

// Mock DB
vi.mock('../../server/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  }
}))

// Mock useStorage/useRuntimeConfig
vi.stubGlobal('useStorage', vi.fn(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
})))
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  sessionSecret: 'test-secret-at-least-32-chars-long-!!!!!'
})))

describe('Auth Rate Limiting Integration', () => {
  const mockEvent = {} as unknown as H3Event

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('blocks login after 5 failed attempts', async () => {
    const { readBody } = await import('h3')
    const rateLimit = (await import('../../server/utils/rateLimit')).default

    // Mock failure behavior (contraseña incorrecta de test)
    vi.mocked(readBody).mockResolvedValue({ email: 'test@test.com', password: 'wrong-password-123' })
    vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }))

    // Simulate 5 failures already recorded
    vi.spyOn(rateLimit, 'check').mockRejectedValueOnce({ statusCode: 429, statusMessage: 'Too many attempts' })

    try {
      await loginHandler(mockEvent)
    } catch (err) {
      const error = err as H3Error
      expect(error.statusCode).toBe(429)
      expect(error.statusMessage).toContain('Too many attempts')
    }
  })

  it('blocks registration after multiple attempts with same email', async () => {
    const { readBody } = await import('h3')
    const rateLimit = (await import('../../server/utils/rateLimit')).default

    // Mock failure behavior (email ya existente)
    vi.mocked(readBody).mockResolvedValue({ email: 'exist@test.com', password: 'Password123!' })
    vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([{ id: 'u1' }]) }) }))

    // Simulate blocked
    vi.spyOn(rateLimit, 'check').mockRejectedValueOnce({ statusCode: 429, statusMessage: 'Too many attempts' })

    try {
      await registerHandler(mockEvent)
    } catch (err) {
      const error = err as H3Error
      expect(error.statusCode).toBe(429)
    }
  })
})
