import { useMemo } from 'react'
import { motion } from 'framer-motion'

import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

interface FloatingBackgroundProps {
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

const PARTICLE_COUNTS = { low: 12, medium: 24, high: 50 }

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

interface ParticleConfig {
  size: number
  x: number
  y: number
  duration: number
  delay: number
  opacity: number
  animY: number
  animX: number
}

function generateParticleConfig(index: number): ParticleConfig {
  const s = (n: number) => seededRandom(index * 100 + n)
  const size = 2 + s(0) * 4
  return {
    size,
    x: s(1) * 100,
    y: s(2) * 100,
    duration: 18 + s(3) * 30,
    delay: s(4) * 12,
    opacity: 0.1 + s(5) * 0.3,
    animY: -40 - s(6) * 60,
    animX: (s(7) - 0.5) * 50,
  }
}

function FloatingParticle({ config }: { config: ParticleConfig }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: config.size,
        height: config.size,
        left: `${config.x}%`,
        top: `${config.y}%`,
        opacity: config.opacity,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.8), rgba(6,182,212,0.8))',
        boxShadow: '0 0 10px rgba(124,58,237,0.4)',
      }}
      animate={{
        y: [0, config.animY, 0],
        x: [0, config.animX, 0],
        opacity: [config.opacity * 0.5, config.opacity, config.opacity * 0.5],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: config.duration,
        delay: config.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export function FloatingBackground({ intensity = 'medium', className = '' }: FloatingBackgroundProps) {
  const prefersReduced = useReducedMotionSafe()
  const count = PARTICLE_COUNTS[intensity]

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const config = generateParticleConfig(i)
        return <FloatingParticle key={i} config={config} />
      }),
    [count],
  )

  if (prefersReduced) {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-grid opacity-15 dark:opacity-25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.08),transparent_50%)]" />
      </div>
    )
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-30" />

      <div className="hero-orb start-[-15%] top-[5%] size-[600px] bg-primary/20" />
      <div className="hero-orb end-[-10%] top-[25%] size-[500px] bg-secondary/15" />
      <div className="hero-orb start-[25%] bottom-[-15%] size-[450px] bg-primary/10" />
      <div className="hero-orb end-[20%] bottom-[20%] size-[350px] bg-cyan-500/10" />

      <motion.div
        className="absolute start-1/4 top-1/4 size-[300px] rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute end-1/4 bottom-1/4 size-[250px] rounded-full bg-gradient-to-r from-cyan-500/10 to-primary/10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {particles}

      <motion.div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
    </div>
  )
}