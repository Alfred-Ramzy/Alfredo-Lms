import { useState } from 'react'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { BadgeGrid } from '@/components/gamification/BadgeGrid'
import { LevelProgressCard } from '@/components/gamification/LevelProgressCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { updateDocTyped } from '@/lib/firebase/firestore'
import { uploadAvatar } from '@/lib/storage/provider'
import { useAuth } from '@/hooks/useAuth'
import type { UserDoc } from '@/types/firebase'

export default function ProfilePage() {
  const { userProfile } = useAuth()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const saveAvatar = async () => {
    if (!userProfile?.uid || !avatarFile) return
    const avatarUrl = await uploadAvatar(userProfile.uid, avatarFile)
    await updateDocTyped<Pick<UserDoc, 'avatarUrl'>>(`users/${userProfile.uid}`, { avatarUrl })
  }

  return (
    <DashboardShell role="student" title="Profile">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <Card className="rounded-[1.75rem] p-6">
            <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {userProfile?.avatarUrl ? <img src={userProfile.avatarUrl} alt={userProfile.fullName} className="size-20 rounded-full object-cover" /> : userProfile?.fullName?.split(' ').map((part) => part[0]).slice(0, 2).join('')}
            </div>
            <h2 className="text-2xl font-black">{userProfile?.fullName}</h2>
            <p className="mt-2 text-muted-foreground">{userProfile?.email}</p>
            <p className="mt-4 text-sm text-muted-foreground">Streak: {userProfile?.streakCount ?? 0} days</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)} />
              <Button onClick={() => void saveAvatar()} disabled={!avatarFile}>Upload Avatar</Button>
            </div>
          </Card>
          <LevelProgressCard xp={userProfile?.xpPoints ?? 0} />
        </div>
        <Card className="rounded-[1.75rem] p-6">
          <h2 className="text-2xl font-black">Badges</h2>
          <div className="mt-4">
            <BadgeGrid badges={userProfile?.badges ?? []} />
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
}
