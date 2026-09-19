import { Pause, Play } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'

import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase/config'
import { getDocTyped, safeBatchCommit } from '@/lib/firebase/firestore'
import { awardXp } from '@/lib/gamification'
import type { CourseDoc, EnrollmentDoc, LessonDoc, LessonProgressDoc, StudentDeviceDoc, UserDoc } from '@/types/firebase'

function getFingerprint() {
  return btoa([navigator.userAgent, navigator.language, screen.width, screen.height, Intl.DateTimeFormat().resolvedOptions().timeZone].join('|')).slice(0, 48)
}

export function SecureVideoPlayer({ courseId, lessonId, uid, user }: { courseId: string; lessonId: string; uid: string; user: UserDoc }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [course, setCourse] = useState<(CourseDoc & { id: string }) | null>(null)
  const [enrollment, setEnrollment] = useState<(EnrollmentDoc & { id: string }) | null>(null)
  const [lesson, setLesson] = useState<(LessonDoc & { id: string }) | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [watermarkSeed, setWatermarkSeed] = useState(() => Date.now())

  useEffect(() => {
    const load = async () => {
      const [courseDoc, enrollmentDoc] = await Promise.all([
        getDocTyped<CourseDoc>(`courses/${courseId}`),
        getDocTyped<EnrollmentDoc>(`enrollments/${uid}_${courseId}`),
      ])
      setCourse(courseDoc)
      setEnrollment(enrollmentDoc)

      if (!enrollmentDoc || enrollmentDoc.status !== 'active') {
        setError('You must be enrolled to watch this lesson.')
        return
      }
      if (courseDoc && courseDoc.watchAttempts <= 0) {
        setError('Watch attempts are unavailable for this course.')
        return
      }

      const lessonDoc = await getDocTyped<LessonDoc>(`lessons/${lessonId}`).catch(() => null)
      setLesson(lessonDoc)
    }
    void load()
  }, [courseId, lessonId, uid])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause()
      }
    }
    const onContext = (event: MouseEvent) => event.preventDefault()
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === 'F12'
        || (event.ctrlKey && ['u', 's'].includes(event.key.toLowerCase()))
        || (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i')
      ) {
        event.preventDefault()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('contextmenu', onContext)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    const syncDevice = async () => {
      if (!course || !enrollment) return
      const fingerprint = getFingerprint()
      const snapshot = await getDoc(doc(db, 'studentDevices', `${uid}_${courseId}_${fingerprint}`))
      if (!snapshot.exists()) {
        const existing = await getDocTyped<StudentDeviceDoc>(`studentDevices/${uid}_${courseId}_${fingerprint}`)
        if (!existing) {
          await safeBatchCommit((batch) => {
            batch.set(doc(db, 'studentDevices', `${uid}_${courseId}_${fingerprint}`), {
              studentId: uid,
              courseId,
              label: `${navigator.platform} ${screen.width}x${screen.height}`,
              fingerprint,
              isTrusted: true,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
              lastSeenAt: new Date(),
            })
          })
        }
      }
    }
    void syncDevice()
  }, [course, courseId, enrollment, uid])

  useEffect(() => {
    if (!videoRef.current) return
    const intervalId = window.setInterval(async () => {
      const currentTime = videoRef.current?.currentTime ?? 0
      if (currentTime <= 0) return
      await safeBatchCommit((batch) => {
        batch.set(doc(db, 'lessonProgress', `${uid}_${lessonId}`), {
          courseId,
          lessonId,
          studentId: uid,
          completed: false,
          watchedSeconds: currentTime,
          updatedAt: new Date(),
          lastViewedAt: new Date(),
        } satisfies Partial<LessonProgressDoc>)
        batch.update(doc(db, 'enrollments', `${uid}_${courseId}`), { lastAccessedAt: new Date(), lastLessonId: lessonId })
      })
    }, 30000)
    return () => window.clearInterval(intervalId)
  }, [courseId, lessonId, uid])

  const watermark = useMemo(() => `${user.fullName} · ${user.uid.slice(0, 6)} · ${new Date(watermarkSeed).toLocaleTimeString()}`, [user.fullName, user.uid, watermarkSeed])

  useEffect(() => {
    const intervalId = window.setInterval(() => setWatermarkSeed(Date.now()), 15000)
    return () => window.clearInterval(intervalId)
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  const handleTimeUpdate = async () => {
    const video = videoRef.current
    if (!video || !course) return
    const progress = video.duration > 0 ? video.currentTime / video.duration : 0
    if (progress >= 0.95) {
      await safeBatchCommit((batch) => {
        batch.set(doc(db, 'lessonProgress', `${uid}_${lessonId}`), {
          courseId,
          lessonId,
          studentId: uid,
          completed: true,
          watchedSeconds: video.currentTime,
          updatedAt: new Date(),
          lastViewedAt: new Date(),
        })
      })
      await awardXp(uid, 'lesson_completed', { sourceDocPath: `lessonProgress/${uid}_${lessonId}`, sourceField: 'xpAwarded_lesson_completed' })
    }
  }

  if (error) {
    return <div className="rounded-3xl border border-danger/30 bg-danger/10 p-6 text-danger">{error}</div>
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
      <div className="rounded-[1.75rem] border border-border bg-card p-4 shadow-soft">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-950">
          <video
            ref={videoRef}
            className="aspect-video w-full"
            // In a client-only app, any loaded video URL may be inspectable in DevTools.
            // For true private delivery, use signed URLs or a private video provider later.
            src={lesson?.videoUrl ?? 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'}
            controls={false}
            controlsList="nodownload noplaybackrate"
            onTimeUpdate={() => void handleTimeUpdate()}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-4 text-xs text-white/50">
            <span>{watermark}</span>
            <span>{course?.title}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={togglePlayback}>{playing ? <Pause className="size-4" /> : <Play className="size-4" />}{playing ? 'Pause' : 'Play'}</Button>
          <p className="text-sm text-muted-foreground">Right click and common inspect/save shortcuts are blocked client-side as a deterrent only.</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft">
          <h3 className="font-bold">Course Curriculum</h3>
          <p className="mt-2 text-sm text-muted-foreground">Current lesson: {lesson?.title ?? lessonId}</p>
          <Link to="/student/my-learning" className="mt-4 inline-block text-sm text-primary">Back to My Learning</Link>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft">
          <h3 className="font-bold">Notes</h3>
          <textarea className="mt-3 min-h-28 w-full rounded-2xl border border-border bg-background p-3 text-sm" placeholder="Write notes for this lesson..." />
        </div>
        <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft">
          <h3 className="font-bold">Discussion</h3>
          <p className="mt-2 text-sm text-muted-foreground">Discussion thread wiring uses Firestore documents and can be expanded per course in later iterations.</p>
        </div>
      </div>
    </div>
  )
}
