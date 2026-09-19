import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { FloatingBackground } from '@/components/landing/FloatingBackground'
import { Button } from '@/components/ui/button'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'
import { useDirection } from '@/hooks/useDirection'

export function FinalCTASection() {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotionSafe()
  const { isRtl } = useDirection()

  return (
    <section id="contact" className="relative py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(120deg,#6D28D9,#0891B2,#6D28D9)] bg-[length:200%_200%] p-10 shadow-glow animate-gradient-shift">
          <FloatingBackground intensity="low" className="mix-blend-overlay" />

          <div className="relative z-10 max-w-3xl">
            <motion.h2
              className="text-4xl font-black text-white sm:text-5xl"
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {t('landing.ctaTitle')}
            </motion.h2>

            <motion.p
              className="mt-4 text-lg text-white/80"
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('landing.ctaCopy')}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-4"
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  <Sparkles className="size-4" />
                  {t('landing.startLearning')}
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="text-white hover:bg-white/20">
                {t('landing.bookDemo', 'Book a Platform Demo')}
                <ArrowRight className={`${isRtl ? 'rotate-180' : ''} size-4`} />
              </Button>
            </motion.div>

            
          </div>
        </div>
      </div>
    </section>
  )
}