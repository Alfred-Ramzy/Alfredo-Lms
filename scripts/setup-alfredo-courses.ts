/// <reference types="node" />

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  writeBatch,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAf48HUnopW5GfBDYvvV2qM-q1KFr6KvWQ',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'lmsproject-8974c.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID ?? 'lmsproject-8974c',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'lmsproject-8974c.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '334688009759',
  appId: process.env.VITE_FIREBASE_APP_ID ?? '1:334688009759:web:28b861dfa3a33ee2389f2a',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const sampleUsers = [
  { email: 'admin@alfredo.demo', password: 'Demo123!', fullName: 'Alfredo Admin', role: 'admin' },
  { email: 'instructor@alfredo.demo', password: 'Demo123!', fullName: 'Engineer Alfredo', role: 'instructor' },
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

async function clearCollection(collectionName: string) {
  console.log(`Clearing collection: ${collectionName}...`)
  const snap = await getDocs(collection(db, collectionName))
  console.log(`Found ${snap.size} documents in ${collectionName}`)
  for (const document_ of snap.docs) {
    await deleteDoc(doc(db, collectionName, document_.id))
  }
}

async function run() {
  console.log('--- Step 1: Ensure Users & Authenticate as Admin ---')
  for (const user of sampleUsers) {
    await ensureAuthUser(user.email, user.password)
  }

  // Sign in as admin so Firestore operations have full admin rights
  console.log('Signing in as admin@alfredo.demo...')
  const adminCred = await signInWithEmailAndPassword(auth, 'admin@alfredo.demo', 'Demo123!')
  console.log('Successfully authenticated as admin:', adminCred.user.uid)

  const adminDocSnap = await getDoc(doc(db, 'users', adminCred.user.uid))
  console.log('Admin userDoc exists?', adminDocSnap.exists())
  if (adminDocSnap.exists()) {
    console.log('Admin userDoc data:', adminDocSnap.data())
  } else {
    console.log('Admin userDoc does NOT exist! Attempting create/set...')
  }

  console.log('--- Step 2: Clear old courses, lessons, codes, enrollments, quizzes, assignments ---')
  await clearCollection('courses')
  await clearCollection('lessons')
  await clearCollection('activationCodes')
  await clearCollection('enrollments')
  await clearCollection('quizzes')
  await clearCollection('assignments')

  console.log('--- Step 3: Setup Platform Settings and Category ---')
  await Promise.all([
    setDoc(doc(db, 'platformSettings', 'display_currency'), { key: 'display_currency', value: 'EGP', updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'currency_rates'), { key: 'currency_rates', value: { EGP: 1, USD: 50, EUR: 55, SAR: 13, AED: 13.5 }, updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'registration_open'), { key: 'registration_open', value: true, updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'maintenance_mode'), { key: 'maintenance_mode', value: false, updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'payment_instructions'), {
      key: 'payment_instructions',
      value: 'قم بالتحويل عبر فودافون كاش على رقم 01021487841 أو عبر إنستاباي alfredo@instapay ثم ارفع لقطة الشاشة (الإيصال) واكتب رقم العملية للمراجعة والتفعيل الفوري.',
      updatedAt: new Date(),
    }),
    setDoc(doc(db, 'platformSettings', 'max_devices_global'), { key: 'max_devices_global', value: 2, updatedAt: new Date() }),
    setDoc(doc(db, 'platformSettings', 'license_status'), { key: 'license_status', value: 'active', updatedAt: new Date() }),
    setDoc(doc(db, 'categories', 'programming-ai'), {
      title: 'Programming & AI',
      titleAr: 'البرمجة والذكاء الاصطناعي',
      slug: 'programming-ai',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ])

  console.log('--- Step 4: Create the 4 Lessons ---')
  const liveScheduleText = 'كل يوم أربعاء الساعة 6:00 مساءً'
  const nextLiveTimestamp = '2026-09-23T18:00:00'

  const lessonsData = [
    {
      id: 'lesson-1',
      title: 'Lesson 1: Foundations',
      titleAr: 'الحصة 1: أساسيات البرمجة والذكاء الاصطناعي',
      description: 'Foundations of programming, computational thinking, algorithms, and introducing AI concepts.',
      descriptionAr: 'تأسيس قوي في التفكير البرمجي، المفاهيم الأساسية للخوارزميات ومقدمة في عالم الذكاء الاصطناعي.',
      thumbnailUrl: '/images/courses/lesson-1.jpg',
      price: 120,
      durationMinutes: 120,
      lessonsCount: 1,
      order: 1,
    },
    {
      id: 'lesson-2',
      title: 'Lesson 2: Practice',
      titleAr: 'الحصة 2: التطبيق والممارسة البرمجية',
      description: 'Hands-on practice, coding structures, solving real problems, and debugging.',
      descriptionAr: 'تطبيق عملي مكثف، هياكل البيانات، حل المشكلات البرمجية والتصحيح خطوة بخطوة.',
      thumbnailUrl: '/images/courses/lesson-2.jpg',
      price: 120,
      durationMinutes: 120,
      lessonsCount: 1,
      order: 2,
    },
    {
      id: 'lesson-3',
      title: 'Lesson 3: Projects',
      titleAr: 'الحصة 3: بناء المشاريع الحقيقية',
      description: 'End-to-end practical project development, architectures, and implementation.',
      descriptionAr: 'بناء مشاريع برمجية متكاملة وتطبيقات عملية تربط كافة المفاهيم ببعضها.',
      thumbnailUrl: '/images/courses/lesson-3.jpg',
      price: 120,
      durationMinutes: 120,
      lessonsCount: 1,
      order: 3,
    },
    {
      id: 'lesson-4',
      title: 'Lesson 4: AI Tools',
      titleAr: 'الحصة 4: أدوات ونماذج الذكاء الاصطناعي',
      description: 'Advanced AI tooling, prompt engineering, LLM integration, and modern tech workflows.',
      descriptionAr: 'التعامل مع أدوات ونماذج الذكاء الاصطناعي الحديثة وهندسة الأوامر وتوظيف الذكاء الاصطناعي.',
      thumbnailUrl: '/images/courses/lesson-4.jpg',
      price: 120,
      durationMinutes: 120,
      lessonsCount: 1,
      order: 4,
    },
  ]

  for (const item of lessonsData) {
    await setDoc(doc(db, 'courses', item.id), {
      instructorId,
      instructorName,
      categoryId: 'programming-ai',
      categoryName: 'Programming & AI',
      title: item.title,
      titleAr: item.titleAr,
      description: item.description,
      descriptionAr: item.descriptionAr,
      thumbnailUrl: item.thumbnailUrl,
      status: 'published',
      price: item.price,
      currency: 'EGP',
      level: 'beginner',
      language: 'both',
      durationMinutes: item.durationMinutes,
      lessonsCount: 1,
      studentsCount: 0,
      rating: 5.0,
      ratingsCount: 24,
      isFeatured: true,
      certificateEnabled: true,
      maxDevices: 2,
      watchAttempts: 10,
      requiresActivation: false,
      isPackage: false,
      liveSchedule: liveScheduleText,
      liveScheduleAr: liveScheduleText,
      nextLiveDate: nextLiveTimestamp,
      searchKeywords: ['programming', 'ai', 'lesson', item.id, 'alfredo', 'ذكاء اصطناعي', 'برمجة'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await setDoc(doc(db, 'lessons', `${item.id}-content`), {
      courseId: item.id,
      sectionId: 'main-section',
      title: item.title,
      titleAr: item.titleAr,
      type: 'live',
      order: 1,
      durationMinutes: item.durationMinutes,
      isPreview: false,
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      liveMeetingUrl: 'https://meet.google.com/alfredo-live-class',
      liveSchedule: liveScheduleText,
      nextLiveDate: nextLiveTimestamp,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  console.log('--- Step 5: Create the Package: First Month Package ---')
  const packageId = 'first-month-package'
  await setDoc(doc(db, 'courses', packageId), {
    instructorId,
    instructorName,
    categoryId: 'programming-ai',
    categoryName: 'Programming & AI',
    title: 'First Month Package',
    titleAr: 'باكدج الشهر الأول (4 حصص)',
    description: 'Complete 1st month bundle containing all 4 lessons (Foundations, Practice, Projects, AI Tools) with weekly live sessions every Wednesday at 6:00 PM.',
    descriptionAr: 'الباقة الشاملة للشهر الأول وتضم الـ 4 حصص كاملة (الأساسيات، التطبيق، المشاريع، وأدوات الذكاء الاصطناعي) مع حضور حصص اللايف الأسبوعية كل أربعاء الساعة 6 مساءً وخصم خاص.',
    thumbnailUrl: '/images/courses/first-month-package.jpg',
    status: 'published',
    price: 440,
    currency: 'EGP',
    level: 'beginner',
    language: 'both',
    durationMinutes: 480,
    lessonsCount: 4,
    studentsCount: 0,
    rating: 5.0,
    ratingsCount: 48,
    isFeatured: true,
    certificateEnabled: true,
    maxDevices: 2,
    watchAttempts: 10,
    requiresActivation: false,
    isPackage: true,
    packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
    liveSchedule: liveScheduleText,
    liveScheduleAr: liveScheduleText,
    nextLiveDate: nextLiveTimestamp,
    searchKeywords: ['package', 'first month', 'programming', 'ai', 'باكدج', 'الشهر الأول'],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // Also add a lesson inside package so direct viewing works
  await setDoc(doc(db, 'lessons', `${packageId}-overview`), {
    courseId: packageId,
    sectionId: 'main-section',
    title: 'First Month Package Welcome & Live Schedule',
    titleAr: 'ترحيب باكدج الشهر الأول ومواعيد اللايف الأسبوعية',
    type: 'live',
    order: 1,
    durationMinutes: 480,
    isPreview: false,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    liveMeetingUrl: 'https://meet.google.com/alfredo-live-class',
    liveSchedule: liveScheduleText,
    nextLiveDate: nextLiveTimestamp,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  console.log('--- Step 6: Generate Activation Codes for Lessons & Package ---')
  const codes = [
    // Lesson 1 codes
    { code: 'L1-ALF-1010', courseId: 'lesson-1', batchName: 'Lesson 1 Codes' },
    { code: 'L1-ALF-1020', courseId: 'lesson-1', batchName: 'Lesson 1 Codes' },
    { code: 'L1-ALF-1030', courseId: 'lesson-1', batchName: 'Lesson 1 Codes' },
    { code: 'L1-ALF-1040', courseId: 'lesson-1', batchName: 'Lesson 1 Codes' },
    { code: 'L1-ALF-1050', courseId: 'lesson-1', batchName: 'Lesson 1 Codes' },

    // Lesson 2 codes
    { code: 'L2-ALF-2010', courseId: 'lesson-2', batchName: 'Lesson 2 Codes' },
    { code: 'L2-ALF-2020', courseId: 'lesson-2', batchName: 'Lesson 2 Codes' },
    { code: 'L2-ALF-2030', courseId: 'lesson-2', batchName: 'Lesson 2 Codes' },
    { code: 'L2-ALF-2040', courseId: 'lesson-2', batchName: 'Lesson 2 Codes' },
    { code: 'L2-ALF-2050', courseId: 'lesson-2', batchName: 'Lesson 2 Codes' },

    // Lesson 3 codes
    { code: 'L3-ALF-3010', courseId: 'lesson-3', batchName: 'Lesson 3 Codes' },
    { code: 'L3-ALF-3020', courseId: 'lesson-3', batchName: 'Lesson 3 Codes' },
    { code: 'L3-ALF-3030', courseId: 'lesson-3', batchName: 'Lesson 3 Codes' },
    { code: 'L3-ALF-3040', courseId: 'lesson-3', batchName: 'Lesson 3 Codes' },
    { code: 'L3-ALF-3050', courseId: 'lesson-3', batchName: 'Lesson 3 Codes' },

    // Lesson 4 codes
    { code: 'L4-ALF-4010', courseId: 'lesson-4', batchName: 'Lesson 4 Codes' },
    { code: 'L4-ALF-4020', courseId: 'lesson-4', batchName: 'Lesson 4 Codes' },
    { code: 'L4-ALF-4030', courseId: 'lesson-4', batchName: 'Lesson 4 Codes' },
    { code: 'L4-ALF-4040', courseId: 'lesson-4', batchName: 'Lesson 4 Codes' },
    { code: 'L4-ALF-4050', courseId: 'lesson-4', batchName: 'Lesson 4 Codes' },

    // First Month Package codes (Package unlocks all 4 lessons!)
    { code: 'PKG-ALF-9010', courseId: 'first-month-package', isPackage: true, packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'], batchName: 'First Month Package Codes' },
    { code: 'PKG-ALF-9020', courseId: 'first-month-package', isPackage: true, packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'], batchName: 'First Month Package Codes' },
    { code: 'PKG-ALF-9030', courseId: 'first-month-package', isPackage: true, packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'], batchName: 'First Month Package Codes' },
    { code: 'PKG-ALF-9040', courseId: 'first-month-package', isPackage: true, packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'], batchName: 'First Month Package Codes' },
    { code: 'PKG-ALF-9050', courseId: 'first-month-package', isPackage: true, packageCourseIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'], batchName: 'First Month Package Codes' },
  ]

  for (const c of codes) {
    await setDoc(doc(db, 'activationCodes', c.code), {
      code: c.code,
      batchName: c.batchName,
      courseId: c.courseId,
      isPackage: Boolean(c.isPackage),
      packageCourseIds: c.packageCourseIds ?? null,
      maxUses: 1,
      usedCount: 0,
      active: true,
      isActive: true,
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  console.log('--- ALL SETUP COMPLETED SUCCESSFULLY! ---')
  console.log(`4 Lessons created: lesson-1, lesson-2, lesson-3, lesson-4 (120 EGP each)`)
  console.log(`1 Package created: first-month-package (440 EGP)`)
  console.log(`Live sessions scheduled: Every Wednesday at 6:00 PM starting ${nextLiveTimestamp}`)
  console.log(`Generated ${codes.length} activation codes.`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
