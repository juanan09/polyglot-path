import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'

describe('Auth Store', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchMock = vi.fn() as any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('$fetch', fetchMock)
    fetchMock.mockClear()
  })

  it('has initial state for unauthenticated user', () => {
    const auth = useAuthStore()
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.userId).toBeNull()
    expect(auth.isLoading).toBe(false)
    expect(auth.error).toBeNull()
  })

  it('fetchUser sets user on success', async () => {
    const mockUser = { id: '123', email: 'test@test.com', name: 'Tester' }
    fetchMock.mockResolvedValueOnce({ user: mockUser })

    const auth = useAuthStore()
    await auth.fetchUser()

    expect(auth.user).toEqual(mockUser)
    expect(auth.isAuthenticated).toBe(true)
  })

  it('fetchUser sets user to null on failure', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Unauthorized'))

    const auth = useAuthStore()
    auth.user = { id: '1', email: 'a@a.com', name: 'A' } // Pre-set to test override
    await auth.fetchUser()

    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })

  it('register performs request and sets state', async () => {
    const mockUser = { id: '123', email: 'test@test.com', name: 'Tester' }
    fetchMock.mockResolvedValueOnce({ success: true, user: mockUser })

    const auth = useAuthStore()
     
    const result = await auth.register('test@test.com', 'password', 'Tester')

    expect(result).toBe(true)
    expect(auth.user).toEqual(mockUser)
    expect(auth.isLoading).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
       
      body: { email: 'test@test.com', password: 'password', name: 'Tester' }
    })
  })

  it('login performs request and sets state', async () => {
    const mockUser = { id: '123', email: 'test@test.com', name: 'Tester' }
    fetchMock.mockResolvedValueOnce({ success: true, user: mockUser })

    const auth = useAuthStore()
     
    const result = await auth.login('test@test.com', 'password')

    expect(result).toBe(true)
    expect(auth.user).toEqual(mockUser)
  })

  it('logout performs request and clears user', async () => {
    fetchMock.mockResolvedValueOnce({ success: true })

    const auth = useAuthStore()
    auth.user = { id: '123', email: 'test@test.com', name: 'Tester' }
    
    await auth.logout()

    expect(auth.user).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
  })
})
