import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventDetail } from '@/pages/events/EventDetail'
import { eventService } from '@/services/eventService'
import type { Event } from '@/types/event'

vi.mock('@/services/eventService', () => ({
  eventService: { getById: vi.fn() },
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

beforeEach(() => vi.clearAllMocks())

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

  it('shows a not-found message on a 404', async () => {
    vi.mocked(eventService.getById).mockRejectedValue({ status: 404, message: 'nope' })
    renderDetail()
    expect(await screen.findByText(/event not found/i)).toBeInTheDocument()
  })
})
