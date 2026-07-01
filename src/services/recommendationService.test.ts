import { describe, expect, it, vi } from 'vitest'

import { api } from '@/services/api'
import { recommendationService } from '@/services/recommendationService'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn() },
}))

describe('recommendationService', () => {
  it('getForMe requests the personalized feed with a limit', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    const res = await recommendationService.getForMe(5)
    expect(api.get).toHaveBeenCalledWith('/api/v1/recommendations/for-me', {
      params: { limit: 5 },
    })
    expect(res).toEqual([])
  })

  it('getForMe defaults the limit to 8', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    await recommendationService.getForMe()
    expect(api.get).toHaveBeenCalledWith('/api/v1/recommendations/for-me', {
      params: { limit: 8 },
    })
  })

  it('getSimilar requests the event similar endpoint', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ event: { id: 'e2' }, reason: 'Same genre', score: null }],
    })
    const res = await recommendationService.getSimilar('e1', 6)
    expect(api.get).toHaveBeenCalledWith('/api/v1/events/e1/similar', {
      params: { limit: 6 },
    })
    expect(res[0].reason).toBe('Same genre')
  })
})
