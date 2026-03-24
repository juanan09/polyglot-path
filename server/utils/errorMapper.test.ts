import { describe, it, expect } from 'vitest';
import { mapErrorToUserFriendlyMessage } from './errorMapper';

describe('errorMapper utility', () => {
  it('should map 429 status code to a friendly message', () => {
    const error = { statusCode: 429 };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('The system is a bit busy. Please wait a minute before speaking to the NPC again.');
  });

  it('should map "Quota exceeded" message to a friendly message', () => {
    const error = { message: 'Quota exceeded for metric: generativelanguage...' };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('The system is a bit busy. Please wait a minute before speaking to the NPC again.');
  });

  it('should map safety-related errors to a friendly message', () => {
    const error = { message: 'The content is blocked due to safety guidelines' };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('The NPC doesn\'t feel comfortable answering that. Please try saying something different.');
  });

  it('should map 503 errors to a friendly message', () => {
    const error = { statusCode: 503 };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('It seems there is a connection problem with the NPC\'s brain. Please try again in a few seconds.');
  });

  it('should use the original message for unknown 400 errors', () => {
    const error = { statusCode: 400, message: 'Custom validation error' };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toBe('Custom validation error');
  });

  it('should return a generic message for unknown 500 errors', () => {
    const error = { statusCode: 500 };
    const result = mapErrorToUserFriendlyMessage(error);
    expect(result).toContain('The server has had a small technical hiccup. If it persists, try restarting the chat.');
  });
});
