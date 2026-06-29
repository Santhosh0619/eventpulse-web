import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InvitationAccept } from '@/pages/organizations/InvitationAccept'
import { orgService } from '@/services/orgService'

vi.mock('@/services/orgService', () => ({
  orgService: { acceptInvitation: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

function renderAccept() {
  return render(
    <MemoryRouter initialEntries={['/invitations/tok123/accept']}>
      <Routes>
        <Route path="/invitations/:token/accept" element={<InvitationAccept />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('InvitationAccept', () => {
  it('accepts the invitation and shows success', async () => {
    vi.mocked(orgService.acceptInvitation).mockResolvedValue({
      organization_id: 'o1',
    } as never)
    renderAccept()
    expect(await screen.findByText(/invitation accepted/i)).toBeInTheDocument()
    expect(orgService.acceptInvitation).toHaveBeenCalledWith('tok123')
  })

  it('shows an error when acceptance fails', async () => {
    vi.mocked(orgService.acceptInvitation).mockRejectedValue({
      status: 404,
      message: 'Invitation not found or already used',
    })
    renderAccept()
    await waitFor(() =>
      expect(screen.getByText(/couldn't accept invitation/i)).toBeInTheDocument(),
    )
  })
})
