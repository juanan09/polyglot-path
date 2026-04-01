import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import InventoryPanel from './InventoryPanel.vue'
import { usePlayerStore } from '~/stores/player'

describe('InventoryPanel Component', () => {
  let pinia: TestingPinia

  beforeEach(() => {
    // Initialize Pinia for testing in each test
    pinia = createTestingPinia({
      stubActions: false, // We want actions to work if necessary
      initialState: {
        player: {
          inventory: []
        }
      }
    })
  })

  it('should be hidden when inventory is empty', () => {
    const wrapper = mount(InventoryPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          InventoryItemIcon: true 
        }
      }
    })

    // With the new v-if, if there are no items the component renders nothing
    expect(wrapper.find('.inventory-horizontal-bar').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('should render the list of items when there are objects', async () => {
    const playerStore = usePlayerStore()
    // Simulate that the player has two items
    playerStore.inventory = ['bread', 'gold_key']

    const wrapper = mount(InventoryPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          // Stubbing the child to count how many times it is instantiated
          InventoryItemIcon: { template: '<div class="mock-item"></div>' }
        }
      }
    })

    // Should show the horizontal bar
    expect(wrapper.find('.inventory-horizontal-bar').exists()).toBe(true)
    
    // Should be 2 mocked item components
    const items = wrapper.findAll('.mock-item')
    expect(items.length).toBe(2)
  })

  it('should react to changes in the Pinia store', async () => {
    const playerStore = usePlayerStore()
    const wrapper = mount(InventoryPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          InventoryItemIcon: { template: '<div class="mock-item"></div>' }
        }
      }
    })

    // Hidden at start (no items)
    expect(wrapper.find('.inventory-horizontal-bar').exists()).toBe(false)

    // Add an item to the store reactively
    playerStore.inventory.push('potion')
    
    // Wait for the next Vue tick to see the DOM change
    await wrapper.vm.$nextTick()

    // The bar should now appear with one item
    expect(wrapper.find('.inventory-horizontal-bar').exists()).toBe(true)
    expect(wrapper.findAll('.mock-item').length).toBe(1)
  })
})
