import { useQuery } from '@tanstack/react-query'
import { type QueryConstraint } from 'firebase/firestore'

import { getCollectionDocs } from '@/lib/firebase/firestore'

export function useFirestoreCollection<T>(path: string, constraints: QueryConstraint[] = []) {
  return useQuery({
    queryKey: ['collection', path, constraints.map(String).join('|')],
    queryFn: () => getCollectionDocs<T>(path, constraints),
  })
}
