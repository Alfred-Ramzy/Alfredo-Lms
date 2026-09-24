import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit as limitConstraint,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  deleteDoc,
  type DocumentData,
  type DocumentReference,
  type PartialWithFieldValue,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  type UpdateData,
  type WithFieldValue,
} from 'firebase/firestore'
import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'

import { db, firebaseConfig } from '@/lib/firebase/config'
import { DEFAULT_ALFREDO_COURSES } from '@/lib/courses/alfredoCourses'
import type {
  ActivationCodeDoc,
  ConversationDoc,
  CourseDoc,
  EnrollmentDoc,
  Locale,
  NotificationDoc,
  PaymentDoc,
  PlatformSettingDoc,
  ThemeMode,
  UserDoc,
} from '@/types/firebase'

export class AppFirestoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppFirestoreError'
  }
}

export function createTimestamp() {
  return serverTimestamp()
}

export async function getDocTyped<T>(path: string) {
  try {
    const snapshot = await getDoc(doc(db, path))
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as T & { id: string }
    }
  } catch (err) {
    console.warn(`Firestore getDoc error for ${path}, checking fallbacks:`, err)
  }

  // Course fallback
  if (path.startsWith('courses/')) {
    const courseId = path.replace('courses/', '')
    const found = DEFAULT_ALFREDO_COURSES.find((c) => c.id === courseId)
    if (found) return found as unknown as T & { id: string }
  }

  // Enrollment fallback
  if (path.startsWith('enrollments/')) {
    const parts = path.replace('enrollments/', '').split('_')
    if (parts.length >= 2) {
      const courseId = parts.slice(1).join('_')
      try {
        const localEnrollments = JSON.parse(localStorage.getItem('alfredo_local_enrollments') || '[]') as string[]
        if (localEnrollments.includes(courseId)) {
          return {
            id: path.replace('enrollments/', ''),
            courseId,
            studentId: parts[0],
            instructorId: 'instructor_alfredo',
            status: 'active',
            progressPercent: 0,
            enrolledAt: new Date(),
            lastAccessedAt: new Date(),
          } as unknown as T & { id: string }
        }
      } catch {
        // ignore
      }
    }
  }

  // Platform setting fallback
  if (path.startsWith('platformSettings/')) {
    const key = path.replace('platformSettings/', '')
    if (key === 'display_currency') return { key: 'display_currency', value: 'EGP' } as unknown as T & { id: string }
    if (key === 'registration_open') return { key: 'registration_open', value: true } as unknown as T & { id: string }
    if (key === 'payment_instructions') {
      return {
        key: 'payment_instructions',
        value: 'قم بالتحويل عبر فودافون كاش 01021487841 أو إنستاباي alfredo@instapay ثم ارفع سكرين شوت الإيصال.',
      } as unknown as T & { id: string }
    }
  }

  return null
}

export async function setDocTyped<T extends DocumentData>(path: string, value: WithFieldValue<T>) {
  try {
    await setDoc(doc(db, path), value)
  } catch {
    throw new AppFirestoreError('Unable to save data right now.')
  }
}

export async function updateDocTyped<T extends DocumentData>(path: string, value: UpdateData<T>) {
  try {
    await updateDoc(doc(db, path), value)
  } catch {
    throw new AppFirestoreError('Unable to update data right now.')
  }
}

export function listenToQuery<T>(path: string, constraints: QueryConstraint[], onData: (items: Array<T & { id: string }>) => void, onError?: (message: string) => void): Unsubscribe {
  const queryRef = query(collection(db, path), ...constraints)
  return onSnapshot(
    queryRef,
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as T) }))),
    () => onError?.('Realtime sync is temporarily unavailable.'),
  )
}

