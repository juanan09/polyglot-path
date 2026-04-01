import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'
import registerHandler from './register.post'
import loginHandler from './login.post'
import meHandler from './me.get'
import logoutHandler from './logout.post'
import { db } from '../../db'

// Helper to cast Drizzle mocks without repeating 'any' in each test.
// Double assertion via unknown is necessary because Drizzle builders
// have internal private types that cannot be satisfied with a mock object.
 
const drizzleMock = <T>(val: T): ReturnType<typeof db.select> => val as unknown as ReturnType<typeof db.select>

// Mock H3
vi.mock('h3', () => ({
  defineEventHandler: vi.fn((handler) => handler),
  readBody: vi.fn(),
  createError: vi.fn((err) => err),
  useSession: vi.fn(),
}))

// Mock DB
vi.mock('../../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    where: vi.fn(),
    from: vi.fn(),
  }
}))

// Mock Runtime Config
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  sessionSecret: 'test-secret-at-least-32-chars-long-!!!!!'
})))

// Mock Nuxt globally auto-imported useSession
vi.stubGlobal('useSession', vi.fn())

// Mock RateLimit utility
vi.mock('../../utils/rateLimit', () => ({
  default: {
    check: vi.fn().mockResolvedValue(undefined),
    recordFailure: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn().mockResolvedValue(undefined),
  }
}))

// Type for the mocked session
interface MockSession {
  data: Record<string, unknown>
  update: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

describe('Auth API Endpoints', () => {
  const mockEvent = {} as unknown as H3Event
  const mockSession: MockSession = {
    data: {},
    update: vi.fn(),
    clear: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSession).mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof useSession>>)

    // Default DB chain mocks
    const mockWhere = vi.fn().mockReturnValue([])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    vi.mocked(db.select).mockReturnValue(drizzleMock({ from: mockFrom }))
  })

  describe('POST /api/auth/register', () => {
    it('returns 400 if email or password missing', async () => {
      const { readBody, createError } = await import('h3')
      vi.mocked(readBody).mockResolvedValueOnce({ email: '' })

      try {
        await registerHandler(mockEvent)
      } catch {
        expect(createError).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }))
      }
    })

    it('creates a user and session on success', async () => {
      const { readBody } = await import('h3')
      vi.mocked(readBody).mockResolvedValueOnce({
        email: 'new@test.com',
        password: 'Password123',
        name: 'New User'
      })

      // Mock email check (not found)
      const mockWhere = vi.fn().mockResolvedValue([])
      vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: mockWhere }) }))

      // Mock user insert
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'u1', email: 'new@test.com', name: 'New User' }])
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
      vi.mocked(db.insert).mockReturnValue(drizzleMock({ values: mockValues }) as unknown as ReturnType<typeof db.insert>)

      const result = await registerHandler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.user.id).toBe('u1')
      expect(mockSession.update).toHaveBeenCalledWith({
        userId: 'u1',
        email: 'new@test.com',
        name: 'New User'
      })
    })

    it('returns 409 if email exists', async () => {
      const { readBody, createError } = await import('h3')
      vi.mocked(readBody).mockResolvedValueOnce({ email: 'exist@test.com', password: 'Password123' })

      // Mock email check (found)
      const mockWhere = vi.fn().mockResolvedValue([{ id: 'u1' }])
      vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: mockWhere }) }))

      try {
        await registerHandler(mockEvent)
      } catch {
        expect(createError).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }))
      }
    })

    it('returns 400 if password does not meet complexity requirements', async () => {
      const { readBody, createError } = await import('h3')

      // Case 1: too short
      vi.mocked(readBody).mockResolvedValueOnce({ email: 'test@test.com', password: 'Pas1' })
      try { await registerHandler(mockEvent) } catch { /* ignore */ }
      expect(createError).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        statusMessage: expect.stringContaining('at least 8 characters')
      }))

      // Case 2: missing uppercase
      vi.mocked(readBody).mockResolvedValueOnce({ email: 'test@test.com', password: 'password123' })
      try { await registerHandler(mockEvent) } catch { /* ignore */ }
      expect(createError).toHaveBeenLastCalledWith(expect.objectContaining({
        statusCode: 400,
        statusMessage: expect.stringContaining('uppercase')
      }))
    })
  })

  describe('POST /api/auth/login', () => {
    it('returns 401 for invalid credentials', async () => {
      const { readBody, createError } = await import('h3')
      vi.mocked(readBody).mockResolvedValueOnce({ email: 'test@test.com', password: 'wrong' })

      // Mock user not found
      const mockWhere = vi.fn().mockResolvedValue([])
      vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: mockWhere }) }))

      try {
        await loginHandler(mockEvent)
      } catch {
        expect(createError).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
      }
    })
  })

  describe('GET /api/auth/me', () => {
    it('returns user from session if authenticated', async () => {
      mockSession.data = { userId: 'u1', email: 'u1@test.com', name: 'U1' }

      const result = await meHandler(mockEvent)
      expect(result.user?.id).toBe('u1')
    })

    it('returns null if not authenticated', async () => {
      mockSession.data = {}

      const result = await meHandler(mockEvent)
      expect(result.user).toBeNull()
    })
  })

  describe('POST /api/auth/logout', () => {
    it('clears the session', async () => {
      await logoutHandler(mockEvent)
      expect(mockSession.clear).toHaveBeenCalled()
    })
  })
})
