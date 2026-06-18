'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useTeachers } from '@/hooks/use-teachers'
import { useEmployeeAttendance } from '@/hooks/use-attendance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

const STATUS_COLOR: Record<string, string> = {
  present:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  absent:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  late:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  half_day: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  leave:    'bg-slate-100 text-slate-600 dark:bg-slate-800',
}

export default function TeacherAttendancePage() {
  const { teachers, loading: teachersLoading } = useTeachers()
  const { records, loading: attLoading, markEmployee, marking } = useEmployeeAttendance()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const loading = teachersLoading || attLoading

  const getStatus = (teacherUserId: string) => {
    return records.find(r => r.employeeId === teacherUserId && r.date === date)?.status
  }

  const handleMark = (employeeId: string, status: string) => {
    markEmployee({ employeeId, employeeType: 'teacher', date, status: status as any })
  }

  return (
    <DashboardLayout title="Teacher Attendance">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Teacher Attendance</h2>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <CardContent className="pt-0">
              <div className="space-y-2 py-4">
                {teachers.map(t => {
                  const status = getStatus(t.userId)
                  return (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-sm">
                          {t.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t.user?.name}</p>
                          <p className="text-xs text-slate-500">{t.department}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {(['present','absent','late','leave'] as const).map(st => (
                          <button key={st} onClick={() => handleMark(t.userId, st)} disabled={marking}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all capitalize
                              ${status === st ? STATUS_COLOR[st] + ' border-transparent' : 'border-border text-muted-foreground bg-white dark:bg-slate-900 hover:bg-slate-50'}`}>
                            {st.charAt(0).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {teachers.length === 0 && <p className="text-center py-10 text-slate-400">No teachers found</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
