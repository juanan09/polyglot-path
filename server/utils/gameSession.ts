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
 * Dialog session manager using Nitro's in-memory storage.
 * Sessions maintain context so the LLM knows what has been discussed.
 */
export const getSessionId = (userId: string, npcId: string) => `session:${userId}:${npcId}`

/**
 * Retrieves an existing session or creates a new one if it doesn't exist.
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
 * Adds a message to the session and updates storage.
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
 * Deletes a session (e.g., when completing a mission or changing NPC).
 */
export async function clearGameSession(userId: string, npcId: string) {
  const storage = useStorage('cache:dialogue')
  const sessionId = getSessionId(userId, npcId)
  await storage.removeItem(sessionId)
}
