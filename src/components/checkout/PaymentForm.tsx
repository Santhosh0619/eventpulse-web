import { useState, type FormEvent } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

import { Button } from '@/components/ui/Button'

/**
 * Card entry + confirmation, rendered inside a Stripe `<Elements>` provider.
 * Calls `onSuccess` once the payment is confirmed (or is processing) without a
 * redirect; the parent then refreshes the order (which the webhook confirms).
 */
export function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setError(null)
    setSubmitting(true)
    const result = await stripe.confirmPayment({
      elements,
      // Needed for redirect-based methods; ignored for inline card confirmation.
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })
    if (result.error) {
      setError(result.error.message ?? 'Payment could not be completed.')
      setSubmitting(false)
      return
    }
    // No error doesn't guarantee payment: only succeeded/processing are terminal
    // for our optimistic "confirming" flow. Other statuses still need action.
    const status = result.paymentIntent?.status
    if (status === 'succeeded' || status === 'processing') {
      onSuccess()
    } else {
      setError('Payment was not completed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" loading={submitting} disabled={!stripe}>
        Pay now
      </Button>
    </form>
  )
}
