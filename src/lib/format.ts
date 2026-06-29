/** Formatting helpers for dates and money. */

const DATE_FMT = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/** Format an ISO datetime string for display (e.g. "Jun 1, 2030, 10:00 AM"). */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : DATE_FMT.format(date)
}

/** Format a decimal amount string and currency code as a price label. */
export function formatPrice(amount: string | number, currency = 'INR'): string {
  const value = typeof amount === 'string' ? Number(amount) : amount
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}
