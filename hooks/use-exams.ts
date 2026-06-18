'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { examsApi, Exam, ExamSchedule, ExamResult, ExamStatus } from '@/lib/api/endpoints/exams'
import { useQuery, usePaginatedQuery, useMutation } from './use-query'

export function useExams(params?: { status?: ExamStatus; class?: string }) {
  const fetcher = useCallback(
    () => examsApi.listExams(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: exams, pagination, loading, error, refetch } = usePaginatedQuery<Exam>(fetcher)

  const { mutate: createExam, loading: creating } = useMutation(
    (data: Partial<Exam>) => examsApi.createExam(data),
    { onSuccess: () => { toast.success('Exam created.'); refetch() }, onError: toast.error }
  )
  const { mutate: updateExam, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<Exam> }) => examsApi.updateExam(id, data),
    { onSuccess: () => { toast.success('Exam updated.'); refetch() }, onError: toast.error }
  )
  const { mutate: deleteExam, loading: deleting } = useMutation(
    (id: string) => examsApi.deleteExam(id),
    { onSuccess: () => { toast.success('Exam deleted.'); refetch() }, onError: toast.error }
  )

  return { exams, pagination, loading, error, refetch, createExam, updateExam, deleteExam, creating, updating, deleting }
}

export function useExamSchedules(examId?: string) {
  const fetcher = useCallback(
    () => examsApi.listSchedules(examId ? { examId } : undefined),
    [examId]
  )
  const { data: schedules, loading, error, refetch } = useQuery<ExamSchedule[]>(fetcher)

  const { mutate: createSchedule, loading: creating } = useMutation(
    (data: Partial<ExamSchedule>) => examsApi.createSchedule(data),
    { onSuccess: () => { toast.success('Schedule added.'); refetch() }, onError: toast.error }
  )
  const { mutate: updateSchedule, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<ExamSchedule> }) => examsApi.updateSchedule(id, data),
    { onSuccess: () => { toast.success('Schedule updated.'); refetch() }, onError: toast.error }
  )
  const { mutate: deleteSchedule, loading: deleting } = useMutation(
    (id: string) => examsApi.deleteSchedule(id),
    { onSuccess: () => { toast.success('Schedule deleted.'); refetch() }, onError: toast.error }
  )

  return { schedules: schedules ?? [], loading, error, refetch, createSchedule, updateSchedule, deleteSchedule, creating, updating, deleting }
}

export function useExamResults(params?: { examId?: string; studentId?: string }) {
  const fetcher = useCallback(
    () => examsApi.listResults(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: results, loading, error, refetch } = useQuery<ExamResult[]>(fetcher)

  const { mutate: saveResult, loading: saving } = useMutation(
    (data: Partial<ExamResult>) => examsApi.saveResult(data),
    { onSuccess: () => { toast.success('Result saved.'); refetch() }, onError: toast.error }
  )
  const { mutate: bulkSave, loading: bulkSaving } = useMutation(
    (data: Partial<ExamResult>[]) => examsApi.bulkSaveResults(data),
    { onSuccess: () => { toast.success('Results saved.'); refetch() }, onError: toast.error }
  )

  return { results: results ?? [], loading, error, refetch, saveResult, bulkSave, saving, bulkSaving }
}
