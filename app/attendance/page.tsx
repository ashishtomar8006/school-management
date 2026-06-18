'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Briefcase } from 'lucide-react'

export default function AttendancePage() {
  const { user } = useAuth()
  const router = useRouter()

  const isStudentOrParent = user?.role === 'student' || user?.role === 'parent'

  useEffect(() => {
    if (isStudentOrParent) router.replace('/attendance/student')
  }, [isStudentOrParent, router])

  if (isStudentOrParent) return null

  return (
    <DashboardLayout title="Attendance Management">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Attendance</h2>
        <p className="text-sm text-slate-500">Select an attendance category below.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Student Attendance', icon: Users,     href: '/attendance/student',  desc: 'Mark and view student attendance' },
            { label: 'Teacher Attendance', icon: Calendar,  href: '/attendance/teacher',  desc: 'Track teacher daily attendance' },
            { label: 'Employee Attendance',icon: Briefcase, href: '/attendance/employee', desc: 'Admin and support staff records' },
          ].map(item => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className="p-6 rounded-xl border border-border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary dark:text-teal-400" />
              </div>
              <p className="font-semibold text-foreground mb-1">{item.label}</p>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
