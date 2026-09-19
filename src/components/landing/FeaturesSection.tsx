import { Award, MessageCircleMore, Shield, Trophy, Video, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardDescription, CardTitle } from '@/components/ui/card'

const features = [
  { icon: Video, title: 'Protected Video', copy: 'Secure playback foundations for premium lessons.' },
  { icon: Trophy, title: 'Smart Quizzes', copy: 'Assess understanding with structured attempts and scoring.' },
  { icon: Award, title: 'Certificates', copy: 'Certificate-ready document structure from the start.' },
  { icon: Wifi, title: 'Multi-Device Control', copy: 'Track devices and prepare for usage limits.' },
  { icon: MessageCircleMore, title: 'Instructor Messaging', copy: 'Keep feedback loops close to the learning journey.' },
  { icon: Shield, title: 'Gamification', copy: 'XP, streaks, badges, and progress motivation built into profiles.' },
]

export function FeaturesSection() {
  const { t } = useTranslation()

  return (
    <section id="features" className="container py-24">
      <h2 className="section-title max-w-3xl">{t('landing.featuresTitle')}</h2>
      <p className="section-copy mt-4">{t('landing.featuresCopy')}</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={feature.title} className="animate-fade-up" style={{ animationDelay: `${index * 90}ms` }}>
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
              <feature.icon className="size-6" />
            </div>
            <CardTitle>{feature.title}</CardTitle>
            <CardDescription className="mt-3">{feature.copy}</CardDescription>
          </Card>
        ))}
      </div>
    </section>
  )
}
