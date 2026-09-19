import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

import { updateUserPreferences } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import type { ThemeMode } from '@/types/firebase'

interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
const STORAGE_KEY = 'alfredo-theme'

function resolveTheme(theme: ThemeMode) {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return theme
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const profile = useAuthStore((state) => state.userProfile)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'system'
  })
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() => resolveTheme('system'))

  const resolvedTheme = useMemo(() => (theme === 'system' ? systemTheme : theme), [systemTheme, theme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [resolvedTheme, theme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => setSystemTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme)
    if (profile?.uid) {
      void updateUserPreferences(profile.uid, { preferredTheme: nextTheme })
    }
  }, [profile])

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [resolvedTheme, setTheme, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
