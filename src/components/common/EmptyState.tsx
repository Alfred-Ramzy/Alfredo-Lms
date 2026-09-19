import type { ReactNode } from 'react'

export function EmptyState({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
