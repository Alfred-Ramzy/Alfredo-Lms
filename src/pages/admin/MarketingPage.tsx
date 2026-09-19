import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { limit } from 'firebase/firestore'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createNotification, getCollectionDocs } from '@/lib/firebase/firestore'
import type { UserDoc } from '@/types/firebase'

export default function MarketingPage() {
  const [title, setTitle] = useState('New campaign')
  const [body, setBody] = useState('A fresh learning offer is ready.')
  const usersQuery = useQuery({ queryKey: ['admin-marketing-users'], queryFn: () => getCollectionDocs<UserDoc>('users', [limit(100)]) })

  const sendCampaign = async () => {
    await Promise.all((usersQuery.data ?? []).map((user) => createNotification({ userId: user.uid, title, body, titleAr: title, bodyAr: body, type: 'system', href: '/student/catalog' })))
  }

  return (
    <DashboardShell role="admin" title="Marketing">
      <Card className="rounded-[1.5rem] p-6">
        <h2 className="text-xl font-bold">Campaign Wizard</h2>
        <div className="mt-4 space-y-4"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Campaign title" /><Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Arabic and English friendly content" /><Button onClick={() => void sendCampaign()}>Send Now</Button></div>
      </Card>
    </DashboardShell>
  )
}
