import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Tabla: player_missions
 * Misiones activas, completadas o fallidas del jugador.
 * El mission_id referencia al JSON de game-data.
 * Estados posibles: 'active' | 'completed' | 'failed'
 */
export const playerMissions = pgTable('player_missions', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  missionId: text('mission_id').notNull(),
  status: text().notNull().default('active'), // 'active' | 'completed' | 'failed'
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
