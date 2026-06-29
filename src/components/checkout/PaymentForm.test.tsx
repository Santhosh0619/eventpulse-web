import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PaymentForm } from '@/components/checkout/PaymentForm'

const { confirmPayment } = vi.hoisted(() => ({ confirmPayment: vi.fn() }))

vi.mock('@stripe/react-stripe-js', () => ({
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => ({ confirmPayment }),
  useElements: () => ({}),
}))

beforeEach(() => vi.clearAllMocks())

describe('PaymentForm', () => {
  it('confirms a succeeded payment and calls onSuccess', async () => {
    confirmPayment.mockResolvedValue({ paymentIntent: { status: 'succeeded' } })
    const onSuccess = vi.fn()
    render(<PaymentForm onSuccess={onSuccess} />)

    await userEvent.click(screen.getByRole('button', { name: 'Pay now' }))
    await waitFor(() => expect(confirmPayment).toHaveBeenCalledOnce())
    expect(confirmPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        redirect: 'if_required',
        confirmParams: { return_url: expect.any(String) },
      }),
    )
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('treats a processing intent as success (webhook confirms)', async () => {
    confirmPayment.mockResolvedValue({ paymentIntent: { status: 'processing' } })
    const onSuccess = vi.fn()
    render(<PaymentForm onSuccess={onSuccess} />)
    await userEvent.click(screen.getByRole('button', { name: 'Pay now' }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
  })

  it('does NOT call onSuccess when the intent still requires action', async () => {
    confirmPayment.mockResolvedValue({ paymentIntent: { status: 'requires_action' } })
    const onSuccess = vi.fn()
    render(<PaymentForm onSuccess={onSuccess} />)

    await userEvent.click(screen.getByRole('button', { name: 'Pay now' }))
    expect(await screen.findByText(/was not completed/i)).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
    // Button is re-enabled so the user can retry.
    expect(screen.getByRole('button', { name: 'Pay now' })).not.toBeDisabled()
  })

  it('shows the error message when confirmation fails', async () => {
    confirmPayment.mockResolvedValue({ error: { message: 'Your card was declined.' } })
    const onSuccess = vi.fn()
    render(<PaymentForm onSuccess={onSuccess} />)

    await userEvent.click(screen.getByRole('button', { name: 'Pay now' }))
    expect(await screen.findByText('Your card was declined.')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
