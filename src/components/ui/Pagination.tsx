import { Button } from '@/components/ui/Button'

interface PaginationProps {
  page: number
  pages: number
  onChange: (page: number) => void
  disabled?: boolean
}

/** Prev / page-indicator / next controls for paginated lists. */
export function Pagination({ page, pages, onChange, disabled }: PaginationProps) {
  if (pages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-center gap-4">
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {page} of {pages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled || page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
