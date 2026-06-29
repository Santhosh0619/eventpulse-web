import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { Spinner } from '@/components/ui/Spinner'
import { usePaginated } from '@/hooks/usePaginated'
import { adminService } from '@/services/adminService'
import type { ApiError } from '@/services/api'
import type { EventSummary } from '@/types/event'

/** Admin event management: toggle featured status. */
export function AdminEvents() {
  const fetcher = useCallback((page: number) => adminService.listEvents({ page }), [])
  const { data, page, setPage, loading, error, reload } =
    usePaginated<EventSummary>(fetcher)
  const [actionError, setActionError] = useState<string | null>(null)

  async function toggleFeatured(id: string, next: boolean) {
    setActionError(null)
    try {
      await adminService.featureEvent(id, next)
      reload()
    } catch (err) {
      setActionError((err as ApiError).message)
    }
  }

  return (
    <PageWrapper title="Events">
      {error ? (
        <p className="py-16 text-center text-red-600">{error}</p>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card>
          <ul className="divide-y divide-surface-border">
            {data.items.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <Link
                    to={`/events/${event.id}`}
                    className="truncate text-sm font-medium hover:text-brand-600"
                  >
                    {event.title}
                  </Link>
                  <div className="mt-0.5 flex gap-2">
                    <Badge>{event.status}</Badge>
                    {event.is_featured && <Badge tone="brand">featured</Badge>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFeatured(event.id, !event.is_featured)}
                >
                  {event.is_featured ? 'Unfeature' : 'Feature'}
                </Button>
              </li>
            ))}
          </ul>
          {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
          <Pagination
            page={page}
            pages={data.pages}
            onChange={setPage}
            disabled={loading}
          />
        </Card>
      )}
    </PageWrapper>
  )
}
