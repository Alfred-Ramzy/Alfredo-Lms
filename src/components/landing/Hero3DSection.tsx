import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, PlayCircle, Sparkles, Trophy, TrendingUp, BookOpen, Award, CreditCard, Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { FloatingBackground } from '@/components/landing/FloatingBackground'
import { useHeroInteractionStore } from '@/stores/heroInteractionStore'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'
import { Button } from '@/components/ui/button'
import { useDirection } from '@/hooks/useDirection'

interface FloatingCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  delay?: number
}

function FloatingCard({ children, className = '', style = {}, delay = 0 }: FloatingCardProps) {
  const prefersReduced = useReducedMotionSafe()
  return (
    <motion.div
      className={`absolute rounded-2xl border border-white/10 bg-card/20 backdrop-blur-xl ${className}`}
      style={style}
      animate={prefersReduced ? {} : {
        y: [0, -8, 0],
        rotateX: [0, 2, 0],
        rotateY: [0, -1, 0],
      }}
      transition={{
        duration: 5 + delay,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

function MainDashboard() {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/90 p-4 shadow-glow">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Executive Dashboard</p>
          <h3 className="mt-0.5 text-base font-bold text-white">Learning OS v4.0</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-[10px] font-semibold text-emerald-300">Live</span>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20">
            <BookOpen className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400">Active Courses</p>
            <p className="text-lg font-bold text-white">12</p>
          </div>
          <div className="h-8 w-16 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 p-[2px]">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/20">
            <Trophy className="size-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400">Achievements</p>
            <p className="text-lg font-bold text-white">24</p>
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3].map((i) => (
              <Award key={i} className="size-4 text-amber-400" />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/20">
            <TrendingUp className="size-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400">Weekly Progress</p>
            <p className="text-lg font-bold text-white">+18%</p>
          </div>
          <div className="flex items-end gap-0.5">
            {[30, 45, 35, 60, 50, 75].map((h, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full bg-cyan-400/60"
                initial={{ height: 0 }}
                animate={{ height: h * 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CoursePreviewCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/30">
          <PlayCircle className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-[10px] text-slate-400">Now Playing</p>
          <p className="text-xs font-semibold text-white">Advanced React Patterns</p>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: '0%' }}
          animate={{ width: '68%' }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      </div>
      <p className="mt-1.5 text-[10px] text-slate-500">14:32 / 21:00</p>
    </div>
  )
}

function CertificateCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20">
          <Award className="size-4 text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] text-amber-300/80">Latest Certificate</p>
          <p className="text-xs font-bold text-amber-200">UI/UX Design Mastery</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <div className="h-1 w-8 rounded-full bg-amber-500/30" />
        <div className="h-1 w-6 rounded-full bg-amber-500/20" />
        <span className="text-[9px] text-amber-300/60">Verified</span>
      </div>
    </div>
  )
}

function QuizScoreCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[10px] text-emerald-300/80">Quiz Completed</p>
        <span className="text-[10px] font-bold text-emerald-300">92%</span>
      </div>
      <p className="text-xs font-semibold text-emerald-200">JavaScript Advanced</p>
      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`size-1.5 rounded-full ${i <= 4 ? 'bg-emerald-400' : 'bg-emerald-400/30'}`}
          />
        ))}
      </div>
    </div>
  )
}

function PaymentCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 p-3">
      <div className="mb-2 flex items-center gap-2">
        <CreditCard className="size-4 text-slate-400" />
        <p className="text-[10px] text-slate-400">Payment Confirmed</p>
      </div>
      <p className="text-sm font-bold text-white">$299.00</p>
      <p className="text-[10px] text-slate-500">Course Bundle Pro</p>
    </div>
  )
}

function NotificationCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-primary" />
        <span className="text-[10px] font-semibold text-primary">New message</span>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">Instructor replied to your question</p>
    </div>
  )
}

