import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { setDocTyped } from '@/lib/firebase/firestore'
import { usePlatformStore } from '@/stores/platformStore'
import { useState } from 'react'

import type { CurrencyCode, PlatformSettingDoc } from '@/types/firebase'

export default function SettingsPage() {
  const displayCurrency = usePlatformStore((state) => state.displayCurrency)
  const paymentInstructions = usePlatformStore((state) => state.paymentInstructions)
  const maxDevicesGlobal = usePlatformStore((state) => state.maxDevicesGlobal)
  const [currency, setCurrency] = useState<CurrencyCode>(displayCurrency)
  const [instructions, setInstructions] = useState(paymentInstructions)
  const [maxDevices, setMaxDevices] = useState(String(maxDevicesGlobal))
  const [licenseStatus, setLicenseStatus] = useState<'active' | 'expired' | 'suspended'>('active')

  const save = async () => {
    if (licenseStatus !== 'active' && !window.confirm('Suspending or expiring the license will lock down the platform. Continue?')) {
      return
    }
    await Promise.all([
      setDocTyped<PlatformSettingDoc>('platformSettings/display_currency', { key: 'display_currency', value: currency, updatedAt: new Date() }),
      setDocTyped<PlatformSettingDoc>('platformSettings/payment_instructions', { key: 'payment_instructions', value: instructions, updatedAt: new Date() }),
      setDocTyped<PlatformSettingDoc>('platformSettings/max_devices_global', { key: 'max_devices_global', value: Number(maxDevices), updatedAt: new Date() }),
      setDocTyped<PlatformSettingDoc>('platformSettings/license_status', { key: 'license_status', value: licenseStatus, updatedAt: new Date() }),
    ])
  }

  return (
    <DashboardShell role="admin" title="Settings">
      <Card className="rounded-[1.5rem] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <select className="h-12 rounded-2xl border border-border bg-card px-4" value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}><option value="EGP">EGP</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="SAR">SAR</option><option value="AED">AED</option></select>
          <Input value={maxDevices} onChange={(event) => setMaxDevices(event.target.value)} placeholder="Global device limit" />
          <select className="h-12 rounded-2xl border border-border bg-card px-4" value={licenseStatus} onChange={(event) => setLicenseStatus(event.target.value as 'active' | 'expired' | 'suspended')}><option value="active">active</option><option value="expired">expired</option><option value="suspended">suspended</option></select>
          <Input className="md:col-span-2" value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Payment instructions" />
        </div>
        <Button className="mt-4" onClick={() => void save()}>Save Settings</Button>
      </Card>
    </DashboardShell>
  )
}
