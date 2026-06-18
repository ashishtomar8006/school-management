import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export type SubmissionStatus = 'submitted' | 'graded' | 'late'

export interface Homework {
  id: string
  title: string
  description?: string
  subject: string
  class: string
  section?: string
  dueDate: string
  assignedById: string
  attachments: string[]
  maxMarks: number
  createdAt: string
  assignedBy?: { id: string; name: string }
  submissions?: HomeworkSubmission[]
}

export interface HomeworkSubmission {
  id: string
  homeworkId: string
  studentId: string
  submittedAt: string
  marks?: number
  feedback?: string
  attachments: string[]
  status: SubmissionStatus
  student?: { id: string; user: { name: string } }
}

export interface HomeworkParams extends ListParams {
  class?: string
  section?: string
  subject?: string
}

export interface CreateHomeworkPayload {
  title: string
  description?: string
  subject: string
  class: string
  section?: string
  dueDate: string
  attachments?: string[]
  maxMarks?: number
}

export interface GradeSubmissionPayload {
  marks: number
  feedback?: string
}

export const homeworkApi = {
  list: (params?: HomeworkParams) =>
    api.get<PaginatedResponse<Homework>>('/homework', params),

  getById: (id: string) =>
    api.get<ApiResponse<Homework>>(`/homework/${id}`),

  create: (data: CreateHomeworkPayload) =>
    api.post<ApiResponse<Homework>>('/homework', data),

  update: (id: string, data: Partial<CreateHomeworkPayload>) =>
    api.put<ApiResponse<Homework>>(`/homework/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/homework/${id}`),

  submit: (id: string, attachments?: string[]) =>
    api.post<ApiResponse<HomeworkSubmission>>(`/homework/${id}/submit`, { attachments }),

  gradeSubmission: (id: string, submissionId: string, data: GradeSubmissionPayload) =>
    api.put<ApiResponse<HomeworkSubmission>>(`/homework/${id}/submissions/${submissionId}`, data),
}
