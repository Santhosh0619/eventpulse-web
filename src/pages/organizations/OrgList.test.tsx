import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrgList } from '@/pages/organizations/OrgList'
import { orgService } from '@/services/orgService'
import type { OrgWithRole } from '@/types/organization'

vi.mock('@/services/orgService', () => ({
  orgService: { listMine: vi.fn(), create: vi.fn() },
}))

function org(id: string, name: string): OrgWithRole {
  return {
    id,
    name,
    slug: id,
    description: null,
    logo_url: null,
    website: null,
    contact_email: 'o@e.com',
    is_verified: false,
    created_by: null,
    created_at: '2030-01-01T00:00:00Z',
    my_role: 'owner',
  }
}

beforeEach(() => vi.clearAllMocks())

function renderList() {
  return render(
    <MemoryRouter>
      <OrgList />
    </MemoryRouter>,
  )
}

describe('OrgList', () => {
  it('lists the user organizations', async () => {
    vi.mocked(orgService.listMine).mockResolvedValue([
      org('o1', 'Acme'),
      org('o2', 'Globex'),
    ])
    renderList()
    expect(await screen.findByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('Globex')).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    vi.mocked(orgService.listMine).mockResolvedValue([])
    renderList()
    expect(
      await screen.findByText(/don't belong to any organizations/i),
    ).toBeInTheDocument()
  })

  it('creates an organization from the form', async () => {
    vi.mocked(orgService.listMine).mockResolvedValue([])
    vi.mocked(orgService.create).mockResolvedValue(org('o9', 'New Org'))
    renderList()
    await screen.findByText(/don't belong/i)

    await userEvent.click(screen.getByRole('button', { name: /new organization/i }))
    await userEvent.type(screen.getByLabelText('Name'), 'New Org')
    await userEvent.type(screen.getByLabelText('Contact email'), 'n@e.com')
    await userEvent.click(screen.getByRole('button', { name: /create organization/i }))

    expect(orgService.create).toHaveBeenCalledWith({
      name: 'New Org',
      contact_email: 'n@e.com',
    })
  })
})
