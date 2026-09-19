import { useQuery } from '@tanstack/react-query'
import { limit, orderBy } from 'firebase/firestore'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/card'
import { getCollectionDocs } from '@/lib/firebase/firestore'
import type { CourseDoc, NotificationDoc, PaymentDoc, StudentDeviceDoc, UserDoc } from '@/types/firebase'

export default function DashboardPage() {
  const usersQuery = useQuery({ queryKey: ['admin-users-count'], queryFn: () => getCollectionDocs<UserDoc>('users', [limit(50)]) })
  const coursesQuery = useQuery({ queryKey: ['admin-courses-count'], queryFn: () => getCollectionDocs<CourseDoc>('courses', [limit(50)]) })
  const paymentsQuery = useQuery({ queryKey: ['admin-payments-count'], queryFn: () => getCollectionDocs<PaymentDoc>('payments', [orderBy('createdAt', 'desc'), limit(50)]) })
  const devicesQuery = useQuery({ queryKey: ['admin-devices-count'], queryFn: () => getCollectionDocs<StudentDeviceDoc>('studentDevices', [limit(50)]) })
  const notificationsQuery = useQuery({ queryKey: ['admin-activity'], queryFn: () => getCollectionDocs<NotificationDoc>('notifications', [orderBy('createdAt', 'desc'), limit(10)]) })
  const revenue = (paymentsQuery.data ?? []).filter((payment) => ['completed', 'paid'].includes(payment.status)).reduce((sum, payment) => sum + payment.amount, 0)
  const pendingPayments = (paymentsQuery.data ?? []).filter((payment) => payment.status === 'pending').length

  return (
    <DashboardShell role="admin" title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Users</p><p className="mt-3 text-3xl font-black">{usersQuery.data?.length ?? 0}</p></Card>
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Courses</p><p className="mt-3 text-3xl font-black">{coursesQuery.data?.length ?? 0}</p></Card>
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Revenue</p><p className="mt-3 text-3xl font-black">{revenue}</p></Card>
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Pending Payments</p><p className="mt-3 text-3xl font-black">{pendingPayments}</p></Card>
        <Card className="rounded-[1.5rem] p-5"><p className="text-sm text-muted-foreground">Active Devices</p><p className="mt-3 text-3xl font-black">{devicesQuery.data?.length ?? 0}</p></Card>
      </div>
      <Card className="mt-6 rounded-[1.5rem] p-5"><h2 className="text-lg font-bold">Recent Activity</h2><div className="mt-4 space-y-3">{(notificationsQuery.data ?? []).map((item) => <div key={item.id} className="rounded-2xl border border-border p-3"><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.body}</p></div>)}</div></Card>
    </DashboardShell>
  )
}
