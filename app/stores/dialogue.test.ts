import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDialogueStore } from './dialogue'

// Mock de $fetch global de Nuxt
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('Dialogue Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('debe inicializarse con el estado vacío', () => {
    const store = useDialogueStore()
    expect(store.history).toEqual([])
    expect(store.isPending).toBe(false)
    expect(store.lastResponse).toBe(null)
  })

  it('debe actualizar el historial tras un sendMessage exitoso', async () => {
    const store = useDialogueStore()
    const mockResponse = {
      success: true,
      data: {
        history: [{ role: 'user', content: 'test' }, { role: 'model', content: 'response' }],
        intent: 'test_intent',
        grammarScore: 1,
        npcResponse: 'response'
      }
    }
    mockFetch.mockResolvedValue(mockResponse)

    await store.sendMessage('npc_1', 'test message', 'user_1')

    expect(store.history).toHaveLength(2)
    expect(store.lastResponse?.intent).toBe('test_intent')
    expect(store.isPending).toBe(false)
  })

  it('debe manejar errores en sendMessage', async () => {
    const store = useDialogueStore()
    mockFetch.mockRejectedValue(new Error('API Failure'))

    await store.sendMessage('npc_1', 'test message')

    expect(store.lastError).toBe('API Failure')
    expect(store.isPending).toBe(false)
  })

  it('debe limpiar el historial local y llamar al endpoint de clear-session', async () => {
    const store = useDialogueStore()
    store.history = [{ role: 'user', content: 'old' }]
    
    mockFetch.mockResolvedValue({ success: true })

    await store.clearHistory('npc_1', 'user_1')

    expect(store.history).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/dialogue/clear-session', expect.objectContaining({
      method: 'POST',
      body: { userId: 'user_1', npcId: 'npc_1' }
    }))
  })
})
