import { describe, it, expect } from 'vitest';
import { mapErrorToUserFriendlyMessage } from './errorMapper';

describe('errorMapper utility', () => {
  it('should map 429 status code to a friendly message', () => {
    const error = { statusCode: 429 };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('sistema está un poco saturado');
  });

  it('should map "Quota exceeded" message to a friendly message', () => {
    const error = { message: 'Quota exceeded for metric: generativelanguage...' };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('sistema está un poco saturado');
  });

  it('should map safety-related errors to a friendly message', () => {
    const error = { message: 'The content is blocked due to safety guidelines' };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('NPC no se siente cómodo');
  });

  it('should map 503 errors to a friendly message', () => {
    const error = { statusCode: 503 };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('problema de conexión');
  });

  it('should use the original message for unknown 400 errors', () => {
    const error = { statusCode: 400, message: 'Custom validation error' };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toBe('Custom validation error');
  });

  it('should return a generic message for unknown 500 errors', () => {
    const error = { statusCode: 500 };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('hipo técnico');
  });
});
