'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/endpoints/auth'
import { setToken } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Shield, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.adminLogin({ email, password })
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">EduManage Super Admin</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 backdrop-blur shadow-2xl overflow-hidden">
          <div className="bg-violet-600 px-6 py-4">
            <p className="text-white font-bold">Sign In</p>
            <p className="text-violet-200 text-xs mt-0.5">Manage all schools and principals</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-violet-400" />Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@edumanage.com"
                className="rounded-xl bg-slate-900/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-violet-400" />Password
              </label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl bg-slate-900/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Credentials hint */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-xs text-slate-400 space-y-0.5">
              <p className="font-semibold text-slate-300">Default credentials</p>
              <p>Email: <span className="text-violet-400 font-mono">admin@edumanage.com</span></p>
              <p>Password: <span className="text-violet-400 font-mono">admin@123</span></p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-500/30 font-bold mt-2 border-0"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in…</>
                : <><Shield className="w-4 h-4 mr-2" />Sign In as Admin</>}
            </Button>
          </form>
        </div>

        {/* Back links */}
        <div className="mt-5 flex items-center justify-center gap-6 text-xs text-slate-500">
          <Link href="/" className="flex items-center gap-1 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-3 h-3" />Staff login
          </Link>
          <Link href="/principal/login" className="flex items-center gap-1 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-3 h-3" />Principal login
          </Link>
        </div>
      </div>
    </div>
  )
}
