import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PaymentSection } from '@/components/checkout/PaymentSection'
import { paymentService } from '@/services/paymentService'

vi.mock('@/lib/env', () => ({ env: { stripePublishableKey: 'pk_test_123' } }))
vi.mock('@/lib/stripe', () => ({ getStripe: () => Promise.resolve(null) }))
vi.mock('@/services/paymentService', () => ({
  paymentService: { createIntent: vi.fn() },
}))
// Elements provider + form are exercised in PaymentForm.test; stub here.
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="elements">{children}</div>
  ),
}))
vi.mock('@/components/checkout/PaymentForm', () => ({
  PaymentForm: () => <div data-testid="payment-form" />,
}))

beforeEach(() => vi.clearAllMocks())

describe('PaymentSection', () => {
  it('creates an intent on "Pay now" then mounts the payment form', async () => {
    vi.mocked(paymentService.createIntent).mockResolvedValue({
      client_secret: 'cs_1',
      payment_intent_id: 'pi_1',
      amount: '20.00',
      currency: 'INR',
    })
    render(<PaymentSection orderId="o1" onPaid={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Pay now' }))
    await waitFor(() => expect(paymentService.createIntent).toHaveBeenCalledWith('o1'))
    expect(await screen.findByTestId('payment-form')).toBeInTheDocument()
  })

  it('shows an error if creating the intent fails', async () => {
    vi.mocked(paymentService.createIntent).mockRejectedValue({
      status: 400,
      message: 'This order is not awaiting payment',
    })
    render(<PaymentSection orderId="o1" onPaid={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Pay now' }))
    expect(await screen.findByText(/not awaiting payment/i)).toBeInTheDocument()
  })
})
