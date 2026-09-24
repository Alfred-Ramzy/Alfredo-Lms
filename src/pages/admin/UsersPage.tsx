import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { limit, orderBy } from 'firebase/firestore'
import {
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Flame,
  GraduationCap,
  Key,
  Lock,
  Mail,
  MessageCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Smartphone,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from 'lucide-react'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { resetPassword } from '@/lib/firebase/auth'
import {
  createEnrollment,
  createStudentWithPassword,
  deleteEnrollmentDoc,
  deleteUserDoc,
  getCollectionDocs,
  resetStudentDevices,
  updateDocTyped,
} from '@/lib/firebase/firestore'
import { uploadAvatar } from '@/lib/storage/provider'
import type { CourseDoc, EnrollmentDoc, StudentDeviceDoc, UserDoc, UserRole } from '@/types/firebase'

const ACADEMIC_GRADES = [
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي (ثانوية عامة)',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'المرحلة الجامعية',
  'أخرى / عام',
]

const EGYPT_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'المنوفية',
  'القليوبية',
  'البحيرة',
  'الغربية',
  'بور سعيد',
  'دمياط',
  'الإسماعيلية',
  'السويس',
  'كفر الشيخ',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'instructor' | 'admin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'needs_activation'>('all')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'xp'>('newest')

  // Selected Student for Full Management Modal
  const [selectedStudent, setSelectedStudent] = useState<UserDoc | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'devices' | 'courses' | 'gamification'>('profile')

  // Create New Student Modal
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newStudentSuccess, setNewStudentSuccess] = useState<{ email: string; pass: string; name: string } | null>(null)

  // Loading states
  const [actionLoading, setActionLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [selectedCourseToEnroll, setSelectedCourseToEnroll] = useState('')

  // Queries
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getCollectionDocs<UserDoc>('users', [orderBy('createdAt', 'desc'), limit(200)]),
    refetchInterval: 15000,
  })

  const coursesQuery = useQuery({
    queryKey: ['admin-courses-lookup'],
    queryFn: () => getCollectionDocs<CourseDoc>('courses'),
  })

  const enrollmentsQuery = useQuery({
    queryKey: ['admin-enrollments-all'],
    queryFn: () => getCollectionDocs<EnrollmentDoc>('enrollments'),
  })

  const devicesQuery = useQuery({
    queryKey: ['admin-devices-all'],
    queryFn: () => getCollectionDocs<StudentDeviceDoc>('studentDevices'),
  })

  const users = usersQuery.data ?? []
  const courses = coursesQuery.data ?? []
  const enrollments = enrollmentsQuery.data ?? []
  const devices = devicesQuery.data ?? []

  // KPI Calculations
  const stats = useMemo(() => {
    const students = users.filter((u) => u.role === 'student')
    const active = students.filter((u) => u.isActive)
    const inactive = students.filter((u) => !u.isActive)
    const needsActivation = students.filter((u) => u.activationRequired)
    return {
      totalUsers: users.length,
      totalStudents: students.length,
      activeStudents: active.length,
      inactiveStudents: inactive.length,
      needsActivation: needsActivation.length,
    }
  }, [users])

  // Filtered and Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        if (roleFilter !== 'all' && user.role !== roleFilter) return false
        if (statusFilter === 'active' && !user.isActive) return false
        if (statusFilter === 'inactive' && user.isActive) return false
        if (statusFilter === 'needs_activation' && !user.activationRequired) return false
        if (gradeFilter !== 'all' && user.academicGrade !== gradeFilter) return false

        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase().trim()
        return (
          user.fullName?.toLowerCase().includes(q) ||
          user.fullNameAr?.toLowerCase().includes(q) ||
          user.email?.toLowerCase().includes(q) ||
          user.phone?.toLowerCase().includes(q) ||
          user.parentPhone?.toLowerCase().includes(q) ||
          user.academicGrade?.toLowerCase().includes(q) ||
          user.governorate?.toLowerCase().includes(q) ||
          user.schoolName?.toLowerCase().includes(q) ||
          user.uid?.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'name') return (a.fullName || '').localeCompare(b.fullName || '')
        if (sortBy === 'xp') return (b.xpPoints || 0) - (a.xpPoints || 0)
        return 0
      })
  }, [users, roleFilter, statusFilter, gradeFilter, searchQuery, sortBy])

  // Quick WhatsApp helper
  const openWhatsApp = (phone: string | undefined, message: string) => {
    if (!phone) {
      toast({ title: 'رقم الهاتف غير مسجل', description: 'يرجى تسجيل رقم هاتف الطالب أولاً.' })
      return
    }
    const clean = phone.replace(/[^0-9]/g, '')
    const formatted = clean.startsWith('0') ? `2${clean}` : clean
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // Quick Reset Password Email
  const handleSendResetPassword = async (email: string) => {
    try {
      setActionLoading(true)
      await resetPassword(email)
      toast({
        title: 'تم إرسال رابط استعادة كلمة المرور',
        description: `تم إرسال رابط التعيين إلى الإيميل: ${email} بنجاح.`,
      })
    } catch (err) {
      console.error('Password reset error:', err)
      toast({
        title: 'تعذر إرسال الرابط',
        description: err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال البريد.',
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle User Active Status
  const handleToggleActive = async (user: UserDoc) => {
    try {
      setActionLoading(true)
      const next = !user.isActive
      await updateDocTyped<Pick<UserDoc, 'isActive'>>(`users/${user.uid}`, { isActive: next })
      toast({
        title: next ? 'تم تفعيل الحساب' : 'تم تجميد الحساب',
        description: `تم تحديث حالة حساب الطالب: ${user.fullName}`,
      })
      await usersQuery.refetch()
      if (selectedStudent?.uid === user.uid) {
        setSelectedStudent({ ...selectedStudent, isActive: next })
      }
    } catch {
      toast({ title: 'فشل التحديث', description: 'حدث خطأ أثناء تعديل الحالة.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle Activation Required
  const handleToggleActivationRequired = async (user: UserDoc) => {
    try {
      setActionLoading(true)
      const next = !user.activationRequired
      await updateDocTyped<Pick<UserDoc, 'activationRequired'>>(`users/${user.uid}`, { activationRequired: next })
      toast({
        title: 'تم تحديث شرط التفعيل',
        description: next ? 'الحساب الآن يتطلب كود تفعيل' : 'تم إلغاء شرط كود التفعيل',
      })
      await usersQuery.refetch()
      if (selectedStudent?.uid === user.uid) {
        setSelectedStudent({ ...selectedStudent, activationRequired: next })
      }
    } catch {
      toast({ title: 'فشل التحديث', description: 'حدث خطأ أثناء تعديل الشرط.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Reset Student Devices
  const handleResetDevices = async (studentId: string) => {
    try {
      setActionLoading(true)
      await resetStudentDevices(studentId)
      toast({
        title: 'تم فك ربط الأجهزة بنجاح',
        description: 'تم مسح جميع الأجهزة المسجلة للطالب، ويمكنه الآن الدخول من جهازه الجديد فوراً.',
      })
      await devicesQuery.refetch()
    } catch {
      toast({ title: 'فشل فك الربط', description: 'تعذر مسح الأجهزة المسجلة.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Enroll Student in Course
  const handleEnrollStudent = async (student: UserDoc, courseId: string) => {
    if (!courseId) return
    const course = courses.find((c) => c.id === courseId)
    if (!course) return

    try {
      setActionLoading(true)
      await createEnrollment({
        courseId,
        courseTitle: course.title,
        studentId: student.uid,
        studentName: student.fullName,
        instructorId: course.instructorId,
        status: 'active',
        progressPercent: 0,
      })
      toast({
        title: 'تم تفعيل الكورس للطالب',
        description: `تم تسجيل الطالب في "${course.titleAr || course.title}" بنجاح.`,
      })
      setSelectedCourseToEnroll('')
      await enrollmentsQuery.refetch()
    } catch {
      toast({ title: 'فشل التسجيل', description: 'تعذر تسجيل الكورس للطالب.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Remove Enrollment
  const handleRemoveEnrollment = async (enrollmentId: string) => {
    try {
      setActionLoading(true)
      await deleteEnrollmentDoc(enrollmentId)
      toast({ title: 'تم إلغاء الكورس', description: 'تم إزالة اشتراك الكورس للطالب.' })
      await enrollmentsQuery.refetch()
    } catch {
      toast({ title: 'فشل الحذف', description: 'تعذر إزالة الاشتراك.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Delete User
  const handleDeleteUser = async (uid: string) => {
    if (!confirm('تحذير: هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً من قاعدة البيانات؟')) return
    try {
      setActionLoading(true)
      await deleteUserDoc(uid)
      toast({ title: 'تم حذف الحساب', description: 'تم مسح بيانات المستخدم بنجاح.' })
      setSelectedStudent(null)
      await usersQuery.refetch()
    } catch {
      toast({ title: 'فشل الحذف', description: 'تعذر حذف الحساب.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Update Profile Changes
  const handleSaveStudentProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedStudent) return

    const formData = new FormData(e.currentTarget)
    const updates = {
      fullName: String(formData.get('fullName') || '').trim(),
      fullNameAr: String(formData.get('fullNameAr') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      parentPhone: String(formData.get('parentPhone') || '').trim(),
      academicGrade: String(formData.get('academicGrade') || '').trim(),
      governorate: String(formData.get('governorate') || '').trim(),
      schoolName: String(formData.get('schoolName') || '').trim(),
      adminNotes: String(formData.get('adminNotes') || '').trim(),
      role: formData.get('role') as UserRole,
      xpPoints: Number(formData.get('xpPoints') || 0),
      streakCount: Number(formData.get('streakCount') || 0),
    }

    try {
      setActionLoading(true)
      await updateDocTyped(`users/${selectedStudent.uid}`, updates)
      toast({ title: 'تم حفظ التعديلات', description: 'تم تحديث بيانات وإعدادات الطالب بنجاح.' })
      setSelectedStudent({ ...selectedStudent, ...updates })
      await usersQuery.refetch()
    } catch {
      toast({ title: 'فشل الحفظ', description: 'حدث خطأ أثناء حفظ التعديلات.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Upload Avatar
  const handleAvatarUpload = async (file: File) => {
    if (!selectedStudent) return
    try {
      setAvatarUploading(true)
      const avatarUrl = await uploadAvatar(selectedStudent.uid, file)
      await updateDocTyped<Pick<UserDoc, 'avatarUrl'>>(`users/${selectedStudent.uid}`, { avatarUrl })
      setSelectedStudent({ ...selectedStudent, avatarUrl })
      await usersQuery.refetch()
      toast({ title: 'تم تحديث الصورة الشخصية' })
    } catch {
      toast({ title: 'فشل رفع الصورة' })
    } finally {
      setAvatarUploading(false)
    }
  }

  // Create Student Form Submit
  const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const fullName = String(formData.get('fullName') || '').trim()
    const fullNameAr = String(formData.get('fullNameAr') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const parentPhone = String(formData.get('parentPhone') || '').trim()
    const academicGrade = String(formData.get('academicGrade') || '').trim()
    const governorate = String(formData.get('governorate') || '').trim()
    const schoolName = String(formData.get('schoolName') || '').trim()
    const adminNotes = String(formData.get('adminNotes') || '').trim()
    const initialCourseId = String(formData.get('initialCourseId') || '').trim()

    if (!fullName || !email || !password) {
      toast({ title: 'بيانات ناقصة', description: 'يرجى كتابة الاسم والبريد الإلكتروني وكلمة المرور.' })
      return
    }

    if (password.length < 6) {
      toast({ title: 'كلمة مرور قصيرة', description: 'يجب أن لا تقل كلمة المرور عن 6 أحرف أو أرقام.' })
      return
    }

    try {
      setActionLoading(true)
      const uid = await createStudentWithPassword({
        fullName,
        fullNameAr,
        email,
        password,
        phone,
        parentPhone,
        academicGrade,
        governorate,
        schoolName,
        adminNotes,
      })

      if (initialCourseId) {
        const c = courses.find((item) => item.id === initialCourseId)
        if (c) {
          await createEnrollment({
            courseId: initialCourseId,
            courseTitle: c.title,
            studentId: uid,
            studentName: fullName,
            instructorId: c.instructorId,
            status: 'active',
            progressPercent: 0,
          })
        }
      }

      setNewStudentSuccess({ email, pass: password, name: fullName })
      toast({ title: 'تم إنشاء حساب الطالب بنجاح', description: 'تم ربط الحساب بكلمة المرور المحددة.' })
      await usersQuery.refetch()
      await enrollmentsQuery.refetch()
      form.reset()
    } catch (err) {
      console.error('Student creation error:', err)
      toast({
        title: 'فشل إنشاء الحساب',
        description: err instanceof Error ? err.message : 'تأكد من صحة البريد أو أنه غير مستخدم من قبل.',
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Student's specific enrollments & devices
  const studentEnrollments = useMemo(() => {
    if (!selectedStudent) return []
    return enrollments.filter((e) => e.studentId === selectedStudent.uid)
  }, [enrollments, selectedStudent])

  const studentDevices = useMemo(() => {
    if (!selectedStudent) return []
    return devices.filter((d) => d.studentId === selectedStudent.uid)
  }, [devices, selectedStudent])

  return (
    <DashboardShell role="admin" title="الطلاب والمستخدمين">
      {/* Top Header Banner */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground lg:text-3xl flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Users className="size-5" />
            </span>
            تحكم وإدارة إعدادات الطلاب
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تعديل بيانات الطلاب، تغيير وإعادة ضبط كلمات المرور، فك قفل الأجهزة، وإدارة الاشتراكات الكاملة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl gap-2 font-medium"
            onClick={() => void usersQuery.refetch()}
            disabled={usersQuery.isFetching}
          >
            <RefreshCw className={`size-4 ${usersQuery.isFetching ? 'animate-spin' : ''}`} />
            تحديث
          </Button>

          <Button
            onClick={() => {
              setNewStudentSuccess(null)
              setCreateModalOpen(true)
            }}
            className="rounded-2xl font-bold bg-primary text-primary-foreground shadow-glow gap-2"
          >
            <UserPlus className="size-4" />
            إضافة طالب جديد بكلمة سر
          </Button>
        </div>
      </div>

      {/* KPI Metrics Strip (Stripe/Vercel Style) */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-card to-card/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">إجمالي الطلاب</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <GraduationCap className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{stats.totalStudents}</span>
            <span className="text-xs text-muted-foreground">طالب مسجل</span>
          </div>
        </Card>

        <Card className="rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-card to-card/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">الطلاب النشطين</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <UserCheck className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.activeStudents}</span>
            <span className="text-xs text-emerald-600/80">مفعلين حالياً</span>
          </div>
        </Card>

        <Card className="rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-card to-card/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">حسابات مجمّدة</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <UserX className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-500">{stats.inactiveStudents}</span>
            <span className="text-xs text-muted-foreground">معطلين</span>
          </div>
        </Card>

        <Card className="rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-card to-card/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">يتطلب تفعيل / كود</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Key className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-500">{stats.needsActivation}</span>
            <span className="text-xs text-muted-foreground">بانتظار كود</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-6 rounded-[1.75rem] border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، البريد، رقم الهاتف، رقم ولي الأمر، أو المرحلة الدراسية..."
              className="h-11 rounded-2xl border-border bg-background pe-10 ps-4 text-sm"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="h-11 rounded-2xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">كل الأدوار</option>
              <option value="student">الطلاب فقط</option>
              <option value="instructor">المعلمين</option>
              <option value="admin">المشرفين (Admins)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-11 rounded-2xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">كل الحالات</option>
              <option value="active">الحسابات النشطة</option>
              <option value="inactive">المجمّدة / المعطلة</option>
              <option value="needs_activation">تحتاج كود تفعيل</option>
            </select>

            {/* Academic Grade Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="h-11 rounded-2xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">كل الصفوف</option>
              {ACADEMIC_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-11 rounded-2xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="newest">الأحدث تسجيلاً</option>
              <option value="name">الاسم أبجدياً</option>
              <option value="xp">الأعلى نقاطاً (XP)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Badges */}
        {(roleFilter !== 'all' || statusFilter !== 'all' || gradeFilter !== 'all' || searchQuery) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <span>التصفيات الحالية:</span>
            {roleFilter !== 'all' && (
              <Badge className="gap-1 rounded-xl bg-muted text-foreground">
                الدور: {roleFilter === 'student' ? 'طالب' : roleFilter === 'instructor' ? 'معلم' : 'أدمن'}
                <button onClick={() => setRoleFilter('all')}><X className="size-3" /></button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge className="gap-1 rounded-xl bg-muted text-foreground">
                الحالة: {statusFilter === 'active' ? 'نشط' : statusFilter === 'inactive' ? 'معطل' : 'يحتاج تفعيل'}
                <button onClick={() => setStatusFilter('all')}><X className="size-3" /></button>
              </Badge>
            )}
            {gradeFilter !== 'all' && (
              <Badge className="gap-1 rounded-xl bg-muted text-foreground">
                الصف: {gradeFilter}
                <button onClick={() => setGradeFilter('all')}><X className="size-3" /></button>
              </Badge>
            )}
            {searchQuery && (
              <Badge className="gap-1 rounded-xl bg-muted text-foreground">
                بحث: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')}><X className="size-3" /></button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRoleFilter('all')
                setStatusFilter('all')
                setGradeFilter('all')
                setSearchQuery('')
              }}
              className="h-6 px-2 text-[11px] text-primary"
            >
              إعادة ضبط الكل
            </Button>
          </div>
        )}
      </Card>

      {/* Student Cards Grid (Legendary UI Layout - No Standard Boring Table) */}
      {filteredUsers.length === 0 ? (
        <Card className="rounded-[2rem] border border-dashed border-border p-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
            <Users className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-foreground">لا يوجد طلاب يطابقون البحث</h3>
          <p className="mt-1 text-sm text-muted-foreground">جرب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية.</p>
          <Button
            onClick={() => {
              setRoleFilter('all')
              setStatusFilter('all')
              setGradeFilter('all')
              setSearchQuery('')
            }}
            variant="outline"
            className="mt-4 rounded-xl"
          >
            عرض جميع الطلاب
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => {
            const userEnrollments = enrollments.filter((e) => e.studentId === user.uid)
            const userDevices = devices.filter((d) => d.studentId === user.uid)

            return (
              <Card
                key={user.uid}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/70 bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 font-black text-lg text-primary ring-2 ring-border/50">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="size-full object-cover" />
                          ) : (
                            user.fullName
                              .split(' ')
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join('')
                          )}
                        </div>
                        {/* Status indicator dot */}
                        <span
                          className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-card ${
                            user.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          title={user.isActive ? 'نشط' : 'معطل'}
                        />
                      </div>

                      {/* Name & Contact Details */}
                      <div className="min-w-0">
                        <h4 className="truncate font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {user.fullNameAr || user.fullName}
                        </h4>
                        {user.fullNameAr && user.fullName !== user.fullNameAr ? (
                          <p className="truncate text-xs text-muted-foreground">{user.fullName}</p>
                        ) : null}
                        <p className="truncate text-xs text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                          <Mail className="size-3 shrink-0" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Role & Status Pill */}
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          user.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                            : user.role === 'instructor'
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}
                      >
                        {user.role === 'admin' ? 'مشرف' : user.role === 'instructor' ? 'معلم' : 'طالب'}
                      </span>
                      {user.activationRequired ? (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20">
                          يحتاج كود
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Student Attributes Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {/* Academic Grade */}
                    <div className="rounded-xl border border-border/40 bg-muted/30 p-2">
                      <span className="text-[10px] text-muted-foreground block">الصف الدراسي</span>
                      <span className="font-semibold truncate block text-foreground">
                        {user.academicGrade || 'غير محدد'}
                      </span>
                    </div>

                    {/* Governorate / City */}
                    <div className="rounded-xl border border-border/40 bg-muted/30 p-2">
                      <span className="text-[10px] text-muted-foreground block">المحافظة</span>
                      <span className="font-semibold truncate block text-foreground">
                        {user.governorate || 'غير محدد'}
                      </span>
                    </div>

                    {/* Student Phone */}
                    <div className="rounded-xl border border-border/40 bg-muted/30 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">هاتف الطالب</span>
                        {user.phone ? (
                          <button
                            onClick={() =>
                              openWhatsApp(
                                user.phone,
                                `مرحباً ${user.fullNameAr || user.fullName}، نتواصل معك من إدارة منصة ألفريدو التعليمية.`,
                              )
                            }
                            className="text-emerald-500 hover:text-emerald-600"
                            title="محادثة واتساب مباشرة"
                          >
                            <MessageCircle className="size-3" />
                          </button>
                        ) : null}
                      </div>
                      <span className="font-semibold truncate block text-foreground" dir="ltr">
                        {user.phone || '—'}
                      </span>
                    </div>

                    {/* Parent Phone */}
                    <div className="rounded-xl border border-border/40 bg-muted/30 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">ولي الأمر</span>
                        {user.parentPhone ? (
                          <button
                            onClick={() =>
                              openWhatsApp(
                                user.parentPhone,
                                `مرحباً بحضرتك، نتواصل مع ولي أمر الطالب ${
                                  user.fullNameAr || user.fullName
                                } من منصة ألفريدو التعليمية.`,
                              )
                            }
                            className="text-emerald-500 hover:text-emerald-600"
                            title="محادثة واتساب مع ولي الأمر"
                          >
                            <MessageCircle className="size-3" />
                          </button>
                        ) : null}
                      </div>
                      <span className="font-semibold truncate block text-foreground" dir="ltr">
                        {user.parentPhone || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Badges / Metrics Pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-0.5 font-bold text-amber-500">
                      <Trophy className="size-3" />
                      {user.xpPoints || 0} XP
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 px-2 py-0.5 font-bold text-orange-500">
                      <Flame className="size-3" />
                      {user.streakCount || 0} يوم
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2 py-0.5 font-bold text-blue-500">
                      <BookOpen className="size-3" />
                      {userEnrollments.length} كورس
                    </span>
                    {userDevices.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 px-2 py-0.5 font-bold text-violet-500">
                        <Smartphone className="size-3" />
                        {userDevices.length} جهاز
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 border-t border-border/50 pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Toggle Active Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleToggleActive(user)}
                      disabled={actionLoading}
                      className={`h-8 rounded-xl px-2.5 text-xs font-semibold ${
                        user.isActive
                          ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                          : 'border-rose-500/30 text-rose-600 hover:bg-rose-500/10'
                      }`}
                      title={user.isActive ? 'تجميد الحساب' : 'تفعيل الحساب'}
                    >
                      {user.isActive ? (
                        <>
                          <Check className="size-3 mr-1" />
                          نشط
                        </>
                      ) : (
                        <>
                          <Lock className="size-3 mr-1" />
                          معطل
                        </>
                      )}
                    </Button>

                    {/* Reset Password Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleSendResetPassword(user.email)}
                      disabled={actionLoading}
                      className="h-8 rounded-xl px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      title="إرسال رابط إعادة تعيين كلمة المرور لإيميل الطالب فوراً"
                    >
                      <Key className="size-3.5 mr-1" />
                      إعادة كلمة السر
                    </Button>
                  </div>

                  {/* Main Full Settings Button */}
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(user)
                      setActiveTab('profile')
                    }}
                    className="h-8 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold px-3 text-xs"
                  >
                    إعدادات وتعديل
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: FULL STUDENT SETTINGS & EDIT DRAWER / MODAL       */}
      {/* ========================================================= */}
      {selectedStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-card/50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 font-bold text-primary">
                  {selectedStudent.avatarUrl ? (
                    <img src={selectedStudent.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    selectedStudent.fullName
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    إعدادات وتحكم: {selectedStudent.fullNameAr || selectedStudent.fullName}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-border bg-muted/20 px-5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                البيانات الشخصية والأكاديمية
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'password'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                كلمة المرور والأمان
              </button>
              <button
                onClick={() => setActiveTab('devices')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'devices'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                الأجهزة المسجلة
                {studentDevices.length > 0 && (
                  <span className="rounded-full bg-primary/10 text-primary px-1.5 text-[10px]">
                    {studentDevices.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'courses'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                الكورسات والاشتراكات
                {studentEnrollments.length > 0 && (
                  <span className="rounded-full bg-primary/10 text-primary px-1.5 text-[10px]">
                    {studentEnrollments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('gamification')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'gamification'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                النقاط والتحفيز (XP)
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TAB 1: Profile & Academic Data Form */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveStudentProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-xs font-semibold">
                        الاسم بالإنجليزية (Full Name) *
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={selectedStudent.fullName}
                        required
                        className="mt-1.5 rounded-xl text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fullNameAr" className="text-xs font-semibold">
                        الاسم بالعربية
                      </Label>
                      <Input
                        id="fullNameAr"
                        name="fullNameAr"
                        defaultValue={selectedStudent.fullNameAr || ''}
                        placeholder="الاسم الرباعي للطالب بالعربي"
                        className="mt-1.5 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-xs font-semibold">
                        رقم هاتف الطالب (موبايل / واتساب)
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        defaultValue={selectedStudent.phone || ''}
                        placeholder="010XXXXXXXX"
                        dir="ltr"
                        className="mt-1.5 rounded-xl text-sm text-right"
                      />
                    </div>

                    <div>
                      <Label htmlFor="parentPhone" className="text-xs font-semibold">
                        رقم هاتف ولي الأمر
                      </Label>
                      <Input
                        id="parentPhone"
                        name="parentPhone"
                        defaultValue={selectedStudent.parentPhone || ''}
                        placeholder="010XXXXXXXX"
                        dir="ltr"
                        className="mt-1.5 rounded-xl text-sm text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="academicGrade" className="text-xs font-semibold">
                        الصف الدراسي / المرحلة
                      </Label>
                      <select
                        id="academicGrade"
                        name="academicGrade"
                        defaultValue={selectedStudent.academicGrade || ''}
                        className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium"
                      >
                        <option value="">اختر الصف...</option>
                        {ACADEMIC_GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="governorate" className="text-xs font-semibold">
                        المحافظة
                      </Label>
                      <select
                        id="governorate"
                        name="governorate"
                        defaultValue={selectedStudent.governorate || ''}
                        className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium"
                      >
                        <option value="">اختر المحافظة...</option>
                        {EGYPT_GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="role" className="text-xs font-semibold">
                        نوع الحساب (Role)
                      </Label>
                      <select
                        id="role"
                        name="role"
                        defaultValue={selectedStudent.role}
                        className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium"
                      >
                        <option value="student">طالب (Student)</option>
                        <option value="instructor">معلم (Instructor)</option>
                        <option value="admin">مشرف (Admin)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="schoolName" className="text-xs font-semibold">
                      المدرسة أو الكلية
                    </Label>
                    <Input
                      id="schoolName"
                      name="schoolName"
                      defaultValue={selectedStudent.schoolName || ''}
                      placeholder="اسم المدرسة أو الكلية المقيد بها الطالب"
                      className="mt-1.5 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminNotes" className="text-xs font-semibold">
                      ملاحظات خاصة بالإدارة عن الطالب (سرية)
                    </Label>
                    <Textarea
                      id="adminNotes"
                      name="adminNotes"
                      defaultValue={selectedStudent.adminNotes || ''}
                      placeholder="ملاحظات المتابعة، السداد، أو التنبيهات الخاصة بهذا الطالب..."
                      className="mt-1.5 rounded-xl text-sm"
                      rows={3}
                    />
                  </div>

                  {/* Hidden inputs to preserve gamification values */}
                  <input type="hidden" name="xpPoints" value={selectedStudent.xpPoints || 0} />
                  <input type="hidden" name="streakCount" value={selectedStudent.streakCount || 0} />

                  {/* Avatar Upload section */}
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <Label className="text-xs font-semibold">تغيير الصورة الشخصية للطالب</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={avatarUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void handleAvatarUpload(file)
                        }}
                        className="rounded-xl text-xs"
                      />
                      {avatarUploading && <span className="text-xs text-primary animate-pulse">جاري الرفع...</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleDeleteUser(selectedStudent.uid)}
                      className="rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs"
                    >
                      <Trash2 className="size-3.5 mr-1" />
                      حذف الحساب نهائياً
                    </Button>

                    <Button
                      type="submit"
                      disabled={actionLoading}
                      className="rounded-xl bg-primary text-primary-foreground font-bold text-xs px-5 shadow-glow"
                    >
                      {actionLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </Button>
                  </div>
                </form>
              )}

              {/* TAB 2: Password and Security */}
              {activeTab === 'password' && (
                <div className="space-y-6">
                  {/* Password Reset Email Box */}
                  <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                          <Mail className="size-4 text-primary" />
                          إرسال رابط إعادة تعيين كلمة المرور عبر الإيميل
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          يتم إرسال رابط آمن وفوري إلى البريد الإلكتروني الخاص بالطالب ({selectedStudent.email}) ليقوم
                          بتعيين كلمة مرور جديدة لنفسه بضغطة زر واحدة.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={() => void handleSendResetPassword(selectedStudent.email)}
                        disabled={actionLoading}
                        className="rounded-xl font-bold bg-primary text-primary-foreground text-xs shadow-glow"
                      >
                        <Key className="size-3.5 mr-1" />
                        إرسال رابط استعادة كلمة السر الآن
                      </Button>
                    </div>
                  </div>

                  {/* Direct WhatsApp Reset Dispatcher */}
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <MessageCircle className="size-4" />
                      مساعدة الطالب واستعادة حسابه عبر واتساب
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      يمكنك إرسال رسالة جاهزة عبر واتساب للطالب أو لولي الأمر تتضمن تعليمات تسجيل الدخول واستعادة الحساب:
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedStudent.phone ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openWhatsApp(
                              selectedStudent.phone,
                              `مرحباً ${
                                selectedStudent.fullNameAr || selectedStudent.fullName
                              }، بخصوص حسابك في منصة ألفريدو التعليمية:\nبريدك الإلكتروني: ${
                                selectedStudent.email
                              }\nيمكنك تسجيل الدخول أو استعادة كلمة المرور عبر: https://alfredoedu.com/forgot-password`,
                            )
                          }
                          className="rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-semibold"
                        >
                          <MessageCircle className="size-3.5 mr-1" />
                          إرسال التعليمات للطالب على واتساب
                        </Button>
                      ) : null}

                      {selectedStudent.parentPhone ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openWhatsApp(
                              selectedStudent.parentPhone,
                              `مرحباً بحضرتك، بخصوص حساب الطالب ${
                                selectedStudent.fullNameAr || selectedStudent.fullName
                              } في منصة ألفريدو التعليمية:\nالبريد: ${
                                selectedStudent.email
                              }\nرابط الدخول: https://alfredoedu.com/login`,
                            )
                          }
                          className="rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-semibold"
                        >
                          <MessageCircle className="size-3.5 mr-1" />
                          إرسال التعليمات لولي الأمر
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {/* Account Status Switches */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                      <div>
                        <p className="font-bold text-sm text-foreground">حالة الحساب (نشط / مجمّد)</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedStudent.isActive
                            ? 'الحساب نشط ويستطيع الطالب تسجيل الدخول'
                            : 'الحساب معطل وممنوع من تسجيل الدخول'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={selectedStudent.isActive ? 'default' : 'outline'}
                        onClick={() => void handleToggleActive(selectedStudent)}
                        className={`rounded-xl text-xs font-bold ${
                          selectedStudent.isActive ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-rose-500'
                        }`}
                      >
                        {selectedStudent.isActive ? 'نشط ومفعّل' : 'تجميد الحساب'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                      <div>
                        <p className="font-bold text-sm text-foreground">طلب كود تفعيل (Activation Required)</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedStudent.activationRequired
                            ? 'مفعل: لن يدخل الطالب للمنصة حتى يدخل كود تفعيل صالح'
                            : 'معطل: الطالب يدخل للمنصة بدون إجباره على كود'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void handleToggleActivationRequired(selectedStudent)}
                        className="rounded-xl text-xs font-bold"
                      >
                        {selectedStudent.activationRequired ? 'إلغاء شرط الكود' : 'فرض كود تفعيل'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Student Registered Devices */}
              {activeTab === 'devices' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Smartphone className="size-4 text-primary" />
                        فك قفل الأجهزة المسجلة للطالب
                      </h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        إذا واجه الطالب رسالة &quot;تجاوزت الحد الأقصى للأجهزة&quot; أو قام بتغيير هاتفه، اضغط هنا لفك القفل فوراً.
                      </p>
                    </div>

                    <Button
                      onClick={() => void handleResetDevices(selectedStudent.uid)}
                      disabled={actionLoading}
                      variant="outline"
                      className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 text-xs font-bold"
                    >
                      <RotateCcw className="size-3.5 mr-1" />
                      فك ربط جميع الأجهزة
                    </Button>
                  </div>

                  {studentDevices.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                      لا توجد أجهزة مسجلة لهذا الطالب حالياً. سيتم تسجيل جهازه تلقائياً عند أول تسجيل دخول.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {studentDevices.map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <Smartphone className="size-4 text-muted-foreground" />
                            <div>
                              <span className="font-bold text-foreground">{device.label}</span>
                              <span className="text-muted-foreground block text-[10px]">
                                المعرف: {device.fingerprint?.slice(0, 16)}...
                              </span>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                            جهاز موثوق
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Courses & Enrollments */}
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  {/* Enroll in new course box */}
                  <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-border bg-muted/20 p-4">
                    <select
                      value={selectedCourseToEnroll}
                      onChange={(e) => setSelectedCourseToEnroll(e.target.value)}
                      className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
                    >
                      <option value="">اختر كورس لإضافته وتفعيله للطالب فوراً...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.titleAr || course.title} ({course.price} ج.م)
                        </option>
                      ))}
                    </select>

                    <Button
                      onClick={() => void handleEnrollStudent(selectedStudent, selectedCourseToEnroll)}
                      disabled={!selectedCourseToEnroll || actionLoading}
                      className="rounded-xl font-bold bg-primary text-primary-foreground text-xs shadow-glow"
                    >
                      <Plus className="size-3.5 mr-1" />
                      تفعيل الكورس للطالب
                    </Button>
                  </div>

                  {studentEnrollments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                      الطالب غير مسجل في أي كورس بعد. يمكنك اختيار كورس من القائمة أعلاه لتفعيله له.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {studentEnrollments.map((enr) => {
                        const course = courses.find((c) => c.id === enr.courseId)
                        return (
                          <div
                            key={enr.id}
                            className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <BookOpen className="size-4 text-primary" />
                              <div>
                                <span className="font-bold text-foreground">
                                  {enr.courseTitle || course?.titleAr || course?.title || enr.courseId}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                  <span>نسبة الإنجاز: {enr.progressPercent || 0}%</span>
                                  <span>•</span>
                                  <span className="text-emerald-600 font-semibold">مفعّل</span>
                                </div>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleRemoveEnrollment(enr.id)}
                              className="rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-[11px] h-7 px-2"
                            >
                              إلغاء الكورس
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: Gamification (XP & Badges) */}
              {activeTab === 'gamification' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="rounded-2xl p-4 border border-border">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                          <Trophy className="size-5" />
                        </span>
                        <div>
                          <span className="text-xs text-muted-foreground block">نقاط الخبرة (XP)</span>
                          <span className="text-2xl font-black text-foreground">{selectedStudent.xpPoints || 0} XP</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="rounded-2xl p-4 border border-border">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                          <Flame className="size-5" />
                        </span>
                        <div>
                          <span className="text-xs text-muted-foreground block">أيام الحماسة والستريك</span>
                          <span className="text-2xl font-black text-foreground">
                            {selectedStudent.streakCount || 0} أيام
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="rounded-2xl border border-border p-4 bg-muted/20">
                    <h5 className="font-bold text-xs text-foreground mb-2">تعديل سريع لنقاط الطالب</h5>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const next = (selectedStudent.xpPoints || 0) + 100
                          await updateDocTyped<Pick<UserDoc, 'xpPoints'>>(`users/${selectedStudent.uid}`, {
                            xpPoints: next,
                          })
                          setSelectedStudent({ ...selectedStudent, xpPoints: next })
                          toast({ title: 'تمت إضافة 100 نقطة للطالب' })
                        }}
                        className="rounded-xl text-xs font-semibold"
                      >
                        + 100 XP مكافأة
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const next = (selectedStudent.xpPoints || 0) + 500
                          await updateDocTyped<Pick<UserDoc, 'xpPoints'>>(`users/${selectedStudent.uid}`, {
                            xpPoints: next,
                          })
                          setSelectedStudent({ ...selectedStudent, xpPoints: next })
                          toast({ title: 'تمت إضافة 500 نقطة للطالب' })
                        }}
                        className="rounded-xl text-xs font-semibold"
                      >
                        + 500 XP جائزة تفوق
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await updateDocTyped<Pick<UserDoc, 'xpPoints'>>(`users/${selectedStudent.uid}`, { xpPoints: 0 })
                          setSelectedStudent({ ...selectedStudent, xpPoints: 0 })
                          toast({ title: 'تمت تصفير نقاط الطالب' })
                        }}
                        className="rounded-xl text-xs font-semibold text-rose-500"
                      >
                        تصفير النقاط
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ========================================================= */}
      {/* MODAL 2: ADD NEW STUDENT DIRECTLY WITH CUSTOM PASSWORD     */}
      {/* ========================================================= */}
      {createModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-card/50 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                  <UserPlus className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-foreground">إضافة وتسجيل طالب جديد مباشرة</h3>
                  <p className="text-xs text-muted-foreground">إنشاء حساب فوري بكلمة مرور مخصصة وتفعيله في النظام</p>
                </div>
              </div>

              <button
                onClick={() => setCreateModalOpen(false)}
                className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {newStudentSuccess ? (
                <div className="space-y-4 text-center py-4">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <h4 className="text-xl font-black text-foreground">تم إنشاء حساب الطالب بنجاح!</h4>
                  <p className="text-xs text-muted-foreground">
                    تم تسجيل الطالب في قاعدة البيانات بنجاح ويمكنه الدخول فوراً بالبيانات التالية:
                  </p>

                  <div className="rounded-2xl border border-border bg-muted/30 p-4 text-right space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">اسم الطالب:</span>
                      <span className="font-bold text-foreground">{newStudentSuccess.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">البريد الإلكتروني:</span>
                      <span className="font-bold text-foreground font-mono" dir="ltr">
                        {newStudentSuccess.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">كلمة المرور:</span>
                      <span className="font-bold text-primary font-mono text-sm" dir="ltr">
                        {newStudentSuccess.pass}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <Button
                      onClick={() => {
                        const text = `مرحباً ${newStudentSuccess.name}،\nتم إنشاء حسابك في منصة ألفريدو التعليمية:\nالبريد: ${newStudentSuccess.email}\nكلمة المرور: ${newStudentSuccess.pass}\nرابط الدخول: https://alfredoedu.com/login`
                        navigator.clipboard.writeText(text)
                        toast({ title: 'تم نسخ بيانات الدخول للذاكرة' })
                      }}
                      className="rounded-xl font-bold bg-primary text-primary-foreground gap-1.5"
                    >
                      <Copy className="size-4" />
                      نسخ بيانات الدخول
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewStudentSuccess(null)
                        setCreateModalOpen(false)
                      }}
                      className="rounded-xl"
                    >
                      إغلاق
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="create_fullName" className="text-xs font-semibold">
                        الاسم بالإنجليزية (Full Name) *
                      </Label>
                      <Input
                        id="create_fullName"
                        name="fullName"
                        required
                        placeholder="Ahmed Mohamed"
                        className="mt-1.5 rounded-xl text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="create_fullNameAr" className="text-xs font-semibold">
                        الاسم بالعربية
                      </Label>
                      <Input
                        id="create_fullNameAr"
                        name="fullNameAr"
                        placeholder="أحمد محمد"
                        className="mt-1.5 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="create_email" className="text-xs font-semibold">
                        البريد الإلكتروني (Email) *
                      </Label>
                      <Input
                        id="create_email"
                        name="email"
                        type="email"
                        required
                        placeholder="student@example.com"
                        dir="ltr"
                        className="mt-1.5 rounded-xl text-sm text-right"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="create_password" className="text-xs font-semibold">
                          كلمة المرور المخصصة *
                        </Label>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('create_password') as HTMLInputElement
                            if (input) {
                              const randomPass = 'Alfr@' + Math.floor(100000 + Math.random() * 900000)
                              input.value = randomPass
                            }
                          }}
                          className="text-[11px] text-primary hover:underline"
                        >
                          توليد كلمة سر عشوائية
                        </button>
                      </div>
                      <Input
                        id="create_password"
                        name="password"
                        type="text"
                        required
                        defaultValue="12345678"
                        placeholder="كلمة مرور من 6 خانات فأكثر"
                        dir="ltr"
                        className="mt-1.5 rounded-xl text-sm font-mono text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="create_phone" className="text-xs font-semibold">
                        رقم هاتف الطالب (موبايل / واتساب)
                      </Label>
                      <Input
                        id="create_phone"
                        name="phone"
                        placeholder="010XXXXXXXX"
                        dir="ltr"
                        className="mt-1.5 rounded-xl text-sm text-right"
                      />
                    </div>

                    <div>
                      <Label htmlFor="create_parentPhone" className="text-xs font-semibold">
                        رقم هاتف ولي الأمر
                      </Label>
                      <Input
                        id="create_parentPhone"
                        name="parentPhone"
                        placeholder="010XXXXXXXX"
                        dir="ltr"
                        className="mt-1.5 rounded-xl text-sm text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="create_academicGrade" className="text-xs font-semibold">
                        الصف الدراسي
                      </Label>
                      <select
                        id="create_academicGrade"
                        name="academicGrade"
                        className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium"
                      >
                        <option value="">اختر الصف...</option>
                        {ACADEMIC_GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="create_governorate" className="text-xs font-semibold">
                        المحافظة
                      </Label>
                      <select
                        id="create_governorate"
                        name="governorate"
                        className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium"
                      >
                        <option value="">اختر المحافظة...</option>
                        {EGYPT_GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="create_schoolName" className="text-xs font-semibold">
                      المدرسة أو الكلية
                    </Label>
                    <Input
                      id="create_schoolName"
                      name="schoolName"
                      placeholder="اسم المدرسة أو الكلية"
                      className="mt-1.5 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="create_initialCourseId" className="text-xs font-semibold">
                      تفعيل كورس مبدئي للطالب فور الإنشاء (اختياري)
                    </Label>
                    <select
                      id="create_initialCourseId"
                      name="initialCourseId"
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium"
                    >
                      <option value="">بدون كورس مبدئي...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.titleAr || course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="create_adminNotes" className="text-xs font-semibold">
                      ملاحظات خاصة بالإدارة
                    </Label>
                    <Input
                      id="create_adminNotes"
                      name="adminNotes"
                      placeholder="أي ملاحظات إضافية عن الطالب..."
                      className="mt-1.5 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateModalOpen(false)}
                      className="rounded-xl text-xs"
                    >
                      إلغاء
                    </Button>

                    <Button
                      type="submit"
                      disabled={actionLoading}
                      className="rounded-xl bg-primary text-primary-foreground font-bold text-xs px-5 shadow-glow"
                    >
                      {actionLoading ? 'جاري الإنشاء والربط...' : 'إنشاء وتفعيل حساب الطالب الآن'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  )
}

