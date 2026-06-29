// This is the route config (exports `router`), not a fast-refresh component module.
/* eslint-disable react-refresh/only-export-components */
/* oxlint-disable react/only-export-components */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Spinner } from '@/components/ui/Spinner'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { ResetPassword } from '@/pages/auth/ResetPassword'
import { VerifyEmail } from '@/pages/auth/VerifyEmail'
import { Checkout } from '@/pages/checkout/Checkout'
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { EventCreate } from '@/pages/events/EventCreate'
import { EventDetail } from '@/pages/events/EventDetail'
import { EventEdit } from '@/pages/events/EventEdit'
import { EventList } from '@/pages/events/EventList'
import { Forbidden } from '@/pages/Forbidden'
import { MyOrders } from '@/pages/orders/MyOrders'
import { OrderDetail } from '@/pages/orders/OrderDetail'
import { NotificationCenter } from '@/pages/notifications/NotificationCenter'

// Lazy-loaded so the heavy Recharts bundle stays out of the initial chunk.
const EventAnalytics = lazy(() =>
  import('@/pages/analytics/EventAnalytics').then((m) => ({
    default: m.EventAnalytics,
  })),
)

/** Suspense fallback for lazily-loaded routes. */
function RouteFallback() {
  return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  )
}
import { InvitationAccept } from '@/pages/organizations/InvitationAccept'
import { OrgDetail } from '@/pages/organizations/OrgDetail'
import { OrgList } from '@/pages/organizations/OrgList'
import { NotFound } from '@/pages/NotFound'

/**
 * Application routes. Public auth pages live under AuthLayout; authenticated
 * pages under DashboardLayout, each guarded by ProtectedRoute.
 */
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/verify-email', element: <VerifyEmail /> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/', element: <Navigate to="/events" replace /> },
      { path: '/events', element: <EventList /> },
      {
        path: '/events/new',
        element: (
          <ProtectedRoute>
            <EventCreate />
          </ProtectedRoute>
        ),
      },
      { path: '/events/:eventId', element: <EventDetail /> },
      {
        path: '/events/:eventId/checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders',
        element: (
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders/:orderId',
        element: (
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/events/:eventId/edit',
        element: (
          <ProtectedRoute>
            <EventEdit />
          </ProtectedRoute>
        ),
      },
      {
        path: '/events/:eventId/analytics',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <EventAnalytics />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/notifications',
        element: (
          <ProtectedRoute>
            <NotificationCenter />
          </ProtectedRoute>
        ),
      },
      {
        path: '/organizations',
        element: (
          <ProtectedRoute>
            <OrgList />
          </ProtectedRoute>
        ),
      },
      {
        path: '/organizations/:orgId',
        element: (
          <ProtectedRoute>
            <OrgDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/invitations/:token/accept',
        element: (
          <ProtectedRoute>
            <InvitationAccept />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '/403', element: <Forbidden /> },
  { path: '*', element: <NotFound /> },
])
