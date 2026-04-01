import fs from 'node:fs/promises'
import path from 'node:path'

import type { NPC, Location, Item, Mission, Dialogue, Story } from '../../types/game'

const GAME_DATA_DIR = path.resolve(process.cwd(), 'game-data')

/**
 * Generic function to load all JSONs from a subdirectory.
 * @param subDir Name of the subdirectory (e.g., 'npcs', 'locations')
 * @returns Array of parsed objects from the JSONs.
 */
async function loadJsonDirectory<T>(subDir: string): Promise<T[]> {
  const dirPath = path.join(GAME_DATA_DIR, subDir)
  const items: T[] = []

  try {
    const files = await fs.readdir(dirPath)
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dirPath, file)
        const fileContent = await fs.readFile(filePath, 'utf-8')
        try {
          const parsedData = JSON.parse(fileContent)
          // If the JSON is an array, we flatten its elements individually.
          // If it is a plain object, we add it directly.
          if (Array.isArray(parsedData)) {
            items.push(...(parsedData as T[]))
          } else {
            items.push(parsedData as T)
          }
        } catch (parseError) {
          console.error(`Error parsing JSON file: ${filePath}`, parseError)
        }
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`Directory not found: ${dirPath}. Returning empty array.`)
    } else {
      console.error(`Error reading directory: ${dirPath}`, error)
      throw error
    }
  }

  return items
}

// Specific functions to load each data type

export async function loadNPCs(): Promise<NPC[]> {
  return loadJsonDirectory<NPC>('npcs')
}

export async function loadLocations(): Promise<Location[]> {
  return loadJsonDirectory<Location>('locations')
}

export async function loadItems(): Promise<Item[]> {
  return loadJsonDirectory<Item>('items')
}

export async function loadMissions(): Promise<Mission[]> {
  return loadJsonDirectory<Mission>('missions')
}

export async function loadDialogues(): Promise<Dialogue[]> {
  return loadJsonDirectory<Dialogue>('dialogues')
}

export async function loadHistories(): Promise<Story[]> {
  return loadJsonDirectory<Story>('history')
}

/**
 * Loads all game data at once. Useful for initialization or tests.
 */
export async function loadAllGameData() {
  const [npcs, locations, items, missions, dialogues] = await Promise.all([
    loadNPCs(),
    loadLocations(),
    loadItems(),
    loadMissions(),
    loadDialogues()
  ])

  return {
    npcs,
    locations,
    items,
    missions,
    dialogues
  }
}
