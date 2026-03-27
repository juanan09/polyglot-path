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

  it('debe mostrar "Empty" cuando el inventario está vacío', () => {
    const wrapper = mount(InventoryPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          // Stub de componentes hijo para evitar errores de carga de datos profundos
          InventoryItemIcon: true 
        }
      }
    })

    expect(wrapper.text()).toContain('Empty')
    expect(wrapper.find('.inventory-sidebar').exists()).toBe(true)
  })

  it('debe renderizar la lista de items y no mostrar "Empty" cuando hay objetos', async () => {
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

    // No debe aparecer el texto "Empty"
    expect(wrapper.text()).not.toContain('Empty')
    
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

    // Al inicio está vacío
    expect(wrapper.text()).toContain('Empty')

    // Añadimos un item al store reactivamente
    playerStore.inventory.push('potion')
    
    // Esperamos al siguiente tick de Vue para ver el cambio en el DOM
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Empty')
    expect(wrapper.findAll('.mock-item').length).toBe(1)
  })
})
