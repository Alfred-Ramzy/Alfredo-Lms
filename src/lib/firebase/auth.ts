import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth'

import { auth } from '@/lib/firebase/config'

const googleProvider = new GoogleAuthProvider()

export function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function logout() {
  return signOut(auth)
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email)
}

export function changePassword(user: User, password: string) {
  return updatePassword(user, password)
}

export function subscribeToAuth(callback: Parameters<typeof onAuthStateChanged>[1]) {
  return onAuthStateChanged(auth, callback)
}
