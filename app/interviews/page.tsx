'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInterviews } from '@/hooks/use-interviews'
import { InterviewStatus, CreateInterviewPayload, UpdateInterviewPayload } from '@/lib/api/endpoints/interviews'
import { Briefcase, Plus, Loader2, Star } from 'lucide-react'

const STATUS_COLOR: Record<InterviewStatus, string> = {
  applied:              'bg-slate-100 text-slate-600 dark:bg-slate-800',
  shortlisted:          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  interview_scheduled:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  offered:              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  selected:             'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected:             'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const STATUSES: InterviewStatus[] = ['applied','shortlisted','interview_scheduled','offered','selected','rejected']

export default function InterviewsPage() {
  const { interviews, loading, createInterview, updateInterview, deleteInterview, creating } = useInterviews()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateInterviewPayload>({ name: '', email: '', position: '' })

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.position) return
    await createInterview(form)
    setForm({ name: '', email: '', position: '' })
    setShowForm(false)
  }

  return (
    <DashboardLayout title="Interviews">
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Interview Candidates</h2>
            <p className="text-sm text-slate-500">{interviews?.length ?? 0} candidates</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Candidate</span><span className="sm:hidden">Add</span>
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle className="text-base">Add Candidate</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Full Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Email *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Position *" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} />
                <Input placeholder="Department" value={form.department ?? ''} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Phone" value={form.phone ?? ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                <Input type="number" placeholder="Experience (years)" value={form.experience ?? ''} onChange={e => setForm(p => ({ ...p, experience: Number(e.target.value) }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={creating} className="bg-primary hover:bg-primary/90">
                  {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Add
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (interviews?.length ?? 0) === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" /><p className="font-medium">No candidates yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(interviews ?? []).map(c => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status]}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                        {c.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                            {Array.from({ length: c.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <p className="text-sm text-slate-500">{c.position}{c.department ? ` · ${c.department}` : ''} · {c.experience}y exp</p>
                      <p className="text-xs text-slate-400 mt-1">{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
                      {c.interviewDate && (
                        <p className="text-xs text-primary dark:text-teal-400 mt-1">Interview: {c.interviewDate} {c.interviewTime}</p>
                      )}
                    </div>
                    <Select value={c.status} onValueChange={v => updateInterview({ id: c.id, data: { status: v as InterviewStatus } })}>
                      <SelectTrigger className="w-36 h-8 text-xs shrink-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {c.feedback && (
                    <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs text-muted-foreground">
                      <span className="font-semibold">Feedback: </span>{c.feedback}
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
