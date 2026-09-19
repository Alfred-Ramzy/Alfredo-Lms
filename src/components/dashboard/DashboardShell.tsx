import { BarChart3, BookOpen, ChevronLeft, ChevronRight, CreditCard, Gauge, GraduationCap, LayoutGrid, LogOut, Menu, MessageSquare, MonitorSmartphone, Settings, ShieldCheck, Ticket, UserCircle2, Users } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { LangSwitcher } from '@/components/common/LangSwitcher'
import { NotificationBell } from '@/components/common/NotificationBell'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { logout } from '@/lib/firebase/auth'
import { cn, getInitials } from '@/lib/utils'
import { usePlatformSettings } from '@/hooks/usePlatformSettings'
import { useAuthStore } from '@/stores/authStore'
import { usePlatformStore } from '@/stores/platformStore'
import type { UserRole } from '@/types/firebase'

interface DashboardShellProps {
  role: UserRole
  title: string
  children: React.ReactNode
}

type NavItem = { label: string; href: string; icon: typeof Gauge; mobilePrimary?: boolean }

const navMap: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Gauge, mobilePrimary: true },
    { label: 'Users', href: '/admin/users', icon: Users, mobilePrimary: true },
    { label: 'Courses', href: '/admin/courses', icon: BookOpen, mobilePrimary: true },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard, mobilePrimary: true },
    { label: 'Activation Codes', href: '/admin/activation-codes', icon: Ticket },
    { label: 'Devices', href: '/admin/devices', icon: MonitorSmartphone },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Marketing', href: '/admin/marketing', icon: LayoutGrid },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  instructor: [
    { label: 'Dashboard', href: '/instructor/dashboard', icon: Gauge, mobilePrimary: true },
    { label: 'My Courses', href: '/instructor/courses', icon: BookOpen, mobilePrimary: true },
    { label: 'Course Builder', href: '/instructor/courses/new', icon: GraduationCap, mobilePrimary: true },
    { label: 'Messages', href: '/instructor/messages', icon: MessageSquare, mobilePrimary: true },
    { label: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
  ],
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: Gauge, mobilePrimary: true },
    { label: 'My Learning', href: '/student/my-learning', icon: BookOpen, mobilePrimary: true },
    { label: 'Catalog', href: '/student/catalog', icon: LayoutGrid, mobilePrimary: true },
    { label: 'Messages', href: '/student/messages', icon: MessageSquare, mobilePrimary: true },
    { label: 'Certificates', href: '/student/certificates', icon: ShieldCheck },
    { label: 'Profile', href: '/student/profile', icon: UserCircle2 },
  ],
}

const SIDEBAR_KEY = 'alfredo-sidebar-collapsed'

export function DashboardShell({ role, title, children }: DashboardShellProps) {
  usePlatformSettings()
  const location = useLocation()
  const profile = useAuthStore((state) => state.userProfile)
  const mobileNavOpen = usePlatformStore((state) => state.mobileNavOpen)
  const setMobileNavOpen = usePlatformStore((state) => state.setMobileNavOpen)
  const sidebarCollapsed = usePlatformStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = usePlatformStore((state) => state.setSidebarCollapsed)
  const items = navMap[role]

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    if (saved) {
      setSidebarCollapsed(saved === 'true')
    }
  }, [setSidebarCollapsed])

  const breadcrumb = useMemo(() => location.pathname.split('/').filter(Boolean).join(' / '), [location.pathname])
  const mobilePrimaryItems = items.filter((item) => item.mobilePrimary).slice(0, 4)
  const moreItems = items.filter((item) => !mobilePrimaryItems.includes(item))

  const handleToggleSidebar = () => {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    localStorage.setItem(SIDEBAR_KEY, String(next))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className={cn('sticky top-0 hidden h-screen border-e border-border bg-card/75 backdrop-blur lg:flex lg:flex-col', sidebarCollapsed ? 'w-[72px]' : 'w-[240px]')}>
          <div className="flex items-center justify-between border-b border-border p-4">
            <Link to={`/${role}/dashboard`} className="flex items-center gap-3 overflow-hidden">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
                <GraduationCap className="size-5" />
              </div>
              {!sidebarCollapsed ? <span className="font-bold">Alfredo LMS</span> : null}
            </Link>
            <Button variant="ghost" size="sm" onClick={handleToggleSidebar}><>{sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</></Button>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {items.map((item) => {
              const active = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
              return (
                <Link key={item.href} to={item.href} className={cn(buttonVariants({ variant: active ? 'default' : 'ghost', size: 'sm' }), 'w-full justify-start rounded-2xl', sidebarCollapsed && 'px-0 justify-center')}>
                  <item.icon className="size-4 shrink-0" />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-border p-3">
            <Button variant="outline" size="sm" className={cn('w-full', sidebarCollapsed && 'px-0')} onClick={() => void logout()}>
              <LogOut className="size-4" />
              {!sidebarCollapsed ? <span>Logout</span> : null}
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileNavOpen(!mobileNavOpen)}><Menu className="size-4" /></Button>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{breadcrumb}</p>
                  <h1 className="text-2xl font-extrabold">{title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <ThemeToggle />
                <LangSwitcher />
                <div className="hidden items-center gap-3 rounded-full border border-border px-3 py-2 sm:flex">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{getInitials(profile?.fullName)}</div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold">{profile?.fullName ?? 'User'}</p>
                    <Badge className="capitalize">{role}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {mobileNavOpen ? (
            <div className="border-b border-border bg-card/95 p-4 lg:hidden">
              <div className="grid gap-2">
                {[...mobilePrimaryItems, ...moreItems].map((item) => (
                  <Link key={item.href} to={item.href} onClick={() => setMobileNavOpen(false)} className={cn(buttonVariants({ variant: location.pathname.startsWith(item.href) ? 'default' : 'ghost', size: 'sm' }), 'justify-start rounded-2xl')}>
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <main className="flex-1 px-4 py-6 pb-28 lg:px-8 lg:pb-8">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-2">
          {mobilePrimaryItems.map((item) => {
            const active = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} to={item.href} className={cn('flex min-h-11 flex-col items-center justify-center rounded-2xl text-xs', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                <item.icon className="mb-1 size-4" />
                {item.label}
              </Link>
            )
          })}
          <button type="button" onClick={() => setMobileNavOpen(!mobileNavOpen)} className="flex min-h-11 flex-col items-center justify-center rounded-2xl text-xs text-muted-foreground">
            <Menu className="mb-1 size-4" />
            More
          </button>
        </div>
      </nav>
    </div>
  )
}
