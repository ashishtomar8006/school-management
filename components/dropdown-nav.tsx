'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface SubItem {
  label: string
  href: string
  icon?: LucideIcon
}

interface DropdownNavProps {
  label: string
  icon: LucideIcon
  items: SubItem[]
}

export function DropdownNav({ label, icon: Icon, items }: DropdownNavProps) {
  const pathname = usePathname()

  // Auto-open when any child route is active
  const isChildActive = items.some(item => pathname.startsWith(item.href))
  const [isOpen, setIsOpen] = useState(isChildActive)

  // Re-open automatically when navigating to a child route
  useEffect(() => {
    if (isChildActive) setIsOpen(true)
  }, [isChildActive])

  return (
    <div className="space-y-0.5">
      {/* Parent toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isChildActive
            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={cn('w-5 h-5 shrink-0', isChildActive ? 'text-primary dark:text-teal-400' : '')} />
          <span className="truncate">{label}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180',
            isChildActive ? 'text-primary dark:text-teal-400' : 'text-slate-400'
          )}
        />
      </button>

      {/* Submenu */}
      {isOpen && (
        <div className="ml-4 pl-3 border-l-2 border-border space-y-0.5">
          {items.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {item.icon && (
                  <item.icon className={cn('w-3.5 h-3.5 shrink-0', active ? 'text-white' : '')} />
                )}
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
