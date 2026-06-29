import { api } from '@/services/api'
import type {
  AttendanceAnalytics,
  OrgOverview,
  PlatformDashboard,
  SalesAnalytics,
} from '@/types/analytics'

/** Analytics API calls (organizer + platform). */
export const analyticsService = {
  async eventSales(eventId: string): Promise<SalesAnalytics> {
    const { data } = await api.get<SalesAnalytics>(
      `/api/v1/analytics/events/${eventId}/sales`,
    )
    return data
  },

  async eventAttendance(eventId: string): Promise<AttendanceAnalytics> {
    const { data } = await api.get<AttendanceAnalytics>(
      `/api/v1/analytics/events/${eventId}/attendance`,
    )
    return data
  },

  async orgOverview(orgId: string): Promise<OrgOverview> {
    const { data } = await api.get<OrgOverview>(
      `/api/v1/analytics/organizations/${orgId}/overview`,
    )
    return data
  },

  async platform(): Promise<PlatformDashboard> {
    const { data } = await api.get<PlatformDashboard>('/api/v1/analytics/platform')
    return data
  },
}
