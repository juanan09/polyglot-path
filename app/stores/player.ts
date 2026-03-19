import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // Estado reactivo
  const name = ref('Viajero')
  const level = ref(1)
  const xp = ref(0)
  const currentLocationId = ref<string | null>(null)
  const currentNpcId = ref<string | null>(null)
  const inventory = ref<string[]>([])
  const activeMissionId = ref<string | null>(null)
  
  // Estado para el modal de misión completada
  const showMissionModal = ref(false)
  const stagedReward = ref<{ xp: number; items: string[]; unlocks_mission?: string; message?: string; nextNpcId?: string; nextLocationId?: string } | null>(null)

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
   * Inicia el juego desde la página de inicio con una misión de arranque.
   * Lleva al jugador a la localización y NPC de inicio configurados en el JSON.
   */
  function startGame(missionId: string, npcId: string, locationId: string) {
    activeMissionId.value = missionId
    currentNpcId.value = npcId
    currentLocationId.value = locationId
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
  function completeMission(
    reward?: { xp: number; items: string[]; unlocks_mission?: string },
    message?: string,
    nextNpcId?: string,
    nextLocationId?: string
  ) {
    if (reward) {
      stagedReward.value = { 
        xp: reward.xp || 0,
        items: reward.items || [],
        unlocks_mission: reward.unlocks_mission,
        message,
        nextNpcId,
        nextLocationId
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
          // Navigate to the next NPC and location resolved on the server
          if (stagedReward.value.nextNpcId) currentNpcId.value = stagedReward.value.nextNpcId
          if (stagedReward.value.nextLocationId) currentLocationId.value = stagedReward.value.nextLocationId
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
    startGame,
    updateLocation,
    addXp,
    addToInventory,
    startMission,
    completeMission,
    acceptMissionReward
  }
})
