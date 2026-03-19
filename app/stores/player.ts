import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // Estado reactivo
  const name = ref('Viajero')
  const level = ref(1)
  const xp = ref(0)
  const currentLocationId = ref('village_square')
  const currentNpcId = ref('guard')
  const inventory = ref<string[]>([])
  const activeMissionId = ref<string | null>('find_bakery')
  
  // Estado para el modal de misión completada
  const showMissionModal = ref(false)
  const stagedReward = ref<{ xp: number; items: string[]; unlocks_mission?: string; message?: string } | null>(null)

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

  /**
   * Completa la misión actual, muestra el modal
   */
  function completeMission(reward?: { xp: number; items: string[]; unlocks_mission?: string }, message?: string) {
    if (reward) {
      stagedReward.value = { 
        xp: reward.xp || 0,
        items: reward.items || [],
        unlocks_mission: reward.unlocks_mission,
        message
      }
      showMissionModal.value = true
    } else {
      activeMissionId.value = null
    }
  }

  /**
   * El jugador acepta la recompensa y (opcionalmente) continúa
   */
  function acceptMissionReward(continueToNext: boolean) {
    try {
      if (stagedReward.value) {
        addXp(stagedReward.value.xp)
        const items = stagedReward.value.items || []
        items.forEach(item => addToInventory(item))
        
        if (continueToNext && stagedReward.value.unlocks_mission) {
          startMission(stagedReward.value.unlocks_mission)
        } else {
          activeMissionId.value = null
        }
      }
    } catch (e) {
      console.error("Error accepting reward:", e)
    } finally {
      showMissionModal.value = false
      stagedReward.value = null
    }
  }

  return {
    // State
    name,
    level,
    xp,
    currentLocationId,
    currentNpcId,
    inventory,
    activeMissionId,
    showMissionModal,
    stagedReward,
    
    // Actions
    updateLocation,
    addXp,
    addToInventory,
    startMission,
    completeMission,
    acceptMissionReward
  }
})
