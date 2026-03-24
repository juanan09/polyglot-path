import { loadHistories, loadMissions, loadNPCs } from '../../../utils/loadGameData'
import type { Mission } from '../../../../types/game'

/**
 * GET /api/game/briefing/:storyId
 * Returns everything the briefing screen needs:
 * - Story metadata
 * - Ordered mission list (auto-resolved by following unlocks_mission chain)
 * - First NPC's intro_text, name, and avatar
 */
export default defineEventHandler(async (event) => {
  const storyId = getRouterParam(event, 'storyId')

  const [stories, missions, npcs] = await Promise.all([
    loadHistories(),
    loadMissions(),
    loadNPCs()
  ])

  const story = stories.find(s => s.id === storyId)
  if (!story) {
    throw createError({ statusCode: 404, statusMessage: `Story '${storyId}' not found` })
  }

  // Walk the unlocks_mission chain to build an ordered mission list
  const missionMap = new Map<string, Mission>(missions.map(m => [m.id, m]))
  const orderedMissions: { id: string; name: string; description: string }[] = []

  let currentId: string | undefined = story.first_mission
  const visited = new Set<string>()

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId)
    const m = missionMap.get(currentId)
    if (!m) break
    orderedMissions.push({ id: m.id, name: m.name, description: m.description })
    currentId = m.reward?.unlocks_mission
  }

  // Resolve first NPC (giver of the first mission)
  const firstMission = missionMap.get(story.first_mission)
  const firstNpcId = firstMission?.npc_giver ?? null
  const firstNpc = firstNpcId ? npcs.find(n => n.id === firstNpcId) : null

  return {
    success: true,
    data: {
      story: {
        id: story.id,
        name: story.name,
        description: story.description,
        image: story.image,
        language: story.language,
        level: story.level,
        estimated_minutes: story.estimated_minutes
      },
      missions: orderedMissions,
      npc: firstNpc
        ? {
            id: firstNpc.id,
            name: firstNpc.name,
            avatar: firstNpc.avatar,
            intro_text: firstNpc.intro_text ?? null
          }
        : null
    }
  }
})
