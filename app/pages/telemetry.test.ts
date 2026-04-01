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
    
    // Authenticate user to use server data
    authStore.user = { id: '1', email: 'test@test.com', name: 'Test User' }

    // Prepare initial store state for test
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

    // Check title
    expect(wrapper.find('.telemetry-title').text()).toContain('Learning Codex')
    
    // Check statistical indicators (0.85 -> 85%)
    expect(wrapper.text()).toContain('85%') // Grammar Accuracy
    expect(wrapper.text()).toContain('2')   // Vocabulary total (from list)
    expect(wrapper.text()).toContain('12')  // Interactions
  })

  it('shows Guest Banner when user is not authenticated', async () => {
    const authStore = useAuthStore()
    authStore.user = null // Force guest mode

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

    // In Nuxt UI/Vitest, it's sometimes more reliable to search by text in the container
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
