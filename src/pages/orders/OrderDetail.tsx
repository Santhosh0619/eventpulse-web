import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateTime, formatPrice } from '@/lib/format'
import { orderService } from '@/services/orderService'
import type { ApiError } from '@/services/api'
import type { Order } from '@/types/order'

/** Shows a single order with its line items and a cancel action when pending. */
export function OrderDetail() {
  const { orderId = '' } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let ignore = false
    orderService
      .getById(orderId)
      .then((o) => !ignore && setOrder(o))
      .catch(
        (err: ApiError) =>
          !ignore &&
          setLoadError(err.status === 404 ? 'Order not found.' : err.message),
      )
    return () => {
      ignore = true
    }
  }, [orderId])

  async function handleCancel() {
    setActionError(null)
    setCancelling(true)
    try {
      setOrder(await orderService.cancel(orderId))
    } catch (err) {
      setActionError((err as ApiError).message)
    } finally {
      setCancelling(false)
    }
  }

  if (loadError) {
    return (
      <PageWrapper>
        <p className="py-16 text-center text-red-600">{loadError}</p>
      </PageWrapper>
    )
  }

  if (!order) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={order.order_number}>
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <OrderStatusBadge status={order.status} />
          <span className="text-sm text-gray-500">
            Placed {formatDateTime(order.created_at)}
          </span>
        </div>

        <ul className="divide-y divide-surface-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span>
                {item.quantity} × {formatPrice(item.unit_price, order.currency)}
              </span>
              <span className="font-medium">
                {formatPrice(item.subtotal, order.currency)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-surface-border pt-4">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-semibold">
            {formatPrice(order.total_amount, order.currency)}
          </span>
        </div>

        {order.status === 'pending' && (
          <div className="space-y-2 border-t border-surface-border pt-4">
            {order.expires_at && (
              <p className="text-sm text-amber-700">
                Held until {formatDateTime(order.expires_at)}. Online payment is coming
                soon; until then you can cancel this order.
              </p>
            )}
            <Button variant="danger" loading={cancelling} onClick={handleCancel}>
              Cancel order
            </Button>
          </div>
        )}
        {actionError && <p className="text-sm text-red-600">{actionError}</p>}
      </Card>
    </PageWrapper>
  )
}
