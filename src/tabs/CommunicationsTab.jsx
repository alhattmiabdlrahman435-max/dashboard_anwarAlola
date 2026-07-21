import { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useClasses } from '../contexts/Classes/useClasses';
import { useNotifications } from '../contexts/Notifications/useNotifications';
import { useStudents } from '../contexts/Students/useStudents';
import { useTeachers } from '../contexts/Teachers/useTeachers';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';
import { 
  X, Search, Plus, Bell, Send, Users, User, GraduationCap, 
  Layers, CheckCircle2, Volume2, Info, Trash2, CheckCheck,
  Copy, Sparkles, Filter, Calendar, Clock, ArrowLeftRight, FileText, Check, AlertCircle
} from 'lucide-react';

export default function CommunicationsTab() {
  const {
    lang,
    t,
    triggerConfirm,
    canAction,
    setToastMessage
  } = useApp();

  const { availableGrades, fetchClasses } = useClasses();

  const {
    notifications,
    notificationsPagination,
    handleSendNotification,
    handleMarkNotificationAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
    fetchNotifications,
    loading
  } = useNotifications();

  const { students, fetchStudents } = useStudents();
  const { teachers, fetchTeachers } = useTeachers();

  const {
    page,
    perPage,
    search,
    setPage,
    setPerPage,
    setSearch,
  } = usePagination({
    moduleKey: 'notifications',
  });

  const [activeFilter, setActiveFilter] = useState('all');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const qs = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('per_page', perPage);
    if (search) params.set('search', search);
    if (filterDate) params.set('date', filterDate);

    if (activeFilter === 'parents') {
      params.set('target_type', 'all_parents');
    } else if (activeFilter === 'teachers') {
      params.set('target_type', 'all_teachers');
    } else if (activeFilter === 'classes') {
      params.set('target_type', 'by_class');
    } else if (activeFilter === 'private') {
      params.set('target_type', 'by_student');
    }
    return '?' + params.toString();
  }, [page, perPage, search, filterDate, activeFilter]);

  useEffect(() => {
    fetchNotifications(qs);
  }, [fetchNotifications, qs]);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchTeachers();
  }, [fetchClasses, fetchStudents, fetchTeachers]);

  // Form states inside modal
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
  const [studentSearchText, setStudentSearchText] = useState('');
  const [teacherSearchText, setTeacherSearchText] = useState('');

  // Delete handlers
  const onDeleteNotificationClick = (e, notifId) => {
    e.stopPropagation();
    triggerConfirm({
      title: lang === 'ar' ? 'حذف الإشعار' : 'Delete Notification',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الإشعار نهائياً؟' : 'Are you sure you want to permanently delete this notification?',
      onConfirm: () => {
        handleDeleteNotification(notifId);
      }
    });
  };

  const onDeleteAllNotificationsClick = () => {
    triggerConfirm({
      title: lang === 'ar' ? 'حذف جميع الإشعارات' : 'Delete All Notifications',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف جميع الإشعارات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!' : 'Are you sure you want to delete all notifications permanently? This action cannot be undone!',
      onConfirm: () => {
        handleDeleteAllNotifications();
      }
    });
  };

  // Copy helper
  const handleCopyContent = (e, notif) => {
    e.stopPropagation();
    const textToCopy = `${notif.title}\n${notif.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(notif.id);
    if (setToastMessage) {
      setToastMessage(lang === 'ar' ? 'تم نسخ نص الإشعار بنجاح' : 'Notification content copied');
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Preset Templates
  const applyPresetTemplate = (templateKey) => {
    if (templateKey === 'absence') {
      setModalNotificationTitle(lang === 'ar' ? 'تنبيه غياب وتأخر دراسي' : 'Absence & Attendance Alert');
      setModalNotificationContent(lang === 'ar' ? 'نود إحاطتكم بحضور ومواظبة الطالب/الطالبة، نرجو المتابعة الحثيثة والتواصل مع إدارة المدرسة لضمان التفوق.' : 'We would like to inform you regarding student attendance. Please follow up with school administration.');
    } else if (templateKey === 'exam') {
      setModalNotificationTitle(lang === 'ar' ? 'إعلان جدول الاختبارات النهائية' : 'Final Exam Schedule Announcement');
      setModalNotificationContent(lang === 'ar' ? 'تم اعتماد ونشر جدول الاختبارات التقييمية. نرجو الحرص على مراجعة المقررات والالتزام بالحضور في المواعيد المحددة.' : 'The evaluation exam schedule has been published. Please ensure thorough revision and timely attendance.');
    } else if (templateKey === 'parents_meeting') {
      setModalNotificationTitle(lang === 'ar' ? 'دعوة لاجتماع أولياء الأمور الدوري' : 'Parents-Teachers Meeting Invitation');
      setModalNotificationContent(lang === 'ar' ? 'يسر إدارة المدرسة دعوتكم لحضور الاجتماع الدوري لمناقشة المستوى الأكاديمي والتربوي لأبنائنا الطلاب يوم الخميس القادم.' : 'You are cordially invited to attend the periodic parents meeting next Thursday.');
    } else if (templateKey === 'general_announcement') {
      setModalNotificationTitle(lang === 'ar' ? 'تعميم إداري هام للجميع' : 'Important School Announcement');
      setModalNotificationContent(lang === 'ar' ? 'تود إدارة رياض ومدارس أنوار العلى الدولية تذكير جميع الطلاب وأولياء الأمور بالتعليمات والأنشطة القادمة.' : 'Anwar Al-Ola Int. Model Schools would like to remind all students & parents of upcoming activities.');
    }
  };

  // Form Submission
  const onSendNotificationSubmit = (e) => {
    e.preventDefault();
    if (!modalNotificationTitle.trim() || !modalNotificationContent.trim()) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let extraDetails = {};

    if (modalNotificationType === 'student') {
      const targetStudent = students.find(s => s.id === Number(modalNotificationStudentId));
      extraDetails = {
        studentId: Number(modalNotificationStudentId),
        studentName: targetStudent ? targetStudent.name : null,
        studentNameEn: targetStudent ? targetStudent.nameEn : null,
        grade: targetStudent ? targetStudent.grade : null
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
    setShowNotificationModal(false);
    setModalNotificationTitle('');
    setModalNotificationContent('');
    setStudentSearchText('');
    setTeacherSearchText('');
  };

  const getNotificationSender = useCallback((notif) => {
    if (notif.type === 'attendance') {
      return {
        name: lang === 'ar' ? 'مشرف التحضير' : 'Prep Supervisor',
        key: 'supervisor'
      };
    }
    return {
      name: lang === 'ar' ? 'إدارة المدرسة' : 'School Administration',
      key: 'admin'
    };
  }, [lang]);

  // Format 12-Hour Makkah Time (ص / م)
  const formatTime12hMakkah = useCallback((dateStr) => {
    if (!dateStr) return '';
    try {
      let d = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) {
        d = new Date(dateStr);
      }
      if (isNaN(d.getTime())) return dateStr;

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM');
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      const formattedHours = String(hours).padStart(2, '0');

      return `${year}-${month}-${day} ${formattedHours}:${minutes} ${period}`;
    } catch (e) {
      return dateStr;
    }
  }, [lang]);

  // Relative Time Helper
  const formatTimeAgo = useCallback((dateStr) => {
    if (!dateStr) return '';
    try {
      const notifDate = new Date(dateStr.replace(' ', 'T'));
      const now = new Date();
      const diffMs = now - notifDate;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 2) return lang === 'ar' ? 'الآن' : 'Just now';
      if (diffMins < 60) return lang === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
      if (diffHours < 24) return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
      if (diffDays === 1) return lang === 'ar' ? 'أمس' : 'Yesterday';
      if (diffDays < 7) return lang === 'ar' ? `منذ ${diffDays} أيام` : `${diffDays}d ago`;

      return formatTime12hMakkah(dateStr);
    } catch (e) {
      return dateStr;
    }
  }, [lang, formatTime12hMakkah]);

  // Accurate KPI Stats Calculation
  const statsTotal = notificationsPagination.total || notifications.length;
  
  const statsAllUsers = useMemo(() => {
    return notifications.filter(n => n.type === 'general' || n.type === 'all_users').length;
  }, [notifications]);

  const statsParents = useMemo(() => {
    return notifications.filter(n => n.type === 'parents' || n.type === 'broadcast_parents').length;
  }, [notifications]);

  const statsTeachers = useMemo(() => {
    return notifications.filter(n => n.type === 'teachers' || n.type === 'broadcast_teachers').length;
  }, [notifications]);

  const statsClassesAndPrivate = useMemo(() => {
    return notifications.filter(n => n.type === 'class' || n.type === 'student' || n.type === 'private' || n.type === 'teacher').length;
  }, [notifications]);

  // Recipient Resolver Helper
  const getNotificationRecipient = useCallback((notif) => {
    const type = notif.type;
    const cleanGrade = resolveGradeName(notif);

    if (type === 'general' || type === 'all_users') {
      return lang === 'ar' ? 'جميع المستخدمين (معلمين وأولياء أمور)' : 'All Users (Teachers & Parents)';
    }
    if (type === 'parents' || type === 'broadcast_parents') {
      return lang === 'ar' ? 'جميع أولياء الأمور' : 'All Parents';
    }
    if (type === 'teachers' || type === 'broadcast_teachers') {
      return lang === 'ar' ? 'جميع المعلمين' : 'All Teachers';
    }
    if (type === 'class') {
      return lang === 'ar' ? `الصف: ${cleanGrade}` : `Class: ${cleanGrade}`;
    }
    if (type === 'student' || type === 'private') {
      const targetStudent = students.find(s => String(s.id) === String(notif.studentId));
      const sName = notif.studentName || (targetStudent ? (targetStudent.name || targetStudent.name_ar || targetStudent.name_en) : null);
      if (sName) return lang === 'ar' ? `الطالب: ${sName}` : `Student: ${sName}`;
      return notif.studentId ? (lang === 'ar' ? `الطالب (رقم #${notif.studentId})` : `Student (#${notif.studentId})`) : (lang === 'ar' ? 'طالب مخصص' : 'Student');
    }
    if (type === 'teacher') {
      const targetTeacher = teachers.find(t => String(t.id) === String(notif.teacherId));
      const tName = notif.teacherName || (targetTeacher ? (targetTeacher.name || targetTeacher.name_ar || targetTeacher.name_en) : null);
      if (tName) return lang === 'ar' ? `المعلم: ${tName}` : `Teacher: ${tName}`;
      return notif.teacherId ? (lang === 'ar' ? `المعلم (رقم #${notif.teacherId})` : `Teacher (#${notif.teacherId})`) : (lang === 'ar' ? 'معلم مخصص' : 'Teacher');
    }

    return lang === 'ar' ? 'عام' : 'General';
  }, [lang, students, teachers]);

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      if (filterDate && notif.date && !notif.date.substring(0, 10).startsWith(filterDate)) return false;
      if (activeFilter === 'all_users') return notif.type === 'general' || notif.type === 'all_users';
      if (activeFilter === 'parents') return notif.type === 'parents' || notif.type === 'broadcast_parents' || notif.type === 'general' || notif.type === 'broadcast';
      if (activeFilter === 'teachers') return notif.type === 'teachers' || notif.type === 'broadcast_teachers' || notif.type === 'general' || notif.type === 'broadcast';
      if (activeFilter === 'classes') return notif.type === 'class';
      if (activeFilter === 'private') return notif.type === 'student' || notif.type === 'private' || notif.type === 'teacher';
      return true;
    });
  }, [notifications, filterDate, activeFilter]);

  // Group notifications chronologically (Today, Yesterday, Earlier)
  const groupedNotifications = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().substring(0, 10);

    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };

    filteredNotifications.forEach(notif => {
      const d = notif.date ? notif.date.substring(0, 10) : '';
      if (d === today) {
        groups.today.push(notif);
      } else if (d === yesterday) {
        groups.yesterday.push(notif);
      } else {
        groups.earlier.push(notif);
      }
    });

    return groups;
  }, [filteredNotifications]);

  // Unread Count Stats
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Smart Grade Resolver
  const resolveGradeName = (notif) => {
    if (!notif) return lang === 'ar' ? 'الصف الدراسي' : 'Class';

    // 1. Direct grade/class_name properties on notification object
    const directGrade = notif.grade || notif.class_name || notif.className || notif.grade_name || notif.gradeName;
    if (directGrade && directGrade !== 'null' && directGrade !== 'NULL' && directGrade !== 'undefined') {
      return directGrade;
    }

    // 2. Lookup from student record if studentId exists
    if (notif.studentId) {
      const targetStudent = students.find(s => s.id === Number(notif.studentId));
      if (targetStudent) {
        const studentGrade = targetStudent.grade || targetStudent.class_name || targetStudent.grade_name;
        if (studentGrade && studentGrade !== 'null' && studentGrade !== 'NULL' && studentGrade !== 'undefined') {
          return studentGrade;
        }
      }
    }

    // 3. Extract grade/class name from notification content/title if present (e.g. "تم تحديث الجدول الدراسي الأسبوعي للفصل الصف الأول - ج")
    const textToSearch = `${notif.title || ''} ${notif.content || ''}`;
    const classMatch = textToSearch.match(/(?:للفصل|فصل|الصف)\s+([^\s\:\,\.\-]+(?:\s*[\-\–]\s*[^\s\:\,\.\-]+)?)/);
    if (classMatch && classMatch[1] && !classMatch[1].includes('العام') && !classMatch[1].includes('ابنكم')) {
      return classMatch[1].trim();
    }

    // 4. Default clean fallback
    return lang === 'ar' ? 'الصف الدراسي' : 'Class';
  };

  // Dynamic Category Details
  const getCategoryDetails = (notif, studentName, studentNameEn, teacherName, teacherNameEn) => {
    const type = notif.type;
    const cleanGrade = resolveGradeName(notif);

    if (type === 'general' || type === 'parents' || type === 'broadcast_parents') {
      return {
        label: lang === 'ar' ? 'تعميم عام لأولياء الأمور' : 'All Parents Broadcast',
        bgGlow: 'rgba(30, 80, 142, 0.08)',
        borderColor: 'var(--color-primary-ui)',
        textColor: 'var(--color-primary-ui)',
        icon: <Users size={16} />
      };
    } else if (type === 'class' || type === 'assignment' || type === 'homework') {
      return {
        label: lang === 'ar' ? `الصف: ${cleanGrade}` : `Class: ${cleanGrade}`,
        bgGlow: 'rgba(217, 119, 6, 0.08)',
        borderColor: '#d97706',
        textColor: '#b45309',
        icon: <Layers size={16} />
      };
    } else if (type === 'student' || type === 'private') {
      const name = lang === 'ar' ? (studentName || 'طالب مخصص') : (studentNameEn || studentName || 'Private Student');
      const studentLabel = cleanGrade !== 'الصف الدراسي' && cleanGrade !== 'Class'
        ? (lang === 'ar' ? `طالب (${cleanGrade}): ${name}` : `Student (${cleanGrade}): ${name}`)
        : (lang === 'ar' ? `طالب: ${name}` : `Student: ${name}`);
      return {
        label: studentLabel,
        bgGlow: 'rgba(225, 29, 72, 0.08)',
        borderColor: '#e11d48',
        textColor: '#be123c',
        icon: <GraduationCap size={16} />
      };
    } else if (type === 'teachers' || type === 'broadcast_teachers') {
      return {
        label: lang === 'ar' ? 'تعميم لجميع المعلمين' : 'All Teachers Broadcast',
        bgGlow: 'rgba(16, 185, 129, 0.08)',
        borderColor: '#10b981',
        textColor: '#047857',
        icon: <Users size={16} />
      };
    } else if (type === 'teacher') {
      const name = lang === 'ar' ? (teacherName || 'معلم مخصص') : (teacherNameEn || teacherName || 'Teacher');
      return {
        label: lang === 'ar' ? `المعلم: ${name}` : `Teacher: ${name}`,
        bgGlow: 'rgba(15, 118, 110, 0.08)',
        borderColor: '#0f766e',
        textColor: '#0f766e',
        icon: <User size={16} />
      };
    }
    
    // Default fallback
    const isHomework = (notif.title && notif.title.includes('واجب')) || (notif.content && notif.content.includes('واجب'));
    const defaultLabel = isHomework 
      ? (lang === 'ar' ? `الصف: ${cleanGrade}` : `Class: ${cleanGrade}`)
      : (lang === 'ar' ? `الصف: ${cleanGrade}` : `Class: ${cleanGrade}`);

    return {
      label: defaultLabel,
      bgGlow: 'rgba(100, 116, 139, 0.08)',
      borderColor: '#64748b',
      textColor: '#475569',
      icon: <Bell size={16} />
    };
  };

  // Student & Teacher Search Filters for Modal
  const filteredStudentsList = useMemo(() => {
    const q = studentSearchText.toLowerCase().trim();
    if (!q) return students;
    return students.filter(s => {
      const nameMatch = s.name?.toLowerCase().includes(q) || s.nameEn?.toLowerCase().includes(q);
      const idMatch = s.id?.toString().includes(q);
      const studentNumMatch = (s.student_number || s.studentNumber || s.academic_number || s.national_id || s.code)?.toString().toLowerCase().includes(q);
      return nameMatch || idMatch || studentNumMatch;
    });
  }, [students, studentSearchText]);

  const filteredTeachersList = useMemo(() => {
    const q = teacherSearchText.toLowerCase().trim();
    if (!q) return teachers;
    return teachers.filter(teach => {
      const nameMatch = teach.name?.toLowerCase().includes(q) || teach.nameEn?.toLowerCase().includes(q);
      const idMatch = teach.id?.toString().includes(q);
      const jobIdMatch = (teach.jobId || teach.job_number || teach.job_no)?.toString().toLowerCase().includes(q);
      return nameMatch || idMatch || jobIdMatch;
    });
  }, [teachers, teacherSearchText]);

  return (
    <div className="notif-command-center">
      {/* Scope Custom CSS for State-of-the-Art Dashboard */}
      <style>{`
        .notif-command-center {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: notifFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes notifFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 1. Header Banner */
        .notif-banner-modern {
          background: linear-gradient(135deg, rgba(30, 80, 142, 0.06) 0%, var(--color-surface-alt) 100%);
          border: 1.5px solid rgba(30, 80, 142, 0.18);
          border-radius: 20px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .notif-banner-info-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .notif-banner-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: var(--gradient-brand);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(30, 80, 142, 0.25);
          flex-shrink: 0;
        }

        .notif-banner-text h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--color-text-primary);
          margin: 0;
          line-height: 1.3;
        }

        .notif-banner-text p {
          font-size: 12.5px;
          color: var(--color-text-secondary);
          margin-top: 2px;
          margin-bottom: 0;
          font-weight: 500;
        }

        /* 2. KPI Stats Cards Grid */
        .notif-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        @media (max-width: 1200px) {
          .notif-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 640px) {
          .notif-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .notif-stat-card {
          background: var(--color-surface-alt);
          border: 1.5px solid var(--color-border);
          border-radius: 20px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          position: relative;
          overflow: hidden;
        }

        .notif-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          border-color: var(--color-primary-ui);
        }

        .notif-stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notif-stat-number {
          font-size: 32px;
          font-weight: 900;
          color: var(--color-text-primary);
          line-height: 1;
          letter-spacing: -0.5px;
        }

        .notif-stat-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }

        .notif-stat-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        /* 3. Control Toolbar */
        .notif-toolbar-container {
          background: var(--color-surface-alt);
          border: 1.5px solid var(--color-border);
          border-radius: 20px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .notif-toolbar-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .notif-search-box {
          position: relative;
          min-width: 280px;
          flex-grow: 1;
          max-width: 440px;
        }

        .notif-search-box input {
          width: 100%;
          padding: 10px 42px 10px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        body[dir="ltr"] .notif-search-box input {
          padding: 10px 16px 10px 42px;
        }

        .notif-search-box input:focus {
          border-color: var(--color-primary-ui);
          box-shadow: 0 0 0 3px rgba(30, 80, 142, 0.12);
          outline: none;
        }

        .notif-search-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 14px;
          color: var(--color-text-secondary);
        }

        body[dir="ltr"] .notif-search-icon {
          right: auto;
          left: 14px;
        }

        .notif-filter-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .notif-chip-btn {
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-secondary);
          padding: 8px 16px;
          border-radius: 14px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .notif-chip-btn:hover {
          color: var(--color-text-primary);
          border-color: var(--color-primary-ui);
        }

        .notif-chip-btn.active {
          background: var(--color-primary-ui);
          color: white;
          border-color: var(--color-primary-ui);
          box-shadow: 0 4px 14px rgba(30, 80, 142, 0.25);
        }

        .notif-chip-counter {
          font-size: 10.5px;
          padding: 1px 7px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.12);
          color: inherit;
        }

        /* 4. Notification Cards Feed */
        .notif-feed-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .notif-card-modern {
          background: var(--color-surface-alt);
          border: 1.5px solid var(--color-border);
          border-radius: 18px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .notif-card-modern.unread {
          background: linear-gradient(135deg, rgba(30, 80, 142, 0.04) 0%, var(--color-surface-alt) 100%);
          border-color: rgba(30, 80, 142, 0.35);
          box-shadow: 0 4px 18px rgba(30, 80, 142, 0.07);
        }

        .notif-card-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
          border-color: rgba(30, 80, 142, 0.45);
        }

        .notif-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .notif-card-title-area {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .notif-card-avatar {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .notif-card-title {
          font-size: 15.5px;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.35;
          margin: 0;
        }

        .notif-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .notif-card-body {
          font-size: 13.5px;
          line-height: 1.65;
          color: var(--color-text-secondary);
          font-weight: 500;
          white-space: pre-line;
          margin: 0;
        }

        .notif-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px dashed var(--color-border);
          font-size: 12px;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .notif-action-btn-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .notif-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .notif-icon-btn:hover {
          color: var(--color-primary-ui);
          border-color: var(--color-primary-ui);
          background: rgba(30, 80, 142, 0.08);
        }

        .notif-icon-btn.danger:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }

        /* Preset Chips Modal */
        .preset-templates-container {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .preset-template-chip {
          padding: 7px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .preset-template-chip:hover {
          background: rgba(30, 80, 142, 0.08);
          border-color: var(--color-primary-ui);
          color: var(--color-primary-ui);
        }
      `}</style>

      {/* 1. Header Banner */}
      <div className="notif-banner-modern no-print">
        <div className="notif-banner-info-left">
          <div className="notif-banner-icon">
            <Info size={24} />
          </div>
          <div className="notif-banner-text">
            <h3>{lang === 'ar' ? 'منصة الاتصالات والإشعارات الموحدة' : 'Unified Communications & Alerts Platform'}</h3>
            <p>
              {lang === 'ar' 
                ? 'تتيح لك إرسال التنبيهات الفورية الفعالة والتعاميم المباشرة لفئات مختلفة في المدرسة مع تتبع فوري لحالة التسليم.'
                : 'Send instant broadcast notifications and targeted alerts to students, parents, and teachers with live delivery status.'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => {
              notifications.filter(n => !n.isRead).forEach(n => handleMarkNotificationAsRead(n.id));
            }}
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '700',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-primary-ui)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <CheckCheck size={16} />
            <span>{lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark All Read'}</span>
          </button>
        )}
      </div>

      {/* 2. KPI Stats Cards Grid */}
      <div className="notif-stats-grid">
        {/* Card 1: Total Notifications */}
        <div className="notif-stat-card">
          <div className="notif-stat-content">
            <span className="notif-stat-number">{statsTotal}</span>
            <span className="notif-stat-label">{lang === 'ar' ? 'إجمالي الإشعارات' : 'Total Notifications'}</span>
          </div>
          <div className="notif-stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #1e508e 0%, #103058 100%)' }}>
            <Bell size={22} />
          </div>
        </div>

        {/* Card 2: All Users Broadcasts */}
        <div className="notif-stat-card">
          <div className="notif-stat-content">
            <span className="notif-stat-number">{statsAllUsers}</span>
            <span className="notif-stat-label">{lang === 'ar' ? 'جميع المستخدمين' : 'All Users'}</span>
          </div>
          <div className="notif-stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
            <Sparkles size={22} />
          </div>
        </div>

        {/* Card 3: Parents Broadcasts */}
        <div className="notif-stat-card">
          <div className="notif-stat-content">
            <span className="notif-stat-number">{statsParents}</span>
            <span className="notif-stat-label">{lang === 'ar' ? 'تعاميم أولياء الأمور' : 'Parents Broadcasts'}</span>
          </div>
          <div className="notif-stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
            <Users size={22} />
          </div>
        </div>

        {/* Card 4: Teachers Broadcasts */}
        <div className="notif-stat-card">
          <div className="notif-stat-content">
            <span className="notif-stat-number">{statsTeachers}</span>
            <span className="notif-stat-label">{lang === 'ar' ? 'تعاميم المعلمين' : 'Teachers Broadcasts'}</span>
          </div>
          <div className="notif-stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
            <User size={22} />
          </div>
        </div>

        {/* Card 5: Classes & Individual Alerts */}
        <div className="notif-stat-card">
          <div className="notif-stat-content">
            <span className="notif-stat-number">{statsClassesAndPrivate}</span>
            <span className="notif-stat-label">{lang === 'ar' ? 'الفصول والتنبيهات الفردية' : 'Classes & Private'}</span>
          </div>
          <div className="notif-stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* 3. Control Toolbar */}
      <div className="notif-toolbar-container no-print">
        <div className="notif-toolbar-top-row">
          {/* Search */}
          <div className="notif-search-box">
            <Search size={16} className="notif-search-icon" />
            <input 
              type="text"
              placeholder={lang === 'ar' ? 'البحث في سجل الإشعارات المرسلة...' : 'Search notifications history...'}
              value={search || ''}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Date Picker & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="date"
                className="text-field"
                style={{ 
                  height: '42px', 
                  padding: '0 12px', 
                  borderRadius: '12px', 
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  outline: 'none'
                }}
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setPage(1);
                }}
                title={lang === 'ar' ? 'تصفية حسب التاريخ' : 'Filter by Date'}
              />
              {filterDate && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterDate('');
                    setPage(1);
                  }}
                  style={{
                    position: 'absolute',
                    left: lang === 'ar' ? '8px' : 'auto',
                    right: lang === 'ar' ? 'auto' : '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {canAction('communications', 'delete') && notifications.length > 0 && (
              <button
                onClick={onDeleteAllNotificationsClick}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.06)',
                  color: '#ef4444',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={15} />
                <span>{lang === 'ar' ? 'حذف الكل' : 'Delete All'}</span>
              </button>
            )}

            {canAction('communications', 'create') && (
              <button
                onClick={() => {
                  setModalNotificationType('parents');
                  setModalNotificationTitle('');
                  setModalNotificationContent('');
                  setShowNotificationModal(true);
                }}
                style={{
                  height: '42px',
                  padding: '0 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '800',
                  border: 'none',
                  background: 'var(--gradient-brand)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 18px rgba(30, 80, 142, 0.28)'
                }}
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>{lang === 'ar' ? 'إنشاء إشعار فوري' : 'Compose Alert'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips Pills Row */}
        <div className="notif-filter-chips">
          <button 
            onClick={() => { setActiveFilter('all'); setPage(1); }}
            className={`notif-chip-btn ${activeFilter === 'all' ? 'active' : ''}`}
          >
            <span>{lang === 'ar' ? 'الكل' : 'All'}</span>
            <span className="notif-chip-counter">{notifications.length}</span>
          </button>

          <button 
            onClick={() => { setActiveFilter('all_users'); setPage(1); }}
            className={`notif-chip-btn ${activeFilter === 'all_users' ? 'active' : ''}`}
          >
            <Sparkles size={14} />
            <span>{lang === 'ar' ? 'جميع المستخدمين' : 'All Users'}</span>
          </button>

          <button 
            onClick={() => { setActiveFilter('parents'); setPage(1); }}
            className={`notif-chip-btn ${activeFilter === 'parents' ? 'active' : ''}`}
          >
            <Users size={14} />
            <span>{lang === 'ar' ? 'أولياء الأمور' : 'Parents'}</span>
          </button>

          <button 
            onClick={() => { setActiveFilter('classes'); setPage(1); }}
            className={`notif-chip-btn ${activeFilter === 'classes' ? 'active' : ''}`}
          >
            <Layers size={14} />
            <span>{lang === 'ar' ? 'الصفوف' : 'Classes'}</span>
          </button>

          <button 
            onClick={() => { setActiveFilter('teachers'); setPage(1); }}
            className={`notif-chip-btn ${activeFilter === 'teachers' ? 'active' : ''}`}
          >
            <User size={14} />
            <span>{lang === 'ar' ? 'المعلمون' : 'Teachers'}</span>
          </button>

          <button 
            onClick={() => { setActiveFilter('private'); setPage(1); }}
            className={`notif-chip-btn ${activeFilter === 'private' ? 'active' : ''}`}
          >
            <GraduationCap size={14} />
            <span>{lang === 'ar' ? 'إشعار خاص' : 'Private Alerts'}</span>
          </button>
        </div>
      </div>

      {/* Section Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 -8px 0' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={18} style={{ color: 'var(--color-primary-ui)' }} />
          <span>{lang === 'ar' ? 'سجل الإرسال التاريخي' : 'Historical Dispatch Log'}</span>
        </h4>
        <span style={{ fontSize: '12px', fontWeight: '800', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', padding: '2px 10px', borderRadius: '12px', color: 'var(--color-text-secondary)' }}>
          {filteredNotifications.length} {lang === 'ar' ? 'إشعار' : 'alerts'}
        </span>
      </div>

      {/* 4. Notifications Feed List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '110px',
              borderRadius: '18px',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1.5px solid var(--color-border)',
              opacity: 0.6,
              animation: 'pulse 1.5s infinite ease-in-out'
            }} />
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="notif-feed-list">
          {filteredNotifications.map(notif => renderNotificationCard(notif))}

          {/* Pagination Footer */}
          <div className="no-print" style={{ marginTop: 'var(--space-md)' }}>
            <PaginationBar
              page={page}
              lastPage={notificationsPagination.lastPage}
              total={notificationsPagination.total}
              from={notificationsPagination.from}
              to={notificationsPagination.to}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
              loading={loading}
              lang={lang}
            />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div style={{ 
          padding: '60px 24px', 
          textAlign: 'center', 
          backgroundColor: 'var(--color-surface-alt)', 
          borderRadius: '24px', 
          border: '1.5px dashed var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: 'rgba(30, 80, 142, 0.08)',
            color: 'var(--color-primary-ui)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={32} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
            {search 
              ? (lang === 'ar' ? 'لا توجد نتائج تطابق كلمة البحث' : 'No notifications match search')
              : (lang === 'ar' ? 'لا توجد إشعارات مسجلة في هذا التبويب' : 'No notifications found in this tab')
            }
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, maxWidth: '400px', lineHeight: 1.5 }}>
            {lang === 'ar'
              ? 'يمكنك التبديل بين التبويبات أو النقر على "إنشاء إشعار فوري" لإرسال تنبيه جديد.'
              : 'Switch tabs or click "Compose Alert" to broadcast a new notification.'}
          </p>

          {canAction('communications', 'create') && (
            <button
              onClick={() => {
                let targetType = 'parents';
                if (activeFilter === 'all_users') targetType = 'all_users';
                else if (activeFilter === 'parents') targetType = 'parents';
                else if (activeFilter === 'classes') targetType = 'class';
                else if (activeFilter === 'teachers') targetType = 'teachers';
                else if (activeFilter === 'private') targetType = 'student';

                setModalNotificationType(targetType);
                if (targetType === 'class' && availableGrades.length > 0 && !modalNotificationGrade) {
                  setModalNotificationGrade(availableGrades[0]);
                }
                if (targetType === 'student' && students.length > 0 && !modalNotificationStudentId) {
                  setModalNotificationStudentId(students[0].id);
                }
                if (targetType === 'teacher' && teachers.length > 0 && !modalNotificationTeacherId) {
                  setModalNotificationTeacherId(teachers[0].id);
                }

                setModalNotificationTitle('');
                setModalNotificationContent('');
                setShowNotificationModal(true);
              }}
              style={{
                marginTop: '8px',
                height: '38px',
                padding: '0 18px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: '800',
                border: 'none',
                backgroundColor: 'var(--color-primary-ui)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              <span>{lang === 'ar' ? 'إنشاء إشعار جديد الآن' : 'Compose Alert Now'}</span>
            </button>
          )}
        </div>
      )}

      {/* 5. Notification Composer Modal */}
      {showNotificationModal && (
        <div className="modal-overlay no-print" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="modal-container" style={{ maxWidth: '640px', borderRadius: '24px', overflow: 'hidden' }}>
            <header className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} style={{ color: 'var(--color-primary-ui)' }} />
                <span>{lang === 'ar' ? 'إرسال ونشر إشعار فوري جديد' : 'Compose Instant Announcement'}</span>
              </h3>
              <button 
                className="modal-close-btn" 
                type="button"
                onClick={() => setShowNotificationModal(false)}
                style={{ background: '#ef4444', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                <X size={16} />
              </button>
            </header>

            <form onSubmit={onSendNotificationSubmit}>
              <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Quick Templates Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-primary-ui)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} />
                    <span>{lang === 'ar' ? 'قوالب جاهزة بنقرة واحدة:' : 'Quick Presets:'}</span>
                  </label>

                  <div className="preset-templates-container">
                    <button type="button" className="preset-template-chip" onClick={() => applyPresetTemplate('general_announcement')}>
                      <span>📜 {lang === 'ar' ? 'تعميم إداري' : 'General Notice'}</span>
                    </button>
                    <button type="button" className="preset-template-chip" onClick={() => applyPresetTemplate('exam')}>
                      <span>📅 {lang === 'ar' ? 'جدول الاختبارات' : 'Exam Schedule'}</span>
                    </button>
                    <button type="button" className="preset-template-chip" onClick={() => applyPresetTemplate('parents_meeting')}>
                      <span>👥 {lang === 'ar' ? 'اجتماع أولياء الأمور' : 'Parents Meeting'}</span>
                    </button>
                    <button type="button" className="preset-template-chip" onClick={() => applyPresetTemplate('absence')}>
                      <span>⚠️ {lang === 'ar' ? 'تنبيه مواظبة' : 'Attendance Alert'}</span>
                    </button>
                  </div>
                </div>

                {/* Target Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    🎯 {lang === 'ar' ? 'اختر الفئة المستهدفة:' : 'Select Target Audience:'}
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                    <div 
                      onClick={() => setModalNotificationType('all_users')}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: modalNotificationType === 'all_users' ? '2px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                        background: modalNotificationType === 'all_users' ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface)',
                        color: modalNotificationType === 'all_users' ? 'var(--color-primary-ui)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}
                    >
                      <Sparkles size={18} style={{ margin: '0 auto 4px auto', display: 'block' }} />
                      <span>{lang === 'ar' ? 'جميع المستخدمين' : 'All Users'}</span>
                    </div>

                    <div 
                      onClick={() => setModalNotificationType('parents')}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: modalNotificationType === 'parents' ? '2px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                        background: modalNotificationType === 'parents' ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface)',
                        color: modalNotificationType === 'parents' ? 'var(--color-primary-ui)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}
                    >
                      <Users size={18} style={{ margin: '0 auto 4px auto', display: 'block' }} />
                      <span>{t.targetAllParents}</span>
                    </div>

                    <div 
                      onClick={() => {
                        setModalNotificationType('class');
                        if (availableGrades.length > 0 && !modalNotificationGrade) setModalNotificationGrade(availableGrades[0]);
                      }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: modalNotificationType === 'class' ? '2px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                        background: modalNotificationType === 'class' ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface)',
                        color: modalNotificationType === 'class' ? 'var(--color-primary-ui)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}
                    >
                      <Layers size={18} style={{ margin: '0 auto 4px auto', display: 'block' }} />
                      <span>{t.targetByClass}</span>
                    </div>

                    <div 
                      onClick={() => {
                        setModalNotificationType('student');
                        if (students.length > 0 && !modalNotificationStudentId) setModalNotificationStudentId(students[0].id);
                      }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: modalNotificationType === 'student' ? '2px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                        background: modalNotificationType === 'student' ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface)',
                        color: modalNotificationType === 'student' ? 'var(--color-primary-ui)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}
                    >
                      <GraduationCap size={18} style={{ margin: '0 auto 4px auto', display: 'block' }} />
                      <span>{t.targetByStudent}</span>
                    </div>

                    <div 
                      onClick={() => setModalNotificationType('teachers')}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: modalNotificationType === 'teachers' ? '2px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                        background: modalNotificationType === 'teachers' ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface)',
                        color: modalNotificationType === 'teachers' ? 'var(--color-primary-ui)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}
                    >
                      <Users size={18} style={{ margin: '0 auto 4px auto', display: 'block' }} />
                      <span>{t.targetAllTeachers}</span>
                    </div>

                    <div 
                      onClick={() => {
                        setModalNotificationType('teacher');
                        if (teachers.length > 0 && !modalNotificationTeacherId) setModalNotificationTeacherId(teachers[0].id);
                      }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: modalNotificationType === 'teacher' ? '2px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                        background: modalNotificationType === 'teacher' ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface)',
                        color: modalNotificationType === 'teacher' ? 'var(--color-primary-ui)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}
                    >
                      <User size={18} style={{ margin: '0 auto 4px auto', display: 'block' }} />
                      <span>{lang === 'ar' ? 'حسب المعلم' : 'By Teacher'}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-selector for specific targets */}
                {modalNotificationType === 'student' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '700' }}>🔍 {t.selectStudent}</label>
                    <input 
                      type="text"
                      placeholder={lang === 'ar' ? 'ابحث باسم الطالب أو الرقم الأكاديمي...' : 'Search by student name or ID...'}
                      value={studentSearchText}
                      onChange={(e) => setStudentSearchText(e.target.value)}
                      className="text-field"
                      style={{ height: '36px', fontSize: '12px', padding: '0 10px' }}
                    />
                    <select
                      value={modalNotificationStudentId}
                      onChange={(e) => setModalNotificationStudentId(e.target.value)}
                      className="text-field"
                      style={{ minHeight: '45px', fontSize: '14px', padding: '0 12px', boxSizing: 'border-box', lineHeight: 'normal' }}
                    >
                      {filteredStudentsList.map(s => (
                        <option key={s.id} value={s.id}>
                          {lang === 'ar' ? s.name : (s.nameEn || s.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {modalNotificationType === 'class' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '700' }}>🏫 {t.selectClass}</label>
                    <select 
                      value={modalNotificationGrade} 
                      onChange={(e) => setModalNotificationGrade(e.target.value)}
                      className="text-field"
                      style={{ minHeight: '45px', fontSize: '14px', padding: '0 12px', boxSizing: 'border-box', lineHeight: 'normal' }}
                    >
                      {availableGrades.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}

                {modalNotificationType === 'teacher' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '700' }}>🔍 {lang === 'ar' ? 'إختيار المعلم' : 'Select Teacher'}</label>
                    <input 
                      type="text"
                      placeholder={lang === 'ar' ? 'ابحث باسم المعلم أو الرقم الوظيفي...' : 'Search by teacher name or Job ID...'}
                      value={teacherSearchText}
                      onChange={(e) => setTeacherSearchText(e.target.value)}
                      className="text-field"
                      style={{ height: '36px', fontSize: '12px', padding: '0 10px' }}
                    />
                    <select
                      value={modalNotificationTeacherId}
                      onChange={(e) => setModalNotificationTeacherId(e.target.value)}
                      className="text-field"
                      style={{ minHeight: '45px', fontSize: '14px', padding: '0 12px', boxSizing: 'border-box', lineHeight: 'normal' }}
                    >
                      {filteredTeachersList.map(t => (
                        <option key={t.id} value={t.id}>
                          {lang === 'ar' ? t.name : (t.nameEn || t.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Title & Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    📝 {t.notificationTitleLabel}
                  </label>
                  <input 
                    type="text" 
                    value={modalNotificationTitle} 
                    onChange={(e) => setModalNotificationTitle(e.target.value)}
                    placeholder={lang === 'ar' ? 'عنوان الإشعار...' : 'Notification title...'}
                    className="text-field"
                    style={{ height: '38px', fontSize: '12px', padding: '0 12px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    💬 {t.notificationContentLabel}
                  </label>
                  <textarea 
                    value={modalNotificationContent} 
                    onChange={(e) => setModalNotificationContent(e.target.value)}
                    placeholder={lang === 'ar' ? 'محتوى وتفاصيل البلاغ...' : 'Notification content...'}
                    className="text-field"
                    style={{ minHeight: '90px', fontSize: '12px', padding: '10px 12px', resize: 'vertical' }}
                    required
                  />
                </div>

                {/* Channels Badge Info */}
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                  <span>{lang === 'ar' ? 'سيتم النشر كإشعار فوري للتطبيق وكسجل رسائل SMS كالمعتاد.' : 'Will be broadcasted as instant Push Notification & SMS.'}</span>
                </div>

              </div>

              {/* Modal Footer */}
              <footer className="modal-footer" style={{ padding: '14px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn-elevated"
                  onClick={() => setShowNotificationModal(false)}
                  style={{ height: '36px', padding: '0 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  style={{ height: '36px', padding: '0 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: 'var(--gradient-brand)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  <span>{lang === 'ar' ? 'إرسال ونشر الآن' : 'Broadcast Now'}</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Single Notification Card Render
  function renderNotificationCard(notif) {
    const student = notif.type === 'student' ? students.find(s => s.id === Number(notif.studentId)) : null;
    const resolvedStudentName = student ? student.name : notif.studentName;
    const resolvedStudentNameEn = student ? student.nameEn : notif.studentNameEn;

    const cat = getCategoryDetails(
      notif,
      resolvedStudentName,
      resolvedStudentNameEn,
      notif.teacherName,
      notif.teacherNameEn
    );

    const timeAgo = formatTimeAgo(notif.date);
    const time12hFormatted = formatTime12hMakkah(notif.date);

    return (
      <div 
        key={notif.id}
        className={`notif-card-modern ${!notif.isRead ? 'unread' : ''}`}
        onClick={() => {
          if (!notif.isRead) {
            handleMarkNotificationAsRead(notif.id);
          }
        }}
      >
        <div className="notif-card-header">
          <div className="notif-card-title-area">
            {/* Category Avatar Box */}
            <div 
              className="notif-card-avatar" 
              style={{ backgroundColor: cat.bgGlow, color: cat.textColor, border: `1px solid ${cat.borderColor}` }}
            >
              {cat.icon}
            </div>

            <div>
              <h4 className="notif-card-title">
                {notif.title}
                {!notif.isRead && (
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: '800',
                    background: '#ef4444',
                    color: 'white',
                    padding: '1px 8px',
                    borderRadius: '10px',
                    marginInlineStart: '8px',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }}>
                    {lang === 'ar' ? 'جديد' : 'New'}
                  </span>
                )}
              </h4>

              <div className="notif-card-meta">
                {/* Category Badge Pill - NEVER NULL */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: cat.textColor,
                  background: cat.bgGlow,
                  padding: '2px 8px',
                  borderRadius: '8px',
                  border: `1px solid ${cat.borderColor}`
                }}>
                  {cat.label}
                </span>

                {/* 12-Hour Makkah Time Display (AM/PM - ص/م) */}
                <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  🕒 {timeAgo} ({time12hFormatted})
                </span>
              </div>
            </div>
          </div>

          {/* Actions Group */}
          <div className="notif-action-btn-group no-print" onClick={e => e.stopPropagation()}>
            {!notif.isRead && (
              <button
                className="notif-icon-btn"
                onClick={() => handleMarkNotificationAsRead(notif.id)}
                title={lang === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
              >
                <Check size={14} />
              </button>
            )}

            <button
              className="notif-icon-btn"
              onClick={(e) => handleCopyContent(e, notif)}
              title={lang === 'ar' ? 'نسخ نص الإشعار' : 'Copy notification text'}
            >
              {copiedId === notif.id ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
            </button>

            {canAction('communications', 'delete') && (
              <button
                className="notif-icon-btn danger"
                onClick={(e) => onDeleteNotificationClick(e, notif.id)}
                title={lang === 'ar' ? 'حذف الإشعار' : 'Delete notification'}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Message Content */}
        <p className="notif-card-body">{notif.content}</p>

        {/* Card Footer */}
        <div className="notif-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span>✍️ {lang === 'ar' ? 'المرسل: ' : 'Sender: '}<strong>{getNotificationSender(notif).name}</strong></span>
            <span>🎯 {lang === 'ar' ? 'الموجه إليه: ' : 'Recipient: '}<strong style={{ color: 'var(--color-primary-ui)' }}>{getNotificationRecipient(notif)}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-success)' }}>
            <CheckCircle2 size={13} />
            <span>{lang === 'ar' ? 'تم النشر كإشعار فوري وتنبيه SMS' : 'Sent via Push & SMS'}</span>
          </div>
        </div>
      </div>
    );
  }
}
