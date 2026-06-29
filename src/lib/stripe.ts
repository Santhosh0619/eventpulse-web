import { loadStripe, type Stripe } from '@stripe/stripe-js'

import { env } from '@/lib/env'

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Lazily load the Stripe.js client with the configured publishable key.
 * Returns a promise resolving to `null` when no key is configured, so callers
 * can degrade gracefully instead of throwing.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!env.stripePublishableKey) return Promise.resolve(null)
  stripePromise ??= loadStripe(env.stripePublishableKey)
  return stripePromise
}
