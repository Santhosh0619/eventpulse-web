import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateTime } from '@/lib/format'
import { eventService } from '@/services/eventService'
import type { ApiError } from '@/services/api'
import type { Event } from '@/types/event'

/** Read-only event detail view. */
export function EventDetail() {
  const { eventId = '' } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    eventService
      .getById(eventId)
      .then((e) => {
        if (!ignore) setEvent(e)
      })
      .catch((err: ApiError) => {
        if (!ignore) setError(err.status === 404 ? 'Event not found.' : err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [eventId])

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !event) {
    return (
      <PageWrapper>
        <p className="py-16 text-center text-red-600">{error ?? 'Event not found.'}</p>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Card>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <Badge tone={event.status === 'published' ? 'success' : 'neutral'}>
            {event.status}
          </Badge>
        </div>
        {event.description && (
          <p className="mb-4 whitespace-pre-line text-gray-700">{event.description}</p>
        )}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-500">Starts</dt>
            <dd>{formatDateTime(event.start_datetime)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Ends</dt>
            <dd>{formatDateTime(event.end_datetime)}</dd>
          </div>
          {event.venue_name && (
            <div>
              <dt className="font-medium text-gray-500">Venue</dt>
              <dd>{event.venue_name}</dd>
            </div>
          )}
          {(event.city || event.country) && (
            <div>
              <dt className="font-medium text-gray-500">Location</dt>
              <dd>{[event.city, event.country].filter(Boolean).join(', ')}</dd>
            </div>
          )}
        </dl>
        {event.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <Badge key={tag} tone="brand">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </PageWrapper>
  )
}
