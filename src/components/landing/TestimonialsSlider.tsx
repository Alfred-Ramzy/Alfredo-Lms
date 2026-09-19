import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TESTIMONIALS } from '@/lib/constants'
import { useDirection } from '@/hooks/useDirection'

function TestimonialCard({ quote, name, role, isArabic }: { quote: string; name: string; role: string; isArabic: boolean }) {

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm dark:bg-white/5">
      <div>
        <Quote className="size-8 text-primary/60" />
        <p className="mt-4 text-lg leading-8 text-foreground" dir={isArabic ? 'rtl' : 'ltr'}>
          {quote}
        </p>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-bold text-primary">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
        <div className="ms-auto flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
    </div>
  )
}

const EXTRA_TESTIMONIALS = [
  {
    name: 'Youssef Ali',
    role: 'CS Student',
    quote: 'The protected video player and quiz system made studying feel seamless and professional.',
    quoteAr: 'مشغل الفيديو المحمي ونظام الاختبارات جعل الدراسة سلسة واحترافية.',
  },
  {
    name: 'Mona Fathy',
    role: 'Language Instructor',
    quote: 'Building bilingual courses with proper RTL support was incredibly straightforward.',
    quoteAr: 'بناء كورسات ثنائية اللغة مع دعم RTL كان سهلاً جداً.',
  },
]

export function TestimonialsSlider() {
  const { t, i18n } = useTranslation()
  const { isRtl } = useDirection()
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)
  const isArabic = i18n.language === 'ar'

  const allTestimonials = [...TESTIMONIALS, ...EXTRA_TESTIMONIALS]
  const total = allTestimonials.length

  const startAutoPlay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total)
    }, 4500)
  }, [total])

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    startAutoPlay()
    return stopAutoPlay
  }, [startAutoPlay, stopAutoPlay])

  const prev = () => {
    stopAutoPlay()
    setCurrent((c) => (c - 1 + total) % total)
  }
  const next = () => {
    stopAutoPlay()
    setCurrent((c) => (c + 1) % total)
  }

  const item = allTestimonials[current]
  const quote = isArabic ? (item.quoteAr ?? item.quote) : item.quote

  return (
    <section id="testimonials" className="relative bg-card/50 py-24">
      <div className="container relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">{t('landing.testimonialsTitle')}</h2>
        </motion.div>

        <div className="mx-auto mt-12 max-w-3xl">
          <div
            className="relative"
            onMouseEnter={stopAutoPlay}
            onMouseLeave={startAutoPlay}
          >
            <motion.div
              key={current}
              initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TestimonialCard
                quote={quote}
                name={allTestimonials[current].name}
                role={allTestimonials[current].role}
                isArabic={isArabic}
              />
            </motion.div>

            <button
              onClick={isRtl ? next : prev}
              className="absolute start-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full border border-border bg-card p-2 shadow-lg transition hover:bg-accent"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={isRtl ? prev : next}
              className="absolute end-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full border border-border bg-card p-2 shadow-lg transition hover:bg-accent"
              aria-label="Next testimonial"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {allTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); stopAutoPlay() }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 bg-primary' : 'w-2 bg-border'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}