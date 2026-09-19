import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { BADGES, type BadgeKey } from '@/lib/gamification'

export function BadgeUnlockOverlay({ badgeKey, open }: { badgeKey: BadgeKey | null; open: boolean }) {
  const { i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  if (!open || !badgeKey) return null
  const badge = BADGES[badgeKey]

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="rounded-[2rem] border border-primary/40 bg-card px-8 py-6 text-center shadow-glow"
      >
        <div className="text-5xl">{badge.icon}</div>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-primary">Badge unlocked</p>
        <h3 className="mt-2 text-2xl font-black">{i18n.language === 'ar' ? badge.nameAr : badge.name}</h3>
      </motion.div>
    </div>
  )
}
