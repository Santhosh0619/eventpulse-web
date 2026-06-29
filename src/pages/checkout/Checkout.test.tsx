import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Checkout } from '@/pages/checkout/Checkout'
import { orderService } from '@/services/orderService'
import { ticketService } from '@/services/ticketService'
import type { Availability } from '@/types/ticket'

vi.mock('@/services/ticketService', () => ({
  ticketService: { getAvailability: vi.fn() },
}))
vi.mock('@/services/orderService', () => ({
  orderService: { create: vi.fn() },
}))

const AVAIL: Availability = {
  event_id: 'e1',
  total_available: 5,
  tiers: [
    {
      ticket_type_id: 't1',
      name: 'GA',
      price: '10.00',
      currency: 'INR',
      quantity_total: 50,
      quantity_sold: 45,
      quantity_available: 5,
      is_on_sale: true,
    },
  ],
}

beforeEach(() => vi.clearAllMocks())

function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={['/events/e1/checkout']}>
      <Routes>
        <Route path="/events/:eventId/checkout" element={<Checkout />} />
        <Route path="/orders/:orderId" element={<div>Order page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Checkout', () => {
  it('selects quantities and places an order', async () => {
    vi.mocked(ticketService.getAvailability).mockResolvedValue(AVAIL)
    vi.mocked(orderService.create).mockResolvedValue({ id: 'o1' } as never)
    renderCheckout()

    await screen.findByText('GA')
    // Place is disabled with nothing selected.
    expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Increase GA' }))
    await userEvent.click(screen.getByRole('button', { name: 'Increase GA' }))
    expect(screen.getByLabelText('GA quantity')).toHaveTextContent('2')

    await userEvent.click(screen.getByRole('button', { name: 'Place order' }))
    await waitFor(() =>
      expect(orderService.create).toHaveBeenCalledWith({
        event_id: 'e1',
        items: [{ ticket_type_id: 't1', quantity: 2 }],
      }),
    )
  })

  it('caps quantity at availability', async () => {
    vi.mocked(ticketService.getAvailability).mockResolvedValue(AVAIL)
    renderCheckout()
    await screen.findByText('GA')
    const inc = screen.getByRole('button', { name: 'Increase GA' })
    for (let i = 0; i < 7; i++) await userEvent.click(inc)
    expect(screen.getByLabelText('GA quantity')).toHaveTextContent('5')
    expect(inc).toBeDisabled()
  })

  it('shows a message when nothing is on sale', async () => {
    vi.mocked(ticketService.getAvailability).mockResolvedValue({
      ...AVAIL,
      tiers: [{ ...AVAIL.tiers[0], is_on_sale: false }],
    })
    renderCheckout()
    expect(
      await screen.findByText(/no tickets are currently on sale/i),
    ).toBeInTheDocument()
  })

  it('excludes sold-out tiers even if still flagged on sale', async () => {
    vi.mocked(ticketService.getAvailability).mockResolvedValue({
      ...AVAIL,
      tiers: [
        { ...AVAIL.tiers[0], ticket_type_id: 't1', name: 'GA', quantity_available: 5 },
        {
          ...AVAIL.tiers[0],
          ticket_type_id: 't2',
          name: 'VIP',
          quantity_available: 0,
          is_on_sale: true,
        },
      ],
    })
    renderCheckout()
    expect(await screen.findByText('GA')).toBeInTheDocument()
    expect(screen.queryByText('VIP')).not.toBeInTheDocument()
  })
})
