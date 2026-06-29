import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventList } from '@/pages/events/EventList'
import { eventService } from '@/services/eventService'
import type { EventSummary } from '@/types/event'

vi.mock('@/services/eventService', () => ({
  eventService: { search: vi.fn(), listCategories: vi.fn() },
}))

function makeEvent(id: string, title: string): EventSummary {
  return {
    id,
    organization_id: 'o1',
    category_id: null,
    title,
    slug: id,
    short_description: null,
    city: 'Pune',
    country: 'India',
    start_datetime: '2030-06-01T10:00:00Z',
    end_datetime: '2030-06-01T12:00:00Z',
    status: 'published',
    is_featured: false,
    cover_image_url: null,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(eventService.listCategories).mockResolvedValue([])
})

function renderList() {
  return render(
    <MemoryRouter>
      <EventList />
    </MemoryRouter>,
  )
}

describe('EventList', () => {
  it('renders events returned by the service', async () => {
    vi.mocked(eventService.search).mockResolvedValue({
      items: [makeEvent('e1', 'Jazz Night'), makeEvent('e2', 'Tech Meetup')],
      total: 2,
      page: 1,
      limit: 12,
      pages: 1,
    })
    renderList()
    expect(await screen.findByText('Jazz Night')).toBeInTheDocument()
    expect(screen.getByText('Tech Meetup')).toBeInTheDocument()
  })

  it('shows an empty state when there are no events', async () => {
    vi.mocked(eventService.search).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 12,
      pages: 0,
    })
    renderList()
    expect(await screen.findByText(/no events found/i)).toBeInTheDocument()
  })

  it('requests the first page with a page size on initial load', async () => {
    vi.mocked(eventService.search).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 12,
      pages: 0,
    })
    renderList()
    await screen.findByText(/no events found/i)
    expect(eventService.search).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 12 }),
    )
  })

  it('renders an error state when the search fails', async () => {
    vi.mocked(eventService.search).mockRejectedValue({
      status: 500,
      message: 'Server error',
    })
    renderList()
    expect(await screen.findByText('Server error')).toBeInTheDocument()
  })
})
