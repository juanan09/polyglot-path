import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'
import saveProgressHandler from './save-progress.post'
import updateLocationHandler from './update-location.post'

// Mock H3
vi.mock('h3', () => ({
  defineEventHandler: vi.fn((handler) => handler),
  readBody: vi.fn(),
  createError: vi.fn((err) => err),
  useSession: vi.fn(),
}))

// Mock Persistence Service
vi.mock('../../utils/persistenceService', () => ({
  savePlayerProgress: vi.fn(),
  saveCompletedMission: vi.fn(),
  saveInventoryItems: vi.fn(),
  loadFullPlayerState: vi.fn(),
}))

// Mock Nuxt globals
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({ sessionSecret: 'test-secret' })))
vi.stubGlobal('useSession', vi.fn())

// Tipo para la sesión mockeada
interface MockSession {
  data: Record<string, unknown>
}

describe('Player API Endpoints', () => {
  const mockEvent = {} as unknown as H3Event
  const mockSession: MockSession = { data: { userId: 'u1' } }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSession).mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof useSession>>)
  })

  describe('POST /api/player/save-progress', () => {
    it('calls persistence service with correct data for authenticated user', async () => {
      const { readBody } = await import('h3')
      const { savePlayerProgress } = await import('../../utils/persistenceService')

      const payload = {
        level: 5,
        xp: 200,
        currentLocation: 'forest',
        activeMission: 'm1',
        inventory: ['potion']
      }
      vi.mocked(readBody).mockResolvedValueOnce(payload)

      const result = await saveProgressHandler(mockEvent)

      expect(result.success).toBe(true)
      expect(savePlayerProgress).toHaveBeenCalledWith('u1', expect.objectContaining({ level: 5, xp: 200 }))
    })

    it('throws 401 if unauthenticated', async () => {
      const { createError } = await import('h3')
      const emptySession: MockSession = { data: {} }
      vi.mocked(useSession).mockResolvedValueOnce(emptySession as unknown as Awaited<ReturnType<typeof useSession>>)

      try {
        await saveProgressHandler(mockEvent)
      } catch {
        expect(createError).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
      }
    })
  })


  describe('POST /api/player/update-location', () => {
    it('updates location only', async () => {
      const { readBody } = await import('h3')
      const { savePlayerProgress } = await import('../../utils/persistenceService')

      vi.mocked(readBody).mockResolvedValueOnce({ currentLocation: 'castle', currentNpcId: 'king' })

      await updateLocationHandler(mockEvent)

      expect(savePlayerProgress).toHaveBeenCalledWith('u1', {
        currentLocation: 'castle',
        currentNpcId: 'king'
      })
    })
  })
})
