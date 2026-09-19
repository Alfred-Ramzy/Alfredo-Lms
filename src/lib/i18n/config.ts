import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import ar from '@/lib/i18n/ar.json'
import en from '@/lib/i18n/en.json'
import { usePlatformStore } from '@/stores/platformStore'

const resources = {
  en: { translation: en },
  ar: { translation: ar },
}

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'ar',
      lng: 'ar',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    })
}

function syncDocument(language: string) {
  const locale = language === 'en' ? 'en' : 'ar'
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.classList.remove('lang-ar', 'lang-en')
  document.documentElement.classList.add(locale === 'ar' ? 'lang-ar' : 'lang-en')
  usePlatformStore.getState().setLocale(locale)
}

syncDocument(i18n.language)
i18n.on('languageChanged', syncDocument)

export default i18n
