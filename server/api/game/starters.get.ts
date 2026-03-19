import { loadMissions, loadLocations, loadNPCs } from '../../utils/loadGameData'

/**
 * GET /api/game/starters
 * Returns all missions marked as is_starter: true,
 * enriched with the NPC and location data needed to bootstrap the game.
 */
export default defineEventHandler(async () => {
  const [missions, locations, npcs] = await Promise.all([
    loadMissions(),
    loadLocations(),
    loadNPCs()
  ])

  const starters = missions
    .filter(m => m.is_starter === true)
    .map(mission => {
      const npc = npcs.find(n => n.id === mission.npc_giver)
      const location = locations.find(loc => loc.npcs.includes(mission.npc_giver))

      return {
        missionId: mission.id,
        name: mission.name,
        description: mission.description,
        levelRequired: mission.level_required,
        npcId: mission.npc_giver,
        npcName: npc?.name ?? mission.npc_giver,
        locationId: location?.id ?? 'village_square',
        locationName: location?.name ?? 'Village Square'
      }
    })

  return { success: true, data: starters }
})
