'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard, ActivityItem } from '@/components/dashboard-components'
import { useHomework } from '@/hooks/use-homework'
import { useStudentAttendance } from '@/hooks/use-attendance'
import { useNotices } from '@/hooks/use-notices'
import { BookOpen, Calendar, Bell, Users } from 'lucide-react'

export function TeacherDashboard() {
  const { homework } = useHomework()
  const { records } = useStudentAttendance({ date: new Date().toISOString().split('T')[0] })
  const { notices } = useNotices()

  const pending    = homework?.filter(h => new Date(h.dueDate) >= new Date()).length ?? 0
  const presentToday = records.filter(r => r.status === 'present').length
  const newNotices = notices?.length ?? 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="My Homework"      value={homework?.length ?? 0} icon={BookOpen} description="Total assigned" index={0} />
        <StatCard title="Active Tasks"     value={pending}               icon={Calendar}  description="Due upcoming"   index={1} />
        <StatCard title="Present Today"    value={presentToday}          icon={Users}     description="Students"       index={2} />
        <StatCard title="Notices"          value={newNotices}            icon={Bell}      description="Announcements"  index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Homework</CardTitle></CardHeader>
          <CardContent>
            {(homework ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No homework assigned yet</p>
            ) : (
              <div className="space-y-2">
                {(homework ?? []).slice(0, 5).map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <div>
                      <p className="text-sm font-medium text-foreground">{h.title}</p>
                      <p className="text-xs text-slate-500">{h.subject} · Class {h.class} · Due {h.dueDate}</p>
                    </div>
                    <span className="text-xs text-slate-400">{h.submissions?.length ?? 0} subs</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
    </div>
  )
}
