import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { AuthShell } from '@/pages/auth/AuthShell'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { registerWithEmail } from '@/lib/firebase/auth'
import { createStudentProfile, createWelcomeNotification } from '@/lib/firebase/firestore'
import { formatFirebaseError, getDashboardPath } from '@/lib/utils'

const schema = z.object({
  fullName: z.string().min(2),
  fullNameAr: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  terms: z.literal(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, role, initialized, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', fullNameAr: '', email: '', password: '', confirmPassword: '', terms: true },
  })

  if (initialized && !isLoading && isAuthenticated) {
    return <Navigate to={getDashboardPath(role)} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(null)
      const credential = await registerWithEmail(values.email, values.password)
      await createStudentProfile(credential.user.uid, {
        email: values.email,
        fullName: values.fullName,
        fullNameAr: values.fullNameAr,
        preferredLocale: i18n.language === 'en' ? 'en' : 'ar',
        preferredTheme: 'system',
      })
      await createWelcomeNotification(credential.user.uid)
      toast({ title: 'Account created', description: 'Your student profile was created in Firestore.' })
      navigate('/student/dashboard', { replace: true })
    } catch (err) {
      setError(formatFirebaseError(err))
    }
  })

  return (
    <AuthShell title={t('auth.registerTitle')} copy={t('auth.registerCopy')}>
      <form className="space-y-5" onSubmit={onSubmit}>
        {error ? <Alert>{error}</Alert> : null}
        <div>
          <Label htmlFor="fullName">{t('auth.fullName')}</Label>
          <Input id="fullName" {...register('fullName')} />
          {errors.fullName ? <p className="mt-2 text-sm text-danger">{t('forms.required')}</p> : null}
        </div>
        <div>
          <Label htmlFor="fullNameAr">{t('auth.fullNameAr')}</Label>
          <Input id="fullNameAr" {...register('fullNameAr')} />
        </div>
        <div>
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email ? <p className="mt-2 text-sm text-danger">{t('forms.invalidEmail')}</p> : null}
        </div>
        <div>
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input id="password" type="password" {...register('password')} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
          {errors.confirmPassword ? <p className="mt-2 text-sm text-danger">{t('forms.passwordMatch')}</p> : null}
        </div>
        <label className="flex items-start gap-3 rounded-2xl border border-border p-4 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1" {...register('terms')} />
          <span>{t('auth.terms')}</span>
        </label>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          <UserPlus className="size-4" />
          {t('auth.submitRegister')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">Already registered? <Link to="/login" className="text-primary">{t('auth.submitLogin')}</Link></p>
      </form>
    </AuthShell>
  )
}
