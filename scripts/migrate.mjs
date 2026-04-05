/**
 * 🔄 Script de migraciones manual para DigitalOcean.
 *
 * drizzle-kit siempre ejecuta CREATE SCHEMA IF NOT EXISTS,
 * lo cual falla en las BD Dev de DigitalOcean (sin permisos).
 * Este script aplica los .sql de migraciones directamente
 * y gestiona el tracking en una tabla en el schema public.
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  await client.connect();
  console.log('📡 Connected to database');

  // Crear tabla de tracking en public (sin CREATE SCHEMA)
  await client.query(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL UNIQUE,
      created_at BIGINT
    )
  `);

  // Obtener migraciones ya aplicadas
  const { rows: applied } = await client.query('SELECT hash FROM "__drizzle_migrations"');
  const appliedHashes = new Set(applied.map(r => r.hash));

  // Leer archivos de migración
  const migrationsDir = path.resolve(__dirname, '../server/db/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let appliedCount = 0;

  for (const file of files) {
    if (appliedHashes.has(file)) {
      console.log(`⏭️  Already applied: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`▶️  Applying: ${file}`);

    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)',
        [file, Date.now()]
      );
      await client.query('COMMIT');
      console.log(`✅ Applied: ${file}`);
      appliedCount++;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  }

  await client.end();
  console.log(`\n🎉 Done! ${appliedCount} migration(s) applied.`);
}

migrate().catch(e => {
  console.error('❌ Migration failed:', e);
  process.exit(1);
});
