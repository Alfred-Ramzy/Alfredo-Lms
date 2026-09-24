export type UserRole = 'admin' | 'instructor' | 'student'
export type Locale = 'en' | 'ar'
export type ThemeMode = 'dark' | 'light' | 'system'
export type CurrencyCode = 'EGP' | 'USD' | 'EUR' | 'SAR' | 'AED'
export type CourseStatus = 'draft' | 'published' | 'archived'

export interface UserDoc {
  uid: string
  email: string
  fullName: string
  fullNameAr?: string
  avatarUrl?: string
  role: UserRole
  phone?: string
  bio?: string
  preferredLocale: Locale
  preferredTheme: ThemeMode
  isActive: boolean
  activationRequired: boolean
  streakCount: number
  streakLastActive?: unknown
  xpPoints: number
  badges: string[]
  parentPhone?: string
  academicGrade?: string
  governorate?: string
  schoolName?: string
  adminNotes?: string
  createdAt: unknown
  updatedAt: unknown
}

export interface CourseDoc {
  instructorId: string
  instructorName?: string
  categoryId?: string
  categoryName?: string
  title: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  thumbnailUrl?: string
  trailerUrl?: string
  status: CourseStatus
  price: number
  currency: CurrencyCode
  discountPrice?: number
  level: 'beginner' | 'intermediate' | 'advanced'
  language: Locale | 'both'
  durationMinutes: number
  lessonsCount: number
  studentsCount: number
  rating: number
  ratingsCount: number
  isFeatured: boolean
  certificateEnabled: boolean
  maxDevices: number
  watchAttempts: number
  requiresActivation: boolean
  searchKeywords?: string[]
  isPackage?: boolean
  packageCourseIds?: string[]
  liveSchedule?: string
  liveScheduleAr?: string
  nextLiveDate?: string
  createdAt: unknown
  updatedAt: unknown
}

export interface CategoryDoc {
  title: string
  titleAr?: string
  description?: string
  slug: string
  icon?: string
  createdAt: unknown
  updatedAt: unknown
}

export interface SectionDoc {
  courseId: string
  title: string
  titleAr?: string
  order: number
  createdAt: unknown
  updatedAt: unknown
}

export interface LessonDoc {
  courseId: string
  sectionId: string
  title: string
  titleAr?: string
  summary?: string
  type: 'video' | 'quiz' | 'assignment' | 'text' | 'live'
  order: number
  durationMinutes: number
  isPreview: boolean
  videoUrl?: string
  attachmentUrl?: string
  createdAt: unknown
  updatedAt: unknown
}

export interface EnrollmentDoc {
  courseId: string
  courseTitle?: string
  studentId: string
  studentName?: string
  instructorId: string
  activationCodeId?: string
  status: 'active' | 'completed' | 'refunded' | 'cancelled'
  enrolledAt: unknown
  completedAt?: unknown
  progressPercent: number
  lastAccessedAt?: unknown
  lastLessonId?: string
  expiresAt?: unknown
  bookmarked?: boolean
  certificateIssued?: boolean
  certificateUrl?: string
  certificateIssuedAt?: unknown
  credentialId?: string
}

export interface LessonProgressDoc {
  courseId: string
  lessonId: string
  studentId: string
  completed: boolean
  watchedSeconds: number
  lastViewedAt?: unknown
  updatedAt: unknown
}

export interface QuizDoc {
  courseId: string
  lessonId?: string
  title: string
  titleAr?: string
  passingScore: number
  durationMinutes?: number
  randomizeQuestions: boolean
  attemptsAllowed?: number
  showAnswers?: boolean
  published?: boolean
  createdAt: unknown
  updatedAt: unknown
}

export interface QuestionDoc {
  quizId: string
  prompt: string
  promptAr?: string
  type: 'single' | 'multiple' | 'true_false' | 'short_text'
  options?: string[]
  optionsAr?: string[]
  answer: string | string[] | boolean
  points: number
  order: number
}

export interface QuizAttemptDoc {
  quizId: string
  courseId: string
  studentId: string
  score: number
  passed: boolean
  answers: Record<string, unknown>
  startedAt: unknown
  submittedAt?: unknown
}

export interface AssignmentDoc {
  courseId: string
  lessonId?: string
  title: string
  titleAr?: string
  description?: string
  dueAt?: unknown
  points: number
  published?: boolean
  createdAt: unknown
  updatedAt: unknown
}

export interface SubmissionDoc {
  assignmentId: string
  courseId: string
  studentId: string
  fileUrl?: string
  fileName?: string
  textAnswer?: string
  status?: 'pending' | 'graded' | 'returned'
  score?: number
  feedback?: string
  submittedAt: unknown
  gradedAt?: unknown
}

export interface PaymentDoc {
  studentId: string
  courseId?: string
  amount: number
  currency: CurrencyCode
  provider: 'manual' | 'stripe' | 'paymob' | 'fawry' | 'cash' | 'vodafone_cash' | 'instapay' | 'activation_code'
  status: 'pending' | 'completed' | 'paid' | 'failed' | 'rejected' | 'refunded'
  referenceId?: string
  proofUrl?: string
  studentName?: string
  studentEmail?: string
  courseTitle?: string
  isPackage?: boolean
  packageCourseIds?: string[]
  rejectionReason?: string
  createdAt: unknown
  updatedAt: unknown
}

export interface ActivationCodeDoc {
  code: string
  batchName?: string
  courseId?: string
  isPackage?: boolean
  packageCourseIds?: string[]
  assignedTo?: string
  expiresAt?: unknown
  maxUses: number
  usedCount: number
  isUsed?: boolean
  isActive?: boolean
  usedBy?: string
  usedAt?: unknown
  active: boolean
  createdAt: unknown
  updatedAt: unknown
}

export interface StudentDeviceDoc {
  studentId: string
  courseId?: string
  label: string
  fingerprint: string
  lastSeenAt?: unknown
  isTrusted: boolean
  status?: 'active' | 'revoked'
  createdAt: unknown
  updatedAt: unknown
}

export interface NotificationDoc {
  userId: string
  title: string
  titleAr?: string
  body: string
  bodyAr?: string
  type: 'system' | 'course' | 'payment' | 'achievement' | 'message'
  read: boolean
  isRead?: boolean
  href?: string
  createdAt: unknown
}

export interface ConversationDoc {
  participantIds: string[]
  participantNames?: string[]
  participantAvatarUrls?: string[]
  lastMessage?: string
  lastMessageAt?: unknown
  unreadCountByUser?: Record<string, number>
  createdAt: unknown
  updatedAt: unknown
}

export interface MessageDoc {
  conversationId: string
  participantIds: string[]
  senderId: string
  body: string
  attachments?: string[]
  readBy?: string[]
  createdAt: unknown
}

export interface DiscussionDoc {
  courseId: string
  authorId: string
  title: string
  body: string
  replyCount: number
  pinned: boolean
  createdAt: unknown
  updatedAt: unknown
}

export interface PlatformSettingDoc {
  key: string
  value: unknown
  updatedAt?: unknown
}
