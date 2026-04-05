import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

/**
 * Cliente de conexión a la base de datos PostgreSQL.
 *
 * Usa la variable de entorno DATABASE_URL definida en .env
 * y carga todos los esquemas para habilitar el API relacional de Drizzle.
 *
 * La detección SSL se basa en la propia DATABASE_URL:
 * - DigitalOcean inyecta URLs con "sslmode=require" → SSL activado
 * - En local (localhost) → SSL desactivado
 *
 * Uso en cualquier parte del servidor:
 *   import { db } from '~/server/db';
 *   const allUsers = await db.select().from(schema.users);
 */
const databaseUrl = process.env.DATABASE_URL!;
const requiresSSL = databaseUrl.includes('sslmode=') || databaseUrl.includes('ssl=');

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: requiresSSL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
