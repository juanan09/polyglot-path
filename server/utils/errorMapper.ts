/**
 * Utility to map technical errors to user-friendly messages.
 */

export function mapErrorToUserFriendlyMessage(error: unknown): string {
  const err = error as { message?: string; statusCode?: number; status?: number };
  const message = err?.message || '';
  const status = err?.statusCode || err?.status || 500;

  // 1. Quota Errors (Rate Limit) from Google Gemini
  if (status === 429 || message.includes('Too Many Requests') || message.includes('Quota exceeded')) {
    return 'The system is a bit busy. Please wait a minute before speaking to the NPC again.';
  }

  // 2. Google Safety Errors (Gemini internal filters)
  if (message.includes('safety') || message.includes('blocked')) {
    return 'The NPC doesn\'t feel comfortable answering that. Please try saying something different.';
  }

  // 3. Network or Model Server Errors
  if (message.includes('fetch') || message.includes('network') || status === 503) {
    return 'It seems there is a connection problem with the NPC\'s brain. Please try again in a few seconds.';
  }

  // 4. Generic errors
  if (status >= 500) {
    return 'The server has had a small technical hiccup. If it persists, try restarting the chat.';
  }

  return message || 'An unexpected error has occurred. Please try again.';
}
