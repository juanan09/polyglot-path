/**
 * Utilidad para mapear errores técnicos a mensajes amigables para el usuario.
 */

export function mapErrorToUserFriendlyMessage(error: unknown): string {
  const err = error as { message?: string; statusCode?: number; status?: number };
  const message = err?.message || '';
  const status = err?.statusCode || err?.status || 500;

  // 1. Errores de Cuota (Rate Limit) de Google Gemini
  if (status === 429 || message.includes('Too Many Requests') || message.includes('Quota exceeded')) {
    return 'The system is a bit busy. Please wait a minute before speaking to the NPC again.';
  }

  // 2. Errores de Seguridad de Google (Filtros internos de Gemini)
  if (message.includes('safety') || message.includes('blocked')) {
    return 'The NPC doesn\'t feel comfortable answering that. Please try saying something different.';
  }

  // 3. Errores de Red o Servidor del modelo
  if (message.includes('fetch') || message.includes('network') || status === 503) {
    return 'It seems there is a connection problem with the NPC\'s brain. Please try again in a few seconds.';
  }

  // 4. Errores genéricos
  if (status >= 500) {
    return 'The server has had a small technical hiccup. If it persists, try restarting the chat.';
  }

  return message || 'An unexpected error has occurred. Please try again.';
}
