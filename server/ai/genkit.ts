import { genkit } from 'genkit/beta';
import { googleAI } from '@genkit-ai/googleai';
import { ollama } from 'genkitx-ollama';
import { groq } from 'genkitx-groq';

// ─────────────────────────────────────────────
// LLM Provider Configuration
// LLM_PROVIDER = 'google' | 'ollama' | 'groq'
// ─────────────────────────────────────────────
export type LlmProvider = 'google' | 'ollama' | 'groq'

const provider = (process.env.LLM_PROVIDER || 'google') as LlmProvider

// Google AI
const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY

// Ollama
const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
const ollamaModel = process.env.OLLAMA_MODEL || 'phi4-mini'

// Groq
const groqApiKey = process.env.GROQ_API_KEY

// Active provider log
switch (provider) {
    case 'ollama':
        console.log(`🦙 Ollama mode → model: ${ollamaModel} @ ${ollamaHost}`)
        break
    case 'groq':
        console.log(`⚡ Groq mode → ${groqApiKey ? 'API key detected' : '⚠️ GROQ_API_KEY missing'}`)
        break
    default:
        console.log(googleApiKey ? '✅ Google AI mode' : '⚠️ GOOGLE_API_KEY not configured')
}

// Initialize Genkit with ONLY the active provider plugin
const plugins = []

switch (provider) {
    case 'google':
        plugins.push(googleAI({ apiKey: googleApiKey }))
        break
    case 'ollama':
        plugins.push(ollama({
            models: [{ name: ollamaModel, type: 'generate' }],
            serverAddress: ollamaHost,
        }))
        break
    case 'groq':
        plugins.push(groq({ apiKey: groqApiKey }))
        break
}

export const ai = genkit({ plugins })

// ─────────────────────────────────────────────
// Resolve active model based on provider
// ─────────────────────────────────────────────
export function getActiveModel() {
    switch (provider) {
        case 'ollama':
            return `ollama/${ollamaModel}`
        case 'groq':
            return 'groq/llama-3.1-8b-instant'
        default:
            return googleAI.model('gemini-2.0-flash')
    }
}

export { googleAI } from '@genkit-ai/googleai';
export { provider as llmProvider };
