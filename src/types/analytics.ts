/** Analytics response types (Decimal/date fields arrive as strings). */

export interface DailySales {
  day: string
  revenue: string
  orders: number
}

export interface TierSales {
  ticket_type_id: string
  name: string
  tickets_sold: number
  revenue: string
}

export interface SalesAnalytics {
  event_id: string
  total_revenue: string
  total_orders: number
  total_tickets_sold: number
  currency: string
  daily: DailySales[]
  tiers: TierSales[]
}

export interface HourlyCheckIns {
  hour: number
  count: number
}

export interface AttendanceAnalytics {
  event_id: string
  total: number
  checked_in: number
  not_checked_in: number
  check_in_rate: number
  hourly: HourlyCheckIns[]
}

export interface OrgOverview {
  organization_id: string
  total_events: number
  published_events: number
  upcoming_events: number
  total_revenue: string
  total_orders: number
  total_tickets_sold: number
  total_attendees: number
}

export interface PlatformDashboard {
  total_users: number
  total_organizations: number
  total_events: number
  total_orders: number
  total_revenue: string
  total_tickets_sold: number
}
