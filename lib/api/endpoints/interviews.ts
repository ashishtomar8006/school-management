import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export type InterviewStatus =
  | 'applied' | 'shortlisted' | 'interview_scheduled'
  | 'offered' | 'rejected' | 'selected'

export interface Interview {
  id: string
  name: string
  email: string
  phone?: string
  position: string
  department?: string
  qualifications?: string
  experience: number
  resume?: string
  appliedDate: string
  status: InterviewStatus
  interviewDate?: string
  interviewTime?: string
  interviewerId?: string
  feedback?: string
  rating?: number
  interviewer?: { id: string; name: string }
}

export interface InterviewParams extends ListParams {
  status?: InterviewStatus
  department?: string
}

export interface CreateInterviewPayload {
  name: string
  email: string
  phone?: string
  position: string
  department?: string
  qualifications?: string
  experience?: number
  appliedDate?: string
}

export interface UpdateInterviewPayload extends Partial<CreateInterviewPayload> {
  status?: InterviewStatus
  interviewDate?: string
  interviewTime?: string
  interviewerId?: string
  feedback?: string
  rating?: number
}

export const interviewsApi = {
  list: (params?: InterviewParams) =>
    api.get<PaginatedResponse<Interview>>('/interviews', params),

  getById: (id: string) =>
    api.get<ApiResponse<Interview>>(`/interviews/${id}`),

  create: (data: CreateInterviewPayload) =>
    api.post<ApiResponse<Interview>>('/interviews', data),

  update: (id: string, data: UpdateInterviewPayload) =>
    api.put<ApiResponse<Interview>>(`/interviews/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/interviews/${id}`),
}
