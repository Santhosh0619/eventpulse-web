import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

/** Top navigation bar with brand, primary links, notifications, and session controls. */
export function Navbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAuthed = useAuthStore((s) => s.isAuthenticated())
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  useEffect(() => {
    if (!isAuthed) return
    let ignore = false
    notificationService
      .unreadCount()
      .then((n) => !ignore && setUnreadCount(n))
      .catch(() => undefined)
    return () => {
      ignore = true
    }
  }, [isAuthed, setUnreadCount])

  async function handleLogout() {
    await authService.logout()
    setUnreadCount(0)
    navigate('/login')
  }

  return (
    <header className="border-b border-surface-border bg-white">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <Link to="/" className="text-lg font-bold text-brand-600">
            EventPulse
          </Link>
          <Link to="/events" className="text-sm text-gray-700 hover:text-brand-600">
            Events
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-gray-700 hover:text-brand-600"
              >
                Dashboard
              </Link>
              <Link
                to="/organizations"
                className="text-sm text-gray-700 hover:text-brand-600"
              >
                Organizations
              </Link>
              <Link to="/orders" className="text-sm text-gray-700 hover:text-brand-600">
                My orders
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm text-gray-700 hover:text-brand-600"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/notifications"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                className="relative text-lg text-gray-700 hover:text-brand-600"
              >
                <span aria-hidden="true">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[0.65rem] font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <span className="text-sm text-gray-500">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Log in</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
