import { pgTable, uuid, text, real, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Tabla: dialogue_history
 * Historial de interacciones con NPCs.
 * Útil para telemetría, análisis pedagógico y debug de la IA.
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
