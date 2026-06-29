import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventAnalytics } from '@/pages/analytics/EventAnalytics'
import { analyticsService } from '@/services/analyticsService'
import type { AttendanceAnalytics, SalesAnalytics } from '@/types/analytics'

vi.mock('@/services/analyticsService', () => ({
  analyticsService: { eventSales: vi.fn(), eventAttendance: vi.fn() },
}))

const SALES: SalesAnalytics = {
  event_id: 'e1',
  total_revenue: '200.00',
  total_orders: 5,
  total_tickets_sold: 12,
  currency: 'INR',
  daily: [{ day: '2030-06-01', revenue: '200.00', orders: 5 }],
  tiers: [{ ticket_type_id: 't1', name: 'GA', tickets_sold: 12, revenue: '200.00' }],
}

const ATTENDANCE: AttendanceAnalytics = {
  event_id: 'e1',
  total: 12,
  checked_in: 9,
  not_checked_in: 3,
  check_in_rate: 0.75,
  hourly: [{ hour: 10, count: 9 }],
}

beforeEach(() => vi.clearAllMocks())

function renderAnalytics() {
  return render(
    <MemoryRouter initialEntries={['/events/e1/analytics']}>
      <Routes>
        <Route path="/events/:eventId/analytics" element={<EventAnalytics />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EventAnalytics', () => {
  it('renders sales and attendance metrics', async () => {
    vi.mocked(analyticsService.eventSales).mockResolvedValue(SALES)
    vi.mocked(analyticsService.eventAttendance).mockResolvedValue(ATTENDANCE)
    renderAnalytics()

    expect(await screen.findByText('Daily revenue')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
    // "12" is both tickets-sold and attendees → two metric tiles.
    expect(screen.getAllByText('12')).toHaveLength(2)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument() // check-in rate
    expect(screen.getByText('Check-in breakdown')).toBeInTheDocument()
  })

  it('shows an authorization error on 403', async () => {
    vi.mocked(analyticsService.eventSales).mockRejectedValue({
      status: 403,
      message: 'forbidden',
    })
    vi.mocked(analyticsService.eventAttendance).mockResolvedValue(ATTENDANCE)
    renderAnalytics()
    expect(
      await screen.findByText(/not authorized for this event/i),
    ).toBeInTheDocument()
  })

  it('shows empty-state copy when there are no sales or attendees', async () => {
    vi.mocked(analyticsService.eventSales).mockResolvedValue({
      ...SALES,
      daily: [],
      tiers: [],
      total_orders: 0,
      total_tickets_sold: 0,
    })
    vi.mocked(analyticsService.eventAttendance).mockResolvedValue({
      ...ATTENDANCE,
      total: 0,
      checked_in: 0,
      not_checked_in: 0,
      check_in_rate: 0,
      hourly: [],
    })
    renderAnalytics()

    expect(await screen.findByText('No sales yet.')).toBeInTheDocument()
    expect(screen.getByText('No tiers sold yet.')).toBeInTheDocument()
    expect(screen.getByText('No attendees yet.')).toBeInTheDocument()
  })
})
