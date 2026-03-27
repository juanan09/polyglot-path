import { getRequestIP, createError, type H3Event } from 'h3'

const MAX_ATTEMPTS = 5
const BLOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

interface RateLimitData {
  attempts: number
  blockedUntil: number
}

/**
 * Utility to manage rate limiting for sensitive endpoints (login, register).
 */
export default {
  /**
   * Checks if an IP is currently blocked.
   * Throws a 429 error if it is.
   */
  async check(event: H3Event, action: string) {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const storage = useStorage('cache')
    const key = `rate-limit:${action}:${ip}`
    
    const data = await storage.getItem<RateLimitData>(key)
    
    if (data && data.blockedUntil > Date.now()) {
      const remainingMinutes = Math.ceil((data.blockedUntil - Date.now()) / 60000)
      throw createError({
        statusCode: 429,
        statusMessage: `Too many attempts. Please try again in ${remainingMinutes} minutes.`
      })
    }
  },

  /**
   * Records a failed attempt for an IP.
   * Blocks the IP if it reaches the threshold.
   */
  async recordFailure(event: H3Event, action: string) {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const storage = useStorage('cache')
    const key = `rate-limit:${action}:${ip}`
    
    const data = await storage.getItem<RateLimitData>(key) || { attempts: 0, blockedUntil: 0 }
    
    data.attempts += 1
    
    if (data.attempts >= MAX_ATTEMPTS) {
      data.blockedUntil = Date.now() + BLOCK_DURATION_MS
    }
    
    // Store for 24 hours to track persistent abusers, but blockedUntil handles the actual lockout
    await storage.setItem(key, data, { ttl: 24 * 60 * 60 })
  },

  /**
   * Resets the attempt counter for an IP (e.g., after a successful login).
   */
  async reset(event: H3Event, action: string) {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const storage = useStorage('cache')
    const key = `rate-limit:${action}:${ip}`
    
    await storage.removeItem(key)
  }
}
