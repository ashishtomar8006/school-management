import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down'
  index?: number
}

const colorVariants = [
  { bg: 'bg-orange-50 dark:bg-orange-950/20', icon: 'bg-orange-500 text-white' },
  { bg: 'bg-blue-50 dark:bg-blue-950/20', icon: 'bg-blue-500 text-white' },
  { bg: 'bg-purple-50 dark:bg-purple-950/20', icon: 'bg-purple-600 text-white' },
  { bg: 'bg-teal-50 dark:bg-teal-950/20', icon: 'bg-primary text-white' },
  { bg: 'bg-green-50 dark:bg-green-950/20', icon: 'bg-green-600 text-white' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/20', icon: 'bg-cyan-500 text-white' }
]

export function StatCard({ title, value, icon: Icon, description, trend, index = 0 }: StatCardProps) {
  const color = colorVariants[index % colorVariants.length]
  
  return (
    <Card className={`border-0 ${color.bg} backdrop-blur shadow-sm hover:shadow-md transition-all`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-tight">
          {title}
        </CardTitle>
        <div className={`p-3 rounded-full ${color.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && (
          <p className={`text-xs font-medium mt-2 ${trend === 'up' ? 'text-green-600 dark:text-green-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface ActivityItemProps {
  title: string
  description?: string
  timestamp?: string
  icon?: LucideIcon
  type?: 'default' | 'success' | 'warning' | 'error'
}

export function ActivityItem({ title, description, timestamp, icon: Icon, type = 'default' }: ActivityItemProps) {
  const bgColor = {
    default: 'bg-indigo-50 dark:bg-indigo-500/10',
    success: 'bg-emerald-50 dark:bg-emerald-500/10',
    warning: 'bg-amber-50 dark:bg-amber-500/10',
    error: 'bg-red-50 dark:bg-red-500/10'
  }[type]

  const borderColor = {
    default: 'border-indigo-200 dark:border-indigo-500/30',
    success: 'border-emerald-200 dark:border-emerald-500/30',
    warning: 'border-amber-200 dark:border-amber-500/30',
    error: 'border-red-200 dark:border-red-500/30'
  }[type]

  const iconColor = {
    default: 'text-indigo-600 dark:text-indigo-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400'
  }[type]

  return (
    <div className={`p-4 rounded-xl border ${bgColor} ${borderColor} backdrop-blur`}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />}
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {timestamp && (
          <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">{timestamp}</p>
        )}
      </div>
    </div>
  )
}

interface SectionTitleProps {
  title: string
  description?: string
}

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}
