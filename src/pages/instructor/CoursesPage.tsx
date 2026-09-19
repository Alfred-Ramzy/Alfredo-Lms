import { useQuery } from '@tanstack/react-query'
import { limit, orderBy, where } from 'firebase/firestore'
import { Link } from 'react-router-dom'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { getCollectionDocs } from '@/lib/firebase/firestore'
import type { CourseDoc } from '@/types/firebase'

export default function CoursesPage() {
  const { userProfile } = useAuth()
  const uid = userProfile?.uid ?? ''
  const coursesQuery = useQuery({ queryKey: ['instructor-courses', uid], enabled: Boolean(uid), queryFn: () => getCollectionDocs<CourseDoc>('courses', [where('instructorId', '==', uid), orderBy('createdAt', 'desc'), limit(20)]) })

  return (
    <DashboardShell role="instructor" title="My Courses">
      <div className="mb-4"><Link to="/instructor/courses/new"><Button>Create Course</Button></Link></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(coursesQuery.data ?? []).map((course) => <Card key={course.id} className="rounded-[1.5rem] p-5"><h3 className="text-lg font-bold">{course.title}</h3><p className="mt-2 text-sm text-muted-foreground">{course.status}</p><Link to={`/instructor/courses/${course.id}`} className="mt-4 inline-block text-sm text-primary">Open Builder</Link></Card>)}
      </div>
    </DashboardShell>
  )
}
