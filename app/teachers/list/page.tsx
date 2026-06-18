'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useTeachers } from '@/hooks/use-teachers'
import { useSubjects, useClassSections } from '@/hooks/use-classes'
import { TeacherProfile } from '@/lib/api/endpoints/teachers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Loader2, Search, Edit, Trash2,
  Plus, X, Users, AlertCircle, Eye,
  Mail, Phone, MapPin, Calendar, Award, BookOpen, GraduationCap, BadgeCheck, Hash,
} from 'lucide-react'
import { handleFormError } from '@/lib/form-errors'
import Link from 'next/link'
import Swal from 'sweetalert2'

// ─── Edit schema ───────────────────────────────────────────────────────────────

const editSchema = z.object({
  firstName:     z.string().min(1, 'First name is required'),
  lastName:      z.string().min(1, 'Last name is required'),
  email:         z.string().min(1, 'Email is required').email('Enter a valid email'),
  password:      z.string().optional().refine(v => !v || v.length >= 6, 'Minimum 6 characters'),
  phone:         z.string().optional(),
  address:       z.string().optional(),
  joinDate:      z.string().optional(),
  department:    z.string().min(1, 'Department is required'),
  qualification: z.string().optional(),
  experience:    z.string().optional(),
  employeeCode:  z.string().optional(),
})

type EditValues = z.infer<typeof editSchema>

const DEPARTMENTS = [
  'Mathematics','Science','English','Languages','Social Studies',
  'Computer Science','Arts','Physical Education','Commerce','Others',
]

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null
}

// ─── View Dialog ───────────────────────────────────────────────────────────────

