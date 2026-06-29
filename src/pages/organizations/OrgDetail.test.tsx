import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrgDetail } from '@/pages/organizations/OrgDetail'
import { orgService } from '@/services/orgService'
import { useAuthStore } from '@/store/authStore'
import type { Member, Organization } from '@/types/organization'

vi.mock('@/services/orgService', () => ({
  orgService: {
    get: vi.fn(),
    listMembers: vi.fn(),
    invite: vi.fn(),
    changeMemberRole: vi.fn(),
    removeMember: vi.fn(),
    remove: vi.fn(),
  },
}))

const ORG: Organization = {
  id: 'o1',
  name: 'Acme',
  slug: 'acme',
  description: 'We do things',
  logo_url: null,
  website: null,
  contact_email: 'o@e.com',
  is_verified: true,
  created_by: 'u1',
  created_at: '2030-01-01T00:00:00Z',
}

const OWNER: Member = {
  id: 'm1',
  organization_id: 'o1',
  user_id: 'u1',
  role: 'owner',
  invited_email: null,
  invitation_status: 'accepted',
  joined_at: '2030-01-01T00:00:00Z',
}

const MEMBER2: Member = {
  id: 'm2',
  organization_id: 'o1',
  user_id: 'u2',
  role: 'member',
  invited_email: 'm2@e.com',
  invitation_status: 'accepted',
  joined_at: '2030-01-02T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.getState().clear()
  useAuthStore.getState().setUser({
    id: 'u1',
    email: 'u1@e.com',
    role: 'organizer',
    is_active: true,
    is_verified: true,
  })
})

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/organizations/o1']}>
      <Routes>
        <Route path="/organizations/:orgId" element={<OrgDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OrgDetail', () => {
  it('renders org info and members, with owner controls', async () => {
    vi.mocked(orgService.get).mockResolvedValue(ORG)
    vi.mocked(orgService.listMembers).mockResolvedValue([OWNER])
    renderDetail()

    expect(await screen.findByText('We do things')).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
    // Owner sees the invite form and danger zone.
    expect(screen.getByLabelText('Invite by email')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /delete organization/i }),
    ).toBeInTheDocument()
  })

  it('invites a member and reloads the list', async () => {
    vi.mocked(orgService.get).mockResolvedValue(ORG)
    vi.mocked(orgService.listMembers).mockResolvedValue([OWNER])
    vi.mocked(orgService.invite).mockResolvedValue()
    renderDetail()

    await screen.findByLabelText('Invite by email')
    await userEvent.type(screen.getByLabelText('Invite by email'), 'new@e.com')
    await userEvent.click(screen.getByRole('button', { name: 'Invite' }))

    await waitFor(() =>
      expect(orgService.invite).toHaveBeenCalledWith('o1', 'new@e.com', 'member'),
    )
    // listMembers called once on load + once after invite.
    expect(orgService.listMembers).toHaveBeenCalledTimes(2)
  })

  it('hides management controls for a plain member', async () => {
    vi.mocked(orgService.get).mockResolvedValue(ORG)
    vi.mocked(orgService.listMembers).mockResolvedValue([{ ...OWNER, role: 'member' }])
    renderDetail()

    await screen.findByText('Members')
    expect(screen.queryByLabelText('Invite by email')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /delete organization/i }),
    ).not.toBeInTheDocument()
  })

  it('does not show role/remove controls on the owner’s own row', async () => {
    vi.mocked(orgService.get).mockResolvedValue(ORG)
    vi.mocked(orgService.listMembers).mockResolvedValue([OWNER, MEMBER2])
    renderDetail()

    await screen.findByText('Members')
    expect(screen.getByLabelText('Role for m2@e.com')).toBeInTheDocument()
    expect(screen.queryByLabelText('Role for u1')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(1)
  })

  it('removes another member and reloads', async () => {
    vi.mocked(orgService.get).mockResolvedValue(ORG)
    vi.mocked(orgService.listMembers).mockResolvedValue([OWNER, MEMBER2])
    vi.mocked(orgService.removeMember).mockResolvedValue()
    renderDetail()

    await screen.findByText('Members')
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    await waitFor(() =>
      expect(orgService.removeMember).toHaveBeenCalledWith('o1', 'u2'),
    )
    expect(orgService.listMembers).toHaveBeenCalledTimes(2)
  })

  it('surfaces a backend error when an action fails', async () => {
    vi.mocked(orgService.get).mockResolvedValue(ORG)
    vi.mocked(orgService.listMembers).mockResolvedValue([OWNER, MEMBER2])
    vi.mocked(orgService.removeMember).mockRejectedValue({
      status: 409,
      message: 'An organization must have at least one owner',
    })
    renderDetail()

    await screen.findByText('Members')
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(await screen.findByText(/at least one owner/i)).toBeInTheDocument()
  })

  it('confirms before deleting the organization', async () => {
    vi.mocked(orgService.get).mockResolvedValue(ORG)
    vi.mocked(orgService.listMembers).mockResolvedValue([OWNER])
    vi.mocked(orgService.remove).mockResolvedValue()
    renderDetail()

    await screen.findByText('Members')
    await userEvent.click(screen.getByRole('button', { name: /delete organization/i }))
    expect(orgService.remove).not.toHaveBeenCalled()
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(orgService.remove).toHaveBeenCalledWith('o1'))
  })
})
