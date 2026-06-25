import { useApp } from '../context/AppContext';
import { Menu, Globe, Sun, Moon, Bell, Mail, Settings, LogOut } from 'lucide-react';

export default function Navbar() {
  const {
    lang, setLang, t,
    darkMode, setDarkMode,
    activeTab, setActiveTab,
    isMobileMenuOpen, setIsMobileMenuOpen,
    showNotificationsDropdown, setShowNotificationsDropdown,
    showProfileDropdown, setShowProfileDropdown,
    currentUser, smsLogs, notifications, handleLogout
  } = useApp();

  const getTabLabel = () => {
    const tabNames = {
      dashboard: t.dashboard,
      students: t.students,
      parents: t.parents,
      teachers: t.teachers,
      classes: t.classes,
      subjects: t.subjects,
      schedule: t.schedule,
      scanner: t.qrScanner,
      absenceRequests: t.absenceRequests,
      assignments: t.assignmentsHub,
      examSchedules: t.examSchedulesBuilder,
      detailedGrades: t.detailedGrades,
      finance: t.finance,
      communications: t.communications,
      control: t.control,
      reports: t.reports,
      settings: t.settings
    };
    return tabNames[activeTab] || t.dashboard;
  };

  return (
    <header className="app-header no-print">
      <div className="header-left-side">
        {/* Hamburger Menu Toggle on Mobile */}
        <button 
          className="hamburger-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Navigation Drawer"
        >
          <Menu />
        </button>

        {/* Breadcrumbs Navigation */}
        <div className="header-breadcrumbs">
          <span className="breadcrumb-sub">{lang === 'ar' ? 'الرئيسية' : 'Main'}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">{getTabLabel()}</span>
        </div>

        {/* School Official Badge */}
        <div className="header-school-badge">
          <span className="badge-dot"></span>
          <span className="badge-text">{lang === 'ar' ? 'رياض و مدارس انوار العلى الدولية النموذجية' : 'Riyadh & Anwar Al-Ola International Model Schools'}</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Language toggle */}
        <button 
          className="lang-btn"
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          aria-label="Toggle language direction"
        >
          <Globe size={16} />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Dark mode toggle */}
        <button 
          className="action-btn"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun /> : <Moon />}
        </button>

        {/* Notifications panel bell with badge */}
        <div style={{ position: 'relative' }}>
          <button 
            className="action-btn notifications-btn" 
            onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
            aria-label="Notifications Panel"
          >
            <Bell />
          </button>
          {smsLogs.length > 0 && (
            <span className="badge-dot-notification pulsing"></span>
          )}

          {/* Notifications Dropdown Panel */}
          {showNotificationsDropdown && (
            <div className="notifications-dropdown-container">
              <div className="dropdown-header">
                <span>{lang === 'ar' ? 'الإشعارات وتنبيهات النظام' : 'Notifications & Alerts'}</span>
                {smsLogs.length > 0 && (
                  <span className="sms-count-badge">{smsLogs.length} SMS</span>
                )}
              </div>
              <div className="dropdown-body">
                {notifications.slice(0, 3).map((notif) => (
                  <div className="dropdown-item" key={notif.id}>
                    <div className="item-icon-wrapper info">
                      <Bell size={14} />
                    </div>
                    <div className="item-content">
                      <div className="item-title">{notif.title}</div>
                      <div className="item-desc">{notif.content}</div>
                      <div className="item-time">{notif.date}</div>
                    </div>
                  </div>
                ))}
                {smsLogs.slice(0, 2).map((sms) => (
                  <div className="dropdown-item sms" key={sms.id}>
                    <div className="item-icon-wrapper success">
                      <Mail size={14} />
                    </div>
                    <div className="item-content">
                      <div className="item-title">{lang === 'ar' ? `تنبيه إلى ${sms.recipient}` : `SMS to ${sms.recipient}`}</div>
                      <div className="item-desc">{sms.text}</div>
                      <div className="item-time">{sms.time}</div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && smsLogs.length === 0 && (
                  <div className="dropdown-empty-state">
                    {lang === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new alerts'}
                  </div>
                )}
              </div>
              <div className="dropdown-footer">
                <button onClick={() => { setActiveTab('communications'); setShowNotificationsDropdown(false); }}>
                  {lang === 'ar' ? 'عرض جميع المراسلات' : 'View All Communications'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Popover Menu */}
        <div style={{ position: 'relative' }}>
          <button 
            className="profile-btn"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            aria-label="User Profile Menu"
          >
            <div className="header-avatar">{currentUser?.photo || 'أ ع'}</div>
          </button>
          
          {showProfileDropdown && (
            <div className="profile-dropdown-container">
              <div className="profile-dropdown-header">
                <div className="header-avatar large">{currentUser?.photo || 'أ ع'}</div>
                <div className="profile-info">
                  <div className="profile-name">{lang === 'ar' ? currentUser?.name : currentUser?.nameEn}</div>
                  <div className="profile-email">{currentUser?.email || currentUser?.username}</div>
                </div>
              </div>
              <div className="profile-dropdown-body">
                {currentUser?.role === 'admin' && (
                  <button 
                    className="dropdown-link-btn"
                    onClick={() => { setActiveTab('settings'); setShowProfileDropdown(false); }}
                  >
                    <Settings size={14} />
                    <span>{t.settings}</span>
                  </button>
                )}
                <button 
                  className="dropdown-link-btn danger"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={14} />
                  <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
