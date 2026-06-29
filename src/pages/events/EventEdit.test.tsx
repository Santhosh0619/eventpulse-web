import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventEdit } from '@/pages/events/EventEdit'
import { eventService } from '@/services/eventService'
import type { Event } from '@/types/event'

vi.mock('@/services/eventService', () => ({
  eventService: { getById: vi.fn(), update: vi.fn() },
}))

const EVENT: Event = {
  id: 'e1',
  organization_id: 'o1',
  category_id: null,
  title: 'Old Title',
  slug: 'old',
  short_description: null,
  description: null,
  venue_name: 'Hall',
  venue_address: null,
  city: 'Pune',
  country: 'India',
  latitude: null,
  longitude: null,
  start_datetime: '2030-06-01T10:00:00Z',
  end_datetime: '2030-06-01T12:00:00Z',
  timezone: 'UTC',
  status: 'draft',
  is_featured: false,
  cover_image_url: null,
  max_capacity: null,
  tags: [],
  created_at: '2030-01-01T00:00:00Z',
  updated_at: '2030-01-01T00:00:00Z',
}

beforeEach(() => vi.clearAllMocks())

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/events/e1/edit']}>
      <Routes>
        <Route path="/events/:eventId/edit" element={<EventEdit />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EventEdit', () => {
  it('loads the event and saves edited fields', async () => {
    vi.mocked(eventService.getById).mockResolvedValue(EVENT)
    vi.mocked(eventService.update).mockResolvedValue({ ...EVENT, title: 'New Title' })
    renderEdit()

    const titleInput = await screen.findByLabelText('Title')
    expect(titleInput).toHaveValue('Old Title')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'New Title')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(eventService.update).toHaveBeenCalledOnce())
    expect(vi.mocked(eventService.update).mock.calls[0]).toEqual([
      'e1',
      expect.objectContaining({ title: 'New Title' }),
    ])
  })

  it('shows a not-found message on a 404', async () => {
    vi.mocked(eventService.getById).mockRejectedValue({ status: 404, message: 'x' })
    renderEdit()
    expect(await screen.findByText(/event not found/i)).toBeInTheDocument()
  })
})
