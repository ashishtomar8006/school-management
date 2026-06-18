'use client'

import { useCallback } from 'react'
import { reportsApi, OverviewReport, AttendanceChartRow, FeeReportRow, SalaryReportRow } from '@/lib/api/endpoints/reports'
import { useQuery } from './use-query'

export function useOverviewReport() {
  const fetcher = useCallback(() => reportsApi.overview(), [])
  return useQuery<OverviewReport>(fetcher)
}

export function useAttendanceReport(params?: { fromDate?: string; toDate?: string }) {
  const fetcher = useCallback(
    () => reportsApi.attendance(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  )
  return useQuery<AttendanceChartRow[]>(fetcher)
}

export function useFeeReport() {
  const fetcher = useCallback(() => reportsApi.fees(), [])
  return useQuery<FeeReportRow[]>(fetcher)
}

export function useSalaryReport(year?: number) {
  const fetcher = useCallback(
    () => reportsApi.salary({ year }),
    [year]
  )
  return useQuery<SalaryReportRow[]>(fetcher)
}
