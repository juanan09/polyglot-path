import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Table: player_errors
 * Grammatical errors detected by the AI during interactions.
 * Used for pedagogical telemetry: identifying player weaknesses
 * and showing the "Mistakes Log" on the learning dashboard.
 */
export const playerErrors = pgTable('player_errors', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  errorDescription: text('error_description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
