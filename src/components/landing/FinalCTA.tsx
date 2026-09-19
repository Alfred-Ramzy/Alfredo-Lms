import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function FinalCTA() {
  const { t } = useTranslation()

  return (
    <section className="container pb-24">
      <div className="overflow-hidden rounded-[2.5rem] bg-[linear-gradient(120deg,#6D28D9,#0891B2,#6D28D9)] bg-[length:200%_200%] p-10 text-white shadow-glow animate-gradient-shift">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-black">{t('landing.ctaTitle')}</h2>
          <p className="mt-4 text-lg text-white/80">{t('landing.ctaCopy')}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/register"><Button variant="secondary" size="lg"><ArrowRight className="size-4" />{t('landing.primaryCta')}</Button></Link>
            
          </div>
        </div>
      </div>
    </section>
  )
}
