import { createElement } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createRoot } from 'react-dom/client'

import { fileUploadsEnabled } from '@/lib/firebase/config'
import { createNotification, safeBatchCommit } from '@/lib/firebase/firestore'
import { createCredentialId } from '@/lib/certificates/credential'
import { buildCertificateTemplate } from '@/lib/certificates/certificateTemplate'
import { db } from '@/lib/firebase/config'
import { doc } from 'firebase/firestore'
import { awardXp, unlockBadge } from '@/lib/gamification'
import { uploadCertificate as uploadCertificateFile } from '@/lib/storage/provider'
import type { Locale } from '@/types/firebase'

async function createQrDataUrl(url: string) {
  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.left = '-9999px'
  document.body.appendChild(host)
  const root = createRoot(host)

  return await new Promise<string>((resolve) => {
    root.render(createElement(QRCodeSVG, { value: url, size: 120, includeMargin: true }))
    requestAnimationFrame(() => {
      const svg = host.querySelector('svg')
      const data = svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.outerHTML)}` : ''
      root.unmount()
      host.remove()
      resolve(data)
    })
  })
}

export async function generateCertificate(input: { studentId: string; studentName: string; courseId: string; courseTitle: string; enrollmentId: string; locale: Locale }) {
  const credentialId = createCredentialId()
  const verificationUrl = `${window.location.origin}/verify/${credentialId}`
  const qrDataUrl = await createQrDataUrl(verificationUrl)
  let certificateUrl: string | null = null

  if (fileUploadsEnabled) {
    const html = buildCertificateTemplate({
      studentName: input.studentName,
      courseTitle: input.courseTitle,
      date: new Date().toLocaleDateString(input.locale === 'ar' ? 'ar-EG' : 'en-US'),
      credentialId,
      locale: input.locale,
      qrDataUrl,
    })

    const host = document.createElement('div')
    host.style.position = 'fixed'
    host.style.left = '-99999px'
    host.innerHTML = html
    document.body.appendChild(host)

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
    const canvas = await html2canvas(host.firstElementChild as HTMLElement, { scale: 2, backgroundColor: '#ffffff' })
    host.remove()

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] })
    const image = canvas.toDataURL('image/png')
    pdf.addImage(image, 'PNG', 0, 0, canvas.width, canvas.height)
    const blob = pdf.output('blob')
    const file = new File([blob], `${input.courseId}-${credentialId}.pdf`, { type: 'application/pdf' })
    certificateUrl = await uploadCertificateFile(input.studentId, input.courseId, file)
  }

  await safeBatchCommit((batch) => {
    batch.update(doc(db, 'enrollments', input.enrollmentId), {
      certificateUrl,
      certificateIssuedAt: new Date(),
      certificateIssued: true,
      credentialId,
      updatedAt: new Date(),
    })
    batch.set(doc(db, 'certificates', credentialId), {
      studentId: input.studentId,
      studentName: input.studentName,
      courseId: input.courseId,
      courseTitle: input.courseTitle,
      credentialId,
      certificateUrl,
      certificateIssuedAt: new Date(),
      createdBy: 'Alfred Ramzy',
      storageMode: fileUploadsEnabled ? 'enabled' : 'disabled',
    })
  })

  await createNotification({
    userId: input.studentId,
    title: 'Certificate issued',
    titleAr: 'تم إصدار الشهادة',
    body: `Your certificate for ${input.courseTitle} is ready.`,
    bodyAr: `شهادتك الخاصة بدورة ${input.courseTitle} أصبحت جاهزة.`,
    type: 'achievement',
    href: '/student/certificates',
  })

  await awardXp(input.studentId, 'course_completed', { sourceDocPath: `enrollments/${input.enrollmentId}`, sourceField: 'xpAwarded_course_completed' })
  await unlockBadge(input.studentId, 'first_course')

  return { certificateUrl, credentialId }
}
