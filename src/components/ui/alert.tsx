import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger', className)} {...props} />
}
