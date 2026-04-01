import { loadNPCs } from '../../utils/loadGameData'

/**
 * GET /api/npc/:id
 * Retrieves a specific NPC by its ID.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const npcs = await loadNPCs()
  const npc = npcs.find(n => n.id === id)

  if (!npc) {
    throw createError({
      statusCode: 404,
      statusMessage: 'NPC not found'
    })
  }

  return npc
})
