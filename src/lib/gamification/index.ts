import { arrayUnion, doc, getDoc, increment } from 'firebase/firestore'

import { db } from '@/lib/firebase/config'
import { createNotification, safeBatchCommit } from '@/lib/firebase/firestore'
import type { UserDoc } from '@/types/firebase'

export const XP_REWARDS = {
  lesson_completed: 10,
  quiz_passed: 25,
  quiz_perfect_score: 50,
  assignment_submitted: 15,
  assignment_graded_excellent: 30,
  course_completed: 100,
  streak_milestone_7: 50,
  streak_milestone_30: 200,
  first_login: 5,
} as const

export const LEVELS = [
  { key: 'learner', name: 'Learner', nameAr: 'متعلم', minXp: 0, icon: '📚' },
  { key: 'explorer', name: 'Explorer', nameAr: 'مستكشف', minXp: 100, icon: '🔭' },
  { key: 'scholar', name: 'Scholar', nameAr: 'دارس', minXp: 500, icon: '🎓' },
  { key: 'master', name: 'Master', nameAr: 'متقن', minXp: 2000, icon: '⚡' },
  { key: 'legend', name: 'Legend', nameAr: 'أسطورة', minXp: 5000, icon: '👑' },
] as const

export const BADGES = {
  first_course: { icon: '🚀', name: 'Pioneer', nameAr: 'رائد' },
  speed_learner: { icon: '⚡', name: 'Speed Learner', nameAr: 'سريع التعلم' },
  quiz_master: { icon: '🎯', name: 'Quiz Master', nameAr: 'متقن الاختبارات' },
  streak_7: { icon: '🔥', name: 'On Fire', nameAr: 'في أوج النشاط' },
  streak_30: { icon: '💎', name: 'Diamond', nameAr: 'ماسي' },
  perfect_quiz: { icon: '🏆', name: 'Perfectionist', nameAr: 'الكمالي' },
  completionist: { icon: '✅', name: 'Completionist', nameAr: 'المكتمل' },
} as const

export type XpEvent = keyof typeof XP_REWARDS
export type BadgeKey = keyof typeof BADGES

export function getLevelForXp(xp: number) {
  return [...LEVELS].reverse().find((level) => xp >= level.minXp) ?? LEVELS[0]
}

export function getNextLevel(xp: number) {
  return LEVELS.find((level) => level.minXp > xp) ?? null
}

export function getProgressToNextLevel(xp: number) {
  const currentLevel = getLevelForXp(xp)
  const nextLevel = getNextLevel(xp)
  if (!nextLevel) {
    return { currentLevel, nextLevel: null, percent: 100, remainingXp: 0 }
  }

  const range = nextLevel.minXp - currentLevel.minXp
  const gained = xp - currentLevel.minXp
  return {
    currentLevel,
    nextLevel,
    percent: Math.min(100, Math.max(0, Math.round((gained / range) * 100))),
    remainingXp: Math.max(0, nextLevel.minXp - xp),
  }
}

async function loadUser(userId: string) {
  const snapshot = await getDoc(doc(db, 'users', userId))
  return snapshot.exists() ? (snapshot.data() as UserDoc) : null
}

export async function unlockBadge(userId: string, badgeKey: BadgeKey) {
  const user = await loadUser(userId)
  if (!user || user.badges.includes(badgeKey)) {
    return false
  }

  await safeBatchCommit((batch) => {
    batch.update(doc(db, 'users', userId), {
      badges: arrayUnion(badgeKey),
      updatedAt: new Date(),
    })
  })

  await createNotification({
    userId,
    title: `Badge unlocked: ${BADGES[badgeKey].name}`,
    titleAr: `تم فتح شارة: ${BADGES[badgeKey].nameAr}`,
    body: 'Your profile has been updated with a new achievement.',
    bodyAr: 'تم تحديث ملفك الشخصي بإنجاز جديد.',
    type: 'achievement',
    href: '/student/profile',
  })

  return true
}

export async function awardXp(userId: string, event: XpEvent, metadata?: { sourceDocPath?: string; sourceField?: string }) {
  const reward = XP_REWARDS[event]
  const user = await loadUser(userId)
  if (!user) {
    return { awarded: false, reason: 'missing_user' as const }
  }

  if (metadata?.sourceDocPath && metadata.sourceField) {
    const sourceSnapshot = await getDoc(doc(db, metadata.sourceDocPath))
    if (sourceSnapshot.exists() && sourceSnapshot.data()?.[metadata.sourceField]) {
      return { awarded: false, reason: 'already_awarded' as const }
    }
  }

  const currentLevel = getLevelForXp(user.xpPoints)
  const nextXp = user.xpPoints + reward
  const nextLevel = getLevelForXp(nextXp)

  await safeBatchCommit((batch) => {
    batch.update(doc(db, 'users', userId), {
      xpPoints: increment(reward),
      updatedAt: new Date(),
    })
    if (metadata?.sourceDocPath && metadata.sourceField) {
      batch.update(doc(db, metadata.sourceDocPath), {
        [metadata.sourceField]: true,
      })
    }
  })

  if (nextLevel.key !== currentLevel.key) {
    await createNotification({
      userId,
      title: `Level up: ${nextLevel.name}`,
      titleAr: `ترقية مستوى: ${nextLevel.nameAr}`,
      body: `You reached ${nextLevel.name}.`,
      bodyAr: `لقد وصلت إلى مستوى ${nextLevel.nameAr}.`,
      type: 'achievement',
      href: '/student/profile',
    })
  }

  if (event === 'quiz_perfect_score') await unlockBadge(userId, 'perfect_quiz')
  if (event === 'course_completed') await unlockBadge(userId, 'completionist')

  return { awarded: true, reward, nextLevel }
}

export async function updateStreak(userId: string) {
  const user = await loadUser(userId)
  if (!user) return null

  const now = new Date()
  const lastActive = user.streakLastActive && typeof user.streakLastActive === 'object' && 'toDate' in (user.streakLastActive as Record<string, unknown>)
    ? (user.streakLastActive as { toDate: () => Date }).toDate()
    : null
  const dayMs = 24 * 60 * 60 * 1000
  const diffDays = lastActive ? Math.floor((now.getTime() - lastActive.getTime()) / dayMs) : null
  const nextStreak = diffDays === 0 ? user.streakCount : diffDays === 1 || diffDays === null ? user.streakCount + 1 : 1

  await safeBatchCommit((batch) => {
    batch.update(doc(db, 'users', userId), {
      streakCount: nextStreak,
      streakLastActive: new Date(),
      updatedAt: new Date(),
    })
  })

  if (nextStreak === 7) {
    await awardXp(userId, 'streak_milestone_7')
    await unlockBadge(userId, 'streak_7')
  }
  if (nextStreak === 30) {
    await awardXp(userId, 'streak_milestone_30')
    await unlockBadge(userId, 'streak_30')
  }

  return nextStreak
}
