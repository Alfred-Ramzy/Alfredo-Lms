import { Clock3, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { COURSE_PREVIEW } from '@/lib/constants'

export function CourseCatalogPreview() {
  const { i18n, t } = useTranslation()

  return (
    <section className="container py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">{t('landing.previewTitle')}</h2>
          <p className="section-copy mt-4">{t('landing.previewCopy')}</p>
        </div>
      </div>

      <div className="mt-10 flex gap-6 overflow-x-auto pb-4">
        {COURSE_PREVIEW.map((course) => (
          <article key={course.id} className="min-w-[280px] flex-1 rounded-[2rem] border border-border bg-card/80 p-5 shadow-soft">
            <div className="h-44 rounded-[1.5rem] bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.35),_transparent_35%),linear-gradient(135deg,#050816,#0d1117)]" />
            <div className="mt-5 flex items-center justify-between">
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{course.level}</span>
              <span className="inline-flex items-center gap-1 text-sm text-amber-500"><Star className="size-4 fill-current" />4.9</span>
            </div>
            <h3 className="mt-4 text-xl font-bold">{i18n.language === 'ar' ? course.titleAr : course.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{course.instructor}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" />{course.duration}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
