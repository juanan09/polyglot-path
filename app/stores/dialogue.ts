import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePlayerStore } from './player'

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
    message?: string
    nextMissionId?: string
  }
  history: Message[]
}

export const useDialogueStore = defineStore('dialogue', () => {
  const history = ref<Message[]>([])
  const isPending = ref(false)
  const lastError = ref<string | null>(null)
  const lastResponse = ref<Partial<DialogueResponse> | null>(null)

  /**
   * Envía un mensaje al NPC y actualiza el historial
   */
  async function sendMessage(npcId: string, message: string, userId: string = 'test-user') {
    isPending.value = true
    lastError.value = null

    try {
      const playerStore = usePlayerStore()
      
      const response = await $fetch<{ success: boolean, data: DialogueResponse }>('/api/dialogue/interact', {
        method: 'POST',
        body: {
          userId,
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
          playerStore.completeMission(response.data.missionProgress.reward, response.data.missionProgress.message)
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
  async function clearHistory(npcId: string, userId: string = 'test-user') {
    try {
      await $fetch('/api/dialogue/clear-session', {
        method: 'POST',
        body: { userId, npcId }
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
