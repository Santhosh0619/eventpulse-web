export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded'

export interface OrderItem {
  id: string
  ticket_type_id: string | null
  quantity: number
  unit_price: string
  subtotal: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  event_id: string | null
  status: OrderStatus
  total_amount: string
  currency: string
  notes: string | null
  expires_at: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  created_at: string
  items: OrderItem[]
}

export interface OrderCreateInput {
  event_id: string
  items: { ticket_type_id: string; quantity: number }[]
}
