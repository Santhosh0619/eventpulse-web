import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

/** A text input styled to match the design system. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border bg-white px-3 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/40',
        invalid ? 'border-red-500' : 'border-surface-border',
        className,
      )}
      {...props}
    />
  )
})
