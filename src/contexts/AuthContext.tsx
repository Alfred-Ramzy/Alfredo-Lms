import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

import { subscribeToAuth } from '@/lib/firebase/auth'
import { ensureGoogleProfile, getUserProfile } from '@/lib/firebase/firestore'
import { awardXp, updateStreak } from '@/lib/gamification'
import { useAuthStore } from '@/stores/authStore'

interface AuthContextValue {
  initialized: boolean
}

const AuthContext = createContext<AuthContextValue>({ initialized: false })

export function AuthProvider({ children }: PropsWithChildren) {
  const setAuthState = useAuthStore((state) => state.setAuthState)
  const clearAuthState = useAuthStore((state) => state.clearAuthState)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (!firebaseUser) {
        clearAuthState()
        setInitialized(true)
        return
      }

      let profile = await getUserProfile(firebaseUser.uid)

      if (!profile && firebaseUser.email) {
        profile = await ensureGoogleProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName ?? firebaseUser.email.split('@')[0] ?? 'Student',
          avatarUrl: firebaseUser.photoURL,
          preferredLocale: 'ar',
          preferredTheme: 'system',
        })
      }

      setAuthState({ firebaseUser, userProfile: profile, isLoading: false })
      void awardXp(firebaseUser.uid, 'first_login', { sourceDocPath: `users/${firebaseUser.uid}`, sourceField: 'xpAwarded_first_login' })
      void updateStreak(firebaseUser.uid)
      setInitialized(true)
    })

    return unsubscribe
  }, [clearAuthState, setAuthState])

  const value = useMemo(() => ({ initialized }), [initialized])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}
