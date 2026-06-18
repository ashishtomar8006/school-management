'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { studentCategoriesApi, StudentCategory } from '@/lib/api/endpoints/studentCategories'
import { useQuery, useMutation } from './use-query'

export function useStudentCategories() {
  const fetcher = useCallback(() => studentCategoriesApi.list(), [])
  const { data: categories, loading, error, refetch } = useQuery<StudentCategory[]>(fetcher)

  const { mutate: createCategory, loading: creating } = useMutation(
    (data: { name: string; status?: 'active' | 'inactive' }) => studentCategoriesApi.create(data),
    { onSuccess: () => { toast.success('Category created.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateCategory, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: { name?: string; status?: 'active' | 'inactive' } }) =>
      studentCategoriesApi.update(id, data),
    { onSuccess: () => { toast.success('Category updated.'); refetch() }, onError: toast.error }
  )

  const { mutate: deleteCategory, loading: deleting } = useMutation(
    (id: string) => studentCategoriesApi.delete(id),
    { onSuccess: () => { toast.success('Category deleted.'); refetch() }, onError: toast.error }
  )

  return {
    categories: categories ?? [],
    loading, error, refetch,
    createCategory, updateCategory, deleteCategory,
    creating, updating, deleting,
  }
}
