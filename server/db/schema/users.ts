import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Table: users
 * Authenticated users (email+password) or guests.
 */
export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().default('Traveler'),
  email: text().notNull().unique(),
  passwordHash: text('password_hash'), // nullable for future OAuth compatibility
  provider: text().notNull().default('local'), // 'local' | 'google' | 'guest'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
