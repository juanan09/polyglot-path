import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Tabla: player_progress
 * Estado general del jugador: nivel, XP, ubicación, misión, historia y NPC activo.
 */
export const playerProgress = pgTable('player_progress', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  level: integer().notNull().default(1),
  xp: integer().notNull().default(0),
  currentLocation: text('current_location'),
  activeMission: text('active_mission'),
  currentStoryId: text('current_story_id'),
  currentStoryName: text('current_story_name'),
  currentNpcId: text('current_npc_id'),

  // Telemetría Pedagógica (Fase 11)
  grammarScore: integer('grammar_score').notNull().default(0), // Media de precisión gramatical (0-100)
  vocabularyLearned: integer('vocabulary_learned').notNull().default(0), // Total de palabras descubiertas
  dialogueFrequency: integer('dialogue_frequency').notNull().default(0), // Total de interacciones con NPCs

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
