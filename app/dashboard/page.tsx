'use client'

import { useAuth } from '@/lib/auth-context'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard, ActivityItem } from '@/components/dashboard-components'
import { TeacherDashboard } from './teacher'
import { useOverviewReport } from '@/hooks/use-reports'
import { useFeeRecords } from '@/hooks/use-fees'
import { useStudentAttendance, useAttendanceReport } from '@/hooks/use-attendance'
import { useComplaints } from '@/hooks/use-complaints'
import { useNotices } from '@/hooks/use-notices'
import { useHomework } from '@/hooks/use-homework'
import { Users, Calendar, AlertCircle, DollarSign, BookOpen, Bell, MessageSquare, Loader2, Shield, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { useAdminStats } from '@/hooks/use-admin'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function PrincipalDashboard() {
  const { data: overview, loading } = useOverviewReport()

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard title="Total Students"  value={overview?.totalStudents ?? 0}     icon={Users}       description="Active students" index={0} />
        <StatCard title="Teachers"        value={overview?.totalTeachers ?? 0}     icon={Users}       description="Staff members"  index={1} />
        <StatCard title="Avg Attendance"  value={`${overview?.avgAttendance ?? 0}%`} icon={Calendar}  description="Overall"       trend="up" index={2} />
        <StatCard title="Complaints"      value={overview?.pendingComplaints ?? 0} icon={AlertCircle} description="Pending"       index={3} />
        <StatCard title="Overdue Fees"    value={overview?.overdueFees ?? 0}       icon={DollarSign}  description="Needs collection" index={4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Attendance Breakdown</CardTitle></CardHeader>
          <CardContent>
            {overview?.attendanceBreakdown ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={Object.entries(overview.attendanceBreakdown).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center py-8 text-slate-400 text-sm">No data</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quick Stats</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[
              { label: 'Total Notices',   value: overview?.totalNotices ?? 0,       icon: Bell },
              { label: 'Pending Complaints', value: overview?.pendingComplaints ?? 0, icon: AlertCircle },
              { label: 'Overdue Fees',    value: overview?.overdueFees ?? 0,        icon: DollarSign },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary dark:text-teal-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
                </div>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StudentDashboard() {
  const { records } = useStudentAttendance()
  const { homework } = useHomework()
  const { notices } = useNotices()

  const r = records ?? []
  const present = r.filter((x: { status: string }) => x.status === 'present').length
  const pct = r.length ? Math.round((present / r.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Attendance" value={`${pct}%`}                 icon={Calendar}  description="Overall"         index={0} />
        <StatCard title="Homework"   value={homework?.length ?? 0}      icon={BookOpen}  description="Assignments"     index={1} />
        <StatCard title="Notices"    value={notices?.length ?? 0}       icon={Bell}      description="Announcements"   index={2} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Upcoming Homework</CardTitle></CardHeader>
        <CardContent>
          {(homework ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No homework</p>
          ) : (
            <div className="space-y-2">
              {(homework ?? []).slice(0, 4).map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.title}</p>
                    <p className="text-xs text-slate-500">{h.subject} · Due {h.dueDate}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${new Date(h.dueDate) < new Date() ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {new Date(h.dueDate) < new Date() ? 'Overdue' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ParentDashboard() {
  const { notices } = useNotices()
  const { records: feeRecords } = useFeeRecords()
  const pending = feeRecords?.filter(r => r.status !== 'paid').length ?? 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <StatCard title="Pending Fees" value={pending}               icon={DollarSign} description="Action required" trend={pending > 0 ? 'down' : undefined} index={0} />
        <StatCard title="Notices"      value={notices?.length ?? 0}  icon={Bell}       description="Announcements"   index={1} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Notices</CardTitle></CardHeader>
        <CardContent>
          {(notices ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No notices</p>
          ) : (
            <div className="space-y-2">
              {(notices ?? []).slice(0, 4).map(n => (
                <div key={n.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.category} · {new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard() {
  const { stats, loading } = useAdminStats()

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {loading ? (
          <div className="col-span-5 flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <StatCard title="Total Schools"     value={stats?.totalPrincipals    ?? 0} icon={GraduationCap} description="Registered"     index={0} />
            <StatCard title="Active Schools"    value={stats?.activePrincipals   ?? 0} icon={Shield}         description="Online"         index={1} trend="up" />
            <StatCard title="Inactive Schools"  value={stats?.inactivePrincipals ?? 0} icon={AlertCircle}    description="Deactivated"    index={2} trend="down" />
            <StatCard title="Total Students"    value={stats?.totalStudents      ?? 0} icon={Users}          description="All schools"    index={3} />
            <StatCard title="Total Teachers"    value={stats?.totalTeachers      ?? 0} icon={Users}          description="All schools"    index={4} />
          </>
        )}
      </div>

      {/* Quick action */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Admin Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/principals">
            <button className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary hover:text-white hover:border-primary transition-all text-sm font-semibold text-primary">
              <GraduationCap className="w-4 h-4" />Manage Principals
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const role = user?.role ?? ''
  const title = role ? `${role.charAt(0).toUpperCase()}${role.slice(1)} Dashboard` : 'Dashboard'

  return (
    <DashboardLayout title={title}>
      {user?.role === 'admin'     && <AdminDashboard />}
      {user?.role === 'principal' && <PrincipalDashboard />}
      {user?.role === 'teacher'   && <TeacherDashboard />}
      {user?.role === 'student'   && <StudentDashboard />}
      {user?.role === 'parent'    && <ParentDashboard />}
    </DashboardLayout>
  )
}
