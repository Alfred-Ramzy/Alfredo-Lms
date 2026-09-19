import { useQuery } from '@tanstack/react-query'
import { limit, orderBy, where } from 'firebase/firestore'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { getCollectionDocs } from '@/lib/firebase/firestore'
import type { CourseDoc, EnrollmentDoc, PaymentDoc, SubmissionDoc } from '@/types/firebase'

export default function DashboardPage() {
  const { userProfile } = useAuth()
  const uid = userProfile?.uid ?? ''
  const coursesQuery = useQuery({ queryKey: ['instructor-dashboard-courses', uid], enabled: Boolean(uid), queryFn: () => getCollectionDocs<CourseDoc>('courses', [where('instructorId', '==', uid), orderBy('createdAt', 'desc'), limit(10)]) })
  const enrollmentsQuery = useQuery({ queryKey: ['instructor-dashboard-enrollments', uid], enabled: Boolean(uid), queryFn: () => getCollectionDocs<EnrollmentDoc>('enrollments', [where('instructorId', '==', uid), orderBy('enrolledAt', 'desc'), limit(20)]) })
  const submissionsQuery = useQuery({ queryKey: ['instructor-dashboard-submissions'], queryFn: () => getCollectionDocs<SubmissionDoc>('submissions', [orderBy('submittedAt', 'desc'), limit(20)]) })
  const paymentsQuery = useQuery({ queryKey: ['instructor-dashboard-payments'], queryFn: () => getCollectionDocs<PaymentDoc>('payments', [orderBy('createdAt', 'desc'), limit(50)]) })
  const courseIds = new Set((coursesQuery.data ?? []).map((course) => course.id))
  const revenue = (paymentsQuery.data ?? []).filter((payment) => payment.courseId && courseIds.has(payment.courseId) && ['completed', 'paid'].includes(payment.status)).reduce((sum, payment) => sum + payment.amount, 0)
  const pendingGrading = (submissionsQuery.data ?? []).filter((submission) => submission.status !== 'graded' && courseIds.has(submission.courseId)).length

  return (
    <DashboardShell role="instructor" title="Instructor Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Total Courses</p><p className="mt-3 text-3xl font-black">{coursesQuery.data?.length ?? 0}</p></Card>
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Total Students</p><p className="mt-3 text-3xl font-black">{enrollmentsQuery.data?.length ?? 0}</p></Card>
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Revenue</p><p className="mt-3 text-3xl font-black">{revenue}</p></Card>
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Pending Grading</p><p className="mt-3 text-3xl font-black">{pendingGrading}</p></Card>
      </div>
    </DashboardShell>
  )
}
