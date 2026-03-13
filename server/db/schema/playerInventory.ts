import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Tabla: player_inventory
 * Objetos que posee el jugador. El item_id referencia al JSON de game-data.
 */
export const playerInventory = pgTable('player_inventory', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemId: text('item_id').notNull(),
  quantity: integer().notNull().default(1),
});
