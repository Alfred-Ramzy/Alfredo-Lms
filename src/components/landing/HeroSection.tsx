import { motion } from 'framer-motion'
import { ArrowDown, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-[#050816] text-slate-50">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="hero-orb start-[-8rem] top-16 size-72 bg-primary/30" />
      <div className="hero-orb end-[-5rem] top-1/3 size-80 bg-secondary/30" />
      <div className="container relative grid min-h-[calc(100vh-5rem)] items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Badge className="bg-white/10 text-cyan-200">Protected, bilingual, role-aware learning</Badge>
          <h1 className="mt-6 max-w-2xl text-5xl font-black leading-tight sm:text-6xl">{t('landing.heroTitle')}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{t('landing.heroCopy')}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/register"><Button size="lg"><Sparkles className="size-4" />{t('landing.primaryCta')}</Button></Link>
            <Link to="/student/catalog"><Button size="lg" variant="outline"><PlayCircle className="size-4" />{t('landing.secondaryCta')}</Button></Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-cyan-300" /> DRM-aware content foundations</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-cyan-300" /> Firebase free-tier conscious</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-xl animate-float"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/30 to-secondary/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-glow backdrop-blur-xl">
            <div className="grid gap-4 rounded-[1.5rem] bg-slate-950/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Executive Overview</p>
                  <h3 className="mt-1 text-xl font-bold">Alfredo Command Center</h3>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300">98% completion</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Students online</p>
                  <p className="mt-2 text-3xl font-black">3,248</p>
                  <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-primary to-secondary" /></div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Revenue pace</p>
                  <p className="mt-2 text-3xl font-black">+24%</p>
                  <div className="mt-4 grid grid-cols-4 gap-2">{[40, 70, 52, 86].map((height) => <div key={height} className="rounded-full bg-cyan-400/40" style={{ height }} />)}</div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Course pipeline</span><span className="text-sm text-cyan-300">Batch 1 ready</span></div>
                <div className="mt-4 grid gap-3">{['Protected Video', 'Gamification Engine', 'Role Routing'].map((item, index) => <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3"><span>{item}</span><span className="text-sm text-slate-400">0{index + 1}</span></div>)}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <a href="#stats" className="inline-flex animate-bounce items-center gap-2 text-sm text-slate-300">
          <ArrowDown className="size-4" />
          {t('landing.scroll')}
        </a>
      </div>
    </section>
  )
}
