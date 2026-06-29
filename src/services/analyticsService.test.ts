import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/services/api'
import { analyticsService } from '@/services/analyticsService'

vi.mock('@/services/api', () => ({ api: { get: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('analyticsService', () => {
  it('hits the event sales and attendance endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    await analyticsService.eventSales('e1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/events/e1/sales')
    await analyticsService.eventAttendance('e1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/events/e1/attendance')
  })

  it('hits the org overview and platform endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    await analyticsService.orgOverview('o1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/organizations/o1/overview')
    await analyticsService.platform()
    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/platform')
  })
})
