import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Tabla: users
 * Usuarios autenticados (email+password) o invitados.
 */
export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().default('Viajero'),
  email: text().notNull().unique(),
  passwordHash: text('password_hash'), // nullable para compatibilidad con OAuth futuro
  provider: text().notNull().default('local'), // 'local' | 'google' | 'guest'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
