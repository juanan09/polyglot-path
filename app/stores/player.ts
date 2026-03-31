import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

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
  const currentStoryId = ref<string | null>(null)
  const currentStoryName = ref<string | null>(null)
  const currentNpcId = ref<string | null>(null)
  const inventory = ref<string[]>([])
  const activeMissionId = ref<string | null>(null)
  const pendingStory = ref<PendingStory | null>(null)
  const completedMissions = ref<string[]>([])
  const completedStories = ref<string[]>([])

  // Telemetría (Fase 11)
  const grammarScore = ref(0)
  const vocabularyLearned = ref(0)
  const dialogueFrequency = ref(0)

  // Estado para el modal de misión completada
  const showMissionModal = ref(false)
  const showStoryCompletedModal = ref(false)
  const stagedReward = ref<{ xp: number; items: string[]; unlocks_mission?: string; message?: string; nextNpcId?: string; nextLocationId?: string; is_final_mission?: boolean } | null>(null)

  // ─── Persistence helpers (solo usuarios autenticados) ─────────────

  /**
   * Carga el estado completo del jugador desde la base de datos.
   * Solo funciona si el usuario está autenticado.
   */
  async function loadFromServer(): Promise<boolean> {
    try {
      const response = await $fetch<{
        success: boolean; data: {
          progress: {
            level: number;
            xp: number;
            currentLocation: string | null;
            activeMission: string | null;
            currentStoryId: string | null;
            currentStoryName: string | null;
            currentNpcId: string | null;
            grammarScore: number;
            vocabularyLearned: number;
            dialogueFrequency: number;
          } | null
          inventory: string[]
          completedMissions: string[]
          completedStories: string[]
        }
      }>('/api/player/load-progress')

      if (response.success && response.data.progress) {
        const p = response.data.progress
        level.value = p.level
        xp.value = p.xp
        currentLocationId.value = p.currentLocation
        activeMissionId.value = p.activeMission
        currentStoryId.value = p.currentStoryId
        currentStoryName.value = p.currentStoryName
        currentNpcId.value = p.currentNpcId

        // Cargar Telemetría
        grammarScore.value = p.grammarScore || 0
        vocabularyLearned.value = p.vocabularyLearned || 0
        dialogueFrequency.value = p.dialogueFrequency || 0

        inventory.value = response.data.inventory
        completedMissions.value = response.data.completedMissions
        completedStories.value = response.data.completedStories || []
        return true
      }
      return false
    } catch {
      // Si falla (no autenticado, error de red), no hacemos nada
      return false
    }
  }

  /**
   * Guarda el estado actual del jugador en la base de datos.
   * Se llama tras completar una misión, cambiar de localización o en auto-save.
   */
  async function saveToServer(completedMission?: string): Promise<void> {
    try {
      await $fetch('/api/player/save-progress', {
        method: 'POST',
        body: {
          level: level.value,
          xp: xp.value,
          currentLocation: currentLocationId.value,
          activeMission: activeMissionId.value,
          currentStoryName: currentStoryName.value,
          currentNpcId: currentNpcId.value,
          inventory: inventory.value,
          completedMission,
          storyId: currentStoryId.value,
          // Telemetría
          grammarScore: grammarScore.value,
          vocabularyLearned: vocabularyLearned.value,
          dialogueFrequency: dialogueFrequency.value,
        }
      })
    } catch {
      // Silenciar errores de persistencia (el juego sigue funcionando en memoria)
      console.warn('[Persistence] Failed to save progress to server')
    }
  }

  /**
   * Notifica al servidor del cambio de localización.
   */
  async function saveLocationToServer(): Promise<void> {
    try {
      await $fetch('/api/player/update-location', {
        method: 'POST',
        body: {
          currentLocation: currentLocationId.value,
          currentNpcId: currentNpcId.value,
        }
      })
    } catch {
      console.warn('[Persistence] Failed to save location to server')
    }
  }

  // ─── Acciones (Lógica de negocio) ──────────────────────────────────

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
   * Marca una historia como completada en el historial del jugador
   */
  function markStoryAsCompleted(storyId: string) {
    if (!completedStories.value.includes(storyId)) {
      completedStories.value.push(storyId)

      // Si está autenticado, el ya se guarda al enviar completedMission en acceptMissionReward
      // pero esto asegura que el estado local sea íntegro de inmediato
    }
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
  async function startGame(missionId: string, npcId: string, locationId: string, storyName: string, storyId: string) {
    activeMissionId.value = missionId
    currentNpcId.value = npcId
    currentLocationId.value = locationId
    currentStoryId.value = storyId
    currentStoryName.value = storyName
    pendingStory.value = null

    // Si el usuario está autenticado, persistimos este inicio de juego de inmediato
    const auth = useAuthStore()
    if (auth.isAuthenticated) {
      await saveToServer()
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

      // Marcar historia como completada localmente (ahora usamos storyId)
      if (currentStoryId.value) {
        markStoryAsCompleted(currentStoryId.value)
      }
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
    // Capturar la misión completada antes de que se pierda
    const completedMissionId = activeMissionId.value

    try {
      applyStagedReward()
      handleMissionProgression(continueToNext)

      // Registrar misión como completada localmente
      if (completedMissionId && !completedMissions.value.includes(completedMissionId)) {
        completedMissions.value.push(completedMissionId)
      }
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

    // Persistir en servidor (fire-and-forget, solo para autenticados)
    saveToServer(completedMissionId || undefined)
  }

  return {
    // State
    name,
    level,
    xp,
    currentLocationId,
    currentStoryId,
    currentStoryName,
    currentNpcId,
    inventory,
    activeMissionId,
    pendingStory,
    completedMissions,
    completedStories,
    showMissionModal,
    showStoryCompletedModal,
    stagedReward,

    // Actions
    selectStory,
    markStoryAsCompleted,
    clearPendingStory,
    startGame,
    updateLocation,
    addXp,
    addToInventory,
    startMission,
    completeMission,
    acceptMissionReward,

    // Persistence
    loadFromServer,
    saveToServer,
    saveLocationToServer,
  }
})
