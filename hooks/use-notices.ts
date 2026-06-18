'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { noticesApi, Notice, NoticeParams, CreateNoticePayload } from '@/lib/api/endpoints/notices'
import { usePaginatedQuery, useMutation } from './use-query'

export function useNotices(initialParams?: NoticeParams) {
  const [params, setParams] = useState<NoticeParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => noticesApi.list(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: notices, pagination, loading, error, refetch } = usePaginatedQuery<Notice>(fetcher)

  const { mutate: createNotice, loading: creating } = useMutation(
    (data: CreateNoticePayload) => noticesApi.create(data),
    { onSuccess: () => { toast.success('Notice published.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateNotice, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateNoticePayload> }) =>
      noticesApi.update(id, data),
    { onSuccess: () => { toast.success('Notice updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteNotice, loading: deleting } = useMutation(
    (id: string) => noticesApi.delete(id),
    { onSuccess: () => { toast.success('Notice deleted.'); refetch() }, onError: toast.error }
  )

  return {
    notices,
    pagination,
    loading,
    error,
    params,
    setParams,
    refetch,
    createNotice,
    updateNotice,
    deleteNotice,
    creating,
    updating,
    deleting,
  }
}
