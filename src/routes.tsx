import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { Dashboard } from '@/pages/dashboard/Dashboard'
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
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
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
