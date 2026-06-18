'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStudent } from '@/hooks/use-students'
import { useClassSections } from '@/hooks/use-classes'
import { useStudentCategories } from '@/hooks/use-student-categories'
import { handleFormError } from '@/lib/form-errors'
import {
  ArrowLeft, ChevronRight, GraduationCap, User, Phone,
  Mail, Calendar, Save, Loader2, CheckCircle, AlertCircle,
  Edit, X as XIcon, Hash, IdCard, Users, Building2,
  Home, MapPin, School, FileText, Lock, Heart,
  Camera, UploadCloud, BookOpen, CreditCard,
} from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'

// ─── Schema (all fields from add form, password optional for edit) ──────────────

const schema = z.object({
  academicYear:          z.string().min(1, 'Academic year is required'),
  class:                 z.string().min(1, 'Class is required'),
  section:               z.string().min(1, 'Section is required'),
  rollNumber:            z.string().optional(),
  admissionNo:           z.string().optional(),
  categoryId:            z.string().optional(),
  name:                  z.string().min(1, 'Full name is required'),
  gender:                z.enum(['male', 'female', 'other']).optional(),
  dob:                   z.string().optional(),
  phone:                 z.string().optional(),
  email:                 z.string().min(1, 'Email is required').email('Invalid email'),
  fatherName:            z.string().optional(),
  fatherPhone:           z.string().optional(),
  fatherOccupation:      z.string().optional(),
  motherName:            z.string().optional(),
  motherPhone:           z.string().optional(),
  motherOccupation:      z.string().optional(),
  guardianType:          z.enum(['father', 'mother', 'other']).default('father'),
  guardianName:          z.string().optional(),
  guardianEmail:         z.string().optional(),
  guardianPhone:         z.string().optional(),
  guardianOccupation:    z.string().optional(),
  guardianAddress:       z.string().optional(),
  bloodGroup:            z.string().optional(),
  height:                z.string().optional(),
  weight:                z.string().optional(),
  bankAccountNumber:     z.string().optional(),
  bankName:              z.string().optional(),
  ifscCode:              z.string().optional(),
  nationalId:            z.string().optional(),
  previousSchoolName:    z.string().optional(),
  previousSchoolAddress: z.string().optional(),
  currentAddress:        z.string().optional(),
  permanentAddress:      z.string().optional(),
  hostel:                z.string().optional(),
  roomNo:                z.string().optional(),
  details:               z.string().optional(),
})
type FormValues = z.infer<typeof schema>

// ─── Constants ─────────────────────────────────────────────────────────────────

const YEARS        = ['2023-24', '2024-25', '2025-26']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const STEP_COLORS  = ['bg-primary','bg-purple-500','bg-rose-500','bg-amber-500','bg-emerald-500','bg-blue-500','bg-orange-500','bg-slate-500','bg-primary']

// ─── Base components ───────────────────────────────────────────────────────────

function Err({ msg }: { msg?: string }) {
  return msg ? (
    <p className="text-xs text-destructive mt-1.5 flex items-center gap-1 font-medium">
      <XIcon className="w-3 h-3" />{msg}
    </p>
  ) : null
}

function FLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
      {children}{required && <span className="text-destructive ml-0.5 normal-case tracking-normal font-semibold"> *</span>}
    </label>
  )
}

function SI({ icon: Icon, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType; error?: boolean }) {
  return (
    <div className="relative group">
      {Icon && <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${error ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'}`} />}
      <input
        {...props}
        className={`w-full text-sm border rounded-xl bg-background text-foreground placeholder:text-muted-foreground/60 transition-all
          ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          ${error ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary/40'}`}
      />
    </div>
  )
}

function TA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea rows={3} {...props}
      className="w-full text-sm border border-border rounded-xl bg-background text-foreground px-4 py-3 resize-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/40 transition-all"
    />
  )
}

// ─── Section card ──────────────────────────────────────────────────────────────

