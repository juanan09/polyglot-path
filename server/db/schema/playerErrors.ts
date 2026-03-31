import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Tabla: player_errors
 * Errores gramaticales detectados por la IA durante las interacciones.
 * Se usa para telemetría pedagógica: identificar puntos débiles del jugador
 * y mostrar los "Registros de Fiascos" en el dashboard de aprendizaje.
 */
export const playerErrors = pgTable('player_errors', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  errorDescription: text('error_description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
