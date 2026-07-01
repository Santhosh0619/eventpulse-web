import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AiDescriptionAssist } from '@/components/events/AiDescriptionAssist'
import { eventService } from '@/services/eventService'

vi.mock('@/services/eventService', () => ({
  eventService: { generateDescription: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe('AiDescriptionAssist', () => {
  it('generates a description from comma-separated keywords', async () => {
    vi.mocked(eventService.generateDescription).mockResolvedValue({
      description: 'A dazzling rooftop jazz evening.',
      ai_generated: true,
    })
    const onGenerated = vi.fn()
    render(<AiDescriptionAssist onGenerated={onGenerated} />)

    await userEvent.type(
      screen.getByLabelText('Description keywords'),
      'jazz, rooftop , wine',
    )
    await userEvent.click(screen.getByRole('button', { name: /generate with ai/i }))

    await waitFor(() =>
      expect(eventService.generateDescription).toHaveBeenCalledWith([
        'jazz',
        'rooftop',
        'wine',
      ]),
    )
    expect(onGenerated).toHaveBeenCalledWith('A dazzling rooftop jazz evening.')
  })

  it('shows an error and does not call the service without keywords', async () => {
    const onGenerated = vi.fn()
    render(<AiDescriptionAssist onGenerated={onGenerated} />)
    await userEvent.click(screen.getByRole('button', { name: /generate with ai/i }))
    expect(await screen.findByText(/enter at least one keyword/i)).toBeInTheDocument()
    expect(eventService.generateDescription).not.toHaveBeenCalled()
    expect(onGenerated).not.toHaveBeenCalled()
  })

  it('surfaces a service error', async () => {
    vi.mocked(eventService.generateDescription).mockRejectedValue({
      status: 500,
      message: 'Server error',
    })
    render(<AiDescriptionAssist onGenerated={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Description keywords'), 'x')
    await userEvent.click(screen.getByRole('button', { name: /generate with ai/i }))
    expect(await screen.findByText('Server error')).toBeInTheDocument()
  })
})
