import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addDoc, collection, limit, orderBy } from 'firebase/firestore'
import { Check, Copy, KeyRound, Sparkles } from 'lucide-react'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/firebase/config'
import { getCollectionDocs } from '@/lib/firebase/firestore'
import type { ActivationCodeDoc } from '@/types/firebase'

import { getRedeemedCodes } from '@/lib/activation/redeemActivationCode'

const SECURE_ALFREDO_CODES = [
  // First Month Package
  { code: 'PKG-9X2M-7W5K-8P4D', target: 'First Month Package (الباكدج الشامل 4 حصص)', isPackage: true },
  { code: 'PKG-4R8B-3Y7N-2V6T', target: 'First Month Package (الباكدج الشامل 4 حصص)', isPackage: true },
  { code: 'PKG-7W3K-8M2P-9D4R', target: 'First Month Package (الباكدج الشامل 4 حصص)', isPackage: true },
  { code: 'PKG-2N6E-5V8T-3K9Y', target: 'First Month Package (الباكدج الشامل 4 حصص)', isPackage: true },
  { code: 'PKG-8D4R-9M2W-7K3P', target: 'First Month Package (الباكدج الشامل 4 حصص)', isPackage: true },

  // Lesson 1
  { code: 'L1-7K9P-X4W2-8M1Q', target: 'Lesson 1: Foundations', isPackage: false },
  { code: 'L1-B5R8-2Y6D-9H3J', target: 'Lesson 1: Foundations', isPackage: false },
  { code: 'L1-4V8M-E3W7-T6N2', target: 'Lesson 1: Foundations', isPackage: false },
  { code: 'L1-9C2F-K8P5-X7R4', target: 'Lesson 1: Foundations', isPackage: false },
  { code: 'L1-H3J7-W2M9-4Q6T', target: 'Lesson 1: Foundations', isPackage: false },

  // Lesson 2
  { code: 'L2-8N3V-6K1P-9Y4D', target: 'Lesson 2: Practice', isPackage: false },
  { code: 'L2-3X7Q-W5M2-R8B4', target: 'Lesson 2: Practice', isPackage: false },
  { code: 'L2-K4P8-9D2Y-7W3M', target: 'Lesson 2: Practice', isPackage: false },
  { code: 'L2-E6N1-T4V8-5H2J', target: 'Lesson 2: Practice', isPackage: false },
  { code: 'L2-9M5R-2Y7B-4K8P', target: 'Lesson 2: Practice', isPackage: false },

  // Lesson 3
  { code: 'L3-5W2M-8P4K-9D7R', target: 'Lesson 3: Projects', isPackage: false },
  { code: 'L3-9Y3J-4B7N-2V6E', target: 'Lesson 3: Projects', isPackage: false },
  { code: 'L3-R7K4-2M8W-5P1Q', target: 'Lesson 3: Projects', isPackage: false },
  { code: 'L3-2D9Y-6T3V-8K4P', target: 'Lesson 3: Projects', isPackage: false },
  { code: 'L3-B8M5-7W2R-3N9K', target: 'Lesson 3: Projects', isPackage: false },

  // Lesson 4
  { code: 'L4-3P8K-9W4R-7D2Y', target: 'Lesson 4: AI Tools', isPackage: false },
  { code: 'L4-6V2N-8M5T-4Q7B', target: 'Lesson 4: AI Tools', isPackage: false },
  { code: 'L4-7K3D-2Y8P-5W9M', target: 'Lesson 4: AI Tools', isPackage: false },
  { code: 'L4-9R4B-7N2V-8E1K', target: 'Lesson 4: AI Tools', isPackage: false },
  { code: 'L4-4M8P-3W7K-9D5R', target: 'Lesson 4: AI Tools', isPackage: false },
]

function generateCodes(count: number, prefix: string) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  return Array.from({ length: count }, () => {
    const r = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `${prefix}-${r()}-${r()}-${r()}`
  })
}

