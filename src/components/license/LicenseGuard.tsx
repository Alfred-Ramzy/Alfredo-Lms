import type { PropsWithChildren } from 'react'

import { LockdownScreen } from '@/components/license/LockdownScreen'
import { PageSkeleton } from '@/components/common/PageSkeleton'
import { useLicenseVerifier } from '@/hooks/useLicenseVerifier'
import { useLicenseStore } from '@/stores/licenseStore'

export function LicenseGuard({ children }: PropsWithChildren) {
  useLicenseVerifier()

  const status = useLicenseStore((state) => state.status)
  const isLoading = useLicenseStore((state) => state.isLoading)

  if (isLoading) {
    return <PageSkeleton />
  }

  if (status === 'expired' || status === 'suspended') {
    return <LockdownScreen />
  }

  return <>{children}</>
}
