import { useEffect, useState } from 'react'

import { EventCard } from '@/components/events/EventCard'
import { RecommendationSection } from '@/components/events/RecommendationSection'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useDebounce } from '@/hooks/useDebounce'
import { eventService } from '@/services/eventService'
import { recommendationService } from '@/services/recommendationService'
import type { ApiError } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { Paginated } from '@/types/common'
import type { Category, EventSummary } from '@/types/event'

/** Public event discovery page: search, filter, and paginate published events. */
export function EventList() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [data, setData] = useState<Paginated<EventSummary> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthed = useAuthStore((s) => s.isAuthenticated())

  const debouncedQ = useDebounce(q)
  const debouncedCity = useDebounce(city)

  // Changing any filter resets to page 1 at the same time the filter updates, so
  // the fetch effect below never runs once with a stale (>1) page.
  function onFilterChange<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  useEffect(() => {
    eventService
      .listCategories()
      .then(setCategories)
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    eventService
      .search({
        page,
        limit: 12,
        q: debouncedQ || undefined,
        city: debouncedCity || undefined,
        category_id: categoryId || undefined,
      })
      .then((res) => {
        if (!ignore) setData(res)
      })
      .catch((err: ApiError) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [debouncedQ, debouncedCity, categoryId, page])

  return (
    <PageWrapper title="Events">
      {isAuthed && (
        <RecommendationSection
          title="Recommended for You"
          cacheKey="for-me"
          load={() => recommendationService.getForMe(8)}
        />
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search events…"
          value={q}
          onChange={(e) => onFilterChange(setQ)(e.target.value)}
          aria-label="Search events"
        />
        <Input
          placeholder="City"
          value={city}
          onChange={(e) => onFilterChange(setCity)(e.target.value)}
          aria-label="Filter by city"
        />
        <Select
          value={categoryId}
          onChange={(e) => onFilterChange(setCategoryId)(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="py-16 text-center text-red-600">{error}</p>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {data.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {data.page} of {data.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={loading || page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="py-16 text-center text-gray-500">No events found.</p>
      )}
    </PageWrapper>
  )
}
