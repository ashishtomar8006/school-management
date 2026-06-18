'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/endpoints/auth'
import { setToken } from '@/lib/api/client'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { GraduationCap, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function PrincipalLoginPage() {
  const router      = useRouter()
  const { login }   = useAuth()   // reuse auth context's login for unified session
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Use the principal-specific login endpoint
      const res = await authApi.principalLogin({ email, password })
      setToken(res.data.token)
      if (res.data.user) localStorage.setItem('auth_user', JSON.stringify(res.data.user))
      window.location.href = '/dashboard'
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary">EduManage</h1>
          </div>
          <p className="text-muted-foreground font-medium">Principal Portal</p>
        </div>

        <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
          <div className="bg-primary px-6 py-5">
            <h2 className="text-white font-bold text-xl">Principal Sign In</h2>
            <p className="text-white/60 text-sm mt-0.5">Access your school dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />Email Address
              </label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="principal@school.com" className="rounded-xl" required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />Password
              </label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="rounded-xl pr-10" required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 rounded-xl shadow-md shadow-primary/20 font-bold mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in…</>
                : <><GraduationCap className="w-4 h-4 mr-2" />Sign In</>}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              New principal?{' '}
              <Link href="/principal" className="text-primary hover:underline font-semibold">
                Register your school
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="flex items-center justify-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="w-3 h-3" />Back to staff login
          </Link>
        </p>
      </div>
    </div>
  )
}
