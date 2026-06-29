import { api } from '@/services/api'
import type { Paginated } from '@/types/common'
import type { Category, Event, EventSearchParams, EventSummary } from '@/types/event'

/** Read-side API calls for events and categories. */
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
}
