import { create } from 'zustand'

import type { CurrencyCode, Locale } from '@/types/firebase'

interface PlatformStore {
  locale: Locale
  mobileNavOpen: boolean
  sidebarCollapsed: boolean
  displayCurrency: CurrencyCode
  currencyRates: Partial<Record<CurrencyCode, number>>
  registrationOpen: boolean
  maintenanceMode: boolean
  paymentInstructions: string
  maxDevicesGlobal: number
  setLocale: (locale: Locale) => void
  setMobileNavOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  hydrateSettings: (payload: Partial<Omit<PlatformStore, 'setLocale' | 'setMobileNavOpen' | 'setSidebarCollapsed' | 'hydrateSettings'>>) => void
}

export const usePlatformStore = create<PlatformStore>((set) => ({
  locale: 'ar',
  mobileNavOpen: false,
  sidebarCollapsed: false,
  displayCurrency: 'EGP',
  currencyRates: { EGP: 1, USD: 50, EUR: 55, SAR: 13, AED: 13.5 },
  registrationOpen: true,
  maintenanceMode: false,
  paymentInstructions: 'Upload a clear payment reference or screenshot for manual review.',
  maxDevicesGlobal: 2,
  setLocale: (locale) => set({ locale }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  hydrateSettings: (payload) => set((state) => ({ ...state, ...payload })),
}))
