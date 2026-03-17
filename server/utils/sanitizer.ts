import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Utilidades para sanear y validar el input del usuario antes de enviarlo a la IA.
 */

const MAX_CHARS = 50;

async function getBannedWords(): Promise<string[]> {
  try {
    const filePath = path.resolve(process.cwd(), 'game-data/safety/banned-words.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return [...data.english, ...data.spanish];
  } catch (error) {
    console.error('Error loading banned words library:', error);
    return ['racist', 'hate', 'sexist']; // Fallback básico
  }
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedText: string;
  error?: string;
}

/**
 * Limpia y valida un mensaje del usuario.
 */
export async function sanitizeInput(input: string): Promise<ValidationResult> {
  // 1. Quitar espacios en blanco delante y detrás
  let text = input.trim();

  // 2. Verificar longitud (Máximo 50 caracteres)
  if (text.length > MAX_CHARS) {
    return {
      isValid: false,
      sanitizedText: text,
      error: `Input is too long (max ${MAX_CHARS} characters).`
    };
  }

  // 3. Limpiar caracteres "raros" o potencialmente peligrosos
  // Permitimos letras, números, puntuación básica y espacios.
  // Eliminamos caracteres de control, scripts, etc.
  text = text.replaceAll(/[<>"'/\\]/g, '').trim(); // Eliminamos escapes y volvemos a trimar

  // 4. Detección básica de contenido ofensivo (Toxicity)
  const lowerText = text.toLowerCase();
  const bannedWords = await getBannedWords();
  
  // Usamos una regex de límites de palabra para evitar falsos positivos como "hello" con "hell"
  // Solo aplicamos límites si la palabra es alfanumérica para no romper frases complejas
  const hasBannedWord = bannedWords.some((word: string) => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Si la palabra contiene espacios o caracteres no alfanuméricos, usamos includes
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(word)) {
      return lowerText.includes(word.toLowerCase());
    }
    // Si es una palabra simple, usamos límites de palabra \b
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    return regex.test(lowerText);
  });
  
  if (hasBannedWord) {
    return {
      isValid: false,
      sanitizedText: text,
      error: 'Your message contains inappropriate language and cannot be sent.'
    };
  }

  // 5. Verificar si el input está vacío tras la limpieza
  if (text.length === 0) {
    return {
      isValid: false,
      sanitizedText: '',
      error: 'Message is empty or contains invalid characters.'
    };
  }

  return {
    isValid: true,
    sanitizedText: text
  };
}
