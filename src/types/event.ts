/** Domain types for events and categories (mirror the backend schemas).
 *
 * These are maintained by hand for now; run `npm run generate-types` against a
 * running backend to regenerate the full `src/types/api.ts` from its OpenAPI spec.
 */

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export interface EventSummary {
  id: string
  organization_id: string
  category_id: string | null
  title: string
  slug: string
  short_description: string | null
  city: string | null
  country: string | null
  start_datetime: string
  end_datetime: string
  status: EventStatus
  is_featured: boolean
  cover_image_url: string | null
}

export interface Event extends EventSummary {
  description: string | null
  venue_name: string | null
  venue_address: string | null
  latitude: number | null
  longitude: number | null
  timezone: string
  max_capacity: number | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  sort_order: number
  is_active: boolean
}

export interface EventSearchParams {
  page?: number
  limit?: number
  q?: string
  city?: string
  category_id?: string
  is_featured?: boolean
}
