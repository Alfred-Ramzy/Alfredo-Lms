import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addDoc, collection } from 'firebase/firestore'
import { useParams } from 'react-router-dom'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase/config'
import { getDocTyped } from '@/lib/firebase/firestore'
import { awardXp } from '@/lib/gamification'
import { uploadAssignment } from '@/lib/firebase/storage'
import { useAuth } from '@/hooks/useAuth'
import type { AssignmentDoc, SubmissionDoc } from '@/types/firebase'

export default function AssignmentPage() {
  const { assignmentId = '', courseId = '' } = useParams()
  const { userProfile } = useAuth()
  const [textAnswer, setTextAnswer] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const assignmentQuery = useQuery({ queryKey: ['assignment', assignmentId], enabled: Boolean(assignmentId), queryFn: () => getDocTyped<AssignmentDoc>(`assignments/${assignmentId}`) })
  const submissionQuery = useQuery({ queryKey: ['assignment-submission', assignmentId, userProfile?.uid], enabled: Boolean(assignmentId && userProfile?.uid), queryFn: () => getDocTyped<SubmissionDoc>(`submissions/${assignmentId}_${userProfile?.uid}`) })

  const submit = async () => {
    if (!userProfile) return
    const fileUrl = file ? await uploadAssignment(assignmentId, userProfile.uid, file) : undefined
    const submissionRef = await addDoc(collection(db, 'submissions'), {
      assignmentId,
      courseId,
      studentId: userProfile.uid,
      fileUrl,
      fileName: file?.name,
      textAnswer,
      status: 'pending',
      submittedAt: new Date(),
    } satisfies Partial<SubmissionDoc>)
    await awardXp(userProfile.uid, 'assignment_submitted', { sourceDocPath: `submissions/${submissionRef.id}`, sourceField: 'xpAwarded_assignment_submitted' })
  }

  return (
    <DashboardShell role="student" title="Assignment">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <Card className="rounded-[1.75rem] p-6">
          <h2 className="text-2xl font-bold">{assignmentQuery.data?.title}</h2>
          <p className="mt-3 text-muted-foreground">{assignmentQuery.data?.description}</p>
          <div className="mt-6 space-y-4">
            <Input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <Textarea value={textAnswer} onChange={(event) => setTextAnswer(event.target.value)} placeholder="Add submission notes or written answer" />
            <Button onClick={() => void submit()}>Submit Assignment</Button>
          </div>
        </Card>
        <Card className="rounded-[1.75rem] p-6">
          <h3 className="text-xl font-bold">Submission Status</h3>
          <p className="mt-3 text-muted-foreground">{submissionQuery.data?.status ?? 'No submission yet'}</p>
          {submissionQuery.data?.feedback ? <p className="mt-4 rounded-2xl bg-muted/40 p-4">{submissionQuery.data.feedback}</p> : null}
        </Card>
      </div>
    </DashboardShell>
  )
}
