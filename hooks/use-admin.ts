'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { adminApi, PrincipalRecord, CreatePrincipalPayload, AdminStats } from '@/lib/api/endpoints/admin'
import { useQuery, usePaginatedQuery, useMutation } from './use-query'

export function useAdminStats() {
  const fetcher = useCallback(() => adminApi.getStats(), [])
  const { data: stats, loading, error, refetch } = useQuery<AdminStats>(fetcher)
  return { stats, loading, error, refetch }
}

export function useAdminPrincipals(params?: { search?: string }) {
  const fetcher = useCallback(
    () => adminApi.listPrincipals({ ...params, limit: 100 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: principals, pagination, loading, error, refetch } = usePaginatedQuery<PrincipalRecord>(fetcher)

  const { mutate: createPrincipal, loading: creating } = useMutation(
    (data: CreatePrincipalPayload) => adminApi.createPrincipal(data),
    { onSuccess: () => { toast.success('Principal created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updatePrincipal, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<CreatePrincipalPayload> }) => adminApi.updatePrincipal(id, data),
    { onSuccess: () => { toast.success('Principal updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: togglePrincipal, loading: toggling } = useMutation(
    (id: string) => adminApi.togglePrincipal(id),
    { onSuccess: () => { toast.success('Status updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deletePrincipal, loading: deleting } = useMutation(
    (id: string) => adminApi.deletePrincipal(id),
    { onSuccess: () => { toast.success('Principal deleted.'); refetch() }, onError: toast.error }
  )

  return {
    principals: principals ?? [],
    pagination, loading, error, refetch,
    createPrincipal, updatePrincipal, togglePrincipal, deletePrincipal,
    creating, updating, toggling, deleting,
  }
}
