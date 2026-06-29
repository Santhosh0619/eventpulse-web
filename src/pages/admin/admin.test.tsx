import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminOrganizations } from '@/pages/admin/AdminOrganizations'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { adminService } from '@/services/adminService'
import type { AdminOrg, AdminUser } from '@/types/admin'
import type { Paginated } from '@/types/common'

vi.mock('@/services/adminService', () => ({
  adminService: {
    dashboard: vi.fn(),
    listUsers: vi.fn(),
    updateUser: vi.fn(),
    listOrganizations: vi.fn(),
    verifyOrganization: vi.fn(),
  },
}))

function page<T>(items: T[]): Paginated<T> {
  return { items, total: items.length, page: 1, limit: 20, pages: 1 }
}

beforeEach(() => vi.clearAllMocks())

describe('AdminDashboard', () => {
  it('renders platform metrics', async () => {
    vi.mocked(adminService.dashboard).mockResolvedValue({
      total_users: 42,
      total_organizations: 5,
      unverified_organizations: 2,
      total_events: 10,
      draft_events: 3,
      total_orders: 7,
      total_audit_logs: 99,
    })
    render(<AdminDashboard />)
    expect(await screen.findByText('42')).toBeInTheDocument()
    expect(screen.getByText('Unverified orgs')).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
  })
})

const USER: AdminUser = {
  id: 'u1',
  email: 'a@b.com',
  role: 'attendee',
  is_active: true,
  is_verified: true,
  created_at: '2030-01-01T00:00:00Z',
}

describe('AdminUsers', () => {
  it('changes a user role via the service', async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue(page([USER]))
    vi.mocked(adminService.updateUser).mockResolvedValue({ ...USER, role: 'organizer' })
    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    )
    await screen.findByText('a@b.com')
    await userEvent.selectOptions(
      screen.getByLabelText('Role for a@b.com'),
      'organizer',
    )
    await waitFor(() =>
      expect(adminService.updateUser).toHaveBeenCalledWith('u1', { role: 'organizer' }),
    )
  })

  it('toggles active status', async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue(page([USER]))
    vi.mocked(adminService.updateUser).mockResolvedValue({ ...USER, is_active: false })
    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    )
    await screen.findByText('a@b.com')
    await userEvent.click(screen.getByRole('button', { name: 'Deactivate' }))
    await waitFor(() =>
      expect(adminService.updateUser).toHaveBeenCalledWith('u1', { is_active: false }),
    )
  })
})

const ORG: AdminOrg = {
  id: 'o1',
  name: 'Acme',
  slug: 'acme',
  contact_email: 'o@e.com',
  is_verified: false,
  created_at: '2030-01-01T00:00:00Z',
}

describe('AdminOrganizations', () => {
  it('verifies an organization', async () => {
    vi.mocked(adminService.listOrganizations).mockResolvedValue(page([ORG]))
    vi.mocked(adminService.verifyOrganization).mockResolvedValue({
      ...ORG,
      is_verified: true,
    })
    render(
      <MemoryRouter>
        <AdminOrganizations />
      </MemoryRouter>,
    )
    await screen.findByText('Acme')
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }))
    await waitFor(() =>
      expect(adminService.verifyOrganization).toHaveBeenCalledWith('o1'),
    )
  })
})
