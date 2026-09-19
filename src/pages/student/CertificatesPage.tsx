import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderBy, where } from 'firebase/firestore'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { generateCertificate } from '@/lib/certificates/generateCertificate'
import { getCollectionDocs, getCoursesByIds } from '@/lib/firebase/firestore'
import type { EnrollmentDoc } from '@/types/firebase'

export default function CertificatesPage() {
  const { userProfile } = useAuth()
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const uid = userProfile?.uid ?? ''
  const enrollmentsQuery = useQuery({
    queryKey: ['certificates-enrollments', uid],
    enabled: Boolean(uid),
    queryFn: () => getCollectionDocs<EnrollmentDoc>('enrollments', [where('studentId', '==', uid), orderBy('enrolledAt', 'desc')]),
  })
  const completed = (enrollmentsQuery.data ?? []).filter((item) => item.progressPercent >= 100 || item.status === 'completed')
  const coursesQuery = useQuery({
    queryKey: ['certificates-courses', completed.map((item) => item.courseId).join('|')],
    enabled: completed.length > 0,
    queryFn: () => getCoursesByIds(completed.map((item) => item.courseId)),
  })
  const courseMap = new Map((coursesQuery.data ?? []).map((course) => [course.id, course]))

  const issue = async (enrollment: EnrollmentDoc & { id: string }) => {
    const course = courseMap.get(enrollment.courseId)
    if (!userProfile || !course) return
    setGeneratingId(enrollment.id)
    try {
      await generateCertificate({
        studentId: userProfile.uid,
        studentName: userProfile.fullName,
        courseId: enrollment.courseId,
        courseTitle: course.title,
        enrollmentId: enrollment.id,
        locale: userProfile.preferredLocale,
      })
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <DashboardShell role="student" title="Certificates">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {completed.map((enrollment) => {
          const course = courseMap.get(enrollment.courseId)
          return (
            <Card key={enrollment.id} className="rounded-[1.5rem] p-5">
              <h3 className="text-lg font-bold">{course?.title ?? enrollment.courseId}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Credential: {enrollment.credentialId ?? 'Not issued yet'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {enrollment.certificateUrl ? <a href={enrollment.certificateUrl} target="_blank" rel="noreferrer"><Button size="sm">Open Certificate</Button></a> : null}
                {!enrollment.certificateUrl ? <Button size="sm" variant="outline" onClick={() => void issue(enrollment)} disabled={generatingId === enrollment.id}>{generatingId === enrollment.id ? 'Generating...' : 'Generate Certificate'}</Button> : null}
              </div>
            </Card>
          )
        })}
      </div>
    </DashboardShell>
  )
}
