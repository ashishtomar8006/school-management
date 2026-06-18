'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStudents } from '@/hooks/use-students'
import { DatePicker } from '@/components/ui/date-picker'
import { useStudentCategories } from '@/hooks/use-student-categories'
import { useClassSections } from '@/hooks/use-classes'
import { handleFormError } from '@/lib/form-errors'
import {
  ChevronRight, User, GraduationCap, Heart, Building2,
  School, MapPin, Home, FileText, Lock, UploadCloud,
  Loader2, CheckCircle, ArrowLeft, Users, Phone, Mail,
  Hash, Calendar, BookOpen, CreditCard, IdCard,
  Save, X as XIcon, AlertCircle, Camera,
} from 'lucide-react'

// ─── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  academicYear:          z.string().min(1, 'Required'),
  class:                 z.string().min(1, 'Class is required'),
  section:               z.string().min(1, 'Section is required'),
  rollNumber:            z.string().optional(),
  admissionNo:           z.string().min(1, 'Admission number is required'),
  categoryId:            z.string().optional(),
  name:                  z.string().min(1, 'Full name is required'),
  gender:                z.enum(['male', 'female', 'other']).optional(),
  dob:                   z.string().optional(),
  phone:                 z.string().optional(),
  email:                 z.string().min(1, 'Email is required').email('Invalid email'),
  password:              z.string().min(6, 'Min 6 characters'),
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

const YEARS        = ['2023-24', '2024-25', '2025-26']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// ─── Base components ───────────────────────────────────────────────────────────

function Err({ msg }: { msg?: string }) {
  return msg ? (
    <p className="text-xs text-destructive mt-1.5 flex items-center gap-1 font-medium">
      <XIcon className="w-3 h-3" />{msg}
    </p>
  ) : null
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
      {children}{required && <span className="text-destructive ml-0.5 normal-case tracking-normal font-semibold"> *</span>}
    </label>
  )
}

function StyledInput({ icon: Icon, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType; error?: boolean }) {
  return (
    <div className="relative group">
      {Icon && (
        <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${error ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'}`} />
      )}
      <input
        {...props}
        className={`w-full text-sm border rounded-xl bg-background text-foreground placeholder:text-muted-foreground/60 transition-all
          ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          ${error ? 'border-destructive bg-destructive/5 focus:ring-destructive/20' : 'border-border hover:border-primary/40'}
        `}
      />
    </div>
  )
}

function StyledTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className="w-full text-sm border border-border rounded-xl bg-background text-foreground px-4 py-3 resize-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/40 transition-all"
    />
  )
}

// ─── Section card with numbered accent ─────────────────────────────────────────

const ACCENTS = [
  'bg-primary',       // 1
  'bg-purple-500',    // 2
  'bg-rose-500',      // 3
  'bg-amber-500',     // 4
  'bg-emerald-500',   // 5
  'bg-blue-500',      // 6
  'bg-orange-500',    // 7
  'bg-slate-500',     // 8
  'bg-primary',       // 9
]

