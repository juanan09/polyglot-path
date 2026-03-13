import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Tabla: player_vocabulary
 * Palabras aprendidas por el jugador. Clave para el sistema pedagógico.
 */
export const playerVocabulary = pgTable('player_vocabulary', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  word: text().notNull(),
  learnedAt: timestamp('learned_at', { withTimezone: true }).notNull().defaultNow(),
});
