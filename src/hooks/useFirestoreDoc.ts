import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'

import { db } from '@/lib/firebase/config'

export function useFirestoreDoc<T>(path: string[], enabled = true) {
  return useQuery({
    queryKey: ['doc', ...path],
    enabled,
    queryFn: async () => {
      const snapshot = await getDoc(doc(db, path.join('/')))
      return snapshot.exists() ? (snapshot.data() as T) : null
    },
  })
}
