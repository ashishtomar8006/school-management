import { api } from '../client'
import type { ApiResponse } from '../types'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type EmployeeAttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'leave'

export interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  status: AttendanceStatus
  remarks?: string
  markedById?: string
  student?: {
    id: string
    rollNumber: string
    class: string
    section: string
    user: { name: string; email: string }
  }
}

export interface AttendanceReportRow {
  studentId: string
  name: string
  class: string
  section: string
  rollNumber: string
  total: number
  present: number
  absent: number
  late: number
  percentage: number
}

export interface EmployeeAttendanceRecord {
  id: string
  employeeId: string
  employeeType: 'teacher' | 'admin' | 'support'
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: EmployeeAttendanceStatus
  leaveType?: string
  remarks?: string
  employee?: { name: string; email: string; role: string }
}

export interface MarkAttendancePayload {
  date: string
  records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
}

export interface AttendanceParams {
  studentId?: string
  date?: string
  fromDate?: string
  toDate?: string
  class?: string
  section?: string
}

export const attendanceApi = {
  // Student
  getStudentAttendance: (params?: AttendanceParams) =>
    api.get<ApiResponse<AttendanceRecord[]>>('/attendance/student', params),

  mark: (payload: MarkAttendancePayload) =>
    api.post<ApiResponse<{ updated: number }>>('/attendance/student', payload),

  updateRecord: (id: string, data: { status: AttendanceStatus; remarks?: string }) =>
    api.put<ApiResponse<AttendanceRecord>>(`/attendance/student/${id}`, data),

  getReport: (params?: AttendanceParams) =>
    api.get<ApiResponse<AttendanceReportRow[]>>('/attendance/student/report', params),

  // Employee
  getEmployeeAttendance: (params?: { employeeId?: string; date?: string; fromDate?: string; toDate?: string; employeeType?: string }) =>
    api.get<ApiResponse<EmployeeAttendanceRecord[]>>('/attendance/employee', params),

  markEmployeeAttendance: (data: Omit<EmployeeAttendanceRecord, 'id' | 'employee'>) =>
    api.post<ApiResponse<EmployeeAttendanceRecord>>('/attendance/employee', data),
}
