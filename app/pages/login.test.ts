import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createTestingPinia } from '@pinia/testing'
import Login from './login.vue'
import { useAuthStore } from '~/stores/auth'

// Mock de Nuxt App, Router y Head
vi.mock('#app', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original as Record<string, unknown>,
    useRouter: () => ({
      push: vi.fn()
    }),
    useHead: vi.fn()
  }
})

describe('Login.vue', () => {
  let pinia: ReturnType<typeof createTestingPinia>

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })
  })

  it('renders login form correctly', async () => {
    const wrapper = await mountSuspended(Login, {
      global: { plugins: [pinia] }
    })
    expect(wrapper.find('.auth-title').text()).toContain('LOGIN')
    expect(wrapper.find('#login-email').exists()).toBe(true)
    expect(wrapper.find('#login-password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('ENTER THE REALM')
  })

  it('calls authStore.login with credentials and handles success', async () => {
    const authStore = useAuthStore()
    // Explicitly mocking the login action to return true (success)
    authStore.login = vi.fn().mockResolvedValue(true)

    const wrapper = await mountSuspended(Login, {
      global: { plugins: [pinia] }
    })

    await wrapper.find('#login-email').setValue('hero@eldoria.com')
    await wrapper.find('#login-password').setValue('password123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(authStore.login).toHaveBeenCalledWith('hero@eldoria.com', 'password123')
  })

  it('displays auth error message when login fails', async () => {
    const authStore = useAuthStore()
    authStore.error = 'Invalid credentials' // Injecting an error into the state

    const wrapper = await mountSuspended(Login, {
      global: { plugins: [pinia] }
    })

    const errorMsg = wrapper.find('.auth-error')
    expect(errorMsg.exists()).toBe(true)
    expect(errorMsg.text()).toContain('Invalid credentials')
  })

  it('shows loading state on button when authStore.isLoading is true', async () => {
    const authStore = useAuthStore()
    authStore.isLoading = true

    const wrapper = await mountSuspended(Login, {
      global: { plugins: [pinia] }
    })

    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.text()).toContain('LOADING...')
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })
})
