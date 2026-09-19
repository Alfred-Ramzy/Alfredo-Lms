import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { MessagesWorkspace } from '@/components/messages/MessagesWorkspace'

export default function MessagesPage() {
  return <DashboardShell role="student" title="Messages"><MessagesWorkspace roleLabel="Student" /></DashboardShell>
}
