import { Link } from 'react-router-dom'
import { GraduationCap, Globe, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { APP_NAME } from '@/lib/constants'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="relative border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container py-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow">
                <GraduationCap className="size-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">{APP_NAME}</span>
            </Link>
            <p className="text-sm leading-7 text-muted-foreground">
              {t('landing.heroCopy')}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Platform</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <Link to="/#features" className="block transition-colors hover:text-foreground">Features</Link>
              <Link to="/#courses" className="block transition-colors hover:text-foreground">Courses</Link>
              <Link to="/#pricing" className="block transition-colors hover:text-foreground">Pricing</Link>
              <Link to="/student/catalog" className="block transition-colors hover:text-foreground">Catalog</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <Link to="/#contact" className="block transition-colors hover:text-foreground">Contact</Link>
              <Link to="/login" className="block transition-colors hover:text-foreground">Login</Link>
              <Link to="/register" className="block transition-colors hover:text-foreground">Get Started</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Connect</h4>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-background/50 transition-colors hover:border-primary/30 hover:bg-accent"
                aria-label="Website"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-background/50 transition-colors hover:border-primary/30 hover:bg-accent"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground/70">
              {t('landing.cameraPrivacyNote')}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}