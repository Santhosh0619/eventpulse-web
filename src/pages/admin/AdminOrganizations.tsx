import { useCallback, useState } from 'react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { Spinner } from '@/components/ui/Spinner'
import { usePaginated } from '@/hooks/usePaginated'
import { adminService } from '@/services/adminService'
import type { ApiError } from '@/services/api'
import type { AdminOrg } from '@/types/admin'

/** Admin organization management: verify organizations. */
export function AdminOrganizations() {
  const fetcher = useCallback(
    (page: number) => adminService.listOrganizations({ page }),
    [],
  )
  const { data, page, setPage, loading, error, reload } =
    usePaginated<AdminOrg>(fetcher)
  const [actionError, setActionError] = useState<string | null>(null)

  async function verify(id: string) {
    setActionError(null)
    try {
      await adminService.verifyOrganization(id)
      reload()
    } catch (err) {
      setActionError((err as ApiError).message)
    }
  }

  return (
    <PageWrapper title="Organizations">
      {error ? (
        <p className="py-16 text-center text-red-600">{error}</p>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card>
          <ul className="divide-y divide-surface-border">
            {data.items.map((org) => (
              <li key={org.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{org.name}</p>
                  <p className="truncate text-xs text-gray-500">{org.contact_email}</p>
                </div>
                {org.is_verified ? (
                  <Badge tone="success">Verified</Badge>
                ) : (
                  <Button size="sm" onClick={() => verify(org.id)}>
                    Verify
                  </Button>
                )}
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
