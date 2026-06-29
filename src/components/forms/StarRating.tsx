import { cn } from '@/lib/cn'

interface StarRatingProps {
  value: number
  /** When provided, renders interactive star buttons. */
  onChange?: (value: number) => void
  className?: string
}

const STARS = [1, 2, 3, 4, 5]

/** A 1-5 star rating, read-only by default or interactive when `onChange` is set. */
export function StarRating({ value, onChange, className }: StarRatingProps) {
  const readOnly = !onChange
  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      role={readOnly ? 'img' : 'group'}
      aria-label={readOnly ? `Rated ${value} out of 5` : 'Rating'}
    >
      {STARS.map((star) => {
        const filled = star <= value
        const symbol = (
          <span className={filled ? 'text-amber-500' : 'text-gray-300'}>★</span>
        )
        return readOnly ? (
          <span key={star} aria-hidden="true" className="text-lg">
            {symbol}
          </span>
        ) : (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-pressed={value === star}
            className="text-xl leading-none"
            onClick={() => onChange(star)}
          >
            {symbol}
          </button>
        )
      })}
    </div>
  )
}
