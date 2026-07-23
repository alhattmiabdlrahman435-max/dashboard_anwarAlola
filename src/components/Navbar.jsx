import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import { useNotifications } from '../contexts/Notifications/useNotifications';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Globe, Sun, Moon, Bell, Mail, Settings, LogOut } from 'lucide-react';

import sloganLogo from '../assets/slogan.jpeg';

export default function Navbar() {
  const {
    lang, setLang, t,
    darkMode, setDarkMode,
    setIsMobileMenuOpen,
    showProfileDropdown, setShowProfileDropdown,
    renderAvatar, setToastMessage
  } = useApp();

  const {
    showNotificationsDropdown, setShowNotificationsDropdown,
    smsLogs, notifications, handleMarkNotificationAsRead,
  } = useNotifications();

  const { currentUser, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const getTabLabel = () => {
    const pathToLabelMap = {
      '/dashboard': t.dashboard,
      '/students': t.students,
      '/parents': t.parents,
      '/prep-supervisors': t.prepSupervisors,
      '/teachers': t.teachers,
      '/classes': t.classes,
      '/subjects': t.subjects,
      '/schedule': t.schedule,
      '/attendance': t.qrScanner,
      '/absence-requests': t.absenceRequests,
      '/assignments': t.assignmentsHub,
      '/exam-schedules': t.examSchedulesBuilder,
      '/detailed-grades': t.detailedGrades,
      '/finance': t.finance,
      '/notifications': t.communications,
      '/control': t.control,
      '/reports': t.reports,
      '/teacher-reports': t.teacherReports,
      '/supervisors': lang === 'ar' ? 'إدارة الوكلاء' : 'Vice Principals',
      '/settings': t.settings
    };
    return pathToLabelMap[location.pathname] || t.dashboard;
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
          {location.pathname !== '/dashboard' ? (
            <>
              <span className="breadcrumb-sub">{lang === 'ar' ? 'الرئيسية' : 'Main'}</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">{getTabLabel()}</span>
            </>
          ) : (
            <span className="breadcrumb-active">{lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
          )}
        </div>

        {/* School Official Badge */}
        <div className="header-school-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={sloganLogo} alt="School Logo" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
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
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="badge-count-notification">
              {notifications.filter(n => !n.isRead).length}
            </span>
          )}

          {/* Notifications Dropdown Panel */}
          {showNotificationsDropdown && (
            <div className="notifications-dropdown-container glass-panel animate-scale-up">
              <div className="dropdown-header">
                <span>{lang === 'ar' ? 'الإشعارات وتنبيهات النظام' : 'Notifications & Alerts'}</span>
                {smsLogs.length > 0 && (
                  <span className="sms-count-badge">{smsLogs.length} SMS</span>
                )}
              </div>
              <div className="dropdown-body">
                {notifications.slice(0, 3).map((notif) => (
                  <div 
                    className={`dropdown-item ${notif.isRead ? 'read' : 'unread'}`} 
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) {
                        handleMarkNotificationAsRead(notif.id);
                      }
                      
                      let className = null;
                      let monthKey = 'm1';
                      let termKey;

                      if (notif.title.includes('درجات جاهزة للمراجعة:')) {
                        className = notif.title.replace('📊 درجات جاهزة للمراجعة:', '').trim();
                      } else if (notif.title.includes('درجات الكنترول جاهزة للمراجعة:')) {
                        className = notif.title.replace('📊 درجات الكنترول جاهزة للمراجعة:', '').trim();
                        monthKey = 'termTotal';
                      }

                      if (className) {
                        if (notif.content.includes('للشهر الثاني')) {
                          monthKey = 'm2';
                        } else if (notif.content.includes('للشهر الثالث')) {
                          monthKey = 'm3';
                        } else if (notif.content.includes('للشهر الأول')) {
                          monthKey = 'm1';
                        } else if (notif.content.includes('الكنترول النهائي')) {
                          monthKey = 'termTotal';
                        }

                        if (notif.content.includes('الترم 2')) {
                          termKey = 'term2';
                        } else {
                          termKey = 'term1';
                        }

                        localStorage.setItem('goto_class', className);
                        localStorage.setItem('goto_period', monthKey);
                        localStorage.setItem('goto_term', termKey);
                        window.dispatchEvent(new Event('goto_class_changed'));
                        
                        navigate('/detailed-grades');
                        setShowNotificationsDropdown(false);
                      }
                    }}
                    style={{ opacity: notif.isRead ? 0.6 : 1, transition: 'all 0.3s' }}
                  >
                    <div className="item-icon-wrapper info">
                      <Bell size={14} />
                    </div>
                    <div className="item-content">
                      <div className="item-title" style={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>{notif.title}</div>
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
                <button onClick={() => { navigate('/notifications'); setShowNotificationsDropdown(false); }}>
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
            <div className="header-avatar">{renderAvatar(currentUser?.photo, 'أ ع')}</div>
          </button>
          
          {showProfileDropdown && (
            <div className="profile-dropdown-container glass-panel animate-scale-up">
              <div className="profile-dropdown-header">
                <div className="header-avatar large">{renderAvatar(currentUser?.photo, 'أ ع')}</div>
                <div className="profile-info">
                  <div className="profile-name">{lang === 'ar' ? currentUser?.name : currentUser?.nameEn}</div>
                  <div className="profile-email">{currentUser?.email || currentUser?.username}</div>
                </div>
              </div>
              <div className="profile-dropdown-body">
                {currentUser?.role === 'admin' && (
                  <button 
                    className="dropdown-link-btn"
                    onClick={() => { navigate('/settings'); setShowProfileDropdown(false); }}
                  >
                    <Settings size={14} />
                    <span>{t.settings}</span>
                  </button>
                )}
                <button 
                  className="dropdown-link-btn danger"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                    setToastMessage(lang === 'ar' ? 'تم تسجيل الخروج بنجاح!' : 'Logged out successfully!');
                    setTimeout(() => setToastMessage(''), 3000);
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
