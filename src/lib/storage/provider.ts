import { supabase } from '@/lib/supabase/client'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const DOC_TYPES = [...IMAGE_TYPES, 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const IMAGE_MAX = 5 * 1024 * 1024
const DOC_MAX = 10 * 1024 * 1024

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
}

function validateFile(file: File, types: string[], maxSize: number) {
  if (!types.includes(file.type)) {
    throw new Error('Unsupported file type for this upload.')
  }
  if (file.size > maxSize) {
    throw new Error(`File is too large. Maximum allowed size is ${Math.round(maxSize / (1024 * 1024))}MB.`)
  }
}

async function uploadFile(bucket: string, path: string, file: File) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) {
    throw new Error(error.message)
  }

  return getPublicUrl(bucket, path)
}

export function getPublicUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function deleteStorageFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    throw new Error(error.message)
  }
}

export async function uploadAvatar(userId: string, file: File) {
  validateFile(file, IMAGE_TYPES, IMAGE_MAX)
  const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}`
  return uploadFile('avatars', path, file)
}

export async function uploadCourseThumbnail(courseId: string, file: File) {
  validateFile(file, IMAGE_TYPES, IMAGE_MAX)
  const path = `${courseId}/${Date.now()}-${sanitizeFileName(file.name)}`
  return uploadFile('course-thumbnails', path, file)
}

export async function uploadAssignmentFile(assignmentId: string, userId: string, file: File) {
  validateFile(file, DOC_TYPES, DOC_MAX)
  const path = `${assignmentId}/${userId}/${Date.now()}-${sanitizeFileName(file.name)}`
  return uploadFile('assignment-files', path, file)
}

export async function uploadCertificate(studentId: string, courseId: string, file: File) {
  validateFile(file, ['application/pdf'], DOC_MAX)
  const path = `${studentId}/${courseId}-${Date.now()}.pdf`
  return uploadFile('certificates', path, file)
}

export async function uploadPaymentProof(paymentId: string, userId: string, file: File) {
  validateFile(file, DOC_TYPES, DOC_MAX)
  const path = `${paymentId}/${userId}/${Date.now()}-${sanitizeFileName(file.name)}`
  return uploadFile('payment-proofs', path, file)
}
