import { Bell, CheckCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderBy, where } from 'firebase/firestore'

import { Button } from '@/components/ui/button'
import { listenToQuery, updateDocTyped } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import type { NotificationDoc } from '@/types/firebase'

export function NotificationBell() {
  const user = useAuthStore((state) => state.userProfile)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Array<NotificationDoc & { id: string }>>([])

  useEffect(() => {
    if (!user?.uid) return
    return listenToQuery<NotificationDoc>(
      'notifications',
      [where('userId', '==', user.uid), orderBy('createdAt', 'desc')],
      (nextItems) => setItems(nextItems.slice(0, 10)),
    )
  }, [user?.uid])

  const unreadCount = useMemo(() => items.filter((item) => !(item.isRead ?? item.read)).length, [items])

  const markOneRead = async (id: string, href?: string) => {
    await updateDocTyped<Partial<NotificationDoc>>(`notifications/${id}`, { read: true, isRead: true })
    if (href) {
      navigate(href)
      setOpen(false)
    }
  }

  const markAllRead = async () => {
    await Promise.all(items.filter((item) => !(item.isRead ?? item.read)).map((item) => updateDocTyped<Partial<NotificationDoc>>(`notifications/${item.id}`, { read: true, isRead: true })))
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" aria-label="Notifications" onClick={() => setOpen((value) => !value)}>
        <Bell className="size-4" />
        <span className="hidden sm:inline">{unreadCount}</span>
      </Button>
      {open ? (
        <div className="absolute end-0 top-12 z-50 w-[22rem] rounded-[1.5rem] border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Notifications</p>
            <button type="button" className="text-xs text-primary" onClick={() => void markAllRead()}>
              <CheckCheck className="me-1 inline size-3" />Mark all read
            </button>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {items.length === 0 ? <p className="text-sm text-muted-foreground">No notifications yet.</p> : null}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void markOneRead(item.id, item.href)}
                className="block w-full rounded-2xl border border-border p-3 text-start transition hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                  {!(item.isRead ?? item.read) ? <span className="mt-1 size-2 rounded-full bg-primary" /> : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
