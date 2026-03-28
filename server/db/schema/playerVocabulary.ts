import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Tabla: player_vocabulary
 * Palabras y expresiones aprendidas por el jugador.
 * Clave para el sistema pedagógico y la telemetría de la Fase 11.
 *
 * wordType clasifica la entrada:
 *   - 'word'        → palabra suelta (e.g. "bread", "sword")
 *   - 'phrase'      → frase/expresión (e.g. "excuse me", "how much is…")
 *   - 'phrasal_verb' → phrasal verb (e.g. "look for", "give up")
 */
export const playerVocabulary = pgTable('player_vocabulary', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  word: text().notNull(),
  wordType: text('word_type').notNull().default('word'), // 'word' | 'phrase' | 'phrasal_verb'
  learnedAt: timestamp('learned_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique('uq_user_word').on(table.userId, table.word),
]);
