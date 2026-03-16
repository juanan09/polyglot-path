import { ai, googleAI } from './genkit';
import { z as genkitZ } from 'genkit'; 
import type { NPC, Dialogue } from '../../types/game';
/**
 * Esquema de salida para el diálogo.
 */
export const DialogueSchema = genkitZ.object({
    intent: genkitZ.string().describe('The ID of the detected intent from the context, or "unknown" if none match.'),
    grammar_score: genkitZ.number().describe('Grammar score of the player input, from 0.0 to 1.0.'),
    npc_response: genkitZ.string().describe('The natural language response of the NPC, staying in character.'),
    feedback: genkitZ.string().optional().describe('Brief, helpful pedagogical feedback on the player\'s grammar or vocabulary choice.')
});

const npcDialogPrompt = ai.definePrompt({
    name: 'npcDialogPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: {
        schema: genkitZ.object({
            query: genkitZ.string(),
            npcData: genkitZ.object({
                name: genkitZ.string(),
                personality: genkitZ.string(),
                language_level: genkitZ.string()
            }),
            dialogueExamples: genkitZ.array(genkitZ.object({
                intent: genkitZ.string(),
                examples: genkitZ.array(genkitZ.string())
            }))
        })
    },
    output: {
        schema: DialogueSchema
    },
    prompt: `
        ROLE:
        You are {{npcData.name}}, a NPC in a RPG world for language learning.
        Personality: {{npcData.personality}}
        Language Level: {{npcData.language_level}}

        CONTEXT:
        Available Intents and Examples to guide your detection (NOT your response):
        {{#each dialogueExamples}}
        - Intent: {{this.intent}} | Player Examples: {{this.examples}}
        {{/each}}

        INSTRUCTIONS:
        1. Analyze the player's message: "{{query}}"
        2. Detect which NPC Intent is most likely from the CONTEXT list.
        3. Evaluate the player's English grammar and vocabulary (0.0 to 1.0).
        4. Craft a response as {{npcData.name}}. Don't be too repetitive.
        5. If the player's grammar is weak, provide helpful, encouraging feedback in the "feedback" field.
        6. Return EVERYTHING in the specified JSON format.

        The user's previous context is already handled by our chat session. Focus on the current interaction.

        Response:
    `
});

/**
 * Crea el agente de diálogo siguiendo el patrón de PerCLI.
 */
export function createDialogueAgent(npcData: NPC, dialogueExamples: Dialogue[]) {
    // Retornamos la sesión de chat pre-configurada con el prompt y los datos del NPC
    // Usamos 'as any' porque genkit/beta tiene algunas incompatibilidades de tipos internas entre Prompts y Chat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ai as any).chat(npcDialogPrompt, {
        input: {
            npcData,
            dialogueExamples
        }
    });
}
