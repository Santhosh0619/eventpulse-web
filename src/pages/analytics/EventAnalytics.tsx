import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { MetricCard } from '@/components/analytics/MetricCard'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatPrice } from '@/lib/format'
import { analyticsService } from '@/services/analyticsService'
import type { ApiError } from '@/services/api'
import type { AttendanceAnalytics, SalesAnalytics } from '@/types/analytics'

const BRAND = '#4f46e5'
const DONUT_COLORS = ['#4f46e5', '#e5e7eb']

/** Organizer analytics for one event: sales + attendance with charts. */
export function EventAnalytics() {
  const { eventId = '' } = useParams()
  const [sales, setSales] = useState<SalesAnalytics | null>(null)
  const [attendance, setAttendance] = useState<AttendanceAnalytics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    Promise.all([
      analyticsService.eventSales(eventId),
      analyticsService.eventAttendance(eventId),
    ])
      .then(([s, a]) => {
        if (ignore) return
        setSales(s)
        setAttendance(a)
      })
      .catch((err: ApiError) => {
        if (!ignore) {
          setError(
            err.status === 403 ? 'You are not authorized for this event.' : err.message,
          )
        }
      })
    return () => {
      ignore = true
    }
  }, [eventId])

  if (error) {
    return (
      <PageWrapper>
        <p className="py-16 text-center text-red-600">{error}</p>
      </PageWrapper>
    )
  }

  if (!sales || !attendance) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  const dailyData = sales.daily.map((d) => ({ day: d.day, revenue: Number(d.revenue) }))
  const tierData = sales.tiers.map((t) => ({ name: t.name, tickets: t.tickets_sold }))
  const donutData = [
    { name: 'Checked in', value: attendance.checked_in },
    { name: 'Not checked in', value: attendance.not_checked_in },
  ]

  return (
    <PageWrapper title="Event analytics">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Revenue"
            value={formatPrice(sales.total_revenue, sales.currency)}
          />
          <MetricCard label="Orders" value={sales.total_orders} />
          <MetricCard label="Tickets sold" value={sales.total_tickets_sold} />
        </section>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Daily revenue</h2>
          {dailyData.length === 0 ? (
            <p className="text-sm text-gray-500">No sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke={BRAND} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Tickets sold by tier</h2>
          {tierData.length === 0 ? (
            <p className="text-sm text-gray-500">No tiers sold yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tickets" fill={BRAND} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Attendees" value={attendance.total} />
          <MetricCard label="Checked in" value={attendance.checked_in} />
          <MetricCard
            label="Check-in rate"
            value={`${Math.round(attendance.check_in_rate * 100)}%`}
          />
        </section>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Check-in breakdown</h2>
          {attendance.total === 0 ? (
            <p className="text-sm text-gray-500">No attendees yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {donutData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}
