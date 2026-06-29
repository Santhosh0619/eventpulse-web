import { useCallback, useState } from 'react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { usePaginated } from '@/hooks/usePaginated'
import { adminService } from '@/services/adminService'
import type { ApiError } from '@/services/api'
import type { AdminUser } from '@/types/admin'

/** Admin user management: change roles and active status. */
export function AdminUsers() {
  const fetcher = useCallback((page: number) => adminService.listUsers({ page }), [])
  const { data, page, setPage, loading, error, reload } =
    usePaginated<AdminUser>(fetcher)
  const [actionError, setActionError] = useState<string | null>(null)

  async function change(id: string, changes: { role?: string; is_active?: boolean }) {
    setActionError(null)
    try {
      await adminService.updateUser(id, changes)
      reload()
    } catch (err) {
      setActionError((err as ApiError).message)
    }
  }

  return (
    <PageWrapper title="Users">
      {error ? (
        <p className="py-16 text-center text-red-600">{error}</p>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card>
          <ul className="divide-y divide-surface-border">
            {data.items.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.email}</p>
                  {!user.is_active && <Badge tone="danger">inactive</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    aria-label={`Role for ${user.email}`}
                    value={user.role}
                    onChange={(e) => change(user.id, { role: e.target.value })}
                    className="h-8 w-32"
                  >
                    <option value="attendee">attendee</option>
                    <option value="organizer">organizer</option>
                    <option value="admin">admin</option>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => change(user.id, { is_active: !user.is_active })}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
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
