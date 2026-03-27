import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import { usePlayerStore } from '~/stores/player'

import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockPush = vi.fn()
const mockReplace = vi.fn()
mockNuxtImport('useRouter', () => {
  return () => ({
    push: mockPush,
    replace: mockReplace,
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
    beforeResolve: vi.fn(),
    onError: vi.fn()
  })
})

import GamePage from './game.vue'

describe('Game Page', () => {
  let pinia: TestingPinia

  beforeEach(() => {
    mockPush.mockClear()
    mockReplace.mockClear()
    pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        player: {
          currentLocationId: null,
          currentStoryName: 'Story Test'
        }
      }
    })
  })

  it('debe redirigir a / si no hay una partida activa (Guard)', async () => {
    mount({
      template: '<Suspense><GamePage /></Suspense>',
      components: { GamePage }
    }, { global: { plugins: [pinia], stubs: { StoryCompletedModal: true } } })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('debe renderizar los componentes del juego cuando hay una partida activa', async () => {
    const playerStore = usePlayerStore()
    playerStore.currentLocationId = 'forest'

    const wrapper = mount({
      template: '<Suspense><GamePage /></Suspense>',
      components: { GamePage }
    }, { global: { plugins: [pinia], stubs: {
      PlayerHUD: { template: '<div class="player-hud"></div>' },
      GameBoard: { template: '<div class="game-board"></div>' },
      NPCDialogue: { template: '<div class="npc-dialogue"></div>' },
      InventoryPanel: { template: '<div class="inventory-panel"></div>' },
      MissionModal: true,
      StoryCompletedModal: true
    } } })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.find('.player-hud').exists()).toBe(true)
    expect(wrapper.find('.game-board').exists()).toBe(true)
    expect(wrapper.find('.npc-dialogue').exists()).toBe(true)
    expect(wrapper.find('.inventory-panel').exists()).toBe(true)
  })
})
