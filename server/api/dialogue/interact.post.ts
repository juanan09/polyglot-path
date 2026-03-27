import { defineEventHandler, readBody, createError } from 'h3'
import { getOrCreateSession, addMessageToSession } from '../../utils/gameSession'
import { loadNPCs, loadDialogues } from '../../utils/loadGameData'
import { createDialogueAgent } from '../../ai/agent'
import { sanitizeInput } from '../../utils/sanitizer'
import { mapErrorToUserFriendlyMessage } from '../../utils/errorMapper'
import { checkMissionProgress } from '../../utils/missionEngine'
import { saveDialogueEntry } from '../../utils/persistenceService'
import { getSessionConfig } from '../../utils/sessionConfig'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, npcId, message, activeMissionId } = body

    if (!userId || !npcId || !message) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing userId, npcId, or message',
      })
    }

    // 1. Sanear y validar el input del usuario (Seguridad y Calidad)
    const validation = await sanitizeInput(message)
    if (!validation.isValid) {
      // Devolvemos un error 400 con el mensaje específico de validación
      throw createError({
        statusCode: 400,
        statusMessage: validation.error || 'Invalid input'
      })
    }

    // Usamos el texto saneado para el resto del proceso
    const sanitizedMessage = validation.sanitizedText

    // 2. Cargar datos del mundo (NPC y Diálogos) (JSON)
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
    const response = await chat.send(sanitizedMessage, { history: relevantHistory })
    
    const output = response.output

    if (!output) {
      throw createError({
        statusCode: 500,
        statusMessage: 'AI failed to generate a structured response',
      })
    }

    // 5. Verificar Moderación de la IA (Filtro Inteligente)
    if (output.is_safe === false) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Your message was flagged as inappropriate by our moderation system. Please be respectful.'
      })
    }

    // 6. Actualizar el historial de la sesión en la "DB" (Nitro Storage)
    // Añadimos tanto el input del usuario como la respuesta del modelo
    await addMessageToSession(userId, npcId, 'user', sanitizedMessage)
    await addMessageToSession(userId, npcId, 'model', output.npc_response)

    // 6b. Persistir en PostgreSQL si el usuario está autenticado
    try {
      const session = await useSession(event, getSessionConfig())
      const authUserId = session.data?.userId as string | undefined
      if (authUserId) {
        await saveDialogueEntry(authUserId, npcId, sanitizedMessage, output.npc_response, output.grammar_score)
      }
    } catch {
      // No interrumpir el flujo por fallos de persistencia
    }

    // 7. Chequear progreso de la misión
    const missionProgress = await checkMissionProgress(activeMissionId, { 
      intent: output.intent, 
      targetNpcId: npcId 
    })

    // 8. Devolver resultado al cliente
    return {
      success: true,
      data: {
        intent: output.intent,
        grammarScore: output.grammar_score,
        npcResponse: output.npc_response,
        feedback: output.feedback,
        missionProgress,
        history: (await getOrCreateSession(userId, npcId)).messages
      }
    }

  } catch (error: unknown) {
    const statusCode = (error && typeof error === 'object' && 'statusCode' in error) 
      ? (error as { statusCode: number }).statusCode 
      : 500
    const friendlyMessage = mapErrorToUserFriendlyMessage(error)
    
    console.error('Error in dialogue interaction:', error)
    throw createError({
      statusCode,
      statusMessage: friendlyMessage,
    })
  }
})
