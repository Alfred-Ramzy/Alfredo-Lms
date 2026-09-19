import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function useDirection() {
  const { i18n } = useTranslation()

  return useMemo(
    () => ({
      language: i18n.language === 'en' ? 'en' : 'ar',
      dir: i18n.language === 'en' ? 'ltr' : 'rtl',
      isRtl: i18n.language !== 'en',
    }),
    [i18n.language],
  )
}
