import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock3, PlayCircle, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { COURSE_PREVIEW } from '@/lib/constants'
import { useDirection } from '@/hooks/useDirection'

function CourseCard({ course, index }: { course: typeof COURSE_PREVIEW[0]; index: number }) {
  const { i18n } = useTranslation()
  const title = i18n.language === 'ar' ? course.titleAr : course.title

  return (
    <motion.div
      className="group relative min-w-[300px] max-w-[340px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-white/10 dark:bg-white/5"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className="relative h-44 overflow-hidden rounded-t-2xl bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.4),transparent_40%),linear-gradient(135deg,#0a0e1a,#111827)]">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg">
            <PlayCircle className="size-7" />
          </div>
        </div>
        <div className="absolute start-3 top-3">
          <span className="rounded-full bg-secondary/90 px-3 py-1 text-xs font-semibold text-white">
            {course.level}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-amber-400">
            <Star className="size-4 fill-current" />
            <span className="font-semibold">4.9</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock3 className="size-4" />
            {course.duration}
          </div>
        </div>

        <h3 className="mt-3 text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{course.instructor}</p>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            whileInView={{ width: `${60 + (index * 13) % 30}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export function InteractiveCourseShowcase() {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isRtl } = useDirection()
  const [canScrollStart, setCanScrollStart] = useState(true)
  const [canScrollEnd, setCanScrollEnd] = useState(false)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    if (isRtl) {
      setCanScrollStart(el.scrollLeft < -10)
      setCanScrollEnd(el.scrollLeft > -(el.scrollWidth - el.clientWidth - 10))
    } else {
      setCanScrollStart(el.scrollLeft > 10)
      setCanScrollEnd(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    }
  }

  const scroll = (direction: 'start' | 'end') => {
    const el = scrollRef.current
    if (!el) return
    const amount = 360
    el.scrollBy({ behavior: 'smooth', left: direction === 'end' ? (isRtl ? -amount : amount) : (isRtl ? amount : -amount) })
  }

  return (
    <section id="courses" className="relative py-24">
      <div className="container relative z-10">
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="section-title">{t('landing.previewTitle')}</h2>
            <p className="section-copy mt-4">{t('landing.previewCopy')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('start')}
              className="flex size-10 items-center justify-center rounded-xl border border-border bg-card transition hover:bg-accent disabled:opacity-40"
              disabled={isRtl ? canScrollEnd : canScrollStart ? false : true}
              aria-label="Scroll courses left"
            >
              ◀
            </button>
            <button
              onClick={() => scroll('end')}
              className="flex size-10 items-center justify-center rounded-xl border border-border bg-card transition hover:bg-accent disabled:opacity-40"
              disabled={isRtl ? canScrollStart : canScrollEnd}
              aria-label="Scroll courses right"
            >
              ▶
            </button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="mt-10 flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {COURSE_PREVIEW.map((course, i) => (
            <div key={course.id} style={{ scrollSnapAlign: 'start' }}>
              <CourseCard course={course} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}