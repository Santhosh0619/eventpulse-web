import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { ReviewForm } from '@/components/reviews/ReviewForm'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Textarea } from '@/components/ui/Textarea'
import { StarRating } from '@/components/forms/StarRating'
import { formatDateTime } from '@/lib/format'
import { reviewService } from '@/services/reviewService'
import type { ApiError } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { Review, ReviewInput, ReviewSummary } from '@/types/review'

interface EventReviewsProps {
  eventId: string
  /** Whether the viewer can post organizer responses (org member). */
  canRespond: boolean
}

/** Reviews section for an event: summary, list, write/edit, and responses. */
export function EventReviews({ eventId, canRespond }: EventReviewsProps) {
  const isAuthed = useAuthStore((s) => s.isAuthenticated())
  const userId = useAuthStore((s) => s.user?.id)
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    const [s, list] = await Promise.all([
      reviewService.getSummary(eventId),
      reviewService.listForEvent(eventId),
    ])
    setSummary(s)
    setReviews(list)
  }, [eventId])

  // Reload after a mutation without rejecting (so a reload blip is never
  // mistaken for the mutation having failed).
  const reload = useCallback(async () => {
    try {
      await load()
    } catch {
      // keep current data; the mutation already succeeded
    }
  }, [load])

  useEffect(() => {
    let ignore = false
    load()
      .catch((err: ApiError) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [load])

  const myReview = reviews.find((r) => r.user_id === userId)

  async function submitNew(input: ReviewInput) {
    await reviewService.submit(eventId, input)
    await reload()
  }

  async function submitEdit(input: ReviewInput) {
    if (!myReview) return
    await reviewService.update(myReview.id, input)
    setEditing(false)
    await reload()
  }

  async function deleteMine() {
    if (!myReview) return
    setActionError(null)
    setDeleting(true)
    try {
      await reviewService.remove(myReview.id)
      await reload()
    } catch (err) {
      setActionError((err as ApiError).message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <Spinner size="sm" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    )
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {summary && summary.total_reviews > 0 && (
          <span className="flex items-center gap-2 text-sm text-gray-600">
            <StarRating value={Math.round(summary.average_rating)} />
            {summary.average_rating.toFixed(1)} · {summary.total_reviews} review
            {summary.total_reviews > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isAuthed && !myReview && !editing && (
        <ReviewForm submitLabel="Submit review" onSubmit={submitNew} />
      )}

      {myReview && editing && (
        <ReviewForm
          submitLabel="Save review"
          initial={{
            rating: myReview.rating,
            title: myReview.title ?? undefined,
            comment: myReview.comment ?? undefined,
          }}
          onSubmit={submitEdit}
          onCancel={() => setEditing(false)}
        />
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="divide-y divide-surface-border">
          {reviews.map((review) => (
            <li key={review.id} className="py-3">
              <div className="flex items-center justify-between gap-2">
                <StarRating value={review.rating} />
                <span className="text-xs text-gray-400">
                  {formatDateTime(review.created_at)}
                </span>
              </div>
              {review.title && <p className="mt-1 font-medium">{review.title}</p>}
              {review.comment && (
                <p className="text-sm text-gray-700">{review.comment}</p>
              )}
              {review.organizer_response && (
                <p className="mt-2 rounded bg-surface-muted p-2 text-sm text-gray-700">
                  <span className="font-medium">Organizer: </span>
                  {review.organizer_response}
                </p>
              )}
              {review.id === myReview?.id && !editing && (
                <div className="mt-2 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={deleting}
                    onClick={deleteMine}
                  >
                    Delete
                  </Button>
                </div>
              )}
              {canRespond && !review.organizer_response && (
                <RespondForm
                  onSubmit={async (text) => {
                    await reviewService.respond(review.id, text)
                    await reload()
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}
    </Card>
  )
}

/** Inline organizer-response form shown under a review. */
function RespondForm({ onSubmit }: { onSubmit: (text: string) => Promise<void> }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(text.trim())
      setText('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <Textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Respond as the organizer…"
        aria-label="Organizer response"
      />
      <Button type="submit" size="sm" loading={submitting}>
        Respond
      </Button>
    </form>
  )
}
