/// <reference types="node" />

import { initializeApp } from 'firebase/app'
import { addDoc, collection, doc, getFirestore, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAf48HUnopW5GfBDYvvV2qM-q1KFr6KvWQ',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'lmsproject-8974c.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID ?? 'lmsproject-8974c',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'lmsproject-8974c.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '334688009759',
  appId: process.env.VITE_FIREBASE_APP_ID ?? '1:334688009759:web:28b861dfa3a33ee2389f2a',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const sampleUsers = [
  { email: 'admin@alfredo.demo', password: 'Demo123!', fullName: 'Demo Admin', role: 'admin' },
  { email: 'instructor@alfredo.demo', password: 'Demo123!', fullName: 'Demo Instructor', role: 'instructor' },
  { email: 'student@alfredo.demo', password: 'Demo123!', fullName: 'Demo Student', role: 'student' },
] as const

async function ensureAuthUser(email: string, password: string) {
  const payload = { email, password, returnSecureToken: true }
  const signUpResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const signUpData = await signUpResponse.json()

  if (signUpResponse.ok) {
    return signUpData.localId as string
  }

  const signInResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const signInData = await signInResponse.json()
  if (!signInResponse.ok) {
    throw new Error(`Unable to create or sign in sample seed user ${email}: ${JSON.stringify(signInData)}`)
  }

  return signInData.localId as string
}

async function seed() {
  const userIds = new Map<string, string>()
  for (const user of sampleUsers) {
    userIds.set(user.role, await ensureAuthUser(user.email, user.password))
  }

  await Promise.all([
    setDoc(doc(db, 'platformSettings', 'display_currency'), { key: 'display_currency', value: 'EGP', updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'currency_rates'), { key: 'currency_rates', value: { EGP: 1, USD: 50, EUR: 55, SAR: 13, AED: 13.5 }, updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'registration_open'), { key: 'registration_open', value: true, updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'maintenance_mode'), { key: 'maintenance_mode', value: false, updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'payment_instructions'), { key: 'payment_instructions', value: 'Upload a payment proof or contact support for manual review.', updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'max_devices_global'), { key: 'max_devices_global', value: 2, updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'license_status'), { key: 'license_status', value: 'active', updatedAt: new Date() }),
    setDoc(doc(db, 'categories', 'sample-category'), { title: 'Medical Training', titleAr: 'التدريب الطبي', slug: 'medical-training', createdAt: new Date(), updatedAt: new Date() }),
  ])

  for (const user of sampleUsers) {
    const uid = userIds.get(user.role)!
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      preferredLocale: 'ar',
      preferredTheme: 'dark',
      isActive: true,
      activationRequired: false,
      streakCount: 0,
      xpPoints: 0,
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const instructorId = userIds.get('instructor')!
  const courseId = 'sample-course'
  await setDoc(doc(db, 'courses', courseId), {
    instructorId,
    instructorName: 'Sample Instructor',
    categoryId: 'sample-category',
    categoryName: 'Medical Training',
    title: 'Clinical Communication Basics',
    titleAr: 'أساسيات التواصل السريري',
    description: 'A short sample course for the academic LMS discussion.',
    descriptionAr: 'دورة تجريبية مبدئية لمناقشة نظام إدارة التعلم الأكاديمي.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    price: 1500,
    currency: 'EGP',
    level: 'beginner',
    language: 'both',
    durationMinutes: 35,
    lessonsCount: 1,
    studentsCount: 0,
    rating: 4.8,
    ratingsCount: 12,
    isFeatured: true,
    certificateEnabled: true,
    maxDevices: 2,
    watchAttempts: 10,
    requiresActivation: true,
    searchKeywords: ['clinical', 'communication', 'medical', 'doctor'],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  await setDoc(doc(db, 'lessons', 'sample-lesson'), {
    courseId,
    sectionId: 'default',
    title: 'Introduction to Clinical Communication',
    titleAr: 'مقدمة في التواصل السريري',
    type: 'video',
    order: 1,
    durationMinutes: 15,
    isPreview: true,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const quizRef = await addDoc(collection(db, 'quizzes'), {
    courseId,
    title: 'Sample Quiz',
    passingScore: 70,
    randomizeQuestions: false,
    attemptsAllowed: 1,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  await addDoc(collection(db, `quizzes/${quizRef.id}/questions`), {
    quizId: quizRef.id,
    prompt: 'What is the first step in effective clinical communication?',
    type: 'single',
    options: ['Active listening', 'Ignoring the patient', 'Rushing the visit', 'Avoiding questions'],
    answer: 'Active listening',
    points: 1,
    order: 1,
  })

  await addDoc(collection(db, 'assignments'), {
    courseId,
    title: 'Reflection Note',
    description: 'Write a short reflection about your ideal doctor-patient conversation.',
    points: 10,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  await addDoc(collection(db, 'activationCodes'), {
    code: 'DEMO-2026-ALMS',
    batchName: 'sample-batch',
    courseId,
    maxUses: 1,
    usedCount: 0,
    active: true,
    isActive: true,
    isUsed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

void seed()
