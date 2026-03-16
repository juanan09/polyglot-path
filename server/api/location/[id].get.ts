import { loadLocations } from '../../utils/loadGameData'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const locations = await loadLocations()
  const location = locations.find(l => l.id === id)
  
  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Location not found'
    })
  }
  
  return location
})