function SC({ step, icon: Icon, title, subtitle, children }: {
  step: number; icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode
}) {
  const color = STEP_COLORS[(step - 1) % STEP_COLORS.length]
  return (
    <div className="relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${color}`} />
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-muted/30">
        <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-sm`}>
          <span className="text-[10px] font-black text-white">{String(step).padStart(2, '0')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-bold text-foreground text-sm">{title}</h3>
          {subtitle && <span className="text-xs text-muted-foreground hidden sm:block">· {subtitle}</span>}
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ─── Pill selector ─────────────────────────────────────────────────────────────

function Pills<T extends string>({ value, onChange, options, size = 'md' }: {
  value: T; onChange: (v: T) => void
  options: { value: T; label: string }[]
  size?: 'sm' | 'md' | 'sq'
}) {
  const base = size === 'sq' ? 'w-12 h-12 rounded-xl text-sm font-black'
    : size === 'sm' ? 'px-3 py-1.5 rounded-full text-xs font-semibold'
    : 'px-4 py-2 rounded-xl text-sm font-semibold'
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`border-2 transition-all flex items-center justify-center ${base} ${
            value === o.value
              ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.06]'
              : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Photo upload (UI only) ────────────────────────────────────────────────────

function PhotoUpload({ label, circular = false }: { label: string; circular?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null)
  const load = (f: File) => { const r = new FileReader(); r.onload = () => setPreview(r.result as string); r.readAsDataURL(f) }

  if (circular) return (
    <div className="flex flex-col items-center gap-2.5">
      <FLabel>{label}</FLabel>
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-dashed border-border hover:border-primary/60 group transition-colors cursor-pointer">
        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10"
          onChange={e => { const f = e.target.files?.[0]; if (f) load(f) }} />
        {preview ? <img src={preview} alt="" className="w-full h-full object-cover" />
          : <div className="h-full flex flex-col items-center justify-center gap-1.5">
              <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[9px] font-semibold text-muted-foreground">Photo</span>
            </div>}
      </div>
      {preview && <button type="button" onClick={() => setPreview(null)} className="text-[10px] text-destructive hover:underline">Remove</button>}
    </div>
  )

  return (
    <div>
      <FLabel>{label}</FLabel>
      <div className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${preview ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/60'}`}>
        <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={e => { const f = e.target.files?.[0]; if (f) load(f) }} />
        {preview ? (
          <div className="flex items-center gap-3">
            {preview.startsWith('data:image') && <img src={preview} alt="" className="w-8 h-8 rounded-lg object-cover border border-border shrink-0" />}
            <p className="text-xs font-semibold text-primary text-left flex-1 truncate">File selected</p>
            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
          </div>
        ) : (
          <><UploadCloud className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">Drop or <span className="text-primary font-semibold">browse</span></p></>
        )}
      </div>
    </div>
  )
}

// ─── Class+Section picker ──────────────────────────────────────────────────────

function ClassSectionPicker({ watch, setValue, errors, dbSections, dbLoading }: {
  watch: any; setValue: any; errors: any; dbSections: any[]; dbLoading: boolean
}) {
  const selectedClass   = watch('class')
  const selectedSection = watch('section')

  const classOptions = [...new Set(dbSections.map((s: any) => s.className))]
    .filter(Boolean)
    .sort((a: string, b: string) => { const na = Number(a), nb = Number(b); return !isNaN(na) && !isNaN(nb) ? na - nb : a.localeCompare(b) })

  const sectionOptions = dbSections.filter((s: any) => s.className === selectedClass).map((s: any) => s.sectionName).filter(Boolean).sort()

  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-4 space-y-4">
      <div>
        <FLabel required>Class</FLabel>
        {dbLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>
        ) : classOptions.length === 0 ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">No classes found. <Link href="/classes/list" className="underline font-bold">Add classes →</Link></p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {(classOptions as string[]).map(cls => (
              <button key={cls} type="button"
                onClick={() => { setValue('class', cls, { shouldValidate: true }); setValue('section', '') }}
                className={`min-w-13  px-3 py-2 rounded-xl border-2 text-[12px] transition-all ${
                  selectedClass === cls
                    ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25 scale-110'
                    : 'bg-card border-border text-foreground hover:border-primary/60 hover:bg-primary/5 hover:scale-105'
                }`}>
                {cls}
              </button>
            ))}
          </div>
        )}
        {errors.class && <Err msg={errors.class.message} />}
      </div>

      {selectedClass && (
        <div className="border-t border-border pt-3">
          <FLabel required>Section — <span className="text-primary font-bold normal-case">Class {selectedClass}</span></FLabel>
          {sectionOptions.length === 0
            ? <p className="text-xs text-muted-foreground italic">No sections for Class {selectedClass}</p>
            : (
              <div className="flex flex-wrap gap-2">
                {sectionOptions.map((sec: string) => (
                  <button key={sec} type="button" onClick={() => setValue('section', sec, { shouldValidate: true })}
                    className={`w-13 h-13 rounded-xl border-2 text-base font-black transition-all ${
                      selectedSection === sec
                        ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25 scale-110'
                        : 'bg-card border-border text-foreground hover:border-primary/60 hover:bg-primary/5 hover:scale-105'
                    }`}>
                    {sec}
                  </button>
                ))}
              </div>
            )}
          {errors.section && <Err msg={errors.section.message} />}
        </div>
      )}
      {!selectedClass && errors.section && <Err msg={errors.section.message} />}
    </div>
  )
}

