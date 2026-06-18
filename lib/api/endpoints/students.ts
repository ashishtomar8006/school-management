import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export interface StudentProfile {
  id: string
  userId: string
  principalId?: string
  rollNumber: string
  class: string
  section: string
  fatherName?: string
  motherName?: string
  dob?: string
  enrollmentDate?: string
  academicYear?: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
    address?: string
    isActive: boolean
  }
}

export interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  percentage: number
}

export interface StudentParams extends ListParams {
  class?: string
  section?: string
}

export interface CreateStudentPayload {
  name: string
  email: string
  password?: string
  phone?: string
  address?: string
  rollNumber: string
  class: string
  section: string
  fatherName?: string
  motherName?: string
  dob?: string
  enrollmentDate?: string
  academicYear?: string
}

export const studentsApi = {
  list: (params?: StudentParams) =>
    api.get<PaginatedResponse<StudentProfile>>('/students', params),

  getById: (id: string) =>
    api.get<ApiResponse<StudentProfile>>(`/students/${id}`),

  create: (data: CreateStudentPayload) =>
    api.post<ApiResponse<StudentProfile>>('/students', data),

  update: (id: string, data: Partial<CreateStudentPayload> & { isActive?: boolean }) =>
    api.put<ApiResponse<StudentProfile>>(`/students/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/students/${id}`),

  getAttendanceSummary: (id: string) =>
    api.get<ApiResponse<AttendanceSummary>>(`/students/${id}/attendance-summary`),
}
