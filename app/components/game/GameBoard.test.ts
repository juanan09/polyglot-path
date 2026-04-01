import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createTestingPinia } from '@pinia/testing'
import GameBoard from './GameBoard.vue'
import { usePlayerStore } from '@/stores/player'

// Mock Nuxt useFetch and useAsyncData
vi.mock('#app', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original as Record<string, unknown>,
    useFetch: vi.fn(() => ({
      data: ref({
        background: '/images/locations/forest.webp',
        npcs: ['npc1', 'npc2']
      }),
      pending: ref(false),
      error: ref(null),
      refresh: vi.fn()
    })),
    useAsyncData: vi.fn(() => ({
      data: ref([
        { id: 'npc1', name: 'Guard' },
        { id: 'npc2', name: 'Merchant' }
      ]),
      pending: ref(false),
      error: ref(null),
      refresh: vi.fn()
    }))
  }
})

describe('GameBoard.vue', () => {
  let pinia: ReturnType<typeof createTestingPinia>

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })
  })

  it('renders correctly with background', async () => {
    const playerStore = usePlayerStore()
    playerStore.currentLocationId = 'forest'

    const wrapper = await mountSuspended(GameBoard, {
      global: { plugins: [pinia] }
    })

    const bgDiv = wrapper.find('.game-board > div')
    expect(bgDiv.attributes('style')).toMatch(/\/images\/locations\/forest\.webp/)
  })

  it('hides NPCs when mission modal is active', async () => {
    const playerStore = usePlayerStore()
    playerStore.currentLocationId = 'forest'
    playerStore.showMissionModal = true

    const wrapper = await mountSuspended(GameBoard, {
      global: { plugins: [pinia] }
    })

    await new Promise(r => setTimeout(r, 100))

    const npcSprites = wrapper.findAll('.npc-sprite')
    expect(npcSprites.length).toBe(0)
  })
})
