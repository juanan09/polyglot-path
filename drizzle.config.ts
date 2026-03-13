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
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Opciones adicionales
  verbose: true,  // Muestra SQL detallado en consola
  strict: true,   // Pide confirmación antes de ejecutar cambios destructivos
});
