import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Tabla: users
 * Usuarios autenticados (Google OAuth) o invitados.
 */
export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull(),
  provider: text().notNull(), // 'google' | 'guest'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
