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
 * Verifica si el intent actual y target cumplen el objetivo de la misión activa.
 * Si la misión se completa y desbloquea otra, resuelve dinámicamente el NPC y
 * la localización de la siguiente misión leyendo los datos de game-data.
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

  if (!isCompleted) return { completed: false }

  const result: MissionProgressResult = {
    completed: true,
    reward: mission.reward,
    is_final_mission: mission.is_final_mission,
    message: `Mission Completed: ${mission.name}`,
    nextMissionId: mission.reward.unlocks_mission
  }

  // Si la misión desbloquea otra, resolvemos dinámicamente el NPC y la localización
  if (mission.reward.unlocks_mission) {
    const nextMission = missions.find(m => m.id === mission.reward.unlocks_mission)
    if (nextMission) {
      const nextNpcId = nextMission.npc_giver
      result.nextNpcId = nextNpcId

      // Buscamos en todas las localizaciones cuál contiene ese NPC
      const locations = await loadLocations()
      const nextLocation = locations.find(loc => loc.npcs.includes(nextNpcId))
      if (nextLocation) {
        result.nextLocationId = nextLocation.id
      }
    }
  }

  return result
}
