import { useQuery } from '@tanstack/react-query'
import { limit, orderBy } from 'firebase/firestore'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/card'
import { getCollectionDocs } from '@/lib/firebase/firestore'
import type { CourseDoc, EnrollmentDoc, PaymentDoc } from '@/types/firebase'

export default function AnalyticsPage() {
  const paymentsQuery = useQuery({ queryKey: ['admin-analytics-payments'], queryFn: () => getCollectionDocs<PaymentDoc>('payments', [orderBy('createdAt', 'desc'), limit(100)]) })
  const enrollmentsQuery = useQuery({ queryKey: ['admin-analytics-enrollments'], queryFn: () => getCollectionDocs<EnrollmentDoc>('enrollments', [orderBy('enrolledAt', 'desc'), limit(100)]) })
  const coursesQuery = useQuery({ queryKey: ['admin-analytics-courses'], queryFn: () => getCollectionDocs<CourseDoc>('courses', [orderBy('studentsCount', 'desc'), limit(10)]) })

  return (
    <DashboardShell role="admin" title="Analytics">
      <div className="grid gap-4 md:grid-cols-3"><Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Revenue Events</p><p className="mt-3 text-3xl font-black">{paymentsQuery.data?.length ?? 0}</p></Card><Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Enrollment Events</p><p className="mt-3 text-3xl font-black">{enrollmentsQuery.data?.length ?? 0}</p></Card><Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Top Courses</p><p className="mt-3 text-3xl font-black">{coursesQuery.data?.length ?? 0}</p></Card></div>
      <Card className="mt-6 rounded-[1.5rem] p-5"><h2 className="text-lg font-bold">Top Courses</h2><div className="mt-4 space-y-3">{(coursesQuery.data ?? []).map((course) => <div key={course.id} className="rounded-2xl border border-border p-3"><p className="font-medium">{course.title}</p><p className="text-sm text-muted-foreground">{course.studentsCount} students · {course.rating.toFixed(1)} rating</p></div>)}</div></Card>
    </DashboardShell>
  )
}
