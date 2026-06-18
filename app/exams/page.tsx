'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useExams } from '@/hooks/use-exams'
import { DatePicker, DateRangePicker } from '@/components/ui/date-picker'
import { useClassSections } from '@/hooks/use-classes'
import { Exam, ExamType, ExamStatus } from '@/lib/api/endpoints/exams'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { handleFormError } from '@/lib/form-errors'
import {
  ClipboardList, Plus, Loader2, Edit, Trash2, Calendar,
  Search, AlertTriangle, X, BookOpen, CheckCircle,
  GraduationCap, Award, Clock, BarChart3, Tag,
} from 'lucide-react'

// ─── Config ────────────────────────────────────────────────────────────────────

const EXAM_TYPES: { value: ExamType; label: string }[] = [
  { value: 'unit_test',   label: 'Unit Test'   },
  { value: 'midterm',     label: 'Mid Term'    },
  { value: 'quarterly',   label: 'Quarterly'   },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'annual',      label: 'Annual'      },
  { value: 'final',       label: 'Final Exam'  },
  { value: 'other',       label: 'Other'       },
]

const STATUS_CFG: Record<ExamStatus, { label: string; badge: string; dot: string }> = {
  upcoming:  { label: 'Upcoming',  badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',     dot: 'bg-blue-500'  },
  ongoing:   { label: 'Ongoing',   badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
  completed: { label: 'Completed', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',    dot: 'bg-slate-400' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',         dot: 'bg-red-500'   },
}

const TYPE_COLOR: Record<string, string> = {
  unit_test:   'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  midterm:     'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  quarterly:   'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  half_yearly: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  annual:      'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  final:       'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  other:       'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
}

// ─── Academic year helper ──────────────────────────────────────────────────────

function buildAcademicYears(): string[] {
  const y = new Date().getFullYear()
  return Array.from({ length: 8 }, (_, i) => {
    const yr = y - 2 + i
    return `${yr}-${String(yr + 1).slice(-2)}`
  })
}
const ACADEMIC_YEARS = buildAcademicYears()

// ─── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  name:         z.string().min(1, 'Exam name is required'),
  examType:     z.string().min(1, 'Type is required'),
  class:        z.string().optional(),
  section:      z.string().optional(),
  academicYear: z.string().optional(),
  startDate:    z.string().optional(),
  endDate:      z.string().optional(),
  totalMarks:   z.string().optional(),
  passingMarks: z.string().optional(),
  description:  z.string().optional(),
})
type FormValues = z.infer<typeof schema>

// ─── Exam dialog ───────────────────────────────────────────────────────────────

