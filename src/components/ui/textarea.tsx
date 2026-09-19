import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-28 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20',
      className,
    )}
    {...props}
  />
))

Textarea.displayName = 'Textarea'
