'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAdminPrincipals } from '@/hooks/use-admin'
import { PrincipalRecord, CreatePrincipalPayload } from '@/lib/api/endpoints/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Swal from 'sweetalert2'
import {
  Plus, Search, Loader2, Edit, Trash2, Shield,
  GraduationCap, Mail, Phone, MapPin, School,
  Users, CheckCircle, XCircle, ToggleLeft, ToggleRight, X,
  Eye, EyeOff, Lock,
} from 'lucide-react'

// ─── Schema ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  email:       z.string().email('Invalid email'),
  password:    z.string().min(6, 'Min 6 characters'),
  phone:       z.string().optional(),
  address:     z.string().optional(),
  schoolName:  z.string().optional(),
})

const editSchema = createSchema.extend({
  password: z.string().min(6).optional().or(z.literal('')),
})

type CreateForm = z.infer<typeof createSchema>
type EditForm   = z.infer<typeof editSchema>

// ─── Principal form dialog ────────────────────────────────────────────────────

function PrincipalDialog({ open, onClose, onSave, loading, initial, title }: {
  open: boolean; onClose: () => void
  onSave: (d: CreateForm | EditForm) => Promise<void>
  loading: boolean
  initial?: Partial<CreateForm>
  title: string
}) {
  const isEdit = !!initial?.email
  const schema = isEdit ? editSchema : createSchema

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(schema) as any,
    defaultValues: initial ?? { name: '', email: '', password: '', phone: '', address: '', schoolName: '' },
  })

  const [showPw, setShowPw] = useState(false)

  const onSubmit = async (v: CreateForm) => {
    await onSave(v)
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] p-0" showCloseButton={false}>
        {/* Header */}
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white font-bold text-base m-0 p-0">{title}</DialogTitle>
              <p className="text-white/60 text-[11px]">Principal account details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* School Name */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <School className="w-3.5 h-3.5 text-primary" />School Name
            </label>
            <Input {...register('schoolName')} placeholder="e.g. St. Mary's High School" className="rounded-xl" />
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />Principal Name <span className="text-red-500 normal-case">*</span>
            </label>
            <Input {...register('name')} placeholder="Dr. Ramesh Verma" className="rounded-xl" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />Email <span className="text-red-500 normal-case">*</span>
            </label>
            <Input {...register('email')} type="email" placeholder="principal@school.com" className="rounded-xl" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" />Password {isEdit ? '(leave blank to keep)' : <span className="text-red-500 normal-case">*</span>}
            </label>
            <div className="relative">
              <Input {...register('password')} type={showPw ? 'text' : 'password'}
                placeholder={isEdit ? 'Leave blank to keep current' : 'Min 6 characters'}
                className="rounded-xl pr-10" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />Phone
            </label>
            <Input {...register('phone')} placeholder="+91 98765 43210" className="rounded-xl" />
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />Address
            </label>
            <Input {...register('address')} placeholder="School / office address" className="rounded-xl" />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-10">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : isEdit ? 'Save Changes' : 'Create Principal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Principal card ───────────────────────────────────────────────────────────

