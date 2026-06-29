import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

/** A surface container with border, padding, and rounded corners. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-surface-border bg-white p-5 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
