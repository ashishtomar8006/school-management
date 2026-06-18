'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  attendanceApi,
  AttendanceParams,
  AttendanceRecord,
  AttendanceReportRow,
  EmployeeAttendanceRecord,
  MarkAttendancePayload,
  AttendanceStatus,
} from '@/lib/api/endpoints/attendance'
import { useQuery, useMutation } from './use-query'

export function useStudentAttendance(initialParams?: AttendanceParams) {
  const [params, setParams] = useState<AttendanceParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => attendanceApi.getStudentAttendance(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: records, loading, error, refetch } = useQuery<AttendanceRecord[]>(fetcher)

  const { mutate: markAttendance, loading: marking } = useMutation(
    (payload: MarkAttendancePayload) => attendanceApi.mark(payload),
    { onSuccess: () => { toast.success('Attendance saved.'); refetch() }, onError: toast.error }
  )

  const { mutate: updateRecord, loading: updating } = useMutation(
    ({ id, status, remarks }: { id: string; status: AttendanceStatus; remarks?: string }) =>
      attendanceApi.updateRecord(id, { status, remarks }),
    { onSuccess: () => { toast.success('Record updated.'); refetch() }, onError: toast.error }
  )

  return {
    records: records ?? [],
    loading,
    error,
    params,
    setParams,
    refetch,
    markAttendance,
    updateRecord,
    marking,
    updating,
  }
}

export function useAttendanceReport(initialParams?: AttendanceParams) {
  const [params, setParams] = useState<AttendanceParams>(initialParams ?? {})

  const fetcher = useCallback(
    () => attendanceApi.getReport(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )

  const { data: report, loading, error, refetch } = useQuery<AttendanceReportRow[]>(fetcher)

  return { report: report ?? [], loading, error, params, setParams, refetch }
}

export function useEmployeeAttendance() {
  const fetcher = useCallback(() => attendanceApi.getEmployeeAttendance(), [])
  const { data: records, loading, error, refetch } = useQuery<EmployeeAttendanceRecord[]>(fetcher)

  const { mutate: markEmployee, loading: marking } = useMutation(
    (data: Omit<EmployeeAttendanceRecord, 'id' | 'employee'>) =>
      attendanceApi.markEmployeeAttendance(data),
    { onSuccess: () => { toast.success('Employee attendance marked.'); refetch() }, onError: toast.error }
  )

  return { records: records ?? [], loading, error, refetch, markEmployee, marking }
}
