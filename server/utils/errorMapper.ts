/**
 * Utilidad para mapear errores técnicos a mensajes amigables para el usuario.
 */

export function mapErrorToUserFriendlyMessage(error: unknown): string {
  const err = error as { message?: string; statusCode?: number; status?: number };
  const message = err?.message || '';
  const status = err?.statusCode || err?.status || 500;

  // 1. Errores de Cuota (Rate Limit) de Google Gemini
  if (status === 429 || message.includes('Too Many Requests') || message.includes('Quota exceeded')) {
    return 'El sistema está un poco saturado. Por favor, espera un minuto antes de volver a hablar con el NPC.';
  }

  // 2. Errores de Seguridad de Google (Filtros internos de Gemini)
  if (message.includes('safety') || message.includes('blocked')) {
    return 'El NPC no se siente cómodo respondiendo a eso. Por favor, intenta decir algo diferente.';
  }

  // 3. Errores de Red o Servidor del modelo
  if (message.includes('fetch') || message.includes('network') || status === 503) {
    return 'Parece que hay un problema de conexión con el cerebro del NPC. Reinténtalo en unos segundos.';
  }

  // 4. Errores genéricos
  if (status >= 500) {
    return 'El servidor ha tenido un pequeño hipo técnico. Si persiste, prueba a reiniciar el chat.';
  }

  return message || 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
}
