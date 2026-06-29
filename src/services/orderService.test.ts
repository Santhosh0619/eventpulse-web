import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/services/api'
import { orderService } from '@/services/orderService'
import { ticketService } from '@/services/ticketService'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe('orderService', () => {
  it('create posts the order payload', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'o1' } })
    await orderService.create({
      event_id: 'e1',
      items: [{ ticket_type_id: 't1', quantity: 2 }],
    })
    expect(api.post).toHaveBeenCalledWith('/api/v1/orders', {
      event_id: 'e1',
      items: [{ ticket_type_id: 't1', quantity: 2 }],
    })
  })

  it('getById, listMine, and cancel hit the right paths', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    await orderService.getById('o1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/orders/o1')
    await orderService.listMine()
    expect(api.get).toHaveBeenCalledWith('/api/v1/users/me/orders')
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await orderService.cancel('o1')
    expect(api.post).toHaveBeenCalledWith('/api/v1/orders/o1/cancel')
  })
})

describe('ticketService', () => {
  it('getAvailability requests the event availability', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { tiers: [] } })
    await ticketService.getAvailability('e1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/events/e1/availability')
  })
})