export default function ActivationCodesPage() {
  const [targetType, setTargetType] = useState('package')
  const [count, setCount] = useState('5')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const codesQuery = useQuery({
    queryKey: ['admin-activation-codes'],
    queryFn: () => getCollectionDocs<ActivationCodeDoc>('activationCodes', [orderBy('createdAt', 'desc'), limit(100)]),
  })

  const copy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const generate = async () => {
    const safeCount = Math.min(100, Math.max(1, Number(count) || 1))
    const isPkg = targetType === 'package'
    const prefix = isPkg ? 'PKG-ALF' : targetType === 'lesson-1' ? 'L1-ALF' : targetType === 'lesson-2' ? 'L2-ALF' : targetType === 'lesson-3' ? 'L3-ALF' : 'L4-ALF'
    const newCodes = generateCodes(safeCount, prefix)

    try {
      await Promise.all(
        newCodes.map((code) =>
          addDoc(collection(db, 'activationCodes'), {
            code,
            batchName: isPkg ? 'First Month Package Codes' : `Lesson ${targetType} Codes`,
            courseId: isPkg ? 'first-month-package' : targetType,
            isPackage: isPkg,
            packageCourseIds: isPkg ? ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'] : undefined,
            maxUses: 1,
            usedCount: 0,
            active: true,
            isActive: true,
            isUsed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } satisfies Partial<ActivationCodeDoc>),
        ),
      )
      await codesQuery.refetch()
    } catch (e) {
      console.warn('Firestore code generation error (using presets):', e)
    }
  }

  return (
    <DashboardShell role="admin" title="أكواد التفعيل (Activation Codes)">
      {/* Code Generation Card */}
      <Card className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">توليد أكواد تفعيل جديدة</h2>
            <p className="text-xs text-muted-foreground">أنشئ أكواداً لفتح الحصص المنفردة أو لباكدج الشهر الأول</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold block mb-1">نوع الكود المستهدف</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
            >
              <option value="package">🎁 باكدج الشهر الأول (يفتح الـ 4 حصص)</option>
              <option value="lesson-1">الحصة 1: أساسيات البرمجة (Lesson 1)</option>
              <option value="lesson-2">الحصة 2: التطبيق والممارسة (Lesson 2)</option>
              <option value="lesson-3">الحصة 3: المشاريع العملية (Lesson 3)</option>
              <option value="lesson-4">الحصة 4: أدوات الذكاء الاصطناعي (Lesson 4)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">العدد المطلوب</label>
            <Input value={count} onChange={(e) => setCount(e.target.value)} placeholder="العدد 1-100" className="h-11 rounded-2xl" />
          </div>
          <div className="flex items-end">
            <Button onClick={() => void generate()} className="h-11 w-full rounded-2xl font-bold">
              <Sparkles className="size-4 mr-1" />
              توليد الأكواد
            </Button>
          </div>
        </div>
      </Card>

      {/* Preset Alfredo Official Codes */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">الأكواد العشوائية المؤمنة للاستخدام لمرة واحدة (25 كود)</h3>
            <p className="text-xs text-muted-foreground">صعبة التوقع وتفتح الحصة أو الباكدج لمرة واحدة فقط. اضغط لنسخ الكود:</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECURE_ALFREDO_CODES.map((item) => {
            const redeemed = getRedeemedCodes().some((r) => r.code === item.code)
            return (
              <Card
                key={item.code}
                onClick={() => copy(item.code)}
                className={`cursor-pointer rounded-2xl border p-4 transition duration-200 hover:shadow-soft ${
                  redeemed
                    ? 'border-red-500/30 bg-red-500/5 opacity-70'
                    : 'border-border/80 bg-card/90 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black tracking-wider text-foreground">{item.code}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        redeemed
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {redeemed ? 'مُستخدم ⛔' : 'متاح للاستخدام ✅'}
                    </span>
                    <button className="text-muted-foreground hover:text-foreground">
                      {copiedCode === item.code ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">{item.target}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}

