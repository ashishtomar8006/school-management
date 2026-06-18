'use client'

import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AttendanceRecord {
  id: string
  name: string
  department: string
  avatarBg: string
  avatarInitials: string
  records: Array<{
    date: string
    dayOfWeek: string
    status: 'present' | 'absent' | 'sick' | 'vacation' | 'holiday' | 'weekly_off' | 'training'
    hours?: number
  }>
}

const statusConfig = {
  present: { color: 'bg-teal-500', label: 'Present', dotColor: 'bg-teal-500' },
  absent: { color: 'bg-red-500', label: 'Sick', dotColor: 'bg-red-500' },
  sick: { color: 'bg-red-500', label: 'Sick', dotColor: 'bg-red-500' },
  vacation: { color: 'bg-blue-500', label: 'Vacation', dotColor: 'bg-blue-500' },
  training: { color: 'bg-orange-500', label: 'Training', dotColor: 'bg-orange-500' },
  holiday: { color: 'bg-purple-500', label: 'Holiday', dotColor: 'bg-purple-500' },
  weekly_off: { color: 'bg-gray-400', label: 'Weekly Off', dotColor: 'bg-gray-400' }
}

export function AttendanceTimeline({ records }: { records: AttendanceRecord[] }) {
  if (!records.length) return <div className="text-center py-8 text-slate-500">No attendance records</div>

  // Get all unique dates from all records
  const allDates = Array.from(
    new Set(records.flatMap(r => r.records.map(rec => rec.date)))
  ).sort()

  // Create header dates with day of week
  const dateHeaders = allDates.slice(0, 21).map((date, idx) => {
    const record = records[0].records.find(r => r.date === date)
    return {
      date,
      dayOfWeek: record?.dayOfWeek || 'M'
    }
  })

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.dotColor}`} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header - Employee Column + Dates */}
          <div className="flex border-b border-border">
            <div className="w-48 flex-shrink-0 p-4 font-semibold text-foreground sticky left-0 bg-background z-20">
              EMPLOYEE
            </div>
            <div className="flex flex-shrink-0">
              {dateHeaders.map((header, idx) => (
                <div
                  key={idx}
                  className="w-12 h-16 flex flex-col items-center justify-center border-r border-border text-xs font-semibold text-muted-foreground bg-slate-50 dark:bg-slate-900/50 px-1"
                >
                  <div>{header.dayOfWeek}</div>
                  <div className="text-slate-700 dark:text-slate-300 font-bold">{header.date.split('-')[2]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Rows */}
          {records.map((employee, empIdx) => (
            <div key={empIdx} className="flex border-b border-border hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
              {/* Employee Info */}
              <div className="w-48 flex-shrink-0 p-4 sticky left-0 bg-background z-10 flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
                  employee.avatarBg
                )}>
                  {employee.avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">{employee.department}</p>
                </div>
              </div>

              {/* Attendance Cells */}
              <div className="flex flex-shrink-0">
                {dateHeaders.map((header, dateIdx) => {
                  const record = employee.records.find(r => r.date === header.date)
                  const config = record ? statusConfig[record.status] : statusConfig.weekly_off
                  
                  return (
                    <div
                      key={dateIdx}
                      className={cn(
                        'w-12 h-12 flex items-center justify-center border-r border-border font-semibold text-white text-xs',
                        config.color,
                        'transition-all hover:shadow-md cursor-pointer'
                      )}
                      title={`${employee.name} - ${record?.status || 'weekly_off'}`}
                    >
                      {record?.hours ? `${record.hours}h` : '0h'}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
