'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useStudentAttendance, useAttendanceReport } from '@/hooks/use-attendance'
import { useStudents } from '@/hooks/use-students'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/dashboard-components'
import { AttendanceStatus } from '@/lib/api/endpoints/attendance'
import { Calendar, CheckCircle, X, Clock, Loader2, Download } from 'lucide-react'
import { useState } from 'react'

const STATUS_CFG: Record<AttendanceStatus, { label: string; short: string; active: string }> = {
  present: { label: 'Present', short: 'P', active: 'bg-green-600 text-white border-green-600' },
  absent:  { label: 'Absent',  short: 'A', active: 'bg-destructive text-white border-red-600' },
  late:    { label: 'Late',    short: 'L', active: 'bg-yellow-500 text-white border-yellow-500' },
  excused: { label: 'Excused', short: 'E', active: 'bg-blue-600 text-white border-blue-600' },
}

export default function StudentAttendancePage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const { records, loading, markAttendance, marking } = useStudentAttendance({ date: selectedDate })
  const { report, loading: reportLoading } = useAttendanceReport()
  const { students } = useStudents()

  const canMark = user?.role === 'principal' || user?.role === 'teacher'

  const getStatus = (studentId: string): AttendanceStatus | null => {
    const r = records.find(r => r.studentId === studentId)
    return r ? r.status : null
  }

  const handleMark = (studentId: string, status: AttendanceStatus) => {
    markAttendance({
      date: selectedDate,
      records: [{ studentId, status }],
    })
  }

  const presentCount = records.filter(r => r.status === 'present').length
  const absentCount  = records.filter(r => r.status === 'absent').length

  return (
    <DashboardLayout title="Student Attendance">
      <div className="space-y-4 md:space-y-6">
        {canMark && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Present" value={presentCount} icon={CheckCircle} index={1} />
            <StatCard title="Absent"  value={absentCount}  icon={X}           index={3} />
          </div>
        )}

        <Tabs defaultValue={canMark ? 'marking' : 'report'}>
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
            {canMark && <TabsTrigger value="marking">Mark</TabsTrigger>}
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          {canMark && (
            <TabsContent value="marking" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <CardTitle className="text-base">Mark Attendance</CardTitle>
                    <div className="flex gap-2 sm:ml-auto">
                      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : (
                    <div className="space-y-2">
                      {students.map(s => {
                        const current = getStatus(s.id)
                        return (
                          <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl border border-border">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-sm shrink-0">
                                {s.user?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{s.user?.name}</p>
                                <p className="text-xs text-slate-500">Roll: {s.rollNumber}</p>
                              </div>
                            </div>
                            <div className="flex gap-1.5 pl-12 sm:pl-0">
                              {(Object.keys(STATUS_CFG) as AttendanceStatus[]).map(st => (
                                <button key={st} onClick={() => handleMark(s.id, st)} disabled={marking}
                                  className={`h-9 min-w-11 sm:w-16 rounded-lg border text-xs font-semibold transition-all touch-manipulation
                                    ${current === st ? STATUS_CFG[st].active : 'border-border text-muted-foreground bg-white dark:bg-slate-900'}`}>
                                  <span className="sm:hidden">{STATUS_CFG[st].short}</span>
                                  <span className="hidden sm:inline">{STATUS_CFG[st].label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                      {students.length === 0 && <p className="text-center py-8 text-slate-400">No students found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="report" className="mt-4">
            {reportLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {['Student','Class','Total','Present','Absent','%','Status'].map(h => (
                            <th key={h} className="text-left py-3 px-3 font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.map(r => (
                          <tr key={r.studentId} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <td className="py-3 px-3 font-medium">{r.name}</td>
                            <td className="py-3 px-3 text-slate-500">{r.class}-{r.section}</td>
                            <td className="py-3 px-3">{r.total}</td>
                            <td className="py-3 px-3 text-green-600 font-medium">{r.present}</td>
                            <td className="py-3 px-3 text-red-600 font-medium">{r.absent}</td>
                            <td className="py-3 px-3">{r.percentage}%</td>
                            <td className="py-3 px-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.percentage >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                {r.percentage >= 75 ? 'Good' : 'Poor'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {report.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No data</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {canMark && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />Export PDF</Button>
            <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />Export Excel</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
