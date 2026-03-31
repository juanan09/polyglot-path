import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Tabla: player_completed_stories
 * Registra qué historias ha terminado un jugador (misión final completada).
 */
export const playerCompletedStories = pgTable('player_completed_stories', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  storyId: text('story_id').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Índice único para evitar duplicados si un jugador repite una historia
  userStoryUnique: uniqueIndex('uq_user_story_completed').on(table.userId, table.storyId),
}));
