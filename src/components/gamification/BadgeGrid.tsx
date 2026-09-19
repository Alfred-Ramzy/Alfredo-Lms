import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/card'
import { BADGES, type BadgeKey } from '@/lib/gamification'

export function BadgeGrid({ badges }: { badges: string[] }) {
  const { i18n } = useTranslation()

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {(Object.keys(BADGES) as BadgeKey[]).map((badgeKey) => {
        const badge = BADGES[badgeKey]
        const unlocked = badges.includes(badgeKey)
        return (
          <Card key={badgeKey} className={`rounded-[1.5rem] p-4 ${unlocked ? 'border-primary/40 bg-primary/5' : 'opacity-60'}`}>
            <div className="text-3xl">{badge.icon}</div>
            <p className="mt-3 font-semibold">{i18n.language === 'ar' ? badge.nameAr : badge.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{unlocked ? 'Unlocked' : 'Locked'}</p>
          </Card>
        )
      })}
    </div>
  )
}
