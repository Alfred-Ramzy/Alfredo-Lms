import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { limit, orderBy, where } from 'firebase/firestore'
import { Link } from 'react-router-dom'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCollectionDocs } from '@/lib/firebase/firestore'
import { formatMoney } from '@/lib/utils'
import { usePlatformStore } from '@/stores/platformStore'
import type { CategoryDoc, CourseDoc } from '@/types/firebase'

export default function CatalogPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [level, setLevel] = useState('all')
  const [language, setLanguage] = useState('all')
  const [sort, setSort] = useState<'newest' | 'popular' | 'rating' | 'price-low' | 'price-high'>('newest')
  const [page, setPage] = useState(1)
  const displayCurrency = usePlatformStore((state) => state.displayCurrency)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.toLowerCase().trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const categoriesQuery = useQuery({ queryKey: ['catalog-categories'], queryFn: () => getCollectionDocs<CategoryDoc>('categories', [orderBy('title', 'asc'), limit(30)]) })
  const coursesQuery = useQuery({
    queryKey: ['catalog-courses', page],
    queryFn: () => getCollectionDocs<CourseDoc>('courses', [where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(20)]),
  })

  const filtered = useMemo(() => {
    const data = [...(coursesQuery.data ?? [])]
      .filter((course) => categoryId === 'all' || course.categoryId === categoryId)
      .filter((course) => level === 'all' || course.level === level)
      .filter((course) => language === 'all' || course.language === language)
      .filter((course) => !debouncedSearch || course.title.toLowerCase().includes(debouncedSearch) || course.searchKeywords?.some((keyword) => keyword.includes(debouncedSearch)))
    switch (sort) {
      case 'popular': return data.sort((a, b) => b.studentsCount - a.studentsCount)
      case 'rating': return data.sort((a, b) => b.rating - a.rating)
      case 'price-low': return data.sort((a, b) => a.price - b.price)
      case 'price-high': return data.sort((a, b) => b.price - a.price)
      default: return data
    }
  }, [categoryId, coursesQuery.data, debouncedSearch, language, level, sort])

  return (
    <DashboardShell role="student" title="Course Catalog">
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <Card className="rounded-[1.5rem] p-5">
          <h2 className="text-lg font-bold">Filters</h2>
          <div className="mt-4 space-y-4">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses" />
            <select className="h-12 w-full rounded-2xl border border-border bg-card px-4" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="all">All categories</option>
              {(categoriesQuery.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
            </select>
            <select className="h-12 w-full rounded-2xl border border-border bg-card px-4" value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="all">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
            </select>
            <select className="h-12 w-full rounded-2xl border border-border bg-card px-4" value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="all">All languages</option><option value="en">English</option><option value="ar">Arabic</option><option value="both">Bilingual</option>
            </select>
            <select className="h-12 w-full rounded-2xl border border-border bg-card px-4" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
              <option value="newest">Newest</option><option value="popular">Popular</option><option value="rating">Rating</option><option value="price-low">Price Low-High</option><option value="price-high">Price High-Low</option>
            </select>
          </div>
        </Card>
        <div>
          <div className="mb-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {page} · 20 per page</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))}>Prev</Button><Button size="sm" variant="outline" onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course) => {
              const isPkg = course.isPackage || course.id === 'first-month-package'
              return (
                <Card key={course.id} className="group overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-glow">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 border border-border/60">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="size-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-muted-foreground">Alfredo LMS</div>
                    )}
                    {isPkg ? (
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-[11px] font-black text-black shadow-md">
                        🎁 باكدج شامل (4 حصص)
                      </div>
                    ) : (
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/20">
                        حصة {course.id.replace('lesson-', '#')}
                      </div>
                    )}
                    <div className="absolute bottom-2.5 left-2.5 rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{course.liveScheduleAr ?? course.liveSchedule ?? 'كل أربعاء 6:00 م'}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5">
                    <h3 className="text-base font-bold text-foreground leading-snug">{course.titleAr ?? course.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{course.descriptionAr ?? course.description}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <div>
                      <span className="text-xs text-muted-foreground block">السعر</span>
                      <span className="text-lg font-black text-foreground">
                        {formatMoney(course.discountPrice ?? course.price, displayCurrency)}
                      </span>
                    </div>
                    <Link
                      to={`/student/courses/${course.id}`}
                      className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    >
                      تفاصيل واشتراك
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
