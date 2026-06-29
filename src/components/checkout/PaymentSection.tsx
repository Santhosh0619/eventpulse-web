import { useMemo, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'

import { PaymentForm } from '@/components/checkout/PaymentForm'
import { Button } from '@/components/ui/Button'
import { env } from '@/lib/env'
import { getStripe } from '@/lib/stripe'
import { paymentService } from '@/services/paymentService'
import type { ApiError } from '@/services/api'

/**
 * Drives payment for a pending order: create a PaymentIntent, mount Stripe
 * Elements with its client secret, and confirm the card payment. On success the
 * parent refreshes the order (the backend webhook flips it to confirmed).
 */
export function PaymentSection({
  orderId,
  onPaid,
}: {
  orderId: string
  onPaid: () => void
}) {
  const stripePromise = useMemo(() => getStripe(), [])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  if (!env.stripePublishableKey) {
    return (
      <p className="text-sm text-gray-500">
        Payments are not configured in this environment.
      </p>
    )
  }

  if (paid) {
    return (
      <p className="text-sm text-green-700">
        Payment received — we&apos;re confirming your order.
      </p>
    )
  }

  async function startPayment() {
    setError(null)
    setStarting(true)
    try {
      const intent = await paymentService.createIntent(orderId)
      setClientSecret(intent.client_secret)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setStarting(false)
    }
  }

  if (!clientSecret) {
    return (
      <div className="space-y-2">
        <Button loading={starting} onClick={startPayment}>
          Pay now
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm
        onSuccess={() => {
          setPaid(true)
          onPaid()
        }}
      />
    </Elements>
  )
}
