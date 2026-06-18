'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useExams, useExamSchedules } from '@/hooks/use-exams'
import { DatePicker, TimeInput } from '@/components/ui/date-picker'
import { useSubjects, useClassRooms } from '@/hooks/use-classes'
import { useTeachers } from '@/hooks/use-teachers'
import { ExamSchedule } from '@/lib/api/endpoints/exams'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { handleFormError } from '@/lib/form-errors'
import {
  Calendar, Plus, Loader2, Edit, Trash2, Clock,
  BookOpen, X, ArrowLeft, Building2, User,
  ClipboardList, GraduationCap, Award,
} from 'lucide-react'

// ─── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  examId:      z.string().min(1, 'Exam is required'),
  subject:     z.string().min(1, 'Subject is required'),
  date:        z.string().min(1, 'Date is required'),
  startTime:   z.string().optional(),
  endTime:     z.string().optional(),
  room:        z.string().optional(),
  maxMarks:    z.string().optional(),
  invigilator: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

// ─── Schedule dialog ───────────────────────────────────────────────────────────

function ScheduleDialog({ open, onClose, onSave, loading, initial, title, exams }: {
  open: boolean; onClose: () => void
  onSave: (d: FormValues) => Promise<void>
  loading: boolean; initial: FormValues; title: string; exams: any[]
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { subjects, loading: subjectsLoading } = useSubjects()
  const { rooms,    loading: roomsLoading }    = useClassRooms()
  const { teachers, loading: teachersLoading } = useTeachers()

  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues: initial,
  })

  const onSubmit = async (v: FormValues) => {
    setServerError(null)
    try { await onSave(v); reset(); onClose() }
    catch (err) { handleFormError(err, (f, e) => setError(f as any, e), setServerError) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto p-0" showCloseButton={false}>
        {/* Gradient header */}
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white font-bold text-base m-0 p-0">{title}</DialogTitle>
              <p className="text-white/60 text-[11px]">Fill in the session details</p>
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

          {/* Exam */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-primary" />Exam <span className="text-destructive normal-case font-semibold">*</span>
            </label>
            <Controller name="examId" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select exam" /></SelectTrigger>
                  <SelectContent>
                    {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            {errors.examId && <p className="text-xs text-destructive mt-1">{errors.examId.message}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />Subject <span className="text-destructive normal-case font-semibold">*</span>
            </label>
            <Controller name="subject" control={control}
              render={({ field }) => (
                <Select value={field.value || '__none__'} onValueChange={v => field.onChange(v === '__none__' ? '' : v)}>
                  <SelectTrigger className={`rounded-xl ${errors.subject ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder={subjectsLoading ? 'Loading…' : 'Select subject'} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0
                      ? <div className="py-3 px-3 text-sm text-muted-foreground text-center">No subjects found</div>
                      : subjects.map(s => (
                        <SelectItem key={s.id} value={s.subjectName}>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">{s.subjectCode}</span>
                            {s.subjectName}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )} />
            {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
          </div>

          {/* Date + Times */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />Date <span className="text-destructive normal-case font-semibold">*</span>
              </label>
              <Controller name="date" control={control}
                render={({ field }) => (
                  <DatePicker value={field.value} onChange={field.onChange} placeholder="Pick date" error={!!errors.date} />
                )} />
              {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />Start
              </label>
              <TimeInput {...register('startTime')} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />End
              </label>
              <TimeInput {...register('endTime')} />
            </div>
          </div>

          {/* Room + Max Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />Room
              </label>
              <Controller name="room" control={control}
                render={({ field }) => (
                  <Select value={field.value || '__none__'} onValueChange={v => field.onChange(v === '__none__' ? '' : v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={roomsLoading ? 'Loading…' : 'Select room'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__"><span className="text-muted-foreground">No room</span></SelectItem>
                      {rooms.map(r => (
                        <SelectItem key={r.id} value={r.roomNumber}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span>{r.roomNumber}</span>
                            <span className="text-xs text-muted-foreground">· {r.capacity} seats</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />Max Marks
              </label>
              <Input {...register('maxMarks')} type="number" placeholder="100" className="rounded-xl" />
            </div>
          </div>

          {/* Invigilator */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-violet-500" />Invigilator
            </label>
            <Controller name="invigilator" control={control}
              render={({ field }) => (
                <Select value={field.value || '__none__'} onValueChange={v => field.onChange(v === '__none__' ? '' : v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={teachersLoading ? 'Loading…' : 'Select teacher'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__"><span className="text-muted-foreground">Not assigned</span></SelectItem>
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.user?.name ?? t.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 text-[9px] font-bold text-violet-700 dark:text-violet-300">
                            {t.user?.name?.charAt(0)}
                          </div>
                          {t.user?.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-10">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : 'Save Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Session card ──────────────────────────────────────────────────────────────

const SUBJECT_COLORS = [
  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
]

function colorForSubject(subject: string) {
  let hash = 0
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash)
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}

function SessionCard({ session, onEdit, onDelete, deleting }: {
  session: ExamSchedule
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const color = colorForSubject(session.subject)
  const initials = session.subject.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={`relative rounded-2xl border-2 bg-card overflow-hidden group hover:shadow-md transition-all ${color.split(' ').filter(c => c.startsWith('border')).join(' ')}`}>
      {/* Top accent */}
      <div className={`h-1 w-full ${color.split(' ').filter(c => c.startsWith('bg-')).join(' ')}`} />

      <div className="p-4">
        {/* Subject header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 font-black text-sm ${color}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground leading-tight truncate">{session.subject}</p>
            <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
              {session.maxMarks} marks
            </p>
          </div>
          {/* Action buttons */}
          <div className="flex gap-1 shrink-0">
            <Button size="sm" variant="outline"
              className="h-7 w-7 p-0 text-primary border-primary/30 hover:bg-primary hover:text-white hover:border-primary"
              onClick={onEdit}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="outline"
              className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive hover:text-white hover:border-destructive"
              disabled={deleting} onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5">
          {(session.startTime || session.endTime) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3" />
              {session.startTime}{session.endTime ? ` – ${session.endTime}` : ''}
            </span>
          )}
          {session.room && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-2 py-1 rounded-lg">
              <Building2 className="w-3 h-3" />{session.room}
            </span>
          )}
          {session.invigilator && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 px-2 py-1 rounded-lg">
              <User className="w-3 h-3" />{session.invigilator}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main content ──────────────────────────────────────────────────────────────

const EMPTY: FormValues = { examId: '', subject: '', date: '', startTime: '', endTime: '', room: '', maxMarks: '100', invigilator: '' }

function ExamScheduleContent() {
  const searchParams  = useSearchParams()
  const defaultExamId = searchParams.get('examId') ?? ''

  const { exams } = useExams()
  const [selectedExamId, setSelectedExamId] = useState(defaultExamId)
  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule, creating, updating, deleting } =
    useExamSchedules(selectedExamId || undefined)

  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState<ExamSchedule | null>(null)

  const selectedExam = exams.find(e => e.id === selectedExamId)

  const handleAdd  = async (d: FormValues) => {
    await createSchedule({ ...d, maxMarks: parseInt(d.maxMarks || '100'), examId: d.examId } as any)
  }
  const handleEdit = async (d: FormValues) => {
    if (!editTarget) return
    await updateSchedule({ id: editTarget.id, data: { ...d, maxMarks: parseInt(d.maxMarks || '100') } as any })
    setEditTarget(null)
  }

  // Group sessions by date, sorted ascending
  const grouped = schedules.reduce<Record<string, ExamSchedule[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort()

  const today     = new Date(); today.setHours(0, 0, 0, 0)
  const upcoming  = schedules.filter(s => new Date(s.date) >= today).length
  const past      = schedules.length - upcoming

  return (
    <DashboardLayout title="Exam Schedule">
      <div className="space-y-5 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/exams">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Exam Schedule</h2>
              <p className="text-sm text-muted-foreground">{schedules.length} session{schedules.length !== 1 ? 's' : ''} scheduled</p>
            </div>
          </div>
          <Button onClick={() => setShowAdd(true)}
            className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 sm:h-10 sm:px-4 text-sm shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Session</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Stats + exam filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Stat chips */}
          {schedules.length > 0 && (
            <div className="flex gap-3">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-card">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground leading-none">{schedules.length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Total</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-card">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground leading-none">{upcoming}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Upcoming</p>
                </div>
              </div>
            </div>
          )}

          {/* Exam filter */}
          <div className="flex items-center gap-2 flex-1">
            <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={selectedExamId || '__all__'} onValueChange={v => setSelectedExamId(v === '__all__' ? '' : v)}>
              <SelectTrigger className="rounded-xl flex-1 max-w-xs">
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Exams</SelectItem>
                {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedExam?.class && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1.5 rounded-full shrink-0">
                Class {selectedExam.class}{selectedExam.section ? `-${selectedExam.section}` : ''}
                {selectedExam.academicYear && ` · ${selectedExam.academicYear}`}
              </span>
            )}
          </div>
        </div>

        {/* Schedule list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary/50" />
            </div>
            <p className="font-semibold text-foreground">No sessions scheduled</p>
            <p className="text-sm mt-1">
              <button onClick={() => setShowAdd(true)} className="cursor-pointer text-primary hover:underline">
                Add the first session →
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => {
              const d      = new Date(date)
              const isPast = d < today
              const isToday = d.toDateString() === today.toDateString()
              const sessions = grouped[date].sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))

              return (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 ${
                      isToday
                        ? 'bg-primary text-white border-primary'
                        : isPast
                        ? 'bg-muted text-muted-foreground border-border'
                        : 'bg-primary/10 text-primary border-primary/30'
                    }`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {isToday ? 'Today — ' : ''}
                      {d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="ml-1 opacity-70">{sessions.length} session{sessions.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex-1 h-px bg-border" />
                    {isPast && !isToday && (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Past</span>
                    )}
                  </div>

                  {/* Session cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sessions.map(s => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        onEdit={() => setEditTarget(s)}
                        onDelete={() => deleteSchedule(s.id)}
                        deleting={deleting}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ScheduleDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
        loading={creating}
        initial={{ ...EMPTY, examId: selectedExamId }}
        title="Add Session"
        exams={exams}
      />
      {editTarget && (
        <ScheduleDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
          loading={updating}
          initial={{
            examId:      editTarget.examId,
            subject:     editTarget.subject,
            date:        editTarget.date,
            startTime:   editTarget.startTime  ?? '',
            endTime:     editTarget.endTime    ?? '',
            room:        editTarget.room       ?? '',
            maxMarks:    String(editTarget.maxMarks),
            invigilator: editTarget.invigilator ?? '',
          }}
          title="Edit Session"
          exams={exams}
        />
      )}
    </DashboardLayout>
  )
}

export default function ExamSchedulePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <ExamScheduleContent />
    </Suspense>
  )
}
