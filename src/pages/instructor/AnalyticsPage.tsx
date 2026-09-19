import { useQuery } from '@tanstack/react-query'
import { limit, orderBy, where } from 'firebase/firestore'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { getCollectionDocs } from '@/lib/firebase/firestore'
import type { CourseDoc, EnrollmentDoc, PaymentDoc } from '@/types/firebase'

export default function AnalyticsPage() {
  const { userProfile } = useAuth()
  const uid = userProfile?.uid ?? ''
  const coursesQuery = useQuery({ queryKey: ['instructor-analytics-courses', uid], enabled: Boolean(uid), queryFn: () => getCollectionDocs<CourseDoc>('courses', [where('instructorId', '==', uid), orderBy('createdAt', 'desc'), limit(20)]) })
  const paymentsQuery = useQuery({ queryKey: ['instructor-analytics-payments', uid], enabled: Boolean(uid), queryFn: () => getCollectionDocs<PaymentDoc>('payments', [orderBy('createdAt', 'desc'), limit(50)]) })
  const enrollmentsQuery = useQuery({ queryKey: ['instructor-analytics-enrollments', uid], enabled: Boolean(uid), queryFn: () => getCollectionDocs<EnrollmentDoc>('enrollments', [where('instructorId', '==', uid), orderBy('enrolledAt', 'desc'), limit(50)]) })

  const courseIds = new Set((coursesQuery.data ?? []).map((course) => course.id))
  const revenue = (paymentsQuery.data ?? []).filter((payment) => payment.courseId && courseIds.has(payment.courseId) && ['completed', 'paid'].includes(payment.status)).reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <DashboardShell role="instructor" title="Instructor Analytics">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Courses</p><p className="mt-3 text-3xl font-black">{coursesQuery.data?.length ?? 0}</p></Card>
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Students</p><p className="mt-3 text-3xl font-black">{enrollmentsQuery.data?.length ?? 0}</p></Card>
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Revenue</p><p className="mt-3 text-3xl font-black">{revenue}</p></Card>
      </div>
    </DashboardShell>
  )
}
