import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateTime, formatPrice } from '@/lib/format'
import { orderService } from '@/services/orderService'
import type { ApiError } from '@/services/api'
import type { Order } from '@/types/order'

/** Lists the current user's orders. */
export function MyOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    orderService
      .listMine()
      .then((o) => !ignore && setOrders(o))
      .catch((err: ApiError) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [])

  return (
    <PageWrapper title="My orders">
      {error ? (
        <p className="py-16 text-center text-red-600">{error}</p>
      ) : orders === null ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <p className="py-16 text-center text-gray-500">You have no orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="block">
              <Card className="flex items-center justify-between transition-shadow hover:shadow-md">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {formatPrice(order.total_amount, order.currency)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
