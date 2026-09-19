import { useQuery } from '@tanstack/react-query'
import { limit, orderBy } from 'firebase/firestore'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getCollectionDocs, updateDocTyped } from '@/lib/firebase/firestore'
import type { StudentDeviceDoc } from '@/types/firebase'

export default function DevicesPage() {
  const devicesQuery = useQuery({ queryKey: ['admin-devices'], queryFn: () => getCollectionDocs<StudentDeviceDoc>('studentDevices', [orderBy('updatedAt', 'desc'), limit(50)]) })

  return (
    <DashboardShell role="admin" title="Devices">
      <div className="space-y-3">{(devicesQuery.data ?? []).map((device) => <Card key={device.id} className="rounded-[1.5rem] p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold">{device.label}</p><p className="text-sm text-muted-foreground">{device.studentId} · {device.status ?? 'active'}</p></div><Button size="sm" variant="outline" onClick={() => void updateDocTyped<Partial<StudentDeviceDoc>>(`studentDevices/${device.id}`, { status: 'revoked', updatedAt: new Date() })}>Revoke</Button></div></Card>)}</div>
    </DashboardShell>
  )
}
