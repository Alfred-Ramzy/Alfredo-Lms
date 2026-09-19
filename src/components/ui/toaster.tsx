import { useEffect } from 'react'

import { useToastStore } from '@/components/ui/toast'

export function Toaster() {
  const items = useToastStore((state) => state.items)
  const remove = useToastStore((state) => state.remove)

  useEffect(() => {
    const timers = items.map((item) => window.setTimeout(() => remove(item.id), 3500))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [items, remove])

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-3 sm:inset-x-auto sm:end-4">
      {items.map((item) => (
        <div key={item.id} className="glass-panel pointer-events-auto max-w-sm rounded-3xl px-4 py-3 text-start shadow-glow">
          <p className="font-semibold text-foreground">{item.title}</p>
          {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
        </div>
      ))}
    </div>
  )
}
