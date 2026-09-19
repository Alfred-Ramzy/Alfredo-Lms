import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { limit, orderBy } from 'firebase/firestore'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  Phone,
  RotateCcw,
  Search,
  Sparkles,
  User,
  Wallet,
  X,
  XCircle,
  ZoomIn,
} from 'lucide-react'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { approvePaymentAndEnroll, getCollectionDocs, getDocTyped, updateDocTyped } from '@/lib/firebase/firestore'
import { formatMoney } from '@/lib/utils'
import { usePlatformStore } from '@/stores/platformStore'
import type { CourseDoc, PaymentDoc } from '@/types/firebase'

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProof, setSelectedProof] = useState<{ url: string; title: string; student: string } | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const displayCurrency = usePlatformStore((state) => state.displayCurrency)

  const paymentsQuery = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => getCollectionDocs<PaymentDoc>('payments', [orderBy('createdAt', 'desc'), limit(100)]),
    refetchInterval: 5000,
  })

  const payments = paymentsQuery.data ?? []

  // Metrics
  const pendingCount = useMemo(() => payments.filter((p) => p.status === 'pending').length, [payments])
  const completedCount = useMemo(() => payments.filter((p) => p.status === 'completed' || p.status === 'paid').length, [payments])
  const rejectedCount = useMemo(() => payments.filter((p) => p.status === 'rejected').length, [payments])
  const totalRevenue = useMemo(
    () => payments.filter((p) => p.status === 'completed' || p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments],
  )

  // Filtered List
  const filtered = useMemo(() => {
    return payments
      .filter((payment) => {
        if (statusFilter === 'all') return true
        if (statusFilter === 'completed') return payment.status === 'completed' || payment.status === 'paid'
        return payment.status === statusFilter
      })
      .filter((payment) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase().trim()
        return (
          payment.studentName?.toLowerCase().includes(query) ||
          payment.studentEmail?.toLowerCase().includes(query) ||
          payment.courseTitle?.toLowerCase().includes(query) ||
          payment.referenceId?.toLowerCase().includes(query) ||
          payment.provider?.toLowerCase().includes(query)
        )
      })
  }, [payments, statusFilter, searchQuery])

  const approve = async (payment: PaymentDoc & { id: string }) => {
    if (!payment.courseId) return
    try {
      setProcessingId(payment.id)
      setActionMessage(null)
      const course = await getDocTyped<CourseDoc>(`courses/${payment.courseId}`)
      if (!course) {
        throw new Error('Course document not found.')
      }

      await approvePaymentAndEnroll({ paymentId: payment.id, payment, course })
      setActionMessage(`تمت الموافقة وتفعيل الاشتراك للطالب: ${payment.studentName ?? 'الطالب'} بنجاح!`)
      await paymentsQuery.refetch()
    } catch (err) {
      console.error('Approval failed:', err)
      setActionMessage(err instanceof Error ? err.message : 'فشل اعتماد الدفع.')
    } finally {
      setProcessingId(null)
    }
  }

  const reject = async (paymentId: string) => {
    try {
      setProcessingId(paymentId)
      await updateDocTyped<Partial<PaymentDoc>>(`payments/${paymentId}`, {
        status: 'rejected',
        updatedAt: new Date(),
      })
      setActionMessage('تم رفض طلب الدفع.')
      await paymentsQuery.refetch()
    } catch (err) {
      console.error('Rejection failed:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'vodafone_cash':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-500 border border-red-500/20">📱 فودافون كاش</span>
      case 'instapay':
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-500 border border-purple-500/20">⚡ إنستاباي</span>
      case 'fawry':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 border border-amber-500/20">🏪 فوري</span>
      case 'activation_code':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500 border border-blue-500/20">🎟️ كود تفعيل</span>
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{provider}</span>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-500 border border-amber-500/30 animate-pulse">
            <Clock className="size-3.5" />
            قيد المراجعة (Pending)
          </span>
        )
      case 'completed':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/30">
            <CheckCircle2 className="size-3.5" />
            تمت الموافقة والتفعيل
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive border border-destructive/30">
            <XCircle className="size-3.5" />
            مرفوض (Rejected)
          </span>
        )
      default:
        return <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{status}</span>
    }
  }

  const formatDate = (val: unknown) => {
    if (!val) return 'الآن'
    if (typeof val === 'object' && val !== null && 'toDate' in val) {
      return (val as { toDate: () => Date }).toDate().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
    }
    if (val instanceof Date) {
      return val.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
    }
    return String(val)
  }

  return (
    <DashboardShell role="admin" title="مراجعة وتأكيد المدفوعات">
      {/* Toast Notification */}
      {actionMessage ? (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-foreground backdrop-blur">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {/* KPI Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[1.75rem] border border-amber-500/30 bg-amber-500/5 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">تحتاج مراجعة</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-amber-500">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">طلبات بانتظار فحص إيصال الدفع</p>
        </Card>

        <Card className="rounded-[1.75rem] border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">تم تفعيلها</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
              <Check className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-500">{completedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">اشتراكات مفعلة بنجاح</p>
        </Card>

        <Card className="rounded-[1.75rem] border border-primary/30 bg-primary/5 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">إجمالي التحصيلات</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Wallet className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-foreground">{formatMoney(totalRevenue, displayCurrency)}</p>
          <p className="text-xs text-muted-foreground mt-1">المدفوعات المعتمدة</p>
        </Card>

        <Card className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">طلبات مرفوضة</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <XCircle className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-muted-foreground">{rejectedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">إيصالات غير مطابقة أو ملغية</p>
        </Card>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'pending', 'completed', 'rejected'] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl font-semibold"
              onClick={() => setStatusFilter(filter)}
            >
              {filter === 'all' && `الكل (${payments.length})`}
              {filter === 'pending' && `المعلقة (${pendingCount})`}
              {filter === 'completed' && `المعتمدة (${completedCount})`}
              {filter === 'rejected' && `المرفوضة (${rejectedCount})`}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب، البريد، أو المرجع..."
            className="pr-10 rounded-2xl"
          />
        </div>
      </div>

      {/* Payments Grid */}
      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <Card className="rounded-[2rem] border border-dashed border-border p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Filter className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold">لا توجد طلبات دفع مطابقة</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {statusFilter === 'pending'
                ? 'رائع! لا توجد حالياً أي طلبات دفع معلقة تحتاج للمراجعة.'
                : 'لم يتم العثور على أي نتائج وفقاً لخيارات التصفية الحالية.'}
            </p>
          </Card>
        ) : (
          filtered.map((payment) => {
            const isPkg = payment.isPackage || payment.courseId === 'first-month-package'
            const isPending = payment.status === 'pending'

            return (
              <Card
                key={payment.id}
                className={`overflow-hidden rounded-[2rem] border transition-all duration-200 ${
                  isPending
                    ? 'border-amber-500/40 bg-card/95 shadow-soft hover:border-amber-500/60'
                    : 'border-border/80 bg-card/80 hover:border-border'
                }`}
              >
                <div className="p-6">
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                    {/* Left: Student & Order Info */}
                    <div className="space-y-4">
                      {/* Top status & provider bar */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {getStatusBadge(payment.status)}
                        {getProviderBadge(payment.provider)}
                        {isPkg ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-3 py-0.5 text-xs font-extrabold text-amber-500 border border-amber-500/30">
                            <Layers className="size-3" />
                            باكدج الشهر الأول (4 حصص)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500 border border-blue-500/20">
                            🎯 حصة منفردة
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground mr-auto">{formatDate(payment.createdAt)}</span>
                      </div>

                      {/* Course Title & Student Data */}
                      <div>
                        <h3 className="text-xl font-black text-foreground">{payment.courseTitle ?? payment.courseId}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <User className="size-3.5 text-primary" />
                            {payment.studentName ?? 'طالب'}
                          </span>
                          {payment.studentEmail ? (
                            <span className="font-mono">{payment.studentEmail}</span>
                          ) : null}
                          {payment.referenceId ? (
                            <span className="flex items-center gap-1 rounded-lg bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
                              <Phone className="size-3" />
                              المرجع: {payment.referenceId}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Payment Proof / Receipt Thumbnail & Preview */}
                      {payment.proofUrl ? (
                        <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
                          <div
                            className="relative group size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border bg-slate-950"
                            onClick={() =>
                              setSelectedProof({
                                url: payment.proofUrl!,
                                title: payment.courseTitle ?? 'إيصال تحويل الدفع',
                                student: payment.studentName ?? 'طالب',
                              })
                            }
                          >
                            <img src={payment.proofUrl} alt="Receipt" className="size-full object-cover transition group-hover:scale-110" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                              <ZoomIn className="size-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground">لقطة شاشة إثبات التحويل (Receipt Proof)</p>
                            <p className="text-[11px] text-muted-foreground">تم رفع الإيصال بواسطة الطالب لمراجعة العملية.</p>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProof({
                                  url: payment.proofUrl!,
                                  title: payment.courseTitle ?? 'إيصال تحويل الدفع',
                                  student: payment.studentName ?? 'طالب',
                                })
                              }
                              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              <Eye className="size-3.5" />
                              اضغط لمعاينة الإيصال وتكبيره
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                          <AlertCircle className="size-4" />
                          <span>لم يتم إرفاق إيصال تحويل مع هذا الطلب.</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Amount & Action Buttons */}
                    <div className="flex flex-col justify-between items-end border-t border-border pt-4 lg:border-t-0 lg:border-r lg:border-border lg:pr-6 lg:pt-0">
                      <div className="text-right">
                        <span className="text-xs font-medium text-muted-foreground">المبلغ المدفوع</span>
                        <p className="text-3xl font-black text-foreground">
                          {formatMoney(payment.amount, displayCurrency)}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 w-full lg:w-auto justify-end">
                        {isPending ? (
                          <>
                            <Button
                              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow"
                              disabled={processingId === payment.id}
                              onClick={() => void approve(payment)}
                            >
                              <CheckCircle2 className="size-4 mr-1" />
                              {processingId === payment.id ? 'جاري التفعيل...' : 'موافقة وتفعيل الاشتراك'}
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                              disabled={processingId === payment.id}
                              onClick={() => void reject(payment.id)}
                            >
                              <XCircle className="size-4 mr-1" />
                              رفض الطلب
                            </Button>
                          </>
                        ) : payment.status === 'rejected' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            disabled={processingId === payment.id}
                            onClick={() => void approve(payment)}
                          >
                            <RotateCcw className="size-3.5 mr-1" />
                            إعادة التفعيل والموافقة
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                            <Check className="size-3.5" />
                            الحساب نشط ومفعّل
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Fullscreen Proof / Receipt Lightbox Modal */}
      {selectedProof ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedProof.title}</h3>
                <p className="text-xs text-muted-foreground">الطالب: {selectedProof.student}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedProof.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition"
                  title="فتح في نافذة جديدة"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  onClick={() => setSelectedProof(null)}
                  className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Receipt Image Display */}
            <div className="mt-4 flex max-h-[70vh] items-center justify-center overflow-auto rounded-2xl bg-slate-950 p-2">
              <img
                src={selectedProof.url}
                alt="Receipt Full Size"
                className="max-h-[68vh] w-auto rounded-xl object-contain shadow-md"
              />
            </div>

            {/* Modal Footer */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>تأكد من مطابقة رقم العملية والمبلغ قبل الضغط على موافقة.</span>
              <Button size="sm" onClick={() => setSelectedProof(null)} className="rounded-xl">
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  )
}
