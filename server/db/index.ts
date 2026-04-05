import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

/**
 * Cliente de conexión a la base de datos PostgreSQL.
 *
 * Usa la variable de entorno DATABASE_URL definida en .env
 * y carga todos los esquemas para habilitar el API relacional de Drizzle.
 *
 * En producción (DigitalOcean), usa SSL con certificado auto-firmado.
 * En desarrollo local, SSL está deshabilitado.
 *
 * Uso en cualquier parte del servidor:
 *   import { db } from '~/server/db';
 *   const allUsers = await db.select().from(schema.users);
 */
const isProduction = process.env.NODE_ENV === 'production';

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  },
  schema,
});
