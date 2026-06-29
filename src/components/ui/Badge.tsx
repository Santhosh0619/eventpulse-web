import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const TONES: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  brand: 'bg-brand-100 text-brand-700',
}

/** A small status pill. */
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
      {...props}
    />
  )
}
