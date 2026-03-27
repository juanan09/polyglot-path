import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRequestIP, createError } from 'h3'
import rateLimit from './rateLimit'

// Mock h3
vi.mock('h3', () => ({
  getRequestIP: vi.fn(),
  createError: vi.fn((err) => err),
}))

// Mock useStorage globally (simulate Nitro)
const storageData: Record<string, unknown> = {}
const mockStorage = {
  getItem: vi.fn(async (key: string) => storageData[key]),
  setItem: vi.fn(async (key: string, val: unknown) => { storageData[key] = val }),
  removeItem: vi.fn(async (key: string) => { delete storageData[key] }),
}
vi.stubGlobal('useStorage', vi.fn(() => mockStorage))

import type { H3Event } from 'h3'

interface H3Error {
  statusCode: number
  statusMessage: string
}

describe('rateLimit Utility', () => {
  const mockEvent = {} as unknown as H3Event
  const action = 'test'
  const ip = '127.0.0.1'

  beforeEach(() => {
    vi.clearAllMocks()
    for (const key in storageData) delete storageData[key]
    vi.mocked(getRequestIP).mockReturnValue(ip)
  })

  it('allows request when no data exists', async () => {
    await expect(rateLimit.check(mockEvent, action)).resolves.not.toThrow()
  })

  it('records failures and eventually blocks', async () => {
    // 1st to 4th attempts: No error
    for (let i = 0; i < 4; i++) {
      await rateLimit.recordFailure(mockEvent, action)
      await expect(rateLimit.check(mockEvent, action)).resolves.not.toThrow()
    }

    // 5th attempt: Reaches threshold
    await rateLimit.recordFailure(mockEvent, action)
    
    // 6th attempt: Now it should throw
    try {
      await rateLimit.check(mockEvent, action)
    } catch (err) {
      const error = err as H3Error
      expect(error.statusCode).toBe(429)
      expect(error.statusMessage).toContain('Too many attempts')
    }
    
    expect(createError).toHaveBeenCalled()
  })

  it('resets attempts for an IP', async () => {
    // Fill failures
    for (let i = 0; i < 3; i++) {
      await rateLimit.recordFailure(mockEvent, action)
    }
    
    await rateLimit.reset(mockEvent, action)
    
    const data = await mockStorage.getItem(`rate-limit:${action}:${ip}`)
    expect(data).toBeUndefined()
    await expect(rateLimit.check(mockEvent, action)).resolves.not.toThrow()
  })

  it('differentiates between actions', async () => {
    // Block action 'A'
    for (let i = 0; i < 5; i++) {
        await rateLimit.recordFailure(mockEvent, 'actionA')
    }
    
    // Action 'A' should be blocked
    try {
      await rateLimit.check(mockEvent, 'actionA')
      expect(false, 'Should have thrown 429').toBe(true)
    } catch (err) {
      const error = err as H3Error
      expect(error.statusCode).toBe(429)
    }

    // Action 'B' should still be allowed
    await expect(rateLimit.check(mockEvent, 'actionB')).resolves.not.toThrow()
  })
})
