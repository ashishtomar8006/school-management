'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { classesApi, ClassSection, Subject, ClassRoom, ClassSubjectAssignment } from '@/lib/api/endpoints/classes'
import { useQuery, useMutation } from './use-query'

export function useClassSections(params?: { academicYear?: string }) {
  const fetcher = useCallback(
    () => classesApi.listSections(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: sections, loading, error, refetch } = useQuery<ClassSection[]>(fetcher)

  const { mutate: createSection, loading: creating } = useMutation(
    (data: Omit<ClassSection, 'id' | 'classTeacher'>) => classesApi.createSection(data),
    { onSuccess: () => { toast.success('Section created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateSection, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<ClassSection> }) => classesApi.updateSection(id, data),
    { onSuccess: () => { toast.success('Section updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteSection, loading: deleting } = useMutation(
    (id: string) => classesApi.deleteSection(id),
    { onSuccess: () => { toast.success('Section deleted.'); refetch() }, onError: toast.error }
  )

  return { sections: sections ?? [], loading, error, refetch, createSection, updateSection, deleteSection, creating, updating, deleting }
}

export function useSubjects(params?: { department?: string }) {
  const fetcher = useCallback(
    () => classesApi.listSubjects(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  const { data: subjects, loading, error, refetch } = useQuery<Subject[]>(fetcher)

  const { mutate: createSubject, loading: creating } = useMutation(
    (data: Omit<Subject, 'id'>) => classesApi.createSubject(data),
    { onSuccess: () => { toast.success('Subject created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateSubject, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<Subject> }) => classesApi.updateSubject(id, data),
    { onSuccess: () => { toast.success('Subject updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteSubject, loading: deleting } = useMutation(
    (id: string) => classesApi.deleteSubject(id),
    { onSuccess: () => { toast.success('Subject deleted.'); refetch() }, onError: toast.error }
  )

  return { subjects: subjects ?? [], loading, error, refetch, createSubject, updateSubject, deleteSubject, creating, updating, deleting }
}

export function useClassRooms() {
  const fetcher = useCallback(() => classesApi.listRooms(), [])
  const { data: rooms, loading, error, refetch } = useQuery<ClassRoom[]>(fetcher)

  const { mutate: createRoom, loading: creating } = useMutation(
    (data: Omit<ClassRoom, 'id'>) => classesApi.createRoom(data),
    { onSuccess: () => { toast.success('Room created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateRoom, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: Partial<ClassRoom> }) => classesApi.updateRoom(id, data),
    { onSuccess: () => { toast.success('Room updated.'); refetch() }, onError: toast.error }
  )

  return { rooms: rooms ?? [], loading, error, refetch, createRoom, updateRoom, creating, updating }
}

// ── Section subjects ──────────────────────────────────────────────────────────

export function useSectionSubjects(sectionId: string | null) {
  const fetcher = useCallback(
    () => classesApi.getSectionSubjects(sectionId!),
    [sectionId]
  )
  const { data: assignments, loading, error, refetch } = useQuery<ClassSubjectAssignment[]>(
    fetcher, { enabled: !!sectionId }
  )

  const { mutate: assignSubject, loading: assigning } = useMutation(
    ({ subjectId, teacherId }: { subjectId: string; teacherId?: string }) =>
      classesApi.assignSubject(sectionId!, { subjectId, teacherId }),
    { onSuccess: () => { toast.success('Subject assigned.'); refetch() }, onError: toast.error }
  )

  const { mutate: removeSubject, loading: removing } = useMutation(
    (subjectId: string) => classesApi.removeSubject(sectionId!, subjectId),
    { onSuccess: () => { toast.success('Subject removed.'); refetch() }, onError: toast.error }
  )

  return {
    assignments: assignments ?? [],
    loading, error, refetch,
    assignSubject, removeSubject,
    assigning, removing,
  }
}
