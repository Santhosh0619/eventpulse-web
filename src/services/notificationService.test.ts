import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/services/api'
import { notificationService } from '@/services/notificationService'

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), put: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('notificationService', () => {
  it('list hits the notifications endpoint', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    await notificationService.list()
    expect(api.get).toHaveBeenCalledWith('/api/v1/notifications')
  })

  it('unreadCount returns the unread number', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { unread: 4 } })
    expect(await notificationService.unreadCount()).toBe(4)
    expect(api.get).toHaveBeenCalledWith('/api/v1/notifications/unread-count')
  })

  it('markRead and markAllRead hit the right paths', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await notificationService.markRead('n1')
    expect(api.put).toHaveBeenCalledWith('/api/v1/notifications/n1/read')
    await notificationService.markAllRead()
    expect(api.put).toHaveBeenCalledWith('/api/v1/notifications/read-all')
  })
})
