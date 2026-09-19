import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/card'
import { getProgressToNextLevel } from '@/lib/gamification'

export function LevelProgressCard({ xp }: { xp: number }) {
  const { i18n } = useTranslation()
  const progress = getProgressToNextLevel(xp)

  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Level</p>
          <h3 className="mt-1 text-2xl font-black">
            {progress.currentLevel.icon} {i18n.language === 'ar' ? progress.currentLevel.nameAr : progress.currentLevel.name}
          </h3>
        </div>
        <div className="text-end">
          <p className="text-sm text-muted-foreground">XP</p>
          <p className="text-2xl font-black">{xp}</p>
        </div>
      </div>
      <div className="mt-4 h-3 rounded-full bg-muted">
        <div className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${progress.percent}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {progress.nextLevel ? `${progress.remainingXp} XP to ${i18n.language === 'ar' ? progress.nextLevel.nameAr : progress.nextLevel.name}` : 'Max level reached'}
      </p>
    </Card>
  )
}
