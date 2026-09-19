import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { buttonVariants } from '@/components/ui/button'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="container flex min-h-screen items-center justify-center py-10 text-center">
      <div className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">404</p>
        <h1 className="mt-4 text-4xl font-extrabold">{t('errors.notFound')}</h1>
        <Link to="/" className={buttonVariants({}) + ' mt-6'}>{t('buttons.backHome')}</Link>
      </div>
    </main>
  )
}
