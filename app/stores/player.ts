import { defineStore } from 'pinia'
import { ref } from 'vue'

interface PendingStory {
  id: string
  name: string
  first_mission: string
  startNpcId: string
  startLocationId: string
}

export const usePlayerStore = defineStore('player', () => {
  // Estado reactivo
  const name = ref('Viajero')
  const level = ref(1)
  const xp = ref(0)
  const currentLocationId = ref<string | null>(null)
  const currentStoryName = ref<string | null>(null)
  const currentNpcId = ref<string | null>(null)
  const inventory = ref<string[]>([])
  const activeMissionId = ref<string | null>(null)
  const pendingStory = ref<PendingStory | null>(null)
  
  // Estado para el modal de misión completada
  const showMissionModal = ref(false)
  const showStoryCompletedModal = ref(false)
  const stagedReward = ref<{ xp: number; items: string[]; unlocks_mission?: string; message?: string; nextNpcId?: string; nextLocationId?: string; is_final_mission?: boolean } | null>(null)

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
   * Guarda la historia seleccionada antes de navegar al briefing
   */
  function selectStory(story: PendingStory) {
    pendingStory.value = story
  }

  /**
   * Limpia la historia pendiente (al volver al menú o al iniciar el juego)
   */
  function clearPendingStory() {
    pendingStory.value = null
  }

  /**
   * Inicia el juego desde el briefing con la historia pendiente.
   * Lleva al jugador a la localización y NPC de inicio configurados en el JSON.
   */
  function startGame(missionId: string, npcId: string, locationId: string, storyName: string) {
    activeMissionId.value = missionId
    currentNpcId.value = npcId
    currentLocationId.value = locationId
    currentStoryName.value = storyName
    pendingStory.value = null
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
    reward?: { xp: number; items: string[]; unlocks_mission?: string; is_final_mission?: boolean },
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
        nextLocationId,
        is_final_mission: reward.is_final_mission
      }
      showMissionModal.value = true
    } else {
      activeMissionId.value = null
    }
  }

  /**
   * Applica localmente las recompensas a la cuenta del jugador (XP, Inventario)
   */
  function applyStagedReward() {
    if (!stagedReward.value) return
    addXp(stagedReward.value.xp)
    const items = stagedReward.value.items || []
    items.forEach(item => addToInventory(item))
  }

  /**
   * Decide el siguiente paso en la historia según la recompensa y elección del usuario
   */
  function handleMissionProgression(continueToNext: boolean) {
    if (!stagedReward.value) {
      activeMissionId.value = null
      return
    }

    // La misión final siempre muestra el modal de historia completada,
    // independientemente de si el usuario ha pulsado "Finish Story" o "Close"
    if (stagedReward.value.is_final_mission) {
      showStoryCompletedModal.value = true
      activeMissionId.value = null
      return
    }

    if (!continueToNext) {
      activeMissionId.value = null
      return
    }

    if (stagedReward.value.unlocks_mission) {
      startMission(stagedReward.value.unlocks_mission)
      // Navigate to the next NPC and location resolved on the server
      if (stagedReward.value.nextNpcId) currentNpcId.value = stagedReward.value.nextNpcId
      if (stagedReward.value.nextLocationId) currentLocationId.value = stagedReward.value.nextLocationId
      return
    }

    activeMissionId.value = null
  }

  /**
   * El jugador acepta la recompensa y (opcionalmente) continúa
   */
  function acceptMissionReward(continueToNext: boolean) {
    try {
      applyStagedReward()
      handleMissionProgression(continueToNext)
    } catch (e) {
      console.error("Error accepting reward:", e)
    } finally {
      showMissionModal.value = false
      // No reseteamos stagedReward de inmediato si mostramos StoryCompletedModal, 
      // para que ese modal pueda mostrar los últimos items ganados etc.
      if (!showStoryCompletedModal.value) {
        stagedReward.value = null
      }
    }
  }

  return {
    // State
    name,
    level,
    xp,
    currentLocationId,
    currentStoryName,
    currentNpcId,
    inventory,
    activeMissionId,
    pendingStory,
    showMissionModal,
    showStoryCompletedModal,
    stagedReward,
    
    // Actions
    selectStory,
    clearPendingStory,
    startGame,
    updateLocation,
    addXp,
    addToInventory,
    startMission,
    completeMission,
    acceptMissionReward
  }
})
