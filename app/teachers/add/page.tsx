'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTeachers } from '@/hooks/use-teachers'
import { useSubjects } from '@/hooks/use-classes'
import { useClassSections } from '@/hooks/use-classes'
import { X, Loader2, ArrowLeft, CheckCircle, GraduationCap, Briefcase, AlertCircle, BookOpen, GraduationCap as ClassIcon } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { handleFormError } from '@/lib/form-errors'
import { ApiError } from '@/lib/api/client'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
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
type FormValues = z.infer<typeof schema>

function Err({ msg }: { msg?: string }) {
  return msg ? (
    <p className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1.5">
      <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
      {msg}
    </p>
  ) : null
}

const DEPARTMENTS = [
  'Mathematics','Science','English','Languages','Social Studies',
  'Computer Science','Arts','Physical Education','Commerce','Others',
]

export default function AddTeacherPage() {
  const router = useRouter()
  const { createTeacher, creating } = useTeachers()
  const { subjects: dbSubjects, loading: subjectsLoading } = useSubjects()
  const { sections: dbSections, loading: sectionsLoading } = useClassSections()

  // Selected subject IDs → stored as subject names for the API
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  // Single class teacher assignment (section ID)
  const [selectedSectionId, setSelectedSectionId]   = useState<string>('')

  const [done, setDone]               = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '', lastName: '', email: '', password: '', phone: '',
      address: '', joinDate: '', department: '', qualification: '',
      experience: '', employeeCode: '',
    },
  })

  const toggleSubject = (id: string) =>
    setSelectedSubjectIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const subjectNames = selectedSubjectIds
        .map(id => dbSubjects.find(s => s.id === id)?.subjectName)
        .filter(Boolean) as string[]

      const sec = dbSections.find(s => s.id === selectedSectionId)
      const classNames = sec ? [`${sec.className}${sec.sectionName}`] : []

      await createTeacher({
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
      setDone(true)
      reset()
      setSelectedSubjectIds([])
      setSelectedSectionId('')
      setTimeout(() => router.push('/teachers/list'), 1500)
    } catch (err) {
      if (err instanceof ApiError && err.isFieldConflict && err.field) {
        setError(err.field as any, { type: 'server', message: err.message }, { shouldFocus: true })
        setServerError(err.message)
      } else {
        handleFormError(err, (field, error) => setError(field as any, error), setServerError)
      }
    }
  }

  // Sort sections by class number then section letter
  const sortedSections = [...dbSections].sort((a, b) => {
    const na = Number(a.className), nb = Number(b.className)
    return !isNaN(na) && !isNaN(nb) ? na - nb : a.className.localeCompare(b.className) || a.sectionName.localeCompare(b.sectionName)
  })

  return (
    <DashboardLayout title="Add New Teacher">
      <div className="max-w-3xl space-y-4">

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Add New Teacher</h2>
            <p className="text-sm text-slate-500">Fill in the details and click Create Teacher</p>
          </div>
        </div>

        {done && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-300">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Teacher created! Redirecting to teacher list…</p>
          </div>
        )}

        {serverError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Could not create teacher</p>
              <p className="text-sm mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          {/* ── Personal Info ─── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Input {...register('email')} type="email" placeholder="teacher@school.com" className={`mt-1.5 ${errors.email ? 'border-red-400' : ''}`} />
                  <Err msg={errors.email?.message} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                  <Input {...register('phone')} placeholder="+91-9876543210" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Password</label>
                  <Input {...register('password')} type="password" placeholder="Default: teacher123" className={`mt-1.5 ${errors.password ? 'border-red-400' : ''}`} />
                  <Err msg={errors.password?.message} />
                  <p className="text-xs text-slate-400 mt-1">Leave blank to use default <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">teacher123</code></p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Join Date</label>
                  <div className="mt-1.5">
                    <Controller name="joinDate" control={control}
                      render={({ field }) => (
                        <DatePicker value={field.value ?? ''} onChange={field.onChange} placeholder="Pick join date" />
                      )} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Address</label>
                <Input {...register('address')} placeholder="Street, City, State" className="mt-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* ── Professional Info ─── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                </div>
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* ── Subjects Taught (from DB) ── */}
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
                  <p className="text-xs text-slate-400 italic py-2">No subjects in database. Add subjects from Classes → Subjects.</p>
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

              {/* ── Class Teacher Of (single class) ── */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                  <ClassIcon className="w-3.5 h-3.5 text-purple-500" />
                  Class Teacher Of
                </label>
                {sectionsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />Loading classes…
                  </div>
                ) : dbSections.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No classes in database. Add classes from Classes → Classes.</p>
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
            </CardContent>
          </Card>

          {/* Actions */}
          {serverError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{serverError}</p>
            </div>
          )}
          <div className="flex gap-3 pb-6">
            <Button
              type="submit"
              disabled={creating || done}
              className="bg-primary hover:bg-primary/90 min-w-36 h-11 text-base"
            >
              {creating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating…</>
              ) : done ? (
                <><CheckCircle className="w-4 h-4 mr-2" />Created!</>
              ) : (
                'Create Teacher'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 text-base"
              onClick={() => router.push('/teachers/list')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
