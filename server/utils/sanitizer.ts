import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Utilities to sanitize and validate user input before sending it to the AI.
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
    return ['racist', 'hate', 'sexist']; // Basic fallback
  }
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedText: string;
  error?: string;
}

/**
 * Cleans and validates a user message.
 */
export async function sanitizeInput(input: string): Promise<ValidationResult> {
  // 1. Remove leading and trailing whitespace
  let text = input.trim();

  // 2. Check length (Max 50 characters)
  if (text.length > MAX_CHARS) {
    return {
      isValid: false,
      sanitizedText: text,
      error: `Input is too long (max ${MAX_CHARS} characters).`
    };
  }

  // 3. Clean "weird" or potentially dangerous characters
  // We allow letters, numbers, basic punctuation, and spaces.
  // We remove control characters, scripts, etc.
  text = text.replaceAll(/[<>"'/\\]/g, '').trim(); // Remove escapes and trim again

  // 4. Basic offensive content detection (Toxicity)
  const lowerText = text.toLowerCase();
  const bannedWords = await getBannedWords();
  
  // We use a word boundary regex to avoid false positives like "hello" with "hell"
  // We only apply boundaries if the word is alphanumeric to not break complex phrases
  const hasBannedWord = bannedWords.some((word: string) => {
    const escapedWord = word.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    // If the word contains spaces or non-alphanumeric characters, we use includes
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(word)) {
      return lowerText.includes(word.toLowerCase());
    }
    // If it is a simple word, we use word boundaries \b
    const regex = new RegExp(String.raw`\b${escapedWord}\b`, 'i');
    return regex.test(lowerText);
  });
  
  if (hasBannedWord) {
    return {
      isValid: false,
      sanitizedText: text,
      error: 'Your message contains inappropriate language and cannot be sent.'
    };
  }

  // 5. Check if input is empty after cleaning
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
