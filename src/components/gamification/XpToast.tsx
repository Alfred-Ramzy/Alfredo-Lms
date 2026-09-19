import { Sparkles } from 'lucide-react'

export function XpToast({ amount }: { amount: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
      <Sparkles className="size-4" />
      +{amount} XP
    </div>
  )
}
