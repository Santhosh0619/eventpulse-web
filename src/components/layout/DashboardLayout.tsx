import { Outlet } from 'react-router-dom'

import { Navbar } from '@/components/layout/Navbar'

/** Layout for authenticated dashboard pages: navbar + routed content. */
export function DashboardLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
    </div>
  )
}
