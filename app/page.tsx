'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, BookOpen, Loader2, GraduationCap, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickLogin = async (quickEmail: string, quickPassword: string) => {
    setEmail(quickEmail)
    setPassword(quickPassword)
    setIsSubmitting(true)
    setError('')

    try {
      const success = await login(quickEmail, quickPassword)
      if (success) {
        router.push('/dashboard')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickLogins = [
    { label: 'Principal', email: 'principal@school.com', password: 'principal123' },
    { label: 'Teacher', email: 'teacher1@school.com', password: 'teacher123' },
    { label: 'Student', email: 'student1@student.com', password: 'student123' },
    { label: 'Parent', email: 'parent1@parent.com', password: 'parent123' }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      {/* Background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary">EduManage</h1>
          </div>
          <p className="text-muted-foreground font-medium">School Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-card backdrop-blur">
          <CardHeader className="space-y-1 pb-5">
            <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">Sign in to your account to continue</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  className="bg-muted border-border focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  className="bg-muted border-border focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-lg"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-slate-500 font-semibold">Quick Demo Access</span>
              </div>
            </div>

            {/* Quick Login Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map((login) => (
                <Button
                  key={login.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium border-border hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 rounded-lg"
                  onClick={() => handleQuickLogin(login.email, login.password)}
                  disabled={isSubmitting || isLoading}
                >
                  {login.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-xl border border-indigo-200/50 dark:border-indigo-500/30 backdrop-blur">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-indigo-600 dark:text-indigo-400">Demo Credentials:</strong> Use the quick login buttons above or enter credentials manually. Default password for teachers: <code className="bg-white dark:bg-slate-800/50 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs">teacher123</code>
          </p>
        </div>

        {/* Principal portal link */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground px-2">Are you a principal?</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Link href="/principal/login">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary">
              <GraduationCap className="w-3.5 h-3.5" />Principal
            </Button>
          </Link>
          <Link href="/principal">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary">
              <GraduationCap className="w-3.5 h-3.5" />Register
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl border-violet-300 text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white hover:border-violet-600">
              <Shield className="w-3.5 h-3.5" />Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
