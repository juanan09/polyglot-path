import { defineEventHandler, readBody, createError } from 'h3'
import { savePlayerProgress, saveCompletedMission, saveInventoryItems } from '../../utils/persistenceService'
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
  const { level, xp, currentLocation, activeMission, currentStoryId, currentStoryName, currentNpcId, inventory, completedMission, storyId } = body

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

  // Guardar misión completada (si aplica)
  if (completedMission) {
    await saveCompletedMission(userId, completedMission, storyId)
  }

  // Guardar inventario (si aplica)
  if (inventory && Array.isArray(inventory) && inventory.length > 0) {
    await saveInventoryItems(userId, inventory)
  }

  return { success: true }
})
