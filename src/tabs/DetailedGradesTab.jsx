import { api } from "../services/api";
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useClasses } from '../contexts/Classes/useClasses';
import { useStudents } from '../contexts/Students/useStudents';
import { useSubjects } from '../contexts/Subjects/useSubjects';
import { Download } from 'lucide-react';
import '../styles/printGrades.css';

// Screen Views
import SubjectView from '../components/grades/SubjectView';
import MonthView from '../components/grades/MonthView';
import ClassView from '../components/grades/ClassView';
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
    fetchClassGrades
  } = useApp();

  const { classes, fetchClasses } = useClasses();
  const { students, fetchStudents } = useStudents();
  const { fetchSubjects } = useSubjects();

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [fetchClasses, fetchSubjects]);

  // State for view controls
  const [viewMode, setViewMode] = useState('class'); // Default to class view for admin reviews
  const [selectedMonth, setSelectedMonth] = useState('m1'); // 'm1', 'm2', 'm3'

  useEffect(() => {
    if (viewMode !== 'class') {
      fetchStudents('?per_page=100');
    }
  }, [viewMode, fetchStudents]);
  
  // Calculate unique classes list from classes master table
  const classesList = classes.map(c => `${c.grade} - ${c.section}`).sort();
  const [selectedClass, setSelectedClass] = useState(localStorage.getItem('goto_class') || classesList[0] || '');
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedClass(classesList[0]);
    }
  }, [classesList, selectedClass]);

  // Auto-load grades from database when selected class changes (class view mode)
  useEffect(() => {
    if (!selectedClass || viewMode !== 'class') return;
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

  // Handler for class report print
  const handlePrintClass = () => {
    document.body.setAttribute('data-print-mode', 'class');
    setTimeout(() => {
      window.print();
      const afterPrintCleanup = () => {
        document.body.removeAttribute('data-print-mode');
      };
      window.addEventListener('afterprint', afterPrintCleanup, { once: true });
    }, 150);
  };

  return (
    <div className="section-card">
      {/* Header with Dynamic Print Button */}
      <div className="section-card-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px', margin: 0 }}>
          📊 {t.detailedGradesTitle}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {canAction('grades', 'export') && (
            <button 
              className="btn-secondary"
              onClick={handleExportGrades}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={16} />
              {lang === 'ar' ? 'تصدير الدرجات' : 'Export Grades'}
            </button>
          )}
          {viewMode === 'class' ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              {['m1', 'm2', 'm3', 'termTotal'].includes(classPeriod) && canAction('detailedGrades', 'publish') && (
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
                onClick={handlePrintClass}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                🖨️ {lang === 'ar' ? 'طباعة كشف درجات الفصل' : 'Print Class Grades'}
              </button>
            </div>
          ) : (
            <button 
              className="btn-elevated"
              onClick={() => setShowPrintModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              🖨️ {lang === 'ar' ? 'طباعة كشف الدرجات' : 'Print Report Card'}
            </button>
          )}
        </div>
      </div>

      {/* Segmented Control / View Mode Tabs */}
      <div className="no-print" style={{
        display: 'flex',
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
        
        {/* Dynamic selector 1: Student or Class */}
        {viewMode !== 'class' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.selectStudent}</label>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <SearchableSelect
                options={students.map(s => ({ value: s.id, label: `${lang === 'ar' ? s.name : s.nameEn} (${s.id})` }))}
                value={selectedGradeStudentId}
                onChange={(val) => setSelectedGradeStudentId(Number(val))}
                placeholder={t.selectStudent}
              />
            </div>
          </div>
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
                options={[
                  { value: 'الرياضيات', label: t.math },
                  { value: 'العلوم', label: t.science },
                  { value: 'اللغة العربية', label: t.arabic },
                  { value: 'اللغة الإنجليزية', label: t.english }
                ]}
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

        {viewMode === 'class' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'الفترة التقييمية للفصل' : 'Class Evaluation Period'}
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
                  placeholder={lang === 'ar' ? 'الفترة التقييمية للفصل' : 'Class Evaluation Period'}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'عرض المادة' : 'View Subject'}
              </label>
              <div style={{ position: 'relative', zIndex: 7 }}>
                <SearchableSelect
                  options={[
                    { value: 'all', label: lang === 'ar' ? 'جميع المواد (إجمالي)' : 'All Subjects (Summary)' },
                    { value: 'detailed', label: lang === 'ar' ? 'جميع المواد (تفصيلي)' : 'All Subjects (Detailed)' },
                    { value: 'الرياضيات', label: t.math },
                    { value: 'العلوم', label: t.science },
                    { value: 'اللغة العربية', label: t.arabic },
                    { value: 'اللغة الإنجليزية', label: t.english }
                  ]}
                  value={classSubject}
                  onChange={(val) => setClassSubject(val)}
                  placeholder={lang === 'ar' ? 'عرض المادة' : 'View Subject'}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Grading Grid Sheet Container */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

          {/* ==================== SCREEN UI ORCHESTRATION ==================== */}
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {viewMode === 'subject' && <SubjectView />}
            {viewMode === 'month' && <MonthView selectedMonth={selectedMonth} />}
            {viewMode === 'class' && (
              <ClassView 
                selectedClass={selectedClass} 
                classPeriod={classPeriod} 
                classSubject={classSubject} 
              />
            )}
          </div>

          {/* ==================== PRINT UI ORCHESTRATION ==================== */}
          <PrintSubjectView />
          <PrintTermView />
          <PrintMonthView />
          <PrintClassView 
            selectedClass={selectedClass} 
            classPeriod={classPeriod} 
            classSubject={classSubject} 
          />

        </div>
      </div>
    </div>
  );
}
