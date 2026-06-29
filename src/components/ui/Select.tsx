import { forwardRef, type SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

/** A styled native select. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-surface-border bg-white px-3 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/40',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
})
