const EN_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'permission-denied': 'You do not have permission to do that.',
  'unavailable': 'The service is temporarily unavailable.',
}

const AR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/email-already-in-use': 'هذا البريد الإلكتروني مسجل بالفعل.',
  'auth/weak-password': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.',
  'auth/popup-closed-by-user': 'تم إلغاء تسجيل الدخول عبر جوجل.',
  'auth/too-many-requests': 'تمت محاولات كثيرة. حاول لاحقاً.',
  'permission-denied': 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
  'unavailable': 'الخدمة غير متاحة مؤقتاً.',
}

export function getFirebaseErrorMessage(error: unknown, locale: 'en' | 'ar' = 'en') {
  if (!(error instanceof Error)) {
    return locale === 'ar' ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.'
  }

  const match = error.message.match(/([a-z-]+\/[a-z-]+)/i)
  const code = match?.[1]?.toLowerCase() ?? 'unknown'
  const dictionary = locale === 'ar' ? AR_MESSAGES : EN_MESSAGES
  return dictionary[code] ?? (locale === 'ar' ? 'تعذر إتمام العملية حالياً.' : 'Unable to complete this request right now.')
}