function ViewTeacherDialog({ teacher, onClose }: { teacher: TeacherProfile | null; onClose: () => void }) {
  if (!teacher) return null
  const name = teacher.user?.name ?? '—'
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Dialog open={!!teacher} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            Teacher Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{name}</p>
              <p className="text-sm text-primary">{teacher.department ?? '—'}</p>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                teacher.user?.isActive === false
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {teacher.user?.isActive === false ? 'Inactive' : 'Active'}
              </span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contact</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-foreground">{teacher.user?.email ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-foreground">{teacher.user?.phone || '—'}</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-foreground">{teacher.user?.address || '—'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-foreground">Joined: {teacher.user?.joinDate || '—'}</span>
              </div>
            </div>
          </div>

          {/* Professional */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Professional</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 text-sm">
                <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Employee Code</p>
                  <p className="font-mono font-medium text-foreground">{teacher.employeeCode ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Award className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Qualification</p>
                  <p className="font-medium text-foreground">{teacher.qualification || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <BadgeCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Experience</p>
                  <p className="font-medium text-foreground">{teacher.experience ?? 0} years</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Department</p>
                  <p className="font-medium text-foreground">{teacher.department ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />Subjects Taught
            </p>
            {(teacher.subjects?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {teacher.subjects.map(s => (
                  <span key={s} className="text-xs bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400">No subjects assigned</p>}
          </div>

          {/* Classes */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />Assigned Classes
            </p>
            {(teacher.classes?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {teacher.classes.map(c => (
                  <span key={c} className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-full">{c}</span>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400">No classes assigned</p>}
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Dialog ───────────────────────────────────────────────────────────────

function EditTeacherDialog({ teacher, onClose, onSave, loading }: {
  teacher: TeacherProfile | null
  onClose: () => void
  onSave: (id: string, data: any) => Promise<void>
  loading: boolean
}) {
  const { subjects: dbSubjects, loading: subjectsLoading } = useSubjects()
  const { sections: dbSections, loading: sectionsLoading } = useClassSections()

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [selectedSectionId,  setSelectedSectionId]  = useState<string>('')
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
  })

  useEffect(() => {
    if (!teacher) return
    const nameParts = (teacher.user?.name ?? '').trim().split(' ')
    const firstName = nameParts[0] ?? ''
    const lastName  = nameParts.slice(1).join(' ')
    reset({
      firstName,
      lastName,
      email:         teacher.user?.email         ?? '',
      password:      '',
      phone:         teacher.user?.phone         ?? '',
      address:       teacher.user?.address       ?? '',
      joinDate:      teacher.user?.joinDate      ?? '',
      department:    teacher.department          ?? '',
      qualification: teacher.qualification       ?? '',
      experience:    String(teacher.experience   ?? 0),
      employeeCode:  teacher.employeeCode        ?? '',
    })
    const teacherSubjects = teacher.subjects ?? []
    setSelectedSubjectIds(
      dbSubjects
        .filter(s => teacherSubjects.includes(s.subjectName))
        .map(s => s.id)
    )
    // Pre-select the single assigned class
    const teacherClasses = teacher.classes ?? []
    const matchedSection = dbSections.find(s => teacherClasses.includes(`${s.className}${s.sectionName}`))
    setSelectedSectionId(matchedSection?.id ?? '')
  }, [teacher, dbSubjects, dbSections, reset])

  if (!teacher) return null

  const toggleSubject = (id: string) =>
    setSelectedSubjectIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const sortedSections = [...dbSections].sort((a, b) => {
    const na = Number(a.className), nb = Number(b.className)
    return !isNaN(na) && !isNaN(nb) ? na - nb : a.className.localeCompare(b.className) || a.sectionName.localeCompare(b.sectionName)
  })

  const onSubmit = async (values: EditValues) => {
    setServerError(null)
    try {
      const subjectNames = selectedSubjectIds
        .map(id => dbSubjects.find(s => s.id === id)?.subjectName)
        .filter(Boolean) as string[]
      const sec = dbSections.find(s => s.id === selectedSectionId)
      const classNames = sec ? [`${sec.className}${sec.sectionName}`] : []
      await onSave(teacher.id, {
        name:          `${values.firstName.trim()} ${values.lastName.trim()}`,
        email:         values.email,
        password:      values.password || undefined,
        phone:         values.phone || undefined,
        address:       values.address || undefined,
        joinDate:      values.joinDate || undefined,
        department:    values.department,
        qualification: values.qualification || undefined,
        experience:    values.experience ? parseInt(values.experience) : undefined,
        employeeCode:  values.employeeCode || undefined,
        subjects:      subjectNames,
        classes:       classNames,
      })
      onClose()
    } catch (err) {
      handleFormError(err, (field, error) => setError(field as any, error), setServerError)
    }
  }

  return (
    <Dialog open={!!teacher} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
              <Edit className="w-4 h-4 text-primary" />
            </div>
            Edit Teacher — {teacher.user?.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1" noValidate>

          {serverError && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm">{serverError}</p>
            </div>
          )}

          {/* Personal */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Personal Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">First Name <span className="text-red-500">*</span></label>
                <Input {...register('firstName')} placeholder="e.g. Rajesh" className={`mt-1.5 ${errors.firstName ? 'border-red-400' : ''}`} />
                <Err msg={errors.firstName?.message} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Last Name <span className="text-red-500">*</span></label>
                <Input {...register('lastName')} placeholder="e.g. Kumar" className={`mt-1.5 ${errors.lastName ? 'border-red-400' : ''}`} />
                <Err msg={errors.lastName?.message} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email <span className="text-red-500">*</span></label>
                <Input {...register('email')} type="email" className={`mt-1.5 ${errors.email ? 'border-red-400' : ''}`} />
                <Err msg={errors.email?.message} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
                <Input {...register('password')} type="password" placeholder="Leave blank to keep current" className={`mt-1.5 ${errors.password ? 'border-red-400' : ''}`} />
                <Err msg={errors.password?.message} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                <Input {...register('phone')} placeholder="+91-9876543210" className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Join Date</label>
                <Input {...register('joinDate')} type="date" className="mt-1.5" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Address</label>
              <Input {...register('address')} placeholder="Street, City, State" className="mt-1.5" />
            </div>
          </div>

          {/* Professional */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Professional Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Department <span className="text-red-500">*</span></label>
                <Controller name="department" control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`mt-1.5 ${errors.department ? 'border-red-400' : ''}`}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Err msg={errors.department?.message} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Employee Code</label>
                <Input {...register('employeeCode', { setValueAs: v => v.toUpperCase() })} placeholder="e.g. EMP005" className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Qualification</label>
                <Input {...register('qualification')} placeholder="e.g. M.Sc, B.Ed" className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Experience (years)</label>
                <Input {...register('experience')} type="number" min={0} max={50} placeholder="0" className="mt-1.5" />
              </div>
            </div>

            {/* Subjects from DB */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                Subjects Taught
                {selectedSubjectIds.length > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{selectedSubjectIds.length}</span>
                )}
              </label>
              {subjectsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />Loading subjects…
                </div>
              ) : dbSubjects.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">No subjects in database.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dbSubjects.map(s => {
                    const selected = selectedSubjectIds.includes(s.id)
                    return (
                      <button key={s.id} type="button" onClick={() => toggleSubject(s.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'border-border text-muted-foreground hover:border-teal-300 hover:text-primary hover:bg-teal-50 dark:hover:bg-teal-900/20'
                        }`}>
                        {selected && <X className="w-3 h-3" />}
                        {s.subjectName}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Class Teacher Of (single select) */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                Class Teacher Of
              </label>
              {sectionsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />Loading classes…
                </div>
              ) : dbSections.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">No classes in database.</p>
              ) : (
                <Select value={selectedSectionId || '__none__'} onValueChange={v => setSelectedSectionId(v === '__none__' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <span className="text-slate-400">None</span>
                    </SelectItem>
                    {sortedSections.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.className}{s.sectionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 min-w-28">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeacherListPage() {
  const { teachers, loading, updateTeacher, deleteTeacher, updating } = useTeachers()

  const [search, setSearch]         = useState('')
  const [viewTarget, setViewTarget] = useState<TeacherProfile | null>(null)
  const [editTarget, setEditTarget] = useState<TeacherProfile | null>(null)

  const filtered = teachers.filter(t =>
    (t.user?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.employeeCode ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.department ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (id: string, data: any) => {
    await updateTeacher({ id, data })
    setEditTarget(null)
  }

  const handleDelete = async (teacher: TeacherProfile) => {
    const result = await Swal.fire({
      title: 'Deactivate Teacher?',
      html: `<p style="font-size:14px;color:#64748b">
        <strong style="color:#1e293b">${teacher.user?.name}</strong>'s account will be disabled.<br/>
        <span style="font-size:12px">Department: ${teacher.department} · Code: ${teacher.employeeCode ?? '—'}</span>
      </p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Deactivate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
    })
    if (result.isConfirmed) await deleteTeacher(teacher.id)
  }

  return (
    <DashboardLayout title="Teacher List">
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Teacher List</h2>
            <p className="text-sm text-slate-500">{teachers.length} staff members</p>
          </div>
          <Link href="/teachers/add">
            <Button className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Teacher</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, code or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Name','Emp Code','Department','Qualification','Exp.','Subjects','Class','Actions'].map(h => (
                        <th key={h} className={`py-3 px-4 font-semibold text-muted-foreground ${h === 'Actions' ? 'text-center' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {t.user?.name?.charAt(0) ?? '?'}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{t.user?.name}</p>
                              <p className="text-xs text-slate-500">{t.user?.email}</p>
                            </div>
                          </div>
                          {t.user?.isActive === false && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mt-1 inline-block">Inactive</span>
                          )}
                        </td>

                        {/* Employee Code */}
                        <td className="py-3 px-4 font-mono text-slate-500 text-xs">{t.employeeCode ?? '—'}</td>

                        {/* Department */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300">
                            {t.department}
                          </span>
                        </td>

                        {/* Qualification */}
                        <td className="py-3 px-4 text-slate-500 text-xs">{t.qualification || '—'}</td>

                        {/* Experience */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{t.experience ?? 0}</span>
                          <span className="text-slate-400 text-xs">y</span>
                        </td>

                        {/* Subjects */}
                        <td className="py-3 px-4">
                          <div className="flex flex-nowrap gap-1 overflow-x-auto no-scrollbar max-w-40">
                            {(t.subjects ?? []).slice(0, 2).map(s => (
                              <span key={s} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-muted-foreground px-1.5 py-0.5 rounded whitespace-nowrap">{s}</span>
                            ))}
                            {(t.subjects?.length ?? 0) > 2 && (
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">+{(t.subjects?.length ?? 0) - 2}</span>
                            )}
                            {(t.subjects?.length ?? 0) === 0 && <span className="text-slate-400">—</span>}
                          </div>
                        </td>

                        {/* Assigned Class */}
                        <td className="py-3 px-4">
                          {(t.classes ?? []).length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {t.classes[0]}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                              onClick={() => setViewTarget(t)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs gap-1.5 text-primary border-teal-200 hover:bg-teal-600 hover:text-white hover:border-teal-600 dark:border-teal-800"
                              onClick={() => setEditTarget(t)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs gap-1.5 text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-900"
                              onClick={() => handleDelete(t)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-14 text-slate-400">
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p className="font-medium">No teachers found</p>
                          <Link href="/teachers/add" className="text-sm text-primary hover:underline mt-1 block">
                            Add your first teacher →
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ViewTeacherDialog
        teacher={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <EditTeacherDialog
        teacher={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
        loading={updating}
      />

    </DashboardLayout>
  )
}
