import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode, type ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { ResetPassword } from '@/pages/auth/ResetPassword'
import { VerifyEmail } from '@/pages/auth/VerifyEmail'
import { authService } from '@/services/authService'

vi.mock('@/services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
  },
}))

function renderAt(path: string, element: ReactElement, routePath: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ForgotPassword', () => {
  it('submits the email and shows a confirmation', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({} as never)
    renderAt('/forgot-password', <ForgotPassword />, '/forgot-password')

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(authService.forgotPassword).toHaveBeenCalledWith('a@b.com')
    expect(await screen.findByText(/reset link is on its way/i)).toBeInTheDocument()
  })
})

describe('ResetPassword', () => {
  it('shows an invalid-link message when the token is missing', () => {
    renderAt('/reset-password', <ResetPassword />, '/reset-password')
    expect(screen.getByText(/invalid reset link/i)).toBeInTheDocument()
  })

  it('submits the new password with the token from the query string', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue({} as never)
    renderAt('/reset-password?token=tok123', <ResetPassword />, '/reset-password')

    await userEvent.type(screen.getByLabelText('New password'), 'NewPass123!')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    expect(authService.resetPassword).toHaveBeenCalledWith('tok123', 'NewPass123!')
    expect(await screen.findByText(/password updated/i)).toBeInTheDocument()
  })
})

describe('VerifyEmail', () => {
  it('verifies the token and shows success', async () => {
    vi.mocked(authService.verifyEmail).mockResolvedValue({} as never)
    renderAt('/verify-email?token=v1', <VerifyEmail />, '/verify-email')

    expect(await screen.findByText(/email verified/i)).toBeInTheDocument()
    expect(authService.verifyEmail).toHaveBeenCalledWith('v1')
  })

  it('shows an error when verification fails', async () => {
    vi.mocked(authService.verifyEmail).mockRejectedValue({
      status: 400,
      message: 'Invalid or expired token',
    })
    renderAt('/verify-email?token=bad', <VerifyEmail />, '/verify-email')

    await waitFor(() =>
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument(),
    )
    expect(screen.getByText('Invalid or expired token')).toBeInTheDocument()
  })

  it('errors without calling the API when the token is missing', () => {
    renderAt('/verify-email', <VerifyEmail />, '/verify-email')
    expect(screen.getByText(/missing its token/i)).toBeInTheDocument()
    expect(authService.verifyEmail).not.toHaveBeenCalled()
  })

  it('verifies exactly once under StrictMode (double-invoke guard)', async () => {
    vi.mocked(authService.verifyEmail).mockResolvedValue({} as never)
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/verify-email?token=once']}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    )
    expect(await screen.findByText(/email verified/i)).toBeInTheDocument()
    expect(authService.verifyEmail).toHaveBeenCalledTimes(1)
  })
})
