import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createTestingPinia } from '@pinia/testing'
import HomeButton from '~/components/game/HomeButton.vue'
import { useAuthStore } from '~/stores/auth'

// Mocking Nuxt Router
vi.mock('#app', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original as Record<string, unknown>,
    useRouter: () => ({
      push: vi.fn()
    })
  }
})

describe('HomeButton.vue', () => {
  let pinia: ReturnType<typeof createTestingPinia>

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })
  })

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(HomeButton, {
      global: { plugins: [pinia] }
    })
    expect(wrapper.find('.home-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('Menu')
  })

  it('shows basic menu items (HOME and CODEX)', async () => {
    const wrapper = await mountSuspended(HomeButton, {
      global: { plugins: [pinia] }
    })

    // items es una propiedad computada interna, pero podemos verificarla
    // a través del objeto subyacente si lo necesitamos o simplemente
    // confiando en que el componente UDropdownMenu recibe los items correctos.
    const dropdown = wrapper.findComponent({ name: 'UDropdownMenu' })
    const items = dropdown.props('items')

    expect(items.some((i: { label: string }) => i.label === 'HOME')).toBe(true)
    expect(items.some((i: { label: string }) => i.label === 'LEARNING CODEX')).toBe(true)
  })

  it('shows REGISTER item when user is not authenticated', async () => {
    const authStore = useAuthStore()
    authStore.user = null

    const wrapper = await mountSuspended(HomeButton, {
      global: { plugins: [pinia] }
    })

    const dropdown = wrapper.findComponent({ name: 'UDropdownMenu' })
    const items = dropdown.props('items')

    expect(items.some((i: { label: string }) => i.label === 'REGISTER / LOGIN')).toBe(true)
  })

  it('hides REGISTER item when user is authenticated', async () => {
    const authStore = useAuthStore()
    authStore.user = { id: '1', email: 'test@test.com', name: 'Test User' }

    const wrapper = await mountSuspended(HomeButton, {
      global: { plugins: [pinia] }
    })

    const dropdown = wrapper.findComponent({ name: 'UDropdownMenu' })
    const items = dropdown.props('items')

    expect(items.some((i: { label: string }) => i.label === 'REGISTER / LOGIN')).toBe(false)
  })
})
