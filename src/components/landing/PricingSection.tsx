import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

interface TierProps {
  nameKey: string
  price: string
  period?: string
  features: string[]
  featured?: boolean
  delay: number
}

function Tier({ nameKey, price, period, features, featured = false, delay }: TierProps) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotionSafe()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-300 ${
        featured
          ? 'border-primary bg-gradient-to-br from-primary/10 to-secondary/10 shadow-glow'
          : 'border-border bg-card/80'
      }`}
      initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={prefersReduced ? {} : { y: -6, scale: 1.02 }}
    >
      {featured && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-secondary" />
      )}
      <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${featured ? 'text-primary' : 'text-muted-foreground'}`}>
        {t(nameKey)}
      </p>
      <p className="mt-4 text-4xl font-black text-foreground">
        {price}
        {period && <span className="text-base font-normal text-muted-foreground">{period}</span>}
      </p>
      <div className="mt-8 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-sm">
            <Check className={`size-4 flex-shrink-0 ${featured ? 'text-primary' : 'text-emerald-500'}`} />
            <span className="text-foreground">{feature}</span>
          </div>
        ))}
      </div>
      <Link to="/register" className="mt-8 block">
        <Button className="w-full" variant={featured ? 'default' : 'outline'}>
          {featured ? t('landing.pricingBest', 'Best for growth') : t('landing.pricingStart', 'Get started')}
        </Button>
      </Link>
    </motion.div>
  )
}

const TIERS: TierProps[] = [
  {
    nameKey: 'pricing.starter',
    price: '0 EGP',
    period: '',
    features: [
      'Limited catalog access',
      'Student dashboard',
      'Quizzes & assignments',
      'Community support',
    ],
    delay: 0,
  },
  {
    nameKey: 'pricing.pro',
    price: '500 EGP',
    period: '/mo',
    features: [
      'Full course catalog',
      'Protected video player',
      'Certificates',
      'Advanced analytics',
      'Priority support',
      'Activation codes',
    ],
    featured: true,
    delay: 0.1,
  },
  {
    nameKey: 'pricing.institution',
    price: 'Custom',
    period: '',
    features: [
      'Multi-team management',
      'Custom branding',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'Institution analytics',
    ],
    delay: 0.2,
  },
]

export function PricingSection() {
  const { t } = useTranslation()

  return (
    <section id="pricing" className="relative py-24">
      <div className="container">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">{t('landing.pricingTitle')}</h2>
          <p className="section-copy mx-auto mt-4">{t('landing.pricingCopy')}</p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <Tier key={tier.nameKey} {...tier} />
          ))}
        </div>
      </div>
    </section>
  )
}