import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkMissionProgress } from './missionEngine';
import * as loadGameDataModule from './loadGameData';
import type { Mission, Location } from '../../types/game';

// Mock data loading functions
vi.mock('./loadGameData', () => ({
  loadMissions: vi.fn(),
  loadLocations: vi.fn()
}));

const mockMissions = [
  {
    id: 'mission_1',
    name: 'First Mission',
    npc_giver: 'npc_1',
    objectives: [
      { type: 'dialogue', target: 'npc_1', intent: 'greet' }
    ],
    reward: {
      xp: 10,
      unlocks_mission: 'mission_2'
    },
    is_final_mission: false
  },
  {
    id: 'mission_2',
    name: 'Second Mission',
    npc_giver: 'npc_2',
    objectives: [
      { type: 'dialogue', target: 'npc_2', intent: 'ask_help' }
    ],
    reward: {
      xp: 50
    },
    is_final_mission: true
  }
];

const mockLocations = [
  {
    id: 'loc_1',
    npcs: ['npc_1']
  },
  {
    id: 'loc_2',
    npcs: ['npc_2', 'npc_3']
  }
];

describe('missionEngine - checkMissionProgress', () => {
  beforeEach(() => {
    vi.spyOn(loadGameDataModule, 'loadMissions').mockResolvedValue(mockMissions as unknown as Mission[]);
    vi.spyOn(loadGameDataModule, 'loadLocations').mockResolvedValue(mockLocations as unknown as Location[]);
  });

  it('should return completed: false if there is no activeMissionId', async () => {
    const result = await checkMissionProgress(null, { intent: 'greet', targetNpcId: 'npc_1' });
    expect(result.completed).toBe(false);
  });

  it('should return completed: false if the mission does not exist', async () => {
    const result = await checkMissionProgress('mission_doesnt_exist', { intent: 'greet', targetNpcId: 'npc_1' });
    expect(result.completed).toBe(false);
  });

  it('should return completed: false if intent or target do not match objectives', async () => {
    const result = await checkMissionProgress('mission_1', { intent: 'wrong_intent', targetNpcId: 'npc_1' });
    expect(result.completed).toBe(false);

    const result2 = await checkMissionProgress('mission_1', { intent: 'greet', targetNpcId: 'wrong_npc' });
    expect(result2.completed).toBe(false);
  });

  it('should complete the mission and resolve next NPC and location if unlocks_mission exists', async () => {
    const result = await checkMissionProgress('mission_1', { intent: 'greet', targetNpcId: 'npc_1' });
    
    expect(result.completed).toBe(true);
    expect(result.reward).toEqual(mockMissions[0]!.reward);
    expect(result.nextMissionId).toBe('mission_2');
    // As mission_2 has npc_giver: 'npc_2', and 'npc_2' is in 'loc_2'
    expect(result.nextNpcId).toBe('npc_2');
    expect(result.nextLocationId).toBe('loc_2');
  });

  it('should complete the final mission correctly without looking for a next mission', async () => {
    const result = await checkMissionProgress('mission_2', { intent: 'ask_help', targetNpcId: 'npc_2' });
    
    expect(result.completed).toBe(true);
    expect(result.is_final_mission).toBe(true);
    expect(result.nextMissionId).toBeUndefined();
    expect(result.nextNpcId).toBeUndefined();
    expect(result.nextLocationId).toBeUndefined();
  });
});
