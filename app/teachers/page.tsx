'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useTeachers } from '@/hooks/use-teachers'
import { TeacherProfile } from '@/lib/api/endpoints/teachers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCard } from '@/components/dashboard-components'
import {
  Users, Plus, Loader2, Phone, Mail, BookOpen,
  Edit, Trash2, AlertTriangle, X, AlertCircle,
} from 'lucide-react'
import { handleFormError } from '@/lib/form-errors'

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'Mathematics','Science','English','Languages','Social Studies',
  'Computer Science','Arts','Physical Education','Commerce','Others',
]

// ─── Edit schema ───────────────────────────────────────────────────────────────

const editSchema = z.object({
  name:          z.string().min(1, 'Name is required'),
  email:         z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone:         z.string().optional(),
  address:       z.string().optional(),
  joinDate:      z.string().optional(),
  department:    z.string().min(1, 'Department is required'),
  qualification: z.string().optional(),
  experience:    z.string().optional(),
  employeeCode:  z.string().optional(),
  isActive:      z.boolean().optional(),
})

type EditValues = z.infer<typeof editSchema>

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null
}

// ─── Edit Teacher Dialog ───────────────────────────────────────────────────────

function EditTeacherDialog({ teacher, onClose, onSave, loading }: {
  teacher: TeacherProfile | null
  onClose: () => void
  onSave: (id: string, data: Partial<EditValues & { subjects: string[]; classes: string[] }>) => Promise<void>
  loading: boolean
}) {
  const [subjects, setSubjects]       = useState<string[]>([])
  const [subInput, setSubInput]       = useState('')
  const [classes,  setClasses]        = useState<string[]>([])
  const [clsInput, setClsInput]       = useState('')
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
  })

  // Populate form when teacher changes
  useEffect(() => {
    if (teacher) {
      reset({
        name:          teacher.user?.name ?? '',
        email:         teacher.user?.email ?? '',
        phone:         teacher.user?.phone ?? '',
        address:       teacher.user?.address ?? '',
        joinDate:      teacher.user?.joinDate ?? '',
        department:    teacher.department ?? '',
        qualification: teacher.qualification ?? '',
        experience:    String(teacher.experience ?? 0),
        employeeCode:  teacher.employeeCode ?? '',
        isActive:      teacher.user?.isActive ?? true,
      })
      setSubjects(teacher.subjects ?? [])
      setClasses(teacher.classes ?? [])
    }
  }, [teacher, reset])

  if (!teacher) return null

  const addTag = (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    const val = input.trim()
    if (val && !list.includes(val)) setList([...list, val])
    setInput('')
  }

  const removeTag = (list: string[], setList: (v: string[]) => void, tag: string) =>
    setList(list.filter(t => t !== tag))

  const onSubmit = async (values: EditValues) => {
    setServerError(null)
    try {
      await onSave(teacher.id, { ...values, subjects, classes })
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
            Edit Teacher
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">

          {serverError && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm">{serverError}</p>
            </div>
          )}

          {/* Personal */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Personal</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name <span className="text-red-500">*</span></label>
                <Input {...register('name')} className={`mt-1.5 ${errors.name ? 'border-red-400' : ''}`} />
                <Err msg={errors.name?.message} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email <span className="text-red-500">*</span></label>
                <Input {...register('email')} type="email" className={`mt-1.5 ${errors.email ? 'border-red-400' : ''}`} />
                <Err msg={errors.email?.message} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                <Input {...register('phone')} className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Join Date</label>
                <Input {...register('joinDate')} type="date" className="mt-1.5" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Address</label>
              <Input {...register('address')} className="mt-1.5" />
            </div>
          </div>

          {/* Professional */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Professional</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Department <span className="text-red-500">*</span></label>
                <Controller name="department" control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`mt-1.5 ${errors.department ? 'border-red-400' : ''}`}>
                        <SelectValue />
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
                <Input {...register('employeeCode')} className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Qualification</label>
                <Input {...register('qualification')} className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Experience (years)</label>
                <Input {...register('experience')} type="number" min={0} className="mt-1.5" />
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Subjects</label>
              <div className="flex gap-2 mt-1.5">
                <Input value={subInput} onChange={e => setSubInput(e.target.value)} placeholder="Add subject"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(subjects, setSubjects, subInput, setSubInput) } }} />
                <Button type="button" variant="outline" size="sm" className="shrink-0"
                  onClick={() => addTag(subjects, setSubjects, subInput, setSubInput)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {subjects.map(s => (
                    <span key={s} className="flex items-center gap-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 rounded-full text-xs">
                      {s}
                      <button type="button" onClick={() => removeTag(subjects, setSubjects, s)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Classes */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Assigned Classes</label>
              <div className="flex gap-2 mt-1.5">
                <Input value={clsInput} onChange={e => setClsInput(e.target.value)} placeholder="e.g. 10A"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(classes, setClasses, clsInput, setClsInput) } }} />
                <Button type="button" variant="outline" size="sm" className="shrink-0"
                  onClick={() => addTag(classes, setClasses, clsInput, setClsInput)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {classes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {classes.map(c => (
                    <span key={c} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full text-xs">
                      {c}
                      <button type="button" onClick={() => removeTag(classes, setClasses, c)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 min-w-24">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Confirmation Dialog ────────────────────────────────────────────────

function DeleteDialog({ teacher, onClose, onConfirm, loading }: {
  teacher: TeacherProfile | null; onClose: () => void
  onConfirm: (id: string) => Promise<void>; loading: boolean
}) {
  if (!teacher) return null
  return (
    <Dialog open={!!teacher} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />Deactivate Teacher
          </DialogTitle>
        </DialogHeader>
        <div className="py-3">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Are you sure you want to deactivate{' '}
            <strong className="text-foreground">{teacher.user?.name}</strong>?
          </p>
          <p className="text-xs text-slate-500 mt-2">Their account will be disabled. This can be reversed by updating the account later.</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            onClick={() => onConfirm(teacher.id)}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90 min-w-28"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Deactivating…</> : 'Yes, Deactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeachersPage() {
  const { teachers, loading, updateTeacher, deleteTeacher, updating, deleting } = useTeachers()

  const [search, setSearch]           = useState('')
  const [editTarget, setEditTarget]   = useState<TeacherProfile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeacherProfile | null>(null)

  const filtered = teachers.filter(t =>
    (t.user?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.department ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const departments = [...new Set(teachers.map(t => t.department).filter(Boolean))]

  const handleSave = async (id: string, data: any) => {
    await updateTeacher({ id, data })
    setEditTarget(null)
  }

  const handleDelete = async (id: string) => {
    await deleteTeacher(id)
    setDeleteTarget(null)
  }

  return (
    <DashboardLayout title="Teachers">
      <div className="space-y-4 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Teachers</h2>
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total Teachers" value={teachers.length} icon={Users} index={0} />
          {departments.slice(0, 3).map((dept, i) => (
            <StatCard key={dept} title={dept!} value={teachers.filter(t => t.department === dept).length} icon={BookOpen} index={i + 1} />
          ))}
        </div>

        {/* Search */}
        <Input
          placeholder="Search by name or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No teachers found</p>
            <Link href="/teachers/add" className="text-sm text-primary hover:underline mt-1 block">Add your first teacher →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => (
              <Card key={t.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                      {t.user?.name?.charAt(0) ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{t.user?.name}</p>
                      <p className="text-xs text-primary dark:text-teal-400">{t.department}</p>
                    </div>
                    {/* Status badge */}
                    {t.user?.isActive === false && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">Inactive</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{t.user?.email}</span></div>
                    {t.user?.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" />{t.user.phone}</div>}
                    <p>{t.qualification || '—'} · {t.experience ?? 0}y exp</p>
                    {t.employeeCode && <p className="font-mono text-slate-400">{t.employeeCode}</p>}
                  </div>

                  {/* Subject chips */}
                  {(t.subjects?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(t.subjects ?? []).slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-muted-foreground">{s}</span>
                      ))}
                      {(t.subjects?.length ?? 0) > 3 && (
                        <span className="text-[10px] text-slate-400">+{(t.subjects?.length ?? 0) - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm" variant="outline"
                      className="flex-1 h-7 text-xs gap-1"
                      onClick={() => setEditTarget(t)}
                    >
                      <Edit className="w-3 h-3" />Edit
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="h-7 w-7 p-0 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => setDeleteTarget(t)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EditTeacherDialog
        teacher={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
        loading={updating}
      />

      <DeleteDialog
        teacher={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </DashboardLayout>
  )
}
