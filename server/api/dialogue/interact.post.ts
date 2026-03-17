import { defineEventHandler, readBody, createError } from 'h3'
import { loadNPCs, loadDialogues } from '../../utils/loadGameData'
import { addMessageToSession, getOrCreateSession } from '../../utils/gameSession'
import { createDialogueAgent } from '../../ai/agent'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, npcId, message } = body

  if (!userId || !npcId || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: userId, npcId, message',
    })
  }

  try {
    // 1. Cargar datos necesarios del juego (JSON)
    const npcs = await loadNPCs()
    const npc = npcs.find((n) => n.id === npcId)

    if (!npc) {
      throw createError({
        statusCode: 404,
        statusMessage: `NPC with id ${npcId} not found`,
      })
    }

    const allDialogues = await loadDialogues()
    const npcDialogues = allDialogues.filter((d) => d.npc_id === npcId)

    // 2. Gestionar la sesión de diálogo (Historial)
    const session = await getOrCreateSession(userId, npcId)
    // Limitamos el historial a los últimos 10 mensajes para evitar "ruido"
    const relevantHistory = session.messages.slice(-10)

    // 3. Inicializar el agente estilo PerCLI (con chat session)
    const chat = createDialogueAgent(npc, npcDialogues)

    // 4. Enviar mensaje y obtener respuesta estructurada (JSON)
    const response = await chat.send(message, { history: relevantHistory })
    
    const output = response.output

    if (!output) {
      throw createError({
        statusCode: 500,
        statusMessage: 'AI failed to generate a structured response',
      })
    }

    // 5. Actualizar el historial de la sesión en la "DB" (Nitro Storage)
    // Añadimos tanto el input del usuario como la respuesta del modelo
    await addMessageToSession(userId, npcId, 'user', message)
    await addMessageToSession(userId, npcId, 'model', output.npc_response)

    // 6. Devolver resultado al cliente
    return {
      success: true,
      data: {
        intent: output.intent,
        grammarScore: output.grammar_score,
        npcResponse: output.npc_response,
        feedback: output.feedback,
        history: (await getOrCreateSession(userId, npcId)).messages
      }
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statusCode = (error as any)?.statusCode || 500
    
    console.error('Error in dialogue interaction:', error)
    throw createError({
      statusCode,
      statusMessage: message,
    })
  }
})
