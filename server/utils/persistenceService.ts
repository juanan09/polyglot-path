import { db } from '../db'
import { playerProgress, playerInventory, playerMissions, dialogueHistory, playerVocabulary, playerErrors, playerCompletedStories } from '../db/schema'
import { eq, and, count } from 'drizzle-orm'

/**
 * Centralized persistence service.
 * All read/write operations to PostgreSQL go through here.
 * Only invoked for authenticated (registered) users.
 */

// ─── WRITE OPERATIONS ────────────────────────────────────────────────

/**
 * Saves the vocabulary learned by the player.
 * Prevents duplicates using onConflictDoNothing on the uq_user_word index.
 */
export async function saveLearnedVocabulary(userId: string, vocabulary: { word: string, type: 'word' | 'phrase' | 'phrasal_verb' }[]) {
  if (!vocabulary.length) return

  for (const item of vocabulary) {
    try {
      await db.insert(playerVocabulary)
        .values({
          userId,
          word: item.word,
          wordType: item.type,
        })
        .onConflictDoNothing({ target: [playerVocabulary.userId, playerVocabulary.word] })
    } catch (error) {
      console.error('Error saving vocabulary term:', error)
    }
  }
}

/**
 * Saves detected grammar errors.
 */
export async function saveGrammarErrors(userId: string, errors: string[]) {
  if (!errors.length) return

  const values = errors.map(errorDescription => ({
    userId,
    errorDescription,
  }))

  try {
    await db.insert(playerErrors).values(values)
  } catch (error) {
    console.error('Error saving grammar errors:', error)
  }
}

/**
 * Saves or updates player progress (upsert by userId).
 */
export async function savePlayerProgress(userId: string, state: {
  level?: number
  xp?: number
  currentLocation?: string | null
  activeMission?: string | null
  currentStoryId?: string | null
  currentStoryName?: string | null
  currentNpcId?: string | null
  // Telemetría
  grammarScore?: number
  vocabularyLearned?: number
  dialogueFrequency?: number
}) {
  const existing = await db.select().from(playerProgress).where(eq(playerProgress.userId, userId))

  if (existing.length > 0) {
    await db.update(playerProgress)
      .set({
        ...state,
        updatedAt: new Date(),
      })
      .where(eq(playerProgress.userId, userId))
  } else {
    await db.insert(playerProgress).values({
      userId,
      ...state,
      updatedAt: new Date(),
    })
  }
}

/**
 * Registers a completed mission.
 */
export async function saveCompletedMission(userId: string, missionId: string, storyId?: string | null) {
  // Check if this mission already exists for this user
  const existing = await db.select().from(playerMissions)
    .where(and(eq(playerMissions.userId, userId), eq(playerMissions.missionId, missionId)))

  if (existing.length > 0) {
    // Update status to 'completed'
    await db.update(playerMissions)
      .set({ status: 'completed', completedAt: new Date(), storyId })
      .where(and(eq(playerMissions.userId, userId), eq(playerMissions.missionId, missionId)))
  } else {
    await db.insert(playerMissions).values({
      userId,
      missionId,
      storyId,
      status: 'completed',
      completedAt: new Date(),
    })
  }
}

/**
 * Marks a story as permanently completed.
 */
export async function markStoryAsCompleted(userId: string, storyId: string) {
  try {
    await db.insert(playerCompletedStories).values({
      userId,
      storyId,
      completedAt: new Date(),
    }).onConflictDoNothing() // Do nothing if it's already registered
  } catch (error) {
    console.error('Error marking story as completed:', error)
  }
}

/**
 * Registers multiple completed stories (for initial sync).
 */
export async function saveBulkCompletedStories(userId: string, storyIds: string[]) {
  if (!storyIds.length) return
  for (const storyId of storyIds) {
    await markStoryAsCompleted(userId, storyId)
  }
}

/**
 * Registers multiple completed missions at once (for initial sync).
 */
