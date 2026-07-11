import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Search, Plus, Bell, Send, Users, User, GraduationCap, 
  Layers, CheckCircle2, MessageSquare, Volume2, Info
} from 'lucide-react';

export default function CommunicationsTab() {
  const {
    lang,
    t,
    students,
    teachers,
    notifications,
    availableGrades,
    handleSendNotification
  } = useApp();

  // Local UI states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Form states
  const [modalNotificationType, setModalNotificationType] = useState('parents');
  const [modalNotificationStudentId, setModalNotificationStudentId] = useState(
    students.length > 0 ? students[0].id : ''
  );
  const [modalNotificationGrade, setModalNotificationGrade] = useState(
    availableGrades.length > 0 ? availableGrades[0] : ''
  );
  const [modalNotificationTeacherId, setModalNotificationTeacherId] = useState(
    teachers.length > 0 ? teachers[0].id : ''
  );
  const [modalNotificationTitle, setModalNotificationTitle] = useState('');
  const [modalNotificationContent, setModalNotificationContent] = useState('');

  // Search filter states inside the modal
  const [studentSearchText, setStudentSearchText] = useState('');
  const [teacherSearchText, setTeacherSearchText] = useState('');

  // Submit Handler (Preserving original business logic and simulated SMS log format)
  const onSendNotificationSubmit = (e) => {
    e.preventDefault();
    if (!modalNotificationTitle.trim() || !modalNotificationContent.trim()) {
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    let extraDetails = {};
    if (modalNotificationType === 'student') {
      const targetStudent = students.find(s => s.id === Number(modalNotificationStudentId));
      extraDetails = {
        studentId: Number(modalNotificationStudentId),
        studentName: targetStudent ? targetStudent.name : null,
        studentNameEn: targetStudent ? targetStudent.nameEn : null
      };
    } else if (modalNotificationType === 'class') {
      extraDetails = {
        grade: modalNotificationGrade
      };
    } else if (modalNotificationType === 'teacher') {
      const targetTeacher = teachers.find(t => t.id === Number(modalNotificationTeacherId));
      extraDetails = {
        teacherId: Number(modalNotificationTeacherId),
        teacherName: targetTeacher ? targetTeacher.name : null,
        teacherNameEn: targetTeacher ? targetTeacher.nameEn : null
      };
    }

    const newNotification = {
      id: Date.now(),
      title: modalNotificationTitle,
      content: modalNotificationContent,
      date: nowStr,
      type: modalNotificationType,
      ...extraDetails
    };

    // Calculate extra SMS logs to pass
    const extraLogs = [];
    if (modalNotificationType === 'student') {
      const targetStudent = students.find(s => s.id === Number(modalNotificationStudentId));
      if (targetStudent) {
        const smsText = lang === 'ar'
          ? `تنبيه خاص بخصوص ابنكم ${targetStudent.name}: ${modalNotificationTitle} - ${modalNotificationContent}. رياض و مدارس انوار العلى.`
          : `Private alert for ${targetStudent.nameEn}: ${modalNotificationTitle} - ${modalNotificationContent}. Riyadh & Anwar Al-Ola.`;
        extraLogs.push({
          id: Date.now(),
          studentId: targetStudent.id,
          recipient: targetStudent.phone,
          text: smsText,
          time: nowStr.split(' ')[1],
          type: 'present'
        });
      }
    } else if (modalNotificationType === 'class') {
      const classStudents = students.filter(s => s.grade === modalNotificationGrade);
      classStudents.forEach((student, idx) => {
        const smsText = lang === 'ar'
          ? `تعميم لصف ${modalNotificationGrade}: ${modalNotificationTitle} - ${modalNotificationContent}.`
          : `Class announcement for ${modalNotificationGrade}: ${modalNotificationTitle} - ${modalNotificationContent}.`;
        extraLogs.push({
          id: Date.now() + Math.random() + idx,
          studentId: student.id,
          recipient: student.phone,
          text: smsText,
          time: nowStr.split(' ')[1],
          type: 'present'
        });
      });
    } else if (modalNotificationType === 'parents') {
      students.forEach((student, idx) => {
        const smsText = lang === 'ar'
          ? `إشعار عام من المدرسة لأولياء الأمور: ${modalNotificationTitle} - ${modalNotificationContent}.`
          : `Broadcast Announcement to Parents: ${modalNotificationTitle} - ${modalNotificationContent}.`;
        extraLogs.push({
          id: Date.now() + Math.random() + idx,
          studentId: student.id,
          recipient: student.phone,
          text: smsText,
          time: nowStr.split(' ')[1],
          type: 'present'
        });
      });
    }

    handleSendNotification(newNotification, extraLogs);

    // Reset states
    setShowNotificationModal(false);
    setModalNotificationTitle('');
    setModalNotificationContent('');
    setStudentSearchText('');
    setTeacherSearchText('');
  };

  // Filter sent notifications based on pills & search query
  const filteredNotifications = notifications.filter(notif => {
    // 1. Search Query filter
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Tab Filter
    if (activeFilter === 'all') return true;
    if (activeFilter === 'parents') return notif.type === 'parents' || notif.type === 'general';
    if (activeFilter === 'teachers') return notif.type === 'teachers' || notif.type === 'teacher';
    if (activeFilter === 'classes') return notif.type === 'class';
    if (activeFilter === 'private') return notif.type === 'student' || notif.type === 'private';
    
    return true;
  });

  // Dynamic statistics calculations
  const statsTotal = notifications.length;
  const statsParents = notifications.filter(n => n.type === 'parents' || n.type === 'general').length;
  const statsClasses = notifications.filter(n => n.type === 'class').length;
  const statsPrivate = notifications.filter(n => n.type === 'student' || n.type === 'private').length;

  // Filter helpers for student select in the modal
  const filteredStudentsList = students.filter(s => 
    s.name.toLowerCase().includes(studentSearchText.toLowerCase()) ||
    s.id.toString().includes(studentSearchText)
  );

  // Filter helpers for teacher select in the modal
  const filteredTeachersList = teachers.filter(teach => 
    teach.name.toLowerCase().includes(teacherSearchText.toLowerCase()) ||
    teach.id.toString().includes(teacherSearchText)
  );

  // Get localized category texts and details
  const getCategoryDetails = (type, grade, studentName, studentNameEn, teacherName, teacherNameEn) => {
    if (type === 'general' || type === 'parents') {
      return {
        label: lang === 'ar' ? 'عام لأولياء الأمور' : 'All Parents',
        colorClass: 'badge-parents',
        gradientBorder: 'var(--gradient-brand)',
        icon: <Users size={15} />
      };
    } else if (type === 'class') {
      return {
        label: lang === 'ar' ? `الصف: ${grade}` : `Class: ${grade}`,
        colorClass: 'badge-class',
        gradientBorder: 'var(--gradient-warning)',
        icon: <Layers size={15} />
      };
    } else if (type === 'student' || type === 'private') {
      const name = lang === 'ar' ? studentName : (studentNameEn || studentName);
      return {
        label: lang === 'ar' ? `طالب: ${name}` : `Student: ${name}`,
        colorClass: 'badge-student',
        gradientBorder: 'var(--gradient-error)',
        icon: <GraduationCap size={15} />
      };
    } else if (type === 'teachers') {
      return {
        label: lang === 'ar' ? 'جميع المعلمين' : 'All Teachers',
        colorClass: 'badge-teachers',
        gradientBorder: 'var(--gradient-success)',
        icon: <Users size={15} />
      };
    } else if (type === 'teacher') {
      const name = lang === 'ar' ? teacherName : (teacherNameEn || teacherName);
      return {
        label: lang === 'ar' ? `المعلم: ${name}` : `Teacher: ${name}`,
        colorClass: 'badge-teacher',
        gradientBorder: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
        icon: <User size={15} />
      };
    }
    return {
      label: lang === 'ar' ? 'إشعار' : 'Alert',
      colorClass: 'badge-neutral',
      gradientBorder: 'var(--color-border)',
      icon: <Bell size={15} />
    };
  };

  return (
    <div className="notifications-dashboard-container">
      {/* Scope CSS for springy/premium transitions and styled elements */}
      <style>{`
        .notifications-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
          animation: fadeIn 0.4s ease-out;
        }

        /* 1. KPI Cards Grid */
        .stats-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-lg);
        }
        .stat-card-glass {
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-card);
          padding: var(--space-xl);
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          box-shadow: var(--color-shadow);
          transition: var(--transition-normal);
          position: relative;
          overflow: hidden;
        }
        .stat-card-glass:hover {
          transform: translateY(-5px);
          box-shadow: var(--color-shadow-hover);
          border-color: var(--color-primary-ui);
        }
        .stat-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
        }
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        .stat-number-value {
          font-size: 26px;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.1;
          font-family: var(--font-english);
        }
        .stat-label-text {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-top: 4px;
          font-weight: 600;
        }

        /* 2. Control Toolbar */
        .toolbar-panel-glass {
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-card);
          padding: var(--space-lg) var(--space-xl);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-lg);
          box-shadow: var(--color-shadow);
        }
        .search-input-modern-wrapper {
          position: relative;
          min-width: 280px;
          flex-grow: 1;
          max-width: 450px;
        }
        .search-input-modern-wrapper input {
          width: 100%;
          padding: 10px 42px 10px 16px;
          border-radius: 14px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 13.5px;
          font-weight: 500;
          transition: var(--transition-fast);
        }
        body[dir="ltr"] .search-input-modern-wrapper input {
          padding: 10px 16px 10px 42px;
        }
        .search-input-modern-wrapper input:focus {
          border-color: var(--color-primary-ui);
          box-shadow: var(--color-focus-glow);
          outline: none;
        }
        .search-input-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 14px;
          color: var(--color-text-secondary);
        }
        body[dir="ltr"] .search-input-icon {
          right: auto;
          left: 14px;
        }

        /* Segmented Pills */
        .filter-pills-modern {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          background: var(--color-surface);
          padding: 5px;
          border-radius: 16px;
          border: 1px solid var(--color-border);
        }
        .pill-btn-modern {
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .pill-btn-modern:hover {
          color: var(--color-text-primary);
          background: rgba(0, 0, 0, 0.03);
        }
        .pill-btn-modern.active-pill {
          background: var(--color-surface-alt);
          color: var(--color-primary-ui);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
        }
        .btn-gradient-compose {
          background: var(--gradient-brand);
          color: white;
          font-weight: 700;
          font-size: 13.5px;
          border: none;
          border-radius: 14px;
          padding: 10px 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(30, 80, 142, 0.2);
          transition: var(--transition-fast);
        }
        .btn-gradient-compose:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(30, 80, 142, 0.3);
        }

        /* 3. Notification Feed */
        .feed-container-modern {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .notif-card-modern {
          background: var(--color-surface-alt);
          border: 1.5px solid var(--color-border);
          border-radius: 22px;
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          box-shadow: var(--color-shadow);
          transition: var(--transition-normal);
          position: relative;
        }
        .notif-card-modern::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 6px;
          background: var(--border-grad, var(--gradient-brand));
          border-radius: 0 22px 22px 0;
        }
        body[dir="rtl"] .notif-card-modern::before {
          right: 0;
          left: auto;
          border-radius: 0 22px 22px 0;
        }
        body[dir="ltr"] .notif-card-modern::before {
          right: auto;
          left: 0;
          border-radius: 22px 0 0 22px;
        }
        .notif-card-modern:hover {
          transform: translateY(-3px);
          box-shadow: var(--color-shadow-hover);
          border-color: rgba(30, 80, 142, 0.15);
        }
        .notif-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-lg);
        }
        .notif-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .notif-category-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface);
          color: var(--color-primary-ui);
          border: 1px solid var(--color-border);
        }
        .notif-title-text {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        
        /* Badges status style overrides */
        .badge-parents {
          background: rgba(30, 80, 142, 0.08);
          color: var(--color-primary-ui);
        }
        .badge-class {
          background: rgba(230, 150, 15, 0.08);
          color: var(--color-warning);
        }
        .badge-student {
          background: rgba(220, 40, 40, 0.08);
          color: var(--color-error);
        }
        .badge-teachers {
          background: rgba(16, 120, 60, 0.08);
          color: var(--color-success);
        }
        .badge-teacher {
          background: rgba(15, 118, 110, 0.08);
          color: #0f766e;
        }

        .notif-body-text {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          font-weight: 500;
          white-space: pre-line;
        }
        .notif-footer-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-text-secondary);
          border-top: 1px dashed var(--color-border);
          padding-top: 12px;
        }
        .notif-footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* 4. Audience Cards Selection (Inside Modal) */
        .audience-grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 12px;
          margin-bottom: var(--space-lg);
        }
        .audience-card-item {
          border: 2px solid var(--color-border);
          border-radius: 18px;
          padding: var(--space-lg) var(--space-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          background: var(--color-surface);
          transition: var(--transition-normal);
          text-align: center;
        }
        .audience-card-item:hover {
          border-color: rgba(30, 80, 142, 0.3);
          background: var(--color-surface-alt);
        }
        .audience-card-item.selected-audience-card {
          border-color: var(--color-primary-ui);
          background: rgba(30, 80, 142, 0.04);
          transform: scale(1.02);
          box-shadow: 0 4px 14px rgba(30, 80, 142, 0.06);
        }
        .audience-card-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--color-surface-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          transition: var(--transition-fast);
        }
        .selected-audience-card .audience-card-icon-circle {
          background: var(--color-primary-ui);
          color: white;
          border-color: var(--color-primary-ui);
        }
        .audience-card-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        /* Interactive Select/Search Wrapper */
        .live-search-select-wrapper {
          border: 1.5px solid var(--color-border);
          border-radius: 14px;
          background: var(--color-surface);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .live-search-select-results {
          max-height: 150px;
          overflow-y: auto;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          background: var(--color-surface-alt);
        }
        .live-search-select-row {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .live-search-select-row:hover {
          background: rgba(30, 80, 142, 0.05);
          color: var(--color-primary-ui);
        }
        .live-search-select-row.selected-row-item {
          background: rgba(30, 80, 142, 0.08);
          color: var(--color-primary-ui);
        }
      `}</style>

      {/* Modern Info Banner */}
      <div className="informative-banner-modern no-print" style={{
        padding: 'var(--space-lg) var(--space-xl)',
        background: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
        borderInlineStart: '4px solid var(--color-primary-ui)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--color-shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'rgba(30, 80, 142, 0.06)',
          color: 'var(--color-primary-ui)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Info size={18} />
        </div>
        <p style={{
          margin: 0,
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'var(--color-text-secondary)',
          fontWeight: '600'
        }}>
          {lang === 'ar' 
            ? 'منصة الاتصالات والإشعارات الموحدة: تتيح لك إرسال التنبيهات الفورية الفعالة والتعاميم المباشرة لفئات مختلفة في المدرسة مع تتبع فوري لحالة التسليم.' 
            : 'Unified Communications & Notifications Platform: Allows you to push instant notifications and announcements to various school segments with direct delivery tracking.'}
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-grid-modern no-print">
        {/* Card 1: Total sent */}
        <div className="stat-card-glass">
          <div className="stat-icon-wrapper" style={{ background: 'var(--gradient-brand)' }}>
            <Bell size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number-value">{statsTotal}</span>
            <span className="stat-label-text">{lang === 'ar' ? 'إجمالي الإشعارات' : 'Total Notifications'}</span>
          </div>
        </div>

        {/* Card 2: Broadcast to parents */}
        <div className="stat-card-glass">
          <div className="stat-icon-wrapper" style={{ background: 'var(--gradient-info)' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number-value">{statsParents}</span>
            <span className="stat-label-text">{lang === 'ar' ? 'تعاميم أولياء الأمور' : 'Parents Broadcasts'}</span>
          </div>
        </div>

        {/* Card 3: Class broadcasts */}
        <div className="stat-card-glass">
          <div className="stat-icon-wrapper" style={{ background: 'var(--gradient-warning)' }}>
            <Layers size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number-value">{statsClasses}</span>
            <span className="stat-label-text">{lang === 'ar' ? 'تعاميم الفصول' : 'Class Broadcasts'}</span>
          </div>
        </div>

        {/* Card 4: Private Alerts */}
        <div className="stat-card-glass">
          <div className="stat-icon-wrapper" style={{ background: 'var(--gradient-error)' }}>
            <GraduationCap size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number-value">{statsPrivate}</span>
            <span className="stat-label-text">{lang === 'ar' ? 'التنبيهات الفردية' : 'Private Alerts'}</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="toolbar-panel-glass no-print">
        {/* Search */}
        <div className="search-input-modern-wrapper">
          <Search size={18} className="search-input-icon" />
          <input 
            type="text"
            placeholder={lang === 'ar' ? 'البحث في سجل الإشعارات المرسلة...' : 'Search sent history...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Segmented Pills Filters */}
        <div className="filter-pills-modern">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`pill-btn-modern ${activeFilter === 'all' ? 'active-pill' : ''}`}
          >
            {lang === 'ar' ? 'الكل' : 'All'}
          </button>
          <button 
            onClick={() => setActiveFilter('parents')}
            className={`pill-btn-modern ${activeFilter === 'parents' ? 'active-pill' : ''}`}
          >
            {lang === 'ar' ? 'أولياء الأمور' : 'Parents'}
          </button>
          <button 
            onClick={() => setActiveFilter('classes')}
            className={`pill-btn-modern ${activeFilter === 'classes' ? 'active-pill' : ''}`}
          >
            {lang === 'ar' ? 'الصفوف' : 'Classes'}
          </button>
          <button 
            onClick={() => setActiveFilter('teachers')}
            className={`pill-btn-modern ${activeFilter === 'teachers' ? 'active-pill' : ''}`}
          >
            {lang === 'ar' ? 'المعلمون' : 'Teachers'}
          </button>
          <button 
            onClick={() => setActiveFilter('private')}
            className={`pill-btn-modern ${activeFilter === 'private' ? 'active-pill' : ''}`}
          >
            {lang === 'ar' ? 'إشعار خاص' : 'Private'}
          </button>
        </div>

        {/* Compose Button */}
        <button 
          className="btn-gradient-compose"
          onClick={() => {
            setModalNotificationType('parents');
            setModalNotificationTitle('');
            setModalNotificationContent('');
            setShowNotificationModal(true);
          }}
        >
          <Plus size={16} strokeWidth={3} />
          <span>{lang === 'ar' ? 'إنشاء إشعار فوري' : 'Compose Alert'}</span>
        </button>
      </div>

      {/* Feed Timeline Section */}
      <div className="feed-container-modern">
        <h4 style={{ 
          fontSize: '15px', 
          fontWeight: '800', 
          color: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: 'var(--space-sm) 0'
        }}>
          <Volume2 size={18} style={{ color: 'var(--color-primary-ui)' }} />
          <span>{t.notificationsHistoryTitle}</span>
          <span style={{
            fontSize: '11px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            padding: '2px 8px',
            borderRadius: '20px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-english)'
          }}>
            {filteredNotifications.length}
          </span>
        </h4>

        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notif => {
            const cat = getCategoryDetails(
              notif.type,
              notif.grade,
              notif.studentName,
              notif.studentNameEn,
              notif.teacherName,
              notif.teacherNameEn
            );

            return (
              <div 
                key={notif.id}
                className="notif-card-modern"
                style={{ '--border-grad': cat.gradientBorder }}
              >
                {/* Header */}
                <div className="notif-header-modern">
                  <div className="notif-title-section">
                    <div className="notif-category-icon">
                      {cat.icon}
                    </div>
                    <span className="notif-title-text">{notif.title}</span>
                  </div>
                  
                  {/* Localized Category Badge */}
                  <span className={`badge-status ${cat.colorClass}`} style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '6px 14px',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {cat.icon}
                    <span>{cat.label}</span>
                  </span>
                </div>

                {/* Message Content */}
                <p className="notif-body-text">{notif.content}</p>

                {/* Footer metadata */}
                <div className="notif-footer-modern">
                  <div className="notif-footer-item">
                    <span>🕒 {notif.date}</span>
                  </div>
                  <div className="notif-footer-item" style={{ color: 'var(--color-success)' }}>
                    <CheckCircle2 size={12} />
                    <span>{lang === 'ar' ? 'تم النشر كإشعار فوري للهاتف والـ SMS' : 'Broadcasted via Push Notification & SMS'}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '50px var(--space-xl)',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-alt)',
            border: '1.5px dashed var(--color-border)',
            borderRadius: 'var(--radius-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}>
            <MessageSquare size={38} style={{ opacity: 0.35, color: 'var(--color-text-secondary)' }} />
            <span style={{ fontSize: '14.5px', fontWeight: '600' }}>{t.noNotifications}</span>
          </div>
        )}
      </div>

      {/* Gorgeous Slide-over / Modal Dialog */}
      {showNotificationModal && (
        <div className="modal-overlay no-print" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="modal-container" style={{ maxWidth: '650px', borderRadius: '30px', overflow: 'hidden' }}>
            <header className="modal-header" style={{ padding: 'var(--space-xl) var(--space-xxl)', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="modal-title" style={{ fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} style={{ color: 'var(--color-primary-ui)' }} />
                <span>{lang === 'ar' ? 'إرسال إشعار فوري جديد' : 'Send Push Announcement'}</span>
              </h3>
              <button 
                className="modal-close-btn" 
                type="button"
                onClick={() => setShowNotificationModal(false)}
                style={{ background: 'var(--color-surface)', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={onSendNotificationSubmit}>
              <div className="modal-body" style={{ padding: 'var(--space-xl) var(--space-xxl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                
                {/* 1. Target Audience Cards Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    🎯 {lang === 'ar' ? 'اختر الجمهور المستهدف' : 'Select Target Audience'}
                  </label>
                  
                  <div className="audience-grid-cards">
                    {/* Parents Card */}
                    <div 
                      className={`audience-card-item ${modalNotificationType === 'parents' ? 'selected-audience-card' : ''}`}
                      onClick={() => setModalNotificationType('parents')}
                    >
                      <div className="audience-card-icon-circle">
                        <Users size={20} />
                      </div>
                      <span className="audience-card-label">{t.targetAllParents}</span>
                    </div>

                    {/* Class Card */}
                    <div 
                      className={`audience-card-item ${modalNotificationType === 'class' ? 'selected-audience-card' : ''}`}
                      onClick={() => {
                        setModalNotificationType('class');
                        if (availableGrades.length > 0 && !modalNotificationGrade) {
                          setModalNotificationGrade(availableGrades[0]);
                        }
                      }}
                    >
                      <div className="audience-card-icon-circle">
                        <Layers size={20} />
                      </div>
                      <span className="audience-card-label">{t.targetByClass}</span>
                    </div>

                    {/* Student Card */}
                    <div 
                      className={`audience-card-item ${modalNotificationType === 'student' ? 'selected-audience-card' : ''}`}
                      onClick={() => {
                        setModalNotificationType('student');
                        if (students.length > 0 && !modalNotificationStudentId) {
                          setModalNotificationStudentId(students[0].id);
                        }
                      }}
                    >
                      <div className="audience-card-icon-circle">
                        <GraduationCap size={20} />
                      </div>
                      <span className="audience-card-label">{t.targetByStudent}</span>
                    </div>

                    {/* Teachers Card */}
                    <div 
                      className={`audience-card-item ${modalNotificationType === 'teachers' ? 'selected-audience-card' : ''}`}
                      onClick={() => setModalNotificationType('teachers')}
                    >
                      <div className="audience-card-icon-circle">
                        <Users size={20} />
                      </div>
                      <span className="audience-card-label">{t.targetAllTeachers}</span>
                    </div>

                    {/* Specific Teacher Card */}
                    <div 
                      className={`audience-card-item ${modalNotificationType === 'teacher' ? 'selected-audience-card' : ''}`}
                      onClick={() => {
                        setModalNotificationType('teacher');
                        if (teachers.length > 0 && !modalNotificationTeacherId) {
                          setModalNotificationTeacherId(teachers[0].id);
                        }
                      }}
                    >
                      <div className="audience-card-icon-circle">
                        <User size={20} />
                      </div>
                      <span className="audience-card-label">{t.targetSpecificTeacher}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Custom selectors based on Target selection */}

                {/* If Target is Student: Show search and select */}
                {modalNotificationType === 'student' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                      🔍 {t.selectStudent}
                    </label>
                    <div className="live-search-select-wrapper">
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                        <input 
                          type="text"
                          placeholder={lang === 'ar' ? 'ابحث باسم الطالب أو الرقم الأكاديمي...' : 'Search student by name or ID...'}
                          value={studentSearchText}
                          onChange={(e) => setStudentSearchText(e.target.value)}
                          className="text-field"
                          style={{ paddingRight: '36px', minHeight: '38px', borderRadius: '10px' }}
                        />
                      </div>
                      
                      <div className="live-search-select-results">
                        {filteredStudentsList.length > 0 ? (
                          filteredStudentsList.map(s => (
                            <div 
                              key={s.id}
                              className={`live-search-select-row ${modalNotificationStudentId === s.id ? 'selected-row-item' : ''}`}
                              onClick={() => setModalNotificationStudentId(s.id)}
                            >
                              <span>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</span>
                              <span style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>#{s.id}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                            {lang === 'ar' ? 'لا يوجد نتائج مطابقة' : 'No matches found'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* If Target is Class: Show grade selector */}
                {modalNotificationType === 'class' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                      🏫 {t.selectClass}
                    </label>
                    <select 
                      value={modalNotificationGrade} 
                      onChange={(e) => setModalNotificationGrade(e.target.value)}
                      className="text-field"
                      style={{ minHeight: '42px', borderRadius: '12px' }}
                    >
                      {availableGrades.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* If Target is Teacher: Show search and select */}
                {modalNotificationType === 'teacher' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                      🔍 {t.selectTeacher}
                    </label>
                    <div className="live-search-select-wrapper">
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                        <input 
                          type="text"
                          placeholder={lang === 'ar' ? 'ابحث باسم المعلم أو الرقم الوظيفي...' : 'Search teacher by name...'}
                          value={teacherSearchText}
                          onChange={(e) => setTeacherSearchText(e.target.value)}
                          className="text-field"
                          style={{ paddingRight: '36px', minHeight: '38px', borderRadius: '10px' }}
                        />
                      </div>
                      
                      <div className="live-search-select-results">
                        {filteredTeachersList.length > 0 ? (
                          filteredTeachersList.map(teach => (
                            <div 
                              key={teach.id}
                              className={`live-search-select-row ${modalNotificationTeacherId === teach.id ? 'selected-row-item' : ''}`}
                              onClick={() => setModalNotificationTeacherId(teach.id)}
                            >
                              <span>{lang === 'ar' ? teach.name : (teach.nameEn || teach.name)}</span>
                              <span style={{ fontSize: '11px', opacity: 0.6 }}>#{teach.id}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                            {lang === 'ar' ? 'لا يوجد نتائج مطابقة' : 'No matches found'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    📝 {t.notificationTitleLabel}
                  </label>
                  <input 
                    type="text" 
                    value={modalNotificationTitle} 
                    onChange={(e) => setModalNotificationTitle(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل عنواناً جذاباً ومختصراً...' : 'Enter a short and appealing title...'}
                    className="text-field"
                    style={{ borderRadius: '12px', minHeight: '42px' }}
                    required
                  />
                </div>

                {/* 4. Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    💬 {t.notificationContentLabel}
                  </label>
                  <textarea 
                    value={modalNotificationContent} 
                    onChange={(e) => setModalNotificationContent(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب تفاصيل ومحتوى الإشعار هنا بوضوح...' : 'Type fully details and instructions here...'}
                    className="text-field"
                    style={{ minHeight: '110px', resize: 'vertical', borderRadius: '14px', padding: '12px 16px' }}
                    required
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <footer className="modal-footer" style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px', 
                padding: 'var(--space-xl) var(--space-xxl)', 
                borderTop: '1px solid var(--color-border)',
                background: 'var(--color-surface)'
              }}>
                <button 
                  type="button" 
                  className="btn-elevated"
                  onClick={() => setShowNotificationModal(false)}
                  style={{ borderRadius: '12px', padding: '10px 20px', border: 'none', cursor: 'pointer' }}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="btn-gradient-compose"
                  style={{ padding: '10px 24px', boxShadow: 'none' }}
                >
                  <Send size={15} />
                  <span>{lang === 'ar' ? 'إرسال ونشر الآن' : 'Broadcast Now'}</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
