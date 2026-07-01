import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/services/api'
import { reviewService } from '@/services/reviewService'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe('reviewService', () => {
  it('list and summary hit the event review paths', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    await reviewService.listForEvent('e1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/events/e1/reviews')
    await reviewService.getSummary('e1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/events/e1/reviews/summary')
  })

  it('submit posts a review to the event', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'r1' } })
    await reviewService.submit('e1', { rating: 5, comment: 'Great' })
    expect(api.post).toHaveBeenCalledWith('/api/v1/events/e1/reviews', {
      rating: 5,
      comment: 'Great',
    })
  })

  it('update, remove, and respond hit the review paths', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await reviewService.update('r1', { rating: 4 })
    expect(api.put).toHaveBeenCalledWith('/api/v1/reviews/r1', { rating: 4 })
    vi.mocked(api.delete).mockResolvedValue({ data: undefined })
    await reviewService.remove('r1')
    expect(api.delete).toHaveBeenCalledWith('/api/v1/reviews/r1')
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await reviewService.respond('r1', 'Thanks!')
    expect(api.post).toHaveBeenCalledWith('/api/v1/reviews/r1/response', {
      response: 'Thanks!',
    })
  })

  it('listForManagement fetches all reviews incl. hidden', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    await reviewService.listForManagement('e1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/events/e1/reviews/management')
  })

  it('approve posts to the approve endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await reviewService.approve('r1')
    expect(api.post).toHaveBeenCalledWith('/api/v1/reviews/r1/approve')
  })
})
