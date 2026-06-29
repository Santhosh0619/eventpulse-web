import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatPrice } from '@/lib/format'
import { orderService } from '@/services/orderService'
import { ticketService } from '@/services/ticketService'
import type { ApiError } from '@/services/api'
import type { Availability } from '@/types/ticket'

/** Select ticket quantities per tier and place a (pending) order. */
export function Checkout() {
  const { eventId = '' } = useParams()
  const navigate = useNavigate()
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    let ignore = false
    ticketService
      .getAvailability(eventId)
      .then((a) => !ignore && setAvailability(a))
      .catch((err: ApiError) => !ignore && setLoadError(err.message))
    return () => {
      ignore = true
    }
  }, [eventId])

  const tiers = availability?.tiers ?? []

  // Cheap to compute each render (a handful of tiers); no memo needed.
  const total = tiers.reduce(
    (sum, t) => sum + (quantities[t.ticket_type_id] ?? 0) * Number(t.price),
    0,
  )
  const itemCount = Object.values(quantities).reduce((a, b) => a + b, 0)

  function setQty(tierId: string, qty: number, max: number) {
    setQuantities((q) => ({ ...q, [tierId]: Math.max(0, Math.min(qty, max)) }))
  }

  async function placeOrder() {
    setError(null)
    setPlacing(true)
    try {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticket_type_id, quantity]) => ({ ticket_type_id, quantity }))
      const order = await orderService.create({ event_id: eventId, items })
      navigate(`/orders/${order.id}`)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setPlacing(false)
    }
  }

  if (loadError) {
    return (
      <PageWrapper>
        <p className="py-16 text-center text-red-600">{loadError}</p>
      </PageWrapper>
    )
  }

  if (!availability) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  // Only tiers that are both on sale and not sold out are purchasable.
  const onSaleTiers = tiers.filter((t) => t.is_on_sale && t.quantity_available > 0)

  return (
    <PageWrapper title="Get tickets">
      {onSaleTiers.length === 0 ? (
        <Card>
          <p className="text-gray-600">No tickets are currently on sale.</p>
        </Card>
      ) : (
        <Card className="space-y-4">
          <ul className="divide-y divide-surface-border">
            {onSaleTiers.map((tier) => {
              const qty = quantities[tier.ticket_type_id] ?? 0
              return (
                <li
                  key={tier.ticket_type_id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium">{tier.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(tier.price, tier.currency)} ·{' '}
                      {tier.quantity_available} left
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`Decrease ${tier.name}`}
                      disabled={qty <= 0}
                      onClick={() =>
                        setQty(tier.ticket_type_id, qty - 1, tier.quantity_available)
                      }
                    >
                      −
                    </Button>
                    <span
                      className="w-6 text-center"
                      aria-label={`${tier.name} quantity`}
                    >
                      {qty}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`Increase ${tier.name}`}
                      disabled={qty >= tier.quantity_available}
                      onClick={() =>
                        setQty(tier.ticket_type_id, qty + 1, tier.quantity_available)
                      }
                    >
                      +
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-between border-t border-surface-border pt-4">
            <div>
              <p className="text-sm text-gray-500">{itemCount} ticket(s)</p>
              <p className="text-lg font-semibold">{formatPrice(total)}</p>
            </div>
            <Button loading={placing} disabled={itemCount === 0} onClick={placeOrder}>
              Place order
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Badge tone="neutral">
            Your order is held briefly while you complete payment.
          </Badge>
        </Card>
      )}
    </PageWrapper>
  )
}
