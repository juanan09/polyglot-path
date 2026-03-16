import { loadLocations } from '../../utils/loadGameData'

export default defineEventHandler(async () => {
  return await loadLocations()
})
