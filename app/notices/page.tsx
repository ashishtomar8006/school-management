'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNotices } from '@/hooks/use-notices'
import { DatePicker } from '@/components/ui/date-picker'
import { NoticeCategory, NoticeAudience, CreateNoticePayload, Notice } from '@/lib/api/endpoints/notices'
import {
  Bell, Plus, Loader2, AlertTriangle, X, Megaphone,
  BookOpen, Calendar, Users, Trash2, GraduationCap,
  FileText, Clock,
} from 'lucide-react'

// ─── Category config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<NoticeCategory, {
  label: string
  icon: React.ElementType
  badge: string
  card: string
  stripe: string
  iconBg: string
}> = {
  general:  {
    label:  'General',
    icon:   Bell,
    badge:  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    card:   'border-border',
    stripe: 'bg-slate-400',
    iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  },
  academic: {
    label:  'Academic',
    icon:   BookOpen,
    badge:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    card:   'border-blue-200 dark:border-blue-900',
    stripe: 'bg-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
  },
  event:    {
    label:  'Event',
    icon:   Calendar,
    badge:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    card:   'border-purple-200 dark:border-purple-900',
    stripe: 'bg-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300',
  },
  urgent:   {
    label:  'Urgent',
    icon:   AlertTriangle,
    badge:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    card:   'border-red-300 dark:border-red-800',
    stripe: 'bg-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300',
  },
}

const AUDIENCE_LABELS: Record<NoticeAudience, string> = {
  all:      'Everyone',
  teachers: 'Teachers',
  students: 'Students',
  parents:  'Parents',
  staff:    'Staff',
}

// ─── Notice card ───────────────────────────────────────────────────────────────

