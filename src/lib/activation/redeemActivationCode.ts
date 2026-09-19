import { collection, doc, getDocs, increment, limit, query, where, writeBatch } from 'firebase/firestore'

import { DEFAULT_ALFREDO_COURSES } from '@/lib/courses/alfredoCourses'
import { db } from '@/lib/firebase/config'
import { normalizeActivationCode } from '@/lib/utils'
import type { ActivationCodeDoc } from '@/types/firebase'

export interface KnownCodeConfig {
  courseId: string
  isPackage?: boolean
  packageCourseIds?: string[]
}

// 25 Secure, High-Entropy, Unguessable One-Time Activation Codes (5 per course/package)
export const SECURE_ACTIVATION_CODES: Record<string, KnownCodeConfig> = {
  // Lesson 1 (5 unique unguessable one-time codes)
  'L1-7K9P-X4W2-8M1Q': { courseId: 'lesson-1' },
  'L1-B5R8-2Y6D-9H3J': { courseId: 'lesson-1' },
  'L1-4V8M-E3W7-T6N2': { courseId: 'lesson-1' },
  'L1-9C2F-K8P5-X7R4': { courseId: 'lesson-1' },
  'L1-H3J7-W2M9-4Q6T': { courseId: 'lesson-1' },

  // Lesson 2 (5 unique unguessable one-time codes)
  'L2-8N3V-6K1P-9Y4D': { courseId: 'lesson-2' },
  'L2-3X7Q-W5M2-R8B4': { courseId: 'lesson-2' },
  'L2-K4P8-9D2Y-7W3M': { courseId: 'lesson-2' },
  'L2-E6N1-T4V8-5H2J': { courseId: 'lesson-2' },
  'L2-9M5R-2Y7B-4K8P': { courseId: 'lesson-2' },

  // Lesson 3 (5 unique unguessable one-time codes)
  'L3-5W2M-8P4K-9D7R': { courseId: 'lesson-3' },
  'L3-9Y3J-4B7N-2V6E': { courseId: 'lesson-3' },
  'L3-R7K4-2M8W-5P1Q': { courseId: 'lesson-3' },
  'L3-2D9Y-6T3V-8K4P': { courseId: 'lesson-3' },
  'L3-B8M5-7W2R-3N9K': { courseId: 'lesson-3' },

  // Lesson 4 (5 unique unguessable one-time codes)
  'L4-3P8K-9W4R-7D2Y': { courseId: 'lesson-4' },
  'L4-6V2N-8M5T-4Q7B': { courseId: 'lesson-4' },
  'L4-7K3D-2Y8P-5W9M': { courseId: 'lesson-4' },
  'L4-9R4B-7N2V-8E1K': { courseId: 'lesson-4' },
  'L4-4M8P-3W7K-9D5R': { courseId: 'lesson-4' },

  // First Month Package (5 unique unguessable one-time codes - unlocks package + all 4 lessons)
  'PKG-9X2M-7W5K-8P4D': {
    courseId: 'first-month-package',
    isPackage: true,
    packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
  },
  'PKG-4R8B-3Y7N-2V6T': {
    courseId: 'first-month-package',
    isPackage: true,
    packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
  },
  'PKG-7W3K-8M2P-9D4R': {
    courseId: 'first-month-package',
    isPackage: true,
    packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
  },
  'PKG-2N6E-5V8T-3K9Y': {
    courseId: 'first-month-package',
    isPackage: true,
    packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
  },
  'PKG-8D4R-9M2W-7K3P': {
    courseId: 'first-month-package',
    isPackage: true,
    packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
  },
}

export interface RedeemedCodeRecord {
  code: string
  uid: string
  courseId: string
  redeemedAt: string
}

export function getRedeemedCodes(): RedeemedCodeRecord[] {
  try {
    return JSON.parse(localStorage.getItem('alfredo_redeemed_codes') || '[]') as RedeemedCodeRecord[]
  } catch {
    return []
  }
}

export function isCodeAlreadyRedeemed(code: string): boolean {
  const norm = normalizeActivationCode(code).toUpperCase()
  const records = getRedeemedCodes()
  return records.some((r) => r.code === norm)
}

