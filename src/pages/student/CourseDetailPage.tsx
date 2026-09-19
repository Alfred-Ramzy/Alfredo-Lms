import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Calendar, CheckCircle2, Clock, Globe, Layers, User } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getDocTyped } from '@/lib/firebase/firestore'
import { formatMoney } from '@/lib/utils'
import { usePlatformStore } from '@/stores/platformStore'
import type { CourseDoc } from '@/types/firebase'

export default function CourseDetailPage() {
  const { courseId = '' } = useParams()
  const displayCurrency = usePlatformStore((state) => state.displayCurrency)

  const courseQuery = useQuery({
    queryKey: ['course-detail', courseId],
    enabled: Boolean(courseId),
    queryFn: () => getDocTyped<CourseDoc>(`courses/${courseId}`),
  })

  const course = courseQuery.data
  const isPkg = course?.isPackage || courseId === 'first-month-package'

  const packageLessons = [
    { title: 'Lesson 1: Foundations', titleAr: 'الحصة 1: أساسيات البرمجة والذكاء الاصطناعي', price: 120 },
    { title: 'Lesson 2: Practice', titleAr: 'الحصة 2: التطبيق والممارسة البرمجية', price: 120 },
    { title: 'Lesson 3: Projects', titleAr: 'الحصة 3: بناء المشاريع الحقيقية', price: 120 },
    { title: 'Lesson 4: AI Tools', titleAr: 'الحصة 4: أدوات ونماذج الذكاء الاصطناعي', price: 120 },
  ]

  return (
    <DashboardShell role="student" title={course?.titleAr ?? course?.title ?? 'تفاصيل الحصة'}>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Main Content */}
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[2rem] border border-border/80 bg-card p-6 shadow-soft">
            {/* Header Poster Image */}
            {course?.thumbnailUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-md">
                <img src={course.thumbnailUrl} alt={course.title} className="size-full object-cover" />
                {isPkg ? (
                  <div className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-1 text-xs font-black text-black shadow-lg">
                    🎁 باكدج الشهر الأول شامل الـ 4 حصص
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary border border-primary/20">{course?.level ?? 'beginner'}</Badge>
              {isPkg ? (
                <span className="rounded-full bg-amber-500/15 px-3 py-0.5 text-xs font-bold text-amber-500 border border-amber-500/30">
                  وفر أكثر (Save More) - 4 حصص
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-black text-foreground">
              {course?.titleAr ?? course?.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {course?.descriptionAr ?? course?.description}
            </p>

            {/* Live Schedule Banner */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500 shrink-0">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold">ميعاد البث المباشر (Live Session)</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {course?.liveScheduleAr ?? course?.liveSchedule ?? 'كل يوم أربعاء الساعة 6:00 مساءً'} (بداية من الأربعاء 23 سبتمبر 2026)
                </p>
              </div>
            </div>

            {/* Meta Tags */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4 text-primary" />
                المحاضر: {course?.instructorName ?? 'Engineer Alfredo'}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="size-4 text-primary" />
                اللغة: عربي وإنجليزي (Bilingual)
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                المدة: {course?.durationMinutes ?? 120} دقيقة
              </span>
            </div>
          </Card>

          {/* If Package, list the 4 lessons included */}
          {isPkg ? (
            <Card className="rounded-[2rem] border border-border/80 bg-card p-6 shadow-soft">
              <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                <Layers className="size-5 text-amber-500" />
                <span>الحصص المتضمنة في هذا الباكدج (4 حصص)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                باشتراكك في هذا الباكدج، يتم فتح الحصص الأربعة كاملة فوراً مع حضور حصص اللايف الأسبوعية:
              </p>

              <div className="mt-4 space-y-3">
                {packageLessons.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 p-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.titleAr}</p>
                        <p className="text-xs text-muted-foreground">{item.title}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">
                      سعرها منفردة: {formatMoney(item.price, displayCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        {/* Sidebar / Checkout Card */}
        <div className="space-y-6">
          <Card className="sticky top-6 rounded-[2rem] border border-border/80 bg-card p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">سعر الاشتراك</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl font-black text-foreground">
                {formatMoney(course?.discountPrice ?? course?.price ?? 0, displayCurrency)}
              </span>
              {course?.discountPrice ? (
                <span className="text-sm line-through text-muted-foreground">
                  {formatMoney(course.price, displayCurrency)}
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-3">
              <Link to={`/student/courses/${courseId}/checkout`} className="block w-full">
                <Button className="w-full h-12 rounded-2xl text-base font-bold shadow-glow">
                  <ArrowRight className="size-4 mr-1" />
                  الاشتراك والدفع الآن
                </Button>
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                تفعيل فوري عبر فودافون كاش، إنستاباي، أو كود التفعيل
              </p>
            </div>

            <div className="mt-6 border-t border-border pt-4 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>حضور البث المباشر كل أربعاء الساعة 6 مساءً</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>إمكانية مشاهدة التسجيل والتمارين في أي وقت</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>شهادة إتمام معتمدة بعد إنهاء المهام</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
