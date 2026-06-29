import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'
import { Spinner } from '@/components/ui/Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-500/60',
  secondary:
    'bg-white text-gray-900 border border-surface-border hover:bg-surface-muted',
  ghost: 'bg-transparent text-gray-700 hover:bg-surface-muted',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/60',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

/** Primary action button with variants, sizes, and a loading state. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
