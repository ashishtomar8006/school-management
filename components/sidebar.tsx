'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useSchoolSettings } from '@/lib/school-settings'
import { cn } from '@/lib/utils'
import {
  BarChart3, Users, Calendar, AlertCircle, DollarSign,
  BookOpen, Bell, MessageSquare, LogOut, School,
  Shield, Wallet, Presentation, User, Clock, Bus, Tag, Award, ClipboardList, GraduationCap,
} from 'lucide-react'
import { DropdownNav } from './dropdown-nav'

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard',        icon: BarChart3,     href: '/dashboard',        type: 'link' as const },
    { label: 'Manage Principals', icon: GraduationCap, href: '/admin/principals', type: 'link' as const },
  ],
  principal: [
    { label: 'Dashboard', icon: BarChart3, href: '/dashboard', type: 'link' as const },
    {
      label: 'Classes', icon: Presentation, type: 'dropdown' as const,
      items: [
        { label: 'Sections', href: '/classes/sections' },
        { label: 'Rooms',    href: '/classes/rooms' },
        { label: 'Classes',  href: '/classes/list' },
        { label: 'Subjects', href: '/classes/subjects' },
      ],
    },
    {
      label: 'Teachers', icon: Users, type: 'dropdown' as const,
      items: [
        { label: 'Add New Teacher',    href: '/teachers/add',       icon: User },
        { label: 'Teacher List',       href: '/teachers/list',      icon: Users },
        { label: 'Teacher Timetable',  href: '/teachers/timetable', icon: Clock },
      ],
    },
    {
      label: 'Attendance', icon: Calendar, type: 'dropdown' as const,
      items: [
        { label: 'Student Attendance',  href: '/attendance/student' },
        { label: 'Teacher Attendance',  href: '/attendance/teacher' },
        { label: 'Employee Attendance', href: '/attendance/employee' },
      ],
    },
    {
      label: 'Students', icon: Users, type: 'dropdown' as const,
      items: [
        { label: 'All Students',      href: '/students' },
        { label: 'Add New Student',   href: '/students/add' },
        { label: 'Student Category',  href: '/student-categories' },
      ],
    },
    { label: 'Bus Routes',        icon: Bus,           href: '/buses',          type: 'link' as const },
    { label: 'Salary Management', icon: Wallet,        href: '/salary',         type: 'link' as const },
    { label: 'Complaints',        icon: AlertCircle,   href: '/complaints',     type: 'link' as const },
    { label: 'Fees',              icon: DollarSign,    href: '/fees',           type: 'link' as const },
    { label: 'Homework',          icon: BookOpen,      href: '/homework',       type: 'link' as const },
    { label: 'Notices',           icon: Bell,          href: '/notices',        type: 'link' as const },
    { label: 'Reports',           icon: BarChart3,     href: '/reports',        type: 'link' as const },
    { label: 'Access Control',    icon: Shield,        href: '/access-control', type: 'link' as const },
    { label: 'Messages',          icon: MessageSquare, href: '/messages',       type: 'link' as const },
    {
      label: 'Examinations', icon: ClipboardList, type: 'dropdown' as const,
      items: [
        { label: 'Exams',         href: '/exams' },
        { label: 'Exam Schedule', href: '/exams/schedule' },
        { label: 'Exam Results',  href: '/exams/results' },
      ],
    },
    { label: 'Certificates',      icon: Award,         href: '/certificates',   type: 'link' as const },
  ],
  teacher: [
    { label: 'Dashboard', icon: BarChart3, href: '/dashboard', type: 'link' as const },
    {
      label: 'Classes', icon: Presentation, type: 'dropdown' as const,
      items: [
        { label: 'Sections', href: '/classes/sections' },
        { label: 'Rooms',    href: '/classes/rooms' },
        { label: 'Classes',  href: '/classes/list' },
        { label: 'Subjects', href: '/classes/subjects' },
      ],
    },
    {
      label: 'Attendance', icon: Calendar, type: 'dropdown' as const,
      items: [
        { label: 'Student Attendance', href: '/attendance/student' },
        { label: 'My Attendance',      href: '/attendance/teacher' },
      ],
    },
    { label: 'Homework', icon: BookOpen,      href: '/homework', type: 'link' as const },
    { label: 'Messages', icon: MessageSquare, href: '/messages', type: 'link' as const },
    { label: 'Notices',  icon: Bell,          href: '/notices',  type: 'link' as const },
  ],
  student: [
    { label: 'Dashboard',    icon: BarChart3,     href: '/dashboard',        type: 'link' as const },
    { label: 'My Attendance',icon: Calendar,      href: '/attendance/student',type: 'link' as const },
    { label: 'My Homework',  icon: BookOpen,      href: '/homework',         type: 'link' as const },
    { label: 'Fees',         icon: DollarSign,    href: '/fees',             type: 'link' as const },
    { label: 'Messages',     icon: MessageSquare, href: '/messages',         type: 'link' as const },
    { label: 'Notices',      icon: Bell,          href: '/notices',          type: 'link' as const },
  ],
  parent: [
    { label: 'Dashboard',       icon: BarChart3,     href: '/dashboard',        type: 'link' as const },
    { label: 'Child Attendance',icon: Calendar,      href: '/attendance/student',type: 'link' as const },
    { label: 'Fees',            icon: DollarSign,    href: '/fees',             type: 'link' as const },
    { label: 'Complaints',      icon: AlertCircle,   href: '/complaints',       type: 'link' as const },
    { label: 'Messages',        icon: MessageSquare, href: '/messages',         type: 'link' as const },
    { label: 'Notices',         icon: Bell,          href: '/notices',          type: 'link' as const },
  ],
}

function NavLink({
  href, label, icon: Icon, pathname,
}: { href: string; label: string; icon: React.ElementType; pathname: string }) {
  // Active if exact match OR starts with href (for nested routes), but /dashboard is exact only
  const isActive = href === '/dashboard'
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full',
        isActive
          ? 'bg-primary text-white shadow-md hover:bg-primary/90'
          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="truncate">{label}</span>
      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
    </Link>
  )
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const { settings } = useSchoolSettings()
  const pathname = usePathname()

  if (!user) return null

  const navItems = NAV_ITEMS[user.role as keyof typeof NAV_ITEMS] || []

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:bg-white dark:lg:bg-slate-950 lg:border-r lg:border-slate-200 dark:lg:border-slate-800 z-40">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        {settings.logoDataUrl ? (
          <img src={settings.logoDataUrl} alt="School logo" className="w-9 h-9 rounded-lg object-contain shrink-0 bg-primary/5 p-0.5" />
        ) : (
          <div className="p-2 bg-primary rounded-lg shrink-0">
            <School className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-bold text-sm text-primary leading-tight truncate">{settings.schoolName}</h1>
          {settings.tagline && <p className="text-[10px] text-muted-foreground truncate leading-tight">{settings.tagline}</p>}
        </div>
      </div>

      {/* User Info */}
      <div className="mx-3 mt-3 mb-1 shrink-0">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item: any) =>
          item.type === 'dropdown' ? (
            <DropdownNav
              key={item.label}
              label={item.label}
              icon={item.icon}
              items={item.items}
            />
          ) : (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              pathname={pathname}
            />
          )
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border shrink-0 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors w-full"
        >
          <Shield className="w-5 h-5 shrink-0" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => { logout(); window.location.href = '/' }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-destructive hover:bg-destructive/90 w-full transition-colors shadow-sm"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
