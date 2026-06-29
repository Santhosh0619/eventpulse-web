import { api } from '@/services/api'
import type { Paginated } from '@/types/common'
import type { AdminDashboard, AdminOrg, AdminUser, AuditLog } from '@/types/admin'
import type { EventSummary } from '@/types/event'

interface UserFilters {
  page?: number
  role?: string
  is_active?: boolean
  q?: string
}

/** Platform-admin API calls (all require the admin role; backend-enforced). */
export const adminService = {
  async dashboard(): Promise<AdminDashboard> {
    const { data } = await api.get<AdminDashboard>('/api/v1/admin/dashboard')
    return data
  },

  async listUsers(params: UserFilters): Promise<Paginated<AdminUser>> {
    const { data } = await api.get<Paginated<AdminUser>>('/api/v1/admin/users', {
      params,
    })
    return data
  },

  async updateUser(
    id: string,
    changes: { role?: string; is_active?: boolean },
  ): Promise<AdminUser> {
    const { data } = await api.put<AdminUser>(`/api/v1/admin/users/${id}`, changes)
    return data
  },

  async listOrganizations(params: {
    page?: number
    is_verified?: boolean
    q?: string
  }): Promise<Paginated<AdminOrg>> {
    const { data } = await api.get<Paginated<AdminOrg>>('/api/v1/admin/organizations', {
      params,
    })
    return data
  },

  async verifyOrganization(id: string): Promise<AdminOrg> {
    const { data } = await api.put<AdminOrg>(`/api/v1/admin/organizations/${id}/verify`)
    return data
  },

  async listEvents(params: {
    page?: number
    status?: string
  }): Promise<Paginated<EventSummary>> {
    const { data } = await api.get<Paginated<EventSummary>>('/api/v1/admin/events', {
      params,
    })
    return data
  },

  async featureEvent(id: string, isFeatured: boolean): Promise<EventSummary> {
    const { data } = await api.put<EventSummary>(`/api/v1/admin/events/${id}/feature`, {
      is_featured: isFeatured,
    })
    return data
  },

  async listAuditLogs(params: {
    page?: number
    action?: string
    entity_type?: string
  }): Promise<Paginated<AuditLog>> {
    const { data } = await api.get<Paginated<AuditLog>>('/api/v1/admin/audit-logs', {
      params,
    })
    return data
  },
}
