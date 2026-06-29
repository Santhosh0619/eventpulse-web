import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

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
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }
  return <>{children}</>
}
