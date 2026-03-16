import { loadAllGameData } from '../utils/loadGameData'

export default defineEventHandler(async () => {
  try {
    const gameData = await loadAllGameData()
    return {
      status: 'success',
      data: gameData,
      message: 'Game data loaded successfully'
    }
  } catch (error) {
    console.error('Error loading game data test endpoint:', error)
    return {
      status: 'error',
      message: 'Failed to load game data',
      error: String(error)
    }
  }
})
