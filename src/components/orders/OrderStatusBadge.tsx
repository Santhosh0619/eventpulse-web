import { Badge } from '@/components/ui/Badge'
import type { OrderStatus } from '@/types/order'

const TONE: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  refunded: 'neutral',
}

/** A status pill for an order. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONE[status]}>{status}</Badge>
}
