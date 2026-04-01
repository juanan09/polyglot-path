import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Table: player_vocabulary
 * Words and expressions learned by the player.
 * Key for the pedagogical system and Phase 11 telemetry.
 *
 * wordType classifies the entry:
 *   - 'word'        → single word (e.g. "bread", "sword")
 *   - 'phrase'      → phrase/expression (e.g. "excuse me", "how much is…")
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
