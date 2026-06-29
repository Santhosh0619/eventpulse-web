import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface PageWrapperProps {
  children: ReactNode
  title?: string
  actions?: ReactNode
  className?: string
}

/** Standard page container: max-width, padding, and an optional title/actions row. */
export function PageWrapper({ children, title, actions, className }: PageWrapperProps) {
  return (
    <main className={cn('mx-auto w-full max-w-6xl px-4 py-6', className)}>
      {(title || actions) && (
        <div className="mb-6 flex items-center justify-between">
          {title && <h1 className="text-2xl font-semibold">{title}</h1>}
          {actions}
        </div>
      )}
      {children}
    </main>
  )
}
