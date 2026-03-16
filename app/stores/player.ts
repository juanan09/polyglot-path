import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // Estado reactivo
  const name = ref('Viajero')
  const level = ref(1)
  const xp = ref(0)
  const currentLocationId = ref('village_square')
  const inventory = ref<string[]>([])
  const activeMissionId = ref<string | null>('find_bakery')

  // Acciones (Lógica de negocio)
  
  /**
   * Cambia la ubicación actual del jugador
   */
  function updateLocation(locationId: string) {
    currentLocationId.value = locationId
  }

  /**
   * Añade experiencia y gestiona la subida de nivel (lógica básica)
   */
  function addXp(amount: number) {
    xp.value += amount
    // Lógica básica de nivel (cada 100 XP sube uno)
    if (xp.value >= 100) {
      level.value += Math.floor(xp.value / 100)
      xp.value = xp.value % 100
    }
  }

  /**
   * Añade un objeto al inventario si no existe (o incrementa, según lógica futura)
   */
  function addToInventory(itemId: string) {
    if (!inventory.value.includes(itemId)) {
      inventory.value.push(itemId)
    }
  }

  /**
   * Establece la misión activa
   */
  function startMission(missionId: string) {
    activeMissionId.value = missionId
  }

  return {
    // State
    name,
    level,
    xp,
    currentLocationId,
    inventory,
    activeMissionId,
    
    // Actions
    updateLocation,
    addXp,
    addToInventory,
    startMission
  }
})
