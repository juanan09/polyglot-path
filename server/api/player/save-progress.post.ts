import { defineEventHandler, readBody, createError } from 'h3'
import { 
  savePlayerProgress, 
  saveCompletedMission, 
  saveBulkMissions, 
  saveInventoryItems,
  markStoryAsCompleted,
  saveBulkCompletedStories 
} from '../../utils/persistenceService'
import { getSessionConfig } from '../../utils/sessionConfig'

/**
 * POST /api/player/save-progress
 * Saves the player's full progress in the database.
 * Only for authenticated users.
 */
export default defineEventHandler(async (event) => {
  // Verify session
  const session = await useSession(event, getSessionConfig())
  const userId = session.data?.userId as string | undefined

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const body = await readBody(event)
  const { 
    level, xp, currentLocation, activeMission, currentStoryId, currentStoryName, currentNpcId, 
    inventory, completedMission, completedMissions, completedStories, storyId, isFinalMission 
  } = body

  // Save general progress
  await savePlayerProgress(userId, {
    level,
    xp,
    currentLocation,
    activeMission,
    currentStoryId,
    currentStoryName,
    currentNpcId,
  })

  // Save story as completed (IF it is the final mission)
  if (isFinalMission && storyId) {
    await markStoryAsCompleted(userId, storyId)
  }

  // Save bulk completed stories (synchronization after registration)
  if (completedStories && Array.isArray(completedStories) && completedStories.length > 0) {
    await saveBulkCompletedStories(userId, completedStories)
  }

  // Save individual mission (normal flow)
  if (completedMission) {
    await saveCompletedMission(userId, completedMission, storyId)
  }

  // Save bulk missions (initial synchronization flow after registration)
  if (completedMissions && Array.isArray(completedMissions) && completedMissions.length > 0) {
    await saveBulkMissions(userId, completedMissions)
  }

  // Save inventory
  if (inventory && Array.isArray(inventory) && inventory.length > 0) {
    await saveInventoryItems(userId, inventory)
  }

  return { success: true }
})
