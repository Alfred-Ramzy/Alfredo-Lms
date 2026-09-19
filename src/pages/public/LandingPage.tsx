import { lazy, Suspense } from 'react'

import { Footer } from '@/components/common/Footer'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { Hero3DSection } from '@/components/landing/Hero3DSection'
import { AnimatedStatsSection } from '@/components/landing/AnimatedStatsSection'
import { Features3DSection } from '@/components/landing/Features3DSection'
import { InteractiveCourseShowcase } from '@/components/landing/InteractiveCourseShowcase'
import { HowItWorksTimeline } from '@/components/landing/HowItWorksTimeline'
import { TestimonialsSlider } from '@/components/landing/TestimonialsSlider'
import { PricingSection } from '@/components/landing/PricingSection'
import { FinalCTASection } from '@/components/landing/FinalCTASection'

const GestureCameraController = lazy(() =>
  import('@/components/landing/GestureCameraController').then((m) => ({ default: m.GestureCameraController }))
)

const LMSDashboardPreview3D = lazy(() =>
  import('@/components/landing/LMSDashboardPreview3D').then((m) => ({ default: m.LMSDashboardPreview3D }))
)

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-background">
      <LandingNavbar />
      <main>
        <Hero3DSection />
        <AnimatedStatsSection />
        <Features3DSection />
        <InteractiveCourseShowcase />
        <HowItWorksTimeline />
        <Suspense fallback={<div className="py-24" />}>
          <LMSDashboardPreview3D />
        </Suspense>
        <TestimonialsSlider />
        <PricingSection />
        <FinalCTASection />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <GestureCameraController />
      </Suspense>
    </div>
  )
}