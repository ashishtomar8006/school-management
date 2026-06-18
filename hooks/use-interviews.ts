'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  interviewsApi,
  Interview,
  InterviewParams,
  CreateInterviewPayload,
  UpdateInterviewPayload,
} from '@/lib/api/endpoints/interviews'
import { usePaginatedQuery, useMutation } from './use-query'

export function useInterviews(initialParams?: InterviewParams) {
  const [params, setParams] = useState<InterviewParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => interviewsApi.list(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: interviews, pagination, loading, error, refetch } = usePaginatedQuery<Interview>(fetcher)

  const { mutate: createInterview, loading: creating } = useMutation(
    (data: CreateInterviewPayload) => interviewsApi.create(data),
    { onSuccess: () => { toast.success('Candidate added.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateInterview, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: UpdateInterviewPayload }) =>
      interviewsApi.update(id, data),
    { onSuccess: () => { toast.success('Interview updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteInterview, loading: deleting } = useMutation(
    (id: string) => interviewsApi.delete(id),
    { onSuccess: () => { toast.success('Interview deleted.'); refetch() }, onError: toast.error }
  )

  return {
    interviews,
    pagination,
    loading,
    error,
    params,
    setParams,
    refetch,
    createInterview,
    updateInterview,
    deleteInterview,
    creating,
    updating,
    deleting,
  }
}
