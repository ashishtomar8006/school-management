import { api } from '../client'
import type { ApiResponse } from '../types'

export interface OverviewReport {
  totalStudents: number
  totalTeachers: number
  pendingComplaints: number
  overdueFees: number
  totalNotices: number
  avgAttendance: number
  attendanceBreakdown: Record<string, number>
}

export interface AttendanceChartRow {
  date: string
  status: string
  count: number
}

export interface FeeReportRow {
  status: string
  total: number
  count: number
}

export interface SalaryReportRow {
  month: string
  year: number
  status: string
  totalPaid: number
  count: number
}

export const reportsApi = {
  overview: () =>
    api.get<ApiResponse<OverviewReport>>('/reports/overview'),

  attendance: (params?: { fromDate?: string; toDate?: string }) =>
    api.get<ApiResponse<AttendanceChartRow[]>>('/reports/attendance', params),

  fees: () =>
    api.get<ApiResponse<FeeReportRow[]>>('/reports/fees'),

  salary: (params?: { year?: number }) =>
    api.get<ApiResponse<SalaryReportRow[]>>('/reports/salary', params),
}
