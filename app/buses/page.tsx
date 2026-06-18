'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCard } from '@/components/dashboard-components'
import { useBusRoutes, useBuses, useBusAssignments } from '@/hooks/use-buses'
import { useStudents } from '@/hooks/use-students'
import { BusRoute, Bus, BusAssignment, CreateRoutePayload, CreateBusPayload, AssignStudentPayload, RouteStop } from '@/lib/api/endpoints/buses'
import {
  Bus as BusIcon, MapPin, Users, Plus, Phone, Navigation,
  CheckCircle, Search, UserPlus, X, Edit, Loader2, Trash2,
} from 'lucide-react'

const BUS_STATUS_CFG = {
  active:      { label: 'Active',      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  inactive:    { label: 'Inactive',    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
}

// ─── Add Bus Dialog ────────────────────────────────────────────────────────────

function AddBusDialog({ open, onClose, onAdd, routes, loading }: {
  open: boolean; onClose: () => void
  onAdd: (d: CreateBusPayload) => Promise<void>
  routes: BusRoute[]; loading: boolean
}) {
  const [form, setForm] = useState<CreateBusPayload>({ busNumber: '', registrationNumber: '', driverName: '', capacity: 40, status: 'active' })
  const set = (k: keyof CreateBusPayload, v: string | number) => setForm(p => ({ ...p, [k]: v }))
  const valid = form.busNumber && form.registrationNumber && form.driverName && form.routeId

  const handleAdd = async () => {
    if (!valid) return
    await onAdd(form)
    setForm({ busNumber: '', registrationNumber: '', driverName: '', capacity: 40, status: 'active' })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><BusIcon className="w-5 h-5 text-primary" />Add New Bus</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Bus Number *</label><Input placeholder="Bus-05" value={form.busNumber} onChange={e => set('busNumber', e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Reg. Number *</label><Input placeholder="MH-04-XX-0000" value={form.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Capacity *</label><Input type="number" value={form.capacity} onChange={e => set('capacity', parseInt(e.target.value))} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Year</label><Input placeholder="2022" value={form.yearOfManufacture ?? ''} onChange={e => set('yearOfManufacture', e.target.value)} /></div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Route *</label>
            <Select value={form.routeId ?? ''} onValueChange={v => set('routeId', v)}>
              <SelectTrigger><SelectValue placeholder="Select a route" /></SelectTrigger>
              <SelectContent>{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.routeName} ({r.startPoint} → School)</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Driver</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Name *</label><Input value={form.driverName} onChange={e => set('driverName', e.target.value)} /></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Phone</label><Input value={form.driverPhone ?? ''} onChange={e => set('driverPhone', e.target.value)} /></div>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Conductor <span className="normal-case font-normal">(optional)</span></p>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Name" value={form.conductorName ?? ''} onChange={e => set('conductorName', e.target.value)} />
              <Input placeholder="Phone" value={form.conductorPhone ?? ''} onChange={e => set('conductorPhone', e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={loading || !valid} className="bg-primary hover:bg-primary/90">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Add Bus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add Route Dialog ──────────────────────────────────────────────────────────

interface StopDraft { stopName: string; pickupTime: string; dropTime: string; landmark: string }
const emptyStop = (): StopDraft => ({ stopName: '', pickupTime: '', dropTime: '', landmark: '' })

function AddRouteDialog({ open, onClose, onAdd, loading }: {
  open: boolean; onClose: () => void
  onAdd: (d: CreateRoutePayload) => Promise<void>
  loading: boolean
}) {
  const [routeName, setRouteName] = useState('')
  const [startPoint, setStartPoint] = useState('')
  const [totalDistance, setTotalDistance] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [stops, setStops] = useState<StopDraft[]>([emptyStop()])

  const setStop = (idx: number, k: keyof StopDraft, v: string) =>
    setStops(p => p.map((s, i) => i === idx ? { ...s, [k]: v } : s))

  const reset = () => { setRouteName(''); setStartPoint(''); setTotalDistance(''); setEstimatedTime(''); setStops([emptyStop()]) }
  const isValid = routeName.trim() && startPoint.trim() && stops.every(s => s.stopName && s.pickupTime && s.dropTime)

  const handleAdd = async () => {
    if (!isValid) return
    await onAdd({
      routeName, startPoint, endPoint: 'School', status: 'active',
      totalDistance: totalDistance || undefined, estimatedTime: estimatedTime || undefined,
      stops: stops.map((s, i) => ({ stopName: s.stopName, pickupTime: s.pickupTime, dropTime: s.dropTime, landmark: s.landmark || undefined, order: i + 1 } as any)),
    })
    reset(); onClose()
  }

  return (
    <Dialog open={open} onOpenChange={() => { reset(); onClose() }}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Navigation className="w-5 h-5 text-primary" />Add New Route</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Route Name *</label><Input placeholder="e.g. Central Route" value={routeName} onChange={e => setRouteName(e.target.value)} /></div>
            <div className="col-span-2 space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Start Point *</label><Input placeholder="e.g. Andheri West" value={startPoint} onChange={e => setStartPoint(e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Distance</label><Input placeholder="e.g. 12 km" value={totalDistance} onChange={e => setTotalDistance(e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Est. Time</label><Input placeholder="e.g. 40 min" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} /></div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stops <span className="text-primary font-bold">({stops.length})</span></p>
              <Button type="button" size="sm" variant="outline" onClick={() => setStops(p => [...p, emptyStop()])} className="h-7 px-2.5 text-xs gap-1"><Plus className="w-3 h-3" />Add Stop</Button>
            </div>
            <div className="space-y-3">
              {stops.map((stop, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute left-0 top-3 w-4 h-4 rounded-full border-2 border-teal-500 bg-background flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary">{idx + 1}</span>
                  </div>
                  {idx < stops.length - 1 && <div className="absolute left-1.5 top-7 bottom-0 w-px bg-teal-200 dark:bg-teal-900" />}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input placeholder={`Stop ${idx + 1} name *`} value={stop.stopName} onChange={e => setStop(idx, 'stopName', e.target.value)} className="flex-1 h-8 text-sm" />
                      {stops.length > 1 && (
                        <button onClick={() => setStops(p => p.filter((_, i) => i !== idx))} className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[10px] font-semibold text-slate-500">Pickup *</label><Input type="time" value={stop.pickupTime} onChange={e => setStop(idx, 'pickupTime', e.target.value)} className="h-8 text-sm" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-semibold text-slate-500">Drop *</label><Input type="time" value={stop.dropTime} onChange={e => setStop(idx, 'dropTime', e.target.value)} className="h-8 text-sm" /></div>
                    </div>
                    <Input placeholder="Landmark (optional)" value={stop.landmark} onChange={e => setStop(idx, 'landmark', e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
              ))}
              <div className="relative pl-6">
                <div className="absolute left-0 top-2.5 w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-500" />
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 pt-1.5">School (End Point)</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => { reset(); onClose() }}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!isValid || loading} className="bg-primary hover:bg-primary/90">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Add Route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Assign Student Dialog ─────────────────────────────────────────────────────

function AssignStudentDialog({ open, onClose, onAssign, buses, routes, assignments, editAssignment, loading }: {
  open: boolean; onClose: () => void
  onAssign: (d: AssignStudentPayload) => Promise<void>
  buses: Bus[]; routes: BusRoute[]; assignments: BusAssignment[]
  editAssignment?: BusAssignment | null; loading: boolean
}) {
  const { students } = useStudents()
  const unassigned = students.filter(s => !assignments.some(a => a.studentId === s.id && a.status === 'active'))

  const [studentId, setStudentId] = useState(editAssignment?.studentId ?? '')
  const [busId,     setBusId]     = useState(editAssignment?.busId ?? '')
  const [stop,      setStop]      = useState(editAssignment?.pickupStop ?? '')

  const selectedBus   = buses.find(b => b.id === busId)
  const selectedRoute = routes.find(r => r.id === selectedBus?.routeId)
  const stops = [...(selectedRoute?.stops ?? [])].sort((a, b) => a.order - b.order)
  const editStudent = students.find(s => s.id === editAssignment?.studentId)

  const handleAssign = async () => {
    const sid = editAssignment?.studentId ?? studentId
    if (!sid || !busId || !stop) return
    await onAssign({ studentId: sid, busId, pickupStop: stop })
    setStudentId(''); setBusId(''); setStop(''); onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" />{editAssignment ? 'Change Bus Assignment' : 'Assign Student to Bus'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          {editAssignment ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-sm font-semibold text-foreground">{editStudent?.user?.name}</p>
              <p className="text-xs text-slate-500">Class {editStudent?.class}-{editStudent?.section}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Select Student *</label>
              <Select value={studentId} onValueChange={v => { setStudentId(v); setBusId(''); setStop('') }}>
                <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                <SelectContent>{unassigned.map(s => <SelectItem key={s.id} value={s.id}>{s.user?.name} — Class {s.class}-{s.section}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Select Bus *</label>
            <Select value={busId} onValueChange={v => { setBusId(v); setStop('') }}>
              <SelectTrigger><SelectValue placeholder="Choose a bus" /></SelectTrigger>
              <SelectContent>
                {buses.filter(b => b.status === 'active').map(b => {
                  const route = routes.find(r => r.id === b.routeId)
                  const occ = assignments.filter(a => a.busId === b.id && a.status === 'active').length
                  return <SelectItem key={b.id} value={b.id} disabled={occ >= b.capacity}>{b.busNumber} — {route?.routeName} ({occ}/{b.capacity})</SelectItem>
                })}
              </SelectContent>
            </Select>
          </div>
          {busId && stops.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Pickup Stop *</label>
              <Select value={stop} onValueChange={setStop}>
                <SelectTrigger><SelectValue placeholder="Choose pickup stop" /></SelectTrigger>
                <SelectContent>{stops.map(s => <SelectItem key={s.id} value={s.stopName}>{s.stopName} — {s.pickupTime}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} disabled={loading || (!editAssignment && !studentId) || !busId || !stop} className="bg-primary hover:bg-primary/90">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{editAssignment ? 'Update' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BusesPage() {
  const { routes, loading: routesLoading, createRoute, deleteRoute, creating: creatingRoute } = useBusRoutes()
  const { buses, loading: busesLoading, createBus, creating: creatingBus } = useBuses()
  const { assignments, loading: assignLoading, assignStudent, updateAssignment, removeAssignment, assigning, removing } = useBusAssignments()

  const [showAddBus,     setShowAddBus]     = useState(false)
  const [showAddRoute,   setShowAddRoute]   = useState(false)
  const [showAssign,     setShowAssign]     = useState(false)
  const [editAssignment, setEditAssignment] = useState<BusAssignment | null>(null)
  const [search, setSearch] = useState('')

  const activeBuses   = buses.filter(b => b.status === 'active').length
  const totalCapacity = buses.filter(b => b.status === 'active').reduce((s, b) => s + b.capacity, 0)
  const activeAsgn    = assignments.filter(a => a.status === 'active')

  const getOccupancy = (busId: string) => activeAsgn.filter(a => a.busId === busId).length
  const getRoute = (routeId?: string) => routes.find(r => r.id === routeId)

  const filteredAsgn = activeAsgn.filter(a =>
    (a.student as any)?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (a.bus as any)?.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
    a.pickupStop.toLowerCase().includes(search.toLowerCase())
  )

  const handleAssign = async (data: AssignStudentPayload) => {
    if (editAssignment) { await updateAssignment({ id: editAssignment.id, data }); setEditAssignment(null) }
    else { await assignStudent(data) }
    setShowAssign(false)
  }

  return (
    <DashboardLayout title="Bus Routes">
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Total Buses"      value={buses.length}  icon={BusIcon}     index={0} />
          <StatCard title="Active Buses"     value={activeBuses}   icon={CheckCircle} description="In service" index={1} />
          <StatCard title="Total Capacity"   value={totalCapacity} icon={Users}       description="Active buses" index={2} />
          <StatCard title="Assigned Students" value={activeAsgn.length} icon={MapPin} description="With bus" index={3} />
        </div>

        <Tabs defaultValue="buses">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="buses">Buses</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Buses Tab */}
          <TabsContent value="buses" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{buses.length} buses registered</p>
              <Button onClick={() => setShowAddBus(true)} className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Bus</span><span className="sm:hidden">Add</span>
              </Button>
            </div>
            {busesLoading ? <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
            : buses.length === 0 ? <div className="text-center py-16 text-slate-400"><BusIcon className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>No buses registered</p></div>
            : (
              <>
                <div className="space-y-3 lg:hidden">
                  {buses.map(bus => {
                    const route = getRoute(bus.routeId)
                    const occ = getOccupancy(bus.id)
                    const pct = Math.round((occ / bus.capacity) * 100)
                    const cfg = BUS_STATUS_CFG[bus.status]
                    return (
                      <Card key={bus.id}><CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0"><BusIcon className="w-5 h-5 text-primary" /></div>
                            <div><p className="font-bold text-foreground">{bus.busNumber}</p><p className="text-xs text-slate-500">{bus.registrationNumber}</p></div>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><Navigation className="w-3.5 h-3.5 text-teal-500 shrink-0" /><span className="truncate">{route?.routeName ?? '—'} · {route?.startPoint} → School</span></div>
                          <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" />{bus.driverName} {bus.driverPhone ? `· ${bus.driverPhone}` : ''}</div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Occupancy</span><span className="font-semibold">{occ}/{bus.capacity}</span></div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </CardContent></Card>
                    )
                  })}
                </div>
                <Card className="hidden lg:block"><CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        {['Bus','Route','Driver','Conductor','Occupancy','Status'].map(h => <th key={h} className="text-left py-3 px-4 font-semibold text-muted-foreground">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {buses.map(bus => {
                          const route = getRoute(bus.routeId); const occ = getOccupancy(bus.id)
                          const pct = Math.round((occ / bus.capacity) * 100); const cfg = BUS_STATUS_CFG[bus.status]
                          return (
                            <tr key={bus.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                              <td className="py-3 px-4"><p className="font-semibold">{bus.busNumber}</p><p className="text-xs text-slate-500">{bus.registrationNumber}</p></td>
                              <td className="py-3 px-4"><p>{route?.routeName ?? '—'}</p><p className="text-xs text-slate-500">{route?.startPoint} → School</p></td>
                              <td className="py-3 px-4"><p>{bus.driverName}</p><p className="text-xs text-slate-500">{bus.driverPhone}</p></td>
                              <td className="py-3 px-4 text-slate-500">{bus.conductorName ?? '—'}</td>
                              <td className="py-3 px-4 text-center"><span className="text-xs font-semibold">{occ}/{bus.capacity}</span><div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1 mx-auto"><div className={`h-full rounded-full ${pct>90?'bg-red-500':pct>70?'bg-yellow-500':'bg-teal-500'}`} style={{width:`${pct}%`}}/></div></td>
                              <td className="py-3 px-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent></Card>
              </>
            )}
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{routes.length} routes configured</p>
              <Button onClick={() => setShowAddRoute(true)} className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Route</span><span className="sm:hidden">Add</span>
              </Button>
            </div>
            {routesLoading ? <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
            : routes.length === 0 ? <div className="text-center py-16 text-slate-400"><Navigation className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>No routes configured</p></div>
            : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {routes.map(route => {
                  const sortedStops = [...(route.stops ?? [])].sort((a, b) => a.order - b.order)
                  const routeBuses = buses.filter(b => b.routeId === route.id)
                  return (
                    <Card key={route.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2"><Navigation className="w-4 h-4 text-primary" />{route.routeName}</CardTitle>
                            <p className="text-xs text-slate-500 mt-1">{route.startPoint} → School{route.totalDistance ? ` · ${route.totalDistance}` : ''}{route.estimatedTime ? ` · ${route.estimatedTime}` : ''}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => deleteRoute(route.id)} className="h-7 w-7 p-0 text-red-500 border-red-200 hover:bg-red-50"><X className="w-3.5 h-3.5" /></Button>
                        </div>
                        {routeBuses.length > 0 && (
                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                            {routeBuses.map(b => <span key={b.id} className="flex items-center gap-1"><BusIcon className="w-3 h-3" />{b.busNumber}</span>)}
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{routeBuses.reduce((s, b) => s + getOccupancy(b.id), 0)} students</span>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        {sortedStops.length === 0 ? <p className="text-xs text-slate-400 text-center py-2">No stops</p> : (
                          <div className="relative pl-5">
                            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-teal-200 dark:bg-teal-900" />
                            <div className="space-y-3">
                              {sortedStops.map((stop, idx) => (
                                <div key={stop.id} className="flex items-start gap-3 relative">
                                  <div className={`absolute -left-5 top-1 w-3 h-3 rounded-full border-2 border-teal-500 ${idx === 0 || idx === sortedStops.length-1 ? 'bg-teal-500' : 'bg-background'}`} />
                                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground">{stop.stopName}</p>{stop.landmark && <p className="text-xs text-slate-400">{stop.landmark}</p>}</div>
                                  <div className="text-right shrink-0"><p className="text-xs font-semibold text-primary dark:text-teal-400">↑ {stop.pickupTime}</p><p className="text-xs text-slate-400">↓ {stop.dropTime}</p></div>
                                </div>
                              ))}
                              <div className="flex items-start gap-3 relative"><div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-orange-500" /><p className="text-sm font-semibold text-orange-600 dark:text-orange-400">School</p></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" /><Input placeholder="Search student, bus or stop..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" /></div>
              <Button onClick={() => { setEditAssignment(null); setShowAssign(true) }} className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 text-sm shrink-0">
                <UserPlus className="w-4 h-4" /><span className="hidden sm:inline">Assign Student</span><span className="sm:hidden">Assign</span>
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap text-xs">
              {buses.filter(b => b.status === 'active').map(b => (
                <div key={b.id} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-full">
                  <BusIcon className="w-3 h-3 text-primary" /><span className="font-semibold text-slate-700 dark:text-slate-300">{b.busNumber}</span>
                  <span className="text-slate-500">{getRoute(b.routeId)?.routeName}</span>
                  <span className="bg-primary text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">{getOccupancy(b.id)}</span>
                </div>
              ))}
            </div>
            {assignLoading ? <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
            : (
              <>
                <div className="space-y-2 lg:hidden">
                  {filteredAsgn.map(a => {
                    const bus = buses.find(b => b.id === a.busId); const route = getRoute(bus?.routeId)
                    return (
                      <div key={a.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-white dark:bg-slate-900">
                        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-sm shrink-0">{(a.student as any)?.user?.name?.charAt(0) ?? '?'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{(a.student as any)?.user?.name}</p>
                          <p className="text-xs text-slate-500">Class {(a.student as any)?.class}-{(a.student as any)?.section}</p>
                          <div className="flex items-center gap-1 mt-0.5"><BusIcon className="w-3 h-3 text-teal-500" /><span className="text-xs font-medium text-primary dark:text-teal-400">{bus?.busNumber}</span><span className="text-xs text-slate-400">· {route?.routeName}</span></div>
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /><span className="text-xs text-slate-500 truncate">{a.pickupStop}</span></div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { setEditAssignment(a); setShowAssign(true) }}><Edit className="w-3 h-3" /></Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50" disabled={removing} onClick={() => removeAssignment(a.id)}><X className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    )
                  })}
                  {filteredAsgn.length === 0 && <div className="text-center py-14 text-slate-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-40" /><p className="text-sm font-medium">No assignments found</p></div>}
                </div>
                <Card className="hidden lg:block"><CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        {['Student','Bus','Route','Pickup Stop','Assigned','Actions'].map(h => <th key={h} className="text-left py-3 px-4 font-semibold text-muted-foreground">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {filteredAsgn.map(a => {
                          const bus = buses.find(b => b.id === a.busId); const route = getRoute(bus?.routeId)
                          return (
                            <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                              <td className="py-3 px-4"><p className="font-medium">{(a.student as any)?.user?.name}</p><p className="text-xs text-slate-500">Class {(a.student as any)?.class}-{(a.student as any)?.section}</p></td>
                              <td className="py-3 px-4"><span className="inline-flex items-center gap-1.5 font-semibold text-teal-700 dark:text-teal-400"><BusIcon className="w-3.5 h-3.5" />{bus?.busNumber ?? '—'}</span></td>
                              <td className="py-3 px-4 text-slate-500">{route?.routeName ?? '—'}</td>
                              <td className="py-3 px-4"><div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{a.pickupStop}</div></td>
                              <td className="py-3 px-4 text-slate-500">{a.assignedDate}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => { setEditAssignment(a); setShowAssign(true) }}>Change</Button>
                                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs text-red-600 border-red-200 hover:bg-red-50" disabled={removing} onClick={() => removeAssignment(a.id)}>Remove</Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {filteredAsgn.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-slate-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No assignments found</p></td></tr>}
                      </tbody>
                    </table>
                  </div>
                </CardContent></Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddBusDialog   open={showAddBus}   onClose={() => setShowAddBus(false)}   onAdd={createBus}   routes={routes} loading={creatingBus} />
      <AddRouteDialog open={showAddRoute} onClose={() => setShowAddRoute(false)} onAdd={createRoute} loading={creatingRoute} />
      <AssignStudentDialog
        open={showAssign}
        onClose={() => { setShowAssign(false); setEditAssignment(null) }}
        onAssign={handleAssign}
        buses={buses} routes={routes} assignments={activeAsgn}
        editAssignment={editAssignment} loading={assigning}
      />
    </DashboardLayout>
  )
}
