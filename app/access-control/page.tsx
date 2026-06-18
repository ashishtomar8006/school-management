'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

type Role = 'principal' | 'teacher' | 'student' | 'parent'

const PERMISSIONS: Record<Role, Record<string, string[]>> = {
  principal: {
    Students:   ['View', 'Create', 'Edit', 'Delete'],
    Teachers:   ['View', 'Create', 'Edit', 'Delete', 'Manage Salary'],
    Attendance: ['View', 'Mark', 'Edit Records', 'Reports'],
    Complaints: ['View', 'Create', 'Resolve', 'Assign'],
    Fees:       ['View', 'Manage', 'Process Payments', 'Reports'],
    Notices:    ['View', 'Create', 'Publish', 'Delete'],
    Reports:    ['View', 'Generate', 'Export'],
    Messages:   ['Send', 'Receive', 'View All'],
  },
  teacher: {
    Students:   ['View'],
    Attendance: ['View', 'Mark'],
    Complaints: ['View', 'Create'],
    Fees:       ['View'],
    Homework:   ['View', 'Create', 'Grade'],
    Notices:    ['View', 'Create'],
    Messages:   ['Send', 'Receive'],
  },
  student: {
    Attendance: ['View Own'],
    Homework:   ['View', 'Submit'],
    Fees:       ['View Own'],
    Notices:    ['View'],
    Messages:   ['Send', 'Receive'],
  },
  parent: {
    Attendance: ['View Child'],
    Fees:       ['View Child'],
    Complaints: ['View', 'Create'],
    Notices:    ['View'],
    Messages:   ['Send', 'Receive'],
  },
}

const ROLE_COLOR: Record<Role, string> = {
  principal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  teacher:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  student:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  parent:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

export default function AccessControlPage() {
  const [activeRole, setActiveRole] = useState<Role>('principal')

  return (
    <DashboardLayout title="Access Control">
      <div className="space-y-4 md:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Access Control</h2>
          <p className="text-sm text-slate-500 mt-1">Role-based permission overview</p>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PERMISSIONS) as Role[]).map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                activeRole === role
                  ? `${ROLE_COLOR[role]} border-transparent shadow-sm`
                  : 'bg-white dark:bg-slate-900 border-border text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {/* Permission grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(PERMISSIONS[activeRole]).map(([module, perms]) => (
            <Card key={module}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">{module}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {perms.map(p => (
                    <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {p}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center">Permissions are enforced server-side. This view is read-only.</p>
      </div>
    </DashboardLayout>
  )
}
