import { api } from '../client'
import type { ApiResponse } from '../types'

export interface ClassSection {
  id: string
  className: string
  sectionName: string
  classTeacherId?: string
  capacity: number
  academicYear?: string
  room?: string
  classTeacher?: { id: string; user: { name: string } }
}

export interface Subject {
  id: string
  subjectCode: string
  subjectName: string
  subjectType: 'theoretical' | 'practical' | 'both'
  credits: number
  department?: string
  description?: string
}

export interface ClassRoom {
  id: string
  roomNumber: string
  capacity: number
  floor: number
  facilities: string[]
  assignedClass?: string
  maintenanceStatus: 'good' | 'fair' | 'needs_repair'
}

export const classesApi = {
  // Sections
  listSections: (params?: { academicYear?: string }) =>
    api.get<ApiResponse<ClassSection[]>>('/classes/sections', params),

  createSection: (data: Omit<ClassSection, 'id' | 'classTeacher'>) =>
    api.post<ApiResponse<ClassSection>>('/classes/sections', data),

  updateSection: (id: string, data: Partial<ClassSection>) =>
    api.put<ApiResponse<ClassSection>>(`/classes/sections/${id}`, data),

  deleteSection: (id: string) =>
    api.delete<ApiResponse<null>>(`/classes/sections/${id}`),

  getSectionStudents: (id: string) =>
    api.get<ApiResponse<unknown[]>>(`/classes/sections/${id}/students`),

  // Subjects
  listSubjects: (params?: { department?: string }) =>
    api.get<ApiResponse<Subject[]>>('/classes/subjects', params),

  createSubject: (data: Omit<Subject, 'id'>) =>
    api.post<ApiResponse<Subject>>('/classes/subjects', data),

  updateSubject: (id: string, data: Partial<Subject>) =>
    api.put<ApiResponse<Subject>>(`/classes/subjects/${id}`, data),

  deleteSubject: (id: string) =>
    api.delete<ApiResponse<null>>(`/classes/subjects/${id}`),

  // Rooms
  listRooms: (params?: { maintenanceStatus?: string }) =>
    api.get<ApiResponse<ClassRoom[]>>('/classes/rooms', params),

  createRoom: (data: Omit<ClassRoom, 'id'>) =>
    api.post<ApiResponse<ClassRoom>>('/classes/rooms', data),

  updateRoom: (id: string, data: Partial<ClassRoom>) =>
    api.put<ApiResponse<ClassRoom>>(`/classes/rooms/${id}`, data),

  // Section ↔ Subject assignment
  getSectionSubjects: (sectionId: string) =>
    api.get<ApiResponse<ClassSubjectAssignment[]>>(`/classes/sections/${sectionId}/subjects`),

  assignSubject: (sectionId: string, data: { subjectId: string; teacherId?: string }) =>
    api.post<ApiResponse<ClassSubjectAssignment>>(`/classes/sections/${sectionId}/subjects`, data),

  removeSubject: (sectionId: string, subjectId: string) =>
    api.delete<ApiResponse<null>>(`/classes/sections/${sectionId}/subjects/${subjectId}`),
}

export interface ClassSubjectAssignment {
  id: string
  classSectionId: string
  subjectId: string
  teacherId?: string
  subject?: Subject
  teacher?: { id: string; user: { name: string } }
}