export async function paginateCollection<T>(options: {
  path: string
  constraints?: QueryConstraint[]
  pageSize: number
  cursor?: QueryDocumentSnapshot<DocumentData> | null
}) {
  try {
    const constraints = [...(options.constraints ?? []), limitConstraint(options.pageSize)]
    const baseQuery = query(collection(db, options.path), ...constraints)
    const snapshot = await getDocs(baseQuery)
    return {
      items: snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as T) })),
      lastDoc: snapshot.docs.at(-1) ?? null,
      hasMore: snapshot.docs.length === options.pageSize,
    }
  } catch {
    throw new AppFirestoreError('Unable to load the next page.')
  }
}

export async function safeBatchCommit(
  operations: (batch: ReturnType<typeof writeBatch>) => void,
) {
  try {
    const batch = writeBatch(db)
    operations(batch)
    await batch.commit()
  } catch {
    throw new AppFirestoreError('The requested action could not be completed.')
  }
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? (snapshot.data() as UserDoc) : null
}

export async function createStudentProfile(
  uid: string,
  payload: Pick<UserDoc, 'email' | 'fullName' | 'fullNameAr' | 'preferredLocale' | 'preferredTheme'>,
) {
  await setDocTyped<Partial<UserDoc>>(`users/${uid}`, {
    uid,
    email: payload.email,
    fullName: payload.fullName,
    fullNameAr: payload.fullNameAr ?? '',
    role: 'student',
    preferredLocale: payload.preferredLocale,
    preferredTheme: payload.preferredTheme,
    isActive: true,
    activationRequired: false,
    streakCount: 0,
    xpPoints: 0,
    badges: [],
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  })
}

