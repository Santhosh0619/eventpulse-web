import { describe, expect, it, vi } from 'vitest'

import { api } from '@/services/api'
import { eventService } from '@/services/eventService'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn() },
}))

describe('eventService', () => {
  it('search forwards query params and returns the page', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { items: [], total: 0, page: 1, limit: 12, pages: 0 },
    })
    const res = await eventService.search({ page: 2, q: 'music' })
    expect(api.get).toHaveBeenCalledWith('/api/v1/events', {
      params: { page: 2, q: 'music' },
    })
    expect(res.page).toBe(1)
  })

  it('getById requests the event by id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { id: 'e1', title: 'X' } })
    const event = await eventService.getById('e1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/events/e1')
    expect(event.title).toBe('X')
  })

  it('listCategories requests the categories endpoint', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    await eventService.listCategories()
    expect(api.get).toHaveBeenCalledWith('/api/v1/categories')
  })
})
