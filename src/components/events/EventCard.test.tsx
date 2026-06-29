import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { EventCard } from '@/components/events/EventCard'
import type { EventSummary } from '@/types/event'

const EVENT: EventSummary = {
  id: 'e1',
  organization_id: 'o1',
  category_id: null,
  title: 'Jazz Night',
  slug: 'jazz-night',
  short_description: 'An evening of jazz',
  city: 'Pune',
  country: 'India',
  start_datetime: '2030-06-01T10:00:00Z',
  end_datetime: '2030-06-01T12:00:00Z',
  status: 'published',
  is_featured: false,
  cover_image_url: null,
}

describe('EventCard', () => {
  it('shows the title, status, and links to the detail page', () => {
    render(
      <MemoryRouter>
        <EventCard event={EVENT} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Jazz Night')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
    expect(screen.getByText('Pune')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/events/e1')
  })
})
