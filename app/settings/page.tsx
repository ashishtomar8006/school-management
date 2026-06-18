'use client'

import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { useSchoolSettings, THEME_COLORS, applyTheme } from '@/lib/school-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFeeStructures } from '@/hooks/use-fees'
import { useClassSections } from '@/hooks/use-classes'
import { DatePicker } from '@/components/ui/date-picker'
import {
  School, Palette, Upload, Loader2, Check,
  Save, Image, PenLine, Phone, Mail, Globe, MapPin,
  User, Lock, Sparkles, X, Settings,
  CreditCard, Plus, Trash2, Zap, GraduationCap,
} from 'lucide-react'

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Field label ───────────────────────────────────────────────────────────────

function Field({ label, icon: Icon, children }: {
  label: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-primary" />{label}
      </label>
      {children}
    </div>
  )
}

// ─── Image uploader ────────────────────────────────────────────────────────────

function ImageUploader({ value, onChange, label, hint, aspectRatio = 'square' }: {
  value: string
  onChange: (dataUrl: string) => void
  label: string
  hint: string
  aspectRatio?: 'square' | 'signature'
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB.'); return }
    const reader = new FileReader()
    reader.onload = e => onChange(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const sizeClass = aspectRatio === 'signature' ? 'h-20 w-48' : 'h-24 w-24'

  return (
    <div className="flex items-start gap-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        className={`${sizeClass} rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 flex items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0 relative group`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-contain p-1" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground p-2 text-center">
            <Upload className="w-6 h-6 opacity-40" />
            <span className="text-[10px] font-semibold uppercase tracking-wide">Upload</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <p className="font-semibold text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}
            className="h-8 px-3 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary">
            <Upload className="w-3.5 h-3.5" />Choose File
          </Button>
          {value && (
            <Button size="sm" variant="outline" onClick={() => onChange('')}
              className="h-8 px-3 text-xs text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600">
              <X className="w-3.5 h-3.5" />Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Theme color picker ────────────────────────────────────────────────────────

function ThemePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
      {THEME_COLORS.map(color => {
        const active = value === color.id
        return (
          <button key={color.id} type="button" onClick={() => onChange(color.id)} title={color.name}
            className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
              active ? 'border-foreground shadow-md scale-105' : 'border-border hover:border-slate-300 dark:hover:border-slate-600'
            }`}>
            <div className="w-8 h-8 rounded-full shadow-md" style={{ background: color.hex }} />
            <span className="text-[10px] font-semibold text-muted-foreground">{color.name}</span>
            {active && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                <Check className="w-3 h-3 text-background" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Access denied ─────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <Lock className="w-8 h-8 text-destructive/60" />
      </div>
      <div>
        <p className="font-bold text-foreground text-lg">Access Restricted</p>
        <p className="text-sm text-muted-foreground mt-1">Only the Principal can modify school settings.</p>
      </div>
    </div>
  )
}

// ─── Fee Settings Tab ──────────────────────────────────────────────────────────

const FEE_TYPES    = ['Monthly Tuition', 'Annual Fee', 'Transport Fee', 'Exam Fee', 'Library Fee', 'Sports Fee', 'Lab Fee', 'Other']
const FEE_FREQ     = ['monthly', 'quarterly', 'half-yearly', 'annual'] as const
const ACADEMIC_YRS = (() => {
  const y = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => `${y - 1 + i}-${String(y + i).slice(-2)}`)
})()

function FeeSettingsTab() {
  const { sections: classSections } = useClassSections()

  const { structures, loading, createStructure, deleteStructure, generateFees, creating, deleting, generating } = useFeeStructures()

  const classNames = [...new Set((classSections as any[]).map((s: any) => s.className))].sort()

  const [form, setForm] = useState({
    class:        '',
    section:      '',
    feeType:      'Monthly Tuition',
    amount:       '',
    dueDate:      '',
    frequency:    'monthly' as typeof FEE_FREQ[number],
    academicYear: ACADEMIC_YRS[1] ?? '',
  })

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const selectedClassSections = (classSections as any[])
    .filter((s: any) => s.className === form.class)
    .map((s: any) => s.sectionName)

  const handleCreate = async () => {
    if (!form.class || !form.feeType || !form.amount || !form.dueDate) {
      toast.error('Please fill required fields.')
      return
    }
    await createStructure({
      class:        form.class,
      section:      form.section || undefined,
      feeType:      form.feeType,
      amount:       Number(form.amount),
      dueDate:      form.dueDate,
      frequency:    form.frequency,
      academicYear: form.academicYear,
    } as any)
    setForm(p => ({ ...p, amount: '', dueDate: '', section: '' }))
  }

  return (
    <div className="space-y-4">
      {/* Create structure */}
      <Section title="Create Fee Structure" icon={CreditCard}>
        <p className="text-sm text-muted-foreground mb-4">
          Define a fee structure for a class. Once created, click <strong>Generate Records</strong> to create individual fee records for all students in that class.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Class */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />Class <span className="text-red-500 normal-case font-semibold">*</span>
            </label>
            <Select value={form.class || '__none__'} onValueChange={v => { set('class', v === '__none__' ? '' : v); set('section', '') }}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__"><span className="text-muted-foreground">All Classes</span></SelectItem>
                {(classNames as string[]).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Section */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-teal-500" />Section
            </label>
            <Select value={form.section || '__all__'} onValueChange={v => set('section', v === '__all__' ? '' : v)}
              disabled={!form.class || selectedClassSections.length === 0}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="All Sections" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Sections</SelectItem>
                {selectedClassSections.map((s: string) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Fee Type */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" />Fee Type <span className="text-red-500 normal-case font-semibold">*</span>
            </label>
            <Select value={form.feeType} onValueChange={v => set('feeType', v)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{FEE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <span className="text-primary font-black text-sm">₹</span>Amount <span className="text-red-500 normal-case font-semibold">*</span>
            </label>
            <Input value={form.amount} onChange={e => set('amount', e.target.value)}
              type="number" placeholder="e.g. 2500" className="rounded-xl" />
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Plus className="w-3.5 h-3.5 text-orange-500" />Due Date <span className="text-red-500 normal-case font-semibold">*</span>
            </label>
            <DatePicker value={form.dueDate} onChange={v => set('dueDate', v)} placeholder="Pick due date" />
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-500" />Frequency
            </label>
            <Select value={form.frequency} onValueChange={v => set('frequency', v as any)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FEE_FREQ.map(f => <SelectItem key={f} value={f} className="capitalize">{f.replace('-', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <School className="w-3.5 h-3.5 text-slate-400" />Academic Year
            </label>
            <Select value={form.academicYear} onValueChange={v => set('academicYear', v)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{ACADEMIC_YRS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleCreate} disabled={creating} className="mt-4 gap-2 bg-primary hover:bg-primary/90 rounded-xl shadow-md shadow-primary/20 h-10 font-semibold">
          {creating ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : <><Plus className="w-4 h-4" />Create Structure</>}
        </Button>
      </Section>

      {/* Existing structures */}
      <Section title="Fee Structures" icon={GraduationCap}>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : structures.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No fee structures yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {structures.map(s => (
              <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-foreground">{s.feeType}</p>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Class {s.class}{s.section ? `-${s.section}` : ''}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">{s.frequency}</span>
                    {s.academicYear && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{s.academicYear}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground text-sm">₹{Number(s.amount).toLocaleString('en-IN')}</span>
                    <span>Due: {s.dueDate}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" disabled={generating} onClick={() => generateFees(s.id)}
                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5 font-semibold">
                    {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    Generate Records
                  </Button>
                  <Button size="sm" variant="outline" disabled={deleting} onClick={() => deleteStructure(s.id)}
                    className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { settings, save, isSaving } = useSchoolSettings()

  const isPrincipal = user?.role === 'principal'

  // School settings draft (localStorage-backed)
  const [draft, setDraft] = useState(settings)

  // Principal profile draft (DB-backed via auth user)
  const [profileDraft, setProfileDraft] = useState({
    name:    user?.name    ?? '',
    phone:   user?.phone   ?? '',
    address: user?.address ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'appearance' | 'fees'>('general')

  // Sync when settings context loads from localStorage — coerce null → ''
  useEffect(() => {
    const safe = Object.fromEntries(
      Object.entries(settings).map(([k, v]) => [k, v ?? ''])
    )
    setDraft(safe as typeof settings)
  }, [settings])

  // Sync when auth user refreshes (e.g. after page reload)
  useEffect(() => {
    if (user) {
      setProfileDraft({
        name:    user.name    ?? '',
        phone:   user.phone   ?? '',
        address: user.address ?? '',
      })
    }
  }, [user])

  const setS = <K extends keyof typeof settings>(k: K, v: typeof settings[K]) =>
    setDraft(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Save school settings to DB (synced to all users) + apply theme
      await save(draft)

      // 2. Save principal profile to DB and update auth context
      const profileChanged =
        profileDraft.name    !== (user?.name    ?? '') ||
        profileDraft.phone   !== (user?.phone   ?? '') ||
        profileDraft.address !== (user?.address ?? '')

      if (profileChanged) {
        const ok = await updateProfile(profileDraft)
        if (!ok) { toast.error('Failed to update profile.'); setSaving(false); return }
      }

      toast.success('Settings saved.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general',    label: 'General',    icon: School   },
    { id: 'branding',   label: 'Branding',   icon: Image    },
    { id: 'appearance', label: 'Appearance', icon: Palette  },
    { id: 'fees',       label: 'Fees',       icon: CreditCard },
  ] as const

  const busy = isSaving || saving

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h2>
            <p className="text-sm text-muted-foreground">Manage school information and appearance</p>
          </div>
          {isPrincipal && (
            <Button onClick={handleSave} disabled={busy}
              className="gap-2 bg-primary hover:bg-primary/90 h-9 px-4 text-sm shadow-md shadow-primary/20">
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
            </Button>
          )}
        </div>

        {!isPrincipal ? <AccessDenied /> : (
          <>
            {/* Tab bar */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border w-fit">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-card text-foreground shadow-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    <Icon className="w-4 h-4" />{tab.label}
                  </button>
                )
              })}
            </div>

            {/* ── GENERAL TAB ── */}
            {activeTab === 'general' && (
              <div className="space-y-4">

                {/* Principal Profile — sourced from DB */}
                <Section title="Principal Profile" icon={User}>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-5">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg shrink-0">
                      {(profileDraft.name || user?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{profileDraft.name || user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.email}</p>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">Principal</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Full Name" icon={User}>
                        <Input value={profileDraft.name}
                          onChange={e => setProfileDraft(p => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Dr. Ramesh Verma" className="rounded-xl" />
                      </Field>
                    </div>
                    <Field label="Phone" icon={Phone}>
                      <Input value={profileDraft.phone}
                        onChange={e => setProfileDraft(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210" className="rounded-xl" />
                    </Field>
                    <Field label="Email" icon={Mail}>
                      <Input value={user?.email ?? ''} disabled
                        className="rounded-xl bg-muted text-muted-foreground cursor-not-allowed" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Address" icon={MapPin}>
                        <Input value={profileDraft.address}
                          onChange={e => setProfileDraft(p => ({ ...p, address: e.target.value }))}
                          placeholder="Residential / office address" className="rounded-xl" />
                      </Field>
                    </div>
                  </div>
                </Section>

                {/* School Information — stored in localStorage */}
                <Section title="School Information" icon={School}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="School Name" icon={School}>
                        <Input value={draft.schoolName} onChange={e => setS('schoolName', e.target.value)}
                          placeholder="e.g. St. Mary's High School" className="rounded-xl" />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Tagline / Motto" icon={Sparkles}>
                        <Input value={draft.tagline} onChange={e => setS('tagline', e.target.value)}
                          placeholder="e.g. Empowering Education" className="rounded-xl" />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="School Address" icon={MapPin}>
                        <Input value={draft.address} onChange={e => setS('address', e.target.value)}
                          placeholder="School full address" className="rounded-xl" />
                      </Field>
                    </div>
                    <Field label="School Phone" icon={Phone}>
                      <Input value={draft.phone} onChange={e => setS('phone', e.target.value)}
                        placeholder="+91 98765 43210" className="rounded-xl" />
                    </Field>
                    <Field label="School Email" icon={Mail}>
                      <Input type="email" value={draft.email} onChange={e => setS('email', e.target.value)}
                        placeholder="school@example.com" className="rounded-xl" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Website" icon={Globe}>
                        <Input value={draft.website} onChange={e => setS('website', e.target.value)}
                          placeholder="https://school.edu" className="rounded-xl" />
                      </Field>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* ── BRANDING TAB ── */}
            {activeTab === 'branding' && (
              <div className="space-y-4">
                <Section title="School Logo" icon={Image}>
                  <ImageUploader
                    value={draft.logoDataUrl}
                    onChange={v => setS('logoDataUrl', v)}
                    label="School Logo"
                    hint="Shown in the sidebar, mobile header, and on printed certificates. PNG or SVG recommended. Max 2 MB."
                    aspectRatio="square"
                  />
                </Section>

                <Section title="Principal Signature" icon={PenLine}>
                  <ImageUploader
                    value={draft.signatureDataUrl}
                    onChange={v => setS('signatureDataUrl', v)}
                    label="Principal Signature"
                    hint="Printed on certificates and official documents. Transparent PNG works best. Max 2 MB."
                    aspectRatio="signature"
                  />
                </Section>

                {/* Live preview */}
                <Section title="Certificate Preview" icon={Settings}>
                  <div className="rounded-xl border-2 border-primary/20 bg-white dark:bg-slate-950 p-6 text-center"
                    style={{ fontFamily: 'Georgia, serif' }}>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      {draft.logoDataUrl
                        ? <img src={draft.logoDataUrl} alt="logo" className="w-12 h-12 object-contain" />
                        : <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <School className="w-6 h-6 text-primary" />
                          </div>}
                      <div className="text-left">
                        <p className="font-black text-primary text-lg leading-tight">{draft.schoolName || 'School Name'}</p>
                        {draft.tagline && <p className="text-xs text-muted-foreground tracking-wider">{draft.tagline}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-primary/30" />
                      <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Official Document</span>
                      <div className="flex-1 h-px bg-primary/30" />
                    </div>
                    <div className="flex flex-col items-center mt-4">
                      {draft.signatureDataUrl
                        ? <img src={draft.signatureDataUrl} alt="signature" className="h-12 object-contain" />
                        : <div className="h-12 w-36 border-b border-dashed border-slate-300 flex items-end justify-center pb-1">
                            <span className="text-[10px] text-slate-300">Signature</span>
                          </div>}
                      <div className="w-32 h-px bg-slate-400 mt-1 mb-1" />
                      <p className="text-xs font-bold text-slate-600">{profileDraft.name || user?.name || 'Principal'}</p>
                      <p className="text-[10px] text-slate-400">Principal</p>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* ── APPEARANCE TAB ── */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <Section title="Theme Color" icon={Palette}>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose an accent color. Applied instantly across the whole app and persisted across sessions.
                  </p>
                  <ThemePicker value={draft.themeColorId} onChange={id => {
                    setS('themeColorId', id)
                    applyTheme(id)   // live preview before save
                  }} />

                  {/* Live sample */}
                  <div className="mt-6 p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Preview</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center">Primary Button</div>
                      <div className="h-8 px-4 rounded-lg border-2 border-primary text-primary text-xs font-semibold flex items-center">Outline Button</div>
                      <div className="h-8 px-4 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center">Soft Badge</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary" />
                      <div className="flex-1 h-2 rounded-full bg-primary/20">
                        <div className="h-2 rounded-full bg-primary w-3/5" />
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* ── FEES TAB ── */}
            {activeTab === 'fees' && <FeeSettingsTab />}

            {/* Sticky save bar — only for non-fees tabs */}
            {activeTab !== 'fees' && (
              <div className="sticky bottom-4 flex justify-end">
                <Button onClick={handleSave} disabled={busy}
                  className="gap-2 bg-primary hover:bg-primary/90 h-10 px-6 text-sm shadow-xl shadow-primary/30 rounded-xl font-semibold">
                  {busy ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
