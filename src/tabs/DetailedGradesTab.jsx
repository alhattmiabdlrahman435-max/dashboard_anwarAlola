import { api } from "../services/api";
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useClasses } from '../contexts/Classes/useClasses';
import { useAllowedClasses } from '../hooks/useAllowedClasses';
import { useStudents } from '../contexts/Students/useStudents';
import { useSubjects } from '../contexts/Subjects/useSubjects';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import '../styles/printGrades.css';
import GradeReconciliationWizard from '../components/grades/GradeReconciliationWizard';
import GradesDirectPrintModal from '../components/grades/GradesDirectPrintModal';

// Screen Views
import SubjectView from '../components/grades/SubjectView';
import MonthView from '../components/grades/MonthView';
import ClassView from '../components/grades/ClassView';
import MonthlySheetsView from '../components/grades/MonthlySheetsView';
import { openElementPrintPreview } from '../utils/printPreview';
import TermTransferView from '../components/grades/TermTransferView';
import FinalResultsView from '../components/grades/FinalResultsView';
import SearchableSelect from '../components/SearchableSelect';

// Print Views
import PrintSubjectView from '../components/grades/PrintSubjectView';
import PrintTermView from '../components/grades/PrintTermView';
import PrintMonthView from '../components/grades/PrintMonthView';
import PrintClassView from '../components/grades/PrintClassView';

