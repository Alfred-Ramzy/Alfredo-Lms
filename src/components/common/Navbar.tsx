import { GraduationCap, Sparkles } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { LangSwitcher } from '@/components/common/LangSwitcher'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { buttonVariants } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { t } = useTranslation()
  const items = [
    { href: '/', label: t('nav.home') },
    { href: '/#features', label: t('nav.features') },
    { href: '/#pricing', label: t('nav.pricing') },
    { href: '/#testimonials', label: t('nav.testimonials') },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-glow">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">Premium EdTech OS</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {items.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-muted-foreground transition hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <NavLink
            to="/login"
            className={({ isActive }) => cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:inline-flex', isActive && 'text-primary')}
          >
            {t('nav.login')}
          </NavLink>
          <Link to="/register" className={buttonVariants({ size: 'sm' })}>
            <Sparkles className="size-4" />
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </header>
  )
}
