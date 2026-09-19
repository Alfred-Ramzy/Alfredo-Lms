import type { UserRole } from '@/types/firebase'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/card'

interface PlaceholderPageProps {
  role: UserRole
  title: string
}

export function PlaceholderPage({ role, title }: PlaceholderPageProps) {
  return (
    <DashboardShell role={role} title={title}>
      <Card className="rounded-[1.75rem] p-8 text-center text-muted-foreground">Coming in Batch 2</Card>
    </DashboardShell>
  )
}
