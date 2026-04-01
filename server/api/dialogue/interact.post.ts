import { defineEventHandler, readBody, createError } from 'h3'
import { getOrCreateSession, addMessageToSession } from '../../utils/gameSession'
import { loadNPCs, loadDialogues } from '../../utils/loadGameData'
import { createDialogueAgent } from '../../ai/agent'
import { sanitizeInput } from '../../utils/sanitizer'
import { mapErrorToUserFriendlyMessage } from '../../utils/errorMapper'
import { checkMissionProgress } from '../../utils/missionEngine'
import { saveDialogueEntry, saveLearnedVocabulary, saveGrammarErrors } from '../../utils/persistenceService'
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

    // 1. Sanitize and validate user input (Security and Quality)
    const validation = await sanitizeInput(message)
    if (!validation.isValid) {
      // Return a 400 error with the specific validation message
      throw createError({
        statusCode: 400,
        statusMessage: validation.error || 'Invalid input'
      })
    }

    // Use sanitized text for the rest of the process
    const sanitizedMessage = validation.sanitizedText

    // 2. Load world data (NPC and Dialogues) (JSON)
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

    // 2. Manage dialogue session (History)
    const session = await getOrCreateSession(userId, npcId)
    // Limit the history to the last 10 messages to avoid "noise"
    const relevantHistory = session.messages.slice(-10)

    // 3. Initialize the PerCLI-style agent (with chat session)
    const chat = createDialogueAgent(npc, npcDialogues)

    // 4. Send message and get structured response (JSON)
    const response = await chat.send(sanitizedMessage, { history: relevantHistory })
    
    const output = response.output

    if (!output) {
      throw createError({
        statusCode: 500,
        statusMessage: 'AI failed to generate a structured response',
      })
    }

    // 5. Verify AI Moderation (Intelligent Filter)
    if (output.is_safe === false) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Your message was flagged as inappropriate by our moderation system. Please be respectful.'
      })
    }

    // 6. Update session history in "DB" (Nitro Storage)
    // Add both user input and model response
    await addMessageToSession(userId, npcId, 'user', sanitizedMessage)
    await addMessageToSession(userId, npcId, 'model', output.npc_response)

    // 6b. Persist in PostgreSQL if user is authenticated
    try {
      const session = await useSession(event, getSessionConfig())
      const authUserId = session.data?.userId as string | undefined
      if (authUserId) {
        await saveDialogueEntry(authUserId, npcId, sanitizedMessage, output.npc_response, output.grammar_score)
        
        // Persist vocabulary and errors
        if (output.learned_vocabulary?.length) {
          await saveLearnedVocabulary(authUserId, output.learned_vocabulary)
        }
        if (output.grammar_errors?.length) {
          await saveGrammarErrors(authUserId, output.grammar_errors)
        }
      }
    } catch (e) {
      console.warn('Persistence error (silent):', e)
      // Do not interrupt the flow due to persistence failures
    }

    // 7. Check mission progress
    const missionProgress = await checkMissionProgress(activeMissionId, { 
      intent: output.intent, 
      targetNpcId: npcId 
    })

    // 8. Return result to client
    return {
      success: true,
      data: {
        intent: output.intent,
        grammarScore: output.grammar_score,
        npcResponse: output.npc_response,
        feedback: output.feedback,
        learnedVocabulary: output.learned_vocabulary || [],
        grammarErrors: output.grammar_errors || [],
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
