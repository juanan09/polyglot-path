export interface NPC {
  id: string
  name: string
  avatar: string
  personality: string
  language_level: string
  initial_phrases: string[]
  dialogue_ids: string[]
}

export interface Location {
  id: string
  name: string
  type: string
  background: string
  npcs: string[]
  connections: string[]
}

export interface Item {
  id: string
  name: string
  icon: string
  type: string
  description: string
}

export interface MissionObjective {
  type: string
  target: string
  intent?: string
}

export interface MissionReward {
  xp: number
  items: string[]
  unlocks_mission?: string
}

export interface Mission {
  id: string
  name: string
  description: string
  npc_giver: string
  objectives: MissionObjective[]
  reward: MissionReward
  level_required: string
  is_starter?: boolean
}

export interface Dialogue {
  id: string
  npc_id: string
  intent: string
  examples: string[]
  responses: string[]
  mission_trigger?: string
  language_focus: string[]
}
