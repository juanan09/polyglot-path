import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export interface Vocabulary {
  word: string
  type: 'word' | 'phrase' | 'phrasal_verb'
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
  // Estado para persistencia local (especialmente para invitados)
  const sessionVocabulary = ref<Vocabulary[]>([])
  const sessionErrors = ref<string[]>([])
  const sessionScores = ref<number[]>([])

  // Estado para datos del servidor (usuarios registrados)
  const serverData = ref<TelemetryData | null>(null)
  const isLoading = ref(false)

  const auth = useAuthStore()

  // --- Getters ---
  
  /**
   * Combina datos del servidor con los de la sesión actual para una vista en tiempo real.
   */
  const allVocabulary = computed(() => {
    const list = [...(serverData.value?.vocabulary.list || [])]
    
    // Añadir palabras de la sesión que no estén en el servidor
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
      // Si hay datos de servidor, promediamos con los nuevos de la sesión
      const serverAvg = serverData.value.performance.averageGrammarScore
      const serverCount = serverData.value.performance.totalInteractions
      
      if (sessionScores.value.length === 0) return serverAvg
      
      const sessionSum = sessionScores.value.reduce((a, b) => a + b, 0)
      return ( (serverAvg * serverCount) + sessionSum ) / (serverCount + sessionScores.value.length)
    } else {
      // Para invitados, solo media de la sesión
      if (sessionScores.value.length === 0) return 0
      return sessionScores.value.reduce((a, b) => a + b, 0) / sessionScores.value.length
    }
  })

  // --- Actions ---

  /**
   * Añade datos de una interacción individual al estado local.
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
   * Carga los datos históricos del servidor.
   */
  async function fetchTelemetry() {
    if (!auth.isAuthenticated) return

    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean; data: TelemetryData }>('/api/player/telemetry')
      if (response.success) {
        serverData.value = response.data
        // Limpiamos los acumuladores de sesión una vez que sabemos que el servidor tiene los datos
        // (En la siguiente interacción se volverán a llenar)
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
    fetchTelemetry
  }
})
