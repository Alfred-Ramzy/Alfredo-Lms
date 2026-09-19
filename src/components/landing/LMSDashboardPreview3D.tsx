import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, GraduationCap, Settings, Shield, Users, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

const TABS = ['student', 'instructor', 'admin'] as const
type TabKey = typeof TABS[number]

function StudentDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">My Progress</p>
          <p className="mt-1 text-2xl font-black text-white">78%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Courses</p>
          <p className="mt-1 text-2xl font-black text-white">5</p>
          <p className="mt-1 text-xs text-slate-400">3 completed</p>
        </div>
      </div>
      <div className="space-y-2">
        {['Frontend Mastery', 'AI for Productivity', 'Design Systems'].map((course, i) => (
          <div key={course} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="size-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{course}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${85 - i * 25}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="size-6 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-white">Certificates Earned</p>
            <p className="text-xs text-slate-400">3 certifications</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InstructorDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Students</p>
          <p className="mt-1 text-2xl font-black text-white">1,240</p>
          <p className="mt-1 text-xs text-emerald-400">+12% this month</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Revenue</p>
          <p className="mt-1 text-2xl font-black text-white">42K</p>
          <p className="mt-1 text-xs text-cyan-400">EGP</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Course Builder</p>
        <div className="mt-3 grid gap-2">
          {['Frontend Mastery Bootcamp', 'AI Productivity'].map((course, i) => (
            <div key={course} className="flex items-center justify-between rounded-xl bg-slate-900/80 px-4 py-2.5">
              <span className="text-sm text-white">{course}</span>
              <span className="text-xs text-emerald-300">{i === 0 ? 'Published' : 'Draft'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Recent Submissions</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="size-8 rounded-full bg-violet-500/20" />
          <div className="flex-1">
            <p className="text-sm text-white">Ahmed T. — Assignment 3</p>
            <p className="text-xs text-slate-400">Awaiting review</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <Users className="size-5 text-primary" />
          <p className="mt-2 text-xl font-black text-white">8.2K</p>
          <p className="text-xs text-slate-400">Users</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <BarChart3 className="size-5 text-secondary" />
          <p className="mt-2 text-xl font-black text-white">156K</p>
          <p className="text-xs text-slate-400">EGP</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <Shield className="size-5 text-emerald-400" />
          <p className="mt-2 text-xl font-black text-white">340</p>
          <p className="text-xs text-slate-400">Codes</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Activation Codes</p>
          <span className="text-xs text-cyan-300">View all</span>
        </div>
        <div className="mt-3 grid gap-2">
          {['ALF-2024-PRO', 'ALF-2024-VIP'].map((code) => (
            <div key={code} className="flex items-center justify-between rounded-xl bg-slate-900/80 px-4 py-2">
              <span className="font-mono text-sm text-white">{code}</span>
              <span className="text-xs text-emerald-300">Active</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider">System Settings</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { icon: Settings, label: 'General' },
            { icon: Video, label: 'Content' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-2.5">
              <Icon className="size-4 text-slate-400" />
              <span className="text-sm text-white">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DASHBOARD_MAP: Record<TabKey, React.ComponentType> = {
  student: StudentDashboard,
  instructor: InstructorDashboard,
  admin: AdminDashboard,
}

export function LMSDashboardPreview3D() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('student')
  const prefersReduced = useReducedMotionSafe()

  const tabLabels: Record<TabKey, string> = {
    student: t('dashboards.student'),
    instructor: t('dashboards.instructor'),
    admin: t('dashboards.admin'),
  }

  const ActiveDashboard = DASHBOARD_MAP[activeTab]

  return (
    <section id="dashboard-preview" className="relative py-24">
      <div className="container relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">{t('landing.dashboardTitle')}</h2>
          <p className="section-copy mx-auto mt-4">{t('landing.dashboardCopy')}</p>
        </motion.div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="flex items-center justify-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="dashboardTab"
                    className="absolute inset-0 rounded-full border border-primary/30 bg-primary/10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tabLabels[tab]}</span>
              </button>
            ))}
          </div>

          <motion.div
            className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-glow"
            style={{ perspective: '1000px' }}
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-500/80" />
              <div className="size-3 rounded-full bg-yellow-500/80" />
              <div className="size-3 rounded-full bg-green-500/80" />
              <span className="ms-2 text-xs text-slate-500">Alfredo LMS</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={prefersReduced ? {} : { opacity: 0, y: 10, rotateX: 5 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={prefersReduced ? {} : { opacity: 0, y: -10, rotateX: -5 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveDashboard />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}