import { useEffect } from 'react'

import { getPlatformSetting } from '@/lib/firebase/firestore'
import { usePlatformStore } from '@/stores/platformStore'
import type { CurrencyCode } from '@/types/firebase'

export function usePlatformSettings() {
  const hydrateSettings = usePlatformStore((state) => state.hydrateSettings)

  useEffect(() => {
    const load = async () => {
      const [displayCurrency, currencyRates, registrationOpen, maintenanceMode, paymentInstructions, maxDevicesGlobal] = await Promise.all([
        getPlatformSetting<CurrencyCode>('display_currency'),
        getPlatformSetting<Partial<Record<CurrencyCode, number>>>('currency_rates'),
        getPlatformSetting<boolean>('registration_open'),
        getPlatformSetting<boolean>('maintenance_mode'),
        getPlatformSetting<string>('payment_instructions'),
        getPlatformSetting<number>('max_devices_global'),
      ])

      hydrateSettings({
        displayCurrency: displayCurrency?.value ?? 'EGP',
        currencyRates: currencyRates?.value ?? { EGP: 1, USD: 50, EUR: 55, SAR: 13, AED: 13.5 },
        registrationOpen: registrationOpen?.value ?? true,
        maintenanceMode: maintenanceMode?.value ?? false,
        paymentInstructions: paymentInstructions?.value ?? 'Upload a clear payment reference or screenshot for manual review.',
        maxDevicesGlobal: maxDevicesGlobal?.value ?? 2,
      })
    }

    void load()
  }, [hydrateSettings])
}
