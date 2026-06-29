import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDateTime } from '@/lib/format'
import type { EventStatus, EventSummary } from '@/types/event'

const STATUS_TONE: Record<EventStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  draft: 'neutral',
  published: 'success',
  cancelled: 'danger',
  completed: 'warning',
}

/** A compact event preview card linking to the event detail page. */
export function EventCard({ event }: { event: EventSummary }) {
  return (
    <Link to={`/events/${event.id}`} className="block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          <Badge tone={STATUS_TONE[event.status]}>{event.status}</Badge>
        </div>
        {event.short_description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            {event.short_description}
          </p>
        )}
        <div className="text-xs text-gray-500">
          <p>{formatDateTime(event.start_datetime)}</p>
          {event.city && <p>{event.city}</p>}
        </div>
      </Card>
    </Link>
  )
}
