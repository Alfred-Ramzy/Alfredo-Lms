import { zodResolver } from '@hookform/resolvers/zod'
import { Globe, LogIn } from 'lucide-react'
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
import { loginWithEmail, loginWithGoogle, logout } from '@/lib/firebase/auth'
import { ensureGoogleProfile, getUserProfile } from '@/lib/firebase/firestore'
import { formatFirebaseError, getDashboardPath } from '@/lib/utils'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, role, initialized, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  if (initialized && !isLoading && isAuthenticated) {
    return <Navigate to={getDashboardPath(role)} replace />
  }

  const finalizeLogin = async (uid: string) => {
    const profile = await getUserProfile(uid)
    if (!profile) {
      throw new Error('User profile is missing.')
    }
    if (!profile.isActive) {
      await logout()
      throw new Error(t('errors.inactive'))
    }

    navigate(profile.activationRequired ? '/activation-required' : getDashboardPath(profile.role), { replace: true })
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(null)
      const credential = await loginWithEmail(values.email, values.password)
      await finalizeLogin(credential.user.uid)
    } catch (err) {
      setError(formatFirebaseError(err))
    }
  })

  const handleGoogle = async () => {
    try {
      setError(null)
      const credential = await loginWithGoogle()
      if (!credential.user.email) {
        throw new Error('Google account email is unavailable.')
      }
      await ensureGoogleProfile({
        uid: credential.user.uid,
        email: credential.user.email,
        fullName: credential.user.displayName ?? credential.user.email.split('@')[0] ?? 'Student',
        avatarUrl: credential.user.photoURL,
        preferredLocale: 'ar',
        preferredTheme: 'system',
      })
      toast({ title: 'Google sign-in successful' })
      await finalizeLogin(credential.user.uid)
    } catch (err) {
      setError(formatFirebaseError(err))
    }
  }

  return (
    <AuthShell title={t('auth.loginTitle')} copy={t('auth.loginCopy')}>
      <form className="space-y-5" onSubmit={onSubmit}>
        {error ? <Alert>{error}</Alert> : null}
        <div>
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email ? <p className="mt-2 text-sm text-danger">{t('forms.invalidEmail')}</p> : null}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">{t('auth.password')}</Label>
            <Link to="/forgot-password" className="text-sm text-primary">{t('auth.forgotPassword')}</Link>
          </div>
          <Input id="password" type="password" {...register('password')} />
          {errors.password ? <p className="mt-2 text-sm text-danger">{t('forms.passwordMin')}</p> : null}
        </div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          <LogIn className="size-4" />
          {t('auth.submitLogin')}
        </Button>
        <Button className="w-full" type="button" variant="outline" onClick={() => void handleGoogle()}>
          <Globe className="size-4" />
          {t('auth.google')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">No account yet? <Link to="/register" className="text-primary">{t('auth.submitRegister')}</Link></p>
      </form>
    </AuthShell>
  )
}
