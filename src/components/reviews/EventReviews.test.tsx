import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventReviews } from '@/components/reviews/EventReviews'
import { reviewService } from '@/services/reviewService'
import { useAuthStore } from '@/store/authStore'
import type { Review, ReviewSummary } from '@/types/review'

vi.mock('@/services/reviewService', () => ({
  reviewService: {
    getSummary: vi.fn(),
    listForEvent: vi.fn(),
    listForManagement: vi.fn(),
    submit: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    respond: vi.fn(),
    approve: vi.fn(),
  },
}))

function review(over: Partial<Review> = {}): Review {
  return {
    id: 'r1',
    event_id: 'e1',
    user_id: 'someone',
    rating: 5,
    title: 'Loved it',
    comment: 'Amazing event',
    is_visible: true,
    moderation_status: 'approved',
    organizer_response: null,
    responded_at: null,
    created_at: '2030-06-02T10:00:00Z',
    updated_at: '2030-06-02T10:00:00Z',
    ...over,
  }
}

const SUMMARY: ReviewSummary = {
  event_id: 'e1',
  total_reviews: 1,
  average_rating: 5,
  distribution: { '5': 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.getState().clear()
  vi.mocked(reviewService.getSummary).mockResolvedValue(SUMMARY)
})

function setUser(id: string) {
  useAuthStore.getState().setSession({ access: 'a', refresh: 'r' })
  useAuthStore.getState().setUser({
    id,
    email: `${id}@e.com`,
    role: 'attendee',
    is_active: true,
    is_verified: true,
  })
}

describe('EventReviews', () => {
  it('shows the summary and existing reviews', async () => {
    vi.mocked(reviewService.listForEvent).mockResolvedValue([review()])
    render(<EventReviews eventId="e1" canRespond={false} />)
    expect(await screen.findByText('Amazing event')).toBeInTheDocument()
    expect(screen.getByText(/1 review/)).toBeInTheDocument()
  })

  it('lets an authenticated user without a review submit one', async () => {
    setUser('u1')
    vi.mocked(reviewService.listForEvent).mockResolvedValue([review()]) // by someone else
    vi.mocked(reviewService.submit).mockResolvedValue(review({ user_id: 'u1' }))
    render(<EventReviews eventId="e1" canRespond={false} />)

    await screen.findByText('Amazing event')
    await userEvent.click(screen.getByRole('button', { name: '5 stars' }))
    await userEvent.click(screen.getByRole('button', { name: /submit review/i }))
    await waitFor(() =>
      expect(reviewService.submit).toHaveBeenCalledWith(
        'e1',
        expect.objectContaining({ rating: 5 }),
      ),
    )
  })

  it('shows edit/delete on the viewer’s own review and hides the submit form', async () => {
    setUser('u1')
    vi.mocked(reviewService.listForEvent).mockResolvedValue([review({ user_id: 'u1' })])
    render(<EventReviews eventId="e1" canRespond={false} />)

    await screen.findByText('Amazing event')
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /submit review/i }),
    ).not.toBeInTheDocument()
  })

  it('edits the viewer’s own review', async () => {
    setUser('u1')
    vi.mocked(reviewService.listForEvent).mockResolvedValue([review({ user_id: 'u1' })])
    vi.mocked(reviewService.update).mockResolvedValue(
      review({ user_id: 'u1', rating: 3 }),
    )
    render(<EventReviews eventId="e1" canRespond={false} />)

    await screen.findByText('Amazing event')
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    // Form pre-fills; change rating to 3 and save.
    await userEvent.click(screen.getByRole('button', { name: '3 stars' }))
    await userEvent.click(screen.getByRole('button', { name: /save review/i }))
    await waitFor(() =>
      expect(reviewService.update).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({ rating: 3 }),
      ),
    )
  })

  it('deletes the viewer’s own review', async () => {
    setUser('u1')
    vi.mocked(reviewService.listForEvent).mockResolvedValue([review({ user_id: 'u1' })])
    vi.mocked(reviewService.remove).mockResolvedValue()
    render(<EventReviews eventId="e1" canRespond={false} />)

    await screen.findByText('Amazing event')
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(reviewService.remove).toHaveBeenCalledWith('r1'))
  })

  it('surfaces an error when deleting fails', async () => {
    setUser('u1')
    vi.mocked(reviewService.listForEvent).mockResolvedValue([review({ user_id: 'u1' })])
    vi.mocked(reviewService.remove).mockRejectedValue({
      status: 403,
      message: 'You can only modify your own review',
    })
    render(<EventReviews eventId="e1" canRespond={false} />)

    await screen.findByText('Amazing event')
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText(/only modify your own review/i)).toBeInTheDocument()
  })

  it('lets an org member respond to a review', async () => {
    setUser('mgr')
    vi.mocked(reviewService.listForManagement).mockResolvedValue([review()])
    vi.mocked(reviewService.respond).mockResolvedValue(
      review({ organizer_response: 'Thanks!' }),
    )
    render(<EventReviews eventId="e1" canRespond={true} />)

    await screen.findByText('Amazing event')
    await userEvent.type(
      screen.getByLabelText('Organizer response'),
      'Thanks for coming',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Respond' }))
    await waitFor(() =>
      expect(reviewService.respond).toHaveBeenCalledWith('r1', 'Thanks for coming'),
    )
  })

  it('shows a flagged badge and lets an org member approve it', async () => {
    setUser('mgr')
    vi.mocked(reviewService.listForManagement).mockResolvedValue([
      review({ moderation_status: 'flagged', is_visible: false }),
    ])
    vi.mocked(reviewService.approve).mockResolvedValue(
      review({ moderation_status: 'approved', is_visible: true }),
    )
    render(<EventReviews eventId="e1" canRespond={true} />)

    await screen.findByText('Amazing event')
    expect(screen.getByText(/flagged by ai/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }))
    await waitFor(() => expect(reviewService.approve).toHaveBeenCalledWith('r1'))
  })

  it('uses the public list for non-organizers', async () => {
    vi.mocked(reviewService.listForEvent).mockResolvedValue([review()])
    render(<EventReviews eventId="e1" canRespond={false} />)
    await screen.findByText('Amazing event')
    expect(reviewService.listForEvent).toHaveBeenCalledWith('e1')
    expect(reviewService.listForManagement).not.toHaveBeenCalled()
  })
})
