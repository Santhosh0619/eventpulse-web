import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/store/authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clear()
  })

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('becomes authenticated once a session is set', () => {
    useAuthStore.getState().setSession({ access: 'a.b.c', refresh: 'r.e.f' })
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
    expect(useAuthStore.getState().accessToken).toBe('a.b.c')
  })

  it('clears the session and user', () => {
    useAuthStore.getState().setSession({ access: 'a', refresh: 'r' })
    useAuthStore.getState().setUser({
      id: '1',
      email: 'x@y.z',
      role: 'organizer',
      is_active: true,
      is_verified: true,
    })
    useAuthStore.getState().clear()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })
})
