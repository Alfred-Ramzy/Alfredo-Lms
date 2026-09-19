import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/card'
import { useCountUp } from '@/hooks/useCountUp'

function Stat({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const value = useCountUp(target)
  return (
    <div>
      <p className="text-3xl font-black text-foreground">{value.toLocaleString()}{suffix}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function StatsBar() {
  const { t } = useTranslation()

  return (
    <section id="stats" className="relative -mt-16 pb-10">
      <div className="container">
        <Card className="grid gap-6 rounded-[2rem] border-white/20 bg-card/90 p-8 md:grid-cols-4">
          <Stat target={12000} suffix="+" label={t('landing.statsStudents')} />
          <Stat target={200} suffix="+" label={t('landing.statsCourses')} />
          <Stat target={98} suffix="%" label={t('landing.statsSatisfaction')} />
          <Stat target={50} suffix="+" label={t('landing.statsInstructors')} />
        </Card>
      </div>
    </section>
  )
}
