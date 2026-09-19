import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { limit, orderBy } from 'firebase/firestore'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCollectionDocs, updateDocTyped } from '@/lib/firebase/firestore'
import { uploadAvatar } from '@/lib/storage/provider'
import type { UserDoc, UserRole } from '@/types/firebase'

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState('all')
  const [avatarFiles, setAvatarFiles] = useState<Record<string, File | null>>({})
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: () => getCollectionDocs<UserDoc>('users', [orderBy('createdAt', 'desc'), limit(50)]) })
  const users = (usersQuery.data ?? []).filter((user) => roleFilter === 'all' || user.role === roleFilter)

  const updateUserRole = async (id: string, role: UserRole) => updateDocTyped<Pick<UserDoc, 'role'>>(`users/${id}`, { role })
  const updateUserActive = async (id: string, isActive: boolean) => updateDocTyped<Pick<UserDoc, 'isActive'>>(`users/${id}`, { isActive })
  const updateUserAvatar = async (id: string) => {
    const file = avatarFiles[id]
    if (!file) return
    const avatarUrl = await uploadAvatar(id, file)
    await updateDocTyped<Pick<UserDoc, 'avatarUrl'>>(`users/${id}`, { avatarUrl })
  }

  return (
    <DashboardShell role="admin" title="Users">
      <div className="mb-4 flex gap-3"><select className="h-11 rounded-2xl border border-border bg-card px-4" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="all">All roles</option><option value="admin">Admin</option><option value="instructor">Instructor</option><option value="student">Student</option></select></div>
      <div className="space-y-3">{users.map((user) => <Card key={user.id} className="rounded-[1.5rem] p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">{user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} className="size-12 object-cover" /> : user.fullName.split(' ').map((part) => part[0]).slice(0,2).join('')}</div><div><p className="font-semibold">{user.fullName}</p><p className="text-sm text-muted-foreground">{user.email}</p></div></div><div className="flex flex-wrap gap-2"><select className="h-10 rounded-xl border border-border bg-card px-3" value={user.role} onChange={(event) => void updateUserRole(user.id, event.target.value as UserRole)}><option value="admin">Admin</option><option value="instructor">Instructor</option><option value="student">Student</option></select><Button size="sm" variant="outline" onClick={() => void updateUserActive(user.id, !user.isActive)}>{user.isActive ? 'Deactivate' : 'Activate'}</Button></div></div><div className="mt-4 flex flex-wrap gap-3"><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setAvatarFiles((state) => ({ ...state, [user.id]: event.target.files?.[0] ?? null }))} /><Button size="sm" onClick={() => void updateUserAvatar(user.id)} disabled={!avatarFiles[user.id]}>Upload Avatar</Button></div></Card>)}</div>
    </DashboardShell>
  )
}
