import { genkit } from 'genkit/beta';
import { googleAI } from '@genkit-ai/googleai';

// Importamos la API Key desde las variables de entorno
const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY

if (apiKey) {
    console.log('✅ GOOGLE_API_KEY detected for Genkit')
} else {
    console.warn('⚠️ GOOGLE_API_KEY is not defined')
}

// Inicializamos Genkit con el plugin googleAI (versión percli)
export const ai = genkit({
    plugins: [googleAI({ apiKey })],
})

// Exportamos el plugin para poder acceder a sus modelos fácilmente
export { googleAI }
