import { NavLink, Outlet } from 'react-router-dom'

import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/cn'

const TABS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/organizations', label: 'Organizations' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/audit-logs', label: 'Audit logs' },
]

/** Layout for the platform admin panel: navbar + tab navigation + routed content. */
export function AdminLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4">
        <nav className="flex gap-1 overflow-x-auto border-b border-surface-border py-2">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded px-3 py-1.5 text-sm',
                  isActive
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'text-gray-600 hover:text-brand-600',
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
