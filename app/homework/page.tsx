'use client'

import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHomework } from '@/hooks/use-homework'
import { DatePicker } from '@/components/ui/date-picker'
import { useClassSections } from '@/hooks/use-classes'
import { useSubjects } from '@/hooks/use-classes'
import { CreateHomeworkPayload } from '@/lib/api/endpoints/homework'
import {
  BookOpen, Plus, Loader2, Calendar, Check, X,
  ClipboardList, GraduationCap, Tag, Clock, AlertTriangle,
  Users, FileText,
} from 'lucide-react'

// ─── Stat chip ─────────────────────────────────────────────────────────────────

function StatChip({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${color}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/60 dark:bg-black/20 shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-2xl font-black leading-none">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── Homework card ─────────────────────────────────────────────────────────────

function HomeworkCard({ hw, isStudent, onSubmit, submitting }: {
  hw: ReturnType<typeof useHomework>['homework'] extends (infer T)[] | null ? T : never
  isStudent: boolean
  onSubmit: (id: string) => void
  submitting: boolean
}) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(hw.dueDate)
  const overdue = due < today
  const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000)

  return (
    <div className={`relative rounded-2xl border-2 bg-card overflow-hidden transition-all hover:shadow-md ${
      overdue ? 'border-red-200 dark:border-red-800' : 'border-border hover:border-primary/40'
    }`}>
      {/* Top accent stripe */}
      <div className={`h-1 w-full ${overdue ? 'bg-red-400' : 'bg-primary'}`} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{hw.title}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                <GraduationCap className="w-2.5 h-2.5" />Class {hw.class}{hw.section ? `-${hw.section}` : ''}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">
                <BookOpen className="w-2.5 h-2.5" />{hw.subject}
              </span>
            </div>
          </div>
          <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${
            overdue
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          }`}>
            {overdue ? 'Overdue' : 'Active'}
          </span>
        </div>

        {/* Description */}
        {hw.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{hw.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Due {new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            {!overdue && (
              <p className={`text-[10px] font-semibold ${daysLeft <= 2 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {daysLeft === 0 ? 'Due today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
              </p>
            )}
          </div>

          {isStudent ? (
            <Button size="sm" disabled={submitting}
              onClick={() => onSubmit(hw.id)}
              className="h-7 px-3 text-xs gap-1.5 bg-primary hover:bg-primary/90 shadow-sm">
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Submit
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{hw.submissions?.length ?? 0}</span>
              </div>
              {hw.maxMarks && (
                <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                  {hw.maxMarks} marks
                </span>
              )}
            </div>
          )}
        </div>

        {/* Assigned by */}
        <p className="text-[10px] text-muted-foreground/60">
          Assigned by {hw.assignedBy?.name ?? '—'}
        </p>
      </div>
    </div>
  )
}

// ─── Assign Form (slide-down panel) ────────────────────────────────────────────

