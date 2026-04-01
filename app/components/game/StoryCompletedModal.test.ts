import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import StoryCompletedModal from './StoryCompletedModal.vue'
import { usePlayerStore } from '~/stores/player'

// Mock useRouter
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

  it('should not render if showStoryCompletedModal is false', () => {
    const wrapper = mount(StoryCompletedModal, {
      global: {
        plugins: [pinia],
        stubs: { UIcon: true }
      }
    })
    expect(wrapper.find('.story-completed-modal').exists()).toBe(false)
  })

  it('should show the story name and final rewards', async () => {
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

  it('should clear state and return to menu on click', async () => {
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

    // Verify that critical store variables have been reset
    expect(playerStore.showStoryCompletedModal).toBe(false)
    expect(playerStore.currentStoryName).toBe(null)
    
    // Verify redirection
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
