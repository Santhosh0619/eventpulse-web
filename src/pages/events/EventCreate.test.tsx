import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventCreate } from '@/pages/events/EventCreate'
import { eventService } from '@/services/eventService'
import { orgService } from '@/services/orgService'

vi.mock('@/services/eventService', () => ({
  eventService: { listCategories: vi.fn(), create: vi.fn() },
}))
vi.mock('@/services/orgService', () => ({
  orgService: { listMine: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(eventService.listCategories).mockResolvedValue([])
})

function renderCreate() {
  return render(
    <MemoryRouter>
      <EventCreate />
    </MemoryRouter>,
  )
}

describe('EventCreate', () => {
  it('prompts to join an org when the user has none', async () => {
    vi.mocked(orgService.listMine).mockResolvedValue([])
    renderCreate()
    expect(await screen.findByText(/belong to an organization/i)).toBeInTheDocument()
  })

  it('walks the wizard and creates a draft event', async () => {
    vi.mocked(orgService.listMine).mockResolvedValue([
      {
        id: 'o1',
        name: 'My Org',
        slug: 'my-org',
        description: null,
        logo_url: null,
        website: null,
        contact_email: 'o@e.com',
        is_verified: true,
        created_by: null,
        created_at: '2030-01-01T00:00:00Z',
        my_role: 'owner',
      },
    ])
    vi.mocked(eventService.create).mockResolvedValue({ id: 'e1' } as never)
    renderCreate()

    // Step 1
    await screen.findByText('Step 1 of 3')
    await userEvent.type(screen.getByLabelText('Title'), 'Launch Party')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Step 2 — set the datetime-local fields
    await screen.findByText('Step 2 of 3')
    fireEvent.change(screen.getByLabelText('Starts'), {
      target: { value: '2030-06-01T10:00' },
    })
    fireEvent.change(screen.getByLabelText('Ends'), {
      target: { value: '2030-06-01T12:00' },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Step 3 — review + submit
    await screen.findByText('Step 3 of 3')
    await userEvent.click(screen.getByRole('button', { name: /create event/i }))

    await waitFor(() => expect(eventService.create).toHaveBeenCalledOnce())
    expect(vi.mocked(eventService.create).mock.calls[0][0]).toMatchObject({
      organization_id: 'o1',
      title: 'Launch Party',
    })
  })
})
