import { useEffect, useState } from 'react'

import { MetricCard } from '@/components/analytics/MetricCard'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Spinner } from '@/components/ui/Spinner'
import { adminService } from '@/services/adminService'
import type { ApiError } from '@/services/api'
import type { AdminDashboard as Dashboard } from '@/types/admin'

/** Platform-wide admin metrics. */
export function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    adminService
      .dashboard()
      .then((d) => !ignore && setData(d))
      .catch((err: ApiError) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [])

  if (error) {
    return (
      <PageWrapper>
        <p className="py-16 text-center text-red-600">{error}</p>
      </PageWrapper>
    )
  }

  if (!data) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Admin dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Users" value={data.total_users} />
        <MetricCard label="Organizations" value={data.total_organizations} />
        <MetricCard label="Unverified orgs" value={data.unverified_organizations} />
        <MetricCard label="Events" value={data.total_events} />
        <MetricCard label="Draft events" value={data.draft_events} />
        <MetricCard label="Orders" value={data.total_orders} />
        <MetricCard label="Audit log entries" value={data.total_audit_logs} />
      </div>
    </PageWrapper>
  )
}
