'use client'

import { useState, useMemo } from 'react'
import { format, parse, isValid, getMonth, getYear } from 'date-fns'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFeeRecords } from '@/hooks/use-fees'
import { FeeRecord, FeeStatus, PaymentMethod } from '@/lib/api/endpoints/fees'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  CreditCard, CheckCircle, Clock, AlertCircle, Loader2,
  Search, ChevronLeft, ChevronRight, Calendar,
  GraduationCap, ReceiptText, Wallet, BadgeCheck,
  X, Banknote,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const STATUS_CFG: Record<FeeStatus, { label: string; badge: string; dot: string }> = {
  paid:    { label: 'Paid',    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',       dot: 'bg-amber-500'   },
  overdue: { label: 'Overdue', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',               dot: 'bg-red-500'     },
}

const PAY_METHODS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: 'cash',   label: 'Cash',         icon: Banknote   },
  { value: 'online', label: 'Online/UPI',   icon: Wallet     },
  { value: 'cheque', label: 'Cheque',       icon: ReceiptText },
  { value: 'dd',     label: 'Demand Draft', icon: CreditCard  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(raw: string | undefined): Date | null {
  if (!raw) return null
  const d = parse(raw, 'yyyy-MM-dd', new Date())
  return isValid(d) ? d : null
}

function fmtDate(raw: string | undefined) {
  const d = parseDate(raw)
  return d ? format(d, 'd MMM yyyy') : '—'
}

function inMonth(r: FeeRecord, month: number, year: number) {
  const d = parseDate(r.dueDate)
  return !!d && getMonth(d) === month && getYear(d) === year
}

// ─── Month navigator ──────────────────────────────────────────────────────────

function MonthNav({ month, year, onChange }: {
  month: number; year: number; onChange: (m: number, y: number) => void
}) {
  const prev = () => month === 0  ? onChange(11, year - 1) : onChange(month - 1, year)
  const next = () => month === 11 ? onChange(0,  year + 1) : onChange(month + 1, year)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={prev} type="button"
        className="w-8 h-8 rounded-xl border bg-card flex items-center justify-center hover:bg-muted shrink-0">
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
        {MONTHS.map((m, i) => (
          <button key={m} type="button" onClick={() => onChange(i, year)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              i === month
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary'
            }`}>
            {m.slice(0, 3)}
          </button>
        ))}
      </div>
      <Select value={String(year)} onValueChange={v => onChange(month, Number(v))}>
        <SelectTrigger className="w-24 h-8 rounded-xl text-sm shrink-0"><SelectValue /></SelectTrigger>
        <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
      </Select>
      <button onClick={next} type="button"
        className="w-8 h-8 rounded-xl border bg-card flex items-center justify-center hover:bg-muted shrink-0">
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  )
}

// ─── Pay dialog (for students) ────────────────────────────────────────────────

function PayDialog({ fee, onClose, onPay, paying }: {
  fee: FeeRecord | null
  onClose: () => void
  onPay: (id: string, method: PaymentMethod) => void
  paying: boolean
}) {
  const [method, setMethod] = useState<PaymentMethod>('online')
  if (!fee) return null

  return (
    <Dialog open={!!fee} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[95vw] p-0" showCloseButton={false}>
        {/* Header */}
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white font-bold text-base m-0 p-0">Pay Fee</DialogTitle>
              <p className="text-white/60 text-[11px]">Select payment method</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Fee summary */}
          <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Fee Type</span>
              <span className="text-sm font-bold text-foreground">{fee.feeType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Amount</span>
              <span className="text-2xl font-black text-primary">₹{Number(fee.amount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Due Date</span>
              <span className={`text-sm font-semibold ${fee.status === 'overdue' ? 'text-red-500' : 'text-foreground'}`}>
                {fmtDate(fee.dueDate)}
              </span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              {PAY_METHODS.map(pm => {
                const Icon = pm.icon
                return (
                  <button key={pm.value} type="button" onClick={() => setMethod(pm.value)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                      method === pm.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}>
                    <Icon className={`w-4 h-4 shrink-0 ${method === pm.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs font-semibold ${method === pm.value ? 'text-primary' : 'text-foreground'}`}>
                      {pm.label}
                    </span>
                    {method === pm.value && (
                      <BadgeCheck className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action */}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={onClose} disabled={paying} className="flex-1 rounded-xl h-10">
              Cancel
            </Button>
            <Button disabled={paying} onClick={() => onPay(fee.id, method)}
              className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold">
              {paying
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing…</>
                : <><CheckCircle className="w-4 h-4 mr-2" />Confirm Payment</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Student view ─────────────────────────────────────────────────────────────

function StudentFeesView() {
  const { user, profile } = useAuth()
  const studentId = profile?.id as string | undefined
  const { records: allRecords, loading, processPayment, paying } = useFeeRecords(
    studentId ? { studentId } : undefined
  )

  const [payTarget, setPayTarget] = useState<FeeRecord | null>(null)

  const records = allRecords ?? []
  const paid    = records.filter(r => r.status === 'paid')
  const pending = records.filter(r => r.status === 'pending')
  const overdue = records.filter(r => r.status === 'overdue')
  const totalDue = [...pending, ...overdue].reduce((s, r) => s + Number(r.amount), 0)
  const totalPaid = paid.reduce((s, r) => s + Number(r.amount), 0)

  const handlePay = (id: string, method: PaymentMethod) => {
    processPayment({ id, data: { paymentMethod: method } })
    setPayTarget(null)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">My Fees</h2>
          <p className="text-sm text-muted-foreground">View and pay your fees</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',   value: records.length, amount: records.reduce((s,r) => s+Number(r.amount),0), icon: CreditCard,  color: 'bg-primary/10 text-primary' },
          { label: 'Paid',    value: paid.length,    amount: totalPaid,  icon: CheckCircle, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending', value: pending.length, amount: pending.reduce((s,r)=>s+Number(r.amount),0), icon: Clock, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
          { label: 'Overdue', value: overdue.length, amount: overdue.reduce((s,r)=>s+Number(r.amount),0), icon: AlertCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
        ].map(({ label, value, amount, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border bg-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground leading-none">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">{label}</p>
              <p className="text-xs text-muted-foreground">₹{amount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Due amount banner */}
      {totalDue > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-200">Total Dues Outstanding</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">{pending.length + overdue.length} unpaid fee{pending.length + overdue.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 shrink-0">
            ₹{totalDue.toLocaleString('en-IN')}
          </p>
        </div>
      )}

      {/* Records */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ReceiptText className="w-8 h-8 text-primary/50" />
          </div>
          <p className="font-semibold text-foreground">No fee records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(r => {
            const cfg = STATUS_CFG[r.status]
            const canPay = r.status !== 'paid'
            return (
              <div key={r.id} className={`rounded-2xl border-2 bg-card overflow-hidden transition-all ${
                r.status === 'overdue' ? 'border-red-200 dark:border-red-900' :
                r.status === 'paid'    ? 'border-emerald-200 dark:border-emerald-900' :
                'border-border'
              }`}>
                <div className={`h-1 w-full ${cfg.dot}`} />
                <div className="p-4 flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    r.status === 'paid'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : r.status === 'overdue'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    {r.status === 'paid'
                      ? <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      : r.status === 'overdue'
                      ? <AlertCircle className="w-5 h-5 text-red-500" />
                      : <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground">{r.feeType}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />Due {fmtDate(r.dueDate)}
                      </span>
                      {r.paidDate && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle className="w-3 h-3" />Paid {fmtDate(r.paidDate)}
                        </span>
                      )}
                      {r.paymentMethod && (
                        <span className="capitalize bg-muted px-1.5 py-0.5 rounded font-medium">{r.paymentMethod}</span>
                      )}
                    </div>
                  </div>

                  {/* Amount + Pay */}
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-foreground">₹{Number(r.amount).toLocaleString('en-IN')}</p>
                    {canPay && (
                      <Button size="sm" onClick={() => setPayTarget(r)}
                        className="mt-1.5 h-8 px-4 text-xs bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 font-semibold">
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PayDialog fee={payTarget} onClose={() => setPayTarget(null)} onPay={handlePay} paying={paying} />
    </div>
  )
}

// ─── Principal / teacher view ─────────────────────────────────────────────────

function AdminFeesView() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(getMonth(now))
  const [selectedYear,  setSelectedYear]  = useState(getYear(now))
  const [statusFilter,  setStatusFilter]  = useState<FeeStatus | 'all'>('all')
  const [search,        setSearch]        = useState('')
  const { user }  = useAuth()
  const canManage = user?.role === 'principal'

  const { records: allRecords, loading, processPayment, paying } = useFeeRecords()

  const monthRecords = useMemo(() =>
    (allRecords ?? []).filter(r => inMonth(r, selectedMonth, selectedYear)),
    [allRecords, selectedMonth, selectedYear]
  )

  const stats = useMemo(() => {
    const paid    = monthRecords.filter(r => r.status === 'paid')
    const pending = monthRecords.filter(r => r.status === 'pending')
    const overdue = monthRecords.filter(r => r.status === 'overdue')
    const sum = (arr: FeeRecord[]) => arr.reduce((s, r) => s + Number(r.amount), 0)
    return {
      paid:    { count: paid.length,    amount: sum(paid)    },
      pending: { count: pending.length, amount: sum(pending) },
      overdue: { count: overdue.length, amount: sum(overdue) },
      total:   { count: monthRecords.length, amount: sum(monthRecords) },
    }
  }, [monthRecords])

  const filtered = useMemo(() =>
    monthRecords.filter(r => {
      const name = r.student?.user?.name?.toLowerCase() ?? ''
      const roll = r.student?.rollNumber?.toLowerCase() ?? ''
      const matchSearch = !search || name.includes(search.toLowerCase()) || roll.includes(search.toLowerCase())
      return matchSearch && (statusFilter === 'all' || r.status === statusFilter)
    }),
    [monthRecords, statusFilter, search]
  )

  const [payTarget, setPayTarget] = useState<FeeRecord | null>(null)
  const handlePay = (id: string, method: PaymentMethod) => {
    processPayment({ id, data: { paymentMethod: method } })
    setPayTarget(null)
  }

  const monthLabel = `${MONTHS[selectedMonth]} ${selectedYear}`

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Fee Collection</h2>
          <p className="text-sm text-muted-foreground">Monthly fee tracking</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl border border-primary/20">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="text-sm font-bold">{monthLabel}</span>
        </div>
      </div>

      {/* Month nav */}
      <div className="rounded-2xl border bg-card p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />Select Month
        </p>
        <MonthNav month={selectedMonth} year={selectedYear}
          onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y) }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { key: 'all',     label: 'Total',   icon: CreditCard,  color: 'bg-primary/10 text-primary',                                                             count: stats.total.count,   amount: stats.total.amount   },
          { key: 'paid',    label: 'Paid',     icon: CheckCircle, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',          count: stats.paid.count,    amount: stats.paid.amount    },
          { key: 'pending', label: 'Pending',  icon: Clock,       color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',                  count: stats.pending.count, amount: stats.pending.amount },
          { key: 'overdue', label: 'Overdue',  icon: AlertCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',                          count: stats.overdue.count, amount: stats.overdue.amount },
        ] as const).map(s => (
          <button key={s.key} type="button" onClick={() => setStatusFilter(s.key as FeeStatus | 'all')}
            className={`rounded-2xl border-2 p-4 flex items-center gap-3 text-left transition-all ${
              statusFilter === s.key ? 'border-primary shadow-sm' : 'border-border bg-card hover:border-primary/40'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground leading-none">{s.count}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">{s.label}</p>
              <p className="text-xs text-muted-foreground">₹{s.amount.toLocaleString('en-IN')}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or roll…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 rounded-xl" />
      </div>

      {/* Records */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ReceiptText className="w-8 h-8 text-primary/50" />
          </div>
          <p className="font-semibold text-foreground">No records for {monthLabel}</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-2.5 sm:hidden">
            {filtered.map(r => {
              const cfg = STATUS_CFG[r.status]
              return (
                <div key={r.id} className={`rounded-2xl border-2 bg-card overflow-hidden ${r.status === 'overdue' ? 'border-red-200 dark:border-red-900' : 'border-border'}`}>
                  <div className={`h-1 w-full ${cfg.dot}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {r.student?.user?.name?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{r.student?.user?.name ?? '—'}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Class {r.student?.class}{r.student?.section ? `-${r.student.section}` : ''} · Roll {r.student?.rollNumber}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-black text-foreground">₹{Number(r.amount).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">{r.feeType}</p>
                      </div>
                      {canManage && r.status !== 'paid' && (
                        <Button size="sm" onClick={() => setPayTarget(r)}
                          className="h-8 px-3 text-xs bg-primary hover:bg-primary/90">
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block rounded-2xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
              <p className="font-bold text-sm text-foreground">{monthLabel} — {filtered.length} records</p>
              <p className="text-xs text-muted-foreground font-semibold">
                Collected: <span className="text-emerald-600 font-bold">₹{stats.paid.amount.toLocaleString('en-IN')}</span>
                {' '}· Due: <span className="text-amber-600 font-bold">₹{(stats.pending.amount + stats.overdue.amount).toLocaleString('en-IN')}</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Class</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Fee Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Due Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Paid Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    {canManage && <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const cfg = STATUS_CFG[r.status]
                    return (
                      <tr key={r.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${r.status === 'overdue' ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {r.student?.user?.name?.charAt(0) ?? '?'}
                            </div>
                            <p className="font-semibold text-foreground">{r.student?.user?.name ?? '—'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            <GraduationCap className="w-3 h-3" />
                            {r.student?.class ?? '—'}{r.student?.section ? `-${r.student.section}` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{r.feeType}</td>
                        <td className="py-3 px-4 text-right font-bold text-foreground">₹{Number(r.amount).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-center text-xs text-muted-foreground">{fmtDate(r.dueDate)}</td>
                        <td className="py-3 px-4 text-center">
                          {r.paidDate
                            ? <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{fmtDate(r.paidDate)}</span>
                            : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        {canManage && (
                          <td className="py-3 px-4 text-center">
                            {r.status !== 'paid'
                              ? <Button size="sm" variant="outline" disabled={paying}
                                  onClick={() => setPayTarget(r)}
                                  className="h-7 px-3 text-xs hover:bg-primary hover:text-white hover:border-primary">
                                  Mark Paid
                                </Button>
                              : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <PayDialog fee={payTarget} onClose={() => setPayTarget(null)} onPay={handlePay} paying={paying} />
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function FeesPage() {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'

  return (
    <DashboardLayout title="Fees">
      {isStudent ? <StudentFeesView /> : <AdminFeesView />}
    </DashboardLayout>
  )
}
