/** A page of items plus pagination metadata (mirrors the backend PaginatedResponse). */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}
