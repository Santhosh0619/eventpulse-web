import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { RecommendationSection } from '@/components/events/RecommendationSection'
import type { AiRecommendedEvent } from '@/types/recommendation'

function makeRec(id: string, reason: string | null): AiRecommendedEvent {
  return {
    event: {
      id,
      organization_id: 'o1',
      category_id: null,
      title: `Event ${id}`,
      slug: id,
      short_description: null,
      city: 'Pune',
      country: 'India',
      start_datetime: '2030-06-01T10:00:00Z',
      end_datetime: '2030-06-01T12:00:00Z',
      status: 'published',
      is_featured: false,
      cover_image_url: null,
    },
    reason,
    score: null,
  }
}

function renderSection(load: () => Promise<AiRecommendedEvent[]>) {
  return render(
    <MemoryRouter>
      <RecommendationSection title="Recommended for You" cacheKey="k" load={load} />
    </MemoryRouter>,
  )
}

describe('RecommendationSection', () => {
  it('renders recommended events with their reasons', async () => {
    const load = vi
      .fn()
      .mockResolvedValue([makeRec('e1', 'Matches your taste'), makeRec('e2', null)])
    renderSection(load)
    expect(await screen.findByText('Event e1')).toBeInTheDocument()
    expect(screen.getByText('Event e2')).toBeInTheDocument()
    expect(screen.getByText('Matches your taste')).toBeInTheDocument()
    expect(screen.getByText('Recommended for You')).toBeInTheDocument()
  })

  it('renders nothing when there are no recommendations', async () => {
    const load = vi.fn().mockResolvedValue([])
    renderSection(load)
    await waitFor(() =>
      expect(screen.queryByText('Recommended for You')).not.toBeInTheDocument(),
    )
  })

  it('renders nothing when the loader fails', async () => {
    const load = vi.fn().mockRejectedValue(new Error('boom'))
    renderSection(load)
    await waitFor(() =>
      expect(screen.queryByText('Recommended for You')).not.toBeInTheDocument(),
    )
  })
})