export default function DetailedGradesTab() {
  const {
    lang,
    t,
    setToastMessage,
    triggerConfirm,
    selectedGradeStudentId,
    setSelectedGradeStudentId,
    selectedGradeTerm,
    setSelectedGradeTerm,
    canAction,
    selectedGradeSubject,
    setSelectedGradeSubject,
    setShowPrintModal,
    detailedGrades,
    fetchClassGrades
  } = useApp();

  const { allowedClasses: classes } = useAllowedClasses('detailedGrades');
  const { fetchClasses } = useClasses();
  const { students, fetchStudents } = useStudents();
  const { subjects, fetchSubjects } = useSubjects();

  useEffect(() => {
    fetchClasses(true);
    fetchSubjects(true);
    fetchStudents('?per_page=1000');
  }, [fetchClasses, fetchSubjects, fetchStudents]);

  // State for view controls
  const [viewMode, setViewMode] = useState('class'); // Default to class view for admin reviews
  const [selectedMonth, setSelectedMonth] = useState('m1'); // 'm1', 'm2', 'm3'
  const [selectedCalendarMonthName, setSelectedCalendarMonthName] = useState('نوفمبر');
  const [initialPrintSubject, setInitialPrintSubject] = useState('all');
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showDirectPrintModal, setShowDirectPrintModal] = useState(false);
  const [initialPrintTemplate, setInitialPrintTemplate] = useState('template_1_blank_year');

  // Calculate unique classes list from classes master table (preserving school logical grade order)
  const classesList = classes.map(c => `${c.grade} - ${c.section}`);
  const [selectedClass, setSelectedClass] = useState(localStorage.getItem('goto_class') || classesList[0] || '');
  const [studentFilterClass, setStudentFilterClass] = useState('all');

  const filteredStudentsForPicker = useMemo(() => {
    if (!students || students.length === 0) return [];
    if (!studentFilterClass || studentFilterClass === 'all') return students;

    const targetClassObj = (classes || []).find(c =>
      c.name === studentFilterClass ||
      `${c.grade} - ${c.section}` === studentFilterClass ||
      `${c.grade_ar} - ${c.section_ar}` === studentFilterClass
    );
    const targetNumericId = targetClassObj
      ? String(targetClassObj.numericId || String(targetClassObj.id).replace(/\D/g, ''))
      : null;

    return students.filter(s => {
      if (targetNumericId && s.class_id != null && String(s.class_id) === targetNumericId) {
        return true;
      }
      return `${s.grade} - ${s.section}` === studentFilterClass;
    });
  }, [students, studentFilterClass, classes]);

  const selectedClassObj = (classes || []).find(c =>
    c.name === selectedClass ||
    `${c.grade} - ${c.section}` === selectedClass ||
    `${c.grade_ar} - ${c.section_ar}` === selectedClass ||
    c.id === selectedClass
  ) || (classes || [])[0];

  const selectedClassId = selectedClassObj
    ? (selectedClassObj.numericId || String(selectedClassObj.id).replace(/\D/g, ''))
    : null;
  const [classPeriod, setClassPeriod] = useState(localStorage.getItem('goto_period') || 'm1'); // 'm1', 'm2', 'm3', 'termTotal', 'yearlyTotal'
  const [classSubject, setClassSubject] = useState('all'); // 'all', 'detailed', and subjects

  // Listen for notification click events to jump straight to the correct ready grades page
  useEffect(() => {
    const handleGotoChange = () => {
      const cls = localStorage.getItem('goto_class');
      const period = localStorage.getItem('goto_period');
      const term = localStorage.getItem('goto_term');
      if (cls) {
        setSelectedClass(cls);
        localStorage.removeItem('goto_class');
      }
      if (period) {
        setClassPeriod(period);
        localStorage.removeItem('goto_period');
      }
      if (term) {
        setSelectedGradeTerm(term);
        localStorage.removeItem('goto_term');
      }
      setViewMode('class'); // Shift view mode to Class-level grades for editing and approval
    };
    window.addEventListener('goto_class_changed', handleGotoChange);
    
    // Check immediately on mount if there's a pending navigation
    if (localStorage.getItem('goto_class')) {
      handleGotoChange();
    }

    return () => window.removeEventListener('goto_class_changed', handleGotoChange);
  }, [setSelectedGradeTerm]);

  // Synchronize default class selector when students list changes
  useEffect(() => {
    if (classesList.length > 0 && !selectedClass) {
      setSelectedClass(classesList[0]);
    }
  }, [classesList, selectedClass]);

  // Synchronize default student selector when students list loads
  useEffect(() => {
    if (students && students.length > 0 && !selectedGradeStudentId) {
      setSelectedGradeStudentId(students[0].id);
    }
  }, [students, selectedGradeStudentId, setSelectedGradeStudentId]);

  // Auto-load grades from database when selected class changes (class-level view modes)
  useEffect(() => {
    if (!selectedClass || !['class', 'monthlySheet', 'termTransfer', 'finalResults'].includes(viewMode)) return;
    // Map class name back to numeric class ID
    const [grade, section] = selectedClass.split(' - ');
    const classObj = classes.find(c =>
      (c.grade === grade || c.gradeEn === grade) &&
      (c.section === section || c.sectionEn === section)
    );
    if (!classObj) return;
    const numericId = typeof classObj.id === 'string' && classObj.id.startsWith('cls-')
      ? classObj.id.replace('cls-', '')
      : classObj.id;
    fetchClassGrades(numericId);
  }, [selectedClass, viewMode, classes, fetchClassGrades]);

  const handlePublishGrades = () => {
    if (!selectedClass) return;
    
    triggerConfirm({
      title: lang === 'ar' ? 'اعتماد الدرجات' : 'Publish Grades',
      message: lang === 'ar' 
        ? `هل أنت متأكد من اعتماد درجات ${classPeriod === 'termTotal' ? 'الترم' : 'الشهر'} لجميع طلاب ${selectedClass} وإرسال إشعار لأولياء الأمور؟` 
        : `Are you sure you want to publish grades for this period?`,
      type: 'info',
      onConfirm: async () => {
        try {
          // Find classId
          const [grade, section] = selectedClass.split(' - ');
          const classObj = classes.find(c => (c.grade === grade || c.gradeEn === grade) && (c.section === section || c.sectionEn === section));
          
          if (!classObj) {
            setToastMessage(lang === 'ar' ? 'لم يتم العثور على الفصل' : 'Class not found');
            return;
          }

          const term = selectedGradeTerm === 'term2' ? '2' : '1';
          let monthVal = '0';
          if (classPeriod === 'm1') monthVal = '1';
          if (classPeriod === 'm2') monthVal = '2';
          if (classPeriod === 'm3') monthVal = '3';
          if (classPeriod === 'termTotal') monthVal = 'final';

          const numericClassId = typeof classObj.id === 'string' && classObj.id.startsWith('cls-')
            ? parseInt(classObj.id.replace('cls-', ''), 10)
            : classObj.id;

          const data = await api.post('/api/grades/publish-month', {
            class_id: numericClassId,
            term: term,
            month: monthVal
          });

          if (data.success) {
            setToastMessage(data.message || (lang === 'ar' ? 'تم الاعتماد بنجاح وإرسال الإشعارات لأولياء الأمور' : 'Published successfully'));
          } else {
            setToastMessage(data.message || (lang === 'ar' ? 'حدث خطأ أثناء الاعتماد' : 'Error publishing grades'));
          }
        } catch (error) {
          console.error(error);
          setToastMessage(lang === 'ar' ? 'حدث خطأ في الاتصال بالسيرفر' : 'Server connection error');
        }
      }
    });
  };

  const handleExportGrades = async () => {
    try {
      const res = await api.get('/api/grades/export');
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تصدير درجات الطلاب' : 'Failed to export student grades');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'grades_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic Print Handler supporting Class (landscape/portrait), Subject sheet, and Monthly sheet
  const handlePrint = (mode = viewMode) => {
    const printMode = mode === 'class' ? 'class' : (mode === 'month' ? 'month' : 'subject');
    const isLandscape = (printMode === 'class' && (classSubject === 'all' || classSubject === 'detailed'));
    // معاينة كاملة قبل الطباعة (مع التكبير) بدل الطباعة المباشرة
    const el = document.querySelector('.control-grade-table-container') || document.querySelector('main');
    openElementPrintPreview(el, {
      title: lang === 'ar' ? 'معاينة كشف الدرجات' : 'Grades sheet preview',
      landscape: isLandscape,
    });
  };

  return (
    <div className="section-card">
      {/* Header with Dynamic Print Button */}
      <div className="section-card-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px', margin: 0 }}>
          📊 {t.detailedGradesTitle}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const next = !document.body.classList.contains('freeze-columns');
              if (next) {
                document.body.classList.add('freeze-columns');
                localStorage.setItem('freeze_columns', '1');
              } else {
                document.body.classList.remove('freeze-columns');
                localStorage.setItem('freeze_columns', '0');
              }
              window.dispatchEvent(new CustomEvent('freeze_columns_changed', { detail: next }));
              setToastMessage(next ? '📌 تم تجميد عمود الأسماء' : 'تم إلغاء تجميد عمود الأسماء');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '38px',
              padding: '0 12px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📌 {lang === 'ar' ? 'تجميد / تحرير عمود الأسماء' : 'Freeze / Unfreeze Name Column'}
          </button>

          {/* Direct Print Templates Button (beside Import/Export as requested) */}
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (viewMode === 'month') {
                setInitialPrintTemplate('template_2_monthly_sheet');
              } else if (classPeriod === 'termTotal') {
                setInitialPrintTemplate('template_4_term_final');
              } else if (classPeriod === 'yearlyTotal') {
                setInitialPrintTemplate('template_5_direct_result');
              } else {
                setInitialPrintTemplate('template_1_blank_year');
              }
              setShowDirectPrintModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              color: 'white',
              border: 'none',
              padding: '0 14px',
              height: '38px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Printer size={16} />
            {lang === 'ar' ? 'معاينة وطباعة (كشوفات / نتائج / شهادات)' : 'Preview & Print (Sheets / Results / Certificates)'}
          </button>

          {/* Excel Import / Export Button */}
          <button 
            type="button"
            className="btn-primary"
            onClick={() => setShowExcelModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '0 14px',
              height: '38px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
            }}
          >
            <FileSpreadsheet size={16} />
            {lang === 'ar' ? 'استيراد / تصدير كشف الدرجات (Excel)' : 'Excel Grades (Import / Export)'}
          </button>

          {canAction('grades', 'export') && (
            <button 
              className="btn-secondary"
              onClick={handleExportGrades}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={16} />
              {lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </button>
          )}

          {viewMode === 'class' ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              {['m1', 'm2', 'm3', 'termTotal'].includes(classPeriod) && canAction('detailedGrades', 'publish', selectedClassId) && (
                <button
                  className="btn-primary"
                  onClick={handlePublishGrades}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--gradient-success)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✉️ {lang === 'ar' ? 'اعتماد وإرسال الدرجات' : 'Publish Grades'}
                </button>
              )}
              <button 
                className="btn-elevated"
                onClick={() => handlePrint('class')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {classSubject === 'all' 
                  ? (lang === 'ar' ? '🖨️ طباعة كشف المحصلة العام (A4 بالعرض)' : '🖨️ Print General Class Sheet (Landscape)')
                  : (lang === 'ar' ? `🖨️ طباعة كشف رصد مادة (${classSubject}) للمعلم` : `🖨️ Print Teacher Sheet (${classSubject})`)}
              </button>
            </div>
          ) : (
            <button 
              className="btn-elevated"
              onClick={() => handlePrint(viewMode)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {viewMode === 'subject'
                ? (lang === 'ar' ? `🖨️ طباعة كشف درجات (${selectedGradeSubject || 'المادة'})` : '🖨️ Print Subject Sheet')
                : (lang === 'ar' ? '🖨️ طباعة كشف درجات الشهر' : '🖨️ Print Monthly Sheet')}
            </button>
          )}
        </div>
      </div>

      {/* Segmented Control / View Mode Tabs */}
      <div className="no-print" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '4px',
        backgroundColor: 'var(--color-bg-container, #f1f5f9)',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid var(--color-border)'
      }}>
        <button
          onClick={() => setViewMode('subject')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewMode === 'subject' ? 'var(--color-surface, #ffffff)' : 'transparent',
            color: viewMode === 'subject' ? 'var(--color-primary, #1e3a8a)' : 'var(--color-text-secondary, #64748b)',
            fontWeight: 'bold',
            boxShadow: viewMode === 'subject' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📊 {lang === 'ar' ? 'تفصيل مادة لطالب' : 'Subject Details for Student'}
        </button>
        <button
          onClick={() => setViewMode('month')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewMode === 'month' ? 'var(--color-surface, #ffffff)' : 'transparent',
            color: viewMode === 'month' ? 'var(--color-primary, #1e3a8a)' : 'var(--color-text-secondary, #64748b)',
            fontWeight: 'bold',
            boxShadow: viewMode === 'month' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📅 {lang === 'ar' ? 'كافة المواد لشهر' : 'All Subjects for Month'}
        </button>
        <button
          onClick={() => setViewMode('class')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewMode === 'class' ? 'var(--color-surface, #ffffff)' : 'transparent',
            color: viewMode === 'class' ? 'var(--color-primary, #1e3a8a)' : 'var(--color-text-secondary, #64748b)',
            fontWeight: 'bold',
            boxShadow: viewMode === 'class' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🏫 {lang === 'ar' ? 'درجات طلاب الفصل' : 'Class Grade Sheet'}
        </button>
        <button
          onClick={() => setViewMode('monthlySheet')}
          style={{
            flex: 1,
            minWidth: '170px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewMode === 'monthlySheet' ? 'var(--color-surface, #ffffff)' : 'transparent',
            color: viewMode === 'monthlySheet' ? 'var(--color-primary, #1e3a8a)' : 'var(--color-text-secondary, #64748b)',
            fontWeight: 'bold',
            boxShadow: viewMode === 'monthlySheet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📝 {lang === 'ar' ? 'المحصلات الشهرية (للمعلم)' : 'Monthly Sheets'}
        </button>
        <button
          onClick={() => setViewMode('termTransfer')}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewMode === 'termTransfer' ? 'var(--color-surface, #ffffff)' : 'transparent',
            color: viewMode === 'termTransfer' ? 'var(--color-primary, #1e3a8a)' : 'var(--color-text-secondary, #64748b)',
            fontWeight: 'bold',
            boxShadow: viewMode === 'termTransfer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🔄 {lang === 'ar' ? 'ترحيل المحصلات والاختبارات' : 'Coursework & Exams'}
        </button>
        <button
          onClick={() => setViewMode('finalResults')}
          style={{
            flex: 1,
            minWidth: '170px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewMode === 'finalResults' ? 'var(--color-surface, #ffffff)' : 'transparent',
            color: viewMode === 'finalResults' ? 'var(--color-primary, #1e3a8a)' : 'var(--color-text-secondary, #64748b)',
            fontWeight: 'bold',
            boxShadow: viewMode === 'finalResults' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🏆 {lang === 'ar' ? 'النتائج النهائية والأوائل' : 'Final Results & Ranks'}
        </button>
      </div>

      {/* Dynamic Selection Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        marginBottom: '20px'
      }} className="no-print">
        
        {/* Dynamic selector 1: Student (with Class Filter + Search) or Class */}
        {['subject', 'month'].includes(viewMode) ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'تصفية حسب الفصل' : 'Filter by Class'}
              </label>
              <div style={{ position: 'relative', zIndex: 11 }}>
                <SearchableSelect
                  options={[
                    { value: 'all', label: lang === 'ar' ? 'جميع الفصول' : 'All Classes' },
                    ...classesList.map(c => ({ value: c, label: c }))
                  ]}
                  value={studentFilterClass}
                  onChange={(val) => {
                    const nextClass = val || 'all';
                    setStudentFilterClass(nextClass);
                    if (nextClass !== 'all' && students && students.length > 0) {
                      const targetClassObj = (classes || []).find(c =>
                        c.name === nextClass ||
                        `${c.grade} - ${c.section}` === nextClass ||
                        `${c.grade_ar} - ${c.section_ar}` === nextClass
                      );
                      const targetNumericId = targetClassObj
                        ? String(targetClassObj.numericId || String(targetClassObj.id).replace(/\D/g, ''))
                        : null;
                      const inClass = students.filter(s =>
                        (targetNumericId && s.class_id != null && String(s.class_id) === targetNumericId) ||
                        `${s.grade} - ${s.section}` === nextClass
                      );
                      if (inClass.length > 0 && !inClass.some(s => s.id === selectedGradeStudentId)) {
                        setSelectedGradeStudentId(inClass[0].id);
                      }
                    }
                  }}
                  placeholder={lang === 'ar' ? 'جميع الفصول' : 'All Classes'}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'اختر الطالب (بحث بالاسم أو الرقم)' : 'Select Student (Search)'}
              </label>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <SearchableSelect
                  options={filteredStudentsForPicker.map(s => ({
                    value: s.id,
                    label: studentFilterClass === 'all'
                      ? `${lang === 'ar' ? s.name : (s.nameEn || s.name)} — ${s.grade || ''} ${s.section || ''} (${s.id})`
                      : `${lang === 'ar' ? s.name : (s.nameEn || s.name)} (${s.id})`
                  }))}
                  value={selectedGradeStudentId}
                  onChange={(val) => {
                    if (val != null) setSelectedGradeStudentId(Number(val));
                  }}
                  placeholder={lang === 'ar' ? 'ابحث باسم الطالب أو رقمه...' : 'Search student name or ID...'}
                />
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
              {lang === 'ar' ? 'اختر الفصل' : 'Select Class'}
            </label>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <SearchableSelect
                options={classesList.map(c => ({ value: c, label: c }))}
                value={selectedClass}
                onChange={(val) => setSelectedClass(val)}
                placeholder={lang === 'ar' ? 'اختر الفصل' : 'Select Class'}
              />
            </div>
          </div>
        )}

        {/* Selector 2: Term (Always visible) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.selectTerm}</label>
          <div style={{ position: 'relative', zIndex: 9 }}>
            <SearchableSelect
              options={[
                { value: 'term1', label: t.term1Label },
                { value: 'term2', label: t.term2Label }
              ]}
              value={selectedGradeTerm}
              onChange={(val) => setSelectedGradeTerm(val)}
              placeholder={t.selectTerm}
            />
          </div>
        </div>

        {/* Dynamic selector 3: Subject or Month or Class Period */}
        {viewMode === 'subject' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.subjectLabel}</label>
            <div style={{ position: 'relative', zIndex: 8 }}>
              <SearchableSelect
                options={subjects && subjects.length > 0 
                  ? subjects.map(s => ({
                      value: s.name,
                      label: lang === 'ar' ? s.name : (s.nameEn || s.name)
                    }))
                  : [
                      { value: 'الرياضيات', label: t.math },
                      { value: 'العلوم', label: t.science },
                      { value: 'لغتي', label: t.arabic },
                      { value: 'اللغة الإنجليزية', label: t.english }
                    ]
                }
                value={selectedGradeSubject}
                onChange={(val) => setSelectedGradeSubject(val)}
                placeholder={t.subjectLabel}
              />
            </div>
          </div>
        )}

        {viewMode === 'month' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
              {lang === 'ar' ? 'اختر الفترة / الشهر' : 'Select Period / Month'}
            </label>
            <div style={{ position: 'relative', zIndex: 8 }}>
              <SearchableSelect
                options={[
                  { value: 'm1', label: t.m1Label },
                  { value: 'm2', label: t.m2Label },
                  { value: 'm3', label: t.m3Label }
                ]}
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val)}
                placeholder={lang === 'ar' ? 'اختر الفترة / الشهر' : 'Select Period / Month'}
              />
            </div>
          </div>
        )}

        {(viewMode === 'month' || viewMode === 'subject') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
              {lang === 'ar' ? 'اسم الشهر' : 'Month Name'}
            </label>
            <div style={{ position: 'relative', zIndex: 7 }}>
              <SearchableSelect
                options={['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'].map((m) => ({
                  value: m,
                  label: m,
                }))}
                value={selectedCalendarMonthName}
                onChange={(val) => setSelectedCalendarMonthName(val)}
                placeholder={lang === 'ar' ? 'اختر اسم الشهر' : 'Select Month Name'}
              />
            </div>
          </div>
        )}

        {(viewMode === 'monthlySheet' || viewMode === 'termTransfer') && (
          <>
            {viewMode === 'monthlySheet' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                  {lang === 'ar' ? 'المحصلة / الشهر' : 'Month'}
                </label>
                <div style={{ position: 'relative', zIndex: 8 }}>
                  <SearchableSelect
                    options={[
                      { value: 'm1', label: t.m1Label || 'المحصلة الأولى' },
                      { value: 'm2', label: t.m2Label || 'المحصلة الثانية' },
                      { value: 'm3', label: t.m3Label || 'المحصلة الثالثة' },
                    ]}
                    value={selectedMonth}
                    onChange={(val) => setSelectedMonth(val)}
                    placeholder={lang === 'ar' ? 'اختر الشهر' : 'Select Month'}
                  />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'المادة الدراسية' : 'Subject'}
              </label>
              <div style={{ position: 'relative', zIndex: 7 }}>
                <SearchableSelect
                  options={(subjects || []).map((s) => {
                    const sName = s.name || s.name_ar;
                    return { value: sName, label: lang === 'ar' ? sName : (s.nameEn || sName) };
                  })}
                  value={classSubject === 'all' || classSubject === 'detailed' ? ((subjects?.[0]?.name || subjects?.[0]?.name_ar) || '') : classSubject}
                  onChange={(val) => setClassSubject(val)}
                  placeholder={lang === 'ar' ? 'اختر المادة' : 'Select Subject'}
                />
              </div>
            </div>
          </>
        )}

        {viewMode === 'class' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'المحصلة / الفترة التقييمية' : 'Assessment Period'}
              </label>
              <div style={{ position: 'relative', zIndex: 8 }}>
                <SearchableSelect
                  options={[
                    { value: 'm1', label: `${t.m1Label} (١٠٠)` },
                    { value: 'm2', label: `${t.m2Label} (١٠٠)` },
                    { value: 'm3', label: `${t.m3Label} (١٠٠)` },
                    { value: 'termTotal', label: lang === 'ar' ? 'مجموع الترم (٥٠)' : 'Term Total (50)' },
                    { value: 'yearlyTotal', label: lang === 'ar' ? 'المجموع السنوي (١٠٠)' : 'Yearly Total (100)' }
                  ]}
                  value={classPeriod}
                  onChange={(val) => setClassPeriod(val)}
                  placeholder={lang === 'ar' ? 'اختر المحصلة' : 'Select Period'}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'نوع الكشف / المادة' : 'Sheet Type / Subject'}
              </label>
              <div style={{ position: 'relative', zIndex: 7 }}>
                {(() => {
                  const selectedClassObj = classes.find(c => `${c.grade} - ${c.section}` === selectedClass || c.name === selectedClass);
                  const realClassSubjects = selectedClassObj && Array.isArray(selectedClassObj.subjects)
                    ? selectedClassObj.subjects
                    : [];

                  const classSubjectOptions = [
                    { value: 'all', label: lang === 'ar' ? '📊 كشف المحصلة العام للفصل (جميع المواد)' : '📊 General Class Assessment (All Subjects)' },
                    { value: 'detailed', label: lang === 'ar' ? '📋 جميع المواد (رصد تفصيلي مجمع)' : '📋 All Subjects (Detailed Grid)' },
                    ...realClassSubjects.map(subj => ({
                      value: subj,
                      label: lang === 'ar' ? `📝 كشف رصد مادة: ${subj} (للمعلم)` : `📝 Teacher Sheet: ${subj}`
                    }))
                  ];

                  return (
                    <SearchableSelect
                      options={classSubjectOptions}
                      value={classSubject}
                      onChange={(val) => setClassSubject(val)}
                      placeholder={lang === 'ar' ? 'اختر نوع الكشف أو المادة' : 'Select Sheet or Subject'}
                    />
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Grading Grid Sheet Container */}
      <div style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', minWidth: 0, width: '100%', maxWidth: '100%' }}>

          {/* ==================== SCREEN UI ORCHESTRATION ==================== */}
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', minWidth: 0, width: '100%', maxWidth: '100%' }}>
            {viewMode === 'subject' && <SubjectView />}
            {viewMode === 'month' && <MonthView selectedMonth={selectedMonth} />}
            {viewMode === 'class' && (
              <ClassView 
                selectedClass={selectedClass} 
                classPeriod={classPeriod} 
                classSubject={classSubject} 
              />
            )}
            {viewMode === 'monthlySheet' && (
              <MonthlySheetsView
                selectedClass={selectedClass}
                selectedMonth={selectedMonth}
                selectedSubject={classSubject}
                calendarMonthName={selectedCalendarMonthName}
                onChangeCalendarMonthName={setSelectedCalendarMonthName}
                onPrintSheet={(opts) => {
                  setInitialPrintTemplate(opts?.template || 'template_2_monthly_sheet');
                  setInitialPrintSubject(opts?.subjectName || 'all');
                  if (opts?.calendarMonthName) setSelectedCalendarMonthName(opts.calendarMonthName);
                  setShowDirectPrintModal(true);
                }}
              />
            )}
            {viewMode === 'termTransfer' && (
              <TermTransferView
                selectedClass={selectedClass}
                selectedSubject={classSubject}
              />
            )}
            {viewMode === 'finalResults' && (
              <FinalResultsView
                selectedClass={selectedClass}
                onPrintResults={() => {
                  setInitialPrintTemplate('template_4_term_final');
                  setShowDirectPrintModal(true);
                }}
              />
            )}
          </div>

          {/* ==================== PRINT UI ORCHESTRATION ==================== */}
          <PrintSubjectView />
          <PrintTermView />
          <PrintMonthView selectedMonth={selectedMonth} />
          <PrintClassView 
            selectedClass={selectedClass} 
            classPeriod={classPeriod} 
            classSubject={classSubject} 
          />

        </div>
      </div>

      {/* Direct Print Ready Templates Modal (6 Official Templates) */}
      <GradesDirectPrintModal
        isOpen={showDirectPrintModal}
        onClose={() => setShowDirectPrintModal(false)}
        lang={lang}
        classes={classes}
        students={students}
        subjects={subjects}
        selectedClass={selectedClass}
        selectedGradeTerm={selectedGradeTerm}
        selectedMonth={viewMode === 'month' || viewMode === 'monthlySheet' ? selectedMonth : (['m1', 'm2', 'm3'].includes(classPeriod) ? classPeriod : 'm1')}
        selectedGradeStudentId={selectedGradeStudentId}
        detailedGrades={detailedGrades}
        fetchClassGrades={fetchClassGrades}
        initialTemplate={initialPrintTemplate}
        initialMonthName={selectedCalendarMonthName}
        initialSubjectMode={initialPrintSubject}
      />

      {/* Modern Data Mapping & Reconciliation Wizard */}
      {showExcelModal && (
        <GradeReconciliationWizard
          isOpen={showExcelModal}
          onClose={() => setShowExcelModal(false)}
          selectedClassId={selectedClassId}
          selectedClassName={selectedClassObj ? `${selectedClassObj.grade || selectedClassObj.grade_ar || ''} - ${selectedClassObj.section || selectedClassObj.section_ar || ''}` : selectedClass}
          selectedTerm={selectedGradeTerm}
          lang={lang}
          onImportSuccess={() => {
            if (selectedClassId) {
              fetchClassGrades(selectedClassId, selectedGradeTerm);
            }
            setToastMessage(lang === 'ar' ? 'تم استيراد وحفظ الدرجات بنجاح وتحديث العرض' : 'Grades successfully imported and updated');
          }}
        />
      )}
    </div>
  );
}
