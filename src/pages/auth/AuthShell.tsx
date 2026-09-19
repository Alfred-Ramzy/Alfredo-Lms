import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

import { LangSwitcher } from '@/components/common/LangSwitcher'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Card } from '@/components/ui/card'

interface AuthShellProps extends PropsWithChildren {
  title: string
  copy: string
}

export function AuthShell({ title, copy, children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-8 text-slate-50">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="hero-orb start-[-6rem] top-24 size-72 bg-primary/30" />
      <div className="hero-orb end-[-4rem] top-1/3 size-80 bg-secondary/30" />
      <div className="container relative">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold">Alfredo LMS</Link>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Batch 1 Foundation</p>
            <h1 className="mt-4 text-5xl font-black leading-tight">{title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">{copy}</p>
          </div>
          <Card className="mx-auto w-full max-w-xl rounded-[2rem] border-white/10 bg-white/10 p-6 backdrop-blur-2xl dark:bg-white/5">
            {children}
          </Card>
        </div>
      </div>
    </main>
  )
}
