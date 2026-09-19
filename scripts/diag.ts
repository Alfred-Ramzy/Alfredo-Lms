import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, getFirestore, limit, query } from 'firebase/firestore'

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

async function testDiag() {
  console.log('--- Testing Public / Unauthenticated Reads ---')
  try {
    const catSnap = await getDocs(collection(db, 'categories'))
    console.log('categories query: count =', catSnap.size)
    catSnap.forEach(d => console.log('Found category:', d.id, d.data().title))
  } catch (err: any) {
    console.log('categories error:', err.code, err.message)
  }

  try {
    const settingsSnap = await getDoc(doc(db, 'platformSettings', 'display_currency'))
    console.log('platformSettings/display_currency exists?', settingsSnap.exists(), settingsSnap.data())
  } catch (err: any) {
    console.log('platformSettings error:', err.code, err.message)
  }

  try {
    const coursesSnap = await getDocs(query(collection(db, 'courses'), where('status', '==', 'published'), limit(5)))
    console.log('courses query (status==published): count =', coursesSnap.size)
    coursesSnap.forEach(d => console.log('Found published course:', d.id, d.data().title))
  } catch (err: any) {
    console.log('courses query error:', err.code, err.message)
  }

  console.log('--- Testing Signing in as admin@alfredo.demo ---')
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin@alfredo.demo', 'Demo123!')
    console.log('Logged in as:', cred.user.email, cred.user.uid)

    try {
      const uSnap = await getDoc(doc(db, 'users', cred.user.uid))
      console.log('User doc:', uSnap.exists() ? uSnap.data() : 'NOT FOUND')
    } catch (e: any) {
      console.log('Get user doc error:', e.code, e.message)
    }

    try {
      const coursesSnap = await getDocs(collection(db, 'courses'))
      console.log('courses with auth count =', coursesSnap.size)
    } catch (e: any) {
      console.log('courses with auth error:', e.code, e.message)
    }
  } catch (err: any) {
    console.log('Auth error:', err.code, err.message)
  }

  process.exit(0)
}

testDiag().catch(console.error)