// ─── Edit Page ─────────────────────────────────────────────────────────────────

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const router  = useRouter()

  const { student, loading: fetching, updateStudent, updating } = useStudent(id)
  const { sections: dbSections, loading: dbLoading }            = useClassSections()
  const { categories }                                          = useStudentCategories()

  const [done, setDone]               = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, control, watch, setValue, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { guardianType: 'father', gender: 'male' },
  })

  const selectedGender  = watch('gender')
  const guardianType    = watch('guardianType')

  useEffect(() => {
    if (student) {
      reset({
        academicYear:   student.academicYear ?? '2024-25',
        class:          student.class,
        section:        student.section,
        rollNumber:     student.rollNumber,
        admissionNo:    '',
        categoryId:     '',
        name:           student.user?.name ?? '',
        gender:         'male',
        dob:            student.dob ?? '',
        phone:          student.user?.phone ?? '',
        email:          student.user?.email ?? '',
        fatherName:     student.fatherName ?? '',
        fatherPhone:    '',
        fatherOccupation: '',
        motherName:     student.motherName ?? '',
        motherPhone:    '',
        motherOccupation: '',
        guardianType:   'father',
        guardianName:   '',
        guardianEmail:  '',
        guardianPhone:  '',
        guardianOccupation: '',
        guardianAddress: '',
        bloodGroup:     '',
        height:         '',
        weight:         '',
        bankAccountNumber: '',
        bankName:       '',
        ifscCode:       '',
        nationalId:     '',
        previousSchoolName: '',
        previousSchoolAddress: '',
        currentAddress: student.user?.address ?? '',
        permanentAddress: '',
        hostel:         '',
        roomNo:         '',
        details:        '',
      })
    }
  }, [student, reset])

  const onSubmit = async (v: FormValues) => {
    setServerError(null)
    try {
      await updateStudent({
        name:         v.name,
        email:        v.email,
        phone:        v.phone,
        address:      v.currentAddress,
        rollNumber:   v.rollNumber ?? '',
        class:        v.class,
        section:      v.section,
        fatherName:   v.fatherName,
        motherName:   v.motherName,
        dob:          v.dob,
        academicYear: v.academicYear,
        enrollmentDate: student?.enrollmentDate,
      } as any)
      setDone(true)
      setTimeout(() => router.push('/students'), 1500)
    } catch (err) {
      handleFormError(err, (f, e) => setError(f as any, e), setServerError)
    }
  }

  if (fetching) {
    return (
      <DashboardLayout title="Edit Student">
        <div className="flex justify-center py-24">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading student data…</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!student && !fetching) {
    return (
      <DashboardLayout title="Edit Student">
        <div className="flex justify-center py-24">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">Student not found</p>
            <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => router.push('/students')}>
              Back to Students
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Edit Student">
      <div className="max-w-5xl">

        {/* ── Banner ── */}
        <div className="relative rounded-2xl bg-primary overflow-hidden mb-6 shadow-xl shadow-primary/20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full translate-y-20 -translate-x-20" />
          </div>

          <div className="relative px-6 py-7">
            <div className="flex items-center gap-3 mb-4">
              <button type="button" onClick={() => router.back()}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <nav className="flex items-center gap-1.5 text-primary-foreground/60 text-xs">
                <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/students" className="hover:text-white">Students</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white font-semibold">Edit Student</span>
              </nav>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                  <span className="text-2xl font-black text-white">{student?.user?.name?.charAt(0) ?? '?'}</span>
                </div>
                <div>
                  <h1 className="text-xl font-black text-white leading-tight">{student?.user?.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">Class {student?.class}-{student?.section}</span>
                    <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">Roll {student?.rollNumber}</span>
                    <span className="text-primary-foreground/60 text-xs">{student?.user?.email}</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                <Edit className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {done && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-green-800 dark:text-green-300 mb-5">
            <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-bold">Student updated successfully!</p>
              <p className="text-xs mt-0.5 opacity-70">Redirecting to student list…</p>
            </div>
          </div>
        )}
        {serverError && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive mb-5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-28">

          {/* ═══ 01 Personal Info ═══ */}
          <SC step={1} icon={GraduationCap} title="Personal Info" subtitle="Academic placement and personal details">

            {/* Academic Year */}
            <div className="mb-5">
              <FLabel required>Academic Year</FLabel>
              <Controller name="academicYear" control={control}
                render={({ field }) => (
                  <div className="flex gap-2 flex-wrap">
                    {YEARS.map(y => (
                      <button key={y} type="button" onClick={() => field.onChange(y)}
                        className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                          field.value === y
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                        }`}>
                        {y}
                      </button>
                    ))}
                  </div>
                )} />
              <Err msg={errors.academicYear?.message} />
            </div>

            {/* Class + Section from DB */}
            <div className="mb-5">
              <ClassSectionPicker watch={watch} setValue={setValue} errors={errors} dbSections={dbSections} dbLoading={dbLoading} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FLabel>Admission No</FLabel>
                <SI icon={IdCard} {...register('admissionNo')} placeholder="Enter admission number" />
              </div>
              <div>
                <FLabel>Roll Number</FLabel>
                <SI icon={Hash} {...register('rollNumber')} placeholder="e.g. 001" />
              </div>
              <div>
                <FLabel required>Full Name</FLabel>
                <SI icon={User} {...register('name')} placeholder="Enter full name" error={!!errors.name} />
                <Err msg={errors.name?.message} />
              </div>
              <div>
                <FLabel>Category</FLabel>
                <Controller name="categoryId" control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? '__none__'} onValueChange={v => field.onChange(v === '__none__' ? '' : v)}>
                      <SelectTrigger className="rounded-xl h-11 border-border"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
              </div>
              <div>
                <FLabel>Gender</FLabel>
                <div className="mt-0.5">
                  <Pills value={selectedGender ?? 'male'} onChange={v => setValue('gender', v)} size="sm"
                    options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                </div>
              </div>
              <div>
                <FLabel>Date of Birth</FLabel>
                <Controller name="dob" control={control}
                  render={({ field }) => (
                    <DatePicker value={field.value ?? ''} onChange={field.onChange} placeholder="Pick date of birth" />
                  )} />
              </div>
              <div>
                <FLabel>Phone Number</FLabel>
                <SI icon={Phone} {...register('phone')} placeholder="Enter phone number" />
              </div>
              <div>
                <FLabel required>Email</FLabel>
                <SI icon={Mail} {...register('email')} type="email" placeholder="Enter email" error={!!errors.email} />
                <Err msg={errors.email?.message} />
              </div>
              <div className="flex justify-center">
                <PhotoUpload label="Student Photo" circular />
              </div>
            </div>
          </SC>

          {/* ═══ 02 Parent & Guardian ═══ */}
          <SC step={2} icon={Users} title="Parent & Guardian Info" subtitle="Family contact and guardian details">
            <Divider label="Father's Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
              <div><FLabel>Father's Name</FLabel><SI icon={User} {...register('fatherName')} placeholder="Father's name" /></div>
              <div><FLabel>Phone</FLabel><SI icon={Phone} {...register('fatherPhone')} placeholder="Phone number" /></div>
              <div><FLabel>Occupation</FLabel><SI icon={BookOpen} {...register('fatherOccupation')} placeholder="Occupation" /></div>
              <PhotoUpload label="Father's Photo" />
            </div>

            <Divider label="Mother's Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
              <div><FLabel>Mother's Name</FLabel><SI icon={User} {...register('motherName')} placeholder="Mother's name" /></div>
              <div><FLabel>Phone</FLabel><SI icon={Phone} {...register('motherPhone')} placeholder="Phone number" /></div>
              <div><FLabel>Occupation</FLabel><SI icon={BookOpen} {...register('motherOccupation')} placeholder="Occupation" /></div>
              <PhotoUpload label="Mother's Photo" />
            </div>

            <Divider label="Guardian" />
            <div className="mb-4">
              <FLabel>Guardian Type</FLabel>
              <Controller name="guardianType" control={control}
                render={({ field }) => (
                  <Pills value={field.value} onChange={field.onChange} size="sm"
                    options={[{ value: 'father', label: 'Father' }, { value: 'mother', label: 'Mother' }, { value: 'other', label: 'Others' }]} />
                )} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><FLabel>Guardian Name</FLabel><SI icon={User} {...register('guardianName')} placeholder="Guardian name" /></div>
              <div><FLabel>Guardian Email</FLabel><SI icon={Mail} {...register('guardianEmail')} type="email" placeholder="Email address" /></div>
              <div><FLabel>Phone</FLabel><SI icon={Phone} {...register('guardianPhone')} placeholder="Phone number" /></div>
              <div><FLabel>Occupation</FLabel><SI icon={BookOpen} {...register('guardianOccupation')} placeholder="Occupation" /></div>
              <div><FLabel>Address</FLabel><SI icon={MapPin} {...register('guardianAddress')} placeholder="Address" /></div>
              <PhotoUpload label="Guardian Photo" />
            </div>
          </SC>

          {/* ═══ 03 Medical ═══ */}
          <SC step={3} icon={Heart} title="Medical Details" subtitle="Health and physical information">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <FLabel>Blood Group</FLabel>
                <Controller name="bloodGroup" control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-xl h-11 border-border"><SelectValue placeholder="Select blood group" /></SelectTrigger>
                      <SelectContent>{BLOOD_GROUPS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
              </div>
              <div><FLabel>Height (cm)</FLabel><SI {...register('height')} type="number" placeholder="e.g. 165" /></div>
              <div><FLabel>Weight (kg)</FLabel><SI {...register('weight')} type="number" placeholder="e.g. 55" /></div>
            </div>
          </SC>

          {/* ═══ 04 Bank Details ═══ */}
          <SC step={4} icon={CreditCard} title="Bank Details" subtitle="Banking and identification">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><FLabel>Account Number</FLabel><SI icon={Hash} {...register('bankAccountNumber')} placeholder="Account number" /></div>
              <div><FLabel>Bank Name</FLabel><SI icon={Building2} {...register('bankName')} placeholder="Bank name" /></div>
              <div><FLabel>IFSC Code</FLabel><SI icon={Hash} {...register('ifscCode')} placeholder="IFSC Code" /></div>
              <div><FLabel>National ID</FLabel><SI icon={IdCard} {...register('nationalId')} placeholder="National ID" /></div>
            </div>
          </SC>

          {/* ═══ 05 Previous School ═══ */}
          <SC step={5} icon={School} title="Previous School Details" subtitle="Prior educational institution">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><FLabel>School Name</FLabel><SI icon={School} {...register('previousSchoolName')} placeholder="Enter school name" /></div>
              <div><FLabel>Address</FLabel><SI icon={MapPin} {...register('previousSchoolAddress')} placeholder="School address" /></div>
            </div>
          </SC>

          {/* ═══ 06 Address ═══ */}
          <SC step={6} icon={MapPin} title="Address" subtitle="Residential addresses">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><FLabel>Current Address</FLabel><TA {...register('currentAddress')} placeholder="Enter current address" /></div>
              <div><FLabel>Permanent Address</FLabel><TA {...register('permanentAddress')} placeholder="Enter permanent address" /></div>
            </div>
          </SC>

          {/* ═══ 07 Hostel ═══ */}
          <SC step={7} icon={Home} title="Hostel Details" subtitle="On-campus accommodation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><FLabel>Hostel Name</FLabel><SI icon={Home} {...register('hostel')} placeholder="Enter hostel name" /></div>
              <div><FLabel>Room No</FLabel><SI icon={Hash} {...register('roomNo')} placeholder="Enter room number" /></div>
            </div>
          </SC>

          {/* ═══ 08 Documents ═══ */}
          <SC step={8} icon={FileText} title="Documents & Notes" subtitle="Upload documents and additional info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PhotoUpload label="Upload Document" />
              <div><FLabel>Additional Details</FLabel><TA {...register('details')} rows={4} placeholder="Any additional details…" /></div>
            </div>
          </SC>

          {/* ═══ 09 Login Details ═══ */}
          <SC step={9} icon={Lock} title="Login Details" subtitle="Student portal login credentials">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FLabel required>Email</FLabel>
                <SI icon={Mail} {...register('email')} type="email" placeholder="Enter email" error={!!errors.email} />
                <Err msg={errors.email?.message} />
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Password</p>
                <p className="text-xs text-muted-foreground">
                  To change the student's password, use the account settings or admin reset feature.
                  The existing password remains unchanged when saving this form.
                </p>
              </div>
            </div>
          </SC>
        </form>

        {/* ── Sticky submit bar ── */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-50">
          <div className="bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 shadow-2xl">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-destructive inline-block" />
                Required fields must be filled before saving
              </div>
              <div className="flex gap-3 ml-auto">
                <Link href="/students">
                  <Button type="button" variant="outline" className="h-10 px-6 rounded-xl">Cancel</Button>
                </Link>
                <Button type="submit" form="" onClick={handleSubmit(onSubmit)} disabled={updating || done}
                  className="h-10 px-8 bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 font-bold gap-2">
                  {updating ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                   : done    ? <><CheckCircle className="w-4 h-4" />Saved!</>
                   :           <><Save className="w-4 h-4" />Save Changes</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
