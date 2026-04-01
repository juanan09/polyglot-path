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
  // Reactive state
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
  const completedMissions = ref<{ missionId: string; storyId: string }[]>([])
  const completedStories = ref<string[]>([])

  // Telemetry (Phase 11)
  const grammarScore = ref(0)
  const vocabularyLearned = ref(0)
  const dialogueFrequency = ref(0)

  // State for completed mission modal
  const showMissionModal = ref(false)
  const showStoryCompletedModal = ref(false)
  const stagedReward = ref<{ xp: number; items: string[]; unlocks_mission?: string; message?: string; nextNpcId?: string; nextLocationId?: string; is_final_mission?: boolean } | null>(null)

  // ─── Persistence helpers (authenticated users only) ─────────────

  /**
   * Loads the full player state from the database.
   * Only works if the user is authenticated.
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
          completedMissions: { missionId: string; storyId: string }[]
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

        // Load Telemetry
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
      // If it fails (not authenticated, network error), do nothing
      return false
    }
  }

  /**
   * Saves the current player state to the database.
   * Called after completing a mission, changing location, or auto-save.
   */
  async function saveToServer(completedMission?: string, isFinalMission: boolean = false): Promise<void> {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return
    
    try {
      await $fetch('/api/player/save-progress', {
        method: 'POST',
        body: {
          level: level.value,
          xp: xp.value,
          currentLocation: currentLocationId.value,
          activeMission: activeMissionId.value,
          currentStoryId: currentStoryId.value,
          currentStoryName: currentStoryName.value,
          currentNpcId: currentNpcId.value,
          inventory: inventory.value,
          completedMission,
          completedMissions: completedMissions.value,
          completedStories: completedStories.value,
          storyId: currentStoryId.value,
          isFinalMission,
          // Telemetry
          grammarScore: grammarScore.value,
          vocabularyLearned: vocabularyLearned.value,
          dialogueFrequency: dialogueFrequency.value,
        }
      })
    } catch {
      // Silence persistence errors (game keeps running in memory)
      console.warn('[Persistence] Failed to save progress to server')
    }
  }

  /**
   * Notifies the server of a location change.
   */
  async function saveLocationToServer(): Promise<void> {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return

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

  // ─── Actions (Business logic) ──────────────────────────────────

  /**
   * Changes the player's current location
   */
  function updateLocation(locationId: string) {
    currentLocationId.value = locationId
  }

  /**
   * Adds experience and handles level-up (basic logic)
   */
  function addXp(amount: number) {
    xp.value += amount
    // Basic level logic (levels up every 100 XP)
    if (xp.value >= 100) {
      level.value += Math.floor(xp.value / 100)
      xp.value = xp.value % 100
    }
  }

  /**
   * Adds an item to the inventory if it doesn't exist (or increments it, depending on future logic)
   */
  function addToInventory(itemId: string) {
    if (!inventory.value.includes(itemId)) {
      inventory.value.push(itemId)
    }
  }

  /**
   * Saves the selected story before navigating to the briefing
   */
  function selectStory(story: PendingStory) {
    pendingStory.value = story
  }

  /**
   * Marks a story as completed in the player's history
   */
  function markStoryAsCompleted(storyId: string) {
    if (!completedStories.value.includes(storyId)) {
      completedStories.value.push(storyId)

      // If authenticated, it's already saved when sending completedMission in acceptMissionReward
      // but this ensures local state is immediately consistent
    }
  }

  /**
   * Clears the pending story (when returning to menu or starting game)
   */
  function clearPendingStory() {
    pendingStory.value = null
  }

  /**
   * Starts the game from the briefing with the pending story.
   * Takes the player to the starting location and NPC configured in the JSON.
   */
  async function startGame(missionId: string, npcId: string, locationId: string, storyName: string, storyId: string) {
    activeMissionId.value = missionId
    currentNpcId.value = npcId
    currentLocationId.value = locationId
    currentStoryId.value = storyId
    currentStoryName.value = storyName
    pendingStory.value = null

    // If the user is authenticated, persist this game start immediately
    const auth = useAuthStore()
    if (auth.isAuthenticated) {
      await saveToServer()
    }
  }

  /**
   * Sets the active mission
   */
  function startMission(missionId: string) {
    activeMissionId.value = missionId
  }

  /**
   * Completes the current mission, shows the modal
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
   * Locally applies rewards to the player's account (XP, Inventory)
   */
  function applyStagedReward() {
    if (!stagedReward.value) return
    addXp(stagedReward.value.xp)
    const items = stagedReward.value.items || []
    items.forEach(item => addToInventory(item))
  }

  /**
   * Decides the next story step based on reward and user choice
   */
  function handleMissionProgression(continueToNext: boolean) {
    if (!stagedReward.value) {
      activeMissionId.value = null
      return
    }

    // The final mission always shows the completed story modal,
    // regardless of whether the user clicked "Finish Story" or "Close"
    if (stagedReward.value.is_final_mission) {
      showStoryCompletedModal.value = true
      activeMissionId.value = null

      // Mark story as completed locally (now using storyId)
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
   * The player accepts the reward and (optionally) continues
   */
  function acceptMissionReward(continueToNext: boolean) {
    // Capture the completed mission before it's lost
    const completedMissionId = activeMissionId.value

    try {
      applyStagedReward()
      handleMissionProgression(continueToNext)

      // Register mission as completed locally (with its storyId)
      if (completedMissionId && currentStoryId.value) {
        const exists = completedMissions.value.some(m => m.missionId === completedMissionId)
        if (!exists) {
            completedMissions.value.push({
                missionId: completedMissionId,
                storyId: currentStoryId.value
            })
        }
      }
    } catch (e) {
      console.error("Error accepting reward:", e)
    } finally {
      showMissionModal.value = false
      // We don't reset stagedReward immediately if we show StoryCompletedModal, 
      // so that modal can display recently earned items, etc.
      if (!showStoryCompletedModal.value) {
        stagedReward.value = null
      }
    }

    // Persist to server (fire-and-forget, only for authenticated users)
    const isFinal = stagedReward.value?.is_final_mission || false
    saveToServer(completedMissionId || undefined, isFinal)
  }

  /**
   * Resets player state to default (guest)
   */
  function resetState() {
    name.value = 'Viajero'
    level.value = 1
    xp.value = 0
    currentLocationId.value = null
    currentStoryId.value = null
    currentStoryName.value = null
    currentNpcId.value = null
    inventory.value = []
    activeMissionId.value = null
    pendingStory.value = null
    completedMissions.value = []
    completedStories.value = []
    grammarScore.value = 0
    vocabularyLearned.value = 0
    dialogueFrequency.value = 0
    showMissionModal.value = false
    showStoryCompletedModal.value = false
    stagedReward.value = null
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
    resetState,
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
