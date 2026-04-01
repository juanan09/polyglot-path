import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export interface Vocabulary {
  word: string
  wordType: 'word' | 'phrase' | 'phrasal_verb'
  learnedAt?: string
}

export interface TelemetryData {
  vocabulary: {
    stats: {
      total: number
      byType: { word: number; phrase: number; phrasal_verb: number }
    }
    list: Vocabulary[]
  }
  errors: { errorDescription: string; createdAt: string }[]
  performance: {
    averageGrammarScore: number
    totalInteractions: number
    interactionsByNpc: { npcId: string; count: number }[]
  }
}

export const useTelemetryStore = defineStore('telemetry', () => {
  // State for local persistence (especially for guests)
  const sessionVocabulary = ref<Vocabulary[]>([])
  const sessionErrors = ref<string[]>([])
  const sessionScores = ref<number[]>([])

  // State for server data (registered users)
  const serverData = ref<TelemetryData | null>(null)
  const isLoading = ref(false)

  const auth = useAuthStore()

  // --- Getters ---
  
  /**
   * Combines server data with the current session data for a real-time view.
   */
  const allVocabulary = computed(() => {
    const list = [...(serverData.value?.vocabulary.list || [])]
    
    // Add session words that are not on the server
    sessionVocabulary.value.forEach(item => {
      if (!list.some(v => v.word === item.word)) {
        list.unshift({ ...item, learnedAt: new Date().toISOString() })
      }
    })
    
    return list
  })

  const allErrors = computed(() => {
    const list = (serverData.value?.errors || []).map(e => e.errorDescription)
    return [...sessionErrors.value, ...list]
  })

  const averageScore = computed(() => {
    if (auth.isAuthenticated && serverData.value) {
      // If there is server data, average it with the new session data
      const serverAvg = serverData.value.performance.averageGrammarScore
      const serverCount = serverData.value.performance.totalInteractions
      
      if (sessionScores.value.length === 0) return serverAvg
      
      const sessionSum = sessionScores.value.reduce((a, b) => a + b, 0)
      return ( (serverAvg * serverCount) + sessionSum ) / (serverCount + sessionScores.value.length)
    } else {
      // For guests, only average the session
      if (sessionScores.value.length === 0) return 0
      return sessionScores.value.reduce((a, b) => a + b, 0) / sessionScores.value.length
    }
  })

  // --- Actions ---

  /**
   * Adds individual interaction data to the local state.
   */
  function addInteractionData(data: { grammarScore: number; vocabulary: Vocabulary[]; errors: string[] }) {
    sessionScores.value.push(data.grammarScore)
    
    data.vocabulary.forEach(v => {
      if (!sessionVocabulary.value.some(sv => sv.word === v.word)) {
        sessionVocabulary.value.push(v)
      }
    })
    
    data.errors.forEach(e => {
      sessionErrors.value.unshift(e)
    })
  }

  /**
   * Loads historical data from the server.
   */
  async function fetchTelemetry() {
    if (!auth.isAuthenticated) return

    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean; data: TelemetryData }>('/api/player/telemetry')
      if (response.success) {
        serverData.value = response.data
        // Clear session accumulators once we know the server has the data
        // (They will be filled again in the next interaction)
        sessionVocabulary.value = []
        sessionErrors.value = []
        sessionScores.value = []
      }
    } catch (error) {
      console.error('Failed to fetch telemetry from server:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clears all telemetry data (for logout)
   */
  function resetState() {
    sessionVocabulary.value = []
    sessionErrors.value = []
    sessionScores.value = []
    serverData.value = null
  }

  return {
    // State
    sessionVocabulary,
    sessionErrors,
    serverData,
    isLoading,
    
    // Computed
    allVocabulary,
    allErrors,
    averageScore,
    
    // Actions
    addInteractionData,
    fetchTelemetry,
    resetState
  }
})
