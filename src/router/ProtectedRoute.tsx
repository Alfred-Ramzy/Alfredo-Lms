import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { PageSkeleton } from '@/components/common/PageSkeleton'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardPath } from '@/lib/utils'
import type { UserRole } from '@/types/firebase'

interface ProtectedRouteProps extends PropsWithChildren {
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { initialized, isLoading, isAuthenticated, role, userProfile } = useAuth()

  if (!initialized || isLoading) {
    return <PageSkeleton />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (userProfile && !userProfile.isActive) {
    return <Navigate to="/activation-required" replace />
  }

  if (!role) {
    return <PageSkeleton />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />
  }

  return <>{children}</>
}
