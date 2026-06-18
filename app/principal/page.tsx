'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/endpoints/auth'
import { setToken } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  GraduationCap, User, Mail, Lock, Phone, MapPin,
  School, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff,
} from 'lucide-react'

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-primary" />{label}
      </label>
      {children}
    </div>
  )
}

export default function PrincipalRegisterPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)
  const [showPw, setShowPw]         = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: '', schoolName: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required.')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      const res = await authApi.principalRegister(form)
      setToken(res.data.token)
      setDone(true)
      toast.success('Registration successful! Redirecting…')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary">EduManage</h1>
          </div>
          <p className="text-muted-foreground font-medium">Principal Registration Portal</p>
        </div>

        <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
          {/* Card header */}
          <div className="bg-primary px-6 py-5">
            <h2 className="text-white font-bold text-xl">Create Principal Account</h2>
            <p className="text-white/60 text-sm mt-0.5">Register your school on EduManage</p>
          </div>

          {done ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-lg">Account Created!</p>
                <p className="text-sm text-muted-foreground mt-1">Redirecting to dashboard…</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* School name */}
              <Field label="School Name" icon={School}>
                <Input value={form.schoolName} onChange={set('schoolName')} placeholder="e.g. St. Mary's High School" className="rounded-xl" />
              </Field>

              {/* Full name */}
              <Field label="Principal Full Name *" icon={User}>
                <Input value={form.name} onChange={set('name')} placeholder="e.g. Dr. Ramesh Verma" className="rounded-xl" required />
              </Field>

              {/* Email */}
              <Field label="Email Address *" icon={Mail}>
                <Input type="email" value={form.email} onChange={set('email')} placeholder="principal@school.com" className="rounded-xl" required />
              </Field>

              {/* Password */}
              <Field label="Password *" icon={Lock}>
                <div className="relative">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min 6 characters"
                    className="rounded-xl pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              {/* Phone */}
              <Field label="Phone" icon={Phone}>
                <Input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className="rounded-xl" />
              </Field>

              {/* Address */}
              <Field label="Address" icon={MapPin}>
                <Input value={form.address} onChange={set('address')} placeholder="School address" className="rounded-xl" />
              </Field>

              <Button type="submit" disabled={submitting}
                className="w-full h-11 bg-primary hover:bg-primary/90 rounded-xl shadow-md shadow-primary/20 font-bold mt-2">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating Account…</>
                  : <><GraduationCap className="w-4 h-4 mr-2" />Register as Principal</>}
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-1">
                Already registered?{' '}
                <Link href="/principal/login" className="text-primary hover:underline font-semibold">
                  Sign in here
                </Link>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="flex items-center justify-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="w-3 h-3" />Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