export async function saveBulkMissions(userId: string, missions: { missionId: string; storyId: string }[]) {
  if (!missions.length) return
  for (const mission of missions) {
    await saveCompletedMission(userId, mission.missionId, mission.storyId)
  }
}

/**
 * Saves items to the player's inventory (upsert by userId + itemId).
 */
export async function saveInventoryItems(userId: string, items: string[]) {
  for (const itemId of items) {
    const existing = await db.select().from(playerInventory)
      .where(and(eq(playerInventory.userId, userId), eq(playerInventory.itemId, itemId)))

    if (existing.length > 0) {
      await db.update(playerInventory)
        .set({ quantity: (existing[0]!.quantity || 1) + 1 })
        .where(and(eq(playerInventory.userId, userId), eq(playerInventory.itemId, itemId)))
    } else {
      await db.insert(playerInventory).values({
        userId,
        itemId,
        quantity: 1,
      })
    }
  }
}

/**
 * Saves an individual dialogue entry to the history.
 */
export async function saveDialogueEntry(
  userId: string,
  npcId: string,
  playerMessage: string,
  aiResponse: string,
  grammarScore?: number | null
) {
  await db.insert(dialogueHistory).values({
    userId,
    npcId,
    playerMessage,
    aiResponse,
    grammarScore,
  })

  // After saving the dialogue, we update the pedagogical summary in player_progress
  await updatePedagogicalSummary(userId, grammarScore || 0)
}

/**
 * Updates the player's pedagogical learning summary (Phase 11).
 * Atomically recalculates averages and counters for the TFM.
 */
export async function updatePedagogicalSummary(userId: string, newGrammarScore: number) {
  try {
    // 1. Get current progress data and actual counts
    const [progress] = await db.select().from(playerProgress).where(eq(playerProgress.userId, userId))
    const [vocabResult] = await db.select({ totalVocab: count() }).from(playerVocabulary).where(eq(playerVocabulary.userId, userId))
    const totalVocab = vocabResult?.totalVocab || 0
    
    if (!progress) return

    // 2. Calculate new moving average for grammar
    // Formula: ((CurrentAverage * CurrentFrequency) + NewScore) / (CurrentFrequency + 1)
    const currentFreq = progress.dialogueFrequency || 0
    const currentScore = progress.grammarScore || 0
    const newAvgScore = Math.round(((currentScore * currentFreq) + newGrammarScore) / (currentFreq + 1))

    // 3. Update progress table with new telemetry values
    await db.update(playerProgress)
      .set({
        grammarScore: newAvgScore,
        vocabularyLearned: totalVocab,
        dialogueFrequency: currentFreq + 1,
        updatedAt: new Date(),
      })
      .where(eq(playerProgress.userId, userId))
  } catch (error) {
    console.error('Error updating pedagogical summary:', error)
  }
}

// ─── READ OPERATIONS ─────────────────────────────────────────────────

/**
 * Loads the full player state from the database.
 * Returns progress, inventory, and completed missions.
 */
export async function loadFullPlayerState(userId: string) {
  // General progress
  const [progress] = await db.select().from(playerProgress)
    .where(eq(playerProgress.userId, userId))

  // Inventory
  const inventory = await db.select().from(playerInventory)
    .where(eq(playerInventory.userId, userId))

  // Completed missions
  const missions = await db.select().from(playerMissions)
    .where(eq(playerMissions.userId, userId))

  const completedMissions = missions
    .filter(m => m.status === 'completed')
    .map(m => ({
      missionId: m.missionId,
      storyId: m.storyId
    }))

  // Extract unique completed stories from specific table
  const completedStoriesRows = await db.select().from(playerCompletedStories)
    .where(eq(playerCompletedStories.userId, userId))

  const completedStories = completedStoriesRows.map(row => row.storyId)

  return {
    progress: progress || null,
    inventory: inventory.map(item => item.itemId),
    completedMissions: completedMissions,
    completedStories,
    allMissions: missions,
  }
}
