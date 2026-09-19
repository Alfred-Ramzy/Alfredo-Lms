import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { AuthShell } from '@/pages/auth/AuthShell'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/firebase/auth'
import { formatFirebaseError } from '@/lib/utils'

const schema = z.object({ email: z.string().email() })

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(null)
      setSuccess(false)
      await resetPassword(values.email)
      setSuccess(true)
    } catch (err) {
      setError(formatFirebaseError(err))
    }
  })

  return (
    <AuthShell title={t('auth.forgotTitle')} copy={t('auth.forgotCopy')}>
      <form className="space-y-5" onSubmit={onSubmit}>
        {error ? <Alert>{error}</Alert> : null}
        {success ? <Alert className="border-success/30 bg-success/10 text-success">{t('auth.successReset')}</Alert> : null}
        <div>
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email ? <p className="mt-2 text-sm text-danger">{t('forms.invalidEmail')}</p> : null}
        </div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          <MailCheck className="size-4" />
          {t('auth.submitForgot')}
        </Button>
      </form>
    </AuthShell>
  )
}
