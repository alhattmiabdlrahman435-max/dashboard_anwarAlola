import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../../contexts/Auth/useAuth';

// Helper for safe lazy loading to recover seamlessly from stale bundle chunk 404 errors
const safeLazy = (importFn) => lazy(async () => {
  try {
    return await importFn();
  } catch (error) {
    console.error("Chunk load failure, reloading page...", error);
    window.location.reload();
    return new Promise(() => {});
  }
});

// Lazy load pages
const LoginPage = safeLazy(() => import('../../pages/LoginPage'));
const DashboardPage = safeLazy(() => import('../../pages/DashboardPage'));
const StudentsPage = safeLazy(() => import('../../pages/StudentsPage'));
const TeachersPage = safeLazy(() => import('../../pages/TeachersPage'));
const ParentsPage = safeLazy(() => import('../../pages/ParentsPage'));
const ClassesPage = safeLazy(() => import('../../pages/ClassesPage'));
const SubjectsPage = safeLazy(() => import('../../pages/SubjectsPage'));
const AttendancePage = safeLazy(() => import('../../pages/AttendancePage'));
const FinancePage = safeLazy(() => import('../../pages/FinancePage'));
const ReportsPage = safeLazy(() => import('../../pages/ReportsPage'));
const NotificationsPage = safeLazy(() => import('../../pages/NotificationsPage'));
const SettingsPage = safeLazy(() => import('../../pages/SettingsPage'));
const PrepSupervisorsPage = safeLazy(() => import('../../pages/PrepSupervisorsPage'));
const SupervisorsPage = safeLazy(() => import('../../pages/SupervisorsPage'));
const ControlPage = safeLazy(() => import('../../pages/ControlPage'));
const TeacherReportsPage = safeLazy(() => import('../../pages/TeacherReportsPage'));
const AbsenceRequestsPage = safeLazy(() => import('../../pages/AbsenceRequestsPage'));
const AssignmentsPage = safeLazy(() => import('../../pages/AssignmentsPage'));
const DetailedGradesPage = safeLazy(() => import('../../pages/DetailedGradesPage'));
const ExamSchedulesPage = safeLazy(() => import('../../pages/ExamSchedulesPage'));
const SchedulePage = safeLazy(() => import('../../pages/SchedulePage'));

function LoadingFallback() {
  const { lang } = useApp();
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      height: '100%',
      width: '100%',
      gap: '16px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--color-border)',
        borderTop: '3px solid var(--color-primary-ui)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--color-text-secondary)',
      }}>
        {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

function ProtectedRoute({ module, adminOnly, children }) {
  const { hasPermission } = useApp();
  const { currentUser } = useAuth();

  if (adminOnly && currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (module && !hasPermission(module)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRouter() {
  const { darkMode, lang } = useApp();
  const { isAuthenticated } = useAuth();

  // Handle Dark mode / RTL dynamically
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  if (!isAuthenticated) {
    return withSuspense(LoginPage);
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={withSuspense(DashboardPage)} />
        <Route path="students" element={<ProtectedRoute module="students">{withSuspense(StudentsPage)}</ProtectedRoute>} />
        <Route path="teachers" element={<ProtectedRoute module="teachers">{withSuspense(TeachersPage)}</ProtectedRoute>} />
        <Route path="parents" element={<ProtectedRoute module="parents">{withSuspense(ParentsPage)}</ProtectedRoute>} />
        <Route path="classes" element={<ProtectedRoute module="classes">{withSuspense(ClassesPage)}</ProtectedRoute>} />
        <Route path="subjects" element={<ProtectedRoute module="subjects">{withSuspense(SubjectsPage)}</ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute module="scanner">{withSuspense(AttendancePage)}</ProtectedRoute>} />
        <Route path="finance" element={<ProtectedRoute module="finance">{withSuspense(FinancePage)}</ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute module="reports">{withSuspense(ReportsPage)}</ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute module="communications">{withSuspense(NotificationsPage)}</ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute adminOnly>{withSuspense(SettingsPage)}</ProtectedRoute>} />
        <Route path="prep-supervisors" element={<ProtectedRoute module="prepSupervisors">{withSuspense(PrepSupervisorsPage)}</ProtectedRoute>} />
        <Route path="supervisors" element={<ProtectedRoute adminOnly>{withSuspense(SupervisorsPage)}</ProtectedRoute>} />
        <Route path="control" element={<ProtectedRoute module="control">{withSuspense(ControlPage)}</ProtectedRoute>} />
        <Route path="teacher-reports" element={<ProtectedRoute module="teacherReports">{withSuspense(TeacherReportsPage)}</ProtectedRoute>} />
        <Route path="absence-requests" element={<ProtectedRoute module="absenceRequests">{withSuspense(AbsenceRequestsPage)}</ProtectedRoute>} />
        <Route path="assignments" element={<ProtectedRoute module="assignments">{withSuspense(AssignmentsPage)}</ProtectedRoute>} />
        <Route path="detailed-grades" element={<ProtectedRoute module="detailedGrades">{withSuspense(DetailedGradesPage)}</ProtectedRoute>} />
        <Route path="exam-schedules" element={<ProtectedRoute module="examSchedules">{withSuspense(ExamSchedulesPage)}</ProtectedRoute>} />
        <Route path="schedule" element={<ProtectedRoute module="schedule">{withSuspense(SchedulePage)}</ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      {/* Route for login when authenticated, will redirect to dashboard */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
