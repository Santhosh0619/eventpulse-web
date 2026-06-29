import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { ResetPassword } from '@/pages/auth/ResetPassword'
import { VerifyEmail } from '@/pages/auth/VerifyEmail'
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { EventDetail } from '@/pages/events/EventDetail'
import { EventList } from '@/pages/events/EventList'
import { Forbidden } from '@/pages/Forbidden'
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
      { path: '/events/:eventId', element: <EventDetail /> },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '/403', element: <Forbidden /> },
  { path: '*', element: <NotFound /> },
])
