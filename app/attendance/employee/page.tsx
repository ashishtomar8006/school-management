'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useEmployeeAttendance } from '@/hooks/use-attendance'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  present:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  absent:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  late:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  half_day: 'bg-orange-100 text-orange-800',
  leave:    'bg-slate-100 text-slate-600 dark:bg-slate-800',
}

export default function EmployeeAttendancePage() {
  const { records, loading } = useEmployeeAttendance()

  return (
    <DashboardLayout title="Employee Attendance">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Employee Attendance</h2>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-slate-400"><p>No employee attendance records found</p></div>
        ) : (
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Employee','Type','Date','Check In','Check Out','Status'].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-medium">{r.employee?.name ?? '—'}</td>
                        <td className="py-3 px-4 text-slate-500 capitalize">{r.employeeType}</td>
                        <td className="py-3 px-4 text-slate-500">{r.date}</td>
                        <td className="py-3 px-4 text-slate-500">{r.checkInTime ?? '—'}</td>
                        <td className="py-3 px-4 text-slate-500">{r.checkOutTime ?? '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status] ?? ''}`}>
                            {r.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
