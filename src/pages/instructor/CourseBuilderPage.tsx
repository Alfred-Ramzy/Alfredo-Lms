import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { useParams } from 'react-router-dom'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase/config'
import { getDocTyped, setDocTyped } from '@/lib/firebase/firestore'
import { uploadCourseThumbnail } from '@/lib/storage/provider'
import { useAuth } from '@/hooks/useAuth'
import { buildSearchKeywords } from '@/lib/utils'
import type { AssignmentDoc, CourseDoc, EnrollmentDoc, LessonDoc, QuizDoc, SubmissionDoc } from '@/types/firebase'

const tabs = ['details', 'curriculum', 'quizzes', 'assignments', 'students', 'analytics'] as const

export default function CourseBuilderPage() {
  const { courseId = 'new' } = useParams()
  const { userProfile } = useAuth()
  const [tab, setTab] = useState<(typeof tabs)[number]>('details')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonVideoUrl, setLessonVideoUrl] = useState('')
  const [quizTitle, setQuizTitle] = useState('')
  const [assignmentTitle, setAssignmentTitle] = useState('')

  const courseQuery = useQuery({ queryKey: ['course-builder-course', courseId], enabled: courseId !== 'new', queryFn: () => getDocTyped<CourseDoc>(`courses/${courseId}`) })
  const lessonsQuery = useQuery({ queryKey: ['course-builder-lessons', courseId], enabled: courseId !== 'new', queryFn: async () => { const snapshot = await getDocs(query(collection(db, 'lessons'), where('courseId', '==', courseId), orderBy('order', 'asc'))); return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as LessonDoc) })) } })
  const quizzesQuery = useQuery({ queryKey: ['course-builder-quizzes', courseId], enabled: courseId !== 'new', queryFn: async () => { const snapshot = await getDocs(query(collection(db, 'quizzes'), where('courseId', '==', courseId), orderBy('createdAt', 'desc'))); return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as QuizDoc) })) } })
  const assignmentsQuery = useQuery({ queryKey: ['course-builder-assignments', courseId], enabled: courseId !== 'new', queryFn: async () => { const snapshot = await getDocs(query(collection(db, 'assignments'), where('courseId', '==', courseId), orderBy('createdAt', 'desc'))); return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as AssignmentDoc) })) } })
  const studentsQuery = useQuery({ queryKey: ['course-builder-students', courseId], enabled: courseId !== 'new', queryFn: async () => { const snapshot = await getDocs(query(collection(db, 'enrollments'), where('courseId', '==', courseId), orderBy('enrolledAt', 'desc'))); return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as EnrollmentDoc) })) } })
  const submissionsQuery = useQuery({ queryKey: ['course-builder-submissions', courseId], enabled: courseId !== 'new', queryFn: async () => { const snapshot = await getDocs(query(collection(db, 'submissions'), where('courseId', '==', courseId), orderBy('submittedAt', 'desc'))); return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as SubmissionDoc) })) } })

  const saveDetails = async () => {
    const resolvedId = courseId === 'new' ? doc(collection(db, 'courses')).id : courseId
    const uploadedThumbnailUrl = thumbnailFile ? await uploadCourseThumbnail(resolvedId, thumbnailFile) : thumbnailUrl
    await setDocTyped<Partial<CourseDoc>>(`courses/${resolvedId}`, {
      instructorId: userProfile?.uid ?? '',
      instructorName: userProfile?.fullName ?? 'Instructor',
      title,
      description,
      thumbnailUrl: uploadedThumbnailUrl,
      price: Number(price),
      currency: 'EGP',
      status: 'draft',
      level: 'beginner',
      language: 'both',
      durationMinutes: 0,
      lessonsCount: 0,
      studentsCount: 0,
      rating: 0,
      ratingsCount: 0,
      isFeatured: false,
      certificateEnabled: true,
      maxDevices: 2,
      watchAttempts: 5,
      requiresActivation: false,
      searchKeywords: buildSearchKeywords(title, description),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const addLesson = async () => {
    await addDoc(collection(db, 'lessons'), { courseId, sectionId: 'default', title: lessonTitle, type: 'video', videoUrl: lessonVideoUrl, order: (lessonsQuery.data?.length ?? 0) + 1, durationMinutes: 10, isPreview: false, createdAt: new Date(), updatedAt: new Date() } satisfies Partial<LessonDoc>)
  }
  const addQuiz = async () => {
    const quizRef = await addDoc(collection(db, 'quizzes'), { courseId, title: quizTitle, passingScore: 70, randomizeQuestions: false, attemptsAllowed: 1, published: true, createdAt: new Date(), updatedAt: new Date() } satisfies Partial<QuizDoc>)
    await addDoc(collection(db, `quizzes/${quizRef.id}/questions`), { quizId: quizRef.id, prompt: 'Sample question', type: 'single', options: ['A', 'B', 'C', 'D'], answer: 'A', points: 1, order: 1 })
  }
  const addAssignment = async () => {
    await addDoc(collection(db, 'assignments'), { courseId, title: assignmentTitle, description: 'Assignment details', points: 10, published: true, createdAt: new Date(), updatedAt: new Date() } satisfies Partial<AssignmentDoc>)
  }
  const gradeSubmission = async (id: string, score: number) => {
    await updateDoc(doc(db, 'submissions', id), { score, feedback: 'Reviewed by instructor.', status: 'graded', gradedAt: new Date() })
  }
  const removeLesson = async (id: string) => deleteDoc(doc(db, 'lessons', id))

  return (
    <DashboardShell role="instructor" title="Course Builder">
      <div className="mb-6 flex flex-wrap gap-2">{tabs.map((item) => <Button key={item} size="sm" variant={tab === item ? 'default' : 'outline'} onClick={() => setTab(item)}>{item}</Button>)}</div>
      {tab === 'details' ? <Card className="rounded-[1.5rem] p-6"><div className="grid gap-4 md:grid-cols-2"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={courseQuery.data?.title ?? 'Title'} /><Input value={price} onChange={(event) => setPrice(event.target.value)} placeholder={String(courseQuery.data?.price ?? 0)} /><Input value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} placeholder={courseQuery.data?.thumbnailUrl ?? 'Thumbnail URL (optional)'} /><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} /><Textarea className="md:col-span-2" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={courseQuery.data?.description ?? 'Description'} /></div><Button className="mt-4" onClick={() => void saveDetails()}>Save Details</Button></Card> : null}
      {tab === 'curriculum' ? <Card className="rounded-[1.5rem] p-6"><div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><Input value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} placeholder="New lesson title" /><Input value={lessonVideoUrl} onChange={(event) => setLessonVideoUrl(event.target.value)} placeholder="External video URL" /><Button onClick={() => void addLesson()}>Add Lesson</Button></div><div className="mt-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">File uploads are currently disabled in Spark mode. Use external video URLs only.</div><div className="mt-6 space-y-3">{(lessonsQuery.data ?? []).map((lesson) => <div key={lesson.id} className="flex items-center justify-between rounded-2xl border border-border p-4"><div><span>{lesson.title}</span><p className="mt-1 text-sm text-muted-foreground">{lesson.videoUrl ? 'External video URL saved' : 'No video URL set'}</p></div><Button size="sm" variant="outline" onClick={() => void removeLesson(lesson.id)}>Delete</Button></div>)}</div></Card> : null}
      {tab === 'quizzes' ? <Card className="rounded-[1.5rem] p-6"><div className="flex gap-3"><Input value={quizTitle} onChange={(event) => setQuizTitle(event.target.value)} placeholder="New quiz title" /><Button onClick={() => void addQuiz()}>Add Quiz</Button></div><div className="mt-6 space-y-3">{(quizzesQuery.data ?? []).map((quiz) => <div key={quiz.id} className="rounded-2xl border border-border p-4"><p className="font-semibold">{quiz.title}</p><p className="text-sm text-muted-foreground">Pass score: {quiz.passingScore}%</p></div>)}</div></Card> : null}
      {tab === 'assignments' ? <Card className="rounded-[1.5rem] p-6"><div className="flex gap-3"><Input value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} placeholder="New assignment title" /><Button onClick={() => void addAssignment()}>Add Assignment</Button></div><div className="mt-6 space-y-3">{(assignmentsQuery.data ?? []).map((assignment) => <div key={assignment.id} className="rounded-2xl border border-border p-4"><p className="font-semibold">{assignment.title}</p></div>)}</div></Card> : null}
      {tab === 'students' ? <Card className="rounded-[1.5rem] p-6"><div className="space-y-3">{(studentsQuery.data ?? []).map((student) => <div key={student.id} className="rounded-2xl border border-border p-4"><p className="font-semibold">{student.studentId}</p><p className="text-sm text-muted-foreground">Progress: {student.progressPercent}%</p></div>)}</div></Card> : null}
      {tab === 'analytics' ? <Card className="rounded-[1.5rem] p-6"><p className="mb-4 text-lg font-bold">Pending grading</p><div className="space-y-3">{(submissionsQuery.data ?? []).map((submission) => <div key={submission.id} className="flex items-center justify-between rounded-2xl border border-border p-4"><div><p className="font-semibold">{submission.studentId}</p><p className="text-sm text-muted-foreground">{submission.status ?? 'pending'}</p></div><Button size="sm" onClick={() => void gradeSubmission(submission.id, 90)}>Grade 90</Button></div>)}</div></Card> : null}
    </DashboardShell>
  )
}
