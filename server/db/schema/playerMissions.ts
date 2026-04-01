import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Table: player_missions
 * Active, completed or failed player missions.
 * mission_id references the JSON in game-data.
 * Possible states: 'active' | 'completed' | 'failed'
 */
export const playerMissions = pgTable('player_missions', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  missionId: text('mission_id').notNull(),
  storyId: text('story_id'),
  status: text().notNull().default('active'), // 'active' | 'completed' | 'failed'
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
