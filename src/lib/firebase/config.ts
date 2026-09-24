import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missingEnvKeys = requiredEnvKeys.filter((key) => !import.meta.env[key])

if (missingEnvKeys.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingEnvKeys.join(', ')}. `
    + 'Copy .env.example to .env.local and fill in your client-safe Firebase project values.',
  )
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const storageEnabled = import.meta.env.VITE_ENABLE_FIREBASE_STORAGE === 'true'
export const storageProvider = import.meta.env.VITE_STORAGE_PROVIDER ?? 'disabled'
export const fileUploadsEnabled = storageProvider !== 'disabled'

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
