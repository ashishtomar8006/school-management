import { api } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'

export interface PrincipalRecord {
  id:           string
  name:         string
  email:        string
  phone?:       string
  address?:     string
  schoolName?:  string
  isActive:     boolean
  studentCount: number
  teacherCount: number
  createdAt:    string
}

export interface AdminStats {
  totalPrincipals:    number
  activePrincipals:   number
  inactivePrincipals: number
  totalStudents:      number
  totalTeachers:      number
}

export interface CreatePrincipalPayload {
  name:        string
  email:       string
  password:    string
  phone?:      string
  address?:    string
  schoolName?: string
}

export const adminApi = {
  getStats: () =>
    api.get<ApiResponse<AdminStats>>('/admin/stats'),

  listPrincipals: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<PrincipalRecord>>('/admin/principals', params),

  getPrincipal: (id: string) =>
    api.get<ApiResponse<PrincipalRecord>>(`/admin/principals/${id}`),

  createPrincipal: (data: CreatePrincipalPayload) =>
    api.post<ApiResponse<PrincipalRecord>>('/admin/principals', data),

  updatePrincipal: (id: string, data: Partial<CreatePrincipalPayload>) =>
    api.put<ApiResponse<PrincipalRecord>>(`/admin/principals/${id}`, data),

  togglePrincipal: (id: string) =>
    api.put<ApiResponse<PrincipalRecord>>(`/admin/principals/${id}/toggle`, {}),

  deletePrincipal: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/principals/${id}`),
}
