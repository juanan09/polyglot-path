import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

/**
 * Cliente de conexión a la base de datos PostgreSQL.
 *
 * Usa la variable de entorno DATABASE_URL definida en .env
 * y carga todos los esquemas para habilitar el API relacional de Drizzle.
 *
 * Uso en cualquier parte del servidor:
 *   import { db } from '~/server/db';
 *   const allUsers = await db.select().from(schema.users);
 */
export const db = drizzle(process.env.DATABASE_URL!, { schema });
