import { api } from '@/services/api'
import type { Order, OrderCreateInput } from '@/types/order'

/** Order API calls. */
export const orderService = {
  async create(input: OrderCreateInput): Promise<Order> {
    const { data } = await api.post<Order>('/api/v1/orders', input)
    return data
  },

  async getById(id: string): Promise<Order> {
    const { data } = await api.get<Order>(`/api/v1/orders/${id}`)
    return data
  },

  async listMine(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/api/v1/users/me/orders')
    return data
  },

  async cancel(id: string): Promise<Order> {
    const { data } = await api.post<Order>(`/api/v1/orders/${id}/cancel`)
    return data
  },
}
