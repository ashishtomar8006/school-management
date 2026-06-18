import { api } from '../client'
import type { ApiResponse } from '../types'

export interface StudentCategory {
  id: string
  name: string
  status: 'active' | 'inactive'
  createdAt?: string
}

export const studentCategoriesApi = {
  list:   (params?: { status?: string; search?: string }) =>
    api.get<ApiResponse<StudentCategory[]>>('/student-categories', params),
  create: (data: { name: string; status?: 'active' | 'inactive' }) =>
    api.post<ApiResponse<StudentCategory>>('/student-categories', data),
  update: (id: string, data: { name?: string; status?: 'active' | 'inactive' }) =>
    api.put<ApiResponse<StudentCategory>>(`/student-categories/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/student-categories/${id}`),
}
