'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useClassRooms } from '@/hooks/use-classes'
import { ClassRoom } from '@/lib/api/endpoints/classes'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Loader2, Building2, Edit, Trash2, Search } from 'lucide-react'
import { handleFormError } from '@/lib/form-errors'
import Swal from 'sweetalert2'

const schema = z.object({
  roomNumber: z.string().min(1, 'Room name is required'),
  capacity:   z.string().min(1, 'Capacity is required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be positive'),
  status:     z.enum(['active', 'inactive']),
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

const statusFromMaintenance = (m: ClassRoom['maintenanceStatus']): 'active' | 'inactive' =>
  m === 'needs_repair' ? 'inactive' : 'active'

function RoomDialog({ open, onClose, onSave, loading, initial, title }: {
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
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-orange-600" />
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
            <label className="text-xs font-semibold text-muted-foreground">Room Name <span className="text-red-500">*</span></label>
            <Input {...register('roomNumber')} placeholder="Enter class room name"
              className={`mt-1.5 ${errors.roomNumber ? 'border-red-400' : ''}`} />
            <Err msg={errors.roomNumber?.message} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Capacity <span className="text-red-500">*</span></label>
            <Input {...register('capacity')} type="number" min={1} placeholder="Enter room capacity"
              className={`mt-1.5 ${errors.capacity ? 'border-red-400' : ''}`} />
            <Err msg={errors.capacity?.message} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Status</label>
            <div className="mt-1.5"><StatusToggle value={status} onChange={v => setValue('status', v)} /></div>
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

export default function RoomsPage() {
  const { rooms, loading, createRoom, updateRoom, creating, updating } = useClassRooms()

  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState<ClassRoom | null>(null)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const filtered = rooms.filter(r => {
    const matchSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase())
    const status      = statusFromMaintenance(r.maintenanceStatus)
    const matchStatus = filterStatus === 'all' || status === filterStatus
    return matchSearch && matchStatus
  })

  const handleAdd = async (data: FormValues) => {
    await createRoom({
      roomNumber: data.roomNumber,
      capacity:   Number(data.capacity),
      floor: 0, facilities: [],
      maintenanceStatus: data.status === 'active' ? 'good' : 'needs_repair',
    })
  }

  const handleEdit = async (data: FormValues) => {
    if (!editTarget) return
    await updateRoom({
      id:   editTarget.id,
      data: {
        roomNumber:        data.roomNumber,
        capacity:          Number(data.capacity),
        maintenanceStatus: data.status === 'active' ? 'good' : 'needs_repair',
      },
    })
    setEditTarget(null)
  }

  const handleDelete = async (room: ClassRoom) => {
    const result = await Swal.fire({
      title: 'Delete Classroom?',
      html: `<p style="font-size:14px;color:#64748b">Room <strong style="color:#1e293b">${room.roomNumber}</strong> will be permanently deleted.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
    })
    if (result.isConfirmed) await updateRoom({ id: room.id, data: { maintenanceStatus: 'needs_repair' } })
  }

  return (
    <DashboardLayout title="Classrooms">
      <div className="space-y-4 md:space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Classrooms</h2>
            <p className="text-sm text-slate-500">{rooms.length} rooms registered</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
            <Plus className="w-4 h-4" />Add New Class Room
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search rooms…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <Button key={s} size="sm"
                variant={filterStatus === s ? 'default' : 'outline'}
                onClick={() => setFilterStatus(s)}
                className={filterStatus === s ? 'bg-primary hover:bg-primary/90 capitalize' : 'capitalize'}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No classrooms found</p>
            <p className="text-sm mt-1">Click "Add New Class Room" to register one</p>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Room Name</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Capacity</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Assigned Class</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)).map(r => {
                      const status = statusFromMaintenance(r.maintenanceStatus)
                      return (
                        <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <p className="font-semibold text-foreground">{r.roomNumber}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{r.capacity}</span>
                            <span className="text-xs text-slate-400 ml-1">seats</span>
                          </td>
                          <td className="py-3 px-4">
                            {r.assignedClass ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-lg">
                                <Building2 className="w-3 h-3" />{r.assignedClass}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              status === 'active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button size="sm" variant="outline"
                                className="h-8 px-2.5 text-xs gap-1 text-primary border-teal-200 hover:bg-teal-600 hover:text-white hover:border-teal-600"
                                onClick={() => setEditTarget(r)}>
                                <Edit className="w-3.5 h-3.5" />Edit
                              </Button>
                              <Button size="sm" variant="outline"
                                className="h-8 px-2.5 text-xs gap-1 text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600"
                                onClick={() => handleDelete(r)}>
                                <Trash2 className="w-3.5 h-3.5" />Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <RoomDialog open={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} loading={creating}
        initial={{ roomNumber: '', capacity: '40', status: 'active' }} title="Add New Class Room" />

      {editTarget && (
        <RoomDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} loading={updating}
          initial={{ roomNumber: editTarget.roomNumber, capacity: String(editTarget.capacity), status: statusFromMaintenance(editTarget.maintenanceStatus) }}
          title="Edit Class Room" />
      )}
    </DashboardLayout>
  )
}
