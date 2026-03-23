import { ai, getActiveModel } from './genkit';
import { z as genkitZ } from 'genkit';
import type { NPC, Dialogue } from '../../types/game';
/**
 * Esquema de salida para el diálogo.
 */
export const DialogueSchema = genkitZ.object({
    intent: genkitZ.string().describe('The ID of the detected intent from the context, or "unknown" if none match.'),
    grammar_score: genkitZ.number().describe('Grammar score of the player input, from 0.0 to 1.0.'),
    npc_response: genkitZ.string().describe('The natural language response of the NPC, staying in character.'),
    feedback: genkitZ.string().nullable().optional().describe('Brief, helpful pedagogical feedback on the player\'s grammar or vocabulary choice.'),
    is_safe: genkitZ.boolean().describe('Whether the input is respectful and appropriate for a learning environment.')
});

const npcDialogPrompt = ai.definePrompt({
    name: 'npcDialogPrompt',
    model: getActiveModel(),
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

        SAFETY RULES (CRITICAL):
        - Detect if the player message: "{{query}}" contains hate speech, racism, sexism, extreme violence, or explicit sexual content.
        - If the message is UNSAFE, set "is_safe" to false and respond as {{npcData.name}} telling the player to be respectful.
        - If the message is SAFE, set "is_safe" to true and proceed normally.

        INSTRUCTIONS:
        1. Analyze the player's message: "{{query}}"
        2. Perform the SAFETY CHECK.
        3. Detect which NPC Intent is most likely from the CONTEXT list. 
           Use an intent if the player's message clearly expresses the same meaning or goal as the examples, even if the phrasing is different.
           Only return "unknown" if the message is clearly off-topic (e.g. greetings, unrelated questions) or no intent fits at all.
        4. Evaluate the player's English grammar and vocabulary (0.0 to 1.0).
        5. Craft a response as {{npcData.name}}. Don't be too repetitive.
        6. If the player's grammar is weak, provide helpful, encouraging feedback in the "feedback" field.
        7. Return EVERYTHING in the specified JSON format.

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
