import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Dialecto de la base de datos
  dialect: 'postgresql',

  // Ruta a los archivos de esquema (glob para todos los .ts en schema/)
  schema: './server/db/schema/*.ts',

  // Carpeta donde se guardarán las migraciones generadas
  out: './server/db/migrations',

  // Credenciales de conexión a la BD (usa DATABASE_URL del .env)
  // SSL necesario para bases de datos gestionadas (DigitalOcean)
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },

  // Opciones adicionales
  verbose: true,  // Muestra SQL detallado en consola
  strict: true,   // Pide confirmación antes de ejecutar cambios destructivos

  // Usa el schema 'public' para la tabla de tracking de migraciones.
  // Las BD Dev de DigitalOcean no permiten CREATE SCHEMA.
  migrations: {
    schema: 'public',
  },
});