function Hero3DScene() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotionSafe()
  const { isRtl } = useDirection()

  const zoom = useHeroInteractionStore((s) => s.zoom)
  const minimized = useHeroInteractionStore((s) => s.minimized)
  const rotationX = useHeroInteractionStore((s) => s.rotationX)
  const rotationY = useHeroInteractionStore((s) => s.rotationY)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], isRtl ? [8, -8] : [-8, 8]), { stiffness: 200, damping: 20 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReduced) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }, [mouseX, mouseY, prefersReduced])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  const scale = minimized ? 0.7 : zoom

  return (
    <motion.div
      ref={containerRef}
      className="relative mx-auto w-full cursor-pointer select-none"
      style={{
        perspective: '1400px',
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX: prefersReduced ? 0 : (rotateX.get() + rotationX),
          rotateY: prefersReduced ? 0 : (rotateY.get() + rotationY),
          scale,
          transformStyle: 'preserve-3d',
        }}
        animate={minimized ? { opacity: 0.5, scale: 0.7 } : { opacity: 1, scale }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative"
      >
        <div className="absolute inset-0 -m-6 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-secondary/15 blur-3xl" />

        <div className="relative">
          <MainDashboard />

          <FloatingCard
            className="end-4 top-4 w-40"
            style={{ transform: 'translateZ(40px) rotateY(-15deg) rotateX(5deg)' }}
            delay={0}
          >
            <CoursePreviewCard />
          </FloatingCard>

          <FloatingCard
            className="start-4 bottom-8 w-36"
            style={{ transform: 'translateZ(60px) rotateY(10deg) rotateX(-8deg)' }}
            delay={1}
          >
            <CertificateCard />
          </FloatingCard>

          <FloatingCard
            className="end-6 bottom-20 w-32"
            style={{ transform: 'translateZ(30px) rotateY(-8deg) rotateX(3deg)' }}
            delay={2}
          >
            <QuizScoreCard />
          </FloatingCard>

          <FloatingCard
            className="start-8 top-16 w-28"
            style={{ transform: 'translateZ(50px) rotateY(12deg) rotateX(-5deg)' }}
            delay={1.5}
          >
            <PaymentCard />
          </FloatingCard>

          <FloatingCard
            className="end-8 top-32 w-32"
            style={{ transform: 'translateZ(45px) rotateY(-10deg) rotateX(4deg)' }}
            delay={2.5}
          >
            <NotificationCard />
          </FloatingCard>
        </div>
      </motion.div>

      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary/15 to-secondary/15 blur-3xl" />
    </motion.div>
  )
}

export function Hero3DSection() {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotionSafe()
  const [hoveredCta, setHoveredCta] = useState<string | null>(null)

  return (
    <section id="hero" className="relative isolate flex min-h-screen items-center overflow-hidden">
      <FloatingBackground intensity="high" />

      <div className="container relative z-10 grid min-h-screen items-center gap-12 pb-20 pt-28 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col"
        >
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-primary/10 px-5 py-2"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-sm font-medium text-primary">{t('landing.heroBadge')}</span>
          </motion.div>

          <h1 className="text-4xl font-black leading-[1.1] sm:text-5xl lg:text-[3.5rem] xl:text-6xl">
            <span className="bg-gradient-to-br from-foreground via-foreground to-primary/80 bg-clip-text text-transparent">
              {t('landing.heroTitle')}
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {t('landing.heroCopy')}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/register" onMouseEnter={() => setHoveredCta('primary')} onMouseLeave={() => setHoveredCta(null)}>
              <div className="relative">
                <Button size="lg" className="relative overflow-hidden">
                  {hoveredCta === 'primary' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                      style={{ width: '100%' }}
                    />
                  )}
                  <Sparkles className="size-4" />
                  {t('landing.startLearning')}
                </Button>
              </div>
            </Link>
            <a href="#courses" onMouseEnter={() => setHoveredCta('secondary')} onMouseLeave={() => setHoveredCta(null)}>
              <Button size="lg" variant="outline" className="relative overflow-hidden">
                {t('landing.explorePlatform')}
              </Button>
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-6 sm:gap-8">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
                <svg className="size-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('landing.trustBadge1')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10">
                <TrendingUp className="size-4 text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('landing.trustBadge2')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
                <Award className="size-4 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('landing.trustBadge3')}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:block"
        >
          <Hero3DScene />
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center">
        <motion.a
          href="#features"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          animate={prefersReduced ? {} : { y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="size-4" />
          {t('landing.scroll')}
        </motion.a>
      </div>
    </section>
  )
}