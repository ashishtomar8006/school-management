'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useTeachers } from '@/hooks/use-teachers'
import { useSubjects, useClassSections, useClassRooms } from '@/hooks/use-classes'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Clock, Plus, Trash2, Loader2 } from 'lucide-react'
import type { Subject, ClassSection, ClassRoom } from '@/lib/api/endpoints/classes'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

interface TimetableSlot {
  id: string
  teacherId: string
  day: Day
  startTime: string
  endTime: string
  subject: string
  classSection: string
  roomNumber: string
}

const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const STORAGE_KEY = 'timetable_data'

function loadSlots(): TimetableSlot[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') }
  catch { return [] }
}
function saveSlots(slots: TimetableSlot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots))
}

// ─── Add Slot Dialog ───────────────────────────────────────────────────────────

interface SlotForm {
  day: Day
  startTime: string
  endTime: string
  subject: string
  classSection: string
  roomNumber: string
}

const EMPTY_SLOT: SlotForm = {
  day: 'Monday', startTime: '08:00', endTime: '09:00',
  subject: '', classSection: '', roomNumber: '',
}

// Per-day accent colors for the day selector pills
const DAY_PILL: Record<Day, { active: string; hover: string }> = {
  Monday:    { active: 'bg-blue-600 text-white border-blue-600',    hover: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20' },
  Tuesday:   { active: 'bg-purple-600 text-white border-purple-600', hover: 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-900/20' },
  Wednesday: { active: 'bg-green-600 text-white border-green-600',   hover: 'hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/20' },
  Thursday:  { active: 'bg-orange-500 text-white border-orange-500', hover: 'hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 dark:hover:bg-orange-900/20' },
  Friday:    { active: 'bg-primary text-white border-primary',     hover: 'hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 dark:hover:bg-teal-900/20' },
  Saturday:  { active: 'bg-pink-600 text-white border-pink-600',     hover: 'hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 dark:hover:bg-pink-900/20' },
}

function AddSlotDialog({
  open, onClose, onAdd, teacherName, prefillDay,
  subjects, sections, rooms,
}: {
  open: boolean; onClose: () => void
  onAdd: (slot: SlotForm) => void
  teacherName: string
  prefillDay?: Day
  subjects: Subject[]
  sections: ClassSection[]
  rooms: ClassRoom[]
}) {
  const [form, setForm]     = useState<SlotForm>({ ...EMPTY_SLOT, day: prefillDay ?? 'Monday' })
  const [errors, setErrors] = useState<Partial<Record<keyof SlotForm, string>>>({})

  useEffect(() => {
    if (open) { setForm({ ...EMPTY_SLOT, day: prefillDay ?? 'Monday' }); setErrors({}) }
  }, [open, prefillDay])

  const set = (k: keyof SlotForm, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.subject)      e.subject      = 'Subject is required'
    if (!form.classSection) e.classSection = 'Class is required'
    if (!form.startTime)    e.startTime    = 'Start time required'
    if (!form.endTime)      e.endTime      = 'End time required'
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      e.endTime = 'End time must be after start time'
    return e
  }

  const handleAdd = () => {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      // scroll the body to top so errors are visible
      document.querySelector('[data-slot="dialog-content"] .overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    onAdd(form)
    onClose()
  }

  const sortedSections = [...sections].sort((a, b) => {
    const na = Number(a.className), nb = Number(b.className)
    return !isNaN(na) && !isNaN(nb) ? na - nb : a.className.localeCompare(b.className) || a.sectionName.localeCompare(b.sectionName)
  })

  const selectedRoom    = rooms.find(r => r.roomNumber === form.roomNumber)
  const selectedSection = sections.find(s => `${s.className}${s.sectionName}` === form.classSection)
  const isReady         = form.subject && form.classSection && form.startTime && form.endTime

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">

        {/* ── Gradient header ── */}
        <div className="relative bg-linear-to-br from-primary via-primary/80 to-teal-500 px-6 pt-6 pb-8 overflow-hidden shrink-0">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />

          <div className="relative">
            <p className="text-primary-foreground/70 text-xs font-medium mb-1">New Period</p>
            <DialogTitle className="text-white font-bold text-lg m-0 p-0">
              Add Period
            </DialogTitle>
            <p className="text-primary-foreground/80 text-xs mt-1 font-medium">{teacherName}</p>

            {/* Live preview strip */}
            {isReady && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">{form.day}</span>
                <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full font-mono">{form.startTime} – {form.endTime}</span>
                <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">{form.subject}</span>
                <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">{form.classSection}</span>
                {form.roomNumber && <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">Room {form.roomNumber}</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Raised form card */}
          <div className="mx-4 -mt-3 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-5 space-y-5">

            {/* Day selector */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Day</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {DAYS.map(d => {
                  const pill = DAY_PILL[d]
                  return (
                    <button key={d} type="button" onClick={() => set('day', d)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        form.day === d
                          ? `${pill.active} shadow-sm scale-[1.04]`
                          : `border-border text-muted-foreground ${pill.hover}`
                      }`}>
                      {d.slice(0, 3)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Period Time <span className="text-red-400">*</span></p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Start</label>
                  <Input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
                    className={`text-center font-mono ${errors.startTime ? 'border-red-400' : ''}`} />
                  {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
                </div>
                <div className="flex flex-col items-center gap-0.5 pt-4 shrink-0">
                  <div className="w-5 h-px bg-slate-300 dark:bg-slate-600" />
                  <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  <div className="w-5 h-px bg-slate-300 dark:bg-slate-600" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">End</label>
                  <Input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
                    className={`text-center font-mono ${errors.endTime ? 'border-red-400' : ''}`} />
                  {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subject <span className="text-red-400">*</span></p>
              <Select value={form.subject} onValueChange={v => set('subject', v)}>
                <SelectTrigger className={`rounded-xl ${errors.subject ? 'border-red-400' : 'border-border'}`}>
                  <SelectValue placeholder={subjects.length === 0 ? 'No subjects in DB' : 'Select subject'} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 ? (
                    <div className="py-4 px-3 text-center text-sm text-slate-400">No subjects — add from Classes → Subjects</div>
                  ) : subjects.map(s => (
                    <SelectItem key={s.id} value={s.subjectName}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-black text-blue-700 dark:text-blue-300">{s.subjectCode.slice(0, 3)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{s.subjectName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{s.subjectCode}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </div>

            {/* Class + Room */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Class & Room</p>
              <div className="space-y-3">
                {/* Class */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Class <span className="text-red-500">*</span></label>
                  <Select value={form.classSection} onValueChange={v => set('classSection', v)}>
                    <SelectTrigger className={`rounded-xl ${errors.classSection ? 'border-red-400' : 'border-border'}`}>
                      <SelectValue placeholder={sections.length === 0 ? 'No classes in DB' : 'Select class'} />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.length === 0 ? (
                        <div className="py-4 px-3 text-center text-sm text-slate-400">No classes — add from Classes → Classes</div>
                      ) : sortedSections.map(s => (
                        <SelectItem key={s.id} value={`${s.className}${s.sectionName}`}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-black text-white">{s.className}{s.sectionName}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Class {s.className}</p>
                              <p className="text-[10px] text-slate-400">Section {s.sectionName}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.classSection && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      {errors.classSection}
                    </p>
                  )}
                </div>

                {/* Room */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Room <span className="text-slate-400 font-normal">(optional)</span></label>
                  <Select value={form.roomNumber || '__none__'} onValueChange={v => set('roomNumber', v === '__none__' ? '' : v)}>
                    <SelectTrigger className="rounded-xl border-border">
                      <SelectValue placeholder="Select room (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__"><span className="text-slate-400">No room assigned</span></SelectItem>
                      {rooms.map(r => (
                        <SelectItem key={r.id} value={r.roomNumber}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-black text-orange-700 dark:text-orange-300">{r.roomNumber}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{r.roomNumber}</p>
                              <p className="text-[10px] text-slate-400">{r.capacity} seats</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Summary preview */}
            <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
              isReady
                ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/10'
                : 'border-dashed border-border bg-slate-50 dark:bg-slate-800/40'
            }`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preview</p>
              {isReady ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-[10px] font-black text-white leading-tight">{form.day.slice(0,3)}</span>
                    <span className="text-[8px] text-primary-foreground/70 font-bold">{form.startTime}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{form.subject}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {form.classSection && (
                        <span className="text-[10px] font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">
                          Class {form.classSection}
                        </span>
                      )}
                      {form.roomNumber && (
                        <span className="text-[10px] font-semibold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                          Room {form.roomNumber}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{form.startTime} – {form.endTime}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Fill in subject and class to see preview</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-3 px-4 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!form.startTime || !form.endTime}
            className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 dark:shadow-none font-semibold">
            <Plus className="w-4 h-4 mr-2" />Add Period
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Day color map ─────────────────────────────────────────────────────────────

const DAY_COLORS: Record<Day, string> = {
  Monday:    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  Tuesday:   'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  Wednesday: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  Thursday:  'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
  Friday:    'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800',
  Saturday:  'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeacherTimetablePage() {
  const { user } = useAuth()
  const { teachers, loading: teachersLoading } = useTeachers()
  const { subjects, loading: subjectsLoading } = useSubjects()
  const { sections, loading: sectionsLoading } = useClassSections()
  const { rooms, loading: roomsLoading }        = useClassRooms()

  const [slots, setSlots]                       = useState<TimetableSlot[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [showAdd, setShowAdd]                   = useState(false)
  const [prefillDay, setPrefillDay]             = useState<Day | undefined>()
  const [view, setView]                         = useState<'grid' | 'list'>('grid')

  const isTeacher   = user?.role === 'teacher'
  const isPrincipal = user?.role === 'principal'

  useEffect(() => { setSlots(loadSlots()) }, [])

  useEffect(() => {
    if (isTeacher && teachers.length > 0) {
      const own = teachers.find(t => t.user?.email === user?.email)
      if (own) setSelectedTeacherId(own.id)
    }
  }, [isTeacher, teachers, user])

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId)
  const teacherSlots    = slots.filter(s => s.teacherId === selectedTeacherId)

  const addSlot = (form: SlotForm) => {
    const slot: TimetableSlot = { id: `slot-${Date.now()}`, teacherId: selectedTeacherId, ...form }
    const next = [...slots, slot]
    setSlots(next); saveSlots(next)
  }

  const removeSlot = (id: string) => {
    const next = slots.filter(s => s.id !== id)
    setSlots(next); saveSlots(next)
  }

  const getSlotsForDay = (day: Day) =>
    teacherSlots.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const dataLoading = subjectsLoading || sectionsLoading || roomsLoading

  return (
    <DashboardLayout title="Teacher Timetable">
      <div className="space-y-4 md:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Teacher Timetable</h2>
            <p className="text-sm text-slate-500">
              {selectedTeacher
                ? `${teacherSlots.length} periods for ${selectedTeacher.user?.name}`
                : 'Select a teacher to view schedule'}
            </p>
          </div>
          {selectedTeacherId && (
            <div className="flex gap-2">
              <div className="flex border border-border rounded-lg overflow-hidden">
                {(['grid', 'list'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${v === view ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {v}
                  </button>
                ))}
              </div>
              {isPrincipal && (
                <Button onClick={() => { setPrefillDay(undefined); setShowAdd(true) }}
                  disabled={dataLoading}
                  className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
                  <Plus className="w-4 h-4" />Add Period
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Teacher selector */}
        {(isPrincipal || (isTeacher && teachers.length > 1)) && (
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-sm font-semibold text-muted-foreground shrink-0">Select Teacher:</label>
                {teachersLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />Loading…
                  </div>
                ) : (
                  <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.user?.name} — {t.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!selectedTeacherId && (
          <div className="text-center py-16 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Select a teacher to view their timetable</p>
          </div>
        )}

        {/* Grid view */}
        {selectedTeacherId && view === 'grid' && (
          <div className="space-y-3">
            {DAYS.map(day => {
              const daySlots = getSlotsForDay(day)
              return (
                <Card key={day} className={`border ${DAY_COLORS[day]}`}>
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">{day}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{daySlots.length} period{daySlots.length !== 1 ? 's' : ''}</span>
                        {isPrincipal && (
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1 border-current"
                            onClick={() => { setPrefillDay(day); setShowAdd(true) }} disabled={dataLoading}>
                            <Plus className="w-3 h-3" />Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    {daySlots.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-1">No periods scheduled</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map(slot => (
                          <div key={slot.id}
                            className="relative group flex flex-col bg-white dark:bg-slate-900 border border-border rounded-xl px-3 py-2.5 min-w-35 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-bold text-primary dark:text-teal-400">
                                {slot.startTime} – {slot.endTime}
                              </span>
                              {isPrincipal && (
                                <button onClick={() => removeSlot(slot.id)}
                                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-foreground leading-tight">{slot.subject}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Class {slot.classSection}</p>
                            {slot.roomNumber && (
                              <p className="text-[10px] text-slate-400 mt-0.5">Room {slot.roomNumber}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* List view */}
        {selectedTeacherId && view === 'list' && (
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Day','Time','Subject','Class','Room', isPrincipal ? 'Action' : ''].filter(Boolean).map(h => (
                        <th key={h} className="text-left py-3 px-4 font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teacherSlots.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400">No periods scheduled</td></tr>
                    ) : (
                      [...teacherSlots]
                        .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime))
                        .map(slot => (
                          <tr key={slot.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <td className="py-3 px-4">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${DAY_COLORS[slot.day]}`}>{slot.day}</span>
                            </td>
                            <td className="py-3 px-4 font-mono text-primary dark:text-teal-400 text-xs">{slot.startTime} – {slot.endTime}</td>
                            <td className="py-3 px-4 font-semibold text-foreground">{slot.subject}</td>
                            <td className="py-3 px-4 text-muted-foreground">Class {slot.classSection}</td>
                            <td className="py-3 px-4 text-slate-500">{slot.roomNumber || '—'}</td>
                            {isPrincipal && (
                              <td className="py-3 px-4">
                                <Button size="sm" variant="outline"
                                  className="h-7 w-7 p-0 text-red-500 border-red-200 hover:bg-red-50"
                                  onClick={() => removeSlot(slot.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {selectedTeacherId && teacherSlots.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Periods', value: teacherSlots.length },
              { label: 'Days Active',   value: new Set(teacherSlots.map(s => s.day)).size },
              { label: 'Subjects',      value: new Set(teacherSlots.map(s => s.subject)).size },
              { label: 'Classes',       value: new Set(teacherSlots.map(s => s.classSection)).size },
            ].map(stat => (
              <div key={stat.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-center">
                <p className="text-2xl font-bold text-primary dark:text-teal-400">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTeacherId && (
        <AddSlotDialog
          open={showAdd}
          onClose={() => { setShowAdd(false); setPrefillDay(undefined) }}
          onAdd={addSlot}
          teacherName={selectedTeacher?.user?.name ?? 'Teacher'}
          prefillDay={prefillDay}
          subjects={subjects}
          sections={sections}
          rooms={rooms}
        />
      )}
    </DashboardLayout>
  )
}
