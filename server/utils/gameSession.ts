export interface Message {
  role: 'user' | 'model' | 'system'
  content: string
}

export interface GameSession {
  userId: string
  npcId: string
  messages: Message[]
  updatedAt: number
}

/**
 * Gestor de sesiones de diálogo usando el almacenamiento en memoria de Nitro.
 * Las sesiones permiten mantener el contexto para que el LLM sepa de qué se ha hablado.
 */
export const getSessionId = (userId: string, npcId: string) => `session:${userId}:${npcId}`

/**
 * Obtiene una sesión existente o crea una nueva si no existe.
 */
export async function getOrCreateSession(userId: string, npcId: string): Promise<GameSession> {
  const storage = useStorage('cache:dialogue')
  const sessionId = getSessionId(userId, npcId)
  
  const existingSession = await storage.getItem<GameSession>(sessionId)
  
  if (existingSession) {
    return existingSession
  }
  
  const newSession: GameSession = {
    userId,
    npcId,
    messages: [],
    updatedAt: Date.now()
  }
  
  await storage.setItem(sessionId, newSession)
  return newSession
}

/**
 * Añade un mensaje a la sesión y actualiza el almacenamiento.
 */
export async function addMessageToSession(userId: string, npcId: string, role: Message['role'], content: string) {
  const storage = useStorage('cache:dialogue')
  const sessionId = getSessionId(userId, npcId)
  const session = await getOrCreateSession(userId, npcId)
  
  session.messages.push({ role, content })
  session.updatedAt = Date.now()
  
  await storage.setItem(sessionId, session)
  return session
}

/**
 * Borra una sesión (por ejemplo, al terminar una misión o cambiar de NPC).
 */
export async function clearGameSession(userId: string, npcId: string) {
  const storage = useStorage('cache:dialogue')
  const sessionId = getSessionId(userId, npcId)
  await storage.removeItem(sessionId)
}
