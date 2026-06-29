import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

/** Top navigation bar with brand, primary links, and session controls. */
export function Navbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAuthed = useAuthStore((s) => s.isAuthenticated())

  async function handleLogout() {
    await authService.logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-surface-border bg-white">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold text-brand-600">
          EventPulse
        </Link>
        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-gray-700 hover:text-brand-600"
              >
                Dashboard
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