function PrincipalCard({ p, onEdit, onToggle, onDelete, toggling, deleting }: {
  p: PrincipalRecord
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
  toggling: boolean
  deleting: boolean
}) {
  return (
    <div className={`rounded-2xl border-2 bg-card overflow-hidden transition-all hover:shadow-md ${
      p.isActive ? 'border-border hover:border-primary/40' : 'border-border/50 opacity-70'
    }`}>
      <div className={`h-1 w-full ${p.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-black text-lg">
              {p.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-foreground leading-tight">{p.name}</p>
              {p.schoolName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <School className="w-3 h-3" />{p.schoolName}
                </p>
              )}
            </div>
          </div>
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            p.isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {p.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1.5 mb-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 shrink-0" />{p.email}
          </p>
          {p.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 shrink-0" />{p.phone}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-black text-primary leading-none">{p.studentCount}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Students</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/30">
            <GraduationCap className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
            <div>
              <p className="text-sm font-black text-violet-600 dark:text-violet-400 leading-none">{p.teacherCount}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Teachers</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border/60">
          <Button size="sm" variant="outline" onClick={onEdit}
            className="flex-1 h-8 text-xs gap-1.5 hover:bg-primary hover:text-white hover:border-primary">
            <Edit className="w-3.5 h-3.5" />Edit
          </Button>
          <Button size="sm" variant="outline" disabled={toggling} onClick={onToggle}
            className={`flex-1 h-8 text-xs gap-1.5 ${
              p.isActive
                ? 'hover:bg-amber-600 hover:text-white hover:border-amber-600 text-amber-600 border-amber-200'
                : 'hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-600 border-emerald-200'
            }`}>
            {toggling
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : p.isActive ? <><ToggleLeft className="w-3.5 h-3.5" />Deactivate</> : <><ToggleRight className="w-3.5 h-3.5" />Activate</>}
          </Button>
          <Button size="sm" variant="outline" disabled={deleting} onClick={onDelete}
            className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 shrink-0">
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPrincipalsPage() {
  const [search, setSearch]         = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<PrincipalRecord | null>(null)

  const {
    principals, loading,
    createPrincipal, updatePrincipal, togglePrincipal, deletePrincipal,
    creating, updating, toggling, deleting,
  } = useAdminPrincipals({ search: search || undefined })

  const filtered = principals.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.schoolName ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (d: any) => {
    await createPrincipal(d)
    setShowCreate(false)
  }

  const handleEdit = async (d: any) => {
    if (!editTarget) return
    const payload: any = { ...d }
    if (!payload.password) delete payload.password   // don't send blank password
    await updatePrincipal({ id: editTarget.id, data: payload })
    setEditTarget(null)
  }

  const handleDelete = async (p: PrincipalRecord) => {
    const result = await Swal.fire({
      title: 'Delete Principal?',
      html: `<p style="font-size:14px;color:#64748b">Remove <strong style="color:#1e293b">${p.name}</strong> (${p.schoolName || p.email})? This is permanent.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    })
    if (result.isConfirmed) await deletePrincipal(p.id)
  }

  const active   = principals.filter(p => p.isActive).length
  const inactive = principals.filter(p => !p.isActive).length

  return (
    <DashboardLayout title="Manage Principals">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Principals</h2>
            <p className="text-sm text-muted-foreground">{principals.length} registered school{principals.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => setShowCreate(true)}
            className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 sm:h-10 sm:px-4 text-sm shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Principal</span>
          </Button>
        </div>

        {/* Stats */}
        {principals.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total',    value: principals.length, color: 'bg-primary/10 text-primary',                                                                      icon: GraduationCap },
              { label: 'Active',   value: active,            color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',                    icon: CheckCircle   },
              { label: 'Inactive', value: inactive,          color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',                               icon: XCircle       },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="rounded-2xl border bg-card p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground leading-none">{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email or school…" value={search}
            onChange={e => setSearch(e.target.value)} className="pl-8 rounded-xl" />
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary/50" />
            </div>
            <p className="font-semibold text-foreground">No principals found</p>
            <p className="text-sm mt-1">
              <button onClick={() => setShowCreate(true)} className="cursor-pointer text-primary hover:underline">
                Add the first principal →
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => (
              <PrincipalCard key={p.id} p={p}
                onEdit={() => setEditTarget(p)}
                onToggle={() => togglePrincipal(p.id)}
                onDelete={() => handleDelete(p)}
                toggling={toggling}
                deleting={deleting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <PrincipalDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
        loading={creating}
        title="Add New Principal"
      />
      {editTarget && (
        <PrincipalDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
          loading={updating}
          initial={{
            name:       editTarget.name,
            email:      editTarget.email,
            password:   '',
            phone:      editTarget.phone       ?? '',
            address:    editTarget.address     ?? '',
            schoolName: editTarget.schoolName  ?? '',
          }}
          title={`Edit — ${editTarget.name}`}
        />
      )}
    </DashboardLayout>
  )
}
