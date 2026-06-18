import { api } from '../client'
import type { ApiResponse } from '../types'

export interface SectionItem {
  id: string
  name: string          // e.g. "A", "B", "C"
  status: 'active' | 'inactive'
  createdAt?: string
}

export const sectionsApi = {
  list:   (params?: { status?: string; search?: string }) =>
    api.get<ApiResponse<SectionItem[]>>('/sections', params),
  create: (data: { name: string; status?: 'active' | 'inactive' }) =>
    api.post<ApiResponse<SectionItem>>('/sections', data),
  update: (id: string, data: { name?: string; status?: 'active' | 'inactive' }) =>
    api.put<ApiResponse<SectionItem>>(`/sections/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/sections/${id}`),
}
