import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import { usePlayerStore } from '~/stores/player'
import { registerEndpoint, mockNuxtImport } from '@nuxt/test-utils/runtime'

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

import BriefingPage from './briefing.vue'

// Mock API for briefing
registerEndpoint('/api/game/briefing/story-1', {
  method: 'GET',
  handler: () => ({
    success: true,
    data: {
      story: {
        id: 'story-1',
        name: 'The Dragon Cave',
        description: 'A dangerous quest.',
        level: 'A2',
        language: 'English',
        estimated_minutes: 15,
        image: ''
      },
      missions: [{ id: 'm1', name: 'Talk to Guard', description: 'Find the cave entrance.' }],
      npc: { id: 'npc1', name: 'Zoltan', avatar: '', intro_text: 'Be careful out there.' }
    }
  })
})

describe('Briefing Page', () => {
  let pinia: TestingPinia

  beforeEach(() => {
    mockPush.mockClear()
    mockReplace.mockClear()
    pinia = createTestingPinia({
      stubActions: false,
      initialState: { player: { pendingStory: null } }
    })
  })

  it('debe redirigir a / si no hay ninguna historia pendiente (Guard)', async () => {
    mount({
      template: '<Suspense><BriefingPage /></Suspense>',
      components: { BriefingPage }
    }, { global: { plugins: [pinia], stubs: { USkeleton: true } } })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('debe mostrar los detalles de la misión cuando hay una historia pendiente', async () => {
    const playerStore = usePlayerStore()
    playerStore.pendingStory = {
      id: 'story-1',
      name: 'The Dragon Cave',
      first_mission: 'm1',
      startNpcId: 'npc1',
      startLocationId: 'loc1'
    }

    const wrapper = mount({
      template: '<Suspense><BriefingPage /></Suspense>',
      components: { BriefingPage }
    }, { global: { plugins: [pinia], stubs: { USkeleton: true } } })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('The Dragon Cave')
    expect(wrapper.text()).toContain('Zoltan')
    expect(wrapper.text()).toContain('Talk to Guard')
    expect(wrapper.text()).toContain('Be careful out there.')
  })

  it('debe iniciar el juego y redirigir a /game al pulsar el botón', async () => {
    const playerStore = usePlayerStore()
    playerStore.pendingStory = {
      id: 'story-1',
      name: 'The Dragon Cave',
      first_mission: 'm1',
      startNpcId: 'npc1',
      startLocationId: 'loc1'
    }
    const spy = vi.spyOn(playerStore, 'startGame')

    const wrapper = mount({
      template: '<Suspense><BriefingPage /></Suspense>',
      components: { BriefingPage }
    }, { global: { plugins: [pinia], stubs: { USkeleton: true } } })

    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.find('.briefing-start-btn').trigger('click')

    expect(spy).toHaveBeenCalledWith('m1', 'npc1', 'loc1', 'The Dragon Cave')
    expect(mockPush).toHaveBeenCalledWith('/game')
  })
})
