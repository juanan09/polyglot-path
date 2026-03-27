import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import StoryCompletedModal from './StoryCompletedModal.vue'
import { usePlayerStore } from '~/stores/player'

// Mock de useRouter
const mockPush = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      afterEach: vi.fn(),
      beforeEach: vi.fn()
    })
  }
})

describe('StoryCompletedModal Component', () => {
  let pinia: TestingPinia

  beforeEach(() => {
    mockPush.mockClear()
    pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        player: { 
          showStoryCompletedModal: false,
          currentStoryName: 'Adventures in London',
          stagedReward: null
        }
      }
    })
  })

  it('no debe renderizarse si showStoryCompletedModal es false', () => {
    const wrapper = mount(StoryCompletedModal, {
      global: {
        plugins: [pinia],
        stubs: { UIcon: true }
      }
    })
    expect(wrapper.find('.story-completed-modal').exists()).toBe(false)
  })

  it('debe mostrar el nombre de la historia y recompensas finales', async () => {
    const playerStore = usePlayerStore()
    playerStore.showStoryCompletedModal = true
    playerStore.stagedReward = {
      xp: 500,
      items: ['trophy_gold'],
      message: 'End of story'
    }

    const wrapper = mount(StoryCompletedModal, {
      global: {
        plugins: [pinia],
        stubs: { UIcon: true }
      }
    })

    expect(wrapper.find('.story-completed-modal').exists()).toBe(true)
    expect(wrapper.text()).toContain('Story Completed!')
    expect(wrapper.text()).toContain('Adventures in London')
    expect(wrapper.text()).toContain('+500')
    expect(wrapper.text().toLowerCase()).toContain('trophy gold')
  })

  it('debe limpiar el estado y volver al menú al hacer click', async () => {
    const playerStore = usePlayerStore()
    playerStore.showStoryCompletedModal = true
    playerStore.currentStoryName = 'Test Story'

    const wrapper = mount(StoryCompletedModal, {
      global: {
        plugins: [pinia],
        stubs: { UIcon: true }
      }
    })

    await wrapper.find('button').trigger('click')

    // Verificamos que se han reseteado las variables críticas del store
    expect(playerStore.showStoryCompletedModal).toBe(false)
    expect(playerStore.currentStoryName).toBe(null)
    
    // Verificamos redirección
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
