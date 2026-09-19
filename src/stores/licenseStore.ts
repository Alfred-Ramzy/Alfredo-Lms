import { create } from 'zustand'

export type LicenseStatus = 'active' | 'suspended' | 'expired'

interface LicenseStore {
  status: LicenseStatus
  checkedAt: number | null
  failedChecks: number
  isLoading: boolean
  setStatus: (status: LicenseStatus) => void
  setLoading: (value: boolean) => void
  registerFailure: () => void
}

export const useLicenseStore = create<LicenseStore>((set) => ({
  status: 'active',
  checkedAt: null,
  failedChecks: 0,
  isLoading: true,
  setStatus: (status) => set({ status, checkedAt: Date.now(), isLoading: false, failedChecks: 0 }),
  setLoading: (isLoading) => set({ isLoading }),
  registerFailure: () => set((state) => ({ failedChecks: state.failedChecks + 1, checkedAt: Date.now(), isLoading: false, status: state.failedChecks + 1 >= 3 ? 'suspended' : state.status })),
}))
