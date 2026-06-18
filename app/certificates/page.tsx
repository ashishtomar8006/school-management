'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useCertificates } from '@/hooks/use-certificates'
import { DatePicker } from '@/components/ui/date-picker'
import { useStudents } from '@/hooks/use-students'
import { useSchoolSettings, SchoolSettings, THEME_COLORS } from '@/lib/school-settings'
import { Certificate, CertType } from '@/lib/api/endpoints/certificates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { handleFormError } from '@/lib/form-errors'
import {
  Award, Plus, Loader2, Search, X,
  Printer, CheckCircle, User, GraduationCap,
  FileText, Clock, Shield, Star, Ribbon,
  ArrowLeft, Eye, BadgeCheck, Stamp, School,
} from 'lucide-react'

// ─── Certificate type config ───────────────────────────────────────────────────

const CERT_TYPES: {
  value: CertType; label: string; desc: string
  icon: React.ElementType; color: string; bg: string
}[] = [
  { value: 'bonafide',    label: 'Bonafide',    desc: 'Certifies student enrollment',         icon: BadgeCheck,  color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { value: 'character',   label: 'Character',   desc: 'Testifies student character',          icon: Star,        color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  { value: 'transfer',    label: 'Transfer',    desc: 'Issued on leaving institution',        icon: ArrowLeft,   color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  { value: 'completion',  label: 'Completion',  desc: 'Awarded on completing a course',       icon: CheckCircle, color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  { value: 'sports',      label: 'Sports',      desc: 'Achievement in sports events',         icon: Ribbon,      color: 'text-purple-600 dark:text-purple-400',bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  { value: 'achievement', label: 'Achievement', desc: 'Academic / co-curricular achievement', icon: Award,       color: 'text-teal-600 dark:text-teal-400',    bg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' },
]

// ─── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  studentId:         z.string().min(1, 'Student is required'),
  type:              z.string().min(1, 'Certificate type is required'),
  issuerName:        z.string().optional(),
  issuerDesignation: z.string().optional(),
  purpose:           z.string().optional(),
  validUntil:        z.string().optional(),
  remarks:           z.string().optional(),
})
type FormValues = z.infer<typeof schema>

// ─── Resolve theme hex from settings ─────────────────────────────────────────

function themeHex(s: SchoolSettings): string {
  return THEME_COLORS.find(c => c.id === s.themeColorId)?.hex ?? '#0d9488'
}

// ─── Print helper (receives live settings) ────────────────────────────────────

function printCertificate(cert: Certificate, s: SchoolSettings) {
  const color       = themeHex(s)
  const typeInfo    = CERT_TYPES.find(t => t.value === cert.type)
  const typeName    = typeInfo ? `${typeInfo.label} Certificate` : 'Certificate'
  const studentName = cert.student?.user?.name ?? 'Student Name'
  const cls         = cert.student?.class ? `Class ${cert.student.class}-${cert.student.section}` : ''
  const schoolName  = s.schoolName || 'EduManage School'
  const tagline     = s.tagline    || 'School Management System'
  const issuer      = cert.issuerName        ?? s.principalName ?? 'Principal'
  const designation = cert.issuerDesignation ?? 'Principal'

  const logoHtml = s.logoDataUrl
    ? `<img src="${s.logoDataUrl}" alt="logo" style="width:64px;height:64px;object-fit:contain;border-radius:8px;" />`
    : `<div style="width:64px;height:64px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:28px;color:white;font-weight:900;">${schoolName.charAt(0)}</div>`

  const sigHtml = s.signatureDataUrl
    ? `<img src="${s.signatureDataUrl}" alt="signature" style="height:48px;object-fit:contain;display:block;margin:0 auto 4px;" />`
    : ''

  const html = `<!DOCTYPE html><html><head><title>${typeName}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    @page{size:A4 landscape;margin:12mm}
    body{font-family:'Georgia',serif;background:white}
    .cert{border:10px solid ${color};padding:36px 50px;min-height:480px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative}
    .cert::before{content:'';position:absolute;inset:8px;border:2px solid ${color};opacity:0.5;pointer-events:none}
    .school-header{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:6px}
    .school-name{font-size:24px;font-weight:900;color:${color};letter-spacing:2px;text-align:left;line-height:1.2}
    .school-tag{font-size:10px;color:#666;letter-spacing:2px;text-transform:uppercase;text-align:left}
    .hr{display:flex;align-items:center;gap:10px;width:80%;margin:10px auto 14px}
    .hr-line{flex:1;height:1px;background:${color};opacity:0.5}
    .cert-title{font-size:28px;font-weight:900;color:${color};text-transform:uppercase;letter-spacing:5px;margin-bottom:4px}
    .cert-bar{width:60px;height:4px;background:${color};border-radius:2px;margin:6px auto 18px}
    .sub-text{font-size:11px;color:#888;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px}
    .student-name{font-size:28px;font-weight:700;color:#0f172a;border-bottom:2px solid ${color};display:inline-block;padding:0 12px 4px}
    .body-text{font-size:14px;color:#444;line-height:1.9;margin-top:12px;max-width:560px}
    .cert-no{font-size:10px;color:#aaa;margin-top:10px;letter-spacing:1px}
    .footer{margin-top:auto;padding-top:24px;width:100%;display:flex;justify-content:space-between;align-items:flex-end}
    .sig{text-align:center;flex:1}
    .sig-line{width:130px;border-top:1px solid #333;margin:0 auto 5px}
    .sig-name{font-size:13px;font-weight:700;color:#222}
    .sig-title{font-size:10px;color:#777}
    .seal{width:64px;height:64px;border:2px dashed #ccc;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:9px;margin:0 auto}
  </style></head>
  <body><div class="cert">
    <div class="school-header">
      ${logoHtml}
      <div>
        <div class="school-name">${schoolName}</div>
        <div class="school-tag">${tagline}</div>
      </div>
    </div>
    <div class="hr"><div class="hr-line"></div>★<div class="hr-line"></div></div>
    <div class="cert-title">${typeName}</div>
    <div class="cert-bar"></div>
    <div class="sub-text">This is to certify that</div>
    <div class="student-name">${studentName}</div>
    <div class="body-text">
      ${cls ? `of <strong>${cls}</strong>` : ''}
      ${cert.purpose ? `<br><em>${cert.purpose}</em>` : '<br>has satisfactorily fulfilled all requirements'}
    </div>
    <div class="cert-no">Certificate No: ${cert.certificateNo} &nbsp;|&nbsp; Issued: ${cert.issuedDate}${cert.validUntil ? ' &nbsp;|&nbsp; Valid Until: ' + cert.validUntil : ''}</div>
    <div class="footer">
      <div class="sig">${sigHtml}<div class="sig-line"></div><div class="sig-name">${issuer}</div><div class="sig-title">${designation}</div></div>
      <div class="sig"><div class="seal">SEAL</div></div>
      <div class="sig"><div class="sig-line"></div><div class="sig-name">Class Teacher</div><div class="sig-title">Signature</div></div>
    </div>
  </div></body></html>`

  const win = window.open('', '_blank', 'width=950,height=680')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

// ─── Certificate preview component ────────────────────────────────────────────

function CertificatePreview({ data, student }: {
  data: Partial<FormValues>
  student: { user?: { name?: string }; class?: string; section?: string; rollNumber?: string } | null
}) {
  const { settings } = useSchoolSettings()
  const color        = themeHex(settings)

  const typeInfo    = CERT_TYPES.find(t => t.value === data.type)
  const typeName    = typeInfo ? `${typeInfo.label} Certificate` : 'Certificate'
  const studentName = student?.user?.name ?? 'Student Name'
  const cls         = student?.class ? `Class ${student.class}${student.section ? `-${student.section}` : ''}` : ''
  const today       = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const schoolName  = settings.schoolName        || 'EduManage School'
  const tagline     = settings.tagline           || 'School Management System'
  const issuerName  = data.issuerName            || settings.principalName || 'Principal'
  const issuerDesig = data.issuerDesignation     || 'Principal'

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-xl"
      style={{ fontFamily: 'Georgia, serif', border: `4px solid ${color}` }}>
      {/* Inner decorative border */}
      <div className="absolute inset-2 rounded-lg pointer-events-none z-10"
        style={{ border: `2px solid ${color}`, opacity: 0.4 }} />

      {/* Corner stars */}
      {(['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'] as const).map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-8 h-8 z-20 flex items-center justify-center`}>
          <Star className="w-6 h-6" style={{ fill: `${color}30`, color }} />
        </div>
      ))}

      <div className="relative z-10 px-8 py-7 text-center">
        {/* School header */}
        <div className="flex items-center justify-center gap-3 mb-2">
          {settings.logoDataUrl ? (
            <img src={settings.logoDataUrl} alt="logo"
              className="w-12 h-12 rounded-lg object-contain shrink-0"
              style={{ border: `1px solid ${color}20` }} />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ background: color }}>
              <School className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="text-left">
            <p className="text-xl font-black tracking-widest leading-tight" style={{ color }}>{schoolName}</p>
            <p className="text-[10px] text-slate-500 tracking-[2px] uppercase">{tagline}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px" style={{ background: color, opacity: 0.4 }} />
          <Award className="w-5 h-5" style={{ color }} />
          <div className="flex-1 h-px" style={{ background: color, opacity: 0.4 }} />
        </div>

        {/* Title */}
        <p className="text-[10px] tracking-[4px] text-slate-400 uppercase mb-1">This is to certify that</p>
        <h1 className="text-2xl font-black tracking-widest uppercase mb-1" style={{ color }}>{typeName}</h1>
        <div className="w-16 h-1 mx-auto rounded-full mb-4" style={{ background: color }} />

        {/* Student */}
        <p className="text-[11px] text-slate-500 tracking-widest uppercase mb-1">Presented to</p>
        <div className="relative inline-block">
          <p className="text-3xl font-bold text-slate-800 px-4 pb-1">{studentName}</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: color }} />
        </div>

        <div className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          {cls && <p className="font-semibold">{cls}</p>}
          {data.purpose
            ? <p className="mt-1 italic text-slate-500 text-xs">"{data.purpose}"</p>
            : <p className="mt-1 text-slate-400 text-xs italic">for satisfactorily fulfilling all requirements</p>}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <Stamp className="w-4 h-4 text-slate-300" />
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-2 px-2">
          <div className="text-center">
            {settings.signatureDataUrl && (
              <img src={settings.signatureDataUrl} alt="signature"
                className="h-10 object-contain mx-auto mb-1" />
            )}
            <div className="w-24 h-px bg-slate-400 mb-1 mx-auto" />
            <p className="text-[11px] font-bold text-slate-600">{issuerName}</p>
            <p className="text-[10px] text-slate-400">{issuerDesig}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
              <Stamp className="w-5 h-5 text-slate-200" />
            </div>
            <p className="text-[9px] text-slate-300 tracking-wider">OFFICIAL SEAL</p>
          </div>

          <div className="text-center">
            <div className="w-24 h-px bg-slate-400 mb-1 mx-auto" />
            <p className="text-[11px] font-bold text-slate-600">Date</p>
            <p className="text-[10px] text-slate-400">{today}</p>
          </div>
        </div>

        <p className="text-[9px] text-slate-300 mt-4 tracking-wider">
          CERTIFICATE NO: PREVIEW — {typeName.toUpperCase()}
        </p>
      </div>
    </div>
  )
}

// ─── Issue / Preview dialog ────────────────────────────────────────────────────

function IssueCertDialog({ open, onClose, onIssue, loading, students }: {
  open: boolean; onClose: () => void
  onIssue: (d: FormValues) => Promise<void>
  loading: boolean; students: any[]
}) {
  const { settings } = useSchoolSettings()
  const [serverError, setServerError] = useState<string | null>(null)
  const [preview, setPreview]         = useState(false)

  const { register, handleSubmit, control, reset, watch, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: '', type: '',
      issuerName:        settings.principalName || 'Principal',
      issuerDesignation: 'Principal',
      purpose: '', validUntil: '', remarks: '',
    },
  })

  const formValues    = watch()
  const selectedStudent = students.find(s => s.id === formValues.studentId) ?? null
  const canPreview    = !!formValues.studentId && !!formValues.type

  const onSubmit = async (v: FormValues) => {
    setServerError(null)
    try { await onIssue(v); reset(); setPreview(false); onClose() }
    catch (err) { handleFormError(err, (f, e) => setError(f as any, e), setServerError); setPreview(false) }
  }

  const handleClose = () => { reset(); setServerError(null); setPreview(false); onClose() }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[92vh] overflow-y-auto p-0" showCloseButton={false}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: themeHex(settings) }}>
          <div className="flex items-center gap-3">
            {preview && (
              <button onClick={() => setPreview(false)} className="text-white/70 hover:text-white mr-1">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white font-bold text-base m-0 p-0">
                {preview ? 'Certificate Preview' : 'Issue Certificate'}
              </DialogTitle>
              <p className="text-white/60 text-[11px]">
                {preview ? 'Review before issuing' : 'Fill in the details below'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview pane */}
        {preview ? (
          <div className="p-5 space-y-4">
            <CertificatePreview data={formValues} student={selectedStudent} />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setPreview(false)}
                className="flex-1 rounded-xl h-10">
                <ArrowLeft className="w-4 h-4 mr-2" />Edit Details
              </Button>
              <Button type="button" onClick={handleSubmit(onSubmit)} disabled={loading}
                className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Issuing…</>
                  : <><Award className="w-4 h-4 mr-2" />Issue Certificate</>}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">

            {serverError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                <X className="w-4 h-4 shrink-0" />{serverError}
              </div>
            )}

            {/* Student */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-primary" />Student <span className="text-red-500 normal-case font-semibold">*</span>
              </label>
              <Controller name="studentId" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={`rounded-xl ${errors.studentId ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                              {s.user?.name?.charAt(0)}
                            </div>
                            <span>{s.user?.name}</span>
                            <span className="text-slate-400 text-xs">· Class {s.class}-{s.section} · Roll {s.rollNumber}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              {errors.studentId && <p className="text-xs text-destructive mt-1">{errors.studentId.message}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5 text-primary" />Certificate Type <span className="text-red-500 normal-case font-semibold">*</span>
              </label>
              <Controller name="type" control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CERT_TYPES.map(t => {
                      const Icon = t.icon
                      const selected = field.value === t.value
                      return (
                        <button key={t.value} type="button" onClick={() => field.onChange(t.value)}
                          className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                            selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/40'
                          }`}>
                          <div className="flex items-start gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-primary text-white' : t.bg + ' ' + t.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold leading-tight ${selected ? 'text-primary' : 'text-foreground'}`}>{t.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t.desc}</p>
                            </div>
                          </div>
                          {selected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )} />
              {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
            </div>

            {/* Issuer — pre-filled from settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />Issuer Name
                </label>
                <Input {...register('issuerName')} placeholder="e.g. Dr. Ramesh Verma" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />Designation
                </label>
                <Input {...register('issuerDesignation')} placeholder="e.g. Principal" className="rounded-xl" />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />Purpose / Reason
              </label>
              <textarea {...register('purpose')} rows={2}
                placeholder="e.g. For bank account opening purposes…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>

            {/* Valid Until */}
            <div className="w-1/2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" />Valid Until
              </label>
              <Controller name="validUntil" control={control}
                render={({ field }) => (
                  <DatePicker value={field.value ?? ''} onChange={field.onChange} placeholder="Pick expiry date" />
                )} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}
                className="flex-1 rounded-xl h-10">Cancel</Button>
              <Button type="button" disabled={!canPreview} onClick={() => setPreview(true)}
                className="flex-1 rounded-xl h-10 bg-violet-600 hover:bg-violet-700 font-semibold">
                <Eye className="w-4 h-4 mr-2" />Preview
              </Button>
              <Button type="submit" disabled={loading}
                className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Issuing…</> : <><Award className="w-4 h-4 mr-2" />Issue</>}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Certificate card ──────────────────────────────────────────────────────────

function CertCard({ cert, onRevoke, revoking }: {
  cert: Certificate
  onRevoke: () => void
  revoking: boolean
}) {
  const { settings } = useSchoolSettings()
  const typeInfo = CERT_TYPES.find(t => t.value === cert.type)
  const Icon     = typeInfo?.icon ?? Award
  const active   = cert.status === 'active'

  return (
    <div className={`relative rounded-2xl border-2 bg-card overflow-hidden transition-all hover:shadow-md ${
      active ? 'border-border hover:border-primary/40' : 'border-border/50 opacity-60'
    }`}>
      <div className={`h-1 w-full ${active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`} />

      <div className="p-4">
        {/* Type + status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${typeInfo?.bg ?? ''}`}>
              <Icon className={`w-4 h-4 ${typeInfo?.color ?? 'text-primary'}`} />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{typeInfo?.label ?? cert.type} Certificate</p>
              <p className="text-[10px] font-mono text-muted-foreground">{cert.certificateNo}</p>
            </div>
          </div>
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            active
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {active ? 'Active' : 'Revoked'}
          </span>
        </div>

        {/* Student */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/50 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {cert.student?.user?.name?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{cert.student?.user?.name ?? '—'}</p>
            <p className="text-[10px] text-muted-foreground">
              {cert.student?.class && `Class ${cert.student.class}-${cert.student.section}`}
              {cert.student?.rollNumber && ` · Roll ${cert.student.rollNumber}`}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(cert.issuedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {cert.issuerName && (
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />{cert.issuerName}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/60">
          <Button size="sm" variant="outline" onClick={() => printCertificate(cert, settings)}
            className="flex-1 h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary hover:text-white hover:border-primary">
            <Printer className="w-3.5 h-3.5" />Print
          </Button>
          {active && (
            <Button size="sm" variant="outline" disabled={revoking} onClick={onRevoke}
              className="flex-1 h-8 text-xs text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600">
              {revoking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Revoke'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CertificatesPage() {
  const { certificates, loading, createCertificate, revokeCertificate, creating, revoking } = useCertificates()
  const { students } = useStudents()

  const [showIssue, setShowIssue]   = useState(false)
  const [search, setSearch]         = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filtered = (certificates ?? []).filter(c =>
    (c.certificateNo.toLowerCase().includes(search.toLowerCase()) ||
     c.student?.user?.name?.toLowerCase().includes(search.toLowerCase())) &&
    (filterType === 'all' || c.type === filterType)
  )

  const total  = (certificates ?? []).length
  const active = (certificates ?? []).filter(c => c.status === 'active').length

  return (
    <DashboardLayout title="Certificates">
      <div className="space-y-5 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Certificates</h2>
            <p className="text-sm text-muted-foreground">{total} certificate{total !== 1 ? 's' : ''} issued</p>
          </div>
          <Button onClick={() => setShowIssue(true)}
            className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 sm:h-10 sm:px-4 text-sm shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Issue Certificate</span>
            <span className="sm:hidden">Issue</span>
          </Button>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total',    value: total,        icon: Award,        bg: 'bg-primary/10',                                                       fg: 'text-primary' },
              { label: 'Active',   value: active,       icon: CheckCircle,  bg: 'bg-emerald-100 dark:bg-emerald-900/30',                               fg: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Revoked',  value: total-active, icon: X,            bg: 'bg-red-100 dark:bg-red-900/30',                                       fg: 'text-red-500 dark:text-red-400' },
              { label: 'Students', value: new Set((certificates ?? []).map(c => c.studentId)).size, icon: GraduationCap, bg: 'bg-violet-100 dark:bg-violet-900/30', fg: 'text-violet-600 dark:text-violet-400' },
            ].map(({ label, value, icon: Icon, bg, fg }) => (
              <div key={label} className="rounded-2xl border bg-card p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${fg}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or cert no…" value={search}
              onChange={e => setSearch(e.target.value)} className="pl-8" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <button onClick={() => setFilterType('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterType === 'all' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}>All</button>
            {CERT_TYPES.map(t => {
              const Icon = t.icon
              return (
                <button key={t.value} onClick={() => setFilterType(filterType === t.value ? 'all' : t.value)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    filterType === t.value ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}>
                  <Icon className="w-3 h-3" />{t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary/50" />
            </div>
            <p className="font-semibold text-foreground">No certificates found</p>
            <p className="text-sm mt-1">
              <button onClick={() => setShowIssue(true)} className="cursor-pointer text-primary hover:underline">
                Issue your first certificate →
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => (
              <CertCard key={c.id} cert={c}
                onRevoke={() => revokeCertificate(c.id)}
                revoking={revoking} />
            ))}
          </div>
        )}
      </div>

      <IssueCertDialog
        open={showIssue}
        onClose={() => setShowIssue(false)}
        onIssue={async d => { await createCertificate(d as any) }}
        loading={creating}
        students={students}
      />
    </DashboardLayout>
  )
}
