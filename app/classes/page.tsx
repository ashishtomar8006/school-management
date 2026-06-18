'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Users } from 'lucide-react'

export default function ClassesPage() {
  const classes = [
    { name: '10A', subject: 'Mathematics', students: 25, hoursPerWeek: 5 },
    { name: '10B', subject: 'Mathematics', students: 28, hoursPerWeek: 5 },
    { name: '11A', subject: 'Mathematics', students: 22, hoursPerWeek: 6 }
  ]

  return (
    <DashboardLayout title="My Classes">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Class {cls.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">{cls.subject}</span></p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {cls.students} students
                  </p>
                  <p className="text-muted-foreground">
                    {cls.hoursPerWeek} hours/week
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <p className="text-muted-foreground">Select a class to view detailed information.</p>
              </TabsContent>

              <TabsContent value="attendance" className="mt-4">
                <p className="text-muted-foreground">Attendance tracking for selected class.</p>
              </TabsContent>

              <TabsContent value="performance" className="mt-4">
                <p className="text-muted-foreground">Performance metrics for selected class.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
