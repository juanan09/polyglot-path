import { loadMissions, loadLocations } from './loadGameData'
import type { MissionReward } from '../../types/game'

export interface MissionProgressResult {
  completed: boolean
  reward?: MissionReward
  is_final_mission?: boolean
  message?: string
  nextMissionId?: string
  nextNpcId?: string
  nextLocationId?: string
}

/**
 * Checks if the current intent and target fulfill the active mission objective.
 * If the mission is completed and unlocks another, dynamically resolves the NPC and
 * the location of the next mission reading from game-data.
 */
export async function checkMissionProgress(
  activeMissionId: string | null | undefined,
  context: { intent: string; targetNpcId: string }
): Promise<MissionProgressResult> {
  if (!activeMissionId) return { completed: false }

  const missions = await loadMissions()
  const mission = missions.find(m => m.id === activeMissionId)
  
  if (!mission) return { completed: false }

  // Validate if any dialogue-type objective is met with the intent and target
  const isCompleted = mission.objectives.some(obj => {
    return obj.type === 'dialogue' && 
           obj.target === context.targetNpcId && 
           obj.intent === context.intent
  })

  if (!isCompleted) return { completed: false }

  const result: MissionProgressResult = {
    completed: true,
    reward: mission.reward,
    is_final_mission: mission.is_final_mission,
    message: `Mission Completed: ${mission.name}`,
    nextMissionId: mission.reward.unlocks_mission
  }

  // If the mission unlocks another one, dynamically resolve the NPC and location
  if (mission.reward.unlocks_mission) {
    const nextMission = missions.find(m => m.id === mission.reward.unlocks_mission)
    if (nextMission) {
      const nextNpcId = nextMission.npc_giver
      result.nextNpcId = nextNpcId

      // Find which location currently contains that NPC
      const locations = await loadLocations()
      const nextLocation = locations.find(loc => loc.npcs.includes(nextNpcId))
      if (nextLocation) {
        result.nextLocationId = nextLocation.id
      }
    }
  }

  return result
}
