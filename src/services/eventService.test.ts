import { describe, expect, it, vi } from 'vitest'

import { api } from '@/services/api'
import { eventService } from '@/services/eventService'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
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

  it('create posts the new event', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'e1' } })
    await eventService.create({
      organization_id: 'o1',
      title: 'New',
      start_datetime: '2030-06-01T10:00:00Z',
      end_datetime: '2030-06-01T12:00:00Z',
    })
    expect(api.post).toHaveBeenCalledWith(
      '/api/v1/events',
      expect.objectContaining({ organization_id: 'o1', title: 'New' }),
    )
  })

  it('update puts changed fields', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { id: 'e1' } })
    await eventService.update('e1', { title: 'Edited' })
    expect(api.put).toHaveBeenCalledWith('/api/v1/events/e1', { title: 'Edited' })
  })

  it('publish and cancel post to their action endpoints', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'e1' } })
    await eventService.publish('e1')
    expect(api.post).toHaveBeenCalledWith('/api/v1/events/e1/publish')
    await eventService.cancel('e1')
    expect(api.post).toHaveBeenCalledWith('/api/v1/events/e1/cancel')
  })

  it('remove deletes the event', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: undefined })
    await eventService.remove('e1')
    expect(api.delete).toHaveBeenCalledWith('/api/v1/events/e1')
  })

  it('generateDescription posts keywords (and tone) and returns the result', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { description: 'Great event', ai_generated: true },
    })
    const res = await eventService.generateDescription(['jazz', 'wine'], 'elegant')
    expect(api.post).toHaveBeenCalledWith('/api/v1/events/generate-description', {
      keywords: ['jazz', 'wine'],
      tone: 'elegant',
    })
    expect(res.description).toBe('Great event')
    expect(res.ai_generated).toBe(true)
  })

  it('generateDescription omits tone when not provided', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { description: 'x', ai_generated: false },
    })
    await eventService.generateDescription(['solo'])
    expect(api.post).toHaveBeenCalledWith('/api/v1/events/generate-description', {
      keywords: ['solo'],
    })
  })
})
