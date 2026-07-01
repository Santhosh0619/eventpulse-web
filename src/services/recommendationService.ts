import { api } from '@/services/api'
import type { AiRecommendedEvent } from '@/types/recommendation'

/** API calls for AI-powered event recommendations (Gemini-backed). */
export const recommendationService = {
  /** Personalized "Recommended for You" feed for the authenticated user. */
  async getForMe(limit = 8): Promise<AiRecommendedEvent[]> {
    const { data } = await api.get<AiRecommendedEvent[]>(
      '/api/v1/recommendations/for-me',
      { params: { limit } },
    )
    return data
  },

  /** Events similar to a given event (public). */
  async getSimilar(eventId: string, limit = 6): Promise<AiRecommendedEvent[]> {
    const { data } = await api.get<AiRecommendedEvent[]>(
      `/api/v1/events/${eventId}/similar`,
      { params: { limit } },
    )
    return data
  },
}
