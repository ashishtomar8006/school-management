'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { BarChart3, Users, Calendar, DollarSign, BookOpen, Bell, MessageSquare, AlertCircle, Bus, GraduationCap } from 'lucide-react'

const BOTTOM_NAV: Record<string, { label: string; icon: React.ElementType; href: string }[]> = {
  admin: [
    { label: 'Home',       icon: BarChart3,     href: '/dashboard' },
    { label: 'Principals', icon: GraduationCap, href: '/admin/principals' },
  ],
  principal: [
    { label: 'Home', icon: BarChart3, href: '/dashboard' },
    { label: 'Students', icon: Users, href: '/students' },
    { label: 'Buses', icon: Bus, href: '/buses' },
    { label: 'Attendance', icon: Calendar, href: '/attendance' },
    { label: 'Messages', icon: MessageSquare, href: '/messages' },
  ],
  teacher: [
    { label: 'Home', icon: BarChart3, href: '/dashboard' },
    { label: 'Attendance', icon: Calendar, href: '/attendance' },
    { label: 'Homework', icon: BookOpen, href: '/homework' },
    { label: 'Notices', icon: Bell, href: '/notices' },
    { label: 'Messages', icon: MessageSquare, href: '/messages' },
  ],
  student: [
    { label: 'Home', icon: BarChart3, href: '/dashboard' },
    { label: 'Attendance', icon: Calendar, href: '/attendance' },
    { label: 'Homework', icon: BookOpen, href: '/homework' },
    { label: 'Fees', icon: DollarSign, href: '/fees' },
    { label: 'Notices', icon: Bell, href: '/notices' },
  ],
  parent: [
    { label: 'Home', icon: BarChart3, href: '/dashboard' },
    { label: 'Attendance', icon: Calendar, href: '/attendance' },
    { label: 'Fees', icon: DollarSign, href: '/fees' },
    { label: 'Messages', icon: MessageSquare, href: '/messages' },
    { label: 'Notices', icon: Bell, href: '/notices' },
  ],
}

export function BottomNav() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const items = BOTTOM_NAV[user.role] || []

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {items.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 relative transition-colors tap-highlight-none',
                isActive
                  ? 'text-primary dark:text-teal-400'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-2 right-2 h-0.5 bg-primary dark:bg-teal-400 rounded-b-full" />
              )}
              <Icon className={cn('w-[22px] h-[22px] transition-transform', isActive && 'scale-110')} />
              <span className="text-[10px] font-semibold leading-none tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
