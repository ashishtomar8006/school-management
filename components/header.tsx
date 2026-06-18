'use client'

import { useAuth } from '@/lib/auth-context'
import { useSchoolSettings } from '@/lib/school-settings'
import { Button } from './ui/button'
import { Bell, Search, LogOut, Settings, School } from 'lucide-react'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth()
  const { settings } = useSchoolSettings()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <header className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 lg:px-6">
        {/* Left: mobile logo / desktop page title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile brand mark (sidebar is hidden on mobile) */}
          <div className="flex items-center gap-2 lg:hidden">
            {settings.logoDataUrl ? (
              <img src={settings.logoDataUrl} alt="logo" className="w-7 h-7 rounded-md object-contain shrink-0" />
            ) : (
              <div className="p-1.5 bg-primary rounded-lg shrink-0">
                <School className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-bold text-primary text-base leading-none truncate max-w-40">{settings.schoolName}</span>
          </div>

          {/* Desktop page title */}
          {title && (
            <h1 className="hidden lg:block text-lg font-bold text-foreground truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Right: search (desktop) + bell + avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search..."
                className="pl-9 w-48 lg:w-52 bg-slate-50 dark:bg-slate-900/50 border-border rounded-lg text-sm"
              />
            </div>
          </div>

          <Button variant="ghost" size="icon" className="relative hover:bg-teal-50 dark:hover:bg-teal-500/20">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-1.5 sm:px-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shadow-md">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-slate-100 dark:hover:bg-slate-800">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
