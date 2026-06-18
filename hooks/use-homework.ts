'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  homeworkApi,
  Homework,
  HomeworkParams,
  CreateHomeworkPayload,
  GradeSubmissionPayload,
} from '@/lib/api/endpoints/homework'
import { usePaginatedQuery, useMutation } from './use-query'

export function useHomework(initialParams?: HomeworkParams) {
  const [params, setParams] = useState<HomeworkParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => homeworkApi.list(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: homework, pagination, loading, error, refetch } = usePaginatedQuery<Homework>(fetcher)

  const { mutate: createHomework, loading: creating } = useMutation(
    (data: CreateHomeworkPayload) => homeworkApi.create(data),
    { onSuccess: () => { toast.success('Homework assigned.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateHomework, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateHomeworkPayload> }) =>
      homeworkApi.update(id, data),
    { onSuccess: () => { toast.success('Homework updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteHomework, loading: deleting } = useMutation(
    (id: string) => homeworkApi.delete(id),
    { onSuccess: () => { toast.success('Homework deleted.'); refetch() }, onError: toast.error }
  )

  const { mutate: submitHomework, loading: submitting } = useMutation(
    ({ id, attachments }: { id: string; attachments?: string[] }) =>
      homeworkApi.submit(id, attachments),
    { onSuccess: () => toast.success('Homework submitted.'), onError: toast.error }
  )

  const { mutate: gradeSubmission, loading: grading } = useMutation(
    ({ hwId, subId, data }: { hwId: string; subId: string; data: GradeSubmissionPayload }) =>
      homeworkApi.gradeSubmission(hwId, subId, data),
    { onSuccess: () => { toast.success('Submission graded.'); refetch() }, onError: toast.error }
  )

  return {
    homework,
    pagination,
    loading,
    error,
    params,
    setParams,
    refetch,
    createHomework,
    updateHomework,
    deleteHomework,
    submitHomework,
    gradeSubmission,
    creating,
    updating,
    deleting,
    submitting,
    grading,
  }
}
