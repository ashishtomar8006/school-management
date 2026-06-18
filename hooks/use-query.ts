'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiError } from '@/lib/api/client'

// ── useQuery ──────────────────────────────────────────────────────────────────

interface UseQueryOptions {
  enabled?: boolean
  onError?: (err: string) => void
}

interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useQuery<T>(
  fetcher: () => Promise<{ data: T }>,
  options: UseQueryOptions = {}
) {
  const { enabled = true, onError } = options
  const [state, setState] = useState<QueryState<T>>({ data: null, loading: enabled, error: null })
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const execute = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetcherRef.current()
      setState({ data: res.data, loading: false, error: null })
      return res.data
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'An unexpected error occurred.'
      setState(s => ({ ...s, loading: false, error: msg }))
      onError?.(msg)
    }
  }, [])

  useEffect(() => {
    if (enabled) execute()
  }, [enabled, execute])

  return { ...state, refetch: execute }
}

// ── usePaginatedQuery ─────────────────────────────────────────────────────────

interface PaginatedState<T> {
  data: T[]
  pagination: { total: number; page: number; limit: number; totalPages: number } | null
  loading: boolean
  error: string | null
}

export function usePaginatedQuery<T>(
  fetcher: () => Promise<{ data: T[]; pagination: PaginatedState<T>['pagination'] }>,
  options: UseQueryOptions = {}
) {
  const { enabled = true, onError } = options
  const [state, setState] = useState<PaginatedState<T>>({
    data: [], pagination: null, loading: enabled, error: null,
  })
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const execute = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetcherRef.current()
      setState({ data: res.data, pagination: res.pagination ?? null, loading: false, error: null })
      return res.data
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'An unexpected error occurred.'
      setState(s => ({ ...s, loading: false, error: msg }))
      onError?.(msg)
    }
  }, [])

  useEffect(() => {
    if (enabled) execute()
  }, [enabled, execute])

  return { ...state, refetch: execute }
}

// ── useMutation ───────────────────────────────────────────────────────────────

interface MutationOptions<TResult> {
  onSuccess?: (data: TResult) => void
  /**
   * Called for errors that are NOT field-level conflicts (409 with a `field`).
   * Field-level errors should be handled inline by the form — suppress the toast for those.
   */
  onError?: (message: string) => void
}

export function useMutation<TArgs, TResult = unknown>(
  mutationFn: (args: TArgs) => Promise<{ data: TResult; message?: string }>,
  options: MutationOptions<TResult> = {}
) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const mutate = async (args: TArgs): Promise<TResult> => {
    setLoading(true)
    setError(null)
    try {
      const res = await mutationFn(args)
      options.onSuccess?.(res.data)
      return res.data
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'An unexpected error occurred.'
      setError(msg)

      // Don't show a toast for 409 field-conflicts — the form displays those inline.
      // For everything else (5xx, 401, network errors) show the toast.
      const isFieldConflict = err instanceof ApiError && err.isFieldConflict
      if (!isFieldConflict) {
        options.onError?.(msg)
      }

      throw err   // always re-throw so forms can catch and set field errors
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error, reset: () => setError(null) }
}
