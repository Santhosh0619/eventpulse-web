import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}

/** A labelled form control with an optional validation error message. */
export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
