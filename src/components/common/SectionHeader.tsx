import type { ReactNode } from 'react'

export function SectionHeader({ title, copy, action }: { title: string; copy?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {copy ? <p className="mt-1 text-sm text-muted-foreground">{copy}</p> : null}
      </div>
      {action}
    </div>
  )
}
