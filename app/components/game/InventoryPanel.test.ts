import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import InventoryPanel from './InventoryPanel.vue'
import { usePlayerStore } from '~/stores/player'

describe('InventoryPanel Component', () => {
  let pinia: TestingPinia

  beforeEach(() => {
    // Inicializamos Pinia para testing en cada prueba
    pinia = createTestingPinia({
      stubActions: false, // Queremos que las acciones funcionen si es necesario
      initialState: {
        player: {
          inventory: []
        }
      }
    })
  })

  it('debe estar oculto cuando el inventario está vacío', () => {
    const wrapper = mount(InventoryPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          InventoryItemIcon: true 
        }
      }
    })

    // Con el nuevo v-if, si no hay items el componente no renderiza nada
    expect(wrapper.find('.inventory-horizontal-bar').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('debe renderizar la lista de items cuando hay objetos', async () => {
    const playerStore = usePlayerStore()
    // Simulamos que el jugador tiene dos items
    playerStore.inventory = ['bread', 'gold_key']

    const wrapper = mount(InventoryPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          // Stubbing del hijo para contar cuántas veces se instancia
          InventoryItemIcon: { template: '<div class="mock-item"></div>' }
        }
      }
    })

    // Debe mostrar la barra horizontal
    expect(wrapper.find('.inventory-horizontal-bar').exists()).toBe(true)
    
    // Debe haber 2 componentes de ítem mockeados
    const items = wrapper.findAll('.mock-item')
    expect(items.length).toBe(2)
  })

  it('debe reaccionar a cambios en el store de Pinia', async () => {
    const playerStore = usePlayerStore()
    const wrapper = mount(InventoryPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          InventoryItemIcon: { template: '<div class="mock-item"></div>' }
        }
      }
    })

    // Al inicio está oculto (sin items)
    expect(wrapper.find('.inventory-horizontal-bar').exists()).toBe(false)

    // Añadimos un item al store reactivamente
    playerStore.inventory.push('potion')
    
    // Esperamos al siguiente tick de Vue para ver el cambio en el DOM
    await wrapper.vm.$nextTick()

    // Ahora debe aparecer la barra con un item
    expect(wrapper.find('.inventory-horizontal-bar').exists()).toBe(true)
    expect(wrapper.findAll('.mock-item').length).toBe(1)
  })
})
