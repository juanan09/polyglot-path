import { pgTable, uuid, text, real, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Table: dialogue_history
 * History of interactions with NPCs.
 * Useful for telemetry, pedagogical analysis, and AI debugging.
 */
export const dialogueHistory = pgTable('dialogue_history', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  npcId: text('npc_id').notNull(),
  playerMessage: text('player_message').notNull(),
  aiResponse: text('ai_response').notNull(),
  grammarScore: real('grammar_score'), // 0.0 a 1.0
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
