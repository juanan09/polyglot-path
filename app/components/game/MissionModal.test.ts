import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import MissionModal from './MissionModal.vue'
import { usePlayerStore } from '~/stores/player'

describe('MissionModal Component', () => {
  let pinia: TestingPinia

  beforeEach(() => {
    pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        player: {
          showMissionModal: false,
          stagedReward: null
        }
      }
    })
  })

  it('should not render if showMissionModal is false', () => {
    const wrapper = mount(MissionModal, {
      global: {
        plugins: [pinia],
        stubs: { UIcon: true }
      }
    })
    expect(wrapper.find('.mission-modal').exists()).toBe(false)
  })

  it('should show XP reward and correct buttons for intermediate mission', async () => {
    const playerStore = usePlayerStore()
    playerStore.showMissionModal = true
    playerStore.stagedReward = {
      xp: 100,
      items: ['sword'],
      unlocks_mission: 'mission2',
      message: 'Great job!',
      is_final_mission: false
    }

    const wrapper = mount(MissionModal, {
      global: {
        plugins: [pinia],
        stubs: { UIcon: true }
      }
    })

    expect(wrapper.find('.mission-modal').exists()).toBe(true)
    expect(wrapper.text()).toContain('Congratulations!')
    expect(wrapper.text()).toContain('100 XP')
    expect(wrapper.text()).toContain('sword')
    
    // Should have "Close" and "Continue" buttons
    expect(wrapper.find('.close-btn').exists()).toBe(true)
    expect(wrapper.find('.continue-btn').text()).toContain('Continue')
  })

  it('should show the "Finish Story" button in the final mission', async () => {
    const playerStore = usePlayerStore()
    playerStore.showMissionModal = true
    playerStore.stagedReward = {
      xp: 200,
      items: [],
      is_final_mission: true,
      message: 'The End'
    }

    const wrapper = mount(MissionModal, {
      global: {
        plugins: [pinia],
        stubs: { UIcon: true }
      }
    })

    // Should be no "Close" button in the final mission (per v-if="!isFinalMission")
    expect(wrapper.find('.close-btn').exists()).toBe(false)
    // The continue button should say "Finish Story"
    expect(wrapper.find('.continue-btn').text()).toContain('Finish Story')
  })

  it('should call acceptMissionReward in the store when clicking continue', async () => {
    const playerStore = usePlayerStore()
    playerStore.showMissionModal = true
    playerStore.stagedReward = {
      xp: 50,
      items: [],
      unlocks_mission: 'next'
    }
    
    // Spy on the store method
    const spy = vi.spyOn(playerStore, 'acceptMissionReward')

    const wrapper = mount(MissionModal, {
      global: {
        plugins: [pinia],
        stubs: { UIcon: true }
      }
    })

    await wrapper.find('.continue-btn').trigger('click')
    
    expect(spy).toHaveBeenCalledWith(true)
  })
})
