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
        npcResponse: 'response',
        learnedVocabulary: [],
        grammarErrors: []
      }
    }
    mockFetch.mockResolvedValue(mockResponse)

    await store.sendMessage('npc_1', 'test message', 'user_1')

    expect(store.history).toHaveLength(2)
    expect(store.lastResponse?.intent).toBe('test_intent')
    expect(store.isPending).toBe(false)
  })

  it('debe manejar errores en sendMessage', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useDialogueStore()
    mockFetch.mockRejectedValue(new Error('API Failure'))

    await store.sendMessage('npc_1', 'test message')

    expect(store.lastError).toBe('API Failure')
    expect(store.isPending).toBe(false)
    consoleSpy.mockRestore()
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

  // --- Tests de Integración con el Player Store (Fase 9) ---

  it('debe propagar la recompensa de la misión al playerStore cuando la conversación completa el objetivo', async () => {
    // Importamos e instanciamos el store del jugador para espiarlo
    const { usePlayerStore } = await import('./player')
    const playerStore = usePlayerStore()
    const completeMissionSpy = vi.spyOn(playerStore, 'completeMission')

    const store = useDialogueStore()
    
    // Simular que el endpoint detecta la intención y devuelve progreso de misión completo con recompensas
    mockFetch.mockResolvedValue({
      success: true,
      data: {
        history: [{ role: 'user', content: 'Here is the bread' }, { role: 'model', content: 'Thanks!' }],
        intent: 'give_item',
        grammarScore: 1,
        npcResponse: 'Thanks!',
        learnedVocabulary: [{ word: 'bread', type: 'word' }],
        grammarErrors: [],
        missionProgress: {
          completed: true,
          reward: { xp: 100, items: ['bread_coin'], unlocks_mission: 'next_mission' },
          message: 'Misión completada',
          nextNpcId: 'baker',
          nextLocationId: 'bakery'
        }
      }
    })

    // Enviar mensaje
    await store.sendMessage('npc_1', 'Here is the bread', 'user_1')

    // Verificamos que el dialogue store detecta el progreso de la misión y llama explícitamente a playerStore
    expect(completeMissionSpy).toHaveBeenCalledWith(
      { 
        xp: 100, 
        items: ['bread_coin'], 
        unlocks_mission: 'next_mission', 
        is_final_mission: undefined 
      },
      'Misión completada',
      'baker',
      'bakery'
    )
  })
})
