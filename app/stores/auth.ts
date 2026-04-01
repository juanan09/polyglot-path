import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface AuthUser {
  id: string
  email: string
  name: string
}

/**
 * Authentication Store.
 * Manages user session state (login/register/logout).
 * Unauthenticated users can play as guests (without persistence).
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id || null)

  /**
   * Retrieves the current user from the session (cookie).
   * Should be called on app mount to restore session.
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
   * Registers a new user with email, password, and name.
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
   * Logs in with email and password.
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
   * Logs out and clears the state.
   */
  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Silence logout errors
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