function NoticeCard({ notice, canManage, onDelete, deleting }: {
  notice: Notice
  canManage: boolean
  onDelete: () => void
  deleting: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const cfg = CATEGORY_CONFIG[notice.category]
  const Icon = cfg.icon
  const isLong = notice.content.length > 160

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const expired = notice.expiryDate && new Date(notice.expiryDate) < today

  return (
    <div className={`relative rounded-2xl border-2 bg-card overflow-hidden transition-all hover:shadow-md ${cfg.card} ${expired ? 'opacity-60' : ''}`}>
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.stripe}`} />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg.badge}`}>
                {cfg.label}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                <Users className="w-2.5 h-2.5" />{AUDIENCE_LABELS[notice.audience]}
              </span>
              {expired && (
                <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">
                  Expired
                </span>
              )}
            </div>

            {/* Title */}
            <p className="font-bold text-foreground leading-snug">{notice.title}</p>

            {/* Content */}
            <p className={`text-sm text-muted-foreground mt-1.5 leading-relaxed ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
              {notice.content}
            </p>
            {isLong && (
              <button onClick={() => setExpanded(v => !v)}
                className="text-xs text-primary hover:underline mt-1 font-medium">
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {notice.createdBy?.name ?? '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {notice.expiryDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expires {new Date(notice.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>

              {canManage && (
                <Button size="sm" variant="outline" disabled={deleting} onClick={onDelete}
                  className="h-7 px-2.5 text-xs text-red-500 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 shrink-0">
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Create form ───────────────────────────────────────────────────────────────

function CreateForm({ onSave, onCancel, creating }: {
  onSave: (p: CreateNoticePayload) => Promise<void>
  onCancel: () => void
  creating: boolean
}) {
  const [form, setForm] = useState<CreateNoticePayload>({
    title: '', content: '', category: 'general', audience: 'all',
  })

  const set = <K extends keyof CreateNoticePayload>(k: K, v: CreateNoticePayload[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const valid = form.title.trim() && form.content.trim()

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-card overflow-hidden shadow-lg shadow-primary/5">
      {/* Header */}
      <div className="bg-linear-to-r from-primary to-teal-400 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">New Notice</p>
            <p className="text-white/70 text-[10px]">Will be published immediately</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />Title <span className="text-red-500 normal-case font-semibold">*</span>
          </label>
          <Input placeholder="e.g. School closed on Monday"
            value={form.title} onChange={e => set('title', e.target.value)}
            className="rounded-xl" autoFocus />
        </div>

        {/* Category + Audience */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Bell className="w-3.5 h-3.5 text-violet-500" />Category
            </label>
            <Select value={form.category} onValueChange={v => set('category', v as NoticeCategory)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['general', 'academic', 'event', 'urgent'] as const).map(c => {
                  const Ic = CATEGORY_CONFIG[c].icon
                  return (
                    <SelectItem key={c} value={c}>
                      <div className="flex items-center gap-2">
                        <Ic className="w-3.5 h-3.5" />
                        {CATEGORY_CONFIG[c].label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Users className="w-3.5 h-3.5 text-teal-500" />Audience
            </label>
            <Select value={form.audience} onValueChange={v => set('audience', v as NoticeAudience)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['all', 'teachers', 'students', 'parents', 'staff'] as const).map(a => (
                  <SelectItem key={a} value={a}>{AUDIENCE_LABELS[a]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />Content <span className="text-red-500 normal-case font-semibold">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Write the notice content here…"
            value={form.content}
            onChange={e => set('content', e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>

        {/* Expiry */}
        <div className="w-1/2 pr-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" />Expiry Date
          </label>
          <DatePicker value={form.expiryDate ?? ''} onChange={v => set('expiryDate', v || undefined)} placeholder="Pick expiry date" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onCancel} disabled={creating}
            className="flex-1 rounded-xl h-10">
            Cancel
          </Button>
          <Button type="button" disabled={creating || !valid} onClick={() => onSave(form)}
            className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold">
            {creating
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Publishing…</>
              : <><Megaphone className="w-4 h-4 mr-2" />Publish</>}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Category filter pill ──────────────────────────────────────────────────────

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
        active
          ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
          : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary'
      }`}>
      {label}
    </button>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function NoticesPage() {
  const { user } = useAuth()
  const { notices, loading, createNotice, deleteNotice, creating, deleting } = useNotices()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]     = useState<NoticeCategory | 'all'>('all')

  const canManage = user?.role === 'principal' || user?.role === 'teacher'

  const list = (notices ?? []).filter(n => filter === 'all' || n.category === filter)

  const counts: Record<string, number> = { all: (notices ?? []).length }
  ;(['general', 'academic', 'event', 'urgent'] as const).forEach(c => {
    counts[c] = (notices ?? []).filter(n => n.category === c).length
  })

  const handleCreate = async (payload: CreateNoticePayload) => {
    await createNotice(payload)
    setShowForm(false)
  }

  return (
    <DashboardLayout title="Notices">
      <div className="space-y-5 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Notice Board</h2>
            <p className="text-sm text-muted-foreground">
              {(notices ?? []).length} notice{(notices ?? []).length !== 1 ? 's' : ''} published
            </p>
          </div>
          {canManage && !showForm && (
            <Button onClick={() => setShowForm(true)}
              className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 sm:h-10 sm:px-4 text-sm shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post Notice</span>
              <span className="sm:hidden">Post</span>
            </Button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <CreateForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            creating={creating}
          />
        )}

        {/* Category filter bar */}
        {(notices ?? []).length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {([
              { key: 'all',      label: `All (${counts.all})` },
              { key: 'urgent',   label: `Urgent (${counts.urgent})` },
              { key: 'academic', label: `Academic (${counts.academic})` },
              { key: 'event',    label: `Event (${counts.event})` },
              { key: 'general',  label: `General (${counts.general})` },
            ] as const).map(({ key, label }) => (
              <FilterPill key={key} label={label} active={filter === key} onClick={() => setFilter(key)} />
            ))}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-primary/50" />
            </div>
            <p className="font-semibold text-foreground">No notices yet</p>
            <p className="text-sm mt-1">
              {canManage
                ? <button onClick={() => setShowForm(true)} className="cursor-pointer text-primary hover:underline">Post your first notice →</button>
                : 'Nothing has been posted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(n => (
              <NoticeCard
                key={n.id}
                notice={n}
                canManage={canManage}
                onDelete={() => deleteNotice(n.id)}
                deleting={deleting}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
