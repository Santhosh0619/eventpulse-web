import { beforeEach, describe, expect, it, vi } from 'vitest'

import { adminService } from '@/services/adminService'
import { api } from '@/services/api'

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), put: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('adminService', () => {
  it('dashboard and list endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    await adminService.dashboard()
    expect(api.get).toHaveBeenCalledWith('/api/v1/admin/dashboard')
    await adminService.listUsers({ page: 2 })
    expect(api.get).toHaveBeenCalledWith('/api/v1/admin/users', { params: { page: 2 } })
    await adminService.listOrganizations({ page: 1 })
    expect(api.get).toHaveBeenCalledWith('/api/v1/admin/organizations', {
      params: { page: 1 },
    })
    await adminService.listEvents({ page: 1, status: 'draft' })
    expect(api.get).toHaveBeenCalledWith('/api/v1/admin/events', {
      params: { page: 1, status: 'draft' },
    })
    await adminService.listAuditLogs({ page: 1 })
    expect(api.get).toHaveBeenCalledWith('/api/v1/admin/audit-logs', {
      params: { page: 1 },
    })
  })

  it('mutation endpoints', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await adminService.updateUser('u1', { role: 'organizer' })
    expect(api.put).toHaveBeenCalledWith('/api/v1/admin/users/u1', {
      role: 'organizer',
    })
    await adminService.verifyOrganization('o1')
    expect(api.put).toHaveBeenCalledWith('/api/v1/admin/organizations/o1/verify')
    await adminService.featureEvent('e1', true)
    expect(api.put).toHaveBeenCalledWith('/api/v1/admin/events/e1/feature', {
      is_featured: true,
    })
  })
})
