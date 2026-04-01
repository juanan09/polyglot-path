import { loadMissions } from '../../../utils/loadGameData'
import type { Mission } from '../../../../types/game'

/**
 * GET /api/game/mission/:id
 * Retrieves a specific mission by its ID.
 */
export default defineEventHandler(async (event) => {
  const missionId = getRouterParam(event, 'id')

  if (!missionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mission ID is required'
    })
  }

  const missions = await loadMissions()
  const mission = missions.find((m: Mission) => m.id === missionId)

  if (!mission) {
    throw createError({
      statusCode: 404,
      statusMessage: `Mission with ID ${missionId} not found`
    })
  }

  return {
    success: true,
    data: mission
  }
})
