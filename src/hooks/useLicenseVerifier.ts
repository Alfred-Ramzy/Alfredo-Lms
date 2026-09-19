import { useEffect } from 'react'

import { LICENSE_CHECK_INTERVAL_MS } from '@/lib/constants'
import { verifyLicenseStatus } from '@/lib/license/verifier'
import { useLicenseStore } from '@/stores/licenseStore'

export function useLicenseVerifier() {
  const setStatus = useLicenseStore((state) => state.setStatus)
  const setLoading = useLicenseStore((state) => state.setLoading)
  const registerFailure = useLicenseStore((state) => state.registerFailure)

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        setLoading(true)
        const status = await verifyLicenseStatus()
        if (active) {
          setStatus(status)
        }
      } catch {
        if (active) {
          registerFailure()
        }
      }
    }

    void run()
    const intervalId = window.setInterval(() => void run(), LICENSE_CHECK_INTERVAL_MS)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [registerFailure, setLoading, setStatus])
}
