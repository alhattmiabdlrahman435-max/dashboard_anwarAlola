import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import { useAcademicYear } from '../contexts/AcademicYear/AcademicYearContext';
import { useNotifications } from '../contexts/Notifications/useNotifications';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Globe, Sun, Moon, Bell, Mail, Settings, LogOut, Pin, Calendar, Plus, Check, Archive, X, GraduationCap, Lock, Unlock, BarChart3 } from 'lucide-react';
import InstallAppButton from './InstallAppButton';
import AcademicYearPromotionModal from './AcademicYearPromotionModal';
import AcademicYearCompareModal from './AcademicYearCompareModal';
import { api } from '../services/api';

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
  const {
    academicYears,
    currentYear,
    selectedYear,
    isViewingArchive,
    switchAcademicYear,
    createAcademicYear,
    setCurrentAcademicYear,
    fetchAcademicYears,
  } = useAcademicYear();

  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [savingYear, setSavingYear] = useState(false);
  const [newYearForm, setNewYearForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  const handleCreateYearSubmit = async (e) => {
    e.preventDefault();
    if (!newYearForm.name.trim()) return;
    setSavingYear(true);
    try {
      await createAcademicYear({
        name: newYearForm.name.trim(),
        start_date: newYearForm.start_date || null,
        end_date: newYearForm.end_date || null,
        is_current: Boolean(newYearForm.is_current),
      });
      setToastMessage?.(lang === 'ar' ? `تم إنشاء العام الدراسي ${newYearForm.name} بنجاح` : `Academic year ${newYearForm.name} created`);
      setShowNewYearModal(false);
      setNewYearForm({ name: '', start_date: '', end_date: '', is_current: false });
    } catch (err) {
      setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر إنشاء العام الدراسي' : 'Failed to create academic year'));
    } finally {
      setSavingYear(false);
    }
  };

  const location = useLocation();
  const navigate = useNavigate();

  // تجميد عمود الأسماء حسب الحاجة (مرن على الهاتف واللابتوب)
  const [freezeColumns, setFreezeColumns] = useState(() => localStorage.getItem('freeze_columns') === '1');

  const applyFreezeColumns = useCallback((val) => {
    setFreezeColumns(val);
    if (val) {
      document.body.classList.add('freeze-columns');
      localStorage.setItem('freeze_columns', '1');
    } else {
      document.body.classList.remove('freeze-columns');
      localStorage.setItem('freeze_columns', '0');
    }
    window.dispatchEvent(new CustomEvent('freeze_columns_changed', { detail: val }));
  }, []);

  useEffect(() => {
    if (freezeColumns) {
      document.body.classList.add('freeze-columns');
    } else {
      document.body.classList.remove('freeze-columns');
    }
  }, [freezeColumns]);

  useEffect(() => {
    const onHeaderClick = (e) => {
      const th = e.target.closest('th.sticky-col-2, th.sticky-col-name, th.sticky-print-col-2, th.sticky-student-name');
      if (th) {
        const next = !document.body.classList.contains('freeze-columns');
        applyFreezeColumns(next);
        setToastMessage?.(next ? '📌 تم تجميد عمود الأسماء' : 'تم إلغاء تجميد عمود الأسماء');
      }
    };
    const onExternalSync = (e) => {
      setFreezeColumns(Boolean(e.detail));
    };
    document.addEventListener('click', onHeaderClick);
    window.addEventListener('freeze_columns_changed', onExternalSync);
    return () => {
      document.removeEventListener('click', onHeaderClick);
      window.removeEventListener('freeze_columns_changed', onExternalSync);
    };
  }, [applyFreezeColumns, setToastMessage]);

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
        {/* محوّل العام الدراسي */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="lang-btn"
            onClick={() => setShowYearDropdown((prev) => !prev)}
            title={lang === 'ar' ? 'تبديل العام الدراسي أو استعراض الأرشيف' : 'Switch Academic Year'}
            style={{
              backgroundColor: isViewingArchive ? 'rgba(245, 158, 11, 0.16)' : 'rgba(16, 185, 129, 0.12)',
              borderColor: isViewingArchive ? '#f59e0b' : '#10b981',
              color: isViewingArchive ? '#b45309' : '#047857',
              fontWeight: 700,
            }}
          >
            {isViewingArchive ? <Archive size={15} /> : <Calendar size={15} />}
            <span>{selectedYear?.name || '2026-2027'}</span>
            {isViewingArchive && (
              <span style={{ fontSize: '11px', opacity: 0.9 }}>
                ({lang === 'ar' ? 'أرشيف' : 'Archive'})
              </span>
            )}
          </button>

          {showYearDropdown && (
            <div
              className="profile-dropdown-container glass-panel animate-scale-up"
              style={{ minWidth: '240px', padding: '10px', zIndex: 1200 }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, padding: '4px 8px 8px', opacity: 0.75, borderBottom: '1px solid rgba(148,163,184,0.2)', marginBottom: '6px' }}>
                {lang === 'ar' ? 'الأعوام الدراسية' : 'Academic Years'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '220px', overflowY: 'auto' }}>
                {academicYears.map((yr) => {
                  const isSelected = Number(yr.id) === Number(selectedYear?.id);
                  return (
                    <div
                      key={yr.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowYearDropdown(false);
                          switchAcademicYear(yr.id);
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'inherit',
                          fontWeight: isSelected ? 700 : 500,
                          textAlign: 'start',
                        }}
                      >
                        <Calendar size={14} />
                        <span>{yr.name}</span>
                        {yr.is_current && (
                          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '999px', backgroundColor: 'rgba(16,185,129,0.16)', color: '#047857' }}>
                            {lang === 'ar' ? 'الحالي' : 'Current'}
                          </span>
                        )}
                      </button>
                      {isSelected && <Check size={14} style={{ color: '#2563eb' }} />}
                      {currentUser?.role === 'admin' && !yr.is_current && (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await api.post(`/api/academic-years/${yr.id}/toggle-archive`);
                                await fetchAcademicYears();
                                setToastMessage?.(res?.message || (lang === 'ar' ? 'تم تحديث حالة الأرشفة' : 'Archive status updated'));
                              } catch (err) {
                                setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر تحديث حالة الأرشفة' : 'Failed to toggle archive'));
                              }
                            }}
                            title={yr.status === 'archived' ? (lang === 'ar' ? 'إلغاء القفل (فتح للتعديل)' : 'Unlock Year') : (lang === 'ar' ? 'قفل الأرشيف (قراءة فقط)' : 'Lock Archive (Read-only)')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '3px 5px',
                              borderRadius: '6px',
                              border: '1px solid rgba(148,163,184,0.35)',
                              background: yr.status === 'archived' ? 'rgba(245,158,11,0.15)' : 'transparent',
                              cursor: 'pointer',
                              color: yr.status === 'archived' ? '#b45309' : 'inherit',
                            }}
                          >
                            {yr.status === 'archived' ? <Lock size={12} /> : <Unlock size={12} />}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await setCurrentAcademicYear(yr.id);
                              setToastMessage?.(lang === 'ar' ? `تم تعيين ${yr.name} كعام حالي` : `${yr.name} set as current`);
                              setShowYearDropdown(false);
                            }}
                            title={lang === 'ar' ? 'تعيين كعام حالي' : 'Set as current'}
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              border: '1px solid rgba(148,163,184,0.35)',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: 'inherit',
                            }}
                          >
                            {lang === 'ar' ? 'تفعيل' : 'Activate'}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {['admin', 'super_admin'].includes(currentUser?.role) && (
                <div style={{ marginTop: '8px', borderTop: '1px solid rgba(148,163,184,0.2)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    className="dropdown-link-btn"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setShowYearDropdown(false);
                      setShowNewYearModal(true);
                    }}
                  >
                    <Plus size={14} />
                    <span>{lang === 'ar' ? 'إضافة عام دراسي جديد' : 'New Academic Year'}</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-link-btn"
                    style={{ width: '100%', color: '#1d4ed8', fontWeight: 700 }}
                    onClick={() => {
                      setShowYearDropdown(false);
                      setShowPromotionModal(true);
                    }}
                  >
                    <GraduationCap size={14} />
                    <span>{lang === 'ar' ? 'ترحيل الطلاب للعام الجديد' : 'Promote Students'}</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-link-btn"
                    style={{ width: '100%', color: '#0f766e', fontWeight: 700 }}
                    onClick={() => {
                      setShowYearDropdown(false);
                      setShowCompareModal(true);
                    }}
                  >
                    <BarChart3 size={14} />
                    <span>{lang === 'ar' ? 'مقارنة الأعوام الدراسية' : 'Compare Academic Years'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* تثبيت لوحة التحكم كأيقونة على الجهاز */}
        <InstallAppButton lang={lang} />

        {/* تجميد / إلغاء تجميد عمود الأسماء حسب الحاجة */}
        <button
          type="button"
          className="lang-btn"
          onClick={() => {
            const next = !freezeColumns;
            applyFreezeColumns(next);
            setToastMessage?.(
              next
                ? (lang === 'ar' ? '📌 تم تجميد عمود الأسماء' : '📌 Name column frozen')
                : (lang === 'ar' ? 'تم إلغاء تجميد عمود الأسماء' : 'Name column unfrozen')
            );
          }}
          title={lang === 'ar' ? 'تثبيت أو تحرير عمود الأسماء في الجداول (أو انقر على رأس عمود اسم الطالب)' : 'Freeze / Unfreeze Name Column'}
          style={{
            backgroundColor: freezeColumns ? 'rgba(37, 99, 235, 0.14)' : undefined,
            borderColor: freezeColumns ? '#2563eb' : undefined,
            color: freezeColumns ? '#1d4ed8' : undefined,
            fontWeight: 700,
          }}
        >
          <Pin size={15} />
          <span>{lang === 'ar' ? (freezeColumns ? 'الأسماء: مجمّد' : 'تجميد الأسماء') : (freezeColumns ? 'Unfreeze' : 'Freeze Name')}</span>
        </button>

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
          {notifications.filter(n => !n.isRead && !n.isOutbound).length > 0 && (
            <span className="badge-count-notification">
              {notifications.filter(n => !n.isRead && !n.isOutbound).length}
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
                    className={`dropdown-item ${(notif.isRead || notif.isOutbound) ? 'read' : 'unread'}`} 
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead && !notif.isOutbound) {
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
                    style={{ opacity: (notif.isRead || notif.isOutbound) ? 0.75 : 1, transition: 'all 0.3s' }}
                  >
                    <div className="item-icon-wrapper info">
                      <Bell size={14} />
                    </div>
                    <div className="item-content">
                      <div className="item-title" style={{ fontWeight: (notif.isRead || notif.isOutbound) ? 'normal' : 'bold' }}>{notif.title}</div>
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
                {['admin', 'super_admin'].includes(currentUser?.role) && (
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

      {showNewYearModal && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}
          onClick={() => setShowNewYearModal(false)}
        >
          <div
            className="glass-panel animate-scale-up"
            style={{ width: '100%', maxWidth: '420px', padding: '20px', borderRadius: '16px', backgroundColor: 'var(--card-bg, #ffffff)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                {lang === 'ar' ? 'إضافة عام دراسي جديد' : 'Add New Academic Year'}
              </h3>
              <button type="button" onClick={() => setShowNewYearModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateYearSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  {lang === 'ar' ? 'اسم العام الدراسي (مثال: 2027-2028)' : 'Academic Year Name (e.g. 2027-2028)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="2027-2028"
                  value={newYearForm.name}
                  onChange={(e) => setNewYearForm((p) => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={newYearForm.start_date}
                    onChange={(e) => setNewYearForm((p) => ({ ...p, start_date: e.target.value }))}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    value={newYearForm.end_date}
                    onChange={(e) => setNewYearForm((p) => ({ ...p, end_date: e.target.value }))}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)' }}
                  />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newYearForm.is_current}
                  onChange={(e) => setNewYearForm((p) => ({ ...p, is_current: e.target.checked }))}
                />
                <span>{lang === 'ar' ? 'تعيين هذا العام كعام دراسي حالي' : 'Set as current academic year'}</span>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="lang-btn" onClick={() => setShowNewYearModal(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savingYear}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {savingYear ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ العام' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewingArchive && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            zIndex: 1300,
            padding: '8px 14px',
            borderRadius: '999px',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            color: '#92400e',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          }}
        >
          <Archive size={15} />
          <span>
            {lang === 'ar'
              ? `أنت تستعرض أرشيف العام الدراسي (${selectedYear?.name})${selectedYear?.status === 'archived' ? ' — وضع القراءة فقط' : ''}`
              : `Viewing Archive (${selectedYear?.name})${selectedYear?.status === 'archived' ? ' — Read-only' : ''}`}
          </span>
          {currentYear && (
            <button
              type="button"
              onClick={() => switchAcademicYear(currentYear.id)}
              style={{
                padding: '3px 10px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#d97706',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {lang === 'ar' ? 'العودة للعام الحالي' : 'Back to Current'}
            </button>
          )}
        </div>
      )}

      <AcademicYearPromotionModal
        isOpen={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
      />

      {showCompareModal && (
        <AcademicYearCompareModal
          lang={lang}
          setToastMessage={setToastMessage}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </header>
  );
}
