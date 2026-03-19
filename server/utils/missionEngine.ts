import { loadMissions } from './loadGameData'
import type { MissionReward } from '../../types/game'

export interface MissionProgressResult {
  completed: boolean
  reward?: MissionReward
  message?: string
  nextMissionId?: string
}

/**
 * Verifica si el intent actual y target cumplen el objetivo de la misión activa.
 */
export async function checkMissionProgress(
  activeMissionId: string | null | undefined,
  context: { intent: string; targetNpcId: string }
): Promise<MissionProgressResult> {
  if (!activeMissionId) return { completed: false }

  const missions = await loadMissions()
  const mission = missions.find(m => m.id === activeMissionId)
  
  if (!mission) return { completed: false }

  // Validamos si algún objetivo de tipo dialogue se cumple con el intent y target
  const isCompleted = mission.objectives.some(obj => {
    return obj.type === 'dialogue' && 
           obj.target === context.targetNpcId && 
           obj.intent === context.intent
  })

  if (isCompleted) {
    return {
      completed: true,
      reward: mission.reward,
      message: `Mission Completed: ${mission.name}`,
      nextMissionId: mission.reward.unlocks_mission
    }
  }

  return { completed: false }
}
