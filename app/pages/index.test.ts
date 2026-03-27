import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import { usePlayerStore } from '~/stores/player'
import { registerEndpoint, mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockPush = vi.fn()
mockNuxtImport('useRouter', () => {
  return () => ({
    push: mockPush,
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
    beforeResolve: vi.fn(),
    onError: vi.fn()
  })
})

import IndexPage from './index.vue'

// Mock API for stories
registerEndpoint('/api/game/stories', {
  method: 'GET',
  handler: () => ({
    success: true,
    data: [
      {
        id: 'story-1',
        name: 'The Dragon Cave',
        description: 'A dangerous quest.',
        level: 'A2',
        language: 'English',
        estimated_minutes: 15,
        first_mission: 'm1',
        startNpcId: 'npc1',
        startLocationId: 'loc1',
        image: ''
      }
    ]
  })
})

describe('Index Page', () => {
  let pinia: TestingPinia

  beforeEach(() => {
    mockPush.mockClear()
    pinia = createTestingPinia({ stubActions: false })
  })

  it('debe renderizar el título del juego y la lista de historias', async () => {
    const wrapper = mount({
      template: '<Suspense><IndexPage /></Suspense>',
      components: { IndexPage }
    }, { global: { plugins: [pinia] } })

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('POLYGLOT')
    expect(wrapper.text()).toContain('PATH')
    expect(wrapper.text()).toContain('The Dragon Cave')
    expect(wrapper.find('.quest-card').exists()).toBe(true)
  })

  it('debe iniciar la historia y redirigir al briefing al hacer click', async () => {
    const playerStore = usePlayerStore()
    const spy = vi.spyOn(playerStore, 'selectStory')

    const wrapper = mount({
      template: '<Suspense><IndexPage /></Suspense>',
      components: { IndexPage }
    }, { global: { plugins: [pinia] } })

    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.find('.quest-card').trigger('click')

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      id: 'story-1',
      name: 'The Dragon Cave'
    }))
    expect(mockPush).toHaveBeenCalledWith('/briefing')
  })
})
