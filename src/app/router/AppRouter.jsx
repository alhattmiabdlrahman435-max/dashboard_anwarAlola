import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../../contexts/Auth/useAuth';

// Lazy load pages
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const DashboardPage = lazy(() => import('../../pages/DashboardPage'));
const StudentsPage = lazy(() => import('../../pages/StudentsPage'));
const TeachersPage = lazy(() => import('../../pages/TeachersPage'));
const ParentsPage = lazy(() => import('../../pages/ParentsPage'));
const ClassesPage = lazy(() => import('../../pages/ClassesPage'));
const SubjectsPage = lazy(() => import('../../pages/SubjectsPage'));
const AttendancePage = lazy(() => import('../../pages/AttendancePage'));
const FinancePage = lazy(() => import('../../pages/FinancePage'));
const ReportsPage = lazy(() => import('../../pages/ReportsPage'));
const NotificationsPage = lazy(() => import('../../pages/NotificationsPage'));
const SettingsPage = lazy(() => import('../../pages/SettingsPage'));
const PrepSupervisorsPage = lazy(() => import('../../pages/PrepSupervisorsPage'));
const SupervisorsPage = lazy(() => import('../../pages/SupervisorsPage'));
const ControlPage = lazy(() => import('../../pages/ControlPage'));
const TeacherReportsPage = lazy(() => import('../../pages/TeacherReportsPage'));
const AbsenceRequestsPage = lazy(() => import('../../pages/AbsenceRequestsPage'));
const AssignmentsPage = lazy(() => import('../../pages/AssignmentsPage'));
const DetailedGradesPage = lazy(() => import('../../pages/DetailedGradesPage'));
const ExamSchedulesPage = lazy(() => import('../../pages/ExamSchedulesPage'));
const SchedulePage = lazy(() => import('../../pages/SchedulePage'));

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
        <Route path="students" element={withSuspense(StudentsPage)} />
        <Route path="teachers" element={withSuspense(TeachersPage)} />
        <Route path="parents" element={withSuspense(ParentsPage)} />
        <Route path="classes" element={withSuspense(ClassesPage)} />
        <Route path="subjects" element={withSuspense(SubjectsPage)} />
        <Route path="attendance" element={withSuspense(AttendancePage)} />
        <Route path="finance" element={withSuspense(FinancePage)} />
        <Route path="reports" element={withSuspense(ReportsPage)} />
        <Route path="notifications" element={withSuspense(NotificationsPage)} />
        <Route path="settings" element={withSuspense(SettingsPage)} />
        <Route path="prep-supervisors" element={withSuspense(PrepSupervisorsPage)} />
        <Route path="supervisors" element={withSuspense(SupervisorsPage)} />
        <Route path="control" element={withSuspense(ControlPage)} />
        <Route path="teacher-reports" element={withSuspense(TeacherReportsPage)} />
        <Route path="absence-requests" element={withSuspense(AbsenceRequestsPage)} />
        <Route path="assignments" element={withSuspense(AssignmentsPage)} />
        <Route path="detailed-grades" element={withSuspense(DetailedGradesPage)} />
        <Route path="exam-schedules" element={withSuspense(ExamSchedulesPage)} />
        <Route path="schedule" element={withSuspense(SchedulePage)} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      {/* Route for login when authenticated, will redirect to dashboard */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
