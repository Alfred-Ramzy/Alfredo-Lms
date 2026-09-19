import { limit, query, where, getDocs, collection } from 'firebase/firestore'

import { db } from '@/lib/firebase/config'

export async function verifyCertificate(credentialId: string) {
  const snapshot = await getDocs(query(collection(db, 'certificates'), where('credentialId', '==', credentialId), limit(1)))
  if (snapshot.empty) {
    return null
  }
  return snapshot.docs[0].data() as {
    studentName?: string
    courseTitle?: string
    courseId?: string
    credentialId: string
    certificateIssuedAt?: unknown
  }
}
