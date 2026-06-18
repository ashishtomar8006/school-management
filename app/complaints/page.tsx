'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useComplaints } from '@/hooks/use-complaints'
import { ComplaintStatus, ComplaintPriority, ComplaintCategory, CreateComplaintPayload } from '@/lib/api/endpoints/complaints'
import { AlertCircle, Plus, Loader2 } from 'lucide-react'

const STATUS_COLOR: Record<ComplaintStatus, string> = {
  'open':        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'resolved':    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'closed':      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const PRIORITY_COLOR: Record<ComplaintPriority, string> = {
  high:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export default function ComplaintsPage() {
  const { user } = useAuth()
  const { complaints, loading, params, setParams, createComplaint, updateComplaint, creating } = useComplaints()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateComplaintPayload>({
    title: '', description: '', category: 'other', priority: 'medium',
  })

  const canManage = user?.role === 'principal' || user?.role === 'teacher'

  const handleCreate = async () => {
    if (!form.title || !form.description) return
    await createComplaint(form)
    setForm({ title: '', description: '', category: 'other', priority: 'medium' })
    setShowForm(false)
  }

  return (
    <DashboardLayout title="Complaints">
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Complaints</h2>
            <p className="text-sm text-slate-500">{complaints.length} total</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Complaint</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle className="text-base">File a Complaint</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <textarea
                placeholder="Description *"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as ComplaintCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['academic','discipline','bullying','facilities','other'] as const).map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v as ComplaintPriority }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['low','medium','high'] as const).map(p => (
                      <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={creating} className="bg-primary hover:bg-primary/90">
                  {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 flex-wrap">
          {(['all','open','in-progress','resolved','closed'] as const).map(s => (
            <Button
              key={s}
              size="sm"
              variant={(params.status ?? 'all') === s ? 'default' : 'outline'}
              onClick={() => setParams(p => ({ ...p, status: s === 'all' ? undefined : s }))}
              className={(params.status ?? 'all') === s ? 'bg-primary hover:bg-primary/90' : ''}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No complaints found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map(c => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status]}`}>{c.status}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[c.priority]}`}>{c.priority}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">{c.category}</span>
                      </div>
                      <p className="font-semibold text-foreground">{c.title}</p>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        By {c.createdBy?.name ?? '—'} · {new Date(c.createdAt).toLocaleDateString()}
                        {c.assignedTo && ` · Assigned to ${c.assignedTo.name}`}
                      </p>
                    </div>
                    {canManage && c.status !== 'closed' && (
                      <Select value={c.status} onValueChange={v => updateComplaint({ id: c.id, data: { status: v as ComplaintStatus } })}>
                        <SelectTrigger className="w-32 h-8 text-xs shrink-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(['open','in-progress','resolved','closed'] as const).map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {c.resolution && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-300">
                      <span className="font-semibold">Resolution: </span>{c.resolution}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
