import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { verifyCertificate } from '@/lib/certificates/verifyCertificate'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'

export default function VerifyPage() {
  const { credentialId } = useParams()
  const verificationQuery = useQuery({
    queryKey: ['verify-certificate', credentialId],
    enabled: Boolean(credentialId),
    queryFn: () => verifyCertificate(credentialId ?? ''),
  })

  const record = verificationQuery.data

  return (
    <main className="container flex min-h-screen items-center justify-center py-10">
      <Card className="max-w-xl">
        <CardTitle>{record ? 'Certificate Verified' : 'Certificate Not Found'}</CardTitle>
        <CardDescription className="mt-3">
          {record
            ? `Credential ${credentialId} belongs to ${record.studentName ?? 'Student'} for ${record.courseTitle ?? record.courseId}.`
            : `We could not verify credential ${credentialId}.`}
        </CardDescription>
      </Card>
    </main>
  )
}
