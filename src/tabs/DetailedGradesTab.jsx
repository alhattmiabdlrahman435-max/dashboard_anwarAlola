import React from 'react';
import { useApp } from '../context/AppContext';
import '../styles/printGrades.css';

// Screen Views
import SubjectView from '../components/grades/SubjectView';
import MonthView from '../components/grades/MonthView';
import ClassView from '../components/grades/ClassView';

// Print Views
import PrintSubjectView from '../components/grades/PrintSubjectView';
import PrintTermView from '../components/grades/PrintTermView';
import PrintMonthView from '../components/grades/PrintMonthView';
import PrintClassView from '../components/grades/PrintClassView';

export default function DetailedGradesTab() {
  const {
    lang,
    t,
    students,
    selectedGradeStudentId,
    setSelectedGradeStudentId,
    selectedGradeTerm,
    setSelectedGradeTerm,
    selectedGradeSubject,
    setSelectedGradeSubject,
    setShowPrintModal
  } = useApp();

  // State for view controls
  const [viewMode, setViewMode] = React.useState('subject'); // 'subject', 'month', 'class'
  const [selectedMonth, setSelectedMonth] = React.useState('m1'); // 'm1', 'm2', 'm3'
  
  // Calculate unique classes list from students
  const classesList = Array.from(new Set(students.map(s => `${s.grade} - ${s.section}`))).sort();
  const [selectedClass, setSelectedClass] = React.useState(classesList[0] || '');
  const [classPeriod, setClassPeriod] = React.useState('m1'); // 'm1', 'm2', 'm3', 'termTotal', 'yearlyTotal'
  const [classSubject, setClassSubject] = React.useState('all'); // 'all', 'detailed', and subjects

  // Synchronize default class selector when students list changes
  React.useEffect(() => {
    if (classesList.length > 0 && !selectedClass) {
      setSelectedClass(classesList[0]);
    }
  }, [classesList, selectedClass]);

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
        {viewMode === 'class' ? (
          <button 
            className="btn-elevated"
            onClick={handlePrintClass}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            🖨️ {lang === 'ar' ? 'طباعة كشف درجات الفصل' : 'Print Class Grades'}
          </button>
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
            <select 
              value={selectedGradeStudentId}
              onChange={(e) => setSelectedGradeStudentId(Number(e.target.value))}
              className="text-field"
              style={{ height: '40px', padding: '0 12px' }}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{lang === 'ar' ? s.name : s.nameEn} ({s.id})</option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
              {lang === 'ar' ? 'اختر الفصل' : 'Select Class'}
            </label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-field"
              style={{ height: '40px', padding: '0 12px' }}
            >
              {classesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Selector 2: Term (Always visible) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.selectTerm}</label>
          <select 
            value={selectedGradeTerm}
            onChange={(e) => setSelectedGradeTerm(e.target.value)}
            className="text-field"
            style={{ height: '40px', padding: '0 12px' }}
          >
            <option value="term1">{t.term1Label}</option>
            <option value="term2">{t.term2Label}</option>
          </select>
        </div>

        {/* Dynamic selector 3: Subject or Month or Class Period */}
        {viewMode === 'subject' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.subjectLabel}</label>
            <select 
              value={selectedGradeSubject}
              onChange={(e) => setSelectedGradeSubject(e.target.value)}
              className="text-field"
              style={{ height: '40px', padding: '0 12px' }}
            >
              <option value="الرياضيات">{t.math}</option>
              <option value="العلوم">{t.science}</option>
              <option value="اللغة العربية">{t.arabic}</option>
              <option value="اللغة الإنجليزية">{t.english}</option>
            </select>
          </div>
        )}

        {viewMode === 'month' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
              {lang === 'ar' ? 'اختر الفترة / الشهر' : 'Select Period / Month'}
            </label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-field"
              style={{ height: '40px', padding: '0 12px' }}
            >
              <option value="m1">{t.m1Label}</option>
              <option value="m2">{t.m2Label}</option>
              <option value="m3">{t.m3Label}</option>
            </select>
          </div>
        )}

        {viewMode === 'class' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'الفترة التقييمية للفصل' : 'Class Evaluation Period'}
              </label>
              <select 
                value={classPeriod}
                onChange={(e) => setClassPeriod(e.target.value)}
                className="text-field"
                style={{ height: '40px', padding: '0 12px' }}
              >
                <option value="m1">{t.m1Label} (١٠٠)</option>
                <option value="m2">{t.m2Label} (١٠٠)</option>
                <option value="m3">{t.m3Label} (١٠٠)</option>
                <option value="termTotal">{lang === 'ar' ? 'مجموع الترم (٥٠)' : 'Term Total (50)'}</option>
                <option value="yearlyTotal">{lang === 'ar' ? 'المجموع السنوي (١٠٠)' : 'Yearly Total (100)'}</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'عرض المادة' : 'View Subject'}
              </label>
              <select 
                value={classSubject}
                onChange={(e) => setClassSubject(e.target.value)}
                className="text-field"
                style={{ height: '40px', padding: '0 12px' }}
              >
                <option value="all">{lang === 'ar' ? 'جميع المواد (إجمالي)' : 'All Subjects (Summary)'}</option>
                <option value="detailed">{lang === 'ar' ? 'جميع المواد (تفصيلي)' : 'All Subjects (Detailed)'}</option>
                <option value="الرياضيات">{t.math}</option>
                <option value="العلوم">{t.science}</option>
                <option value="اللغة العربية">{t.arabic}</option>
                <option value="اللغة الإنجليزية">{t.english}</option>
              </select>
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