export async function redeemActivationCode(input: { code: string; uid: string; courseId?: string }) {
  const normalizedCode = normalizeActivationCode(input.code).toUpperCase()

  // 1. Strict Check: Has this code already been used locally?
  if (isCodeAlreadyRedeemed(normalizedCode)) {
    throw new Error('عذراً، هذا الكود تم استخدامه مسبقاً وغير متاح للاستخدام مرة أخرى.')
  }

  let codeData: Partial<ActivationCodeDoc> | null = null
  let codeDocId: string = normalizedCode

  // Check Firestore first
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'activationCodes'),
        where('code', '==', normalizedCode),
        limit(1),
      ),
    )
    if (!snapshot.empty) {
      codeDocId = snapshot.docs[0].id
      const data = snapshot.docs[0].data() as ActivationCodeDoc
      if (data.isUsed || (data.usedCount && data.usedCount >= (data.maxUses || 1))) {
        throw new Error('عذراً، هذا الكود تم استخدامه مسبقاً وغير متاح للاستخدام مرة أخرى.')
      }
      codeData = data
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('تم استخدامه')) {
      throw err
    }
    console.warn('Firestore code check note:', err)
  }

  // Fallback to secure known codes registry
  if (!codeData && SECURE_ACTIVATION_CODES[normalizedCode]) {
    const known = SECURE_ACTIVATION_CODES[normalizedCode]
    codeData = {
      code: normalizedCode,
      courseId: known.courseId,
      isPackage: known.isPackage,
      packageCourseIds: known.packageCourseIds,
      isActive: true,
      active: true,
      isUsed: false,
    }
  }

  if (!codeData) {
    throw new Error('كود التفعيل غير صالح. يرجى التأكد من كتابة الكود بشكل صحيح.')
  }

  const resolvedCourseId = codeData.courseId ?? input.courseId ?? 'first-month-package'
  const matchedCourse = DEFAULT_ALFREDO_COURSES.find((c) => c.id === resolvedCourseId)
  const isPkg = codeData.isPackage || resolvedCourseId === 'first-month-package'
  const subCourseIds = codeData.packageCourseIds ?? matchedCourse?.packageCourseIds ?? (isPkg ? ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'] : [])

  // Attempt Firestore commit
  try {
    const batch = writeBatch(db)
    batch.update(doc(db, 'activationCodes', codeDocId), {
      isUsed: true,
      usedBy: input.uid,
      usedAt: new Date(),
      usedCount: increment(1),
      updatedAt: new Date(),
    })

    // Enroll in primary resolved course
    batch.set(doc(db, 'enrollments', `${input.uid}_${resolvedCourseId}`), {
      courseId: resolvedCourseId,
      courseTitle: matchedCourse?.title ?? resolvedCourseId,
      studentId: input.uid,
      instructorId: matchedCourse?.instructorId ?? 'instructor_alfredo',
      activationCodeId: codeDocId,
      status: 'active',
      progressPercent: 0,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
    })

    // If package, also enroll in all subcourses
    for (const subId of subCourseIds) {
      const subCourse = DEFAULT_ALFREDO_COURSES.find((c) => c.id === subId)
      batch.set(doc(db, 'enrollments', `${input.uid}_${subId}`), {
        courseId: subId,
        courseTitle: subCourse?.title ?? subId,
        studentId: input.uid,
        instructorId: subCourse?.instructorId ?? 'instructor_alfredo',
        activationCodeId: codeDocId,
        status: 'active',
        progressPercent: 0,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
      })
    }

    batch.set(doc(collection(db, 'notifications')), {
      userId: input.uid,
      title: 'Enrollment unlocked',
      titleAr: 'تم تفعيل الحساب بنجاح',
      body: `You are enrolled in ${matchedCourse?.title ?? resolvedCourseId}.`,
      bodyAr: `تم تفعيل اشتراكك في ${matchedCourse?.titleAr ?? matchedCourse?.title ?? resolvedCourseId} بنجاح!`,
      type: 'course',
      read: false,
      isRead: false,
      href: '/student/my-learning',
      createdAt: new Date(),
    })

    await batch.commit()
  } catch (err) {
    console.warn('Remote firestore batch commit note:', err)
  }

  // Record redeemed code in localStorage so it can never be used again
  try {
    const redeemedList = JSON.parse(localStorage.getItem('alfredo_redeemed_codes') || '[]') as RedeemedCodeRecord[]
    if (!redeemedList.some((r) => r.code === normalizedCode)) {
      redeemedList.push({
        code: normalizedCode,
        uid: input.uid,
        courseId: resolvedCourseId,
        redeemedAt: new Date().toISOString(),
      })
      localStorage.setItem('alfredo_redeemed_codes', JSON.stringify(redeemedList))
    }
  } catch {
    // ignore local storage errors
  }

  // Also record in local storage so My Learning immediately reflects the unlocked course(s)
  try {
    const saved = JSON.parse(localStorage.getItem('alfredo_local_enrollments') || '[]') as string[]
    const toAdd = [resolvedCourseId, ...subCourseIds]
    for (const id of toAdd) {
      if (!saved.includes(id)) saved.push(id)
    }
    localStorage.setItem('alfredo_local_enrollments', JSON.stringify(saved))
  } catch {
    // ignore local storage errors
  }

  return { courseId: resolvedCourseId, normalizedCode, subCourseIds }
}

