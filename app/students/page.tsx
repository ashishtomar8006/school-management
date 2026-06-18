'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useStudents } from '@/hooks/use-students'
import { useAuth } from '@/lib/auth-context'
import { StudentProfile } from '@/lib/api/endpoints/students'
import {
  Users, Search, Plus, Loader2, GraduationCap,
  Edit, Trash2, AlertTriangle, AlertCircle, X,
} from 'lucide-react'

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteStudentDialog({ student, onClose, onConfirm, loading }: {
  student: StudentProfile | null; onClose: () => void
  onConfirm: (id: string) => Promise<void>; loading: boolean
}) {
  if (!student) return null
  return (
    <Dialog open={!!student} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />Remove Student
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 space-y-3">
          {/* Student card */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0">
              {student.user?.name?.charAt(0) ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{student.user?.name}</p>
              <p className="text-xs text-muted-foreground">
                Class {student.class}-{student.section} · Roll {student.rollNumber}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            This will <strong className="text-foreground">deactivate</strong> the student's account.
            The record is kept but the student can no longer log in.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={() => onConfirm(student.id)} disabled={loading}
            className="bg-destructive hover:bg-destructive/90 min-w-28">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Removing…</> : 'Yes, Remove'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const { user } = useAuth()
  const router   = useRouter()

  const [search, setSearch]             = useState('')
  const [filterClass, setFilterClass]   = useState('all')
  const [deleteTarget, setDeleteTarget] = useState<StudentProfile | null>(null)

  const { students, loading, deleteStudent, deleting } = useStudents()
  const canManage = user?.role === 'principal'

  const filtered = students.filter(s => {
    const name = s.user?.name?.toLowerCase() ?? ''
    const roll = s.rollNumber.toLowerCase()
    return (name.includes(search.toLowerCase()) || roll.includes(search.toLowerCase())) &&
      (filterClass === 'all' || s.class === filterClass)
  })

  const classFilterOptions = [...new Set(students.map(s => s.class))]
    .sort((a, b) => Number(a) - Number(b))

  const handleDelete = async (id: string) => {
    await deleteStudent(id)
    setDeleteTarget(null)
  }

  return (
    <DashboardLayout title="Students Management">
      <div className="space-y-4 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Students Directory</h2>
            <p className="text-sm text-muted-foreground">
              Total: <strong className="text-foreground">{students.length}</strong> students
            </p>
          </div>
          {canManage && (
            <Link href="/students/add">
              <Button className="gap-2 bg-primary hover:bg-primary/90 h-9 px-3 sm:h-10 sm:px-4 text-sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Search & Filter */}
        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['all', ...classFilterOptions].map(cls => (
                <Button key={cls} size="sm"
                  variant={filterClass === cls ? 'default' : 'outline'}
                  onClick={() => setFilterClass(cls)}
                  className={`shrink-0 ${filterClass === cls ? 'bg-primary hover:bg-primary/90' : ''}`}>
                  {cls === 'all' ? 'All Classes' : `Class ${cls}`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Class stats */}
        {classFilterOptions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {classFilterOptions.map(cls => {
              const count = students.filter(s => s.class === cls).length
              const active = filterClass === cls
              return (
                <button key={cls} type="button"
                  onClick={() => setFilterClass(active ? 'all' : cls)}
                  className={`p-3 rounded-xl text-center border-2 transition-all ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-md'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                  }`}>
                  <p className={`text-2xl font-black ${active ? 'text-white' : 'text-foreground'}`}>{count}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wide ${active ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    Class {cls}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {/* Table / Cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-2 sm:hidden">
              {filtered.map(s => (
                <div key={s.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {s.user?.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{s.user?.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                        {s.class}-{s.section}
                      </span>
                      <span className="text-xs text-muted-foreground">Roll {s.rollNumber}</span>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-1.5 shrink-0">
                      <Link href={`/students/${s.id}/edit`}>
                        <Button size="sm" variant="outline"
                          className="h-8 w-8 p-0 border-primary/30 text-primary hover:bg-primary/5">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline"
                        className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/5"
                        onClick={() => setDeleteTarget(s)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No students found</p>
                  {canManage && (
                    <Link href="/students/add" className="text-sm text-primary hover:underline mt-1 block">
                      Add your first student →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Desktop table */}
            <Card className="hidden sm:block">
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Roll</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Class</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Father</th>
                        {canManage && (
                          <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(s => (
                        <tr key={s.id}
                          className="border-b border-border/50 hover:bg-muted/40 transition-colors group">
                          {/* Student */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                {s.user?.name?.charAt(0) ?? '?'}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{s.user?.name}</p>
                                <p className="text-xs text-muted-foreground">{s.user?.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Roll */}
                          <td className="py-3 px-4 text-center font-mono text-sm text-muted-foreground">
                            {s.rollNumber}
                          </td>

                          {/* Class badge */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                              {s.class}-{s.section}
                            </span>
                          </td>

                          {/* Father */}
                          <td className="py-3 px-4 text-muted-foreground">{s.fatherName ?? '—'}</td>

                          {/* Actions */}
                          {canManage && (
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Link href={`/students/${s.id}/edit`}>
                                  <Button size="sm" variant="outline"
                                    className="h-8 px-3 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary">
                                    <Edit className="w-3.5 h-3.5" />Edit
                                  </Button>
                                </Link>
                                <Button size="sm" variant="outline"
                                  className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive hover:text-white hover:border-destructive"
                                  onClick={() => setDeleteTarget(s)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}

                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={canManage ? 5 : 4} className="text-center py-14 text-muted-foreground">
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p>No students found</p>
                            {canManage && (
                              <Link href="/students/add" className="text-sm text-primary hover:underline mt-1 block">
                                Add your first student →
                              </Link>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Only the delete dialog remains as a modal */}
      <DeleteStudentDialog
        student={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </DashboardLayout>
  )
}
