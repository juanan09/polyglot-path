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

  it('no debe renderizarse si showMissionModal es false', () => {
    const wrapper = mount(MissionModal, {
      global: {
        plugins: [pinia],
        stubs: { UIcon: true }
      }
    })
    expect(wrapper.find('.mission-modal').exists()).toBe(false)
  })

  it('debe mostrar la recompensa de XP y los botones correctos para misión intermedia', async () => {
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
    
    // Debe tener botón "Close" y "Continue"
    expect(wrapper.find('.close-btn').exists()).toBe(true)
    expect(wrapper.find('.continue-btn').text()).toContain('Continue')
  })

  it('debe mostrar el botón de "Finish Story" en la misión final', async () => {
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

    // No debe haber botón "Close" en la final (según v-if="!isFinalMission")
    expect(wrapper.find('.close-btn').exists()).toBe(false)
    // El botón de continuar debe decir "Finish Story"
    expect(wrapper.find('.continue-btn').text()).toContain('Finish Story')
  })

  it('debe llamar a acceptMissionReward en el store al hacer click en continuar', async () => {
    const playerStore = usePlayerStore()
    playerStore.showMissionModal = true
    playerStore.stagedReward = {
      xp: 50,
      items: [],
      unlocks_mission: 'next'
    }
    
    // Espiamos el método del store
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
