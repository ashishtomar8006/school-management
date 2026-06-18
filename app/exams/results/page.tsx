'use client'

import { useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useExams, useExamResults } from '@/hooks/use-exams'
import { useStudents } from '@/hooks/use-students'
import { ExamResult } from '@/lib/api/endpoints/exams'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BookOpen, Download, Loader2, Save, ArrowLeft,
  CheckCircle, XCircle, Clock, Users, Award, Printer,
} from 'lucide-react'

const GRADE_COLOR: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'A':  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'B+': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'B':  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'C':  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'D':  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'F':  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

function downloadCSV(data: ExamResult[], examName: string) {
  const headers = ['Student Name', 'Roll No', 'Class', 'Section', 'Subject', 'Marks Obtained', 'Max Marks', 'Grade', 'Status', 'Remarks']
  const rows = data.map(r => [
    r.student?.user?.name ?? '—',
    r.student?.rollNumber ?? '—',
    r.student?.class ?? '—',
    r.student?.section ?? '—',
    r.subject,
    r.marksObtained ?? '',
    r.maxMarks,
    r.grade ?? '',
    r.status,
    r.remarks ?? '',
  ])

  const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `${examName.replace(/\s+/g, '_')}_Results.csv`; a.click()
  URL.revokeObjectURL(url)
}

function ExamResultsContent() {
  const searchParams  = useSearchParams()
  const defaultExamId = searchParams.get('examId') ?? ''

  const { exams } = useExams()
  const [selectedExamId, setSelectedExamId] = useState(defaultExamId)
  const { students } = useStudents()
  const { results, loading, saveResult, bulkSave, saving, bulkSaving } = useExamResults(selectedExamId ? { examId: selectedExamId } : undefined)

  // Local editable marks state
  const [localMarks, setLocalMarks] = useState<Record<string, Record<string, string>>>({})
  const [saving2, setSaving2] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const selectedExam = exams.find(e => e.id === selectedExamId)

  const getKey = (studentId: string, subject: string) => `${studentId}::${subject}`

  const setMark = (studentId: string, subject: string, val: string) => {
    setLocalMarks(prev => ({
      ...prev,
      [getKey(studentId, subject)]: { ...prev[getKey(studentId, subject)], marks: val },
    }))
  }

  const handleBulkSave = async () => {
    if (!selectedExamId) return
    setSaving2(true)
    const payload: Partial<ExamResult>[] = []
    Object.entries(localMarks).forEach(([key, val]) => {
      const [studentId, subject] = key.split('::')
      if (val.marks !== undefined) {
        payload.push({ examId: selectedExamId, studentId, subject, marksObtained: parseFloat(val.marks), maxMarks: selectedExam?.totalMarks ?? 100 })
      }
    })
    if (payload.length > 0) await bulkSave(payload)
    setLocalMarks({})
    setSaving2(false)
  }

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(`
      <html><head><title>Exam Results - ${selectedExam?.name ?? ''}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        h2 { font-size: 14px; color: #555; margin-bottom: 16px; font-weight: normal; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #0d9488; color: white; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }
        td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .pass { color: #059669; font-weight: bold; }
        .fail { color: #dc2626; font-weight: bold; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 12px; color: #777; font-size: 11px; }
      </style></head><body>
      <h1>${selectedExam?.name ?? 'Exam Results'}</h1>
      <h2>${selectedExam?.class ? `Class ${selectedExam.class}${selectedExam.section ? '-' + selectedExam.section : ''}` : ''} · ${selectedExam?.academicYear ?? ''}</h2>
      ${content.innerHTML}
      <div class="footer">Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} · EduManage School Management</div>
      </body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  // Build unique subjects from results
  const subjects = [...new Set(results.map(r => r.subject))].sort()

  // Group results by student
  const byStudent = results.reduce<Record<string, ExamResult[]>>((acc, r) => {
    if (!acc[r.studentId]) acc[r.studentId] = []
    acc[r.studentId].push(r)
    return acc
  }, {})

  // Stats
  const totalStudents = Object.keys(byStudent).length
  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const avgMarks = results.length
    ? Math.round(results.filter(r => r.marksObtained !== undefined).reduce((s, r) => s + (r.marksObtained ?? 0), 0) / results.filter(r => r.marksObtained !== undefined).length)
    : 0

  return (
    <DashboardLayout title="Exam Results">
      <div className="space-y-4 md:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/exams"><Button variant="outline" size="sm" className="h-8 w-8 p-0"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div>
              <h2 className="text-xl font-bold text-foreground">Exam Results</h2>
              <p className="text-sm text-muted-foreground">{results.length} result entries</p>
            </div>
          </div>
          {results.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 h-9">
                <Printer className="w-4 h-4" />Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(results, selectedExam?.name ?? 'Results')} className="gap-2 h-9">
                <Download className="w-4 h-4" />Download CSV
              </Button>
            </div>
          )}
        </div>

        {/* Exam selector */}
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-semibold text-muted-foreground shrink-0">Exam:</label>
              <Select value={selectedExamId || '__none__'} onValueChange={v => setSelectedExamId(v === '__none__' ? '' : v)}>
                <SelectTrigger className="max-w-xs rounded-xl">
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select exam…</SelectItem>
                  {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {Object.keys(localMarks).length > 0 && (
                <Button size="sm" onClick={handleBulkSave} disabled={saving2} className="bg-primary hover:bg-primary/90 gap-2 h-8">
                  {saving2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save {Object.keys(localMarks).length} changes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {!selectedExamId && (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Select an exam to view results</p>
          </div>
        )}

        {selectedExamId && loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : selectedExamId && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Students',   value: totalStudents, icon: Users,       color: 'bg-blue-100 text-blue-700' },
                { label: 'Passed',     value: passed,        icon: CheckCircle, color: 'bg-green-100 text-green-700' },
                { label: 'Failed',     value: failed,        icon: XCircle,     color: 'bg-red-100 text-red-700' },
                { label: 'Avg. Marks', value: avgMarks || '—', icon: Award,    color: 'bg-amber-100 text-amber-700' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
                  <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Results table — printable */}
            <div ref={printRef}>
              {results.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No results entered yet for this exam</p>
                </div>
              ) : (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{selectedExam?.name} — Results</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student</th>
                            <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Subject</th>
                            <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Marks</th>
                            <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Grade</th>
                            <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map(r => (
                            <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-foreground">{r.student?.user?.name ?? '—'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Roll {r.student?.rollNumber} · Class {r.student?.class}-{r.student?.section}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-medium">{r.subject}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-bold">{r.marksObtained ?? '—'}</span>
                                <span className="text-muted-foreground text-xs">/{r.maxMarks}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {r.grade ? (
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${GRADE_COLOR[r.grade] ?? ''}`}>
                                    {r.grade}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`text-xs font-semibold ${
                                  r.status === 'pass' ? 'text-green-600' : r.status === 'fail' ? 'text-red-600' : 'text-muted-foreground'
                                }`}>
                                  {r.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function ExamResultsPage() { return <Suspense fallback={<div className='flex justify-center py-16'><div className='w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent' /></div>}><ExamResultsContent /></Suspense> }
