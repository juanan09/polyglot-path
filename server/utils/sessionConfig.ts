/**
 * Devuelve el objeto de configuración de sesión H3 con el secreto de la aplicación.
 * Utilizado en todos los endpoints que necesitan leer/escribir la sesión.
 */
export function getSessionConfig() {
  const config = useRuntimeConfig()
  const secret = config.sessionSecret || 'polyglot-path-session-secret-min-32-chars!'
  return { password: secret }
}
