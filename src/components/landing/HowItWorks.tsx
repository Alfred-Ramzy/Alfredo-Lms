import { CheckCircle2, GraduationCap, Rocket } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const steps = [
  { title: 'Enroll', icon: Rocket, copy: 'Create an account, unlock catalog visibility, and join your first course.' },
  { title: 'Learn', icon: GraduationCap, copy: 'Progress through videos, assignments, quizzes, and protected content.' },
  { title: 'Achieve', icon: CheckCircle2, copy: 'Track streaks, collect badges, and earn certificates with clarity.' },
]

export function HowItWorks() {
  const { t } = useTranslation()

  return (
    <section className="bg-card/50 py-24">
      <div className="container">
        <h2 className="section-title">{t('landing.howTitle')}</h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="glass-panel rounded-[1.75rem] p-6">
              <div className="mb-5 flex items-center justify-between"><step.icon className="size-8 text-primary" /><span className="font-mono text-sm text-muted-foreground">0{index + 1}</span></div>
              <h3 className="text-2xl font-bold">{step.title}</h3>
              <p className="mt-3 text-muted-foreground">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
