import { api } from '@/services/api'
import type { Review, ReviewInput, ReviewSummary } from '@/types/review'

/** Event review API calls. */
export const reviewService = {
  async listForEvent(eventId: string): Promise<Review[]> {
    const { data } = await api.get<Review[]>(`/api/v1/events/${eventId}/reviews`)
    return data
  },

  async getSummary(eventId: string): Promise<ReviewSummary> {
    const { data } = await api.get<ReviewSummary>(
      `/api/v1/events/${eventId}/reviews/summary`,
    )
    return data
  },

  async submit(eventId: string, input: ReviewInput): Promise<Review> {
    const { data } = await api.post<Review>(`/api/v1/events/${eventId}/reviews`, input)
    return data
  },

  async update(reviewId: string, input: ReviewInput): Promise<Review> {
    const { data } = await api.put<Review>(`/api/v1/reviews/${reviewId}`, input)
    return data
  },

  async remove(reviewId: string): Promise<void> {
    await api.delete(`/api/v1/reviews/${reviewId}`)
  },

  async respond(reviewId: string, response: string): Promise<Review> {
    const { data } = await api.post<Review>(`/api/v1/reviews/${reviewId}/response`, {
      response,
    })
    return data
  },

  /** List ALL reviews for an event incl. hidden/flagged (org members). */
  async listForManagement(eventId: string): Promise<Review[]> {
    const { data } = await api.get<Review[]>(
      `/api/v1/events/${eventId}/reviews/management`,
    )
    return data
  },

  /** Approve a flagged review, making it public (org members). */
  async approve(reviewId: string): Promise<Review> {
    const { data } = await api.post<Review>(`/api/v1/reviews/${reviewId}/approve`)
    return data
  },
}
