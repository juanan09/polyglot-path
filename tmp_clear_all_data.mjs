import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

async function clearAllData() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('--- RESETEANDO BASE DE DATOS (PROCESO DE PRUEBAS REALES) ---');

        // Al borrar 'users', el CASCADE se encarga de vaciar automáticamente:
        // player_progress, player_missions, player_inventory, dialogue_history, player_completed_stories, player_vocabulary, player_errors.
        await client.query('TRUNCATE TABLE "users" CASCADE;');

        console.log('✅ Todas las tablas se han vaciado (Vía TRUNCATE CASCADE)');
        console.log('✅ Cuentas de usuario borradas');
        console.log('✅ Progreso, misiones e inventarios borrados');

        console.log('--- SISTEMA LISTO PARA PRUEBAS LIMPIAS ---');
    } catch (err) {
        console.error('❌ Error en el reseteo:', err.message);
    } finally {
        await client.end();
    }
}

clearAllData();
