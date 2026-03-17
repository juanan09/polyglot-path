import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitizer'

describe('sanitizer utility', () => {
  it('should trim whitespace from both ends', async () => {
    const result = await sanitizeInput('  hello world  ')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedText).toBe('hello world')
  })

  it('should reject input over 50 characters', async () => {
    const longInput = 'a'.repeat(51)
    const result = await sanitizeInput(longInput)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('too long')
  })

  it('should remove potentially dangerous characters', async () => {
    const result = await sanitizeInput('hello <script> " \' \\ /')
    expect(result.sanitizedText).toBe('hello script')
    expect(result.isValid).toBe(true)
  })

  it('should reject offensive language (banned words)', async () => {
    const result = await sanitizeInput('You are an idiot')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('inappropriate language')
  })

  it('should reject empty input or input with only invalid characters', async () => {
    const result = await sanitizeInput('<>')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('empty or contains invalid characters')
  })

  it('should allow valid sentences under 50 characters', async () => {
    const result = await sanitizeInput('Where is the bakery?')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedText).toBe('Where is the bakery?')
  })
})
