import { Navigate } from 'react-router-dom'

import { PageSkeleton } from '@/components/common/PageSkeleton'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardPath } from '@/lib/utils'

export function RoleRedirect() {
  const { initialized, isLoading, isAuthenticated, role } = useAuth()

  if (!initialized || isLoading) {
    return <PageSkeleton />
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(role)} replace />
  }

  return <Navigate to="/" replace />
}