function ExamDialog({ open, onClose, onSave, loading, initial, title }: {
  open: boolean; onClose: () => void
  onSave: (d: FormValues) => Promise<void>
  loading: boolean; initial: FormValues; title: string
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { sections: classSections, loading: sectionsLoading } = useClassSections()

  const { register, handleSubmit, control, reset, watch, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues: initial,
  })

  const selectedClass    = watch('class')
  const classNames       = [...new Set(classSections.map(s => s.className))].sort((a, b) => a.localeCompare(b))
  const availableSections = classSections.filter(s => s.className === selectedClass).map(s => s.sectionName)

  const onSubmit = async (v: FormValues) => {
    setServerError(null)
    try { await onSave(v); reset(); onClose() }
    catch (err) { handleFormError(err, (f, e) => setError(f as any, e), setServerError) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto p-0" showCloseButton={false}>

        {/* Header */}
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white font-bold text-base m-0 p-0">{title}</DialogTitle>
              <p className="text-white/60 text-[11px]">Fill in the exam details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              <X className="w-4 h-4 shrink-0" />{serverError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-primary" />Exam Name <span className="text-destructive normal-case font-semibold">*</span>
            </label>
            <Input {...register('name')} placeholder="e.g. Mid Term Examination 2025"
              className={`rounded-xl ${errors.name ? 'border-destructive' : ''}`} autoFocus />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          {/* Type + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />Type <span className="text-destructive normal-case font-semibold">*</span>
              </label>
              <Controller name="examType" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{EXAM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />Academic Year
              </label>
              <Controller name="academicYear" control={control}
                render={({ field }) => (
                  <Select value={field.value || '__none__'} onValueChange={v => field.onChange(v === '__none__' ? '' : v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__"><span className="text-muted-foreground">Select year</span></SelectItem>
                      {ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
            </div>
          </div>

          {/* Class + Section */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />Class
              </label>
              <Controller name="class" control={control}
                render={({ field }) => (
                  <Select value={field.value || '__all__'}
                    onValueChange={v => { field.onChange(v === '__all__' ? '' : v); reset(p => ({ ...p, class: v === '__all__' ? '' : v, section: '' })) }}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder={sectionsLoading ? 'Loading…' : 'All Classes'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Classes</SelectItem>
                      {classNames.map(c => (
                        <SelectItem key={c} value={c}>
                          <div className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-primary" />{c}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-500" />Section
              </label>
              <Controller name="section" control={control}
                render={({ field }) => (
                  <Select value={field.value || '__all__'} onValueChange={v => field.onChange(v === '__all__' ? '' : v)}
                    disabled={!selectedClass || availableSections.length === 0}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder={!selectedClass ? 'Pick class first' : 'All Sections'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Sections</SelectItem>
                      {availableSections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />Date Range
            </label>
            <Controller name="startDate" control={control}
              render={({ field: startField }) => (
                <Controller name="endDate" control={control}
                  render={({ field: endField }) => (
                    <DateRangePicker
                      startValue={startField.value ?? ''}
                      endValue={endField.value ?? ''}
                      onStartChange={startField.onChange}
                      onEndChange={endField.onChange}
                      startPlaceholder="Start date"
                      endPlaceholder="End date"
                    />
                  )} />
              )} />
          </div>

          {/* Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />Total Marks
              </label>
              <Input {...register('totalMarks')} type="number" placeholder="100" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />Passing Marks
              </label>
              <Input {...register('passingMarks')} type="number" placeholder="35" className="rounded-xl" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Description</label>
            <textarea {...register('description')} rows={2} placeholder="Optional notes…"
              className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-10">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : 'Save Exam'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete dialog ─────────────────────────────────────────────────────────────

function DeleteDialog({ exam, onClose, onConfirm, loading }: {
  exam: Exam | null; onClose: () => void
  onConfirm: (id: string) => Promise<void>; loading: boolean
}) {
  if (!exam) return null
  return (
    <Dialog open={!!exam} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />Delete Exam
          </DialogTitle>
        </DialogHeader>
        <div className="py-3 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4.5 h-4.5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{exam.name}</p>
              <p className="text-xs text-muted-foreground">
                {EXAM_TYPES.find(t => t.value === exam.examType)?.label}
                {exam.class && ` · Class ${exam.class}${exam.section ? `-${exam.section}` : ''}`}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">All schedules and results for this exam will also be permanently deleted.</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">Cancel</Button>
          <Button onClick={() => onConfirm(exam.id)} disabled={loading}
            className="bg-destructive hover:bg-destructive/90 min-w-24 rounded-xl">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Exam card ─────────────────────────────────────────────────────────────────

function ExamCard({ exam, onEdit, onDelete }: {
  exam: Exam; onEdit: () => void; onDelete: () => void
}) {
  const status = STATUS_CFG[exam.status]
  const typeLabel = EXAM_TYPES.find(t => t.value === exam.examType)?.label ?? exam.examType
  const typeColor = TYPE_COLOR[exam.examType] ?? TYPE_COLOR.other

  const passPct = exam.totalMarks > 0
    ? Math.round((exam.passingMarks / exam.totalMarks) * 100)
    : 0

  return (
    <div className="relative rounded-2xl border-2 border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group">
      {/* Top status stripe */}
      <div className={`h-1 w-full ${status.dot}`} />

      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
          {exam.academicYear && (
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {exam.academicYear}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-bold text-foreground leading-snug mb-3 line-clamp-2">{exam.name}</h3>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          {exam.class && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Class {exam.class}{exam.section ? `-${exam.section}` : ''}
              </span>
            </div>
          )}
          {exam.startDate && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {new Date(exam.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                {exam.endDate && ` → ${new Date(exam.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {exam.totalMarks} marks · Pass {exam.passingMarks} ({passPct}%)
            </span>
          </div>
        </div>

        {/* Pass % progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground mb-1">
            <span>Pass threshold</span><span>{passPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${passPct}%` }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border/60">
          <Link href={`/exams/schedule?examId=${exam.id}`} className="flex-1">
            <Button size="sm" variant="outline"
              className="w-full h-8 text-xs gap-1.5 hover:bg-primary hover:text-white hover:border-primary transition-colors">
              <Calendar className="w-3.5 h-3.5" />Schedule
            </Button>
          </Link>
          <Link href={`/exams/results?examId=${exam.id}`} className="flex-1">
            <Button size="sm" variant="outline"
              className="w-full h-8 text-xs gap-1.5 hover:bg-primary hover:text-white hover:border-primary transition-colors">
              <BarChart3 className="w-3.5 h-3.5" />Results
            </Button>
          </Link>
          <Button size="sm" variant="outline"
            className="h-8 w-8 p-0 text-primary border-primary/30 hover:bg-primary hover:text-white hover:border-primary"
            onClick={onEdit}>
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline"
            className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive hover:text-white hover:border-destructive"
            onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const EMPTY: FormValues = {
  name: '', examType: 'final', class: '', section: '',
  academicYear: ACADEMIC_YEARS[2] ?? '',
  startDate: '', endDate: '', totalMarks: '100', passingMarks: '35', description: '',
}

const STATUS_FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'ongoing',   label: 'Ongoing'   },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

export default function ExamsPage() {
  const { exams, loading, createExam, updateExam, deleteExam, creating, updating, deleting } = useExams()
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAdd, setShowAdd]           = useState(false)
  const [editTarget, setEditTarget]     = useState<Exam | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null)

  const statusCounts = { upcoming: 0, ongoing: 0, completed: 0, cancelled: 0 } as Record<string, number>
  exams.forEach(e => { if (e.status in statusCounts) statusCounts[e.status]++ })

  const filtered = exams.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === 'all' || e.status === filterStatus)
  )

  const handleAdd  = async (d: FormValues) => {
    await createExam({ ...d, totalMarks: parseInt(d.totalMarks || '100'), passingMarks: parseInt(d.passingMarks || '35') } as any)
  }
  const handleEdit = async (d: FormValues) => {
    if (!editTarget) return
    await updateExam({ id: editTarget.id, data: { ...d, totalMarks: parseInt(d.totalMarks || '100'), passingMarks: parseInt(d.passingMarks || '35') } as any })
    setEditTarget(null)
  }
  const handleDelete = async (id: string) => { await deleteExam(id); setDeleteTarget(null) }

  return (
    <DashboardLayout title="Examinations">
      <div className="space-y-5 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Examinations</h2>
            <p className="text-sm text-muted-foreground">{exams.length} exam{exams.length !== 1 ? 's' : ''} configured</p>
          </div>
          <div className="flex gap-2">
            <Link href="/exams/schedule">
              <Button variant="outline" className="gap-2 h-9 px-3 text-sm rounded-xl">
                <Calendar className="w-4 h-4" /><span className="hidden sm:inline">Schedule</span>
              </Button>
            </Link>
            <Link href="/exams/results">
              <Button variant="outline" className="gap-2 h-9 px-3 text-sm rounded-xl">
                <BarChart3 className="w-4 h-4" /><span className="hidden sm:inline">Results</span>
              </Button>
            </Link>
            <Button onClick={() => setShowAdd(true)}
              className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 sm:px-4 text-sm rounded-xl shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Exam</span>
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        {exams.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'upcoming',  label: 'Upcoming',  color: 'bg-blue-100 dark:bg-blue-900/30',    icon: Clock,        fg: 'text-blue-600 dark:text-blue-400' },
              { key: 'ongoing',   label: 'Ongoing',   color: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle, fg: 'text-emerald-600 dark:text-emerald-400' },
              { key: 'completed', label: 'Completed', color: 'bg-slate-100 dark:bg-slate-800',     icon: ClipboardList, fg: 'text-slate-600 dark:text-slate-400' },
              { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100 dark:bg-red-900/30',      icon: X,            fg: 'text-red-500 dark:text-red-400' },
            ].map(({ key, label, color, icon: Icon, fg }) => (
              <button key={key} type="button" onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                className={`rounded-2xl border-2 bg-card p-4 flex items-center gap-3 text-left transition-all hover:shadow-sm ${
                  filterStatus === key ? 'border-primary' : 'border-border hover:border-primary/40'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className={`w-5 h-5 ${fg}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground leading-none">{statusCounts[key] ?? 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">{label}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search exams…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 rounded-xl" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setFilterStatus(key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filterStatus === key
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                }`}>
                {key === 'all' ? `All (${exams.length})` : `${label} (${statusCounts[key] ?? 0})`}
              </button>
            ))}
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
              <ClipboardList className="w-8 h-8 text-primary/50" />
            </div>
            <p className="font-semibold text-foreground">No exams found</p>
            <p className="text-sm mt-1">
              <button onClick={() => setShowAdd(true)} className="cursor-pointer text-primary hover:underline">
                Add your first exam →
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(exam => (
              <ExamCard key={exam.id} exam={exam}
                onEdit={() => setEditTarget(exam)}
                onDelete={() => setDeleteTarget(exam)} />
            ))}
          </div>
        )}
      </div>

      <ExamDialog open={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} loading={creating}
        initial={EMPTY} title="Add New Exam" />
      {editTarget && (
        <ExamDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} loading={updating}
          initial={{
            name: editTarget.name, examType: editTarget.examType,
            class: editTarget.class ?? '', section: editTarget.section ?? '',
            academicYear: editTarget.academicYear ?? '',
            startDate: editTarget.startDate ?? '', endDate: editTarget.endDate ?? '',
            totalMarks: String(editTarget.totalMarks), passingMarks: String(editTarget.passingMarks),
            description: editTarget.description ?? '',
          }}
          title="Edit Exam" />
      )}
      <DeleteDialog exam={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} />
    </DashboardLayout>
  )
}
