import { api } from '@/services/api'
import type { Paginated } from '@/types/common'
import type {
  Category,
  Event,
  EventCreateInput,
  EventSearchParams,
  EventSummary,
  EventUpdateInput,
} from '@/types/event'

/** API calls for events and categories. */
export const eventService = {
  async search(params: EventSearchParams): Promise<Paginated<EventSummary>> {
    const { data } = await api.get<Paginated<EventSummary>>('/api/v1/events', {
      params,
    })
    return data
  },

  async getById(id: string): Promise<Event> {
    const { data } = await api.get<Event>(`/api/v1/events/${id}`)
    return data
  },

  async getBySlug(slug: string): Promise<Event> {
    const { data } = await api.get<Event>(`/api/v1/events/slug/${slug}`)
    return data
  },

  async listCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/api/v1/categories')
    return data
  },

  /** AI-generate an event description from keywords (Gemini, with fallback). */
  async generateDescription(
    keywords: string[],
    tone?: string,
  ): Promise<{ description: string; ai_generated: boolean }> {
    const { data } = await api.post<{ description: string; ai_generated: boolean }>(
      '/api/v1/events/generate-description',
      { keywords, ...(tone ? { tone } : {}) },
    )
    return data
  },

  async create(input: EventCreateInput): Promise<Event> {
    const { data } = await api.post<Event>('/api/v1/events', input)
    return data
  },

  async update(id: string, input: EventUpdateInput): Promise<Event> {
    const { data } = await api.put<Event>(`/api/v1/events/${id}`, input)
    return data
  },

  async publish(id: string): Promise<Event> {
    const { data } = await api.post<Event>(`/api/v1/events/${id}/publish`)
    return data
  },

  async cancel(id: string): Promise<Event> {
    const { data } = await api.post<Event>(`/api/v1/events/${id}/cancel`)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/v1/events/${id}`)
  },
}
