import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import { useTeachers } from '../contexts/Teachers/useTeachers';
import { useAttendance } from '../contexts/Attendance/useAttendance';
import { useNotifications } from '../contexts/Notifications/useNotifications';
import { 
  LayoutDashboard, GraduationCap, Users, BookOpen, School, Book, 
  Calendar, QrCode, ClipboardCheck, FileText, CalendarCheck, Award, 
  DollarSign, Bell, ShieldAlert, BarChart3, FileWarning, Settings, ChevronLeft, ChevronRight, X, UserCheck, UserCog
} from 'lucide-react';
import sloganLogo from '../assets/slogan.jpeg';

export default function Sidebar() {
  const {
    lang, t,
    isSidebarCollapsed, setIsSidebarCollapsed,
    isMobileMenuOpen, setIsMobileMenuOpen,
    hasPermission,
    renderAvatar
  } = useApp();
  const { notifications } = useNotifications();
  const { currentUser } = useAuth();
  const { teacherReports } = useTeachers();
  const { absenceRequests } = useAttendance();


  const isAdmin = currentUser?.role === 'admin';

  return (
    <aside className={`sidebar no-print ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      {/* Desktop Collapse Toggle */}
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {lang === 'ar' 
          ? (isSidebarCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />)
          : (isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)
        }
      </button>

      <div className="sidebar-header">
        <img 
          src={sloganLogo} 
          alt="School Logo" 
          className="logo-icon" 
          style={{ objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <div className="logo-text-wrapper">
          <span className="logo-text">{t.appName}</span>
          <span className="logo-sub">{t.appSubtitle}</span>
        </div>
        {/* Mobile Close Button */}
        <button 
          className="sidebar-mobile-close-btn"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-menu">
        {/* Group 1: General */}
        <div className="sidebar-category-header">
          <span>{lang === 'ar' ? 'الرئيسية' : 'General'}</span>
        </div>

        <NavLink 
          to="/dashboard"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
          data-tooltip={t.dashboard}
        >
          <LayoutDashboard />
          <span>{t.dashboard}</span>
        </NavLink>

        {hasPermission('students') && (
          <NavLink 
            to="/students"
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            data-tooltip={t.students}
          >
            <GraduationCap />
            <span>{t.students}</span>
          </NavLink>
        )}

        {hasPermission('parents') && (
          <NavLink 
            to="/parents"
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            data-tooltip={t.parents}
          >
            <Users />
            <span>{t.parents}</span>
          </NavLink>
        )}

        {hasPermission('prepSupervisors') && (
          <NavLink 
            to="/prep-supervisors"
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            data-tooltip={t.prepSupervisors}
          >
            <UserCheck />
            <span>{t.prepSupervisors}</span>
          </NavLink>
        )}

        {hasPermission('teachers') && (
          <NavLink 
            to="/teachers"
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            data-tooltip={t.teachers}
          >
            <BookOpen />
            <span>{t.teachers}</span>
          </NavLink>
        )}

        {hasPermission('classes') && (
          <NavLink 
            to="/classes"
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            data-tooltip={t.classes}
          >
            <School />
            <span>{t.classes}</span>
          </NavLink>
        )}

        {hasPermission('subjects') && (
          <NavLink 
            to="/subjects"
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            data-tooltip={t.subjects}
          >
            <Book />
            <span>{t.subjects}</span>
          </NavLink>
        )}

        {/* Group 2: Academic */}
        {(hasPermission('schedule') || hasPermission('scanner') || hasPermission('absenceRequests') || hasPermission('assignments') || hasPermission('examSchedules') || hasPermission('detailedGrades')) && (
          <>
            <div className="sidebar-category-header">
              <span>{lang === 'ar' ? 'التعليم الأكاديمي' : 'Academic'}</span>
            </div>

            {hasPermission('schedule') && (
              <NavLink 
                to="/schedule"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.schedule}
              >
                <Calendar />
                <span>{t.schedule}</span>
              </NavLink>
            )}

            {hasPermission('scanner') && (
              <NavLink 
                to="/attendance"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.qrScanner}
              >
                <QrCode />
                <span>{t.qrScanner}</span>
              </NavLink>
            )}

            {hasPermission('absenceRequests') && (
              <NavLink 
                to="/absence-requests"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.absenceRequests}
                style={{ position: 'relative' }}
              >
                <ClipboardCheck />
                <span>{t.absenceRequests}</span>
                {absenceRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="menu-item-badge">
                    {absenceRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </NavLink>
            )}

            {hasPermission('assignments') && (
              <NavLink 
                to="/assignments"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.assignmentsHub}
              >
                <FileText />
                <span>{t.assignmentsHub}</span>
              </NavLink>
            )}

            {hasPermission('examSchedules') && (
              <NavLink 
                to="/exam-schedules"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.examSchedulesBuilder}
              >
                <CalendarCheck />
                <span>{t.examSchedulesBuilder}</span>
              </NavLink>
            )}

            {hasPermission('detailedGrades') && (
              <NavLink 
                to="/detailed-grades"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.detailedGrades}
              >
                <Award />
                <span>{t.detailedGrades}</span>
              </NavLink>
            )}
          </>
        )}

        {/* Group 3: Administration */}
        {(hasPermission('finance') || hasPermission('communications') || hasPermission('control') || hasPermission('reports') || hasPermission('teacherReports')) && (
          <>
            <div className="sidebar-category-header">
              <span>{lang === 'ar' ? 'الإدارة والمالية' : 'Management'}</span>
            </div>

            {hasPermission('finance') && (
              <NavLink 
                to="/finance"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.finance}
              >
                <DollarSign />
                <span>{t.finance}</span>
              </NavLink>
            )}

            {hasPermission('communications') && (
              <NavLink 
                to="/notifications"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.communications}
                style={{ position: 'relative' }}
              >
                <Bell />
                <span>{t.communications}</span>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="menu-item-badge">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </NavLink>
            )}

            {hasPermission('control') && (
              <NavLink 
                to="/control"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.control}
              >
                <ShieldAlert />
                <span>{t.control}</span>
              </NavLink>
            )}

            {hasPermission('reports') && (
              <NavLink 
                to="/reports"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.reports}
              >
                <BarChart3 />
                <span>{t.reports}</span>
              </NavLink>
            )}

            {hasPermission('teacherReports') && (
              <NavLink 
                to="/teacher-reports"
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tooltip={t.teacherReports}
                style={{ position: 'relative' }}
              >
                <FileWarning />
                <span>{t.teacherReports}</span>
                {(teacherReports || []).filter(r => r.status === 'pending').length > 0 && (
                  <span className="menu-item-badge">
                    {(teacherReports || []).filter(r => r.status === 'pending').length}
                  </span>
                )}
              </NavLink>
            )}
          </>
        )}

        {/* Group 4: System (Admin Only) */}
        {isAdmin && (
          <>
            <div className="sidebar-category-header">
              <span>{lang === 'ar' ? 'النظام' : 'System'}</span>
            </div>

            <NavLink 
              to="/supervisors"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-tooltip={lang === 'ar' ? 'إدارة الوكلاء' : 'Vice Principals'}
            >
              <UserCog />
              <span>{lang === 'ar' ? 'إدارة الوكلاء' : 'Vice Principals'}</span>
            </NavLink>

            <NavLink 
              to="/settings"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              data-tooltip={t.settings}
            >
              <Settings />
              <span>{t.settings}</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar-wrapper">
          <div className="user-avatar">{renderAvatar(currentUser?.photo, 'أ ع')}</div>
          <span className="user-status-dot"></span>
        </div>
        <div className="user-info">
          <div className="user-name">{lang === 'ar' ? currentUser?.name : currentUser?.nameEn}</div>
          <div className="user-role">{currentUser?.email || currentUser?.username}</div>
        </div>
      </div>
    </aside>
  );
}
