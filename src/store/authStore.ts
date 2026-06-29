import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** The authenticated user's account (mirrors the backend UserRead schema). */
export interface AuthUser {
  id: string
  email: string
  role: string
  is_active: boolean
  is_verified: boolean
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  setSession: (tokens: { access: string; refresh: string }) => void
  setUser: (user: AuthUser | null) => void
  clear: () => void
  isAuthenticated: () => boolean
}

/**
 * Authentication state, persisted to localStorage so a page reload keeps the
 * session. Tokens are read by the Axios client to attach the Authorization
 * header and to drive 401 auto-refresh.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: ({ access, refresh }) =>
        set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, accessToken: null, refreshToken: null }),
      isAuthenticated: () => Boolean(get().accessToken),
    }),
    { name: 'eventpulse-auth' },
  ),
)
