import { useCallback } from 'react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateTime } from '@/lib/format'
import { usePaginated } from '@/hooks/usePaginated'
import { adminService } from '@/services/adminService'
import type { AuditLog } from '@/types/admin'

/** Admin audit-log viewer (append-only trail of significant actions). */
export function AdminAuditLogs() {
  const fetcher = useCallback(
    (page: number) => adminService.listAuditLogs({ page }),
    [],
  )
  const { data, page, setPage, loading, error } = usePaginated<AuditLog>(fetcher)

  return (
    <PageWrapper title="Audit logs">
      {error ? (
        <p className="py-16 text-center text-red-600">{error}</p>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : data.items.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No audit entries.</p>
      ) : (
        <Card>
          <ul className="divide-y divide-surface-border">
            {data.items.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm">
                    <Badge tone="brand">{log.action}</Badge>{' '}
                    <span className="text-gray-500">{log.entity_type}</span>
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {log.entity_id ?? '—'}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-gray-400">
                  {formatDateTime(log.created_at)}
                </span>
              </li>
            ))}
          </ul>
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
