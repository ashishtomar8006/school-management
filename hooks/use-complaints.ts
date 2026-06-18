'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  complaintsApi,
  Complaint,
  ComplaintParams,
  CreateComplaintPayload,
  UpdateComplaintPayload,
} from '@/lib/api/endpoints/complaints'
import { usePaginatedQuery, useMutation } from './use-query'

export function useComplaints(initialParams?: ComplaintParams) {
  const [params, setParams] = useState<ComplaintParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => complaintsApi.list(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: complaints, pagination, loading, error, refetch } =
    usePaginatedQuery<Complaint>(fetcher)

  const { mutate: createComplaint, loading: creating } = useMutation(
    (data: CreateComplaintPayload) => complaintsApi.create(data),
    { onSuccess: () => { toast.success('Complaint filed.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateComplaint, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: UpdateComplaintPayload }) =>
      complaintsApi.update(id, data),
    { onSuccess: () => { toast.success('Complaint updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteComplaint, loading: deleting } = useMutation(
    (id: string) => complaintsApi.delete(id),
    { onSuccess: () => { toast.success('Complaint deleted.'); refetch() }, onError: toast.error }
  )

  return {
    complaints,
    pagination,
    loading,
    error,
    params,
    setParams,
    refetch,
    createComplaint,
    updateComplaint,
    deleteComplaint,
    creating,
    updating,
    deleting,
  }
}
