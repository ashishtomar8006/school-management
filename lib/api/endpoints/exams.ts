import { api } from '../client'
import type { ApiResponse, PaginatedResponse, ListParams } from '../types'

export type ExamType   = 'unit_test' | 'midterm' | 'final' | 'quarterly' | 'half_yearly' | 'annual' | 'other'
export type ExamStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
export type ResultStatus = 'pass' | 'fail' | 'absent' | 'pending'

export interface Exam {
  id: string
  name: string
  examType: ExamType
  class?: string
  section?: string
  academicYear?: string
  startDate?: string
  endDate?: string
  totalMarks: number
  passingMarks: number
  status: ExamStatus
  description?: string
  schedules?: ExamSchedule[]
  createdAt?: string
}

export interface ExamSchedule {
  id: string
  examId: string
  subject: string
  date: string
  startTime?: string
  endTime?: string
  room?: string
  maxMarks: number
  invigilator?: string
  exam?: Pick<Exam, 'id' | 'name' | 'class' | 'section'>
}

export interface ExamResult {
  id: string
  examId: string
  studentId: string
  subject: string
  marksObtained?: number
  maxMarks: number
  grade?: string
  status: ResultStatus
  remarks?: string
  student?: { id: string; rollNumber: string; class: string; section: string; user: { name: string } }
  exam?: Pick<Exam, 'id' | 'name' | 'class' | 'section' | 'totalMarks' | 'passingMarks'>
}

export const examsApi = {
  // Exams
  listExams:    (params?: ListParams & { status?: ExamStatus; class?: string; academicYear?: string }) =>
    api.get<PaginatedResponse<Exam>>('/exams', params),
  getExam:      (id: string) => api.get<ApiResponse<Exam>>(`/exams/${id}`),
  createExam:   (data: Partial<Exam>) => api.post<ApiResponse<Exam>>('/exams', data),
  updateExam:   (id: string, data: Partial<Exam>) => api.put<ApiResponse<Exam>>(`/exams/${id}`, data),
  deleteExam:   (id: string) => api.delete<ApiResponse<null>>(`/exams/${id}`),

  // Schedules
  listSchedules:   (params?: { examId?: string; date?: string }) =>
    api.get<ApiResponse<ExamSchedule[]>>('/exams/schedules/list', params),
  createSchedule:  (data: Partial<ExamSchedule>) => api.post<ApiResponse<ExamSchedule>>('/exams/schedules', data),
  updateSchedule:  (id: string, data: Partial<ExamSchedule>) => api.put<ApiResponse<ExamSchedule>>(`/exams/schedules/${id}`, data),
  deleteSchedule:  (id: string) => api.delete<ApiResponse<null>>(`/exams/schedules/${id}`),

  // Results
  listResults:      (params?: { examId?: string; studentId?: string; subject?: string }) =>
    api.get<ApiResponse<ExamResult[]>>('/exams/results/list', params),
  saveResult:       (data: Partial<ExamResult>) => api.post<ApiResponse<ExamResult>>('/exams/results', data),
  bulkSaveResults:  (results: Partial<ExamResult>[]) => api.post<ApiResponse<{ updated: number }>>('/exams/results/bulk', { results }),
}
