import { loadHistories, loadMissions, loadLocations, loadNPCs } from '../../utils/loadGameData'
import type { Story } from '../../../types/game'

/**
 * GET /api/game/stories
 * Returns all stories from game-data/history/, enriched with the
 * first mission's starting NPC and location resolved from the JSON data.
 */
export default defineEventHandler(async () => {
  const [stories, missions, locations, npcs] = await Promise.all([
    loadHistories(),
    loadMissions(),
    loadLocations(),
    loadNPCs()
  ])

  const enriched = stories.map((story: Story) => {
    const firstMission = missions.find(m => m.id === story.first_mission)
    const npcId = firstMission?.npc_giver ?? null
    const npc = npcId ? npcs.find(n => n.id === npcId) : null
    const location = npcId ? locations.find(loc => loc.npcs.includes(npcId)) : null

    return {
      id: story.id,
      name: story.name,
      description: story.description,
      image: story.image,
      language: story.language,
      level: story.level,
      tags: story.tags,
      estimated_minutes: story.estimated_minutes,
      first_mission: story.first_mission,
      // Resolved routing data for startGame()
      startNpcId: npcId,
      startNpcName: npc?.name ?? null,
      startLocationId: location?.id ?? null,
      startLocationName: location?.name ?? null
    }
  })

  return { success: true, data: enriched }
})
