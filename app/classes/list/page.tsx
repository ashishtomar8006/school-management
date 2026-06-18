'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useClassSections, useSubjects, useSectionSubjects, useClassRooms } from '@/hooks/use-classes'
import { useSections } from '@/hooks/use-sections'
import { useTeachers } from '@/hooks/use-teachers'
import { ClassSection } from '@/lib/api/endpoints/classes'
import { handleFormError } from '@/lib/form-errors'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  GraduationCap, BookOpen, Search, Plus, Loader2,
  Trash2, Users, ChevronRight, X, CheckCircle, AlertCircle,
  Edit, Building2, Tag, UserCheck,
} from 'lucide-react'
import Swal from 'sweetalert2'
import Link from 'next/link'

// ─── Schema ────────────────────────────────────────────────────────────────────

const classSchema = z.object({
  className:   z.string().min(1, 'Class name is required'),
  sectionName: z.string().min(1, 'Section is required'),
  room:        z.string().optional(),
  status:      z.enum(['active', 'inactive']).default('active'),
})
type ClassFormValues = z.infer<typeof classSchema>

// ─── Status toggle ─────────────────────────────────────────────────────────────

function StatusToggle({ value, onChange }: { value: string; onChange: (v: 'active' | 'inactive') => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(['active', 'inactive'] as const).map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
            value === s
              ? s === 'active'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm'
                : 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 shadow-sm'
              : 'border-border text-muted-foreground hover:border-slate-300 dark:hover:border-slate-600'
          }`}>
          <span className={`w-2 h-2 rounded-full ${value === s ? (s === 'active' ? 'bg-green-500' : 'bg-red-400') : 'bg-slate-300'}`} />
          {s === 'active' ? 'Active' : 'Inactive'}
        </button>
      ))}
    </div>
  )
}

// ─── Add / Edit Class dialog ───────────────────────────────────────────────────

function ClassDialog({ open, onClose, onSave, loading, initial, title, existingClasses }: {
  open: boolean; onClose: () => void
  onSave: (d: ClassFormValues) => Promise<void>
  loading: boolean; initial: ClassFormValues; title: string
  existingClasses: ClassSection[]
}) {
  const { sections: dbSections, loading: sectionsLoading } = useSections()
  const { rooms, loading: roomsLoading } = useClassRooms()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema), defaultValues: initial,
  })

  const className   = useWatch({ control, name: 'className' })
  const sectionName = useWatch({ control, name: 'sectionName' })
  const room        = useWatch({ control, name: 'room' })
  const status      = useWatch({ control, name: 'status' })

  useEffect(() => { if (open) { reset(initial); setServerError(null) } }, [open, initial, reset])

  const isEditMode = !!initial.className

  // Build set of room numbers already used by other classes.
  // In edit mode, exclude the current class so its own room stays selectable.
  const takenRooms = new Set(
    existingClasses
      .filter(c => !(isEditMode && c.className === initial.className && c.sectionName === initial.sectionName))
      .map(c => c.room)
      .filter(Boolean) as string[]
  )

  const activeSections = dbSections.filter(s => s.status === 'active')
  const selectedRoom   = rooms.find(r => r.roomNumber === room)
  const availableRooms = rooms.filter(r => !takenRooms.has(r.roomNumber))

  const onSubmit = async (v: ClassFormValues) => {
    setServerError(null)
    try { await onSave(v); onClose() }
    catch (err) { handleFormError(err, (f, e) => setError(f as any, e), setServerError) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[95vw] p-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="relative bg-linear-to-br from-teal-600 to-cyan-500 px-6 pt-6 pb-10 overflow-hidden">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-teal-100 text-xs font-medium mb-1">
                {isEditMode ? 'Editing class' : 'New Class'}
              </p>
              {/* DialogTitle required by Radix for accessibility */}
              <DialogTitle className="text-white font-bold text-lg leading-tight m-0 p-0">
                {title}
              </DialogTitle>
            </div>

            {/* Live badge */}
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all duration-300 shadow-lg ${
              className && sectionName
                ? 'bg-white shadow-primary/20/30'
                : 'bg-white/20 border-2 border-dashed border-white/40'
            }`}>
              {className && sectionName ? (
                <>
                  <span className="text-xs font-black text-teal-700 leading-tight text-center px-1 truncate w-full">{className}</span>
                  <span className="text-[10px] font-bold text-teal-500 mt-0.5">{sectionName}</span>
                </>
              ) : (
                <GraduationCap className="w-7 h-7 text-white/50" />
              )}
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Fields — raised card overlapping the header */}
          <div className="mx-4 -mt-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-5 space-y-4">

            {serverError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                <X className="w-4 h-4 shrink-0" />{serverError}
              </div>
            )}

            {/* Class Name */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-teal-500" />
                Class Name <span className="text-red-500 normal-case font-semibold tracking-normal">*</span>
              </label>
              <Input
                {...register('className')}
                placeholder="e.g. Class 10, Grade 1, Primary"
                className={`rounded-xl ${errors.className ? 'border-red-400' : 'border-border'}`}
                autoFocus
              />
              {errors.className && <p className="text-xs text-red-500 mt-1">{errors.className.message}</p>}
            </div>

            {/* Section */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-500" />
                Section <span className="text-red-500 normal-case font-semibold tracking-normal">*</span>
              </label>
              <Controller name="sectionName" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={`rounded-xl ${errors.sectionName ? 'border-red-400' : 'border-border'}`}>
                      <SelectValue placeholder={
                        sectionsLoading ? 'Loading sections…'
                        : activeSections.length === 0 ? 'No sections yet'
                        : 'Select section'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSections.length === 0 ? (
                        <div className="py-4 px-3 text-center">
                          <p className="text-sm text-slate-400 mb-1">No sections available</p>
                          <Link href="/classes/sections" className="text-xs text-primary hover:underline font-medium">
                            Add sections first →
                          </Link>
                        </div>
                      ) : activeSections.map(s => (
                        <SelectItem key={s.id} value={s.name}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">{s.name}</span>
                            </div>
                            <span>Section {s.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              {errors.sectionName && <p className="text-xs text-red-500 mt-1">{errors.sectionName.message}</p>}
            </div>

            {/* Room */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-400" />
                Room
              </label>
              <Controller name="room" control={control}
                render={({ field }) => (
                  <Select value={field.value ?? '__none__'} onValueChange={v => field.onChange(v === '__none__' ? '' : v)}>
                    <SelectTrigger className="rounded-xl border-border">
                      <SelectValue placeholder={
                        roomsLoading ? 'Loading rooms…' : 'Select room (optional)'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">
                        <span className="text-slate-400">No room assigned</span>
                      </SelectItem>
                      {availableRooms.map(r => (
                        <SelectItem key={r.id} value={r.roomNumber}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <Building2 className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <span className="font-medium">{r.roomNumber}</span>
                              <span className="text-slate-400 text-xs ml-2">{r.capacity} seats</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              {selectedRoom && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {selectedRoom.roomNumber} · {selectedRoom.capacity} seats
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Status
              </label>
              <Controller name="status" control={control}
                render={({ field }) => (
                  <StatusToggle value={field.value} onChange={field.onChange} />
                )} />
            </div>
          </div>

          {/* ── Preview strip ── */}
          {(className || sectionName || room) && (
            <div className="mx-4 mt-3 px-4 py-3 bg-muted rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                className && sectionName ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {className && sectionName ? (
                  <>
                    <span className="text-[10px] font-black text-white leading-tight truncate w-full text-center px-0.5">{className.length > 4 ? className.slice(-2) : className}</span>
                    <span className="text-[9px] font-bold text-teal-200">{sectionName}</span>
                  </>
                ) : <GraduationCap className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {className || '—'}{sectionName ? ` — ${sectionName}` : ''}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {room && (
                    <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 flex items-center gap-0.5">
                      <Building2 className="w-2.5 h-2.5" />Room {room}
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold ${status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                    · {status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Buttons ── */}
          <div className="flex gap-3 px-4 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}
              className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 dark:shadow-none font-semibold">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
                : isEditMode ? 'Save Changes'
                : <><Plus className="w-4 h-4 mr-2" />Add Class</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Assign Teacher dialog ─────────────────────────────────────────────────────

function AssignTeacherDialog({ section, teachers, onSave, onClose, saving }: {
  section: ClassSection | null
  teachers: { id: string; user?: { name: string } }[]
  onSave: (teacherId: string | null) => void
  onClose: () => void
  saving: boolean
}) {
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    if (section) setSelected(section.classTeacherId ?? '')
  }, [section])

  if (!section) return null

  return (
    <Dialog open={!!section} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[95vw] p-0 overflow-hidden">
        <div className="relative bg-linear-to-br from-purple-600 to-violet-500 px-6 pt-6 pb-10 overflow-hidden">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-purple-100 text-xs font-medium mb-1">Assign Class Teacher</p>
            <DialogTitle className="text-white font-bold text-lg leading-tight m-0 p-0">
              {section.className} — Section {section.sectionName}
            </DialogTitle>
          </div>
        </div>

        <div className="mx-4 -mt-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              Teacher
            </label>
            <Select value={selected || '__none__'} onValueChange={v => setSelected(v === '__none__' ? '' : v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  <span className="text-slate-400">No teacher assigned</span>
                </SelectItem>
                {teachers.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.user?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 px-4 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1 rounded-xl h-11">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => onSave(selected || null)}
            className="flex-1 rounded-xl h-11 bg-purple-600 hover:bg-purple-700 shadow-md font-semibold"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : <><UserCheck className="w-4 h-4 mr-2" />Assign</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Manage Subjects dialog ────────────────────────────────────────────────────

function ManageSubjectsDialog({ section, onClose }: { section: ClassSection | null; onClose: () => void }) {
  const { subjects: allSubjects, loading: subjectsLoading } = useSubjects()
  const { teachers } = useTeachers()
  const { assignments, loading, assignSubject, removeSubject, assigning, removing } = useSectionSubjects(section?.id ?? null)

  const [search, setSearch]               = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<Record<string, string>>({})

  if (!section) return null

  const assignedIds = new Set(assignments.map(a => a.subjectId))
  const available   = allSubjects.filter(
    s => !assignedIds.has(s.id) &&
    (s.subjectName.toLowerCase().includes(search.toLowerCase()) ||
     s.subjectCode.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAssign = async (subjectId: string) => {
    await assignSubject({ subjectId, teacherId: selectedTeacher[subjectId] })
    setSelectedTeacher(p => { const n = { ...p }; delete n[subjectId]; return n })
  }

  return (
    <Dialog open={!!section} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{section.className}{section.sectionName}</span>
            </div>
            <div>
              <p className="font-bold">Manage Subjects</p>
              <p className="text-xs font-normal text-slate-500">
                {section.className} — Section {section.sectionName}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-teal-500" />Assigned ({assignments.length})
            </p>
            {loading ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            : assignments.length === 0 ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-border text-slate-400">
                <AlertCircle className="w-4 h-4 shrink-0" /><p className="text-sm">No subjects assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {assignments.map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/40 group">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-teal-800 dark:text-teal-200 truncate">{a.subject?.subjectName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono">{a.subject?.subjectCode}</span>
                        {a.teacher?.user?.name && <><span>·</span><span>{a.teacher.user.name}</span></>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline"
                      className="h-7 w-7 p-0 text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={removing} onClick={() => removeSubject(a.subjectId)}>
                      {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />Add Subject
              </p>
              <Link href="/classes/subjects" className="text-xs text-primary hover:underline flex items-center gap-1">
                Manage subjects <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input placeholder="Search subjects…" value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-8 text-sm" />
            </div>
            {subjectsLoading ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            : available.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                {allSubjects.length === 0
                  ? <Link href="/classes/subjects" className="text-primary hover:underline">Add subjects first →</Link>
                  : search ? 'No subjects match' : 'All subjects assigned'}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {available.map(sub => (
                  <div key={sub.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{sub.subjectName}</p>
                      <p className="text-xs text-slate-400 font-mono">{sub.subjectCode}</p>
                    </div>
                    <Select value={selectedTeacher[sub.id] ?? '__none__'}
                      onValueChange={v => setSelectedTeacher(p => ({ ...p, [sub.id]: v === '__none__' ? '' : v }))}>
                      <SelectTrigger className="w-32 h-7 text-xs"><SelectValue placeholder="Teacher" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No teacher</SelectItem>
                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.user?.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" disabled={assigning} onClick={() => handleAssign(sub.id)}
                      className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 shrink-0">
                      {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Class row (live subject count) ───────────────────────────────────────────

function ClassRow({ section, classTeacherName, onManage, onEdit, onDelete, onRemoveRoom, onAssignTeacher }: {
  section: ClassSection; classTeacherName: string; onManage: () => void; onEdit: () => void; onDelete: () => void; onRemoveRoom: () => void; onAssignTeacher: () => void
}) {
  const { assignments, loading } = useSectionSubjects(section.id)

  const handleRemoveRoom = async () => {
    const result = await Swal.fire({
      title: 'Remove Room Assignment?',
      html: `<p style="font-size:14px;color:#64748b">Room <strong style="color:#1e293b">${section.room}</strong> will be unassigned from <strong style="color:#1e293b">${section.className} — Section ${section.sectionName}</strong>.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
    })
    if (result.isConfirmed) onRemoveRoom()
  }

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div>
            <p className="font-semibold text-foreground">{section.className}</p>
            <p className="text-xs text-slate-400">Section {section.sectionName}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm">
        {classTeacherName ? (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="w-3 h-3 text-purple-600" />
            </div>
            <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">{classTeacherName}</span>
          </div>
        ) : <span className="text-xs text-slate-300 dark:text-slate-600 italic">Not assigned</span>}
      </td>
      <td className="py-3 px-4">
        {section.room ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-2 py-1 rounded-lg">
            <Building2 className="w-3 h-3" />Room {section.room}
            <button
              type="button"
              onClick={handleRemoveRoom}
              title="Remove room"
              className="ml-0.5 text-orange-400 hover:text-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ) : <span className="text-xs text-slate-300 dark:text-slate-600 italic">Not assigned</span>}
      </td>
      <td className="py-3 px-4">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        : assignments.length === 0 ? (
          <button onClick={onManage} className="cursor-pointer text-xs text-slate-400 italic hover:text-primary transition-colors flex items-center gap-1">
            <Plus className="w-3 h-3" />Assign subjects
          </button>
        ) : (
          <div className="flex flex-wrap gap-1">
            {assignments.slice(0, 3).map(a => (
              <span key={a.id} className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                {a.subject?.subjectName}
              </span>
            ))}
            {assignments.length > 3 && (
              <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                +{assignments.length - 3}
              </span>
            )}
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-1.5">
          <Button size="sm" onClick={onManage} className="h-8 px-2.5 text-xs gap-1.5 bg-primary hover:bg-primary/90 shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />Subjects
            {!loading && assignments.length > 0 && (
              <span className="bg-white/25 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none">{assignments.length}</span>
            )}
          </Button>
          <Button size="sm" variant="outline" title="Assign class teacher" className="h-8 px-2 text-xs text-purple-600 border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600" onClick={onAssignTeacher}>
            <UserCheck className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-2 text-xs text-primary border-teal-200 hover:bg-teal-600 hover:text-white hover:border-teal-600" onClick={onEdit}>
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-2 text-xs text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ClassListPage() {
  const { sections: dbSections }  = useSections()
  const { sections: classes, loading, createSection, updateSection, deleteSection, creating, updating } = useClassSections()
  const { teachers } = useTeachers()

  // teacher profile id → name
  const teacherById = new Map<string, string>()
  // class key (e.g. "10A") → name (from teacher's assigned class)
  const classTeacherByKey = new Map<string, string>()
  teachers.forEach(t => {
    const name = t.user?.name ?? ''
    if (t.id && name)            teacherById.set(t.id, name)
    if (t.userId && name)        teacherById.set(t.userId, name)
    const cls = t.classes?.[0]
    if (cls && name)             classTeacherByKey.set(cls, name)
  })

  const resolveClassTeacher = (s: ClassSection): string =>
    (s.classTeacher as any)?.user?.name ||
    (s.classTeacherId ? (teacherById.get(s.classTeacherId) ?? '') : '') ||
    (classTeacherByKey.get(`${s.className}${s.sectionName}`) ?? '')

  const [search, setSearch]                   = useState('')
  const [filterGrade, setFilterGrade]         = useState('all')
  const [showAdd, setShowAdd]                 = useState(false)
  const [editTarget, setEditTarget]           = useState<ClassSection | null>(null)
  const [manageTarget, setManageTarget]       = useState<ClassSection | null>(null)
  const [assignTeacherTarget, setAssignTeacherTarget] = useState<ClassSection | null>(null)

  const handleAssignTeacher = async (teacherId: string | null) => {
    if (!assignTeacherTarget) return
    await updateSection({ id: assignTeacherTarget.id, data: { classTeacherId: teacherId ?? undefined } as any })
    setAssignTeacherTarget(null)
  }

  const grades = [...new Set(classes.map(c => c.className).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))

  const filtered = classes.filter(c =>
    `${c.className} ${c.sectionName}`.toLowerCase().includes(search.toLowerCase()) &&
    (filterGrade === 'all' || c.className === filterGrade)
  ).sort((a, b) => a.className.localeCompare(b.className) || a.sectionName.localeCompare(b.sectionName))

  const noSections = dbSections.length === 0

  const handleAdd = async (d: ClassFormValues) => {
    await createSection({
      className:   d.className,
      sectionName: d.sectionName,
      room:        d.room || undefined,
      capacity:    40,
    } as any)
  }

  const handleEdit = async (d: ClassFormValues) => {
    if (!editTarget) return
    await updateSection({
      id: editTarget.id,
      data: {
        className:   d.className,
        sectionName: d.sectionName,
        room:        d.room || null,
      } as any,
    })
    setEditTarget(null)
  }

  const handleDelete = async (section: ClassSection) => {
    const result = await Swal.fire({
      title: 'Delete Class?',
      html: `<p style="font-size:14px;color:#64748b">Class <strong style="color:#1e293b">${section.className} — Section ${section.sectionName}</strong> and all its subject assignments will be permanently deleted.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
    })
    if (result.isConfirmed) await deleteSection(section.id)
  }

  const EMPTY_FORM: ClassFormValues = { className: '', sectionName: '', room: '', status: 'active' }

  return (
    <DashboardLayout title="Classes">
      <div className="space-y-4 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Classes</h2>
            <p className="text-sm text-slate-500">{classes.length} class{classes.length !== 1 ? 'es' : ''} configured</p>
          </div>
          <Button onClick={() => setShowAdd(true)} disabled={noSections}
            className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm disabled:opacity-50">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New Class</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search classes…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <Button size="sm" variant={filterGrade === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterGrade('all')}
              className={`shrink-0 ${filterGrade === 'all' ? 'bg-primary hover:bg-primary/90' : ''}`}>All</Button>
            {grades.map(g => (
              <Button key={g} size="sm" variant={filterGrade === g ? 'default' : 'outline'}
                onClick={() => setFilterGrade(filterGrade === g ? 'all' : g)}
                className={`shrink-0 ${filterGrade === g ? 'bg-primary hover:bg-primary/90' : ''}`}>
                {g}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">{noSections ? 'Add sections first' : 'No classes yet'}</p>
            <p className="text-sm mt-1">
              {noSections
                ? <Link href="/classes/sections" className="text-primary hover:underline">Go to Sections →</Link>
                : <button onClick={() => setShowAdd(true)} className="cursor-pointer text-primary hover:underline">Add your first class</button>}
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Class</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Class Teacher</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Room</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Subjects</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <ClassRow key={s.id} section={s}
                        classTeacherName={resolveClassTeacher(s)}
                        onManage={() => setManageTarget(s)}
                        onEdit={() => setEditTarget(s)}
                        onDelete={() => handleDelete(s)}
                        onRemoveRoom={() => updateSection({ id: s.id, data: { room: null } as any })}
                        onAssignTeacher={() => setAssignTeacherTarget(s)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ClassDialog open={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} loading={creating}
        initial={EMPTY_FORM} title="Add New Class" existingClasses={classes} />

      {editTarget && (
        <ClassDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} loading={updating}
          initial={{ className: editTarget.className, sectionName: editTarget.sectionName,
            room: editTarget.room ?? '', status: 'active' }}
          title="Edit Class" existingClasses={classes} />
      )}

      <ManageSubjectsDialog section={manageTarget} onClose={() => setManageTarget(null)} />

      <AssignTeacherDialog
        section={assignTeacherTarget}
        teachers={teachers}
        onSave={handleAssignTeacher}
        onClose={() => setAssignTeacherTarget(null)}
        saving={updating}
      />
    </DashboardLayout>
  )
}
