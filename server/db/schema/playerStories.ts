import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Table: player_completed_stories
 * Records which stories a player has finished (final mission completed).
 */
export const playerCompletedStories = pgTable('player_completed_stories', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  storyId: text('story_id').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Unique index to avoid duplicates if a player repeats a story
  userStoryUnique: uniqueIndex('uq_user_story_completed').on(table.userId, table.storyId),
}));
