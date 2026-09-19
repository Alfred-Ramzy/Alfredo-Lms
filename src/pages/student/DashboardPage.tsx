import { Award, BookOpen, Clock3, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { limit, orderBy, where } from 'firebase/firestore'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { BadgeUnlockOverlay } from '@/components/gamification/BadgeUnlockOverlay'
import { BadgeGrid } from '@/components/gamification/BadgeGrid'
import { LevelProgressCard } from '@/components/gamification/LevelProgressCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { getCollectionDocs, getCoursesByIds } from '@/lib/firebase/firestore'
import { usePlatformSettings } from '@/hooks/usePlatformSettings'
import type { AssignmentDoc, CourseDoc, EnrollmentDoc, NotificationDoc, QuizDoc } from '@/types/firebase'

export default function DashboardPage() {
  usePlatformSettings()
  const { userProfile } = useAuth()
  const uid = userProfile?.uid ?? ''

  const enrollmentsQuery = useQuery({
    queryKey: ['student-dashboard-enrollments', uid],
    enabled: Boolean(uid),
    queryFn: () => getCollectionDocs<EnrollmentDoc>('enrollments', [where('studentId', '==', uid), where('status', '==', 'active'), orderBy('lastAccessedAt', 'desc'), limit(6)]),
  })

  const notificationsQuery = useQuery({
    queryKey: ['student-dashboard-notifications', uid],
    enabled: Boolean(uid),
    queryFn: () => getCollectionDocs<NotificationDoc>('notifications', [where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(10)]),
  })

  const coursesQuery = useQuery({
    queryKey: ['student-dashboard-courses', enrollmentsQuery.data?.map((item) => item.courseId).join('|')],
    enabled: Boolean(enrollmentsQuery.data?.length),
    queryFn: () => getCoursesByIds(enrollmentsQuery.data?.map((item) => item.courseId) ?? []),
  })

  const recommendedQuery = useQuery({
    queryKey: ['student-dashboard-recommended', uid],
    enabled: Boolean(uid),
    queryFn: () => getCollectionDocs<CourseDoc>('courses', [where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(6)]),
  })

  const deadlinesQuery = useQuery({
    queryKey: ['student-dashboard-deadlines', enrollmentsQuery.data?.map((item) => item.courseId).join('|')],
    enabled: Boolean(enrollmentsQuery.data?.length),
    queryFn: async () => {
      const ids = enrollmentsQuery.data?.map((item) => item.courseId).slice(0, 3) ?? []
      const [assignments, quizzes] = await Promise.all([
        Promise.all(ids.map((courseId) => getCollectionDocs<AssignmentDoc>('assignments', [where('courseId', '==', courseId), orderBy('createdAt', 'desc'), limit(2)]))).then((items) => items.flat()),
        Promise.all(ids.map((courseId) => getCollectionDocs<QuizDoc>('quizzes', [where('courseId', '==', courseId), orderBy('createdAt', 'desc'), limit(2)]))).then((items) => items.flat()),
      ])
      return { assignments, quizzes }
    },
  })

  const continueCards = useMemo(() => {
    const enrollmentMap = new Map((enrollmentsQuery.data ?? []).map((item) => [item.courseId, item]))
    return (coursesQuery.data ?? []).slice(0, 3).map((course) => ({ course, enrollment: enrollmentMap.get(course.id) }))
  }, [coursesQuery.data, enrollmentsQuery.data])

  const completedCount = (enrollmentsQuery.data ?? []).filter((item) => item.progressPercent >= 100).length
  const dueAssignments = deadlinesQuery.data?.assignments.length ?? 0
  const recommended = (recommendedQuery.data ?? []).filter((course) => !(enrollmentsQuery.data ?? []).some((enrollment) => enrollment.courseId === course.id)).slice(0, 6)
  const xpLevel = Math.max(1, Math.floor((userProfile?.xpPoints ?? 0) / 100) + 1)
  const nextLevelProgress = (userProfile?.xpPoints ?? 0) % 100

  return (
    <DashboardShell role="student" title="Student Dashboard">
      <BadgeUnlockOverlay badgeKey={null} open={false} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <Card className="rounded-[1.75rem] bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back</p>
                <h2 className="mt-2 text-3xl font-black">{userProfile?.fullName}</h2>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>Streak: {userProfile?.streakCount ?? 0} days</span>
                  <span>XP Level: {xpLevel}</span>
                </div>
              </div>
              <div className="w-full max-w-xs">
                <div className="mb-2 flex items-center justify-between text-sm"><span>Next level</span><span>{nextLevelProgress}%</span></div>
                <div className="h-3 rounded-full bg-muted"><div className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${nextLevelProgress}%` }} /></div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'In Progress', value: enrollmentsQuery.data?.length ?? 0, icon: BookOpen },
              { label: 'Completed', value: completedCount, icon: Trophy },
              { label: 'Certificates', value: (enrollmentsQuery.data ?? []).filter((item) => item.certificateIssued).length, icon: Award },
              { label: 'Assignments Due', value: dueAssignments, icon: Clock3 },
            ].map((item) => (
              <Card key={item.label} className="rounded-[1.5rem] p-5">
                <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{item.label}</p><item.icon className="size-5 text-primary" /></div>
                <p className="mt-4 text-3xl font-black">{item.value}</p>
              </Card>
            ))}
          </div>

          <section>
            <SectionHeader title="Continue Learning" copy="Your 3 most recent active enrollments." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {continueCards.length === 0 ? <EmptyState title="No active courses" copy="Once you enroll, your latest lessons appear here." /> : continueCards.map(({ course, enrollment }) => (
                <Card key={course.id} className="rounded-[1.5rem] p-5">
                  <Badge>{course.level}</Badge>
                  <h3 className="mt-4 text-lg font-bold">{course.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{course.instructorName ?? 'Instructor'}</p>
                  <div className="mt-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${enrollment?.progressPercent ?? 0}%` }} /></div>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/student/courses/${course.id}`}><Button size="sm">Open Course</Button></Link>
                    <Link to={`/student/courses/${course.id}/learn/${enrollment?.lastLessonId ?? 'intro'}`}><Button size="sm" variant="outline">Resume</Button></Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Upcoming Deadlines" copy="Limited per-course queries keep reads under control." />
            <Card className="rounded-[1.5rem] p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {(deadlinesQuery.data?.assignments ?? []).map((assignment) => <div key={assignment.id} className="rounded-2xl bg-muted/40 p-4"><p className="font-semibold">{assignment.title}</p><p className="mt-1 text-sm text-muted-foreground">Assignment</p></div>)}
                {(deadlinesQuery.data?.quizzes ?? []).map((quiz) => <div key={quiz.id} className="rounded-2xl bg-muted/40 p-4"><p className="font-semibold">{quiz.title}</p><p className="mt-1 text-sm text-muted-foreground">Quiz</p></div>)}
              </div>
            </Card>
          </section>

          <LevelProgressCard xp={userProfile?.xpPoints ?? 0} />
        </div>

        <div className="space-y-6">
          <section>
            <SectionHeader title="Recent Activity" />
            <Card className="rounded-[1.5rem] p-4">
              <div className="space-y-3">
                {(notificationsQuery.data ?? []).map((item) => <div key={item.id} className="rounded-2xl border border-border p-3"><p className="font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.body}</p></div>)}
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader title="Achievements" />
            <Card className="rounded-[1.5rem] p-5">
              {(userProfile?.badges ?? []).length ? <BadgeGrid badges={userProfile?.badges ?? []} /> : <p className="text-sm text-muted-foreground">No badges yet. Finish lessons and quizzes to earn them.</p>}
            </Card>
          </section>

          <section>
            <SectionHeader title="Recommended Courses" />
            <div className="space-y-3">
              {recommended.map((course) => (
                <Card key={course.id} className="rounded-[1.5rem] p-4">
                  <p className="font-semibold">{course.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{course.categoryName ?? 'General'}</p>
                  <Link to={`/student/courses/${course.id}`} className="mt-3 inline-block text-sm text-primary">View details</Link>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
