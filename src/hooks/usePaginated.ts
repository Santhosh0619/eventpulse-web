import { useCallback, useEffect, useState } from 'react'

import type { ApiError } from '@/services/api'
import type { Paginated } from '@/types/common'

interface UsePaginated<T> {
  data: Paginated<T> | null
  page: number
  setPage: (page: number) => void
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * Drive a paginated list. `fetcher` must be a stable (useCallback) function of
 * the page; pass filters via its closure and call `setPage(1)` when they change.
 */
export function usePaginated<T>(
  fetcher: (page: number) => Promise<Paginated<T>>,
): UsePaginated<T> {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    fetcher(page)
      .then((d) => !ignore && setData(d))
      .catch((err: ApiError) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [fetcher, page, nonce])

  return { data, page, setPage, loading, error, reload }
}
