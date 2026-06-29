import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateTime } from '@/lib/format'
import { eventService } from '@/services/eventService'
import { orgService } from '@/services/orgService'
import type { ApiError } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { Event } from '@/types/event'

/** Event detail view, with organizer management actions for members of its org. */
export function EventDetail() {
  const { eventId = '' } = useParams()
  const isAuthed = useAuthStore((s) => s.isAuthenticated())
  const [event, setEvent] = useState<Event | null>(null)
  const [manageableOrgIds, setManageableOrgIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [acting, setActing] = useState<'publish' | 'cancel' | null>(null)

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

  useEffect(() => {
    if (!isAuthed) return
    let ignore = false
    orgService
      .listMine()
      .then((orgs) => {
        if (!ignore) setManageableOrgIds(new Set(orgs.map((o) => o.id)))
      })
      .catch(() => undefined)
    return () => {
      ignore = true
    }
  }, [isAuthed])

  async function runAction(action: 'publish' | 'cancel') {
    setActionError(null)
    setActing(action)
    try {
      const updated = await eventService[action](eventId)
      setEvent(updated)
    } catch (err) {
      setActionError((err as ApiError).message)
    } finally {
      setActing(null)
    }
  }

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

  const canManage = manageableOrgIds.has(event.organization_id)

  return (
    <PageWrapper>
      <Card>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <Badge tone={event.status === 'published' ? 'success' : 'neutral'}>
            {event.status}
          </Badge>
        </div>

        {canManage && (
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-surface-border pb-4">
            <Link to={`/events/${event.id}/edit`}>
              <Button variant="secondary" size="sm">
                Edit
              </Button>
            </Link>
            {event.status === 'draft' && (
              <Button
                size="sm"
                loading={acting === 'publish'}
                disabled={acting !== null}
                onClick={() => runAction('publish')}
              >
                Publish
              </Button>
            )}
            {event.status !== 'cancelled' && event.status !== 'completed' && (
              <Button
                variant="danger"
                size="sm"
                loading={acting === 'cancel'}
                disabled={acting !== null}
                onClick={() => runAction('cancel')}
              >
                Cancel event
              </Button>
            )}
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          </div>
        )}

        {event.status === 'published' && (
          <div className="mb-4">
            <Link to={`/events/${event.id}/checkout`}>
              <Button>Get tickets</Button>
            </Link>
          </div>
        )}

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
