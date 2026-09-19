import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { MessagesWorkspace } from '@/components/messages/MessagesWorkspace'

export default function MessagesPage() {
  return <DashboardShell role="instructor" title="Messages"><MessagesWorkspace roleLabel="Instructor" /></DashboardShell>
}
