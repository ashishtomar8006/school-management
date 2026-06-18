'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useSections } from '@/hooks/use-sections'
import { SectionItem } from '@/lib/api/endpoints/sections'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Loader2, Tag, Edit, Trash2, Search } from 'lucide-react'
import { handleFormError } from '@/lib/form-errors'
import Swal from 'sweetalert2'

const schema = z.object({
  name:   z.string().min(1, 'Section name is required').max(10, 'Max 10 characters'),
  status: z.enum(['active', 'inactive']),
})
type FormValues = z.infer<typeof schema>

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

function SectionDialog({ open, onClose, onSave, loading, initial, title }: {
  open: boolean; onClose: () => void
  onSave: (d: FormValues) => Promise<void>
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
            <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
              <Tag className="w-4 h-4 text-primary" />
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
            <label className="text-xs font-semibold text-muted-foreground">
              Section Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name')}
              placeholder="e.g. A, B, C or Science, Arts"
              className={`mt-1.5 ${errors.name ? 'border-red-400' : ''}`}
              autoFocus
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            <p className="text-xs text-slate-400 mt-1.5">Typically a single letter like A, B, C or a stream name</p>
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

export default function SectionsPage() {
  const { sections, loading, createSection, updateSection, deleteSection, creating, updating } = useSections()
  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState<SectionItem | null>(null)
  const [search, setSearch]         = useState('')

  const filtered = sections.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  const handleAdd  = async (d: FormValues) => { await createSection({ name: d.name, status: d.status }) }
  const handleEdit = async (d: FormValues) => { await updateSection({ id: editTarget!.id, data: d }); setEditTarget(null) }

  const handleDelete = async (section: SectionItem) => {
    const result = await Swal.fire({
      title: 'Delete Section?',
      html: `<p style="font-size:14px;color:#64748b">Section <strong style="color:#1e293b">"${section.name}"</strong> will be permanently deleted.</p>`,
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

  return (
    <DashboardLayout title="Sections">
      <div className="space-y-4 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Sections</h2>
            <p className="text-sm text-slate-500">{sections.length} section{sections.length !== 1 ? 's' : ''} defined</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
            <Plus className="w-4 h-4" />Add Section
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search sections…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
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
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-12">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Section Name</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-sm font-bold text-white">{s.name}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Section {s.name}</p>
                              <p className="text-xs text-slate-400">Available for class assignment</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            s.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {s.status === 'active' ? 'Active' : 'Inactive'}
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
                      <tr><td colSpan={4} className="text-center py-14 text-slate-400">
                        <Tag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="font-medium">No sections yet</p>
                        <p className="text-xs mt-1">Click "Add Section" to create section identifiers like A, B, C</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      <SectionDialog open={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} loading={creating}
        initial={{ name: '', status: 'active' }} title="Add New Section" />

      {editTarget && (
        <SectionDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} loading={updating}
          initial={{ name: editTarget.name, status: editTarget.status }} title="Edit Section" />
      )}
    </DashboardLayout>
  )
}