function AssignForm({ onSave, onCancel, creating }: {
  onSave: (p: CreateHomeworkPayload) => Promise<void>
  onCancel: () => void
  creating: boolean
}) {
  const { sections: classSections, loading: sectionsLoading } = useClassSections()
  const { subjects, loading: subjectsLoading } = useSubjects()

  const [form, setForm] = useState<CreateHomeworkPayload>({
    title: '', subject: '', class: '', section: '', dueDate: '', maxMarks: 100, description: '',
  })

  // Derive unique class names from sections
  const classNames = useMemo(() =>
    [...new Set(classSections.map(s => s.className))].sort((a, b) => a.localeCompare(b)),
    [classSections]
  )

  // Sections for the selected class
  const availableSections = useMemo(() =>
    classSections.filter(s => s.className === form.class).map(s => s.sectionName),
    [classSections, form.class]
  )

  const set = <K extends keyof CreateHomeworkPayload>(k: K, v: CreateHomeworkPayload[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const valid = form.title.trim() && form.subject && form.class && form.dueDate

  const handleSubmit = async () => {
    if (!valid) return
    await onSave({ ...form, section: form.section || undefined })
  }

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-card overflow-hidden shadow-lg shadow-primary/5">
      {/* Header */}
      <div className="bg-linear-to-r from-primary to-teal-400 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">New Assignment</p>
            <p className="text-white/70 text-[10px]">Fill in the details below</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />Title <span className="text-red-500 normal-case font-semibold">*</span>
          </label>
          <Input placeholder="e.g. Chapter 5 Exercise" value={form.title}
            onChange={e => set('title', e.target.value)} className="rounded-xl" autoFocus />
        </div>

        {/* Class + Section */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />Class <span className="text-red-500 normal-case font-semibold">*</span>
            </label>
            <Select
              value={form.class || '__none__'}
              onValueChange={v => { set('class', v === '__none__' ? '' : v); set('section', '') }}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={sectionsLoading ? 'Loading…' : 'Select class'} />
              </SelectTrigger>
              <SelectContent>
                {classNames.length === 0
                  ? <div className="py-3 px-3 text-sm text-slate-400 text-center">No classes found</div>
                  : classNames.map(c => (
                    <SelectItem key={c} value={c}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        {c}
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-teal-500" />Section
            </label>
            <Select
              value={form.section || '__none__'}
              onValueChange={v => set('section', v === '__none__' ? '' : v)}
              disabled={!form.class || availableSections.length === 0}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={!form.class ? 'Pick class first' : 'All sections'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  <span className="text-slate-400">All sections</span>
                </SelectItem>
                {availableSections.map(sec => (
                  <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-violet-500" />Subject <span className="text-red-500 normal-case font-semibold">*</span>
          </label>
          <Select
            value={form.subject || '__none__'}
            onValueChange={v => set('subject', v === '__none__' ? '' : v)}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder={subjectsLoading ? 'Loading…' : 'Select subject'} />
            </SelectTrigger>
            <SelectContent>
              {subjects.length === 0
                ? <div className="py-3 px-3 text-sm text-slate-400 text-center">No subjects found</div>
                : subjects.map(s => (
                  <SelectItem key={s.id} value={s.subjectName}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded">
                        {s.subjectCode}
                      </span>
                      {s.subjectName}
                    </div>
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        {/* Due Date + Max Marks */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />Due Date <span className="text-red-500 normal-case font-semibold">*</span>
            </label>
            <DatePicker value={form.dueDate} onChange={v => set('dueDate', v)} placeholder="Pick due date" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" />Max Marks
            </label>
            <Input type="number" placeholder="100" value={form.maxMarks ?? ''}
              onChange={e => set('maxMarks', Number(e.target.value))} className="rounded-xl" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />Description
          </label>
          <textarea
            rows={2}
            placeholder="Optional instructions for students…"
            value={form.description ?? ''}
            onChange={e => set('description', e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onCancel} disabled={creating}
            className="flex-1 rounded-xl h-10">
            Cancel
          </Button>
          <Button type="button" disabled={creating || !valid} onClick={handleSubmit}
            className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold">
            {creating
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Assigning…</>
              : <><Plus className="w-4 h-4 mr-2" />Assign</>}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HomeworkPage() {
  const { user } = useAuth()
  const { homework, loading, createHomework, submitHomework, creating, submitting } = useHomework()
  const [showForm, setShowForm] = useState(false)

  const canCreate = user?.role === 'teacher' || user?.role === 'principal'
  const isStudent = user?.role === 'student'

  const list      = homework ?? []
  const today     = new Date(); today.setHours(0, 0, 0, 0)
  const active    = list.filter(h => new Date(h.dueDate) >= today).length
  const overdue   = list.filter(h => new Date(h.dueDate) < today).length

  const handleCreate = async (payload: CreateHomeworkPayload) => {
    await createHomework(payload)
    setShowForm(false)
  }

  return (
    <DashboardLayout title="Homework">
      <div className="space-y-5 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Homework</h2>
            <p className="text-sm text-muted-foreground">{list.length} assignment{list.length !== 1 ? 's' : ''}</p>
          </div>
          {canCreate && !showForm && (
            <Button onClick={() => setShowForm(true)}
              className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 sm:h-10 sm:px-4 text-sm shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Assign Homework</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>

        {/* Stats */}
        {list.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <StatChip icon={ClipboardList} label="Total"   value={list.length} color="bg-primary/5 border-primary/20 text-primary" />
            <StatChip icon={Check}         label="Active"  value={active}      color="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" />
            <StatChip icon={AlertTriangle} label="Overdue" value={overdue}     color="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400" />
          </div>
        )}

        {/* Assign form */}
        {showForm && (
          <AssignForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            creating={creating}
          />
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary/50" />
            </div>
            <p className="font-semibold text-foreground">No assignments yet</p>
            <p className="text-sm mt-1">
              {canCreate
                ? <button onClick={() => setShowForm(true)} className="cursor-pointer text-primary hover:underline">Assign your first homework →</button>
                : 'Your teacher hasn\'t assigned any homework yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map(hw => (
              <HomeworkCard
                key={hw.id}
                hw={hw}
                isStudent={isStudent}
                onSubmit={id => submitHomework({ id })}
                submitting={submitting}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
