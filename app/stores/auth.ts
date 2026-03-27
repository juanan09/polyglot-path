import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface AuthUser {
  id: string
  email: string
  name: string
}

/**
 * Store de autenticación.
 * Gestiona el estado de sesión del usuario (login/register/logout).
 * Los usuarios no autenticados pueden jugar como invitados (sin persistencia).
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id || null)

  /**
   * Obtiene el usuario actual de la sesión (cookie).
   * Debe llamarse al montar la app para restaurar la sesión.
   */
  async function fetchUser() {
    try {
      const response = await $fetch<{ user: AuthUser | null }>('/api/auth/me')
      user.value = response.user
    } catch {
      user.value = null
    }
  }

  /**
   * Registra un nuevo usuario con email, contraseña y nombre.
   */
  async function register(email: string, password: string, name?: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: { email, password, name },
      })
      user.value = response.user
      return true
    } catch (e: unknown) {
      const fetchError = e as { statusMessage?: string; data?: { statusMessage?: string }; message?: string }
      error.value = fetchError.data?.statusMessage || fetchError.statusMessage || fetchError.message || 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inicia sesión con email y contraseña.
   */
  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      user.value = response.user
      return true
    } catch (e: unknown) {
      const fetchError = e as { statusMessage?: string; data?: { statusMessage?: string }; message?: string }
      error.value = fetchError.data?.statusMessage || fetchError.statusMessage || fetchError.message || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cierra la sesión y limpia el estado.
   */
  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Silenciar errores de logout
    }
    user.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    userId,

    // Actions
    fetchUser,
    register,
    login,
    logout,
  }
})
