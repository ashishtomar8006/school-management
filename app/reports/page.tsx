'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard-components'
import { useOverviewReport, useAttendanceReport, useFeeReport } from '@/hooks/use-reports'
import { Users, Calendar, DollarSign, AlertCircle, BarChart3, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const FEE_COLORS = ['#22c55e', '#eab308', '#ef4444']

export default function ReportsPage() {
  const { data: overview, loading: loadingOverview } = useOverviewReport()
  const { data: attendance, loading: loadingAttendance } = useAttendanceReport()
  const { data: fees, loading: loadingFees } = useFeeReport()

  const loading = loadingOverview || loadingAttendance || loadingFees

  const attendanceChartData = Object.entries(
    (attendance ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.date] = (acc[row.date] ?? 0) + (row.status === 'present' ? Number(row.count) : 0)
      return acc
    }, {})
  ).slice(-7).map(([date, count]) => ({ date: date.slice(5), count }))

  const feeChartData = (fees ?? []).map(f => ({
    name: f.status.charAt(0).toUpperCase() + f.status.slice(1),
    value: Number(f.count),
    amount: Number(f.total),
  }))

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Reports & Analytics</h2>

        {loadingOverview ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard title="Total Students"   value={overview?.totalStudents ?? 0}     icon={Users}       index={0} />
            <StatCard title="Total Teachers"   value={overview?.totalTeachers ?? 0}     icon={Users}       index={1} />
            <StatCard title="Avg Attendance"   value={`${overview?.avgAttendance ?? 0}%`} icon={Calendar}  trend="up" index={2} />
            <StatCard title="Pending Complaints" value={overview?.pendingComplaints ?? 0} icon={AlertCircle} index={3} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Attendance chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Attendance — Last 7 Days</CardTitle></CardHeader>
            <CardContent>
              {loadingAttendance ? (
                <div className="flex justify-center h-48 items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : attendanceChartData.length === 0 ? (
                <div className="flex justify-center h-48 items-center text-slate-400 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="Present" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Fee pie chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Fee Collection Status</CardTitle></CardHeader>
            <CardContent>
              {loadingFees ? (
                <div className="flex justify-center h-48 items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : feeChartData.length === 0 ? (
                <div className="flex justify-center h-48 items-center text-slate-400 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={feeChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {feeChartData.map((_, i) => <Cell key={i} fill={FEE_COLORS[i % FEE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n, p) => [`${v} records · ₹${Number(p.payload.amount).toLocaleString()}`, n]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance breakdown */}
        {overview && (
          <Card>
            <CardHeader><CardTitle className="text-base">Overall Attendance Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(overview.attendanceBreakdown).map(([status, count], i) => (
                  <div key={status} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-center">
                    <p className="text-2xl font-bold text-foreground">{count as number}</p>
                    <p className="text-xs text-slate-500 capitalize mt-1">{status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
