import { loadLocations } from '../../utils/loadGameData'

/**
 * GET /api/location
 * Retrieves all locations.
 */
export default defineEventHandler(async () => {
  return await loadLocations()
})
