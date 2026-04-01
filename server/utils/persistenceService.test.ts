import { describe, it, expect, vi, beforeEach } from 'vitest'
import { savePlayerProgress, saveCompletedMission, saveInventoryItems, saveDialogueEntry, loadFullPlayerState } from './persistenceService'
import { db } from '../db'
import { playerProgress, playerMissions, playerInventory, dialogueHistory, playerCompletedStories } from '../db/schema'

// Mocking Drizzle DB operations
vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  }
}))

// Helper to silence cast errors in Drizzle's fluid chain.
// Drizzle mocks cannot satisfy the internal types of PgSelectBuilder
// without recreating the entire implementation. Double assertion via unknown is
// the recommended TypeScript way for this mocking pattern.
 
const drizzleMock = <T>(val: T): ReturnType<typeof db.select> => val as unknown as ReturnType<typeof db.select>

// Mock Date to ensure deterministic tests
const mockDate = new Date('2026-03-27T12:00:00Z')
vi.setSystemTime(mockDate)

describe('persistenceService', () => {
  const userId = 'user_123'

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks for chained Drizzle operations
    const mockWhere = vi.fn().mockResolvedValue([])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    vi.mocked(db.select).mockReturnValue(drizzleMock({ from: mockFrom }))

    const mockSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) })
    vi.mocked(db.update).mockReturnValue(drizzleMock({ set: mockSet }) as unknown as ReturnType<typeof db.update>)

    const mockValues = vi.fn().mockResolvedValue([])
    vi.mocked(db.insert).mockReturnValue(drizzleMock({ values: mockValues }) as unknown as ReturnType<typeof db.insert>)
  })

  describe('savePlayerProgress', () => {
    it('inserts new progress if user has none', async () => {
      // Mock that select returns empty (no existing progress)
      const mockWhere = vi.fn().mockResolvedValue([])
      vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: mockWhere }) }))

      const mockValues = vi.fn().mockResolvedValue([])
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockImplementation(drizzleMock(mockInsert) as unknown as typeof db.insert)

      await savePlayerProgress(userId, { level: 2, xp: 150 })

      expect(db.insert).toHaveBeenCalledWith(playerProgress)
      expect(mockValues).toHaveBeenCalledWith({
        userId,
        level: 2,
        xp: 150,
        updatedAt: mockDate
      })
      expect(db.update).not.toHaveBeenCalled()
    })

    it('updates existing progress if user already has one', async () => {
      // Mock that select returns existing record
      const mockWhere = vi.fn().mockResolvedValue([{ id: 'prog_1', userId }])
      vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: mockWhere }) }))

      const mockSetWhere = vi.fn().mockResolvedValue([])
      const mockSet = vi.fn().mockReturnValue({ where: mockSetWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockImplementation(drizzleMock(mockUpdate) as unknown as typeof db.update)

      await savePlayerProgress(userId, { currentLocation: 'castle' })

      expect(db.update).toHaveBeenCalledWith(playerProgress)
      expect(mockSet).toHaveBeenCalledWith({
        currentLocation: 'castle',
        updatedAt: mockDate
      })
      expect(db.insert).not.toHaveBeenCalled()
    })
  })

  describe('saveCompletedMission', () => {
    it('inserts a new completed mission', async () => {
      const mockWhere = vi.fn().mockResolvedValue([])
      vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: mockWhere }) }))

      const mockValues = vi.fn().mockResolvedValue([])
      vi.mocked(db.insert).mockReturnValue(drizzleMock({ values: mockValues }) as unknown as ReturnType<typeof db.insert>)

      await saveCompletedMission(userId, 'm_1', 'story_1')

      expect(db.insert).toHaveBeenCalledWith(playerMissions)
      expect(mockValues).toHaveBeenCalledWith({
        userId,
        missionId: 'm_1',
        storyId: 'story_1',
        status: 'completed',
        completedAt: mockDate
      })
    })

    it('updates an existing mission to completed', async () => {
      const mockWhere = vi.fn().mockResolvedValue([{ id: 'm_1', status: 'active' }])
      vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: mockWhere }) }))

      const mockSetWhere = vi.fn().mockResolvedValue([])
      const mockSet = vi.fn().mockReturnValue({ where: mockSetWhere })
      vi.mocked(db.update).mockReturnValue(drizzleMock({ set: mockSet }) as unknown as ReturnType<typeof db.update>)

      await saveCompletedMission(userId, 'm_1', 'story_1')

      expect(db.update).toHaveBeenCalledWith(playerMissions)
      expect(mockSet).toHaveBeenCalledWith({
        status: 'completed',
        completedAt: mockDate,
        storyId: 'story_1'
      })
    })
  })

  describe('saveInventoryItems', () => {
    it('inserts new items', async () => {
      const mockWhere = vi.fn().mockResolvedValue([])
      vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: mockWhere }) }))

      const mockValues = vi.fn().mockResolvedValue([])
      vi.mocked(db.insert).mockReturnValue(drizzleMock({ values: mockValues }) as unknown as ReturnType<typeof db.insert>)

      await saveInventoryItems(userId, ['sword'])

      expect(db.insert).toHaveBeenCalledWith(playerInventory)
      expect(mockValues).toHaveBeenCalledWith({
        userId,
        itemId: 'sword',
        quantity: 1
      })
    })

    it('increments quantity for existing items', async () => {
      const mockWhere = vi.fn().mockResolvedValue([{ quantity: 2 }])
      vi.mocked(db.select).mockReturnValue(drizzleMock({ from: vi.fn().mockReturnValue({ where: mockWhere }) }))

      const mockSetWhere = vi.fn().mockResolvedValue([])
      const mockSet = vi.fn().mockReturnValue({ where: mockSetWhere })
      vi.mocked(db.update).mockReturnValue(drizzleMock({ set: mockSet }) as unknown as ReturnType<typeof db.update>)

      await saveInventoryItems(userId, ['potion'])

      expect(db.update).toHaveBeenCalledWith(playerInventory)
      expect(mockSet).toHaveBeenCalledWith({ quantity: 3 })
    })
  })

  describe('saveDialogueEntry', () => {
    it('inserts dialogue history', async () => {
      const mockValues = vi.fn().mockResolvedValue([])
      vi.mocked(db.insert).mockReturnValue(drizzleMock({ values: mockValues }) as unknown as ReturnType<typeof db.insert>)

      await saveDialogueEntry(userId, 'guard', 'Hello', 'Hi there', 95)

      expect(db.insert).toHaveBeenCalledWith(dialogueHistory)
      expect(mockValues).toHaveBeenCalledWith({
        userId,
        npcId: 'guard',
        playerMessage: 'Hello',
        aiResponse: 'Hi there',
        grammarScore: 95
      })
    })
  })

  describe('loadFullPlayerState', () => {
    it('returns formatted player state', async () => {
      // Setup detailed mocks for the four selects
      const progressRecord = { level: 2, xp: 50, currentLocation: 'village' }
      const inventoryRecords = [{ itemId: 'sword' }, { itemId: 'shield' }]
      const missionRecords = [
        { missionId: 'm1', status: 'completed', storyId: 's1' },
        { missionId: 'm2', status: 'active', storyId: 's1' } // Should not be in completedMissions
      ]
      const completedStoryRecords = [{ storyId: 's1' }]

      vi.mocked(db.select).mockReturnValue(drizzleMock({
        from: vi.fn().mockImplementation((table: unknown) => {
          if (table === playerProgress) return { where: vi.fn().mockResolvedValue([progressRecord]) }
          if (table === playerInventory) return { where: vi.fn().mockResolvedValue(inventoryRecords) }
          if (table === playerMissions) return { where: vi.fn().mockResolvedValue(missionRecords) }
          if (table === playerCompletedStories) return { where: vi.fn().mockResolvedValue(completedStoryRecords) }
        })
      }))

      const state = await loadFullPlayerState(userId)

      expect(state).toEqual({
        progress: progressRecord,
        inventory: ['sword', 'shield'],
        completedMissions: [{ missionId: 'm1', storyId: 's1' }],
        completedStories: ['s1'],
        allMissions: missionRecords
      })
    })

    it('handles user with no data', async () => {
      vi.mocked(db.select).mockReturnValue(drizzleMock({
        from: vi.fn().mockImplementation(() => ({ where: vi.fn().mockResolvedValue([]) }))
      }))

      const state = await loadFullPlayerState(userId)

      expect(state).toEqual({
        progress: null,
        inventory: [],
        completedMissions: [],
        completedStories: [],
        allMissions: []
      })
    })
  })
})
