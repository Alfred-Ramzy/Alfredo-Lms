import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Calendar, CheckCircle2, QrCode, ShieldCheck, Upload, Wallet } from 'lucide-react'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { redeemActivationCode } from '@/lib/activation/redeemActivationCode'
import { createNotification, createPaymentRecord, getDocTyped } from '@/lib/firebase/firestore'
import { uploadPaymentProof } from '@/lib/storage/provider'
import { formatMoney } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { usePlatformStore } from '@/stores/platformStore'
import type { CourseDoc, PaymentDoc } from '@/types/firebase'

const schema = z.object({
  method: z.string(),
  referenceId: z.string().optional(),
  activationCode: z.string().optional(),
})

export default function CheckoutPage() {
  const { courseId = '' } = useParams()
  const navigate = useNavigate()
  const displayCurrency = usePlatformStore((state) => state.displayCurrency)
  const { userProfile } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const courseQuery = useQuery({
    queryKey: ['checkout-course', courseId],
    enabled: Boolean(courseId),
    queryFn: () => getDocTyped<CourseDoc>(`courses/${courseId}`),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { method: 'vodafone_cash' },
  })

  const { register, handleSubmit, control } = form
  const method = useWatch({ control, name: 'method' })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setProofFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!userProfile || !courseQuery.data) return
    try {
      setError(null)
      setIsProcessing(true)

      // 1. Activation Code flow
      if (values.method === 'activation_code') {
        if (!values.activationCode?.trim()) {
          setError('يرجى إدخال كود التفعيل.')
          setIsProcessing(false)
          return
        }
        await redeemActivationCode({
          code: values.activationCode.trim(),
          uid: userProfile.uid,
          courseId,
        })
        navigate('/student/my-learning')
        return
      }

      // 2. Manual Payment flow (Vodafone Cash, InstaPay, Fawry)
      if (!proofFile) {
        setError('يرجى إرفاق صورة أو سكرين شوت إيصال التحويل للمتابعة وتأكيد الدفع.')
        setIsProcessing(false)
        return
      }

      // Upload proof image with fallback to Base64 data URL
      let uploadedProofUrl = ''
      try {
        const uploadTempId = `proof_${Date.now()}`
        uploadedProofUrl = await uploadPaymentProof(uploadTempId, userProfile.uid, proofFile)
      } catch (uploadError) {
        console.warn('Direct storage upload failed, saving as inline proof data:', uploadError)
        // Fallback to base64 Data URL so proof is 100% saved and visible to admin
        if (previewUrl) {
          uploadedProofUrl = previewUrl
        } else {
          uploadedProofUrl = await new Promise<string>((resolve) => {
            const r = new FileReader()
            r.onload = () => resolve(r.result as string)
            r.readAsDataURL(proofFile)
          })
        }
      }

      await createPaymentRecord({
        studentId: userProfile.uid,
        studentName: userProfile.fullName,
        studentEmail: userProfile.email,
        courseId,
        courseTitle: courseQuery.data.title,
        amount: courseQuery.data.discountPrice ?? courseQuery.data.price,
        currency: courseQuery.data.currency,
        provider: values.method as PaymentDoc['provider'],
        status: 'pending',
        referenceId: values.referenceId?.trim() || 'No reference provided',
        proofUrl: uploadedProofUrl,
        isPackage: Boolean(courseQuery.data.isPackage),
        packageCourseIds: courseQuery.data.packageCourseIds ?? [],
      })

      await createNotification({
        userId: userProfile.uid,
        title: 'Payment submitted',
        body: 'Your payment screenshot is under review by admin.',
        titleAr: 'تم إرسال إثبات الدفع',
        bodyAr: 'تم إرسال لقطة شاشة التحويل وهي قيد المراجعة الآن من الإدارة وسيتم التفعيل قريباً.',
        type: 'payment',
        href: '/student/my-learning',
      })

      navigate('/student/my-learning')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'فشل إرسال الدفع، يرجى المحاولة مرة أخرى.')
    } finally {
      setIsProcessing(false)
    }
  })

  const course = courseQuery.data

  return (
    <DashboardShell role="student" title="إتمام الاشتراك والدفع">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[1.75rem] border border-border/80 bg-card/95 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">طريقة الدفع والتأكيد</h2>
              <p className="text-xs text-muted-foreground">اختر طريقة الدفع المناسبة وأرفق لقطة الشاشة</p>
            </div>
          </div>

          {error ? <Alert className="mt-4 border-destructive/30 bg-destructive/10 text-destructive">{error}</Alert> : null}

          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <div>
              <Label className="text-sm font-semibold">اختر وسيلة الدفع</Label>
              <select
                className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 font-medium transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register('method')}
              >
                <option value="vodafone_cash">📱 فودافون كاش (Vodafone Cash)</option>
                <option value="instapay">⚡ إنستاباي (InstaPay)</option>
                <option value="fawry">🏪 فوري (Fawry Pay)</option>
                <option value="activation_code">🎟️ كود تفعيل مسبق (Activation Code)</option>
              </select>
            </div>

            {method === 'activation_code' ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <QrCode className="size-5" />
                  <span>تفعيل مباشر عبر الكود</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  إذا كان لديك كود تفعيل للحصة أو للباكدج، أدخله هنا وسيتم فتح المحتوى فوراً لحسابك دون انتظار مراجعة.
                </p>
                <div>
                  <Label htmlFor="activationCode" className="text-sm font-semibold">كود التفعيل (Activation Code)</Label>
                  <Input
                    id="activationCode"
                    className="mt-1 font-mono tracking-wider"
                    {...register('activationCode')}
                    placeholder="e.g. L1-ALF-1010 or PKG-ALF-9010"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Transfer instructions banner */}
                <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <ShieldCheck className="size-4" />
                    <span>تعليمات التحويل المالي</span>
                  </div>
                  {method === 'vodafone_cash' ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">حول المبلغ المطلوب إلى محفظة فودافون كاش التالية:</p>
                      <div className="flex items-center justify-between rounded-xl bg-background/80 p-2.5 font-mono text-base font-bold text-foreground">
                        <span>01021487841</span>
                        <span className="text-xs font-normal text-muted-foreground">فودافون كاش</span>
                      </div>
                    </div>
                  ) : method === 'instapay' ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">حول المبلغ عبر تطبيق إنستاباي إلى المعرف (IPA):</p>
                      <div className="flex items-center justify-between rounded-xl bg-background/80 p-2.5 font-mono text-base font-bold text-foreground">
                        <span>alfredo@instapay</span>
                        <span className="text-xs font-normal text-muted-foreground">InstaPay</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">حول المبلغ المطلوب ثم التقط صورة واضحة لإيصال التحويل.</p>
                  )}
                  <p className="text-xs text-amber-500 font-medium">
                    ⚠️ مهم جداً: بعد التحويل، التقط سكرين شوت واضحة للعملية وأرفقها في الحقل أدناه ليتم اعتمادها من الداشبورد.
                  </p>
                </div>

                <div>
                  <Label htmlFor="referenceId" className="text-sm font-semibold">رقم المرجع / رقم الهاتف المحول منه (اختياري)</Label>
                  <Input
                    id="referenceId"
                    className="mt-1"
                    {...register('referenceId')}
                    placeholder="مثال: رقم المحفظة 010... أو رقم عملية التحويل"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center justify-between">
                    <span>إرفاق سكرين شوت التحويل (إجباري)</span>
                    <span className="text-xs text-destructive">* مطلوب</span>
                  </Label>
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-5 transition hover:border-primary cursor-pointer bg-background/50 hover:bg-muted/30">
                    <Upload className="size-7 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-foreground">اضغط لرفع لقطة الشاشة أو الإيصال</span>
                    <span className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP حتى 10MB</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileChange}
                    />
                  </label>

                  {previewUrl ? (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                      <img src={previewUrl} alt="Receipt preview" className="size-16 rounded-lg object-cover border border-border" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="size-3.5" />
                          <span>تم إرفاق الإيصال بنجاح</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{proofFile?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{proofFile ? (proofFile.size / 1024).toFixed(1) + ' KB' : ''}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl font-bold text-base shadow-glow transition-all"
              disabled={isProcessing}
            >
              {isProcessing
                ? 'جاري إرسال الطلب...'
                : method === 'activation_code'
                ? 'تفعيل الكود والاشتراك الآن'
                : 'إرسال الإيصال للمراجعة والتفعيل'}
            </Button>
          </form>
        </Card>

        {/* Order Summary Card */}
        <div className="space-y-4">
          <Card className="rounded-[1.75rem] border border-border/80 bg-card/95 p-6 shadow-soft backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ملخص الطلب (Order Summary)</p>
            
            {course?.thumbnailUrl ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 aspect-video">
                <img src={course.thumbnailUrl} alt={course.title} className="size-full object-cover" />
              </div>
            ) : null}

            <h3 className="mt-4 text-xl font-black">{course?.titleAr ?? course?.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{course?.descriptionAr ?? course?.description}</p>

            {course?.isPackage ? (
              <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-600 font-medium">
                🎁 باكدج شامل: يفتح لك الحصص الـ 4 كاملة مع جميع اللايفات والمواد!
              </div>
            ) : null}

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span>ميعاد اللايف: {course?.liveScheduleAr ?? course?.liveSchedule ?? 'كل أربعاء 6:00 م'}</span>
            </div>

            <div className="mt-6 border-t border-border pt-4 flex items-baseline justify-between">
              <span className="text-sm font-medium text-muted-foreground">المبلغ الإجمالي</span>
              <div className="text-right">
                <span className="text-3xl font-black text-foreground">
                  {formatMoney(course?.discountPrice ?? course?.price ?? 0, displayCurrency)}
                </span>
                {course?.discountPrice ? (
                  <span className="block text-xs line-through text-muted-foreground">
                    {formatMoney(course.price, displayCurrency)}
                  </span>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
