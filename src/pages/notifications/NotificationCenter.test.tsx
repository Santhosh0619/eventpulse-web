import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotificationCenter } from '@/pages/notifications/NotificationCenter'
import { notificationService } from '@/services/notificationService'
import { useNotificationStore } from '@/store/notificationStore'
import type { AppNotification } from '@/types/notification'

vi.mock('@/services/notificationService', () => ({
  notificationService: { list: vi.fn(), markRead: vi.fn(), markAllRead: vi.fn() },
}))

function notif(over: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 'n1',
    type: 'order_confirmed',
    title: 'Order confirmed',
    message: 'Your order is confirmed.',
    data: {},
    channel: 'in_app',
    is_read: false,
    read_at: null,
    created_at: '2030-06-01T10:00:00Z',
    ...over,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  useNotificationStore.getState().setUnreadCount(0)
})

describe('NotificationCenter', () => {
  it('lists notifications and reflects the unread count in the store', async () => {
    vi.mocked(notificationService.list).mockResolvedValue([
      notif({ id: 'n1' }),
      notif({ id: 'n2', is_read: true, title: 'Reminder' }),
    ])
    render(<NotificationCenter />)
    expect(await screen.findByText('Order confirmed')).toBeInTheDocument()
    await waitFor(() => expect(useNotificationStore.getState().unreadCount).toBe(1))
  })

  it('marks a single notification read and decrements the count', async () => {
    vi.mocked(notificationService.list).mockResolvedValue([notif({ id: 'n1' })])
    vi.mocked(notificationService.markRead).mockResolvedValue(
      notif({ id: 'n1', is_read: true }),
    )
    render(<NotificationCenter />)
    await screen.findByText('Order confirmed')

    await userEvent.click(screen.getByRole('button', { name: 'Mark read' }))
    await waitFor(() => expect(notificationService.markRead).toHaveBeenCalledWith('n1'))
    await waitFor(() => expect(useNotificationStore.getState().unreadCount).toBe(0))
  })

  it('marks all read', async () => {
    vi.mocked(notificationService.list).mockResolvedValue([
      notif({ id: 'n1', title: 'First' }),
      notif({ id: 'n2', title: 'Second' }),
    ])
    vi.mocked(notificationService.markAllRead).mockResolvedValue()
    render(<NotificationCenter />)
    await screen.findByText('First')

    await userEvent.click(screen.getByRole('button', { name: /mark all read/i }))
    await waitFor(() => expect(notificationService.markAllRead).toHaveBeenCalledOnce())
    await waitFor(() => expect(useNotificationStore.getState().unreadCount).toBe(0))
  })

  it('shows an empty state', async () => {
    vi.mocked(notificationService.list).mockResolvedValue([])
    render(<NotificationCenter />)
    expect(await screen.findByText(/no notifications/i)).toBeInTheDocument()
  })
})
