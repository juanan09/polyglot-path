import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createTestingPinia } from '@pinia/testing'
import Telemetry from './telemetry.vue'
import { useTelemetryStore } from '@/stores/telemetry'
import { useAuthStore } from '@/stores/auth'

// Mock de Nuxt App y Head
vi.mock('#app', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original as Record<string, unknown>,
    useHead: vi.fn(),
    useRouter: () => ({
      push: vi.fn()
    })
  }
})

describe('Telemetry.vue', () => {
  let pinia: ReturnType<typeof createTestingPinia>

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })
  })

  it('renders correctly with stats', async () => {
    const authStore = useAuthStore()
    const telemetry = useTelemetryStore()
    
    // Autenticar al usuario para que se usen los datos del servidor
    authStore.user = { id: '1', email: 'test@test.com', name: 'Test User' }

    // Preparar estado inicial del store para el test
    telemetry.serverData = {
      vocabulary: {
        stats: { total: 10, byType: { word: 5, phrase: 3, phrasal_verb: 2 } },
        list: [
          { word: 'sword', wordType: 'word' },
          { word: 'thank you', wordType: 'phrase' }
        ]
      },
      errors: [
        { errorDescription: 'Grammar error 1', createdAt: new Date().toISOString() }
      ],
      performance: {
        averageGrammarScore: 0.85,
        totalInteractions: 12,
        interactionsByNpc: []
      }
    }

    const wrapper = await mountSuspended(Telemetry, {
      global: { plugins: [pinia] }
    })

    // Comprobar título
    expect(wrapper.find('.telemetry-title').text()).toContain('Learning Codex')
    
    // Comprobar indicadores estadísticos (0.85 -> 85%)
    expect(wrapper.text()).toContain('85%') // Grammar Accuracy
    expect(wrapper.text()).toContain('2')   // Vocabulary total (from list)
    expect(wrapper.text()).toContain('12')  // Interactions
  })

  it('shows Guest Banner when user is not authenticated', async () => {
    const authStore = useAuthStore()
    authStore.user = null // Forzar modo invitado

    const wrapper = await mountSuspended(Telemetry, {
      global: { plugins: [pinia] }
    })

    expect(wrapper.find('.guest-banner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Secure Your Learning!')
  })

  it('renders discovered vocabulary lists', async () => {
    const telemetry = useTelemetryStore()
    telemetry.sessionVocabulary = [
        { word: 'shield', wordType: 'word' }
    ]

    const wrapper = await mountSuspended(Telemetry, {
      global: { plugins: [pinia] }
    })

    // En Nuxt UI/Vitest, a veces es más fiable buscar por texto en el contenedor
    const vocabSection = wrapper.find('.vocabulary-section')
    expect(vocabSection.exists()).toBe(true)
    expect(vocabSection.text()).toContain('shield')
  })

  it('renders mistakes log from store', async () => {
    const telemetry = useTelemetryStore()
    telemetry.sessionErrors = ['Testing error message']

    const wrapper = await mountSuspended(Telemetry, {
      global: { plugins: [pinia] }
    })

    expect(wrapper.text()).toContain('Mistakes Log')
    expect(wrapper.text()).toContain('Testing error message')
  })
})
