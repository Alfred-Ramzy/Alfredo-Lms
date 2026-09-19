import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { useParams } from 'react-router-dom'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { db } from '@/lib/firebase/config'
import { getDocTyped } from '@/lib/firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { awardXp } from '@/lib/gamification'
import type { QuestionDoc, QuizDoc } from '@/types/firebase'

export default function QuizPage() {
  const { quizId = '', courseId = '' } = useParams()
  const { userProfile } = useAuth()
  const [started, setStarted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)

  const quizQuery = useQuery({ queryKey: ['quiz', quizId], enabled: Boolean(quizId), queryFn: () => getDocTyped<QuizDoc>(`quizzes/${quizId}`) })
  const questionsQuery = useQuery({
    queryKey: ['quiz-questions', quizId],
    enabled: Boolean(quizId),
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, `quizzes/${quizId}/questions`), orderBy('order', 'asc')))
      return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as QuestionDoc) }))
    },
  })

  useEffect(() => {
    if (!started || secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft, started])

  const totalPoints = useMemo(() => (questionsQuery.data ?? []).reduce((sum, item) => sum + item.points, 0), [questionsQuery.data])

  const submit = useCallback(async () => {
    if (!userProfile || !quizQuery.data) return
    const score = (questionsQuery.data ?? []).reduce((sum, item) => {
      const correct = Array.isArray(item.answer) ? item.answer.join('|') : String(item.answer)
      return sum + (String(answers[item.id] ?? '') === correct ? item.points : 0)
    }, 0)
    const percentage = totalPoints ? Math.round((score / totalPoints) * 100) : 0
    const passed = percentage >= quizQuery.data.passingScore
    const attemptRef = await addDoc(collection(db, `quizzes/${quizId}/attempts`), {
      quizId,
      courseId,
      studentId: userProfile.uid,
      score: percentage,
      passed,
      answers,
      startedAt: new Date(),
      submittedAt: new Date(),
    })
    if (passed) await awardXp(userProfile.uid, 'quiz_passed', { sourceDocPath: `quizzes/${quizId}/attempts/${attemptRef.id}`, sourceField: 'xpAwarded_quiz_passed' })
    if (percentage === 100) await awardXp(userProfile.uid, 'quiz_perfect_score', { sourceDocPath: `quizzes/${quizId}/attempts/${attemptRef.id}`, sourceField: 'xpAwarded_quiz_perfect' })
    setResult({ score: percentage, passed })
    setStarted(false)
  }, [answers, courseId, quizId, quizQuery.data, questionsQuery.data, totalPoints, userProfile])

  useEffect(() => {
    if (started && secondsLeft === 0 && quizQuery.data) {
      void submit()
    }
  }, [quizQuery.data, secondsLeft, started, submit])

  return (
    <DashboardShell role="student" title="Quiz">
      {!started && !result ? (
        <Card className="rounded-[1.75rem] p-6">
          <h2 className="text-2xl font-bold">{quizQuery.data?.title}</h2>
          <p className="mt-3 text-muted-foreground">Time limit: {quizQuery.data?.durationMinutes ?? 15} minutes · Pass score: {quizQuery.data?.passingScore ?? 70}%</p>
          <Button className="mt-6" onClick={() => { setStarted(true); setSecondsLeft((quizQuery.data?.durationMinutes ?? 15) * 60) }}>Start Quiz</Button>
        </Card>
      ) : null}
      {started ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
          <Card className="rounded-[1.75rem] p-6">
            {(questionsQuery.data ?? []).map((question, index) => (
              <div key={question.id} className="mb-6 rounded-2xl border border-border p-4">
                <p className="font-semibold">{index + 1}. {question.prompt}</p>
                <div className="mt-3 space-y-2">
                  {(question.options ?? ['True', 'False']).map((option) => (
                    <label key={option} className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={(event) => setAnswers((state) => ({ ...state, [question.id]: event.target.value }))} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={() => void submit()}>Submit Quiz</Button>
          </Card>
          <Card className="rounded-[1.75rem] p-6">
            <p className="text-lg font-bold">Time Left</p>
            <p className="mt-3 text-4xl font-black">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</p>
          </Card>
        </div>
      ) : null}
      {result ? <Card className="rounded-[1.75rem] p-6"><p className="text-4xl font-black">{result.score}%</p><p className="mt-2 text-lg font-semibold">{result.passed ? 'Passed' : 'Try again'}</p></Card> : null}
    </DashboardShell>
  )
}
