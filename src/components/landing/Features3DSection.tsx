import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  BarChart3,
  BookOpen,
  CreditCard,
  Globe2,
  Lock,
  MessageCircle,
  Play,
  QrCode,
  Shield,
  Trophy,
  Video,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FloatingBackground } from '@/components/landing/FloatingBackground'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

const FEATURES = [
  { icon: BookOpen, titleKey: 'landing.featureCourseTitle', copyKey: 'landing.featureCourseCopy', gradient: 'from-violet-500/20 to-purple-500/20' },
  { icon: Video, titleKey: 'landing.featureVideoTitle', copyKey: 'landing.featureVideoCopy', gradient: 'from-cyan-500/20 to-blue-500/20' },
  { icon: BarChart3, titleKey: 'landing.featureDashboardTitle', copyKey: 'landing.featureDashboardCopy', gradient: 'from-emerald-500/20 to-green-500/20' },
  { icon: Shield, titleKey: 'landing.featureInstructorTitle', copyKey: 'landing.featureInstructorCopy', gradient: 'from-amber-500/20 to-orange-500/20' },
  { icon: QrCode, titleKey: 'landing.featureActivationTitle', copyKey: 'landing.featureActivationCopy', gradient: 'from-pink-500/20 to-rose-500/20' },
  { icon: Trophy, titleKey: 'landing.featureQuizTitle', copyKey: 'landing.featureQuizCopy', gradient: 'from-indigo-500/20 to-violet-500/20' },
  { icon: Lock, titleKey: 'landing.featureCertTitle', copyKey: 'landing.featureCertCopy', gradient: 'from-teal-500/20 to-cyan-500/20' },
  { icon: CreditCard, titleKey: 'landing.featurePaymentTitle', copyKey: 'landing.featurePaymentCopy', gradient: 'from-fuchsia-500/20 to-pink-500/20' },
  { icon: Play, titleKey: 'landing.featureAnalyticsTitle', copyKey: 'landing.featureAnalyticsCopy', gradient: 'from-sky-500/20 to-blue-500/20' },
  { icon: Globe2, titleKey: 'landing.featureI18nTitle', copyKey: 'landing.featureI18nCopy', gradient: 'from-lime-500/20 to-green-500/20' },
  { icon: MessageCircle, titleKey: 'landing.featureMessagingTitle', copyKey: 'landing.featureMessagingCopy', gradient: 'from-red-500/20 to-orange-500/20' },
]

function FeatureCard({ icon: Icon, titleKey, copyKey, gradient, index }: typeof FEATURES[0] & { index: number }) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotionSafe()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 dark:bg-white/5 dark:hover:border-primary/30"
      initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={prefersReduced ? {} : { y: -6, scale: 1.02 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

      <div className="relative">
        <div className={`mb-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient}`}>
          <Icon className="size-6 text-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{t(titleKey)}</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{t(copyKey)}</p>
      </div>

      <div className="absolute inset-x-0 -bottom-px h-[1px] bg-gradient-to-r from-transparent via-primary/0 to-transparent opacity-0 transition-opacity group-hover:via-primary/40 group-hover:opacity-100" />
    </motion.div>
  )
}

export function Features3DSection() {
  const { t } = useTranslation()

  return (
    <section id="features" className="relative py-24">
      <FloatingBackground intensity="medium" />
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title max-w-3xl">{t('landing.featuresTitle')}</h2>
          <p className="section-copy mt-4">{t('landing.featuresCopy')}</p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.titleKey} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}