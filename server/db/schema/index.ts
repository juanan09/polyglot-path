/**
 * Barrel export de todos los esquemas de la base de datos.
 * Importa desde aquí para acceder a todas las tablas:
 *   import { users, playerProgress, ... } from '~/server/db/schema';
 */
export { users } from './users';
export { playerProgress } from './playerProgress';
export { playerInventory } from './playerInventory';
export { playerVocabulary } from './playerVocabulary';
export { playerMissions } from './playerMissions';
export { dialogueHistory } from './dialogueHistory';
export { playerErrors } from './playerErrors';
