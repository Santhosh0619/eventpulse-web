import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

function renderGuarded(roles?: string[]) {
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route
          path="/secret"
          element={
            <ProtectedRoute roles={roles}>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/403" element={<div>Forbidden page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function login(role: string) {
  useAuthStore.getState().setSession({ access: 'a', refresh: 'r' })
  useAuthStore.getState().setUser({
    id: 'u1',
    email: 'u@e.com',
    role,
    is_active: true,
    is_verified: true,
  })
}

beforeEach(() => useAuthStore.getState().clear())

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    renderGuarded()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders children for an authenticated user (no role requirement)', () => {
    login('attendee')
    renderGuarded()
    expect(screen.getByText('Secret content')).toBeInTheDocument()
  })

  it('renders children when the user has an allowed role', () => {
    login('admin')
    renderGuarded(['admin'])
    expect(screen.getByText('Secret content')).toBeInTheDocument()
  })

  it('redirects to /403 when the user lacks the required role', () => {
    login('attendee')
    renderGuarded(['admin'])
    expect(screen.getByText('Forbidden page')).toBeInTheDocument()
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument()
  })

  it('does NOT render role-gated content while the user record is still loading', () => {
    // Authenticated token but no user profile yet (mid-login window).
    useAuthStore.getState().setSession({ access: 'a', refresh: 'r' })
    renderGuarded(['admin'])
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument()
    expect(screen.queryByText('Forbidden page')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
