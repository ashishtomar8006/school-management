'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  feesApi,
  FeeRecord,
  FeeStructure,
  FeeRecordParams,
  ProcessPaymentPayload,
} from '@/lib/api/endpoints/fees'
import { useQuery, usePaginatedQuery, useMutation } from './use-query'

export function useFeeStructures(params?: { class?: string; academicYear?: string }) {
  const fetcher = useCallback(
    () => feesApi.listStructures(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: structures, loading, error, refetch } = useQuery<FeeStructure[]>(fetcher)

  const { mutate: createStructure, loading: creating } = useMutation(
    (data: Omit<FeeStructure, 'id'>) => feesApi.createStructure(data),
    { onSuccess: () => { toast.success('Fee structure created.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteStructure, loading: deleting } = useMutation(
    (id: string) => feesApi.deleteStructure(id),
    { onSuccess: () => { toast.success('Fee structure deleted.'); refetch() }, onError: toast.error }
  )

  const { mutate: generateFees, loading: generating } = useMutation(
    (id: string) => feesApi.generateFromStructure(id),
    { onSuccess: (d) => toast.success(`Generated ${(d as any)?.created ?? 0} fee records.`), onError: toast.error }
  )

  return { structures: structures ?? [], loading, error, refetch, createStructure, deleteStructure, generateFees, creating, deleting, generating }
}

export function useFeeRecords(initialParams?: FeeRecordParams) {
  const [params, setParams] = useState<FeeRecordParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => feesApi.listRecords(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: records, pagination, loading, error, refetch } = usePaginatedQuery<FeeRecord>(fetcher)

  const { mutate: processPayment, loading: paying } = useMutation(
    ({ id, data }: { id: string; data: ProcessPaymentPayload }) =>
      feesApi.processPayment(id, data),
    { onSuccess: () => { toast.success('Payment processed.'); refetch() }, onError: toast.error }
  )

  const { mutate: createRecord, loading: creating } = useMutation(
    (data: Omit<FeeRecord, 'id' | 'student'>) => feesApi.createRecord(data),
    { onSuccess: () => { toast.success('Fee record created.'); refetch() }, onError: toast.error }
  )

  return {
    records,
    pagination,
    loading,
    error,
    params,
    setParams,
    refetch,
    processPayment,
    createRecord,
    paying,
    creating,
  }
}
