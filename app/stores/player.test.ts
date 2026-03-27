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
    // Location and mission are null until the player selects a story from the index page
    expect(player.currentLocationId).toBeNull()
    expect(player.activeMissionId).toBeNull()
    expect(player.inventory).toEqual([])
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

  // --- Tests de Gestión de Recompensas e Inventario (Fase 9) ---

  it('debe hacer stage de la recompensa y mostrar el modal correspondiente al completar una misión', () => {
    const player = usePlayerStore()
    
    player.completeMission(
      { xp: 100, items: ['gold_key'], unlocks_mission: 'mission_2' },
      'Enhorabuena!',
      'npc_2',
      'loc_2'
    )

    expect(player.stagedReward).toBeDefined()
    expect(player.stagedReward?.xp).toBe(100)
    expect(player.stagedReward?.items).toContain('gold_key')
    expect(player.showMissionModal).toBe(true)
  })

  it('debe aplicar la recompensa al inventario/XP al aceptar y avanzar a la siguiente misión', () => {
    const player = usePlayerStore()
    
    // Setup inicial para asegurar estado limpio
    player.xp = 0
    player.inventory = []
    
    player.completeMission(
      { xp: 50, items: ['bread'], unlocks_mission: 'mission_2' },
      'Good',
      'npc_2',
      'loc_2'
    )

    // Simulamos que el usuario da click a "Continuar" en el modal de misión completada
    player.acceptMissionReward(true)

    // Verificamos que se han aplicado los cambios localmente
    expect(player.xp).toBe(50)
    expect(player.inventory).toContain('bread')
    expect(player.showMissionModal).toBe(false)
    
    // Verificamos que se navega a la siguiente misión/ubicación
    expect(player.activeMissionId).toBe('mission_2')
    expect(player.currentNpcId).toBe('npc_2')
    expect(player.currentLocationId).toBe('loc_2')
    expect(player.stagedReward).toBeNull()
  })

  it('debe mostrar el popup de fin de historia cuando is_final_mission es true', () => {
    const player = usePlayerStore()
    
    player.completeMission(
      { xp: 200, items: ['medal'], is_final_mission: true },
      'Misión Final!'
    )

    player.acceptMissionReward(true) // Da igual true o false para la última misión, debe mostrar el modal

    expect(player.showStoryCompletedModal).toBe(true)
    expect(player.showMissionModal).toBe(false)
    // La misión activa debe limpiarse si es la última
    expect(player.activeMissionId).toBeNull() 
    // stagedReward se mantiene un poco más para que el popup final lo pueda leer
    expect(player.stagedReward).not.toBeNull() 
  })
})
