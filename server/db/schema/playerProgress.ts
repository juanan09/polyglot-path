import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Tabla: player_progress
 * Estado general del jugador: nivel, XP, ubicación y misión activa.
 */
export const playerProgress = pgTable('player_progress', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  level: integer().notNull().default(1),
  xp: integer().notNull().default(0),
  currentLocation: text('current_location').notNull().default('village_square'),
  activeMission: text('active_mission'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
