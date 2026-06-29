import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

/** A multi-line text input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-md border bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40',
          invalid ? 'border-red-500' : 'border-surface-border',
          className,
        )}
        {...props}
      />
    )
  },
)
