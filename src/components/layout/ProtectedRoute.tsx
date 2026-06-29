import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  /** Optional platform roles allowed to view the route (e.g. ['admin']). */
  roles?: string[]
}

/**
 * Gate a route behind authentication (and optionally a role). Unauthenticated
 * users are sent to /login (preserving the attempted path); authorized-but-
 * wrong-role users get /403.
 */
export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation()
  const isAuthed = useAuthStore((s) => s.isAuthenticated())
  const user = useAuthStore((s) => s.user)

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  // Role-gated route but the user record hasn't loaded yet (authed token without
  // a profile, e.g. mid-login): wait rather than render the gated content.
  if (roles && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }
  return <>{children}</>
}
