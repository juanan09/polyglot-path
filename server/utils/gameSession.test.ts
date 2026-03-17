import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrCreateSession, addMessageToSession, clearGameSession, getSessionId } from './gameSession'

// Mock de useStorage de Nitro/H3
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

vi.stubGlobal('useStorage', vi.fn(() => mockStorage))

describe('gameSession utility', () => {
  const userId = 'user_123'
  const npcId = 'guard'
  const sessionId = getSessionId(userId, npcId)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new session if it does not exist', async () => {
    mockStorage.getItem.mockResolvedValue(null)

    const session = await getOrCreateSession(userId, npcId)

    expect(session.userId).toBe(userId)
    expect(session.npcId).toBe(npcId)
    expect(session.messages).toEqual([])
    expect(mockStorage.setItem).toHaveBeenCalledWith(sessionId, expect.any(Object))
  })

  it('should return existing session if it exists', async () => {
    const existingSession = {
      userId,
      npcId,
      messages: [{ role: 'user', content: 'hello' }],
      updatedAt: Date.now(),
    }
    mockStorage.getItem.mockResolvedValue(existingSession)

    const session = await getOrCreateSession(userId, npcId)

    expect(session).toEqual(existingSession)
    expect(mockStorage.setItem).not.toHaveBeenCalled()
  })

  it('should add a message to an existing session', async () => {
    const existingSession = {
      userId,
      npcId,
      messages: [],
      updatedAt: Date.now(),
    }
    mockStorage.getItem.mockResolvedValue(existingSession)

    const updatedSession = await addMessageToSession(userId, npcId, 'user', 'How are you?')

    expect(updatedSession.messages).toHaveLength(1)
    expect(updatedSession.messages[0]).toEqual({ role: 'user', content: 'How are you?' })
    expect(mockStorage.setItem).toHaveBeenCalledWith(sessionId, updatedSession)
  })

  it('should clear a session', async () => {
    await clearGameSession(userId, npcId)
    expect(mockStorage.removeItem).toHaveBeenCalledWith(sessionId)
  })
})
