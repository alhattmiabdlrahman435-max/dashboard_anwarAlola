import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useClasses } from '../contexts/Classes/useClasses';
import { useSettings } from '../contexts/Settings/useSettings';
import { useStudents } from '../contexts/Students/useStudents';
import { useSubjects } from '../contexts/Subjects/useSubjects';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';
import PrintHeader from '../components/PrintHeader';
import AcademicExamPrintModal from '../components/AcademicExamPrintModal';
import { X, Calendar, Clock, BookOpen, Printer, Edit3, Trash2, Plus, Wand2, Copy, CheckSquare, Square, Layers, Check, Search, Filter } from 'lucide-react';

export default function ExamSchedulesTab() {
  const {
    lang,
    t,
    setToastMessage,
    canAction,
  } = useApp();

  const {
    examSchedules,
    examSchedulesPagination,
    handlePublishExamSchedule: publishExamSchedule,
    handleDuplicateExamSchedule,
    handleUpdateExamSchedule,
    handleDeleteExamSchedule,
    fetchExamSchedules,
    loading,
  } = useSettings();

  const { classes, fetchClasses } = useClasses();
  const { students, fetchStudents } = useStudents();
  const { subjects, fetchSubjects } = useSubjects();

  const {
    page,
    perPage,
    search,
    filters,
    setPage,
    setPerPage,
    setSearch,
    setFilters,
    buildQueryString,
  } = usePagination({
    moduleKey: 'examSchedules',
    defaultFilters: {
      grade: '',
      class_id: '',
      term: '',
    }
  });

  const qs = buildQueryString();

  useEffect(() => {
    fetchExamSchedules(qs);
  }, [fetchExamSchedules, qs]);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchSubjects();
  }, [fetchClasses, fetchStudents, fetchSubjects]);

  // Modal visibility & Edit State
  const [isSaving, setIsSaving] = useState(false);
  const [showExamScheduleModal, setShowExamScheduleModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  // Form Fields
  const [modalExamGrade, setModalExamGrade] = useState('الصف الأول');
  const [modalExamSection, setModalExamSection] = useState('أ');
  const [modalExamTerm, setModalExamTerm] = useState('الفصل الأول');
  const [modalExamPeriod, setModalExamPeriod] = useState('الشهر الأول');
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);

  // Quick Copy state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceSchedule, setCopySourceSchedule] = useState(null);
  const [copyTargetClassIds, setCopyTargetClassIds] = useState([]);
  const [isCopying, setIsCopying] = useState(false);

  // Academic Official Print Modal state
  const [showAcademicPrintModal, setShowAcademicPrintModal] = useState(false);
  const [printInitialSchedule, setPrintInitialSchedule] = useState(null);

  // Available unique grades across all school classes
  const availableGrades = useMemo(() => {
    const gradesSet = new Set();
    (classes || []).forEach(c => {
      if (c.grade) gradesSet.add(c.grade);
    });
    return Array.from(gradesSet);
  }, [classes]);

  // Keep modalExamGrade in sync with availableGrades
  useEffect(() => {
    if (availableGrades.length > 0 && !availableGrades.includes(modalExamGrade)) {
      setModalExamGrade(availableGrades[0]);
    }
  }, [availableGrades, modalExamGrade]);

  // All class sections for the currently selected grade in modal
  const sectionsOfSelectedGrade = useMemo(() => {
    return (classes || []).filter(c => c.grade === modalExamGrade);
  }, [classes, modalExamGrade]);

  // Auto-select all sections of the grade when grade changes (in create mode)
  useEffect(() => {
    if (!isEditing && sectionsOfSelectedGrade.length > 0) {
      setSelectedSectionIds(sectionsOfSelectedGrade.map(c => c.numericId || Number(String(c.id).replace(/\D/g, ''))));
      if (sectionsOfSelectedGrade[0]) {
        setModalExamSection(sectionsOfSelectedGrade[0].section);
        setModalExamClassId(sectionsOfSelectedGrade[0].id);
      }
    }
  }, [modalExamGrade, sectionsOfSelectedGrade, isEditing]);

  // Subjects inside the exam schedule (temporary list)
  const [modalExamSubjects, setModalExamSubjects] = useState([]);

  // Sub-form for adding a subject to the temporary list
  const [modalExamSubName, setModalExamSubName] = useState('الرياضيات');
  const [modalCustomSubName, setModalCustomSubName] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [modalExamSubDate, setModalExamSubDate] = useState('');
  const [modalExamSubTime, setModalExamSubTime] = useState('08:00 - 09:30 ص');
  const [modalExamSubNote, setModalExamSubNote] = useState('');

  // Interactive time selector state
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customStartTime, setCustomStartTime] = useState('08:00');
  const [customEndTime, setCustomEndTime] = useState('09:30');

  const formatTimeRange = (start, end, currentLang = 'ar') => {
    if (!start || !end) return '';
    const partsStart = start.split(':').map(Number);
    const partsEnd = end.split(':').map(Number);
    if (partsStart.length < 2 || partsEnd.length < 2) return '';

    const formatTimePart = (h, m) => {
      const isPM = h >= 12;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const strH = String(hour12).padStart(2, '0');
      const strM = String(m).padStart(2, '0');
      const suffix = currentLang === 'ar' ? (isPM ? 'م' : 'ص') : (isPM ? 'PM' : 'AM');
      return `${strH}:${strM} ${suffix}`;
    };

    return `${formatTimePart(partsStart[0], partsStart[1])} - ${formatTimePart(partsEnd[0], partsEnd[1])}`;
  };

  // Deleted slots list stored in localStorage
  const [deletedTimeSlots, setDeletedTimeSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('deleted_exam_time_slots');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Custom added slots stored in localStorage
  const [customTimeSlots, setCustomTimeSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_exam_time_slots');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Extract all unique exam period time slots registered in DB schedules + custom admin slots (NO hardcoded static slots)
  const systemTimeSlots = useMemo(() => {
    const slotsSet = new Set();

    // 1. Collect actual time slots used in database exam schedules
    (examSchedules || []).forEach(sch => {
      (sch.subjects || []).forEach(sub => {
        if (sub.time && sub.time.trim()) {
          slotsSet.add(sub.time.trim());
        }
      });
    });

    // 2. Add custom slots saved by admin
    (customTimeSlots || []).forEach(slot => {
      if (slot && slot.trim()) {
        slotsSet.add(slot.trim());
      }
    });

    // 3. Filter out deleted slots
    return Array.from(slotsSet).filter(slot => !deletedTimeSlots.includes(slot));
  }, [examSchedules, customTimeSlots, deletedTimeSlots]);

  const handleDeleteTimeSlot = (slotToDelete, e) => {
    e.stopPropagation();
    const updatedDeleted = [...deletedTimeSlots, slotToDelete];
    setDeletedTimeSlots(updatedDeleted);
    try {
      localStorage.setItem('deleted_exam_time_slots', JSON.stringify(updatedDeleted));
    } catch (err) {}

    if (modalExamSubTime === slotToDelete) {
      setModalExamSubTime('');
    }
  };

  const [modalExamClassId, setModalExamClassId] = useState(null);

  // Find the selected class object with 100% ID & grade/section precision
  const selectedClassObj = useMemo(() => {
    if (modalExamClassId) {
      const byId = (classes || []).find(c => c.id === modalExamClassId);
      if (byId) return byId;
    }
    const fullName = `${modalExamGrade} - ${modalExamSection}`;
    return (classes || []).find(cls => 
      cls.name === fullName ||
      (cls.grade === modalExamGrade && cls.section === modalExamSection)
    );
  }, [classes, modalExamClassId, modalExamGrade, modalExamSection]);

  // Compute available subjects assigned specifically to the selected class with database precision
  const availableSubjectsForSelectedClass = useMemo(() => {
    const list = [];

    // 1. Direct class pivot subjects from DB
    if (selectedClassObj && Array.isArray(selectedClassObj.subjects) && selectedClassObj.subjects.length > 0) {
      selectedClassObj.subjects.forEach(s => {
        if (s && !list.includes(s)) list.push(s);
      });
    }

    // 2. Grade-level subjects from DB (inherit from another section of the same grade level)
    if (selectedClassObj && selectedClassObj.grade) {
      const sameGradeCls = (classes || []).find(c => 
        c.grade === selectedClassObj.grade && 
        Array.isArray(c.subjects) && 
        c.subjects.length > 0
      );
      if (sameGradeCls) {
        sameGradeCls.subjects.forEach(s => {
          if (s && !list.includes(s)) list.push(s);
        });
      }
    }

    // 3. All database registered subjects from subjects table
    if (Array.isArray(subjects) && subjects.length > 0) {
      subjects.forEach(s => {
        const name = lang === 'ar' ? (s.name || s.name_ar) : (s.nameEn || s.name_en || s.name);
        if (name && !list.includes(name)) list.push(name);
      });
    }

    // 4. Special and standard exam subjects requested by school administration
    const defaultExamSpecialSubjects = [
      'اللغة الإنجليزية',
      'التلاوة',
      'القرآن الكريم',
      'التربية الإسلامية',
      'الرياضيات',
      'جبر وهندسة',
      'التفاضل والتكامل',
      'العلوم',
      'اللغة العربية',
      'الاجتماعيات',
      'الكيمياء',
      'الفيزياء',
      'الأحياء'
    ];

    defaultExamSpecialSubjects.forEach(s => {
      if (!list.includes(s)) list.push(s);
    });

    return list;
  }, [selectedClassObj, classes, subjects, lang]);

  // Whenever the selected class changes, reset the selected subject field to that class's first subject
  useEffect(() => {
    if (availableSubjectsForSelectedClass.length > 0) {
      setModalExamSubName(availableSubjectsForSelectedClass[0]);
    } else {
      setModalExamSubName('');
    }
  }, [selectedClassObj?.id, modalExamGrade, modalExamSection, availableSubjectsForSelectedClass]);

  // Open copy modal for a schedule
  const handleOpenCopyModal = (sched) => {
    const schedGrade = sched.grade || (sched.class && (sched.class.grade_ar || sched.class.grade));
    const schedClassId = Number(String(sched.class_id || sched.classId || (sched.class && sched.class.id) || '').replace(/\D/g, ''));
    
    // Find sibling classes of the same grade EXCEPT the source class
    const siblingClasses = (classes || []).filter(c => {
      const cId = c.numericId || Number(String(c.id).replace(/\D/g, ''));
      return c.grade === schedGrade && cId !== schedClassId;
    });

    setCopySourceSchedule(sched);
    setCopyTargetClassIds(siblingClasses.map(c => c.numericId || Number(String(c.id).replace(/\D/g, ''))));
    setShowCopyModal(true);
  };

  // Execute copying schedule to target sections
  const handleExecuteCopy = () => {
    if (!copySourceSchedule || copyTargetClassIds.length === 0) {
      setToastMessage(lang === 'ar' ? 'الرجاء تحديد شعبة واحدة على الأقل لنسخ الجدول إليها' : 'Please select at least one section');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setIsCopying(true);
    handleDuplicateExamSchedule(copySourceSchedule.id, copyTargetClassIds)
      .then((res) => {
        if (res && res.success) {
          setShowCopyModal(false);
          setCopySourceSchedule(null);
          setCopyTargetClassIds([]);
        }
      })
      .finally(() => {
        setIsCopying(false);
      });
  };

  // Status & Date Format Helpers
  const getScheduleStatus = (subjects) => {
    if (!subjects || subjects.length === 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = subjects.map(s => new Date(s.date)).filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) return null;

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(0, 0, 0, 0);

    if (today >= minDate && today <= maxDate) {
      return { label: lang === 'ar' ? 'جارية الآن 📝' : 'Ongoing', type: 'active' };
    } else if (today < minDate) {
      const diffDays = Math.ceil((minDate - today) / (1000 * 60 * 60 * 24));
      return { label: lang === 'ar' ? `تبدأ بعد ${diffDays} يوم ⏳` : `Starts in ${diffDays}d`, type: 'upcoming' };
    } else {
      return { label: lang === 'ar' ? 'اكتملت الاختبارات ✅' : 'Completed', type: 'completed' };
    }
  };

  const formatArabicDay = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return '';
    const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return daysAr[dateObj.getDay()];
  };

  const getDayNumber = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
  };

  const handleAddExamSubject = () => {
    const finalSubjectName = (isCustomSubject ? modalCustomSubName : modalExamSubName || '').trim();
    if (!finalSubjectName) {
      setToastMessage(lang === 'ar' ? 'الرجاء تحديد أو كتابة اسم المادة' : 'Please select or enter subject name');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    if (!modalExamSubDate) {
      setToastMessage(lang === 'ar' ? 'الرجاء تحديد تاريخ الاختبار' : 'Please select exam date');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    const newSubject = {
      id: Date.now() + Math.random(),
      subjectName: finalSubjectName,
      date: modalExamSubDate,
      time: modalExamSubTime,
      note: modalExamSubNote
    };
    setModalExamSubjects(prev => [...prev, newSubject]);
    setModalExamSubDate('');
    setModalExamSubNote('');
    if (isCustomSubject) {
      setModalCustomSubName('');
      setIsCustomSubject(false);
    }
  };

  const handleStartEdit = (sched) => {
    setIsEditing(true);
    setEditingScheduleId(sched.id);
    setModalExamGrade(sched.grade);
    setModalExamSection(sched.section);

    const matchingCls = (classes || []).find(c => c.grade === sched.grade && c.section === sched.section);
    if (matchingCls) {
      setModalExamClassId(matchingCls.id);
    }

    setModalExamTerm(sched.term);
    setModalExamPeriod(sched.period);
    setModalExamSubjects(sched.subjects.map(s => ({
      id: s.id || Date.now() + Math.random(),
      subjectName: s.subjectName,
      date: s.date,
      time: s.time,
      note: s.note || ''
    })));
    setShowExamScheduleModal(true);
  };

  const handlePublishExamSchedule = () => {
    if (modalExamSubjects.length === 0) {
      setToastMessage(lang === 'ar' ? 'الرجاء إضافة مادة واحدة على الأقل للجدول' : 'Please add at least one subject to the schedule');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const targetClass = (classes || []).find(c => 
      c.id === modalExamClassId || 
      c.numericId === modalExamClassId || 
      (c.grade === modalExamGrade && c.section === modalExamSection)
    ) || (classes || [])[0];

    const cleanClassId = targetClass 
      ? (targetClass.numericId || String(targetClass.id).replace(/\D/g, '')) 
      : (modalExamClassId ? String(modalExamClassId).replace(/\D/g, '') : null);

    const cleanSectionIds = !isEditing && selectedSectionIds.length > 0
      ? selectedSectionIds.map(id => Number(String(id).replace(/\D/g, ''))).filter(Boolean)
      : (cleanClassId ? [Number(cleanClassId)] : []);

    if (cleanSectionIds.length === 0) {
      setToastMessage(lang === 'ar' ? 'الرجاء تحديد شعبة واحدة على الأقل لنشر الجدول' : 'Please select at least one section');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const scheduleData = {
      id: isEditing ? editingScheduleId : Date.now(),
      class_id: cleanSectionIds[0] || null,
      class_ids: cleanSectionIds,
      grade: targetClass ? targetClass.grade : modalExamGrade,
      section: targetClass ? targetClass.section : modalExamSection,
      term: modalExamTerm,
      termEn: modalExamTerm === 'الفصل الأول' ? 'First Term' : 'Second Term',
      period: modalExamPeriod,
      periodEn: modalExamPeriod === 'الشهر الأول' ? 'Month 1' : modalExamPeriod === 'الشهر الثاني' ? 'Month 2' : modalExamPeriod === 'الشهر الثالث' ? 'Month 3' : 'Final Term Exam',
      subjects: modalExamSubjects
    };

    setIsSaving(true);
    const actionPromise = isEditing
      ? handleUpdateExamSchedule(editingScheduleId, scheduleData)
      : publishExamSchedule(scheduleData, students);

    actionPromise
      .then((res) => {
        if (res && res.success) {
          setModalExamSubjects([]);
          setShowExamScheduleModal(false);
          setIsEditing(false);
          setEditingScheduleId(null);
        }
      })
      .catch((err) => {
        setToastMessage(err.message || 'Error occurred');
        setTimeout(() => setToastMessage(''), 3000);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const filterGradeSections = useMemo(() => {
    if (!filters.grade || filters.grade === 'all') return classes || [];
    return (classes || []).filter(c => c.grade === filters.grade);
  }, [classes, filters.grade]);

  return (
    <div className="section-card">
      <PrintHeader
        title={lang === 'ar' ? 'جدول الاختبارات المدرسية' : 'School Exam Timetable'}
        subtitle={lang === 'ar' ? 'رياض ومدارس أنوار العلى الدولية النموذجية' : 'Anwar Al-Ola International Model Schools'}
      />

      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} style={{ color: 'var(--color-primary-ui)' }} />
          <span>{t.examSchedulesTitle}</span>
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            className="btn-outlined"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              minHeight: '40px', 
              padding: '0 16px', 
              fontWeight: '700',
              borderColor: 'var(--color-primary-ui)',
              color: 'var(--color-primary-ui)',
              background: 'rgba(30, 80, 142, 0.05)'
            }}
            onClick={() => {
              setPrintInitialSchedule(null);
              setShowAcademicPrintModal(true);
            }}
            title={lang === 'ar' ? 'طباعة رسمية أكاديمية للجداول المعتمدة' : 'Print Academic Schedules'}
          >
            <Printer size={17} />
            <span>{lang === 'ar' ? 'طباعة الجداول الأكاديمية' : 'Print Academic Schedules'}</span>
          </button>

          {canAction('examSchedules', 'create') && (
            <button 
              className="btn-accent"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '40px', padding: '0 16px', fontWeight: '700' }}
              onClick={() => {
                setIsEditing(false);
                setEditingScheduleId(null);
                setModalExamSubjects([]);
                setShowExamScheduleModal(true);
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>{t.addExamScheduleBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH HUB */}
      <div className="no-print" style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '12px 16px',
        marginBottom: 'var(--space-md)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Filters Group */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: '1 1 500px' }}>
          {/* Grade Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} style={{ color: 'var(--color-primary-ui)' }} />
              {lang === 'ar' ? 'الصف:' : 'Grade:'}
            </span>
            <select
              className="text-field"
              value={filters.grade || 'all'}
              onChange={(e) => {
                const newGrade = e.target.value;
                setFilters({
                  grade: newGrade === 'all' ? '' : newGrade,
                  class_id: ''
                });
              }}
              style={{
                height: '36px',
                fontSize: '12px',
                fontWeight: '600',
                padding: '0 10px',
                borderRadius: '8px',
                backgroundColor: filters.grade ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface-alt)',
                borderColor: filters.grade ? 'var(--color-primary-ui)' : 'var(--color-border)',
                minWidth: '130px'
              }}
            >
              <option value="all">{lang === 'ar' ? '🏢 جميع الصفوف' : 'All Grades'}</option>
              {availableGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* Section / Class Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
              {lang === 'ar' ? 'الشعبة:' : 'Section:'}
            </span>
            <select
              className="text-field"
              value={filters.class_id || 'all'}
              onChange={(e) => setFilters({ class_id: e.target.value === 'all' ? '' : e.target.value })}
              style={{
                height: '36px',
                fontSize: '12px',
                fontWeight: '600',
                padding: '0 10px',
                borderRadius: '8px',
                backgroundColor: filters.class_id ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface-alt)',
                borderColor: filters.class_id ? 'var(--color-primary-ui)' : 'var(--color-border)',
                minWidth: '130px'
              }}
            >
              <option value="all">{lang === 'ar' ? '👥 جميع الشعب' : 'All Sections'}</option>
              {filterGradeSections.map(cls => {
                const cleanId = String(cls.id).replace('cls-', '');
                return (
                  <option key={cls.id} value={cleanId}>
                    {cls.name || `${cls.grade} - ${cls.section}`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Term Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
              {lang === 'ar' ? 'الفصل:' : 'Term:'}
            </span>
            <select
              className="text-field"
              value={filters.term || 'all'}
              onChange={(e) => setFilters({ term: e.target.value === 'all' ? '' : e.target.value })}
              style={{
                height: '36px',
                fontSize: '12px',
                fontWeight: '600',
                padding: '0 10px',
                borderRadius: '8px',
                backgroundColor: filters.term ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface-alt)',
                borderColor: filters.term ? 'var(--color-primary-ui)' : 'var(--color-border)',
                minWidth: '120px'
              }}
            >
              <option value="all">{lang === 'ar' ? '📅 جميع الفصول' : 'All Terms'}</option>
              <option value="term1">{lang === 'ar' ? 'الفصل الأول' : 'Term 1'}</option>
              <option value="term2">{lang === 'ar' ? 'الفصل الثاني' : 'Term 2'}</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {(filters.grade || filters.class_id || filters.term || search) && (
            <button
              type="button"
              onClick={() => {
                setFilters({ grade: '', class_id: '', term: '' });
                setSearch('');
              }}
              style={{
                background: 'rgba(220, 38, 38, 0.08)',
                color: '#dc2626',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '36px'
              }}
            >
              <X size={14} />
              <span>{lang === 'ar' ? 'إلغاء الفلاتر' : 'Reset'}</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '220px', flex: '0 1 280px' }}>
          <Search size={15} style={{ position: 'absolute', [lang === 'ar' ? 'right' : 'left']: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="text-field"
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث باسم المادة أو الجدول...' : 'Search subjects, schedules...'}
            style={{
              height: '36px',
              fontSize: '12px',
              paddingRight: lang === 'ar' ? '32px' : '10px',
              paddingLeft: lang === 'ar' ? '10px' : '32px',
              borderRadius: '8px',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Schedules Grid List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={18} style={{ color: 'var(--color-primary-ui)' }} />
          <span>{t.examSchedulesList}</span>
        </h4>

        {examSchedules.length > 0 ? (
          <div className="exam-schedules-grid">
            {examSchedules.map(sched => {
              const status = getScheduleStatus(sched.subjects);
              const gradeText = sched.grade || (sched.class && (sched.class.grade_ar || sched.class.grade));
              const sectionText = sched.section || (sched.class && (sched.class.section_ar || sched.class.section));
              const hasClassText = Boolean(gradeText && sectionText);

              return (
                <div key={sched.id} className="exam-schedule-card printable-card">
                  {/* Card Header */}
                  <div className="exam-card-header">
                    <div className="exam-card-title-group">
                      <h4 className="exam-card-class-name">
                        <Calendar size={18} style={{ color: 'var(--color-primary-ui)' }} />
                        <span>
                          {hasClassText 
                            ? (lang === 'ar' ? `${gradeText} - شعبة (${sectionText})` : `${sched.gradeEn || gradeText} - Sec ${sched.sectionEn || sectionText}`)
                            : (sched.period || sched.title || (lang === 'ar' ? 'جدول اختبارات' : 'Exam Schedule'))
                          }
                        </span>
                      </h4>
                      <div className="exam-card-sub-info">
                        <span className="exam-term-badge">
                          {lang === 'ar' ? sched.term : sched.termEn}
                        </span>
                        <span className="exam-period-badge">
                          {lang === 'ar' ? sched.period : sched.periodEn}
                        </span>
                        {status && (
                          <span className={`exam-status-pill ${status.type}`}>
                            {status.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="exam-card-actions no-print">
                      <button
                        type="button"
                        className="exam-card-action-icon"
                        onClick={() => {
                          setPrintInitialSchedule(sched);
                          setShowAcademicPrintModal(true);
                        }}
                        title={lang === 'ar' ? 'طباعة رسمية أكاديمية' : 'Academic Official Print'}
                        style={{ color: 'var(--color-primary-ui)' }}
                      >
                        <Printer size={16} />
                      </button>
                      {canAction('examSchedules', 'create') && (
                        <button
                          type="button"
                          className="exam-card-action-icon"
                          onClick={() => handleOpenCopyModal(sched)}
                          title={lang === 'ar' ? 'نسخ الجدول لشعب أخرى' : 'Copy to other sections'}
                          style={{ color: 'var(--color-primary-ui)' }}
                        >
                          <Copy size={16} />
                        </button>
                      )}
                      {canAction('examSchedules', 'create') && (
                        <button
                          type="button"
                          className="exam-card-action-icon"
                          onClick={() => handleStartEdit(sched)}
                          title={lang === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      {canAction('examSchedules', 'delete') && (
                        <button
                          type="button"
                          className="exam-card-action-icon delete"
                          onClick={() => handleDeleteExamSchedule(sched.id)}
                          title={lang === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subjects Timeline List */}
                  <div className="exam-subjects-timeline">
                    {sched.subjects.map((sub, sidx) => {
                      const dayName = formatArabicDay(sub.date);
                      const dayNum = getDayNumber(sub.date);

                      return (
                        <div key={sub.id || sidx} className="exam-subject-timeline-item">
                          <div className="exam-date-box">
                            <span className="exam-date-day-name">{dayName || (lang === 'ar' ? 'يوم' : 'Day')}</span>
                            <span className="exam-date-number">{dayNum || sub.date}</span>
                          </div>

                          <div className="exam-subject-info">
                            <div className="exam-subject-title-row">
                              <span className="exam-subject-name">{sub.subjectName}</span>
                              <span className="exam-subject-time">
                                <Clock size={12} />
                                {sub.time}
                              </span>
                            </div>
                            {sub.note && (
                              <div className="exam-subject-note">
                                <BookOpen size={12} />
                                <span>{sub.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '32px' }}>📅</span>
              <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                {lang === 'ar' ? 'لا توجد جداول اختبارات مسجلة' : 'No Exam Schedules Found'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'لم يتم إضافة جداول اختبارات لهذا العام الدراسي بعد.' : 'No exam schedules have been added for this academic term yet.'}
              </span>
            </div>
          </div>
        )}
        <div className="no-print" style={{ marginTop: 'var(--space-md)' }}>
          <PaginationBar
            page={page}
            lastPage={examSchedulesPagination.lastPage}
            total={examSchedulesPagination.total}
            from={examSchedulesPagination.from}
            to={examSchedulesPagination.to}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            loading={loading}
            lang={lang}
          />
        </div>
      </div>

      {/* ADD EXAM SCHEDULE MODAL */}
      {showExamScheduleModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '700px' }}>
            <header className="modal-header">
              <h3 className="modal-title">
                📅 {isEditing ? (lang === 'ar' ? 'تعديل جدول الاختبارات' : 'Edit Exam Schedule') : t.addExamScheduleBtn}
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowExamScheduleModal(false);
                  setModalExamSubjects([]);
                }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              
              {/* Header Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-md)' }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', gridColumn: 'span 2' }}>
                    <label htmlFor="modal-exam-class" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? 'الفصل الدراسي' : 'Class'}
                    </label>
                    <select 
                      id="modal-exam-class"
                      name="class"
                      value={selectedClassObj ? selectedClassObj.name : `${modalExamGrade} - ${modalExamSection}`} 
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const foundCls = (classes || []).find(c => c.name === selectedVal || c.id === selectedVal);
                        if (foundCls) {
                          setModalExamClassId(foundCls.id);
                          setModalExamGrade(foundCls.grade);
                          setModalExamSection(foundCls.section);
                        } else {
                          setModalExamClassId(null);
                          const parts = selectedVal.split(' - ');
                          if (parts.length >= 2) {
                            setModalExamGrade(parts[0].trim());
                            setModalExamSection(parts[1].trim());
                          }
                        }
                      }} 
                      className="text-field" 
                      style={{ height: '36px', padding: '0 8px', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {(classes || []).map(cls => (
                        <option key={cls.id} value={cls.name}>
                          {lang === 'ar' ? cls.name : cls.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', gridColumn: 'span 2' }}>
                    <label htmlFor="modal-exam-grade" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? 'الصف الدراسي' : 'Grade Level'}
                    </label>
                    <select 
                      id="modal-exam-grade"
                      name="grade"
                      value={modalExamGrade} 
                      onChange={(e) => {
                        const selectedGrade = e.target.value;
                        setModalExamGrade(selectedGrade);
                      }} 
                      className="text-field" 
                      style={{ height: '36px', padding: '0 8px', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {availableGrades.map(grade => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label htmlFor="modal-exam-term" style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.selectTerm}</label>
                  <select id="modal-exam-term" name="term" value={modalExamTerm} onChange={(e) => setModalExamTerm(e.target.value)} className="text-field" style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}>
                    <option value="الفصل الأول">الفصل الدراسي الأول</option>
                    <option value="الفصل الثاني">الفصل الدراسي الثاني</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label htmlFor="modal-exam-period" style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'الفترة التقييمية' : 'Period'}</label>
                  <select id="modal-exam-period" name="period" value={modalExamPeriod} onChange={(e) => setModalExamPeriod(e.target.value)} className="text-field" style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}>
                    <option value="الشهر الأول">الشهر الأول</option>
                    <option value="الشهر الثاني">الشهر الثاني</option>
                    <option value="الشهر الثالث">الشهر الثالث</option>
                    <option value="اختبار نهاية الترم">اختبار نهاية الترم</option>
                  </select>
                </div>
              </div>

              {/* Multi-Section Selector (Create Mode Only) */}
              {!isEditing && (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(30, 80, 142, 0.04)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid rgba(30, 80, 142, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={15} style={{ color: 'var(--color-primary-ui)' }} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                        {lang === 'ar' ? 'الشعب المشمولة بالجدول:' : 'Sections included in schedule:'}
                      </span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'var(--color-primary-ui)', color: '#fff', fontWeight: '600' }}>
                        {selectedSectionIds.length} {lang === 'ar' ? 'شعب مختارة' : 'selected'}
                      </span>
                    </div>

                    {sectionsOfSelectedGrade.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedSectionIds.length === sectionsOfSelectedGrade.length) {
                            setSelectedSectionIds([sectionsOfSelectedGrade[0].numericId || Number(String(sectionsOfSelectedGrade[0].id).replace(/\D/g, ''))]);
                          } else {
                            setSelectedSectionIds(sectionsOfSelectedGrade.map(c => c.numericId || Number(String(c.id).replace(/\D/g, ''))));
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary-ui)',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {selectedSectionIds.length === sectionsOfSelectedGrade.length 
                          ? (lang === 'ar' ? 'إلغاء التحديد الجماعي' : 'Deselect all')
                          : (lang === 'ar' ? 'تحديد كافة شعب الصف' : 'Select all sections')}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                    {sectionsOfSelectedGrade.map(cls => {
                      const clsNumId = cls.numericId || Number(String(cls.id).replace(/\D/g, ''));
                      const isSelected = selectedSectionIds.includes(clsNumId);

                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (selectedSectionIds.length > 1) {
                                setSelectedSectionIds(prev => prev.filter(id => id !== clsNumId));
                              }
                            } else {
                              setSelectedSectionIds(prev => [...prev, clsNumId]);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: isSelected ? '700' : '500',
                            border: isSelected ? '1.5px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                            background: isSelected ? 'rgba(30, 80, 142, 0.1)' : 'var(--color-surface)',
                            color: isSelected ? 'var(--color-primary-ui)' : 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                          <span>{lang === 'ar' ? `شعبة (${cls.section})` : `Sec (${cls.sectionEn || cls.section})`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Exam Subject Sub-Form */}
              <div style={{
                padding: 'var(--space-md)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--color-primary-ui)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✍️ {t.addExamSubjectBtn}</span>
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                      <label htmlFor="modal-exam-sub-name" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.subjectLabel}</label>
                      <div style={{
                        display: 'inline-flex',
                        background: 'rgba(0, 0, 0, 0.05)',
                        padding: '2px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        gap: '2px'
                      }}>
                        <button
                          type="button"
                          onClick={() => setIsCustomSubject(false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: !isCustomSubject ? '700' : '500',
                            border: 'none',
                            background: !isCustomSubject ? '#ffffff' : 'transparent',
                            color: !isCustomSubject ? 'var(--color-primary-ui)' : 'var(--color-text-secondary)',
                            boxShadow: !isCustomSubject ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>📋 {lang === 'ar' ? 'من القائمة' : 'From List'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCustomSubject(true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: isCustomSubject ? '700' : '500',
                            border: 'none',
                            background: isCustomSubject ? '#ffffff' : 'transparent',
                            color: isCustomSubject ? 'var(--color-primary-ui)' : 'var(--color-text-secondary)',
                            boxShadow: isCustomSubject ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>✏️ {lang === 'ar' ? 'كتابة يدوية' : 'Custom'}</span>
                        </button>
                      </div>
                    </div>

                    {isCustomSubject ? (
                      <input
                        type="text"
                        placeholder={lang === 'ar' ? 'اكتب اسم المادة هنا (مثال: تلاوة، جبر وهندسة)...' : 'Type subject name...'}
                        value={modalCustomSubName}
                        onChange={(e) => setModalCustomSubName(e.target.value)}
                        className="text-field"
                        style={{ height: '36px', padding: '0 10px', fontSize: '11px', fontWeight: '600' }}
                        autoFocus
                      />
                    ) : (
                      <select 
                        id="modal-exam-sub-name" 
                        name="subjectName" 
                        value={modalExamSubName} 
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsCustomSubject(true);
                          } else {
                            setModalExamSubName(e.target.value);
                          }
                        }} 
                        className="text-field" 
                        style={{ height: '36px', padding: '0 10px', fontSize: '11px', fontWeight: '600' }}
                      >
                        {availableSubjectsForSelectedClass.map((subName, sIdx) => (
                          <option key={sIdx} value={subName}>
                            {subName}
                          </option>
                        ))}
                        <option value="__custom__" style={{ color: 'var(--color-primary-ui)', fontWeight: 'bold' }}>
                          {lang === 'ar' ? '✏️ + كتابة مادة أخرى يدوياً...' : '✏️ + Type other subject...'}
                        </option>
                      </select>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label htmlFor="modal-exam-sub-date" style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.examDateLabel}</label>
                    <input id="modal-exam-sub-date" name="examDate" type="date" value={modalExamSubDate} onChange={(e) => setModalExamSubDate(e.target.value)} className="text-field" style={{ height: '34px', padding: '0 8px', fontSize: '11px' }} />
                  </div>

                  {/* Visual System Time Slot Chips & Clock Picker Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary-ui)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        <span>{lang === 'ar' ? 'فترات الاختبارات المسجلة لدى الإدارة:' : 'Admin Exam Time Slots:'}</span>
                      </label>

                      {modalExamSubTime && (
                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-primary-ui)', background: 'rgba(30, 80, 142, 0.08)', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(30, 80, 142, 0.2)' }}>
                          ⏰ {modalExamSubTime}
                        </span>
                      )}
                    </div>

                    {/* Interactive System Time Slot Chips */}
                    {systemTimeSlots.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {systemTimeSlots.map((slot, idx) => {
                          const isSelected = modalExamSubTime === slot && !isCustomTime;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setIsCustomTime(false);
                                setModalExamSubTime(slot);
                              }}
                              style={{
                                fontSize: '11px',
                                fontWeight: isSelected ? '800' : '600',
                                padding: '4px 8px 4px 10px',
                                borderRadius: '20px',
                                border: isSelected ? '1.5px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                                backgroundColor: isSelected ? 'rgba(30, 80, 142, 0.12)' : 'var(--color-surface)',
                                color: isSelected ? 'var(--color-primary-ui)' : 'var(--color-text-primary)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: isSelected ? '0 2px 6px rgba(30, 80, 142, 0.15)' : 'none',
                                transition: 'all 0.15s ease-in-out'
                              }}
                            >
                              <Clock size={12} style={{ color: isSelected ? 'var(--color-primary-ui)' : 'var(--color-text-secondary)' }} />
                              <span>{slot}</span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteTimeSlot(slot, e)}
                                title={lang === 'ar' ? 'حذف هذا الوقت من القائمة' : 'Delete time slot'}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  fontSize: '15px',
                                  fontWeight: 'bold',
                                  lineHeight: '1',
                                  cursor: 'pointer',
                                  padding: '0 3px',
                                  borderRadius: '50%',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0.7,
                                  transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}

                        {/* Custom Time Toggle Chip */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomTime(!isCustomTime);
                            if (!isCustomTime && customStartTime && customEndTime) {
                              const formatted = formatTimeRange(customStartTime, customEndTime, lang);
                              if (formatted) setModalExamSubTime(formatted);
                            }
                          }}
                          style={{
                            fontSize: '11px',
                            fontWeight: isCustomTime ? '800' : '600',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            border: isCustomTime ? '1.5px solid #d97706' : '1px dashed var(--color-border)',
                            backgroundColor: isCustomTime ? 'rgba(217, 119, 6, 0.12)' : 'transparent',
                            color: isCustomTime ? '#b45309' : 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span>➕ {lang === 'ar' ? 'إضافة وقت جديد' : 'Add Custom Time'}</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{lang === 'ar' ? 'لا توجد فترات مسجلة حالياً، قم باختيار وقت جديد:' : 'No saved time slots found. Create a time:'}</span>
                        <button
                          type="button"
                          onClick={() => setIsCustomTime(true)}
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            border: '1px solid var(--color-primary-ui)',
                            backgroundColor: 'rgba(30, 80, 142, 0.08)',
                            color: 'var(--color-primary-ui)',
                            cursor: 'pointer'
                          }}
                        >
                          ➕ {lang === 'ar' ? 'إضافة وقت جديد' : 'Add Custom Time'}
                        </button>
                      </div>
                    )}

                    {/* Custom Clock Inputs when toggled */}
                    {isCustomTime && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'flex-end', padding: '8px 12px', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)', marginTop: '4px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label htmlFor="modal-exam-sub-time-start" style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'وقت البدء بالساعة ⏱️' : 'Start Time'}</label>
                          <input 
                            id="modal-exam-sub-time-start" 
                            name="startTime" 
                            type="time" 
                            value={customStartTime} 
                            onChange={(e) => {
                              setCustomStartTime(e.target.value);
                              const formatted = formatTimeRange(e.target.value, customEndTime, lang);
                              if (formatted) setModalExamSubTime(formatted);
                            }} 
                            className="text-field" 
                            style={{ height: '34px', padding: '0 8px', fontSize: '11px' }} 
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label htmlFor="modal-exam-sub-time-end" style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'وقت الانتهاء بالساعة ⏱️' : 'End Time'}</label>
                          <input 
                            id="modal-exam-sub-time-end" 
                            name="endTime" 
                            type="time" 
                            value={customEndTime} 
                            onChange={(e) => {
                              setCustomEndTime(e.target.value);
                              const formatted = formatTimeRange(customStartTime, e.target.value, lang);
                              if (formatted) setModalExamSubTime(formatted);
                            }} 
                            className="text-field" 
                            style={{ height: '34px', padding: '0 8px', fontSize: '11px' }} 
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const formatted = formatTimeRange(customStartTime, customEndTime, lang);
                            if (formatted && !systemTimeSlots.includes(formatted)) {
                              const updated = [...customTimeSlots, formatted];
                              setCustomTimeSlots(updated);
                              try {
                                localStorage.setItem('custom_exam_time_slots', JSON.stringify(updated));
                              } catch (err) {}
                            }
                            setIsCustomTime(false);
                          }}
                          style={{
                            height: '34px',
                            padding: '0 12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'var(--color-primary-ui)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {lang === 'ar' ? 'حفظ الوقت بالقائمة' : 'Save Time'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label htmlFor="modal-exam-sub-note" style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.examNoteLabel}</label>
                    <input id="modal-exam-sub-note" name="examNote" type="text" placeholder={lang === 'ar' ? 'المقرر...' : 'Topics...'} value={modalExamSubNote} onChange={(e) => setModalExamSubNote(e.target.value)} className="text-field" style={{ height: '34px', padding: '0 8px', fontSize: '11px' }} />
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-accent"
                  style={{ alignSelf: 'flex-end', height: '34px', minHeight: '34px', fontSize: '11px', padding: '0 14px', fontWeight: '700' }}
                  onClick={handleAddExamSubject}
                >
                  ＋ {lang === 'ar' ? 'إضافة المادة للجدول' : 'Add to Schedule'}
                </button>
              </div>

              {/* Added subjects preview list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong style={{ fontSize: '12px' }}>📝 {lang === 'ar' ? 'المواد المضافة حالياً في الجدول:' : 'Current subjects added:'}</strong>
                {modalExamSubjects.length > 0 ? (
                  <div className="students-table-container">
                    <table className="students-table">
                      <thead>
                        <tr>
                          <th>{t.subjectLabel}</th>
                          <th>{t.examDateLabel}</th>
                          <th>{t.examTimeLabel}</th>
                          <th>{t.examNoteLabel}</th>
                          <th>{t.action}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalExamSubjects.map((sub, sidx) => (
                          <tr key={sub.id || sidx}>
                            <td style={{ fontWeight: 'bold' }}>{sub.subjectName}</td>
                            <td>{sub.date}</td>
                            <td>{sub.time}</td>
                            <td>{sub.note}</td>
                            <td>
                              <button 
                                type="button"
                                className="btn-elevated"
                                style={{ color: 'var(--color-error)', borderColor: 'rgba(220, 38, 38, 0.2)', padding: '2px 8px', fontSize: '10px' }}
                                onClick={() => setModalExamSubjects(prev => prev.filter((_, idx) => idx !== sidx))}
                              >
                                {lang === 'ar' ? 'حذف' : 'Remove'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', fontStyle: 'italic', opacity: 0.6, textAlign: 'center', padding: '12px 0' }}>
                    {lang === 'ar' ? 'لا توجد مواد مضافة بعد.' : 'No subjects added to schedule yet.'}
                  </span>
                )}
              </div>

            </div>

            <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: 'var(--space-lg) var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
              <button 
                type="button" 
                className="btn-elevated"
                onClick={() => {
                  setShowExamScheduleModal(false);
                  setModalExamSubjects([]);
                }}
                disabled={isSaving}
              >
                {t.cancel}
              </button>
              <button 
                type="button" 
                className="btn-filled"
                onClick={handlePublishExamSchedule}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.7 : 1 }}
              >
                {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (isEditing ? (lang === 'ar' ? '💾 حفظ التغييرات' : '💾 Save Changes') : (lang === 'ar' ? '📢 نشر الجدول نهائياً' : '📢 Publish Timetable'))}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* QUICK COPY EXAM SCHEDULE MODAL */}
      {showCopyModal && copySourceSchedule && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <header className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Copy size={20} style={{ color: 'var(--color-primary-ui)' }} />
                <span>{lang === 'ar' ? 'نسخ جدول الاختبارات للشعب' : 'Copy Exam Schedule'}</span>
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowCopyModal(false);
                  setCopySourceSchedule(null);
                  setCopyTargetClassIds([]);
                }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {/* Source Info Banner */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(30, 80, 142, 0.05)',
                borderRadius: '10px',
                border: '1px solid rgba(30, 80, 142, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  {lang === 'ar' ? 'الجدول المصدر المراد نسخه:' : 'Source Schedule:'}
                </span>
                <strong style={{ fontSize: '13px', color: 'var(--color-primary-ui)' }}>
                  {copySourceSchedule.grade || copySourceSchedule.class?.grade_ar} - شعبة ({copySourceSchedule.section || copySourceSchedule.class?.section_ar})
                  {' • '}
                  {copySourceSchedule.period} ({copySourceSchedule.term})
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {lang === 'ar' ? `عدد المواد المجدولة: ${copySourceSchedule.subjects?.length || 0} مادة` : `${copySourceSchedule.subjects?.length || 0} subjects scheduled`}
                </span>
              </div>

              {/* Target Sections Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    {lang === 'ar' ? 'اختر الشعب المستهدفة لنفس الصف:' : 'Select Target Sections:'}
                  </label>

                  {/* Sibling classes computation */}
                  {(() => {
                    const schedGrade = copySourceSchedule.grade || copySourceSchedule.class?.grade_ar || copySourceSchedule.class?.grade;
                    const schedClassId = Number(String(copySourceSchedule.class_id || copySourceSchedule.classId || (copySourceSchedule.class && copySourceSchedule.class.id) || '').replace(/\D/g, ''));
                    const siblings = (classes || []).filter(c => {
                      const cId = c.numericId || Number(String(c.id).replace(/\D/g, ''));
                      return c.grade === schedGrade && cId !== schedClassId;
                    });

                    if (siblings.length <= 1) return null;

                    const allSelected = copyTargetClassIds.length === siblings.length;
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (allSelected) {
                            setCopyTargetClassIds([]);
                          } else {
                            setCopyTargetClassIds(siblings.map(c => c.numericId || Number(String(c.id).replace(/\D/g, ''))));
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary-ui)',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {allSelected ? (lang === 'ar' ? 'إلغاء التحديد' : 'Deselect all') : (lang === 'ar' ? 'تحديد كل الشعب' : 'Select all')}
                      </button>
                    );
                  })()}
                </div>

                {(() => {
                  const schedGrade = copySourceSchedule.grade || copySourceSchedule.class?.grade_ar || copySourceSchedule.class?.grade;
                  const schedClassId = Number(String(copySourceSchedule.class_id || copySourceSchedule.classId || (copySourceSchedule.class && copySourceSchedule.class.id) || '').replace(/\D/g, ''));
                  const siblings = (classes || []).filter(c => {
                    const cId = c.numericId || Number(String(c.id).replace(/\D/g, ''));
                    return c.grade === schedGrade && cId !== schedClassId;
                  });

                  if (siblings.length === 0) {
                    return (
                      <div style={{ padding: '24px 16px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'لا توجد شعب أخرى مسجلة لهذا الصف الدراسي.' : 'No other sections registered for this grade.'}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                      {siblings.map(cls => {
                        const clsNumId = cls.numericId || Number(String(cls.id).replace(/\D/g, ''));
                        const isSelected = copyTargetClassIds.includes(clsNumId);

                        return (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setCopyTargetClassIds(prev => prev.filter(id => id !== clsNumId));
                              } else {
                                setCopyTargetClassIds(prev => [...prev, clsNumId]);
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: isSelected ? '700' : '500',
                              border: isSelected ? '1.5px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                              background: isSelected ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface)',
                              color: isSelected ? 'var(--color-primary-ui)' : 'var(--color-text-primary)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            <span>{lang === 'ar' ? `شعبة (${cls.section})` : `Sec (${cls.sectionEn || cls.section})`}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: 'var(--space-md) var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
              <button 
                type="button" 
                className="btn-elevated"
                onClick={() => {
                  setShowCopyModal(false);
                  setCopySourceSchedule(null);
                  setCopyTargetClassIds([]);
                }}
                disabled={isCopying}
              >
                {t.cancel}
              </button>
              <button 
                type="button" 
                className="btn-filled"
                onClick={handleExecuteCopy}
                disabled={isCopying || copyTargetClassIds.length === 0}
                style={{ opacity: isCopying || copyTargetClassIds.length === 0 ? 0.7 : 1 }}
              >
                {isCopying ? (lang === 'ar' ? 'جاري النسخ والنشر...' : 'Copying...') : (lang === 'ar' ? '📑 نسخ ونشر للشعب المحددة' : 'Copy Schedule')}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Academic Exam Print Modal */}
      <AcademicExamPrintModal
        isOpen={showAcademicPrintModal}
        onClose={() => {
          setShowAcademicPrintModal(false);
          setPrintInitialSchedule(null);
        }}
        initialSchedule={printInitialSchedule}
        allSchedules={examSchedules}
        classes={classes}
        lang={lang}
      />
    </div>
  );
}
