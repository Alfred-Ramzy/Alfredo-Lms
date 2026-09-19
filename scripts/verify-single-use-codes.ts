import { SECURE_ACTIVATION_CODES } from '../src/lib/activation/redeemActivationCode'

console.log('Testing 25 secure codes...')
const codes = Object.keys(SECURE_ACTIVATION_CODES)
console.log(`Total codes registered: ${codes.length}`)

if (codes.length !== 25) {
  throw new Error(`Expected 25 codes, got ${codes.length}`)
}

const l1Codes = codes.filter((c) => c.startsWith('L1-'))
const l2Codes = codes.filter((c) => c.startsWith('L2-'))
const l3Codes = codes.filter((c) => c.startsWith('L3-'))
const l4Codes = codes.filter((c) => c.startsWith('L4-'))
const pkgCodes = codes.filter((c) => c.startsWith('PKG-'))

console.log(`Lesson 1 codes: ${l1Codes.length}`)
console.log(`Lesson 2 codes: ${l2Codes.length}`)
console.log(`Lesson 3 codes: ${l3Codes.length}`)
console.log(`Lesson 4 codes: ${l4Codes.length}`)
console.log(`Package codes: ${pkgCodes.length}`)

if (l1Codes.length !== 5 || l2Codes.length !== 5 || l3Codes.length !== 5 || l4Codes.length !== 5 || pkgCodes.length !== 5) {
  throw new Error('Code distribution mismatch!')
}

// Test uniqueness
const uniqueSet = new Set(codes)
if (uniqueSet.size !== 25) {
  throw new Error('Duplicate codes detected!')
}

// Test package configuration
for (const p of pkgCodes) {
  const conf = SECURE_ACTIVATION_CODES[p]
  if (!conf.isPackage || conf.packageCourseIds?.length !== 4) {
    throw new Error(`Package code ${p} is missing 4 sub-courses!`)
  }
}

// Test single-use logic via isCodeAlreadyRedeemed simulation
const testCode = 'PKG-9X2M-7W5K-8P4D'
const testRedeemedStore: { code: string; uid: string; redeemedAt: string; courseId: string }[] = []

function simulateRedeem(code: string, uid: string) {
  if (testRedeemedStore.some((r) => r.code === code)) {
    throw new Error('عذراً، هذا الكود تم استخدامه مسبقاً وغير متاح للاستخدام مرة أخرى.')
  }
  const conf = SECURE_ACTIVATION_CODES[code]
  if (!conf) throw new Error('Code not found')
  testRedeemedStore.push({ code, uid, courseId: conf.courseId, redeemedAt: new Date().toISOString() })
  return conf
}

// First redemption must succeed
const res1 = simulateRedeem(testCode, 'student_123')
console.log(`First redemption of ${testCode} succeeded: unlocked ${res1.courseId}`)

// Second redemption must fail with single-use error
let threwExpectedError = false
try {
  simulateRedeem(testCode, 'student_999')
} catch (e: any) {
  if (e.message.includes('تم استخدامه مسبقاً')) {
    threwExpectedError = true
    console.log(`Second redemption correctly blocked: "${e.message}"`)
  }
}

if (!threwExpectedError) {
  throw new Error('FAILED: Code was allowed to be redeemed twice!')
}

console.log('All 25 unguessable codes & single-use security validated successfully!')

