/** Domain types for AI-powered recommendations (mirror the backend schema). */

import type { EventSummary } from '@/types/event'

/**
 * An AI-recommended event with an optional natural-language rationale.
 *
 * `reason` is present when Gemini curated the pick and `null` when the result
 * came from the heuristic fallback. `score` carries the heuristic relevance
 * score for fallback picks and is `null` for AI-curated picks.
 */
export interface AiRecommendedEvent {
  event: EventSummary
  reason: string | null
  score: number | null
}
