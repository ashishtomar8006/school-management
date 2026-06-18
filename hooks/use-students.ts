'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { studentsApi, StudentParams, CreateStudentPayload, StudentProfile } from '@/lib/api/endpoints/students'
import { usePaginatedQuery, useQuery, useMutation } from './use-query'

export function useStudents(initialParams?: StudentParams) {
  const [params, setParams] = useState<StudentParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => studentsApi.list(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: students, pagination, loading, error, refetch } = usePaginatedQuery<StudentProfile>(fetcher)

  const { mutate: createStudent, loading: creating } = useMutation(
    (data: CreateStudentPayload) => studentsApi.create(data),
    { onSuccess: () => { toast.success('Student created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateStudent, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateStudentPayload> & { isActive?: boolean } }) =>
      studentsApi.update(id, data),
    { onSuccess: () => { toast.success('Student updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteStudent, loading: deleting } = useMutation(
    (id: string) => studentsApi.delete(id),
    { onSuccess: () => { toast.success('Student deactivated.'); refetch() }, onError: toast.error }
  )

  return {
    students,
    pagination,
    loading,
    error,
    params,
    setParams,
    refetch,
    createStudent,
    updateStudent,
    deleteStudent,
    creating,
    updating,
    deleting,
  }
}

// Fetch a single student by ID (used on edit page)
export function useStudent(id: string) {
  const fetcher = useCallback(
    () => studentsApi.getById(id),
    [id]
  )
  const { data: student, loading, error, refetch } = useQuery<StudentProfile>(fetcher, { enabled: !!id })

  const { mutate: updateStudent, loading: updating } = useMutation(
    (data: Partial<CreateStudentPayload>) => studentsApi.update(id, data),
    { onSuccess: () => { toast.success('Student updated.') }, onError: toast.error }
  )

  return { student, loading, error, refetch, updateStudent, updating }
}

export function useStudentAttendanceSummary(studentId: string) {
  const fetcher = useCallback(
    () => studentsApi.getAttendanceSummary(studentId),
    [studentId]
  )
  return useQuery(fetcher, { enabled: !!studentId })
}
