import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { ApiError } from '@/services/api'
import { eventService } from '@/services/eventService'

interface AiDescriptionAssistProps {
  /** Called with the generated description text when the user clicks generate. */
  onGenerated: (description: string) => void
}

/**
 * Keyword input + "Generate with AI" button that drafts an event description
 * via the backend Gemini endpoint and hands the result to the parent form.
 */
export function AiDescriptionAssist({ onGenerated }: AiDescriptionAssistProps) {
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    const list = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    if (list.length === 0) {
      setError('Enter at least one keyword.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { description } = await eventService.generateDescription(list)
      onGenerated(description)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2 rounded-md border border-brand-100 bg-brand-50 p-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Keywords, comma-separated (e.g. jazz, wine, rooftop)"
          aria-label="Description keywords"
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={loading}
          onClick={generate}
        >
          ✨ Generate with AI
        </Button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
