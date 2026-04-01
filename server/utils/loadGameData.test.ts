import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs/promises'
import * as gameDataLoader from './loadGameData'

// We mock the entire file reading module
vi.mock('node:fs/promises', () => {
  return {
    default: {
      readdir: vi.fn(),
      readFile: vi.fn()
    }
  }
})

describe('Game Data Loader utility', () => {
  beforeEach(() => {
    // Clear mocks before each test so they don't interfere with each other
    vi.clearAllMocks()
    
    // Suppress error/warn consoles in tests to not clutter the log
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('1. Should load and parse JSONs correctly from a valid directory', async () => {
    // Simulate directory having 2 files
    vi.mocked(fs.readdir as unknown as () => Promise<string[]>).mockResolvedValue(['npc_1.json', 'npc_2.json'])
    
    // Simulate the text content that the hard drive would return for each file
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce('{"id": "npc1", "name": "Guardia"}')
      .mockResolvedValueOnce('{"id": "npc2", "name": "Mercader"}')
      
    const result = await gameDataLoader.loadNPCs()
    
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toBe('npc1')
    expect(result[1]!.name).toBe('Mercader')
    expect(fs.readdir).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledTimes(2)
  })

  it('2. Should return an empty array and not throw error if directory does not exist (ENOENT)', async () => {
    const enoentError = new Error('No such file or directory') as NodeJS.ErrnoException
    enoentError.code = 'ENOENT'
    
    // Simulate that an error is thrown when trying to read the directory because it doesn't exist
    vi.mocked(fs.readdir).mockRejectedValue(enoentError)
    
    const result = await gameDataLoader.loadItems()
    
    expect(result).toEqual([]) // Debe ser un array vacío
    expect(console.warn).toHaveBeenCalled() // Should have warned in console
  })

  it('3. Should catch syntax error and omit a corrupt JSON without crashing', async () => {
    vi.mocked(fs.readdir as unknown as () => Promise<string[]>).mockResolvedValue(['bueno.json', 'malo.json'])
    
    // The first file reads fine, but the second has broken JSON syntax
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce('{"id": "1"}')
      .mockResolvedValueOnce('{id: 2, name "roto"}') // Sintaxis inválida JSON
      
    const result = await gameDataLoader.loadMissions()
    
    expect(result).toHaveLength(1) // Solo carga 1
    expect(result[0]!.id).toBe('1')
    expect(console.error).toHaveBeenCalled() // Warned that parsing error occurred
  })

  it('4. Should ignore files that do not have .json extension', async () => {
    // Sometimes system files get included by mistake
    vi.mocked(fs.readdir as unknown as () => Promise<string[]>).mockResolvedValue(['data.json', '.DS_Store', 'imagen.png'])
    
    vi.mocked(fs.readFile).mockResolvedValueOnce('{"id": "data"}')
      
    const result = await gameDataLoader.loadLocations()
    
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('data')
    expect(fs.readFile).toHaveBeenCalledTimes(1) // Should only have tried to read the .json
  })

  it('5. Should flatten a JSON that is an array instead of adding it as a single element', async () => {
    // Regression: baker_dialogues.json was an array and was loaded as 1 false element
    vi.mocked(fs.readdir as unknown as () => Promise<string[]>).mockResolvedValue(['baker_dialogues.json'])
    vi.mocked(fs.readFile).mockResolvedValueOnce(
      '[{"id": "d1", "npc_id": "baker"}, {"id": "d2", "npc_id": "guard"}]'
    )

    const result = await gameDataLoader.loadDialogues()

    // 2 individual Dialogues should appear, not a single array as an element
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toBe('d1')
    expect(result[1]!.id).toBe('d2')
  })
})
