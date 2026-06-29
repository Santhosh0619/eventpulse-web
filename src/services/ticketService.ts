import { api } from '@/services/api'
import type { Availability } from '@/types/ticket'

/** Ticket availability API calls. */
export const ticketService = {
  async getAvailability(eventId: string): Promise<Availability> {
    const { data } = await api.get<Availability>(
      `/api/v1/events/${eventId}/availability`,
    )
    return data
  },
}
