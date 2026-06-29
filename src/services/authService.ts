import { api } from '@/services/api'
import { useAuthStore, type AuthUser } from '@/store/authStore'

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

/** Authentication API calls wired to the backend's /auth and /users endpoints. */
export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const { data } = await api.post<TokenResponse>('/api/v1/auth/login', {
      email,
      password,
    })
    useAuthStore
      .getState()
      .setSession({ access: data.access_token, refresh: data.refresh_token })
    return authService.fetchCurrentUser()
  },

  async register(input: {
    email: string
    password: string
    first_name: string
    last_name: string
  }): Promise<void> {
    await api.post('/api/v1/auth/register', input)
  },

  async fetchCurrentUser(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/api/v1/users/me')
    useAuthStore.getState().setUser(data)
    return data
  },

  async logout(): Promise<void> {
    const { refreshToken, clear } = useAuthStore.getState()
    try {
      if (refreshToken) {
        await api.post('/api/v1/auth/logout', { refresh_token: refreshToken })
      }
    } finally {
      clear()
    }
  },

  forgotPassword(email: string) {
    return api.post('/api/v1/auth/forgot-password', { email })
  },

  resetPassword(token: string, newPassword: string) {
    return api.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    })
  },

  verifyEmail(token: string) {
    return api.post('/api/v1/auth/verify-email', { token })
  },
}
