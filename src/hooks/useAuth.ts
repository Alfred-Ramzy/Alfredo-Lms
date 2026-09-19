import { useAuthContext } from '@/contexts/AuthContext'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const context = useAuthContext()
  const store = useAuthStore()

  return {
    ...store,
    initialized: context.initialized,
  }
}
