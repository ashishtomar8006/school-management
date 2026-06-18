'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { salaryApi, SalaryRecord, SalaryParams, CreateSalaryPayload } from '@/lib/api/endpoints/salary'
import { usePaginatedQuery, useMutation } from './use-query'

export function useSalary(initialParams?: SalaryParams) {
  const [params, setParams] = useState<SalaryParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => salaryApi.list(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: records, pagination, loading, error, refetch } = usePaginatedQuery<SalaryRecord>(fetcher)

  const { mutate: createRecord, loading: creating } = useMutation(
    (data: CreateSalaryPayload) => salaryApi.create(data),
    { onSuccess: () => { toast.success('Salary record created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateRecord, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateSalaryPayload> }) =>
      salaryApi.update(id, data),
    { onSuccess: () => { toast.success('Salary record updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: processPayment, loading: paying } = useMutation(
    ({ id, paymentMethod }: { id: string; paymentMethod: string }) =>
      salaryApi.processPayment(id, paymentMethod),
    { onSuccess: () => { toast.success('Salary paid.'); refetch() }, onError: toast.error }
  )

  const { mutate: bulkGenerate, loading: generating } = useMutation(
    ({ month, year }: { month: string; year: number }) =>
      salaryApi.bulkGenerate(month, year),
    { onSuccess: (d) => { toast.success(`Generated ${(d as any)?.created ?? 0} records.`); refetch() }, onError: toast.error }
  )

  return {
    records,
    pagination,
    loading,
    error,
    params,
    setParams,
    refetch,
    createRecord,
    updateRecord,
    processPayment,
    bulkGenerate,
    creating,
    updating,
    paying,
    generating,
  }
}
