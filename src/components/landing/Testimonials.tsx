import { useEffect, useState } from 'react'
import { Quote } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TESTIMONIALS } from '@/lib/constants'

export function Testimonials() {
  const { i18n, t } = useTranslation()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => setIndex((current) => (current + 1) % TESTIMONIALS.length), 3500)
    return () => window.clearInterval(intervalId)
  }, [])

  const item = TESTIMONIALS[index]

  return (
    <section id="testimonials" className="bg-card/50 py-24">
      <div className="container">
        <h2 className="section-title">{t('landing.testimonialsTitle')}</h2>
        <div className="mt-10 rounded-[2rem] border border-border bg-card/80 p-8 shadow-soft">
          <Quote className="size-10 text-primary" />
          <p className="mt-6 text-2xl font-semibold leading-10">{i18n.language === 'ar' ? item.quoteAr : item.quote}</p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.role}</p>
            </div>
            <div className="flex gap-2">{TESTIMONIALS.map((entry, dotIndex) => <span key={entry.name} className={`h-2 w-8 rounded-full ${dotIndex === index ? 'bg-primary' : 'bg-border'}`} />)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
