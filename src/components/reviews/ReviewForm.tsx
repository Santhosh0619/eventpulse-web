import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/forms/FormField'
import { StarRating } from '@/components/forms/StarRating'
import type { ApiError } from '@/services/api'
import type { ReviewInput } from '@/types/review'

interface ReviewFormProps {
  initial?: ReviewInput
  submitLabel: string
  onSubmit: (input: ReviewInput) => Promise<void>
  onCancel?: () => void
}

/** Create/edit form for a review: star rating + optional title and comment. */
export function ReviewForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (rating < 1) {
      setError('Please choose a rating.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        rating,
        title: title || undefined,
        comment: comment || undefined,
      })
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label="Your rating" htmlFor="rating">
        <StarRating value={rating} onChange={setRating} />
      </FormField>
      <FormField label="Title (optional)" htmlFor="review-title">
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormField>
      <FormField label="Comment (optional)" htmlFor="review-comment">
        <Textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </FormField>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