export async function createStudentWithPassword(payload: {
  fullName: string
  fullNameAr?: string
  email: string
  password: string
  phone?: string
  parentPhone?: string
  academicGrade?: string
  governorate?: string
  schoolName?: string
  adminNotes?: string
}) {
  const tempAppName = `create_student_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const secondaryApp = initializeApp(firebaseConfig, tempAppName)
  const secondaryAuth = getAuth(secondaryApp)
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, payload.email.trim(), payload.password)
    const uid = cred.user.uid
    await setDocTyped<Partial<UserDoc>>(`users/${uid}`, {
      uid,
      email: payload.email.trim().toLowerCase(),
      fullName: payload.fullName.trim(),
      fullNameAr: payload.fullNameAr?.trim() ?? '',
      phone: payload.phone?.trim() ?? '',
      parentPhone: payload.parentPhone?.trim() ?? '',
      academicGrade: payload.academicGrade?.trim() ?? '',
      governorate: payload.governorate?.trim() ?? '',
      schoolName: payload.schoolName?.trim() ?? '',
      adminNotes: payload.adminNotes?.trim() ?? '',
      role: 'student',
      preferredLocale: 'ar',
      preferredTheme: 'dark',
      isActive: true,
      activationRequired: false,
      streakCount: 0,
      xpPoints: 0,
      badges: [],
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    })
    await signOut(secondaryAuth)
    return uid
  } finally {
    try {
      await deleteApp(secondaryApp)
    } catch {
      // ignore
    }
  }
}

export async function deleteUserDoc(uid: string) {
  try {
    await deleteDoc(doc(db, 'users', uid))
  } catch (err) {
    console.warn(`deleteUserDoc firestore note for ${uid}:`, err)
  }
}

export async function resetStudentDevices(studentId: string) {
  try {
    const snapshot = await getDocs(query(collection(db, 'studentDevices'), where('studentId', '==', studentId)))
    const batch = writeBatch(db)
    snapshot.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  } catch (err) {
    console.warn(`resetStudentDevices note for ${studentId}:`, err)
  }
}

export async function deleteEnrollmentDoc(enrollmentId: string) {
  try {
    await deleteDoc(doc(db, 'enrollments', enrollmentId))
  } catch (err) {
    console.warn(`deleteEnrollmentDoc firestore note:`, err)
  }
  try {
    const local = JSON.parse(localStorage.getItem('alfredo_local_enrollments') || '[]') as string[]
    const parts = enrollmentId.split('_')
    const courseId = parts.slice(1).join('_')
    const updated = local.filter((id) => id !== courseId)
    localStorage.setItem('alfredo_local_enrollments', JSON.stringify(updated))
  } catch {
    // ignore
  }
}


export async function ensureGoogleProfile(options: {
  uid: string
  email: string
  fullName: string
  avatarUrl?: string | null
  preferredLocale: Locale
  preferredTheme: ThemeMode
}) {
  const existing = await getUserProfile(options.uid)
  if (existing) return existing

  await setDocTyped<Partial<UserDoc>>(`users/${options.uid}`, {
    uid: options.uid,
    email: options.email,
    fullName: options.fullName,
    avatarUrl: options.avatarUrl ?? '',
    role: 'student',
    preferredLocale: options.preferredLocale,
    preferredTheme: options.preferredTheme,
    isActive: true,
    activationRequired: false,
    streakCount: 0,
    xpPoints: 0,
    badges: [],
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  })
  await createWelcomeNotification(options.uid)
  return getUserProfile(options.uid)
}

export async function updateUserPreferences(uid: string, payload: Partial<Pick<UserDoc, 'preferredLocale' | 'preferredTheme'>>) {
  await updateDocTyped<Partial<UserDoc>>(`users/${uid}`, {
    ...payload,
    updatedAt: createTimestamp(),
  })
}

export async function createNotification(payload: PartialWithFieldValue<NotificationDoc>) {
  await addDoc(collection(db, 'notifications'), {
    read: false,
    isRead: false,
    createdAt: createTimestamp(),
    ...payload,
  })
}

export async function createWelcomeNotification(uid: string) {
  await createNotification({
    userId: uid,
    title: 'Welcome to Alfredo LMS',
    titleAr: 'مرحباً بك في ألفريدو',
    body: 'Your learning space is ready. Start exploring your dashboard.',
    bodyAr: 'مساحتك التعليمية جاهزة. ابدأ باستكشاف لوحة التحكم.',
    type: 'system',
    href: '/student/dashboard',
  })
}

export async function getPlatformSetting<T = unknown>(key: string) {
  const snapshot = await getDoc(doc(db, 'platformSettings', key))
  if (!snapshot.exists()) return null
  return snapshot.data() as PlatformSettingDoc & { value: T }
}

export async function getCollectionDocs<T>(path: string, constraints: QueryConstraint[] = []) {
  try {
    const snapshot = await getDocs(query(collection(db, path), ...constraints))
    if (!snapshot.empty) {
      const items = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as T) }))
      if (path === 'payments') {
        const local = JSON.parse(localStorage.getItem('alfredo_local_payments') || '[]') as Array<PaymentDoc & { id: string }>
        const combined = [...items]
        for (const loc of local) {
          if (!combined.some((c) => c.id === loc.id)) {
            combined.unshift(loc as unknown as T & { id: string })
          }
        }
        return combined
      }
      return items
    }
  } catch (err) {
    console.warn(`Firestore getCollectionDocs error for ${path}:`, err)
  }

  // Fallback for courses
  if (path === 'courses') {
    return DEFAULT_ALFREDO_COURSES as unknown as Array<T & { id: string }>
  }

  // Fallback for categories
  if (path === 'categories') {
    return [
      { id: 'programming-ai', title: 'Programming & AI', titleAr: 'البرمجة والذكاء الاصطناعي', slug: 'programming-ai' },
    ] as unknown as Array<T & { id: string }>
  }

  // Fallback for payments
  if (path === 'payments') {
    try {
      const local = JSON.parse(localStorage.getItem('alfredo_local_payments') || '[]') as Array<PaymentDoc & { id: string }>
      return local as unknown as Array<T & { id: string }>
    } catch {
      return []
    }
  }

  // Fallback for enrollments
  if (path === 'enrollments') {
    try {
      const local = JSON.parse(localStorage.getItem('alfredo_local_enrollments') || '[]') as string[]
      return local.map((courseId) => {
        const c = DEFAULT_ALFREDO_COURSES.find((item) => item.id === courseId)
        return {
          id: `local_${courseId}`,
          courseId,
          courseTitle: c?.title ?? courseId,
          studentId: 'student_current',
          instructorId: 'instructor_alfredo',
          status: 'active',
          progressPercent: 0,
          enrolledAt: new Date(),
          lastAccessedAt: new Date(),
        }
      }) as unknown as Array<T & { id: string }>
    } catch {
      return []
    }
  }

  return []
}

export function featuredCoursesConstraints() {
  return [where('isFeatured', '==', true), orderBy('createdAt', 'desc'), limitConstraint(6)] satisfies QueryConstraint[]
}

export async function getCoursesByIds(courseIds: string[]) {
  if (courseIds.length === 0) return [] as Array<CourseDoc & { id: string }>
  const matched = DEFAULT_ALFREDO_COURSES.filter((c) => courseIds.includes(c.id))
  if (matched.length === courseIds.length) return matched

  try {
    const chunks = Array.from({ length: Math.ceil(courseIds.length / 10) }, (_, index) => courseIds.slice(index * 10, index * 10 + 10))
    const results = await Promise.all(chunks.map((chunk) => getCollectionDocs<CourseDoc>('courses', [where('__name__', 'in', chunk)])))
    const flattened = results.flat()
    if (flattened.length > 0) return flattened
  } catch (err) {
    console.warn('getCoursesByIds firestore fallback:', err)
  }

  return DEFAULT_ALFREDO_COURSES.filter((c) => courseIds.includes(c.id))
}

export async function createEnrollment(payload: Partial<EnrollmentDoc> & Pick<EnrollmentDoc, 'courseId' | 'studentId' | 'instructorId'>) {
  const enrollmentId = `${payload.studentId}_${payload.courseId}`
  await setDocTyped<Partial<EnrollmentDoc>>(`enrollments/${enrollmentId}`, {
    ...payload,
    status: payload.status ?? 'active',
    progressPercent: payload.progressPercent ?? 0,
    enrolledAt: payload.enrolledAt ?? createTimestamp(),
    lastAccessedAt: payload.lastAccessedAt ?? createTimestamp(),
  })
  try {
    const local = JSON.parse(localStorage.getItem('alfredo_local_enrollments') || '[]') as string[]
    if (!local.includes(payload.courseId)) {
      local.push(payload.courseId)
      localStorage.setItem('alfredo_local_enrollments', JSON.stringify(local))
    }
  } catch {
    // ignore
  }
  return enrollmentId
}

export async function createPaymentRecord(payload: Partial<PaymentDoc> & Pick<PaymentDoc, 'studentId' | 'amount' | 'currency'>) {
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const record: PaymentDoc & { id: string } = {
    id: paymentId,
    ...payload,
    provider: payload.provider ?? 'manual',
    status: payload.status ?? 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  try {
    await setDoc(doc(db, 'payments', paymentId), {
      ...payload,
      status: payload.status ?? 'pending',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    })
  } catch (err) {
    console.warn('Firestore createPaymentRecord note (cached locally):', err)
  }

  try {
    const local = JSON.parse(localStorage.getItem('alfredo_local_payments') || '[]') as Array<PaymentDoc & { id: string }>
    local.unshift(record)
    localStorage.setItem('alfredo_local_payments', JSON.stringify(local))
  } catch {
    // ignore
  }

  return paymentId
}

export async function createConversation(payload: Omit<ConversationDoc, 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(db, 'conversations'), {
    ...payload,
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  })
  return ref.id
}

export async function sendConversationMessage(
  conversationId: string,
  payload: Omit<import('@/types/firebase').MessageDoc, 'createdAt' | 'conversationId'>,
) {
  const messageRef = doc(collection(db, `conversations/${conversationId}/messages`))
  const conversationRef: DocumentReference = doc(db, 'conversations', conversationId)
  await safeBatchCommit((batch) => {
    batch.set(messageRef, {
      ...payload,
      conversationId,
      createdAt: createTimestamp(),
      readBy: [payload.senderId],
    })
    batch.update(conversationRef, {
      lastMessage: payload.body,
      lastMessageAt: createTimestamp(),
      updatedAt: createTimestamp(),
      unreadCountByUser: payload.participantIds.reduce<Record<string, number>>((accumulator, participantId) => {
        accumulator[participantId] = participantId === payload.senderId ? 0 : increment(1) as unknown as number
        return accumulator
      }, {}),
    })
  })
}

export async function approvePaymentAndEnroll(options: {
  paymentId: string
  payment: PaymentDoc & { id?: string }
  course: CourseDoc & { id: string }
}) {
  const enrollmentId = `${options.payment.studentId}_${options.course.id}`
  const subIds = options.course.packageCourseIds ?? (options.course.id === 'first-month-package' || options.payment.isPackage ? ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'] : [])

  try {
    await safeBatchCommit((batch) => {
      batch.update(doc(db, 'payments', options.paymentId), { status: 'completed', updatedAt: createTimestamp() })
      batch.set(doc(db, 'enrollments', enrollmentId), {
        courseId: options.course.id,
        courseTitle: options.course.title,
        studentId: options.payment.studentId,
        studentName: options.payment.studentName,
        instructorId: options.course.instructorId,
        status: 'active',
        progressPercent: 0,
        enrolledAt: createTimestamp(),
        lastAccessedAt: createTimestamp(),
      })
      batch.update(doc(db, 'courses', options.course.id), { studentsCount: increment(1), updatedAt: createTimestamp() })

      for (const subCourseId of subIds) {
        const subEnrollmentId = `${options.payment.studentId}_${subCourseId}`
        const subCourse = DEFAULT_ALFREDO_COURSES.find((c) => c.id === subCourseId)
        batch.set(doc(db, 'enrollments', subEnrollmentId), {
          courseId: subCourseId,
          courseTitle: subCourse?.title ?? subCourseId,
          studentId: options.payment.studentId,
          studentName: options.payment.studentName,
          instructorId: options.course.instructorId,
          status: 'active',
          progressPercent: 0,
          enrolledAt: createTimestamp(),
          lastAccessedAt: createTimestamp(),
        })
      }

      batch.set(doc(collection(db, 'notifications')), {
        userId: options.payment.studentId,
        title: 'Payment approved',
        titleAr: 'تمت الموافقة على الدفع',
        body: `You are now enrolled in ${options.course.title}.`,
        bodyAr: `تمت الموافقة على الدفع وتفعيل ${options.course.titleAr ?? options.course.title} بنجاح!`,
        type: 'payment',
        read: false,
        isRead: false,
        href: '/student/my-learning',
        createdAt: createTimestamp(),
      })
    })
  } catch (err) {
    console.warn('Remote firestore batch commit note:', err)
  }

  // Update local storage states
  try {
    const localPayments = JSON.parse(localStorage.getItem('alfredo_local_payments') || '[]') as Array<PaymentDoc & { id: string }>
    const updatedPayments = localPayments.map((p) =>
      p.id === options.paymentId ? { ...p, status: 'completed' as const, updatedAt: new Date() } : p,
    )
    localStorage.setItem('alfredo_local_payments', JSON.stringify(updatedPayments))

    const localEnrollments = JSON.parse(localStorage.getItem('alfredo_local_enrollments') || '[]') as string[]
    const toEnroll = [options.course.id, ...subIds]
    for (const id of toEnroll) {
      if (!localEnrollments.includes(id)) localEnrollments.push(id)
    }
    localStorage.setItem('alfredo_local_enrollments', JSON.stringify(localEnrollments))
  } catch {
    // ignore
  }
}

export type DashboardRecentNotification = NotificationDoc & { id: string }
export type DashboardEnrollment = EnrollmentDoc & { id: string }
export type DashboardCourse = CourseDoc & { id: string }
export type DashboardConversation = ConversationDoc & { id: string }
export type DashboardActivationCode = ActivationCodeDoc & { id: string }
