import { Monitor, MoonStar, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeMode } from '@/types/firebase'

export function ThemeToggle() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const modes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: t('common.light') },
    { value: 'dark', icon: MoonStar, label: t('common.dark') },
    { value: 'system', icon: Monitor, label: t('common.system') },
  ]

  const current = modes.find((mode) => mode.value === theme) ?? modes[2]
  const Icon = current.icon

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 p-1">
      {modes.map((mode) => (
        <Button
          key={mode.value}
          size="sm"
          variant={theme === mode.value ? 'default' : 'ghost'}
          onClick={() => setTheme(mode.value)}
        >
          <mode.icon className="size-4" />
        </Button>
      ))}
      <span className="pe-3 text-xs text-muted-foreground"><Icon className="inline size-3" /> {current.label}</span>
    </div>
  )
}
