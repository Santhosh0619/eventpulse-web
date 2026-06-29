import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Navbar } from '@/components/layout/Navbar'
import { NotificationCenter } from '@/pages/notifications/NotificationCenter'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import type { AppNotification } from '@/types/notification'

vi.mock('@/services/notificationService', () => ({
  notificationService: {
    list: vi.fn(),
    unreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  },
}))

const UNREAD: AppNotification = {
  id: 'n1',
  type: 'order_confirmed',
  title: 'Order confirmed',
  message: 'Your order is confirmed.',
  data: {},
  channel: 'in_app',
  is_read: false,
  read_at: null,
  created_at: '2030-06-01T10:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  useNotificationStore.getState().setUnreadCount(0)
  useAuthStore.getState().clear()
  useAuthStore.getState().setSession({ access: 'a', refresh: 'r' })
  useAuthStore.getState().setUser({
    id: 'u1',
    email: 'u1@e.com',
    role: 'attendee',
    is_active: true,
    is_verified: true,
  })
})

describe('notification badge ↔ center', () => {
  it('updates the Navbar unread badge when a notification is marked read', async () => {
    vi.mocked(notificationService.unreadCount).mockResolvedValue(1)
    vi.mocked(notificationService.list).mockResolvedValue([UNREAD])
    vi.mocked(notificationService.markRead).mockResolvedValue({
      ...UNREAD,
      is_read: true,
      read_at: '2030-06-01T11:00:00Z',
    })

    render(
      <MemoryRouter>
        <Navbar />
        <NotificationCenter />
      </MemoryRouter>,
    )

    // Badge shows 1 (shared store, seeded by either Navbar fetch or the list).
    const bell = await screen.findByRole('link', { name: /notifications/i })
    expect(within(bell).getByText('1')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Mark read' }))

    // After reading, the store hits 0 and the badge disappears.
    await waitFor(() => expect(within(bell).queryByText('1')).not.toBeInTheDocument())
  })
})
