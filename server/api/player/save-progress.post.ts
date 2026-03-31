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
 * Guarda el progreso completo del jugador en la base de datos.
 * Solo para usuarios autenticados.
 */
export default defineEventHandler(async (event) => {
  // Verificar sesión
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

  // Guardar progreso general
  await savePlayerProgress(userId, {
    level,
    xp,
    currentLocation,
    activeMission,
    currentStoryId,
    currentStoryName,
    currentNpcId,
  })

  // Guardar historia como completada (SI es la misión final)
  if (isFinalMission && storyId) {
    await markStoryAsCompleted(userId, storyId)
  }

  // Guardar bloque de historias completadas (sincronización tras registro)
  if (completedStories && Array.isArray(completedStories) && completedStories.length > 0) {
    await saveBulkCompletedStories(userId, completedStories)
  }

  // Guardar misión individual (el flujo normal)
  if (completedMission) {
    await saveCompletedMission(userId, completedMission, storyId)
  }

  // Guardar bloque de misiones (el flujo de sincronización inicial tras registro)
  if (completedMissions && Array.isArray(completedMissions) && completedMissions.length > 0) {
    await saveBulkMissions(userId, completedMissions)
  }

  // Guardar inventario
  if (inventory && Array.isArray(inventory) && inventory.length > 0) {
    await saveInventoryItems(userId, inventory)
  }

  return { success: true }
})
