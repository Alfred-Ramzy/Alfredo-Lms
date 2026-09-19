import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Award, BookOpen, Globe, GraduationCap, TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FloatingBackground } from '@/components/landing/FloatingBackground'
import { useCountUp } from '@/hooks/useCountUp'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

interface StatItemProps {
  icon: React.ElementType
  target: number
  suffix: string
  labelKey: string
  delay: number
}

function StatItem({ icon: Icon, target, suffix, labelKey, delay }: StatItemProps) {
  const { t } = useTranslation()
  const value = useCountUp(target)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const prefersReduced = useReducedMotionSafe()

  return (
    <motion.div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={prefersReduced ? {} : { scale: 1.02, y: -4 }}
      style={{ perspective: '800px' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15">
          <Icon className="size-6 text-primary" />
        </div>
        <p className="text-3xl font-black text-foreground">
          {value.toLocaleString()}{suffix}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{t(labelKey)}</p>
      </div>
    </motion.div>
  )
}

const STATS: StatItemProps[] = [
  { icon: Users, target: 12000, suffix: '+', labelKey: 'landing.statsStudents', delay: 0 },
  { icon: BookOpen, target: 250, suffix: '+', labelKey: 'landing.statsCourses', delay: 0.1 },
  { icon: GraduationCap, target: 80, suffix: '+', labelKey: 'landing.statsInstructors', delay: 0.2 },
  { icon: TrendingUp, target: 98, suffix: '%', labelKey: 'landing.statsSatisfaction', delay: 0.3 },
  { icon: Award, target: 5000, suffix: '+', labelKey: 'landing.statsCertificates', delay: 0.4 },
  { icon: Globe, target: 24, suffix: '/7', labelKey: 'landing.statsAccess', delay: 0.5 },
]

export function AnimatedStatsSection() {
  const { t } = useTranslation()

  return (
    <section id="stats" className="relative py-24">
      <FloatingBackground intensity="low" />
      <div className="container relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">{t('landing.statsTitle')}</h2>
          <p className="section-copy mx-auto mt-4">{t('landing.statsCopy')}</p>
        </motion.div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((stat) => (
            <StatItem key={stat.labelKey} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}