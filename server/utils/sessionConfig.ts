/**
 * Returns the H3 session configuration object with the application secret.
 * Used in all endpoints that need to read/write the session.
 */
export function getSessionConfig() {
  const config = useRuntimeConfig()
  const secret = config.sessionSecret || 'polyglot-path-session-secret-min-32-chars!'
  return { password: secret }
}
