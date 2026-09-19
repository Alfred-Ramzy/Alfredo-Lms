import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton() {
  return (
    <div className="container flex min-h-screen flex-col gap-6 py-10">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    </div>
  )
}
