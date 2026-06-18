'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCard } from '@/components/dashboard-components'
import { useSalary } from '@/hooks/use-salary'
import { SalaryStatus } from '@/lib/api/endpoints/salary'
import { Wallet, CheckCircle, Clock, Loader2 } from 'lucide-react'

const STATUS_COLOR: Record<SalaryStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  processed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  paid:      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function SalaryPage() {
  const { records, loading, processPayment, bulkGenerate, paying, generating } = useSalary()
  const [genMonth, setGenMonth] = useState(MONTHS[new Date().getMonth()])
  const [genYear,  setGenYear]  = useState(new Date().getFullYear())

  const paid      = records?.filter(r => r.status === 'paid').length ?? 0
  const pending   = records?.filter(r => r.status === 'pending').length ?? 0
  const totalPaid = records?.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.netSalary), 0) ?? 0

  return (
    <DashboardLayout title="Salary Management">
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <StatCard title="Total Records" value={records?.length ?? 0} icon={Wallet} index={0} />
          <StatCard title="Paid"    value={paid}    icon={CheckCircle} trend="up" index={1} />
          <StatCard title="Pending" value={pending} icon={Clock}       index={2} />
        </div>

        {/* Bulk generate */}
        <Card>
          <CardHeader><CardTitle className="text-base">Generate Monthly Salaries</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Month</label>
                <Select value={genMonth} onValueChange={setGenMonth}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Year</label>
                <Select value={String(genYear)} onValueChange={v => setGenYear(Number(v))}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2024,2025,2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => bulkGenerate({ month: genMonth, year: genYear })} disabled={generating} className="bg-primary hover:bg-primary/90">
                {generating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (records?.length ?? 0) === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-40" /><p className="font-medium">No salary records. Generate for a month above.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 lg:hidden">
              {(records ?? []).map(r => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{r.teacher?.user?.name ?? '—'}</p>
                        <p className="text-xs text-slate-500">{r.month} {r.year}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">₹{Number(r.netSalary).toLocaleString()}</p>
                    {r.status !== 'paid' && (
                      <Button size="sm" className="w-full mt-3 bg-primary hover:bg-primary/90 h-8 text-xs" disabled={paying}
                        onClick={() => processPayment({ id: r.id, paymentMethod: 'bank_transfer' })}>
                        {paying ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}Mark as Paid
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop table */}
            <Card className="hidden lg:block">
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {['Teacher','Month','Base','Allowances','Deductions','Net Salary','Status','Action'].map(h => (
                          <th key={h} className="text-left py-3 px-4 font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(records ?? []).map(r => (
                        <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="py-3 px-4 font-medium">{r.teacher?.user?.name ?? '—'}</td>
                          <td className="py-3 px-4 text-slate-500">{r.month} {r.year}</td>
                          <td className="py-3 px-4">₹{Number(r.baseSalary).toLocaleString()}</td>
                          <td className="py-3 px-4 text-green-600">+₹{(Number(r.da)+Number(r.hra)+Number(r.conveyance)+Number(r.otherAllowances)).toLocaleString()}</td>
                          <td className="py-3 px-4 text-red-600">-₹{(Number(r.pf)+Number(r.tax)+Number(r.otherDeductions)).toLocaleString()}</td>
                          <td className="py-3 px-4 font-bold">₹{Number(r.netSalary).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                          </td>
                          <td className="py-3 px-4">
                            {r.status !== 'paid' && (
                              <Button size="sm" variant="outline" disabled={paying} className="h-7 text-xs"
                                onClick={() => processPayment({ id: r.id, paymentMethod: 'bank_transfer' })}>
                                Pay
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
