import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MyOrders } from '@/pages/orders/MyOrders'
import { OrderDetail } from '@/pages/orders/OrderDetail'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order'

vi.mock('@/services/orderService', () => ({
  orderService: { listMine: vi.fn(), getById: vi.fn(), cancel: vi.fn() },
}))

const ORDER: Order = {
  id: 'o1',
  order_number: 'EP-ORD-0001',
  user_id: 'u1',
  event_id: 'e1',
  status: 'pending',
  total_amount: '20.00',
  currency: 'INR',
  notes: null,
  expires_at: '2030-06-01T10:30:00Z',
  confirmed_at: null,
  cancelled_at: null,
  created_at: '2030-06-01T10:00:00Z',
  items: [
    {
      id: 'i1',
      ticket_type_id: 't1',
      quantity: 2,
      unit_price: '10.00',
      subtotal: '20.00',
    },
  ],
}

beforeEach(() => vi.clearAllMocks())

describe('MyOrders', () => {
  it('lists orders', async () => {
    vi.mocked(orderService.listMine).mockResolvedValue([ORDER])
    render(
      <MemoryRouter>
        <MyOrders />
      </MemoryRouter>,
    )
    expect(await screen.findByText('EP-ORD-0001')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    vi.mocked(orderService.listMine).mockResolvedValue([])
    render(
      <MemoryRouter>
        <MyOrders />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/no orders yet/i)).toBeInTheDocument()
  })
})

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/orders/o1']}>
      <Routes>
        <Route path="/orders/:orderId" element={<OrderDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OrderDetail', () => {
  it('renders the order and cancels a pending order', async () => {
    vi.mocked(orderService.getById).mockResolvedValue(ORDER)
    vi.mocked(orderService.cancel).mockResolvedValue({ ...ORDER, status: 'cancelled' })
    renderDetail()

    expect(await screen.findByText('EP-ORD-0001')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /cancel order/i }))
    await waitFor(() => expect(orderService.cancel).toHaveBeenCalledWith('o1'))
    expect(await screen.findByText('cancelled')).toBeInTheDocument()
  })

  it('hides cancel for a non-pending order', async () => {
    vi.mocked(orderService.getById).mockResolvedValue({ ...ORDER, status: 'confirmed' })
    renderDetail()
    await screen.findByText('EP-ORD-0001')
    expect(
      screen.queryByRole('button', { name: /cancel order/i }),
    ).not.toBeInTheDocument()
  })

  it('shows a not-found message on 404', async () => {
    vi.mocked(orderService.getById).mockRejectedValue({ status: 404, message: 'x' })
    renderDetail()
    expect(await screen.findByText(/order not found/i)).toBeInTheDocument()
  })

  it('shows the backend message on a non-404 error', async () => {
    vi.mocked(orderService.getById).mockRejectedValue({
      status: 500,
      message: 'Server exploded',
    })
    renderDetail()
    expect(await screen.findByText('Server exploded')).toBeInTheDocument()
  })
})
