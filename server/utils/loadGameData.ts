import fs from 'node:fs/promises'
import path from 'node:path'

// Definir interfaces básicas (pueden ampliarse más adelante o moverse a types/)
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
}

export interface Mission {
  id: string
  name: string
  description: string
  npc_giver: string
  objectives: MissionObjective[]
  reward: MissionReward
  level_required: string
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

const GAME_DATA_DIR = path.resolve(process.cwd(), 'game-data')

/**
 * Función genérica para cargar todos los JSONs de un subdirectorio
 * @param subDir Nombre del subdirectorio (ej: 'npcs', 'locations')
 * @returns Array de objetos parseados desde los JSON
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
          items.push(parsedData as T)
        } catch (parseError) {
          console.error(`Error al parsear el archivo JSON: ${filePath}`, parseError)
        }
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`Directorio no encontrado: ${dirPath}. Devolviendo array vacío.`)
    } else {
      console.error(`Error al leer el directorio: ${dirPath}`, error)
      throw error
    }
  }

  return items
}

// Funciones específicas para cargar cada tipo de dato

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

/**
 * Carga todos los datos del juego de una vez. Útil para inicializaciones o tests.
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
