import { describe, expect, it } from 'vitest'
import { resolveGuard } from '../index'

function route(meta = {}, name = 'some-route', fullPath = '/some-route') {
  return { meta, name, fullPath }
}

function auth({ isAuthenticated = false, mustChangePassword = false } = {}) {
  return { isAuthenticated, mustChangePassword }
}

describe('resolveGuard', () => {
  it('sends unauthenticated users away from protected routes, remembering where they were headed', () => {
    const result = resolveGuard(route({ requiresAuth: true }, 'activities', '/activities/5'), auth())
    expect(result).toEqual({ name: 'login', query: { redirect: '/activities/5' } })
  })

  it('lets unauthenticated users through to public routes', () => {
    expect(resolveGuard(route({}, 'checkin'), auth())).toBe(true)
  })

  it('lets authenticated users through to protected routes', () => {
    expect(resolveGuard(route({ requiresAuth: true }), auth({ isAuthenticated: true }))).toBe(true)
  })

  it('bounces authenticated users away from guest-only routes (login/register)', () => {
    const result = resolveGuard(route({ guestOnly: true }, 'login'), auth({ isAuthenticated: true }))
    expect(result).toEqual({ name: 'activities' })
  })

  it('lets guests reach guest-only routes', () => {
    expect(resolveGuard(route({ guestOnly: true }, 'login'), auth())).toBe(true)
  })

  it('forces an authenticated user who must change their password to the change-password route', () => {
    const result = resolveGuard(
      route({ requiresAuth: true }, 'activities'),
      auth({ isAuthenticated: true, mustChangePassword: true })
    )
    expect(result).toEqual({ name: 'change-password' })
  })

  it('does not redirect-loop when already headed to change-password', () => {
    const result = resolveGuard(
      route({ requiresAuth: true }, 'change-password'),
      auth({ isAuthenticated: true, mustChangePassword: true })
    )
    expect(result).toBe(true)
  })

  it('does not force a password change for guests (no session yet)', () => {
    const result = resolveGuard(route({}, 'checkin'), auth({ isAuthenticated: false, mustChangePassword: true }))
    expect(result).toBe(true)
  })
})
