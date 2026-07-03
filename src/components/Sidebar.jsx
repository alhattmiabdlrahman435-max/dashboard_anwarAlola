import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, GraduationCap, Users, BookOpen, School, Book, 
  Calendar, QrCode, ClipboardCheck, FileText, CalendarCheck, Award, 
  DollarSign, Bell, ShieldAlert, BarChart3, FileWarning, Settings, ChevronLeft, ChevronRight, X, UserCheck, UserCog
} from 'lucide-react';
import sloganLogo from '../assets/slogan.jpeg';

export default function Sidebar() {
  const {
    lang, t,
    activeTab, setActiveTab,
    isSidebarCollapsed, setIsSidebarCollapsed,
    isMobileMenuOpen, setIsMobileMenuOpen,
    currentUser, absenceRequests, teacherReports,
    hasPermission
  } = useApp();

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

        <button 
          className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
          data-tooltip={t.dashboard}
        >
          <LayoutDashboard />
          <span>{t.dashboard}</span>
        </button>

        {hasPermission('students') && (
          <button 
            className={`menu-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }}
            data-tooltip={t.students}
          >
            <GraduationCap />
            <span>{t.students}</span>
          </button>
        )}

        {hasPermission('parents') && (
          <button 
            className={`menu-item ${activeTab === 'parents' ? 'active' : ''}`}
            onClick={() => { setActiveTab('parents'); setIsMobileMenuOpen(false); }}
            data-tooltip={t.parents}
          >
            <Users />
            <span>{t.parents}</span>
          </button>
        )}

        {hasPermission('prepSupervisors') && (
          <button 
            className={`menu-item ${activeTab === 'prepSupervisors' ? 'active' : ''}`}
            onClick={() => { setActiveTab('prepSupervisors'); setIsMobileMenuOpen(false); }}
            data-tooltip={t.prepSupervisors}
          >
            <UserCheck />
            <span>{t.prepSupervisors}</span>
          </button>
        )}

        {hasPermission('teachers') && (
          <button 
            className={`menu-item ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('teachers'); setIsMobileMenuOpen(false); }}
            data-tooltip={t.teachers}
          >
            <BookOpen />
            <span>{t.teachers}</span>
          </button>
        )}

        {hasPermission('classes') && (
          <button 
            className={`menu-item ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('classes'); setIsMobileMenuOpen(false); }}
            data-tooltip={t.classes}
          >
            <School />
            <span>{t.classes}</span>
          </button>
        )}

        {hasPermission('subjects') && (
          <button 
            className={`menu-item ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => { setActiveTab('subjects'); setIsMobileMenuOpen(false); }}
            data-tooltip={t.subjects}
          >
            <Book />
            <span>{t.subjects}</span>
          </button>
        )}

        {/* Group 2: Academic */}
        {(hasPermission('schedule') || hasPermission('scanner') || hasPermission('absenceRequests') || hasPermission('assignments') || hasPermission('examSchedules') || hasPermission('detailedGrades')) && (
          <>
            <div className="sidebar-category-header">
              <span>{lang === 'ar' ? 'التعليم الأكاديمي' : 'Academic'}</span>
            </div>

            {hasPermission('schedule') && (
              <button 
                className={`menu-item ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => { setActiveTab('schedule'); setIsMobileMenuOpen(false); }}
                data-tooltip={t.schedule}
              >
                <Calendar />
                <span>{t.schedule}</span>
              </button>
            )}

            {hasPermission('scanner') && (
              <button 
                className={`menu-item ${activeTab === 'scanner' ? 'active' : ''}`}
                onClick={() => { setActiveTab('scanner'); setIsMobileMenuOpen(false); }}
                data-tooltip={t.qrScanner}
              >
                <QrCode />
                <span>{t.qrScanner}</span>
              </button>
            )}

            {hasPermission('absenceRequests') && (
              <button 
                className={`menu-item ${activeTab === 'absenceRequests' ? 'active' : ''}`}
                onClick={() => { setActiveTab('absenceRequests'); setIsMobileMenuOpen(false); }}
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
              </button>
            )}

            {hasPermission('assignments') && (
              <button 
                className={`menu-item ${activeTab === 'assignments' ? 'active' : ''}`}
                onClick={() => { setActiveTab('assignments'); setIsMobileMenuOpen(false); }}
                data-tooltip={t.assignmentsHub}
              >
                <FileText />
                <span>{t.assignmentsHub}</span>
              </button>
            )}

            {hasPermission('examSchedules') && (
              <button 
                className={`menu-item ${activeTab === 'examSchedules' ? 'active' : ''}`}
                onClick={() => { setActiveTab('examSchedules'); setIsMobileMenuOpen(false); }}
                data-tooltip={t.examSchedulesBuilder}
              >
                <CalendarCheck />
                <span>{t.examSchedulesBuilder}</span>
              </button>
            )}

            {hasPermission('detailedGrades') && (
              <button 
                className={`menu-item ${activeTab === 'detailedGrades' ? 'active' : ''}`}
                onClick={() => { setActiveTab('detailedGrades'); setIsMobileMenuOpen(false); }}
                data-tooltip={t.detailedGrades}
              >
                <Award />
                <span>{t.detailedGrades}</span>
              </button>
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
              <button 
                className={`menu-item ${activeTab === 'finance' ? 'active' : ''}`}
                onClick={() => { setActiveTab('finance'); setIsMobileMenuOpen(false); }}
                data-tooltip={t.finance}
              >
                <DollarSign />
                <span>{t.finance}</span>
              </button>
            )}

            {hasPermission('communications') && (
              <button 
                className={`menu-item ${activeTab === 'communications' ? 'active' : ''}`}
                onClick={() => { setActiveTab('communications'); setIsMobileMenuOpen(false); }}
                data-tooltip={t.communications}
              >
                <Bell />
                <span>{t.communications}</span>
              </button>
            )}

            {hasPermission('control') && (
              <button 
                className={`menu-item ${activeTab === 'control' ? 'active' : ''}`}
                onClick={() => { setActiveTab('control'); setIsMobileMenuOpen(false); }}
                data-tooltip={t.control}
              >
                <ShieldAlert />
                <span>{t.control}</span>
              </button>
            )}

            {hasPermission('reports') && (
              <button 
                className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }}
                data-tooltip={t.reports}
              >
                <BarChart3 />
                <span>{t.reports}</span>
              </button>
            )}

            {hasPermission('teacherReports') && (
              <button 
                className={`menu-item ${activeTab === 'teacherReports' ? 'active' : ''}`}
                onClick={() => { setActiveTab('teacherReports'); setIsMobileMenuOpen(false); }}
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
              </button>
            )}
          </>
        )}

        {/* Group 4: System (Admin Only) */}
        {isAdmin && (
          <>
            <div className="sidebar-category-header">
              <span>{lang === 'ar' ? 'النظام' : 'System'}</span>
            </div>

            <button 
              className={`menu-item ${activeTab === 'supervisors' ? 'active' : ''}`}
              onClick={() => { setActiveTab('supervisors'); setIsMobileMenuOpen(false); }}
              data-tooltip={lang === 'ar' ? 'إدارة الوكلاء' : 'Vice Principals'}
            >
              <UserCog />
              <span>{lang === 'ar' ? 'إدارة الوكلاء' : 'Vice Principals'}</span>
            </button>

            <button 
              className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              data-tooltip={t.settings}
            >
              <Settings />
              <span>{t.settings}</span>
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar-wrapper">
          <div className="user-avatar">{currentUser?.photo || 'أ ع'}</div>
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
