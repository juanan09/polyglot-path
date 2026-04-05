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
 * DigitalOcean inyecta DATABASE_URL con sslmode=require, que el driver pg
 * interpreta como verify-full (verificar cert). Esto falla con el cert
 * auto-firmado de las BD Dev. Solución: extraemos sslmode de la URL y
 * lo gestionamos manualmente con rejectUnauthorized: false.
 *
 * Uso en cualquier parte del servidor:
 *   import { db } from '~/server/db';
 *   const allUsers = await db.select().from(schema.users);
 */
const rawUrl = process.env.DATABASE_URL!;
const requiresSSL = rawUrl.includes('sslmode=') || rawUrl.includes('ssl=');

// Eliminamos sslmode de la URL para que no sobreescriba nuestra config SSL
const connectionString = rawUrl.replace(/[?&](sslmode|ssl)=[^&]*/g, '');

const pool = new pg.Pool({
  connectionString,
  ssl: requiresSSL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
