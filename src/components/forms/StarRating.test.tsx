import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StarRating } from '@/components/forms/StarRating'

describe('StarRating', () => {
  it('renders a read-only label when no onChange is given', () => {
    render(<StarRating value={4} />)
    expect(screen.getByRole('img', { name: /rated 4 out of 5/i })).toBeInTheDocument()
  })

  it('calls onChange with the clicked star in interactive mode', async () => {
    const onChange = vi.fn()
    render(<StarRating value={0} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '4 stars' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })
})
