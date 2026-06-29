import { Outlet } from 'react-router-dom'

/** Centered layout for unauthenticated auth pages (login, register, ...). */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-600">
          EventPulse
        </h1>
        <Outlet />
      </div>
    </div>
  )
}