function SectionCard({ step, icon: Icon, title, subtitle, children }: {
  step: number; icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode
}) {
  const accent = ACCENTS[(step - 1) % ACCENTS.length]
  return (
    <div className="relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-border bg-muted/30">
        {/* Step badge */}
        <div className={`w-9 h-9 rounded-xl ${accent} flex items-center justify-center shrink-0 shadow-sm`}>
          <span className="text-xs font-black text-white">{String(step).padStart(2, '0')}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-bold text-foreground text-sm">{title}</h3>
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

// ─── Divider inside a card ─────────────────────────────────────────────────────

function InnerDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ─── Pill selector ─────────────────────────────────────────────────────────────

function PillSelect<T extends string>({ value, onChange, options, size = 'md' }: {
  value: T; onChange: (v: T) => void
  options: { value: T; label: string }[]
  size?: 'sm' | 'md' | 'sq'
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => {
        const active = value === o.value
        const base = size === 'sq'
          ? 'w-12 h-12 rounded-xl text-sm font-black'
          : size === 'sm'
          ? 'px-3 py-1.5 rounded-full text-xs font-semibold'
          : 'px-4 py-2 rounded-xl text-sm font-semibold'
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`border-2 transition-all flex items-center justify-center ${base} ${
              active
                ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.06]'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5'
            }`}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Photo upload ──────────────────────────────────────────────────────────────

function PhotoUpload({ label, circular = false }: { label: string; circular?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const load = (f: File) => {
    const r = new FileReader()
    r.onload = () => setPreview(r.result as string)
    r.readAsDataURL(f)
  }

  if (circular) return (
    <div className="flex flex-col items-center gap-2.5">
      <Label>{label}</Label>
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-dashed border-border hover:border-primary/60 group transition-colors cursor-pointer shadow-inner">
        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10"
          onChange={e => { const f = e.target.files?.[0]; if (f) load(f) }} />
        {preview
          ? <img src={preview} alt="" className="w-full h-full object-cover" />
          : <div className="h-full flex flex-col items-center justify-center gap-1.5">
              <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[9px] font-semibold text-muted-foreground">Photo</span>
            </div>}
      </div>
      {preview && <button type="button" onClick={() => setPreview(null)} className="text-[10px] text-destructive hover:underline font-medium">Remove</button>}
    </div>
  )

  return (
    <div>
      <Label>{label}</Label>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) load(f) }}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          dragging ? 'border-primary bg-primary/5 scale-[1.02]'
          : preview ? 'border-primary/40 bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-muted/60'
        }`}>
        <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={e => { const f = e.target.files?.[0]; if (f) load(f) }} />
        {preview ? (
          <div className="flex items-center gap-3">
            {preview.startsWith('data:image') && <img src={preview} alt="" className="w-9 h-9 rounded-lg object-cover border border-border shrink-0" />}
            <p className="text-xs font-semibold text-primary text-left flex-1 truncate">File selected</p>
            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
          </div>
        ) : (
          <>
            <UploadCloud className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Drag & drop or <span className="text-primary font-semibold">click to browse</span></p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">PNG, JPG, PDF • Max 2MB</p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Class/Section picker from DB ──────────────────────────────────────────────

function ClassSectionPicker({
  classes, sections, selectedClass, selectedSection, loading,
  onClassChange, onSectionChange, classError, sectionError,
}: {
  classes: string[]; sections: string[]
  selectedClass: string; selectedSection: string; loading: boolean
  onClassChange: (c: string) => void; onSectionChange: (s: string) => void
  classError?: string; sectionError?: string
}) {
  return (
    <div className="rounded-xl border-2 border-border bg-muted/30 p-4 space-y-4">
      {/* Class */}
      <div>
        <Label required>Select Class</Label>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />Loading classes from database…
          </div>
        ) : classes.length === 0 ? (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            No classes found. Add classes from <Link href="/classes/list" className="underline font-bold">Classes → Classes</Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {classes.map(cls => (
              <button key={cls} type="button" onClick={() => onClassChange(cls)}
                className={`min-w-14 px-3 py-2 rounded-xl border-2 text-[12px] transition-all ${
                  selectedClass === cls
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110'
                    : 'bg-card border-border text-foreground hover:border-primary/60 hover:bg-primary/5 hover:scale-105'
                }`}>
                {cls}
              </button>
            ))}
          </div>
        )}
        {classError && <Err msg={classError} />}
      </div>

      {/* Section */}
      {selectedClass && (
        <div className="border-t border-border pt-4">
          <Label required>Select Section — <span className="text-primary font-bold normal-case">Class {selectedClass}</span></Label>
          {sections.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No sections available for Class {selectedClass}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sections.map(sec => (
                <button key={sec} type="button" onClick={() => onSectionChange(sec)}
                  className={`w-14 h-14 rounded-xl border-2 text-base font-black transition-all ${
                    selectedSection === sec
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110'
                      : 'bg-card border-border text-foreground hover:border-primary/60 hover:bg-primary/5 hover:scale-105'
                  }`}>
                  {sec}
                </button>
              ))}
            </div>
          )}
          {sectionError && <Err msg={sectionError} />}
        </div>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AddStudentPage() {
  const router = useRouter()
  const { createStudent, creating } = useStudents()
  const { categories } = useStudentCategories()
  const { sections: dbSections, loading: sectionsLoading } = useClassSections()

  const classOptions = [...new Set(dbSections.map(s => s.className))]
    .filter(Boolean)
    .sort((a, b) => { const na = Number(a), nb = Number(b); return !isNaN(na) && !isNaN(nb) ? na - nb : a.localeCompare(b) })

  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, control, watch, setValue, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { guardianType: 'father', gender: 'male' },
  })

  const selectedClass   = watch('class')
  const selectedSection = watch('section')
  const selectedGender  = watch('gender')
  const guardianType    = watch('guardianType')

  const sectionOptions = dbSections
    .filter(s => s.className === selectedClass)
    .map(s => s.sectionName).filter(Boolean).sort()

  const onSubmit = async (v: FormValues) => {
    setServerError(null)
    try {
      await createStudent({
        name: v.name, email: v.email, password: v.password, phone: v.phone,
        rollNumber: v.rollNumber ?? '', class: v.class, section: v.section,
        fatherName: v.fatherName, motherName: v.motherName, dob: v.dob,
        enrollmentDate: new Date().toISOString().split('T')[0],
        academicYear: v.academicYear, address: v.currentAddress,
      })
      setDone(true)
      setTimeout(() => router.push('/students'), 1800)
    } catch (err) {
      handleFormError(err, (f, e) => setError(f as any, e), setServerError)
    }
  }

  return (
    <DashboardLayout title="Add New Student">
      <div className="max-w-5xl">

        {/* ── Hero banner ── */}
        <div className="relative rounded-2xl bg-primary overflow-hidden mb-6 shadow-xl shadow-primary/20">
          {/* Pattern overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)`,
          }} />
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10"
            style={{ background: 'linear-gradient(135deg, transparent 0%, white 100%)' }} />

          <div className="relative px-6 py-7">
            {/* Back + breadcrumb */}
            <div className="flex items-center gap-3 mb-4">
              <button type="button" onClick={() => router.back()}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <nav className="flex items-center gap-1.5 text-primary-foreground/60 text-xs">
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/students" className="hover:text-white transition-colors">Students</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white font-semibold">Add New Student</span>
              </nav>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Add New Student</h1>
                <p className="text-primary-foreground/70 text-sm mt-1">Fill in all required fields · 9 sections to complete</p>
              </div>
              {/* Icon badge */}
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0 border border-white/20">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {done && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-green-800 dark:text-green-300 mb-5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold">Student created successfully!</p>
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
          <SectionCard step={1} icon={GraduationCap} title="Personal Info" subtitle="Academic placement and personal details">

            {/* Academic Year pills */}
            <div className="mb-6">
              <Label required>Academic Year</Label>
              <Controller name="academicYear" control={control}
                render={({ field }) => (
                  <PillSelect value={field.value ?? ''} onChange={field.onChange}
                    options={YEARS.map(y => ({ value: y, label: y }))} />
                )} />
              <Err msg={errors.academicYear?.message} />
            </div>

            {/* Class + Section from DB */}
            <div className="mb-6">
              <ClassSectionPicker
                classes={classOptions}
                sections={sectionOptions}
                selectedClass={selectedClass}
                selectedSection={selectedSection}
                loading={sectionsLoading}
                onClassChange={c => { setValue('class', c); setValue('section', '') }}
                onSectionChange={s => setValue('section', s)}
                classError={errors.class?.message}
                sectionError={errors.section?.message}
              />
            </div>

            {/* Personal fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <Label required>Admission No</Label>
                <StyledInput icon={IdCard} {...register('admissionNo')} placeholder="Enter admission number" error={!!errors.admissionNo} />
                <Err msg={errors.admissionNo?.message} />
              </div>
              <div>
                <Label>Roll Number</Label>
                <StyledInput icon={Hash} {...register('rollNumber')} placeholder="Enter roll number" />
              </div>
              <div>
                <Label required>Full Name</Label>
                <StyledInput icon={User} {...register('name')} placeholder="Enter full name" error={!!errors.name} />
                <Err msg={errors.name?.message} />
              </div>
              <div>
                <Label>Category</Label>
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
                <Label>Gender</Label>
                <PillSelect
                  value={selectedGender ?? 'male'}
                  onChange={v => setValue('gender', v)}
                  options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
                  size="sm"
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <div className="mt-1">
                  <Controller name="dob" control={control}
                    render={({ field }) => (
                      <DatePicker value={field.value ?? ''} onChange={field.onChange} placeholder="Pick date of birth" />
                    )} />
                </div>
              </div>
              <div>
                <Label>Phone Number</Label>
                <StyledInput icon={Phone} {...register('phone')} placeholder="Enter phone number" />
              </div>
              <div>
                <Label required>Email</Label>
                <StyledInput icon={Mail} {...register('email')} type="email" placeholder="Enter email" error={!!errors.email} />
                <Err msg={errors.email?.message} />
              </div>
              <div className="flex items-start justify-center pt-4">
                <PhotoUpload label="Student Photo" circular />
              </div>
            </div>
          </SectionCard>

          {/* ═══ 02 Parent & Guardian ═══ */}
          <SectionCard step={2} icon={Users} title="Parent & Guardian Info" subtitle="Family contact and guardian details">
            <InnerDivider label="Father's Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
              <div><Label>Father's Name</Label><StyledInput icon={User} {...register('fatherName')} placeholder="Father's name" /></div>
              <div><Label>Phone</Label><StyledInput icon={Phone} {...register('fatherPhone')} placeholder="Phone number" /></div>
              <div><Label>Occupation</Label><StyledInput icon={BookOpen} {...register('fatherOccupation')} placeholder="Occupation" /></div>
              <PhotoUpload label="Father's Photo" />
            </div>

            <InnerDivider label="Mother's Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
              <div><Label>Mother's Name</Label><StyledInput icon={User} {...register('motherName')} placeholder="Mother's name" /></div>
              <div><Label>Phone</Label><StyledInput icon={Phone} {...register('motherPhone')} placeholder="Phone number" /></div>
              <div><Label>Occupation</Label><StyledInput icon={BookOpen} {...register('motherOccupation')} placeholder="Occupation" /></div>
              <PhotoUpload label="Mother's Photo" />
            </div>

            <InnerDivider label="Guardian" />
            <div className="mb-4">
              <Label>Guardian Type</Label>
              <Controller name="guardianType" control={control}
                render={({ field }) => (
                  <PillSelect value={field.value} onChange={field.onChange} size="sm"
                    options={[{ value: 'father', label: 'Father' }, { value: 'mother', label: 'Mother' }, { value: 'other', label: 'Others' }]} />
                )} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><Label>Guardian Name</Label><StyledInput icon={User} {...register('guardianName')} placeholder="Guardian name" /></div>
              <div><Label>Guardian Email</Label><StyledInput icon={Mail} {...register('guardianEmail')} type="email" placeholder="Email address" /></div>
              <div><Label>Phone</Label><StyledInput icon={Phone} {...register('guardianPhone')} placeholder="Phone number" /></div>
              <div><Label>Occupation</Label><StyledInput icon={BookOpen} {...register('guardianOccupation')} placeholder="Occupation" /></div>
              <div><Label>Address</Label><StyledInput icon={MapPin} {...register('guardianAddress')} placeholder="Address" /></div>
              <PhotoUpload label="Guardian Photo" />
            </div>
          </SectionCard>

          {/* ═══ 03 Medical ═══ */}
          <SectionCard step={3} icon={Heart} title="Medical Details" subtitle="Health and physical information">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Blood Group</Label>
                <Controller name="bloodGroup" control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-xl h-11 border-border"><SelectValue placeholder="Select blood group" /></SelectTrigger>
                      <SelectContent>{BLOOD_GROUPS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
              </div>
              <div><Label>Height (cm)</Label><StyledInput {...register('height')} type="number" placeholder="e.g. 165" /></div>
              <div><Label>Weight (kg)</Label><StyledInput {...register('weight')} type="number" placeholder="e.g. 55" /></div>
            </div>
          </SectionCard>

          {/* ═══ 04 Bank Details ═══ */}
          <SectionCard step={4} icon={CreditCard} title="Bank Details" subtitle="Banking and identification information">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><Label>Account Number</Label><StyledInput icon={Hash} {...register('bankAccountNumber')} placeholder="Account number" /></div>
              <div><Label>Bank Name</Label><StyledInput icon={Building2} {...register('bankName')} placeholder="Bank name" /></div>
              <div><Label>IFSC Code</Label><StyledInput icon={Hash} {...register('ifscCode')} placeholder="IFSC Code" /></div>
              <div><Label>National ID</Label><StyledInput icon={IdCard} {...register('nationalId')} placeholder="National ID" /></div>
            </div>
          </SectionCard>

          {/* ═══ 05 Previous School ═══ */}
          <SectionCard step={5} icon={School} title="Previous School Details" subtitle="Prior educational institution">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>School Name</Label><StyledInput icon={School} {...register('previousSchoolName')} placeholder="Enter school name" /></div>
              <div><Label>Address</Label><StyledInput icon={MapPin} {...register('previousSchoolAddress')} placeholder="School address" /></div>
            </div>
          </SectionCard>

          {/* ═══ 06 Address ═══ */}
          <SectionCard step={6} icon={MapPin} title="Address" subtitle="Residential addresses">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Current Address</Label><StyledTextarea {...register('currentAddress')} placeholder="Enter current address" /></div>
              <div><Label>Permanent Address</Label><StyledTextarea {...register('permanentAddress')} placeholder="Enter permanent address" /></div>
            </div>
          </SectionCard>

          {/* ═══ 07 Hostel ═══ */}
          <SectionCard step={7} icon={Home} title="Hostel Details" subtitle="On-campus accommodation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Hostel Name</Label><StyledInput icon={Home} {...register('hostel')} placeholder="Enter hostel name" /></div>
              <div><Label>Room No</Label><StyledInput icon={Hash} {...register('roomNo')} placeholder="Enter room number" /></div>
            </div>
          </SectionCard>

          {/* ═══ 08 Documents ═══ */}
          <SectionCard step={8} icon={FileText} title="Documents & Notes" subtitle="Upload documents and additional info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PhotoUpload label="Upload Document" />
              <div><Label>Additional Details</Label><StyledTextarea {...register('details')} rows={4} placeholder="Any additional information about the student…" /></div>
            </div>
          </SectionCard>

          {/* ═══ 09 Login Details ═══ */}
          <SectionCard step={9} icon={Lock} title="Login Details" subtitle="Student portal login credentials">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Email</Label>
                <StyledInput icon={Mail} {...register('email')} type="email" placeholder="Enter email address" error={!!errors.email} />
                <Err msg={errors.email?.message} />
              </div>
              <div>
                <Label required>Password</Label>
                <StyledInput icon={Lock} {...register('password')} type="password" placeholder="Minimum 6 characters" error={!!errors.password} />
                <Err msg={errors.password?.message} />
              </div>
            </div>
          </SectionCard>
        </form>

        {/* ── Sticky submit bar ── */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-50">
          <div className="bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 shadow-2xl">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                Required fields must be filled before submitting
              </div>
              <div className="flex gap-3 ml-auto">
                <Button type="button" variant="outline" onClick={() => router.push('/students')} className="h-10 px-6 rounded-xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form=""
                  onClick={handleSubmit(onSubmit)}
                  disabled={creating || done}
                  className="h-10 px-8 bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 font-bold gap-2"
                >
                  {creating ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                   : done    ? <><CheckCircle className="w-4 h-4" />Submitted!</>
                   :           <><Save className="w-4 h-4" />Submit Student</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
