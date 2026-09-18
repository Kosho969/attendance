import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('../../lib/api', () => ({
  default: { post: vi.fn(), put: vi.fn(), get: vi.fn() },
}))

import api from '../../lib/api'
import { useAuthStore } from '../auth'

const USER = { id: 1, name: 'Ana', email: 'ana@example.com', must_change_password: false }

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('useAuthStore', () => {
  it('starts unauthenticated with no session in localStorage', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
  })

  it('restores a session already present in localStorage', () => {
    localStorage.setItem('auth_token', 'stored-token')
    localStorage.setItem('auth_user', JSON.stringify(USER))

    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user.email).toBe('ana@example.com')
  })

  it('login stores the token and user, and persists them', async () => {
    api.post.mockResolvedValueOnce({ data: { token: 'abc123', user: USER } })
    const auth = useAuthStore()

    await auth.login({ email: 'ana@example.com', password: 'secret' })

    expect(api.post).toHaveBeenCalledWith('/login', { email: 'ana@example.com', password: 'secret' })
    expect(auth.token).toBe('abc123')
    expect(auth.isAuthenticated).toBe(true)
    expect(localStorage.getItem('auth_token')).toBe('abc123')
    expect(JSON.parse(localStorage.getItem('auth_user'))).toEqual(USER)
  })

  it('register stores the returned session the same way login does', async () => {
    api.post.mockResolvedValueOnce({ data: { token: 'xyz', user: USER } })
    const auth = useAuthStore()

    await auth.register({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'secret123',
      password_confirmation: 'secret123',
    })

    expect(api.post).toHaveBeenCalledWith('/register', {
      name: 'Ana',
      email: 'ana@example.com',
      password: 'secret123',
      password_confirmation: 'secret123',
    })
    expect(auth.token).toBe('xyz')
  })

  it('logout clears the session even if the API call fails', async () => {
    api.post.mockRejectedValueOnce(new Error('network error'))
    const auth = useAuthStore()
    auth.setSession('abc123', USER)

    await expect(auth.logout()).rejects.toThrow('network error')

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('changePassword updates the stored user without touching the token', async () => {
    const updatedUser = { ...USER, must_change_password: false }
    api.put.mockResolvedValueOnce({ data: updatedUser })
    const auth = useAuthStore()
    auth.setSession('abc123', { ...USER, must_change_password: true })

    await auth.changePassword({
      current_password: 'old',
      password: 'newpassword123',
      password_confirmation: 'newpassword123',
    })

    expect(api.put).toHaveBeenCalledWith('/user/password', {
      current_password: 'old',
      password: 'newpassword123',
      password_confirmation: 'newpassword123',
    })
    expect(auth.token).toBe('abc123') // unchanged
    expect(auth.user.must_change_password).toBe(false)
    expect(JSON.parse(localStorage.getItem('auth_user')).must_change_password).toBe(false)
  })

  it('mustChangePassword getter reflects the current user', () => {
    const auth = useAuthStore()
    auth.setSession('abc123', { ...USER, must_change_password: true })
    expect(auth.mustChangePassword).toBe(true)

    auth.setUser({ ...USER, must_change_password: false })
    expect(auth.mustChangePassword).toBe(false)
  })
})
