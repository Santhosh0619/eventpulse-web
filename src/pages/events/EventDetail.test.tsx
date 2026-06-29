import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventDetail } from '@/pages/events/EventDetail'
import { eventService } from '@/services/eventService'
import { orgService } from '@/services/orgService'
import { useAuthStore } from '@/store/authStore'
import type { Event } from '@/types/event'

vi.mock('@/services/eventService', () => ({
  eventService: { getById: vi.fn(), publish: vi.fn() },
}))
vi.mock('@/services/orgService', () => ({
  orgService: { listMine: vi.fn() },
}))

const EVENT: Event = {
  id: 'e1',
  organization_id: 'o1',
  category_id: null,
  title: 'Jazz Night',
  slug: 'jazz-night',
  short_description: null,
  description: 'An evening of jazz.',
  venue_name: 'Blue Room',
  venue_address: null,
  city: 'Pune',
  country: 'India',
  latitude: null,
  longitude: null,
  start_datetime: '2030-06-01T10:00:00Z',
  end_datetime: '2030-06-01T12:00:00Z',
  timezone: 'UTC',
  status: 'published',
  is_featured: false,
  cover_image_url: null,
  max_capacity: null,
  tags: ['music'],
  created_at: '2030-01-01T00:00:00Z',
  updated_at: '2030-01-01T00:00:00Z',
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/events/e1']}>
      <Routes>
        <Route path="/events/:eventId" element={<EventDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.getState().clear()
  vi.mocked(orgService.listMine).mockResolvedValue([])
})

describe('EventDetail', () => {
  it('renders the event once loaded', async () => {
    vi.mocked(eventService.getById).mockResolvedValue(EVENT)
    renderDetail()
    expect(await screen.findByText('Jazz Night')).toBeInTheDocument()
    expect(screen.getByText('An evening of jazz.')).toBeInTheDocument()
    expect(screen.getByText('Blue Room')).toBeInTheDocument()
    expect(screen.getByText('music')).toBeInTheDocument()
    expect(eventService.getById).toHaveBeenCalledWith('e1')
  })

  it('hides organizer actions for non-members', async () => {
    vi.mocked(eventService.getById).mockResolvedValue(EVENT)
    renderDetail()
    await screen.findByText('Jazz Night')
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('lets a member of the event org publish a draft', async () => {
    useAuthStore.getState().setSession({ access: 'a', refresh: 'r' })
    const draft = { ...EVENT, status: 'draft' as const }
    vi.mocked(eventService.getById).mockResolvedValue(draft)
    vi.mocked(orgService.listMine).mockResolvedValue([
      {
        id: 'o1',
        name: 'Org',
        slug: 'org',
        contact_email: 'o@e.com',
        is_verified: true,
        created_at: '2030-01-01T00:00:00Z',
        my_role: 'owner',
      },
    ])
    vi.mocked(eventService.publish).mockResolvedValue({
      ...draft,
      status: 'published',
    })
    renderDetail()

    const publishBtn = await screen.findByRole('button', { name: 'Publish' })
    await userEvent.click(publishBtn)
    await waitFor(() => expect(eventService.publish).toHaveBeenCalledWith('e1'))
    // Local state updates from the response: status badge flips to published.
    expect(await screen.findByText('published')).toBeInTheDocument()
  })

  it('shows a not-found message on a 404', async () => {
    vi.mocked(eventService.getById).mockRejectedValue({ status: 404, message: 'nope' })
    renderDetail()
    expect(await screen.findByText(/event not found/i)).toBeInTheDocument()
  })
})
