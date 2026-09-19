import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { getFirebaseErrorMessage } from '@/lib/firebase/errorMessage'
import type { CurrencyCode, Locale, UserRole } from '@/types/firebase'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDashboardPath(role?: UserRole | null) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'instructor':
      return '/instructor/dashboard'
    case 'student':
      return '/student/dashboard'
    default:
      return '/login'
  }
}

export function isRtl(locale: Locale) {
  return locale === 'ar'
}

export function formatFirebaseError(error: unknown) {
  return getFirebaseErrorMessage(error, 'en')
}

export function getInitials(name?: string | null) {
  if (!name) {
    return 'AL'
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatMoney(amount: number, currency: CurrencyCode, locale: Locale = 'en') {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function normalizeActivationCode(input: string) {
  const value = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12)
  return value.match(/.{1,4}/g)?.join('-') ?? ''
}

export function buildSearchKeywords(...inputs: Array<string | undefined>) {
  return Array.from(
    new Set(
      inputs
        .flatMap((value) => (value ?? '').toLowerCase().split(/\s+/).filter(Boolean))
        .filter((value) => value.length > 1),
    ),
  )
}
