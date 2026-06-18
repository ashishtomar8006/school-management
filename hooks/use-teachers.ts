'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { teachersApi, TeacherParams, CreateTeacherPayload, TeacherProfile } from '@/lib/api/endpoints/teachers'
import { usePaginatedQuery, useMutation } from './use-query'

export function useTeachers(initialParams?: TeacherParams) {
  const [params, setParams] = useState<TeacherParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => teachersApi.list(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: teachers, pagination, loading, error, refetch } = usePaginatedQuery<TeacherProfile>(fetcher)

  const { mutate: createTeacher, loading: creating } = useMutation(
    (data: CreateTeacherPayload) => teachersApi.create(data),
    { onSuccess: () => { toast.success('Teacher created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateTeacher, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateTeacherPayload> & { isActive?: boolean } }) =>
      teachersApi.update(id, data),
    { onSuccess: () => { toast.success('Teacher updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteTeacher, loading: deleting } = useMutation(
    (id: string) => teachersApi.delete(id),
    { onSuccess: () => { toast.success('Teacher deactivated.'); refetch() }, onError: toast.error }
  )

  return {
    teachers,
    pagination,
    loading,
    error,
    params,
    setParams,
    refetch,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    creating,
    updating,
    deleting,
  }
}

export function useTeacher(id: string) {
  const fetcher = useCallback(() => teachersApi.getById(id), [id])
  const { data: teacher, loading, error, refetch } = usePaginatedQuery<TeacherProfile>(
    fetcher as any
  )
  return { teacher, loading, error, refetch }
}
