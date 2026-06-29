import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/services/api'
import { paymentService } from '@/services/paymentService'

vi.mock('@/services/api', () => ({ api: { post: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('paymentService', () => {
  it('createIntent posts the order id', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { client_secret: 'cs_1', payment_intent_id: 'pi_1' },
    })
    const intent = await paymentService.createIntent('o1')
    expect(api.post).toHaveBeenCalledWith('/api/v1/payments/create-intent', {
      order_id: 'o1',
    })
    expect(intent.client_secret).toBe('cs_1')
  })
})
