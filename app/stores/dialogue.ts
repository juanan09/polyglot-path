import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePlayerStore } from './player'
import { useAuthStore } from './auth'

export interface Message {
  role: 'user' | 'model' | 'system'
  content: string
}

export interface DialogueResponse {
  intent: string
  grammarScore: number
  npcResponse: string
  feedback?: string
  missionProgress?: {
    completed: boolean
    reward?: { xp: number; items: string[]; unlocks_mission?: string }
    is_final_mission?: boolean
    message?: string
    nextMissionId?: string
    nextNpcId?: string
    nextLocationId?: string
  }
  history: Message[]
}

export const useDialogueStore = defineStore('dialogue', () => {
  const history = ref<Message[]>([])
  const isPending = ref(false)
  const lastError = ref<string | null>(null)
  const lastResponse = ref<Partial<DialogueResponse> | null>(null)

  /**
   * Envía un mensaje al NPC y actualiza el historial.
   * Usa el userId real del auth store si el usuario está autenticado,
   * o 'guest-<timestamp>' si es invitado.
   */
  async function sendMessage(npcId: string, message: string, userId?: string) {
    isPending.value = true
    lastError.value = null

    try {
      const playerStore = usePlayerStore()
      const authStore = useAuthStore()

      // Resolver userId: autenticado > parámetro explícito > invitado temporal
      const resolvedUserId = authStore.userId || userId || `guest-${Date.now()}`
      
      const response = await $fetch<{ success: boolean, data: DialogueResponse }>('/api/dialogue/interact', {
        method: 'POST',
        body: {
          userId: resolvedUserId,
          npcId,
          message,
          activeMissionId: playerStore.activeMissionId
        }
      })

      if (response.success) {
        history.value = response.data.history
        lastResponse.value = response.data
        
        // Handle mission progress
        if (response.data.missionProgress?.completed) {
          const mp = response.data.missionProgress
          const rewardPayload = mp.reward ? { ...mp.reward, is_final_mission: mp.is_final_mission } : undefined
          playerStore.completeMission(rewardPayload, mp.message, mp.nextNpcId, mp.nextLocationId)
        }
      } else {
        throw new Error('Failed to get a valid response from the server')
      }
    } catch (error: unknown) {
      console.error('Error in sendMessage:', error)
      const fetchError = error as { statusMessage?: string; message?: string }
      lastError.value = fetchError.statusMessage || fetchError.message || 'Unknown error'
    } finally {
      isPending.value = false
    }
  }

  /**
   * Limpia el historial de la sesión actual (Cliente y Servidor)
   */
  async function clearHistory(npcId: string, userId?: string) {
    try {
      const authStore = useAuthStore()
      const resolvedUserId = authStore.userId || userId || 'guest'

      await $fetch('/api/dialogue/clear-session', {
        method: 'POST',
        body: { userId: resolvedUserId, npcId }
      })
    } catch (error) {
      console.warn('Could not clear server session:', error)
    }
    
    history.value = []
    lastResponse.value = null
    lastError.value = null
  }

  return {
    // State
    history,
    isPending,
    lastError,
    lastResponse,

    // Actions
    sendMessage,
    clearHistory
  }
})
