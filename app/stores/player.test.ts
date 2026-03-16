import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from './player'

describe('Player Store', () => {
  beforeEach(() => {
    // Crea una nueva instancia de Pinia para cada test
    setActivePinia(createPinia())
  })

  it('debe tener el estado inicial correcto según los requisitos del TFM', () => {
    const player = usePlayerStore()
    
    expect(player.name).toBe('Viajero')
    expect(player.level).toBe(1)
    expect(player.xp).toBe(0)
    expect(player.currentLocationId).toBe('village_square')
    expect(player.inventory).toEqual([])
    expect(player.activeMissionId).toBe('find_bakery')
  })

  it('debe actualizar la localización correctamente', () => {
    const player = usePlayerStore()
    
    player.updateLocation('market')
    expect(player.currentLocationId).toBe('market')
  })

  it('debe añadir experiencia y gestionar la subida de nivel básica', () => {
    const player = usePlayerStore()
    
    player.addXp(50)
    expect(player.xp).toBe(50)
    expect(player.level).toBe(1)

    // Subida de nivel al llegar a 100
    player.addXp(60)
    expect(player.level).toBe(2)
    expect(player.xp).toBe(10) // 110 total -> Level 2, 10 XP restantes
  })

  it('debe gestionar el inventario sin duplicar ítems', () => {
    const player = usePlayerStore()
    
    player.addToInventory('bread')
    expect(player.inventory).toContain('bread')
    expect(player.inventory.length).toBe(1)

    // Intentar añadir el mismo item
    player.addToInventory('bread')
    expect(player.inventory.length).toBe(1) // No debe duplicarse
  })

  it('debe activar misiones nuevas', () => {
    const player = usePlayerStore()
    
    player.startMission('repair_cart')
    expect(player.activeMissionId).toBe('repair_cart')
  })
})
