'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { sectionsApi, SectionItem } from '@/lib/api/endpoints/sections'
import { useQuery, useMutation } from './use-query'

export function useSections() {
  const fetcher = useCallback(() => sectionsApi.list(), [])
  const { data: sections, loading, error, refetch } = useQuery<SectionItem[]>(fetcher)

  const { mutate: createSection, loading: creating } = useMutation(
    (data: { name: string; status?: 'active' | 'inactive' }) => sectionsApi.create(data),
    { onSuccess: () => { toast.success('Section created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateSection, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: { name?: string; status?: 'active' | 'inactive' } }) =>
      sectionsApi.update(id, data),
    { onSuccess: () => { toast.success('Section updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteSection, loading: deleting } = useMutation(
    (id: string) => sectionsApi.delete(id),
    { onSuccess: () => { toast.success('Section deleted.'); refetch() }, onError: toast.error }
  )

  return {
    sections: sections ?? [],
    loading, error, refetch,
    createSection, updateSection, deleteSection,
    creating, updating, deleting,
  }
}
