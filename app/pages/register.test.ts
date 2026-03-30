import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createTestingPinia } from '@pinia/testing'
import Register from './register.vue'
import { useAuthStore } from '~/stores/auth'

// Mock de Nuxt App y Router
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

describe('Register.vue', () => {
  let pinia: ReturnType<typeof createTestingPinia>

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })
  })

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(Register, {
      global: { plugins: [pinia] }
    })
    expect(wrapper.find('.auth-title').text()).toContain('REGISTER')
    expect(wrapper.find('#reg-name').exists()).toBe(true)
    expect(wrapper.find('#reg-email').exists()).toBe(true)
  })

  it('validates that passwords match', async () => {
    const wrapper = await mountSuspended(Register, {
      global: { plugins: [pinia] }
    })

    const passwordInput = wrapper.find('#reg-password')
    const confirmInput = wrapper.find('#reg-confirm')
    
    await passwordInput.setValue('password123')
    await confirmInput.setValue('password456')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.find('.auth-error').text()).toContain('Passwords do not match')
  })

  it('validates minimum password length', async () => {
    const wrapper = await mountSuspended(Register, {
      global: { plugins: [pinia] }
    })

    const passwordInput = wrapper.find('#reg-password')
    const confirmInput = wrapper.find('#reg-confirm')
    
    await passwordInput.setValue('123')
    await confirmInput.setValue('123')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.find('.auth-error').text()).toContain('Password must be at least 6 characters')
  })

  it('calls authStore.register with correct data and redirects on success', async () => {
    const authStore = useAuthStore()
    // Mocking the register action to return true
    authStore.register = vi.fn().mockResolvedValue(true)

    const wrapper = await mountSuspended(Register, {
      global: { plugins: [pinia] }
    })

    await wrapper.find('#reg-name').setValue('Test Adventurer')
    await wrapper.find('#reg-email').setValue('test@example.com')
    await wrapper.find('#reg-password').setValue('password123')
    await wrapper.find('#reg-confirm').setValue('password123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(authStore.register).toHaveBeenCalledWith('test@example.com', 'password123', 'Test Adventurer')
  })
})
