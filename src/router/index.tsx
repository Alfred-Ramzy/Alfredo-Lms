import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import App from '@/App'
import { PageSkeleton } from '@/components/common/PageSkeleton'
import { LockdownScreen } from '@/components/license/LockdownScreen'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { RoleRedirect } from '@/router/RoleRedirect'

const LandingPage = lazy(() => import('@/pages/public/LandingPage'))
const VerifyPage = lazy(() => import('@/pages/public/VerifyPage'))
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ActivationPage = lazy(() => import('@/pages/auth/ActivationPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const AdminCoursesPage = lazy(() => import('@/pages/admin/CoursesPage'))
const AdminPaymentsPage = lazy(() => import('@/pages/admin/PaymentsPage'))
const AdminDevicesPage = lazy(() => import('@/pages/admin/DevicesPage'))
const AdminActivationCodesPage = lazy(() => import('@/pages/admin/ActivationCodesPage'))
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AnalyticsPage'))
const AdminMarketingPage = lazy(() => import('@/pages/admin/MarketingPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage'))
const InstructorDashboardPage = lazy(() => import('@/pages/instructor/DashboardPage'))
const InstructorCoursesPage = lazy(() => import('@/pages/instructor/CoursesPage'))
const InstructorCourseBuilderPage = lazy(() => import('@/pages/instructor/CourseBuilderPage'))
const InstructorMessagesPage = lazy(() => import('@/pages/instructor/MessagesPage'))
const InstructorAnalyticsPage = lazy(() => import('@/pages/instructor/AnalyticsPage'))
const StudentDashboardPage = lazy(() => import('@/pages/student/DashboardPage'))
const StudentMyLearningPage = lazy(() => import('@/pages/student/MyLearningPage'))
const StudentCatalogPage = lazy(() => import('@/pages/student/CatalogPage'))
const StudentCourseDetailPage = lazy(() => import('@/pages/student/CourseDetailPage'))
const StudentCheckoutPage = lazy(() => import('@/pages/student/CheckoutPage'))
const StudentPlayerPage = lazy(() => import('@/pages/student/PlayerPage'))
const StudentQuizPage = lazy(() => import('@/pages/student/QuizPage'))
const StudentAssignmentPage = lazy(() => import('@/pages/student/AssignmentPage'))
const StudentCertificatesPage = lazy(() => import('@/pages/student/CertificatesPage'))
const StudentMessagesPage = lazy(() => import('@/pages/student/MessagesPage'))
const StudentProfilePage = lazy(() => import('@/pages/student/ProfilePage'))

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: withSuspense(<LandingPage />) },
      { path: 'login', element: withSuspense(<LoginPage />) },
      { path: 'register', element: withSuspense(<RegisterPage />) },
      { path: 'forgot-password', element: withSuspense(<ForgotPasswordPage />) },
      { path: 'activation-required', element: withSuspense(<ActivationPage />) },
      { path: 'verify/:credentialId', element: withSuspense(<VerifyPage />) },
      { path: 'lockdown', element: <LockdownScreen /> },
      { path: 'role-redirect', element: <RoleRedirect /> },
      {
        path: 'admin/dashboard',
        element: withSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>),
      },
      { path: 'admin/users', element: withSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>) },
      { path: 'admin/courses', element: withSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminCoursesPage /></ProtectedRoute>) },
      { path: 'admin/payments', element: withSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminPaymentsPage /></ProtectedRoute>) },
      { path: 'admin/devices', element: withSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminDevicesPage /></ProtectedRoute>) },
      { path: 'admin/activation-codes', element: withSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminActivationCodesPage /></ProtectedRoute>) },
      { path: 'admin/analytics', element: withSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>) },
      { path: 'admin/marketing', element: withSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminMarketingPage /></ProtectedRoute>) },
      { path: 'admin/settings', element: withSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></ProtectedRoute>) },
      { path: 'instructor/dashboard', element: withSuspense(<ProtectedRoute allowedRoles={['instructor']}><InstructorDashboardPage /></ProtectedRoute>) },
      { path: 'instructor/courses', element: withSuspense(<ProtectedRoute allowedRoles={['instructor']}><InstructorCoursesPage /></ProtectedRoute>) },
      { path: 'instructor/courses/:courseId', element: withSuspense(<ProtectedRoute allowedRoles={['instructor']}><InstructorCourseBuilderPage /></ProtectedRoute>) },
      { path: 'instructor/messages', element: withSuspense(<ProtectedRoute allowedRoles={['instructor']}><InstructorMessagesPage /></ProtectedRoute>) },
      { path: 'instructor/analytics', element: withSuspense(<ProtectedRoute allowedRoles={['instructor']}><InstructorAnalyticsPage /></ProtectedRoute>) },
      { path: 'student/dashboard', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentDashboardPage /></ProtectedRoute>) },
      { path: 'student/my-learning', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentMyLearningPage /></ProtectedRoute>) },
      { path: 'student/catalog', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentCatalogPage /></ProtectedRoute>) },
      { path: 'student/courses/:courseId', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentCourseDetailPage /></ProtectedRoute>) },
      { path: 'student/courses/:courseId/checkout', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentCheckoutPage /></ProtectedRoute>) },
      { path: 'student/courses/:courseId/learn/:lessonId', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentPlayerPage /></ProtectedRoute>) },
      { path: 'student/courses/:courseId/quiz/:quizId', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentQuizPage /></ProtectedRoute>) },
      { path: 'student/courses/:courseId/assignment/:assignmentId', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentAssignmentPage /></ProtectedRoute>) },
      { path: 'student/certificates', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentCertificatesPage /></ProtectedRoute>) },
      { path: 'student/messages', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentMessagesPage /></ProtectedRoute>) },
      { path: 'student/profile', element: withSuspense(<ProtectedRoute allowedRoles={['student']}><StudentProfilePage /></ProtectedRoute>) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])
