import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export interface TeacherProfile {
  id: string
  userId: string
  principalId?: string
  department: string
  qualification: string
  experience: number
  subjects: string[]
  classes: string[]
  employeeCode?: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
    address?: string
    joinDate?: string
    isActive: boolean
  }
}

export interface TeacherParams extends ListParams {
  department?: string
}

export interface CreateTeacherPayload {
  name: string
  email: string
  password?: string
  phone?: string
  address?: string
  joinDate?: string
  department?: string
  qualification?: string
  experience?: number
  subjects?: string[]
  classes?: string[]
  employeeCode?: string
}

export const teachersApi = {
  list: (params?: TeacherParams) =>
    api.get<PaginatedResponse<TeacherProfile>>('/teachers', params),

  getById: (id: string) =>
    api.get<ApiResponse<TeacherProfile>>(`/teachers/${id}`),

  create: (data: CreateTeacherPayload) =>
    api.post<ApiResponse<TeacherProfile>>('/teachers', data),

  update: (id: string, data: Partial<CreateTeacherPayload> & { isActive?: boolean }) =>
    api.put<ApiResponse<TeacherProfile>>(`/teachers/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/teachers/${id}`),

  getSalaryHistory: (id: string) =>
    api.get<ApiResponse<unknown[]>>(`/teachers/${id}/salary`),
}
