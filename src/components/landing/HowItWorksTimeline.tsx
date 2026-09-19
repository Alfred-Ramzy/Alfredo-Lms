import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { BookOpen, CheckCircle2, ClipboardList, GraduationCap, Rocket, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

const STEPS = [
  { icon: Rocket, titleKey: 'landing.stepCreateTitle', copyKey: 'landing.stepCreateCopy' },
  { icon: BookOpen, titleKey: 'landing.stepActivateTitle', copyKey: 'landing.stepActivateCopy' },
  { icon: GraduationCap, titleKey: 'landing.stepLearnTitle', copyKey: 'landing.stepLearnCopy' },
  { icon: ClipboardList, titleKey: 'landing.stepQuizTitle', copyKey: 'landing.stepQuizCopy' },
  { icon: CheckCircle2, titleKey: 'landing.stepSubmitTitle', copyKey: 'landing.stepSubmitCopy' },
  { icon: Trophy, titleKey: 'landing.stepCertTitle', copyKey: 'landing.stepCertCopy' },
]

function StepCard({ icon: Icon, titleKey, copyKey, index }: typeof STEPS[0] & { index: number }) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotionSafe()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <motion.div
      ref={ref}
      className="group relative"
      initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="relative flex flex-col items-center text-center md:flex-row md:text-start">
        <div className="relative z-10">
          <motion.div
            className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 ring-4 ring-background"
            whileHover={prefersReduced ? {} : { scale: 1.1, rotate: 5 }}
          >
            <Icon className="size-7 text-primary" />
          </motion.div>
        </div>

        <div className="mt-4 md:ms-5 md:mt-0">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <span className="font-mono text-sm text-muted-foreground">0{index + 1}</span>
            <h3 className="text-xl font-bold text-foreground">{t(titleKey)}</h3>
          </div>
          <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{t(copyKey)}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function HowItWorksTimeline() {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotionSafe()
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.2 })

  return (
    <section id="how-it-works" className="relative bg-card/50 py-24">
      <div className="container relative z-10">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title text-center">{t('landing.howTitle')}</h2>
          <p className="section-copy mx-auto mt-4 text-center">{t('landing.howCopy')}</p>
        </motion.div>

        <div className="relative mt-16">
          {/* Vertical line for desktop */}
          <div className="absolute start-8 top-0 hidden h-full w-[2px] bg-gradient-to-b from-primary/50 via-secondary/50 to-primary/50 md:block" />

          {/* Horizontal line for desktop connecting nodes */}
          <div className="relative mx-auto mt-8 hidden max-w-4xl md:flex md:flex-wrap md:justify-between md:gap-8">
            {STEPS.map((step, i) => (
              <div key={step.titleKey} className="flex w-[calc(50%-1rem)] flex-col items-center text-center">
                <motion.div
                  className="relative mb-4"
                  initial={prefersReduced ? {} : { opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 ring-4 ring-background shadow-glow">
                    <step.icon className="size-7 text-primary" />
                  </div>
                  <div className="absolute -top-2 -end-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                </motion.div>
                <h3 className="text-lg font-bold text-foreground">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(step.copyKey)}</p>
              </div>
            ))}
          </div>

          {/* Mobile vertical timeline */}
          <div className="relative ms-8 mt-8 space-y-8 md:hidden">
            <div className="absolute start-0 top-0 h-full w-[2px] bg-gradient-to-b from-primary/50 via-secondary/50 to-transparent" />
            {STEPS.map((step, i) => (
              <StepCard key={step.titleKey} {...step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}