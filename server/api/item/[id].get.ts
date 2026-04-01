import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * GET /api/item/:id
 * Retrieves a specific item by its ID.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing item id' })

  try {
    const filePath = path.join(process.cwd(), 'game-data', 'items', `${id}.json`)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    throw createError({ statusCode: 404, message: `Item ${id} not found`, cause: error })
  }
})
