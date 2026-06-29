import { useEffect, useState } from 'react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import { notificationService } from '@/services/notificationService'
import type { ApiError } from '@/services/api'
import { useNotificationStore } from '@/store/notificationStore'
import type { AppNotification } from '@/types/notification'

/** Lists the user's notifications and lets them mark items (or all) as read. */
export function NotificationCenter() {
  const [items, setItems] = useState<AppNotification[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  useEffect(() => {
    let ignore = false
    notificationService
      .list()
      .then((list) => {
        if (ignore) return
        setItems(list)
        // Count from the full list. The backend returns all notifications (no
        // pagination); add windowing here AND switch to GET /unread-count if that
        // ever changes, or this would undercount the badge.
        setUnreadCount(list.filter((n) => !n.is_read).length)
      })
      .catch((err: ApiError) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [setUnreadCount])

  function applyUnread(list: AppNotification[]) {
    setItems(list)
    setUnreadCount(list.filter((n) => !n.is_read).length)
  }

  async function markRead(id: string) {
    if (!items) return
    try {
      const updated = await notificationService.markRead(id)
      applyUnread(items.map((n) => (n.id === id ? updated : n)))
    } catch {
      // ignore; the item stays unread
    }
  }

  async function markAllRead() {
    if (!items) return
    try {
      await notificationService.markAllRead()
      applyUnread(items.map((n) => ({ ...n, is_read: true })))
    } catch {
      // ignore
    }
  }

  const hasUnread = items?.some((n) => !n.is_read) ?? false

  return (
    <PageWrapper
      title="Notifications"
      actions={
        hasUnread ? (
          <Button variant="secondary" onClick={markAllRead}>
            Mark all read
          </Button>
        ) : undefined
      }
    >
      {error ? (
        <p className="py-16 text-center text-red-600">{error}</p>
      ) : items === null ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No notifications.</p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card
              key={n.id}
              className={cn(
                'flex items-start justify-between gap-3',
                !n.is_read && 'border-l-4 border-l-brand-500',
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  {!n.is_read && <Badge tone="brand">New</Badge>}
                </div>
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatDateTime(n.created_at)}
                </p>
              </div>
              {!n.is_read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                  Mark read
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
