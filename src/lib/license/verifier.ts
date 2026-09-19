import { getPlatformSetting } from '@/lib/firebase/firestore'
import type { LicenseStatus } from '@/stores/licenseStore'

export async function verifyLicenseStatus(): Promise<LicenseStatus> {
  const setting = await getPlatformSetting<LicenseStatus>('license_status')
  if (!setting?.value || (setting.value !== 'active' && setting.value !== 'expired' && setting.value !== 'suspended')) {
    return 'active'
  }

  return setting.value
}
