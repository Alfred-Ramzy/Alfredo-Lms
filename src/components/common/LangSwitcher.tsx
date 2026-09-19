import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { updateUserPreferences } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import type { Locale } from '@/types/firebase'

export function LangSwitcher() {
  const { i18n } = useTranslation()
  const profile = useAuthStore((state) => state.userProfile)

  const toggleLanguage = async () => {
    const nextLanguage: Locale = i18n.language === 'en' ? 'ar' : 'en'
    await i18n.changeLanguage(nextLanguage)
    if (profile?.uid) {
      void updateUserPreferences(profile.uid, { preferredLocale: nextLanguage })
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void toggleLanguage()}>
      <Languages className="size-4" />
      {i18n.language === 'en' ? 'AR' : 'EN'}
    </Button>
  )
}
