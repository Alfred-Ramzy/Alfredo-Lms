import type { User } from 'firebase/auth'
import { create } from 'zustand'

import { getUserProfile } from '@/lib/firebase/firestore'
import type { UserDoc, UserRole } from '@/types/firebase'

interface AuthStore {
  firebaseUser: User | null
  userProfile: UserDoc | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuthState: (payload: { firebaseUser: User | null; userProfile: UserDoc | null; isLoading?: boolean }) => void
  clearAuthState: () => void
  refreshProfile: (uid?: string) => Promise<UserDoc | null>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  firebaseUser: null,
  userProfile: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  setAuthState: ({ firebaseUser, userProfile, isLoading = false }) => {
    set({
      firebaseUser,
      userProfile,
      role: userProfile?.role ?? null,
      isAuthenticated: Boolean(firebaseUser),
      isLoading,
    })
  },
  clearAuthState: () => {
    set({
      firebaseUser: null,
      userProfile: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },
  refreshProfile: async (uid) => {
    const currentUid = uid ?? get().firebaseUser?.uid
    if (!currentUid) {
      return null
    }

    const profile = await getUserProfile(currentUid)
    set({ userProfile: profile, role: profile?.role ?? null })
    return profile
  },
}))
