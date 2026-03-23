import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs/promises'
import * as gameDataLoader from './loadGameData'

// Hacemos un "mock" del módulo entero de lectura de archivos
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
    // Limpiamos los mocks antes de cada test para que no interfieran entre sí
    vi.clearAllMocks()
    
    // Suprimimos los consoles de error/warn en los tests para no ensuciar el log
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('1. Debe cargar y parsear JSONs correctamente de un directorio válido', async () => {
    // Simulamos que el directorio tiene 2 archivos
    vi.mocked(fs.readdir as unknown as () => Promise<string[]>).mockResolvedValue(['npc_1.json', 'npc_2.json'])
    
    // Simulamos el contenido de texto que devolvería el disco duro para cada archivo
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

  it('2. Debe devolver un array vacío y no lanzar error si el directorio no existe (ENOENT)', async () => {
    const enoentError = new Error('No such file or directory') as NodeJS.ErrnoException
    enoentError.code = 'ENOENT'
    
    // Simulamos que al intentar leer el directorio se lanza un error porque no existe
    vi.mocked(fs.readdir).mockRejectedValue(enoentError)
    
    const result = await gameDataLoader.loadItems()
    
    expect(result).toEqual([]) // Debe ser un array vacío
    expect(console.warn).toHaveBeenCalled() // Debería haber avisado en la consola
  })

  it('3. Debe capturar el error de sintaxis y omitir un JSON corrupto sin crashear', async () => {
    vi.mocked(fs.readdir as unknown as () => Promise<string[]>).mockResolvedValue(['bueno.json', 'malo.json'])
    
    // El primer archivo se lee bien, pero el segundo tiene la sintaxis json rota
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce('{"id": "1"}')
      .mockResolvedValueOnce('{id: 2, name "roto"}') // Sintaxis inválida JSON
      
    const result = await gameDataLoader.loadMissions()
    
    expect(result).toHaveLength(1) // Solo carga 1
    expect(result[0]!.id).toBe('1')
    expect(console.error).toHaveBeenCalled() // Avisó de que el error al parsear ocurrió
  })

  it('4. Debe ignorar archivos que no tengan extensión .json', async () => {
    // Hay archivos de sistema que se meten sin querer a veces
    vi.mocked(fs.readdir as unknown as () => Promise<string[]>).mockResolvedValue(['data.json', '.DS_Store', 'imagen.png'])
    
    vi.mocked(fs.readFile).mockResolvedValueOnce('{"id": "data"}')
      
    const result = await gameDataLoader.loadLocations()
    
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('data')
    expect(fs.readFile).toHaveBeenCalledTimes(1) // Solo debió intentar leer el .json
  })

  it('5. Debe aplanar un JSON que es un array en lugar de añadirlo como un único elemento', async () => {
    // Regresión: baker_dialogues.json era un array y se cargaba como 1 elemento falso
    vi.mocked(fs.readdir as unknown as () => Promise<string[]>).mockResolvedValue(['baker_dialogues.json'])
    vi.mocked(fs.readFile).mockResolvedValueOnce(
      '[{"id": "d1", "npc_id": "baker"}, {"id": "d2", "npc_id": "guard"}]'
    )

    const result = await gameDataLoader.loadDialogues()

    // Deben aparecer 2 Dialogue individuales, no un único array como elemento
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toBe('d1')
    expect(result[1]!.id).toBe('d2')
  })
})
