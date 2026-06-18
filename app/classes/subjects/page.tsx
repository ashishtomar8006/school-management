'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useSubjects } from '@/hooks/use-classes'
import { Subject } from '@/lib/api/endpoints/classes'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Loader2, BookOpen, Edit, Trash2, Search } from 'lucide-react'
import { handleFormError } from '@/lib/form-errors'
import Swal from 'sweetalert2'

const schema = z.object({
  subjectName: z.string().min(1, 'Subject name is required'),
  subjectCode: z.string().min(1, 'Subject code is required'),
  status: z.enum(['active', 'inactive']),
})
type FormValues = z.infer<typeof schema>

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null
}

function StatusToggle({ value, onChange }: { value: string; onChange: (v: 'active' | 'inactive') => void }) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      {(['active', 'inactive'] as const).map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            value === s
              ? s === 'active' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
              : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}>
          {s === 'active' ? 'Active' : 'Inactive'}
        </button>
      ))}
    </div>
  )
}

function SubjectDialog({ open, onClose, onSave, loading, initial, title }: {
  open: boolean; onClose: () => void
  onSave: (data: FormValues) => Promise<void>
  loading: boolean; initial: FormValues; title: string
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, reset, watch, setValue, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues: initial,
  })

  useEffect(() => { if (open) { reset(initial); setServerError(null) } }, [open, initial, reset])

  const status = watch('status')

  const onSubmit = async (v: FormValues) => {
    setServerError(null)
    try { await onSave(v); onClose() }
    catch (err) { handleFormError(err, (f, e) => setError(f as any, e), setServerError) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {serverError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {serverError}
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Subject Name <span className="text-red-500">*</span></label>
            <Input {...register('subjectName')} placeholder="Enter subject name"
              className={`mt-1.5 ${errors.subjectName ? 'border-red-400' : ''}`} />
            <Err msg={errors.subjectName?.message} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Subject Code <span className="text-red-500">*</span></label>
            <Input {...register('subjectCode')} placeholder="Enter subject code"
              className={`mt-1.5 ${errors.subjectCode ? 'border-red-400' : ''}`} />
            <Err msg={errors.subjectCode?.message} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Status</label>
            <div className="mt-1.5">
              <StatusToggle value={status} onChange={v => setValue('status', v)} />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 min-w-20">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function SubjectsPage() {
  const { subjects, loading, createSubject, updateSubject, deleteSubject, creating, updating } = useSubjects()
  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState<Subject | null>(null)
  const [search, setSearch]         = useState('')

  const filtered = subjects.filter(s =>
    s.subjectName.toLowerCase().includes(search.toLowerCase()) ||
    s.subjectCode.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (data: FormValues) => {
    await createSubject({ subjectName: data.subjectName, subjectCode: data.subjectCode, subjectType: 'theoretical', credits: 1 })
  }

  const handleEdit = async (data: FormValues) => {
    if (!editTarget) return
    await updateSubject({ id: editTarget.id, data: { subjectName: data.subjectName, subjectCode: data.subjectCode } })
    setEditTarget(null)
  }

  const handleDelete = async (subject: Subject) => {
    const result = await Swal.fire({
      title: 'Delete Subject?',
      html: `<p style="font-size:14px;color:#64748b">Subject <strong style="color:#1e293b">${subject.subjectName}</strong> will be permanently deleted.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
    })
    if (result.isConfirmed) await deleteSubject(subject.id)
  }

  return (
    <DashboardLayout title="Subjects">
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Subjects</h2>
            <p className="text-sm text-slate-500">{subjects.length} subjects</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
            <Plus className="w-4 h-4" />Add Subject
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Subject Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Subject Code</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-foreground">{s.subjectName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2 py-1 rounded">{s.subjectCode}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1 text-primary border-teal-200 hover:bg-teal-600 hover:text-white hover:border-teal-600"
                              onClick={() => setEditTarget(s)}>
                              <Edit className="w-3.5 h-3.5" />Edit
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1 text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600"
                              onClick={() => handleDelete(s)}>
                              <Trash2 className="w-3.5 h-3.5" />Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-12 text-slate-400">
                        <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p>No subjects found</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <SubjectDialog open={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} loading={creating}
        initial={{ subjectName: '', subjectCode: '', status: 'active' }} title="Add New Subject" />

      {editTarget && (
        <SubjectDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} loading={updating}
          initial={{ subjectName: editTarget.subjectName, subjectCode: editTarget.subjectCode, status: 'active' }}
          title="Edit Subject" />
      )}
    </DashboardLayout>
  )
}
