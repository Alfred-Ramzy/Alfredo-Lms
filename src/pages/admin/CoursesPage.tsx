import { useQuery } from '@tanstack/react-query'
import { limit, orderBy } from 'firebase/firestore'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getCollectionDocs, updateDocTyped } from '@/lib/firebase/firestore'
import type { CourseDoc } from '@/types/firebase'

export default function CoursesPage() {
  const coursesQuery = useQuery({ queryKey: ['admin-courses'], queryFn: () => getCollectionDocs<CourseDoc>('courses', [orderBy('createdAt', 'desc'), limit(50)]) })

  return (
    <DashboardShell role="admin" title="Courses">
      <div className="space-y-3">{(coursesQuery.data ?? []).map((course) => <Card key={course.id} className="rounded-[1.5rem] p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold">{course.title}</p><p className="text-sm text-muted-foreground">{course.status}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => void updateDocTyped<Partial<CourseDoc>>(`courses/${course.id}`, { isFeatured: !course.isFeatured })}>{course.isFeatured ? 'Unfeature' : 'Feature'}</Button><Button size="sm" variant="outline" onClick={() => void updateDocTyped<Partial<CourseDoc>>(`courses/${course.id}`, { status: course.status === 'published' ? 'archived' : 'published' })}>{course.status === 'published' ? 'Archive' : 'Publish'}</Button></div></div></Card>)}</div>
    </DashboardShell>
  )
}
