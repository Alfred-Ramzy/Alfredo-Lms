import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderBy, where } from 'firebase/firestore'
import { Link } from 'react-router-dom'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { getCollectionDocs, getCoursesByIds } from '@/lib/firebase/firestore'
import type { EnrollmentDoc } from '@/types/firebase'

const tabs = ['in-progress', 'completed', 'expired', 'bookmarked'] as const

export default function MyLearningPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('in-progress')
  const { userProfile } = useAuth()
  const uid = userProfile?.uid ?? ''

  const enrollmentsQuery = useQuery({
    queryKey: ['my-learning-enrollments', uid],
    enabled: Boolean(uid),
    queryFn: () => getCollectionDocs<EnrollmentDoc>('enrollments', [where('studentId', '==', uid), orderBy('lastAccessedAt', 'desc')]),
  })

  const coursesQuery = useQuery({
    queryKey: ['my-learning-courses', enrollmentsQuery.data?.map((item) => item.courseId).join('|')],
    enabled: Boolean(enrollmentsQuery.data?.length),
    queryFn: () => getCoursesByIds(enrollmentsQuery.data?.map((item) => item.courseId) ?? []),
  })

  const cards = useMemo(() => {
    const courseMap = new Map((coursesQuery.data ?? []).map((item) => [item.id, item]))
    return (enrollmentsQuery.data ?? [])
      .filter((item) => {
        if (tab === 'in-progress') return item.progressPercent < 100 && item.status === 'active'
        if (tab === 'completed') return item.progressPercent >= 100 || item.status === 'completed'
        if (tab === 'expired') return item.status !== 'active'
        return Boolean(item.bookmarked)
      })
      .map((enrollment) => ({ enrollment, course: courseMap.get(enrollment.courseId) }))
  }, [coursesQuery.data, enrollmentsQuery.data, tab])

  return (
    <DashboardShell role="student" title="My Learning">
      <div className="mb-6 flex flex-wrap gap-2">{tabs.map((item) => <Button key={item} size="sm" variant={tab === item ? 'default' : 'outline'} onClick={() => setTab(item)}>{item}</Button>)}</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ enrollment, course }) => (
          <Card key={enrollment.id} className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-4 shadow-soft">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 border border-border/60">
              {course?.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="size-full object-cover" />
              ) : (
                <div className="size-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-muted-foreground">Alfredo LMS</div>
              )}
              <div className="absolute bottom-2 left-2 rounded-lg bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                🔴 لايف: {course?.liveScheduleAr ?? 'كل أربعاء 6:00 م'}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge className="bg-primary/10 text-primary">{course?.level ?? 'course'}</Badge>
              {enrollment.certificateIssued ? <Badge className="bg-success/10 text-success">Certificate</Badge> : null}
            </div>
            <h3 className="mt-2 text-base font-bold text-foreground">{course?.titleAr ?? course?.title ?? enrollment.courseId}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{course?.instructorName ?? 'Engineer Alfredo'}</p>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${enrollment.progressPercent}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/student/courses/${enrollment.courseId}/learn/${enrollment.lastLessonId ?? 'intro'}`}>
                <Button size="sm" className="rounded-xl font-bold">دخول الحصة</Button>
              </Link>
              <Link to={`/student/courses/${enrollment.courseId}`}>
                <Button size="sm" variant="outline" className="rounded-xl">التفاصيل</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  )
}
