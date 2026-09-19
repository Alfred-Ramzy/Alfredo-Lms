import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { PageSkeleton } from '@/components/common/PageSkeleton'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useAuth } from '@/hooks/useAuth'

const SecureVideoPlayer = lazy(() => import('@/components/student/SecureVideoPlayer').then((module) => ({ default: module.SecureVideoPlayer })))

export default function PlayerPage() {
  const { courseId = '', lessonId = '' } = useParams()
  const { userProfile } = useAuth()

  return (
    <DashboardShell role="student" title="Course Player">
      <Suspense fallback={<PageSkeleton />}>
        {userProfile ? <SecureVideoPlayer courseId={courseId} lessonId={lessonId} uid={userProfile.uid} user={userProfile} /> : null}
      </Suspense>
    </DashboardShell>
  )
}
