import { useEffect, useState } from 'react'

import { EventCard } from '@/components/events/EventCard'
import { Spinner } from '@/components/ui/Spinner'
import type { AiRecommendedEvent } from '@/types/recommendation'

interface RecommendationSectionProps {
  /** Section heading, e.g. "Recommended for You". */
  title: string
  /** Re-fetch whenever this key changes (e.g. the event id or user id). */
  cacheKey: string
  /** Loader for the recommendation list. */
  load: () => Promise<AiRecommendedEvent[]>
}

/**
 * A self-contained AI recommendation strip (Gemini-backed).
 *
 * Shows a heading with a spinner while loading, then a grid of event cards
 * each annotated with the model's reason. Renders nothing when there are no
 * recommendations or the request fails, so it never leaves an empty shell.
 */
export function RecommendationSection({
  title,
  cacheKey,
  load,
}: RecommendationSectionProps) {
  const [items, setItems] = useState<AiRecommendedEvent[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    load()
      .then((res) => {
        if (!ignore) setItems(res)
      })
      .catch(() => {
        if (!ignore) setItems([])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
    // Loader closes over cacheKey inputs; re-run only when the key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  // Hide the section entirely once we know there is nothing to show.
  if (!loading && (!items || items.length === 0)) return null

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span
          className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700"
          title="Powered by AI"
        >
          ✨ AI
        </span>
        {loading && <Spinner size="sm" />}
      </div>

      {items && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((rec) => (
            <div key={rec.event.id} className="flex flex-col">
              <EventCard event={rec.event} />
              {rec.reason && (
                <p className="mt-1 px-1 text-xs italic text-gray-500">{rec.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
