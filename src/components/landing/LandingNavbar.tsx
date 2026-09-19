import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { GraduationCap, Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'

import { useAuthStore } from '@/stores/authStore'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/#hero', labelKey: 'nav.home', id: 'hero' },
  { href: '/#features', labelKey: 'nav.features', id: 'features' },
  { href: '/#platform', labelKey: 'nav.platform', id: 'platform' },
  { href: '/#courses', labelKey: 'nav.courses', id: 'courses' },
  { href: '/#pricing', labelKey: 'nav.pricing', id: 'pricing' },
  { href: '/#contact', labelKey: 'nav.contact', id: 'contact' },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isArabic = i18n.language === 'ar'

  return (
    <button
      onClick={() => void i18n.changeLanguage(isArabic ? 'en' : 'ar')}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-medium backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-white/10"
      aria-label="Toggle language"
    >
      <span className="text-xs">{isArabic ? 'EN' : 'عربي'}</span>
    </button>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useThemeCustom()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-white/10"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="size-4 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="size-4 text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

function useThemeCustom() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (stored) {
      setThemeState(stored)
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setThemeState(isDark ? 'dark' : 'light')
    }
  }, [])

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(newTheme)
  }

  return { theme, setTheme }
}

function DesktopNav() {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState<string | null>(null)
  const [active, setActive] = useState('hero')

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((link) => (
        <a
          key={link.id}
          href={link.href}
          className={cn(
            'relative px-4 py-2 text-sm font-medium transition-colors duration-300',
            active === link.id || hovered === link.id
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onMouseEnter={() => setHovered(link.id)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setActive(link.id)}
        >
          {t(link.labelKey)}
          {(active === link.id || hovered === link.id) && (
            <motion.div
              layoutId="navUnderline"
              className="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-primary to-secondary"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </a>
      ))}
    </nav>
  )
}

function AuthButtons() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const profile = useAuthStore((s) => s.userProfile)

  if (isAuthenticated && profile) {
    const dashboardPath =
      profile.role === 'admin'
        ? '/admin/dashboard'
        : profile.role === 'instructor'
          ? '/instructor/dashboard'
          : '/student/dashboard'

    return (
      <div className="flex items-center gap-3">
        <Link to={dashboardPath}>
          <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
            {t('nav.dashboard')}
          </Button>
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-white shadow-glow">
          {profile.fullName?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <NavLink
        to="/login"
        className={({ isActive }) =>
          cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:inline-flex', isActive && 'text-primary')
        }
      >
        {t('nav.login')}
      </NavLink>
      <Link to="/register">
        <Button size="sm">
          {t('nav.register')}
        </Button>
      </Link>
    </div>
  )
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'fixed inset-y-0 z-50 flex w-full max-w-sm flex-col bg-background/95 backdrop-blur-3xl lg:hidden',
              isRtl ? 'start-0 end-auto' : 'end-0 start-auto'
            )}
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="hero-orb start-[-30%] top-[5%] size-72 bg-primary/15" />
              <div className="hero-orb end-[-20%] bottom-[15%] size-80 bg-secondary/12" />
              <div className="absolute inset-0 bg-grid opacity-10" />
            </div>

            <div className="relative flex items-center justify-between border-b border-border/50 p-6">
              <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
                <motion.div
                  className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <GraduationCap className="size-5 text-white" />
                </motion.div>
                <span className="font-display text-lg font-bold">{APP_NAME}</span>
              </Link>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="relative flex-1 overflow-y-auto p-6">
              <div className="space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.id}
                    href={link.href}
                    className="block rounded-2xl px-4 py-3.5 text-base font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent/50 hover:text-foreground"
                    initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    onClick={onClose}
                  >
                    {t(link.labelKey)}
                  </motion.a>
                ))}
              </div>
            </nav>

            <div className="relative border-t border-border/50 p-6">
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <div className="mt-4">
                <AuthButtons />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function LandingNavbar() {
  const { scrollYProgress } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setIsScrolled(v > 0.02)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  const navbarY = useSpring(useTransform(scrollYProgress, [0, 0.1], [0, -8]), {
    stiffness: 300,
    damping: 30,
  })
  const navbarScale = useSpring(useTransform(scrollYProgress, [0, 0.08], [1, 0.97]), {
    stiffness: 300,
    damping: 30,
  })

  return (
    <>
      <motion.header
        style={{ y: navbarY, scale: navbarScale }}
        className={cn(
          'fixed inset-x-0 top-4 z-50 mx-auto max-w-5xl transition-all duration-500',
          isScrolled
            ? 'rounded-2xl border border-white/10 bg-black/40 shadow-glow backdrop-blur-3xl'
            : 'rounded-2xl border border-white/5 bg-white/5 backdrop-blur-2xl',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <GraduationCap className="size-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary opacity-0 hover:opacity-20 transition-opacity" />
            </motion.div>
            <span className="font-display text-xl font-bold tracking-tight">
              {APP_NAME}
            </span>
          </Link>

          <DesktopNav />

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <AuthButtons />
            <button
              className="rounded-xl p-2.5 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        {isScrolled && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="absolute inset-x-0 -bottom-px h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          />
        )}
      </motion.header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}