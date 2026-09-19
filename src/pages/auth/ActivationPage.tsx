import { KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AuthShell } from '@/pages/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ActivationPage() {
  const { t } = useTranslation()

  return (
    <AuthShell title={t('auth.activationTitle')} copy={t('auth.activationCopy')}>
      <div className="space-y-5">
        <div>
          <Label htmlFor="activation-code">{t('auth.code')}</Label>
          <Input id="activation-code" placeholder="ALFREDO-XXXX-XXXX" />
        </div>
        <Button className="w-full" type="button">
          <KeyRound className="size-4" />
          Redeem in Batch 2
        </Button>
      </div>
    </AuthShell>
  )
}
