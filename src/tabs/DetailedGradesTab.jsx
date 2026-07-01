import React from 'react';
import { useApp } from '../context/AppContext';
import PrintHeader from '../components/PrintHeader';

const defaultDetailedGradeObj = (hw, att, beh, oral, wrt, final) => ({
  m1: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  m2: { homework: Math.max(0, hw - 1), attendance: att, behavior: beh, oral: Math.max(0, oral - 1), written: Math.max(0, wrt - 2) },
  m3: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  finalExam: final
});

export default function DetailedGradesTab() {
  const {
    lang,
    t,
    students,
    detailedGrades,
    getStudentDetailedGrades,
    handleDetailedGradeChange,
    syncGeneralGrades,
    setToastMessage,
    selectedGradeStudentId,
    setSelectedGradeStudentId,
    selectedGradeTerm,
    setSelectedGradeTerm,
    selectedGradeSubject,
    setSelectedGradeSubject,
    setShowPrintModal,
    printSelectedMonth
  } = useApp();

  // State for new views
  const [viewMode, setViewMode] = React.useState('subject'); // 'subject', 'month', 'class'
  const [selectedMonth, setSelectedMonth] = React.useState('m1'); // 'm1', 'm2', 'm3'
  
  // Calculate unique classes list from students
  const classesList = Array.from(new Set(students.map(s => `${s.grade} - ${s.section}`))).sort();
  const [selectedClass, setSelectedClass] = React.useState(classesList[0] || '');
  const [classPeriod, setClassPeriod] = React.useState('m1'); // 'm1', 'm2', 'm3', 'termTotal', 'yearlyTotal'
  const [classSubject, setClassSubject] = React.useState('all'); // 'all', 'الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'

  const student = students.find(s => s.id === selectedGradeStudentId);
  const gradesData = getStudentDetailedGrades(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm);

  // Month totals
  const calculateMonthTotal = (monthObj) => {
    return (monthObj.homework || 0) + (monthObj.attendance || 0) + (monthObj.behavior || 0) + (monthObj.oral || 0) + (monthObj.written || 0);
  };

  const m1_total = calculateMonthTotal(gradesData.m1);
  const m2_total = calculateMonthTotal(gradesData.m2);
  const m3_total = calculateMonthTotal(gradesData.m3);
  
  // Outcome calculation (Term Average out of 20)
  const monthsAverage = parseFloat(((m1_total + m2_total + m3_total) / 15).toFixed(2));
  const termTotal = parseFloat((monthsAverage + (gradesData.finalExam || 0)).toFixed(2));

  // Get grade for a specific subject, term, and period
  const getSubjectPeriodGrade = (studentId, subject, term, period) => {
    const data = getStudentDetailedGrades(studentId, subject, term);
    if (period === 'm1' || period === 'm2' || period === 'm3') {
      const monthObj = data[period] || {};
      return (monthObj.homework || 0) + (monthObj.attendance || 0) + (monthObj.behavior || 0) + (monthObj.oral || 0) + (monthObj.written || 0);
    } else if (period === 'termTotal') {
      const m1_tot = calculateMonthTotal(data.m1);
      const m2_tot = calculateMonthTotal(data.m2);
      const m3_tot = calculateMonthTotal(data.m3);
      const avg = parseFloat(((m1_tot + m2_tot + m3_tot) / 15).toFixed(2));
      return parseFloat((avg + (data.finalExam || 0)).toFixed(2));
    } else if (period === 'yearlyTotal') {
      // Term 1 Total
      const d1 = getStudentDetailedGrades(studentId, subject, 'term1');
      const t1_tot = calculateMonthTotal(d1.m1) + calculateMonthTotal(d1.m2) + calculateMonthTotal(d1.m3);
      const t1_avg = parseFloat((t1_tot / 15).toFixed(2));
      const t1_final = t1_avg + d1.finalExam;
      
      // Term 2 Total
      const d2 = getStudentDetailedGrades(studentId, subject, 'term2');
      const t2_tot = calculateMonthTotal(d2.m1) + calculateMonthTotal(d2.m2) + calculateMonthTotal(d2.m3);
      const t2_avg = parseFloat((t2_tot / 15).toFixed(2));
      const t2_final = t2_avg + d2.finalExam;

      return Math.round(t1_final + t2_final);
    }
    return 0;
  };

  // Helper to calculate class row totals/percentages
  const calculateStudentClassRowTotal = (mathVal, scienceVal, arabicVal, englishVal, period) => {
    const sum = mathVal + scienceVal + arabicVal + englishVal;
    if (period === 'm1' || period === 'm2' || period === 'm3') {
      const percentage = parseFloat((sum / 4).toFixed(2));
      return { val: percentage, text: `${percentage}% (${sum} / 400)` };
    } else if (period === 'termTotal') {
      const percentage = parseFloat((sum / 2).toFixed(2));
      return { val: percentage, text: `${percentage}% (${sum} / 200)` };
    } else if (period === 'yearlyTotal') {
      const percentage = parseFloat((sum / 4).toFixed(2));
      return { val: percentage, text: `${percentage}% (${sum} / 400)` };
    }
    return { val: 0, text: '0' };
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

      {/* Grading Grid Sheet */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Print-only Page Style Setup */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page {
                size: portrait;
                margin: 1.5cm;
              }
              body {
                background: #ffffff !important;
                color: #000000 !important;
              }
              .section-card {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                background: transparent !important;
              }
              .control-grade-table th {
                background-color: #f8fafc !important;
                color: #0f172a !important;
                border-bottom: 2px solid #0f172a !important;
                font-weight: bold !important;
              }
              .control-grade-table td, .control-grade-table th {
                border-color: #cbd5e1 !important;
                padding: 10px !important;
                font-size: 11px !important;
              }
              .print-only-grade-value {
                display: inline !important;
                font-weight: bold !important;
              }
              .printable-only-header,
              .printable-only-metadata,
              .printable-only-signatures {
                display: flex !important;
              }
              
              /* Dynamic controls based on data-print-mode */
              body[data-print-mode="subject"] .print-subject-only-content {
                display: block !important;
              }
              body[data-print-mode="class"] .print-class-report {
                display: block !important;
                visibility: visible !important;
              }
              body[data-print-mode="class"] .print-class-report * {
                visibility: visible !important;
              }
              body[data-print-mode="class"] .print-subject-only-content,
              body[data-print-mode="class"] .print-term-full-report,
              body[data-print-mode="class"] .print-month-full-report,
              body[data-print-mode="class"] .no-print,
              body[data-print-mode="class"] .section-card-header,
              body[data-print-mode="class"] .sidebar,
              body[data-print-mode="class"] .navbar {
                display: none !important;
              }
            }
          `}} />

          {/* ==================== SCREEN ONLY UI ==================== */}
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            
            {/* SCREEN VIEW A: SUBJECT DETAILS */}
            {viewMode === 'subject' && (
              <>
                <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-primary-ui)', color: '#ffffff', borderRadius: 'var(--radius-card)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <strong>{lang === 'ar' ? student?.name : student?.nameEn}</strong>
                    <span style={{ marginInlineStart: '12px', opacity: 0.8, fontSize: '13px' }}>
                      ({lang === 'ar' ? student?.grade : student?.gradeEn} - {student?.section})
                    </span>
                  </div>
                  <div>
                    <strong>{t.subjectLabel}: </strong>
                    <span>{selectedGradeSubject}</span>
                  </div>
                </div>

                <div className="control-grade-table-container">
                  <table className="control-grade-table">
                    <thead>
                      <tr>
                        <th>{lang === 'ar' ? 'الفترة التقييمية' : 'Evaluation Period'}</th>
                        <th>{t.hwLabel}</th>
                        <th>{t.attLabel}</th>
                        <th>{t.behLabel}</th>
                        <th>{t.oralLabel}</th>
                        <th>{t.wrtLabel}</th>
                        <th>{t.monthTotalLabel} (100)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Month 1 */}
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>{t.m1Label}</td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="15" 
                            value={gradesData.m1.homework}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'homework', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="15" 
                            value={gradesData.m1.attendance}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'attendance', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="10" 
                            value={gradesData.m1.behavior}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'behavior', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="10" 
                            value={gradesData.m1.oral}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'oral', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="50" 
                            value={gradesData.m1.written}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'written', e.target.value)}
                          />
                        </td>
                        <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m1_total}</td>
                      </tr>
                      
                      {/* Month 2 */}
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>{t.m2Label}</td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="15" 
                            value={gradesData.m2.homework}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'homework', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="15" 
                            value={gradesData.m2.attendance}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'attendance', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="10" 
                            value={gradesData.m2.behavior}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'behavior', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="10" 
                            value={gradesData.m2.oral}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'oral', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="50" 
                            value={gradesData.m2.written}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'written', e.target.value)}
                          />
                        </td>
                        <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m2_total}</td>
                      </tr>

                      {/* Month 3 */}
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>{t.m3Label}</td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="15" 
                            value={gradesData.m3.homework}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'homework', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="15" 
                            value={gradesData.m3.attendance}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'attendance', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="10" 
                            value={gradesData.m3.behavior}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'behavior', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="10" 
                            value={gradesData.m3.oral}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'oral', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="grades-input" min="0" max="50" 
                            value={gradesData.m3.written}
                            onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'written', e.target.value)}
                          />
                        </td>
                        <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m3_total}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Calculations Panel */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 'var(--space-lg)',
                  marginTop: 'var(--space-md)'
                }}>
                  {/* Term Average */}
                  <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                      📈 {t.termAverageLabel}
                    </span>
                    <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-primary)', marginTop: '8px' }}>
                      {monthsAverage} / 20
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? '(مجموع الـ ٣ أشهر مقسوماً على ١٥)' : '(Total of 3 months divided by 15)'}
                    </span>
                  </div>

                  {/* Final Exam Grade */}
                  <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                      📝 {t.finalExamLabel}
                    </span>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        className="grades-input" 
                        style={{ width: '100px', fontSize: '20px', height: '46px', textAlign: 'center', fontWeight: 'bold' }} 
                        min="0" max="30"
                        value={gradesData.finalExam}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'finalExam', '', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Total Term Grade */}
                  <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                      🏆 {t.termTotalLabel}
                    </span>
                    <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-success)', marginTop: '8px' }}>
                      {termTotal} / 50
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? '(المحصلة + درجة النهائي)' : '(Avg + Final Exam score)'}
                    </span>
                  </div>

                  {/* Yearly Total Grade */}
                  {(() => {
                    const record = detailedGrades.find(r => r.studentId === selectedGradeStudentId);
                    if (!record) return null;
                    
                    const t1 = record.grades.term1[selectedGradeSubject] || defaultDetailedGradeObj(0,0,0,0,0,0);
                    const t1_tot = calculateMonthTotal(t1.m1) + calculateMonthTotal(t1.m2) + calculateMonthTotal(t1.m3);
                    const t1_avg = parseFloat((t1_tot / 15).toFixed(2));
                    const t1_final = t1_avg + t1.finalExam;
                    
                    const t2 = record.grades.term2[selectedGradeSubject] || defaultDetailedGradeObj(0,0,0,0,0,0);
                    const t2_tot = calculateMonthTotal(t2.m1) + calculateMonthTotal(t2.m2) + calculateMonthTotal(t2.m3);
                    const t2_avg = parseFloat((t2_tot / 15).toFixed(2));
                    const t2_final = t2_avg + t2.finalExam;

                    const yearlyTotal = Math.round(t1_final + t2_final);

                    return (
                      <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                          👑 {t.yearlyTotalLabel}
                        </span>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-accent)', marginTop: '8px' }}>
                          {yearlyTotal} / 100
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? `(الفصل ١: ${t1_final.toFixed(1)} + الفصل ٢: ${t2_final.toFixed(1)})` : `(T1: ${t1_final.toFixed(1)} + T2: ${t2_final.toFixed(1)})`}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <button 
                  className="btn-filled" 
                  style={{ alignSelf: 'flex-end', marginTop: 'var(--space-md)' }}
                  onClick={() => {
                    syncGeneralGrades(selectedGradeStudentId);
                    setToastMessage(t.gradesSaveSuccess);
                    setTimeout(() => setToastMessage(''), 3000);
                  }}
                >
                  💾 {t.saveGradesBtn}
                </button>
              </>
            )}

            {/* SCREEN VIEW B: ALL SUBJECTS FOR SELECTED MONTH */}
            {viewMode === 'month' && (
              <>
                <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-primary-ui)', color: '#ffffff', borderRadius: 'var(--radius-card)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <strong>{lang === 'ar' ? student?.name : student?.nameEn}</strong>
                    <span style={{ marginInlineStart: '12px', opacity: 0.8, fontSize: '13px' }}>
                      ({lang === 'ar' ? student?.grade : student?.gradeEn} - {student?.section})
                    </span>
                  </div>
                  <div>
                    <strong>{lang === 'ar' ? 'الفترة التقييمية: ' : 'Evaluation Period: '} </strong>
                    <span>{selectedMonth === 'm1' ? t.m1Label : selectedMonth === 'm2' ? t.m2Label : t.m3Label}</span>
                  </div>
                </div>

                <div className="control-grade-table-container">
                  <table className="control-grade-table">
                    <thead>
                      <tr>
                        <th>{lang === 'ar' ? 'المادة الدراسية' : 'Academic Subject'}</th>
                        <th>{t.hwLabel}</th>
                        <th>{t.attLabel}</th>
                        <th>{t.behLabel}</th>
                        <th>{t.oralLabel}</th>
                        <th>{t.wrtLabel}</th>
                        <th>{t.monthTotalLabel} (100)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'].map((subj) => {
                        const subjectLabel = subj === 'الرياضيات' ? t.math 
                          : subj === 'العلوم' ? t.science 
                          : subj === 'اللغة العربية' ? t.arabic 
                          : t.english;
                        const sData = getStudentDetailedGrades(selectedGradeStudentId, subj, selectedGradeTerm);
                        const mData = sData[selectedMonth] || {};
                        const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);

                        return (
                          <tr key={subj}>
                            <td style={{ fontWeight: 'bold' }}>{subjectLabel}</td>
                            <td>
                              <input 
                                type="number" className="grades-input" min="0" max="15" 
                                value={mData.homework ?? 0}
                                onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'homework', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" className="grades-input" min="0" max="15" 
                                value={mData.attendance ?? 0}
                                onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'attendance', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" className="grades-input" min="0" max="10" 
                                value={mData.behavior ?? 0}
                                onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'behavior', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" className="grades-input" min="0" max="10" 
                                value={mData.oral ?? 0}
                                onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'oral', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" className="grades-input" min="0" max="50" 
                                value={mData.written ?? 0}
                                onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'written', e.target.value)}
                              />
                            </td>
                            <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button 
                  className="btn-filled" 
                  style={{ alignSelf: 'flex-end', marginTop: 'var(--space-md)' }}
                  onClick={() => {
                    syncGeneralGrades(selectedGradeStudentId);
                    setToastMessage(t.gradesSaveSuccess);
                    setTimeout(() => setToastMessage(''), 3000);
                  }}
                >
                  💾 {t.saveGradesBtn}
                </button>
              </>
            )}

            {/* SCREEN VIEW C: GENERAL CLASS GRADES */}
            {viewMode === 'class' && (
              <>
                <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-primary-ui)', color: '#ffffff', borderRadius: 'var(--radius-card)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <strong>{lang === 'ar' ? 'فصل: ' : 'Class: '} {selectedClass}</strong>
                  </div>
                  <div>
                    <strong>{lang === 'ar' ? 'الترم: ' : 'Term: '} </strong>
                    <span>{selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}</span>
                    <span style={{ marginInline: '8px', opacity: 0.5 }}>|</span>
                    <strong>{lang === 'ar' ? 'الفترة: ' : 'Period: '} </strong>
                    <span>
                      {classPeriod === 'm1' ? t.m1Label 
                        : classPeriod === 'm2' ? t.m2Label 
                        : classPeriod === 'm3' ? t.m3Label 
                        : classPeriod === 'termTotal' ? (lang === 'ar' ? 'مجموع الترم' : 'Term Total') 
                        : (lang === 'ar' ? 'المجموع السنوي' : 'Yearly Total')}
                    </span>
                    {classSubject !== 'all' && (
                      <>
                        <span style={{ marginInline: '8px', opacity: 0.5 }}>|</span>
                        <strong>{lang === 'ar' ? 'المادة: ' : 'Subject: '} </strong>
                        <span>{classSubject}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="control-grade-table-container">
                  {classSubject === 'all' ? (
                    <table className="control-grade-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                          <th>{t.math}</th>
                          <th>{t.science}</th>
                          <th>{t.arabic}</th>
                          <th>{t.english}</th>
                          <th>{lang === 'ar' ? 'المعدل / المجموع' : 'Avg / Total'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const classStudents = students.filter(s => `${s.grade} - ${s.section}` === selectedClass);
                          if (classStudents.length === 0) {
                            return (
                              <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                                  {lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذا الفصل.' : 'No students registered in this class.'}
                                </td>
                              </tr>
                            );
                          }

                          let mathSum = 0;
                          let scienceSum = 0;
                          let arabicSum = 0;
                          let englishSum = 0;
                          let overallPercentageSum = 0;

                          const rows = classStudents.map((s, index) => {
                            const mathVal = getSubjectPeriodGrade(s.id, 'الرياضيات', selectedGradeTerm, classPeriod);
                            const scienceVal = getSubjectPeriodGrade(s.id, 'العلوم', selectedGradeTerm, classPeriod);
                            const arabicVal = getSubjectPeriodGrade(s.id, 'اللغة العربية', selectedGradeTerm, classPeriod);
                            const englishVal = getSubjectPeriodGrade(s.id, 'اللغة الإنجليزية', selectedGradeTerm, classPeriod);

                            mathSum += mathVal;
                            scienceSum += scienceVal;
                            arabicSum += arabicVal;
                            englishSum += englishVal;

                            const { val: percentVal, text: totalText } = calculateStudentClassRowTotal(mathVal, scienceVal, arabicVal, englishVal, classPeriod);
                            overallPercentageSum += percentVal;

                            return (
                              <tr key={s.id}>
                                <td>{index + 1}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                <td>{mathVal}</td>
                                <td>{scienceVal}</td>
                                <td>{arabicVal}</td>
                                <td>{englishVal}</td>
                                <td style={{ fontWeight: 'bold' }}>{totalText}</td>
                              </tr>
                            );
                          });

                          const count = classStudents.length;
                          const mathAvg = parseFloat((mathSum / count).toFixed(2));
                          const scienceAvg = parseFloat((scienceSum / count).toFixed(2));
                          const arabicAvg = parseFloat((arabicSum / count).toFixed(2));
                          const englishAvg = parseFloat((englishSum / count).toFixed(2));
                          const classOverallAvg = parseFloat((overallPercentageSum / count).toFixed(2));

                          const maxPossible = (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' || classPeriod === 'yearlyTotal') ? 100 : 50;

                          return (
                            <>
                              {rows}
                              <tr style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)', fontWeight: 'bold' }}>
                                <td colSpan="2" style={{ textAlign: 'right' }}>
                                  {lang === 'ar' ? 'متوسط درجات الفصل:' : 'Class Average:'}
                                </td>
                                <td style={{ color: 'var(--color-primary)' }}>{mathAvg} / {maxPossible}</td>
                                <td style={{ color: 'var(--color-primary)' }}>{scienceAvg} / {maxPossible}</td>
                                <td style={{ color: 'var(--color-primary)' }}>{arabicAvg} / {maxPossible}</td>
                                <td style={{ color: 'var(--color-primary)' }}>{englishAvg} / {maxPossible}</td>
                                <td style={{ color: 'var(--color-success)', fontSize: '15px' }}>{classOverallAvg}%</td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  ) : classSubject === 'detailed' ? (
                    <table className="control-grade-table">
                      <thead>
                        {classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' ? (
                          <tr>
                            <th>#</th>
                            <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                            <th>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                            <th>{t.hwLabel} (15)</th>
                            <th>{t.attLabel} (15)</th>
                            <th>{t.behLabel} (10)</th>
                            <th>{t.oralLabel} (10)</th>
                            <th>{t.wrtLabel} (50)</th>
                            <th>{t.monthTotalLabel} (100)</th>
                          </tr>
                        ) : classPeriod === 'termTotal' ? (
                          <tr>
                            <th>#</th>
                            <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                            <th>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                            <th>{t.termAverageLabel} (20)</th>
                            <th>{t.finalExamLabel} (30)</th>
                            <th>{t.termTotalLabel} (50)</th>
                          </tr>
                        ) : (
                          <tr>
                            <th>#</th>
                            <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                            <th>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                            <th>{lang === 'ar' ? 'الفصل الدراسي الأول (٥٠)' : 'Term 1 (50)'}</th>
                            <th>{lang === 'ar' ? 'الفصل الدراسي الثاني (٥٠)' : 'Term 2 (50)'}</th>
                            <th>{t.yearlyTotalLabel} (100)</th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {(() => {
                          const classStudents = students.filter(s => `${s.grade} - ${s.section}` === selectedClass);
                          if (classStudents.length === 0) {
                            return (
                              <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                                  {lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذا الفصل.' : 'No students registered in this class.'}
                                </td>
                              </tr>
                            );
                          }

                          const subjectsList = ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'];

                          const rows = classStudents.flatMap((s, sIdx) => {
                            return subjectsList.map((subj, subIdx) => {
                              const sData = getStudentDetailedGrades(s.id, subj, selectedGradeTerm);
                              const subjectLabel = subj === 'الرياضيات' ? t.math 
                                : subj === 'العلوم' ? t.science 
                                : subj === 'اللغة العربية' ? t.arabic 
                                : t.english;

                              if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                                const mData = sData[classPeriod] || {};
                                const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);

                                return (
                                  <tr key={`${s.id}-${subj}`} style={{ borderBottom: subIdx === 3 ? '2px solid var(--color-border)' : '1px solid var(--color-border-light)' }}>
                                    {subIdx === 0 && (
                                      <>
                                        <td rowSpan={4} style={{ verticalAlign: 'middle', fontWeight: 'bold', backgroundColor: 'var(--color-surface, #ffffff)', borderRight: '1px solid var(--color-border)' }}>{sIdx + 1}</td>
                                        <td rowSpan={4} style={{ verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'right', backgroundColor: 'var(--color-surface, #ffffff)' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                      </>
                                    )}
                                    <td style={{ fontWeight: '600', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>{subjectLabel}</td>
                                    <td>
                                      <input 
                                        type="number" className="grades-input" min="0" max="15" 
                                        value={mData.homework ?? 0}
                                        onChange={(e) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'homework', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="number" className="grades-input" min="0" max="15" 
                                        value={mData.attendance ?? 0}
                                        onChange={(e) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'attendance', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="number" className="grades-input" min="0" max="10" 
                                        value={mData.behavior ?? 0}
                                        onChange={(e) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'behavior', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="number" className="grades-input" min="0" max="10" 
                                        value={mData.oral ?? 0}
                                        onChange={(e) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'oral', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="number" className="grades-input" min="0" max="50" 
                                        value={mData.written ?? 0}
                                        onChange={(e) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'written', e.target.value)}
                                      />
                                    </td>
                                    <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{total}</td>
                                  </tr>
                                );
                              } else if (classPeriod === 'termTotal') {
                                const tm1 = calculateMonthTotal(sData.m1);
                                const tm2 = calculateMonthTotal(sData.m2);
                                const tm3 = calculateMonthTotal(sData.m3);
                                const avg = parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                                const total = parseFloat((avg + (sData.finalExam || 0)).toFixed(2));

                                return (
                                  <tr key={`${s.id}-${subj}`} style={{ borderBottom: subIdx === 3 ? '2px solid var(--color-border)' : '1px solid var(--color-border-light)' }}>
                                    {subIdx === 0 && (
                                      <>
                                        <td rowSpan={4} style={{ verticalAlign: 'middle', fontWeight: 'bold', backgroundColor: 'var(--color-surface, #ffffff)', borderRight: '1px solid var(--color-border)' }}>{sIdx + 1}</td>
                                        <td rowSpan={4} style={{ verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'right', backgroundColor: 'var(--color-surface, #ffffff)' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                      </>
                                    )}
                                    <td style={{ fontWeight: '600', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>{subjectLabel}</td>
                                    <td>{avg}</td>
                                    <td>
                                      <input 
                                        type="number" className="grades-input" min="0" max="30" 
                                        value={sData.finalExam ?? 0}
                                        onChange={(e) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, 'finalExam', '', e.target.value)}
                                      />
                                    </td>
                                    <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{total}</td>
                                  </tr>
                                );
                              } else {
                                const t1Val = getSubjectPeriodGrade(s.id, subj, selectedGradeTerm, 'termTotal');
                                const t2Val = getSubjectPeriodGrade(s.id, subj, 'term2', 'termTotal');
                                const yearlyVal = Math.round(t1Val + t2Val);

                                return (
                                  <tr key={`${s.id}-${subj}`} style={{ borderBottom: subIdx === 3 ? '2px solid var(--color-border)' : '1px solid var(--color-border-light)' }}>
                                    {subIdx === 0 && (
                                      <>
                                        <td rowSpan={4} style={{ verticalAlign: 'middle', fontWeight: 'bold', backgroundColor: 'var(--color-surface, #ffffff)', borderRight: '1px solid var(--color-border)' }}>{sIdx + 1}</td>
                                        <td rowSpan={4} style={{ verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'right', backgroundColor: 'var(--color-surface, #ffffff)' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                      </>
                                    )}
                                    <td style={{ fontWeight: '600', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>{subjectLabel}</td>
                                    <td>{t1Val}</td>
                                    <td>{t2Val}</td>
                                    <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{yearlyVal}</td>
                                  </tr>
                                );
                              }
                            });
                          });

                          const count = classStudents.length;

                          const averageRows = subjectsList.map((subj, subIdx) => {
                            const subjectLabel = subj === 'الرياضيات' ? t.math 
                              : subj === 'العلوم' ? t.science 
                              : subj === 'اللغة العربية' ? t.arabic 
                              : t.english;

                            let hwSum = 0, attSum = 0, behSum = 0, oralSum = 0, wrtSum = 0, monthTotSum = 0;
                            let avgSum = 0, finalSum = 0, termTotSum = 0;
                            let t1Sum = 0, t2Sum = 0, yearlySum = 0;

                            classStudents.forEach(s => {
                              const sData = getStudentDetailedGrades(s.id, subj, selectedGradeTerm);
                              if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                                const mData = sData[classPeriod] || {};
                                const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);
                                hwSum += mData.homework || 0;
                                attSum += mData.attendance || 0;
                                behSum += mData.behavior || 0;
                                oralSum += mData.oral || 0;
                                wrtSum += mData.written || 0;
                                monthTotSum += total;
                              } else if (classPeriod === 'termTotal') {
                                const tm1 = calculateMonthTotal(sData.m1);
                                const tm2 = calculateMonthTotal(sData.m2);
                                const tm3 = calculateMonthTotal(sData.m3);
                                const avg = parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                                const total = parseFloat((avg + (sData.finalExam || 0)).toFixed(2));
                                avgSum += avg;
                                finalSum += sData.finalExam || 0;
                                termTotSum += total;
                              } else {
                                const t1Val = getSubjectPeriodGrade(s.id, subj, 'term1', 'termTotal');
                                const t2Val = getSubjectPeriodGrade(s.id, subj, 'term2', 'termTotal');
                                yearlySum += Math.round(t1Val + t2Val);
                                t1Sum += t1Val;
                                t2Sum += t2Val;
                              }
                            });

                            if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                              return (
                                <tr key={`avg-${subj}`} style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)', fontWeight: 'bold' }}>
                                  {subIdx === 0 && (
                                    <td rowSpan={4} colSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
                                      {lang === 'ar' ? 'متوسطات درجات الفصل:' : 'Class Averages:'}
                                    </td>
                                  )}
                                  <td style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>{subjectLabel}</td>
                                  <td>{parseFloat((hwSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((attSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((behSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((oralSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((wrtSum / count).toFixed(2))}</td>
                                  <td style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                                    {parseFloat((monthTotSum / count).toFixed(2))}
                                  </td>
                                </tr>
                              );
                            } else if (classPeriod === 'termTotal') {
                              return (
                                <tr key={`avg-${subj}`} style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)', fontWeight: 'bold' }}>
                                  {subIdx === 0 && (
                                    <td rowSpan={4} colSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
                                      {lang === 'ar' ? 'متوسطات درجات الفصل:' : 'Class Averages:'}
                                    </td>
                                  )}
                                  <td style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>{subjectLabel}</td>
                                  <td>{parseFloat((avgSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((finalSum / count).toFixed(2))}</td>
                                  <td style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                                    {parseFloat((termTotSum / count).toFixed(2))}
                                  </td>
                                </tr>
                              );
                            } else {
                              return (
                                <tr key={`avg-${subj}`} style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)', fontWeight: 'bold' }}>
                                  {subIdx === 0 && (
                                    <td rowSpan={4} colSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
                                      {lang === 'ar' ? 'متوسطات درجات الفصل:' : 'Class Averages:'}
                                    </td>
                                  )}
                                  <td style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>{subjectLabel}</td>
                                  <td>{parseFloat((t1Sum / count).toFixed(2))}</td>
                                  <td>{parseFloat((t2Sum / count).toFixed(2))}</td>
                                  <td style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                                    {parseFloat((yearlySum / count).toFixed(2))}
                                  </td>
                                </tr>
                              );
                            }
                          });

                          return (
                            <>
                              {rows}
                              {averageRows}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  ) : (
                    <table className="control-grade-table">
                      <thead>
                        {classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' ? (
                          <tr>
                            <th>#</th>
                            <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                            <th>{t.hwLabel} (15)</th>
                            <th>{t.attLabel} (15)</th>
                            <th>{t.behLabel} (10)</th>
                            <th>{t.oralLabel} (10)</th>
                            <th>{t.wrtLabel} (50)</th>
                            <th>{t.monthTotalLabel} (100)</th>
                          </tr>
                        ) : classPeriod === 'termTotal' ? (
                          <tr>
                            <th>#</th>
                            <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                            <th>{t.termAverageLabel} (20)</th>
                            <th>{t.finalExamLabel} (30)</th>
                            <th>{t.termTotalLabel} (50)</th>
                          </tr>
                        ) : (
                          <tr>
                            <th>#</th>
                            <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                            <th>{lang === 'ar' ? 'الفصل الدراسي الأول (٥٠)' : 'Term 1 (50)'}</th>
                            <th>{lang === 'ar' ? 'الفصل الدراسي الثاني (٥٠)' : 'Term 2 (50)'}</th>
                            <th>{t.yearlyTotalLabel} (100)</th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {(() => {
                          const classStudents = students.filter(s => `${s.grade} - ${s.section}` === selectedClass);
                          if (classStudents.length === 0) {
                            return (
                              <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                                  {lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذا الفصل.' : 'No students registered in this class.'}
                                </td>
                              </tr>
                            );
                          }

                          let hwSum = 0, attSum = 0, behSum = 0, oralSum = 0, wrtSum = 0, monthTotSum = 0;
                          let avgSum = 0, finalSum = 0, termTotSum = 0;
                          let t1Sum = 0, t2Sum = 0, yearlySum = 0;

                          const rows = classStudents.map((s, index) => {
                            const sData = getStudentDetailedGrades(s.id, classSubject, selectedGradeTerm);

                            if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                              const mData = sData[classPeriod] || {};
                              const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);
                              
                              hwSum += mData.homework || 0;
                              attSum += mData.attendance || 0;
                              behSum += mData.behavior || 0;
                              oralSum += mData.oral || 0;
                              wrtSum += mData.written || 0;
                              monthTotSum += total;

                              return (
                                <tr key={s.id}>
                                  <td>{index + 1}</td>
                                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                  <td>
                                    <input 
                                      type="number" className="grades-input" min="0" max="15" 
                                      value={mData.homework ?? 0}
                                      onChange={(e) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'homework', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input 
                                      type="number" className="grades-input" min="0" max="15" 
                                      value={mData.attendance ?? 0}
                                      onChange={(e) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'attendance', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input 
                                      type="number" className="grades-input" min="0" max="10" 
                                      value={mData.behavior ?? 0}
                                      onChange={(e) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'behavior', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input 
                                      type="number" className="grades-input" min="0" max="10" 
                                      value={mData.oral ?? 0}
                                      onChange={(e) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'oral', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input 
                                      type="number" className="grades-input" min="0" max="50" 
                                      value={mData.written ?? 0}
                                      onChange={(e) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'written', e.target.value)}
                                    />
                                  </td>
                                  <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{total}</td>
                                </tr>
                              );
                            } else if (classPeriod === 'termTotal') {
                              const tm1 = calculateMonthTotal(sData.m1);
                              const tm2 = calculateMonthTotal(sData.m2);
                              const tm3 = calculateMonthTotal(sData.m3);
                              const avg = parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                              const total = parseFloat((avg + (sData.finalExam || 0)).toFixed(2));

                              avgSum += avg;
                              finalSum += sData.finalExam || 0;
                              termTotSum += total;

                              return (
                                <tr key={s.id}>
                                  <td>{index + 1}</td>
                                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                  <td>{avg}</td>
                                  <td>
                                    <input 
                                      type="number" className="grades-input" min="0" max="30" 
                                      value={sData.finalExam ?? 0}
                                      onChange={(e) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, 'finalExam', '', e.target.value)}
                                    />
                                  </td>
                                  <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{total}</td>
                                </tr>
                              );
                            } else {
                              const t1Val = getSubjectPeriodGrade(s.id, classSubject, 'term1', 'termTotal');
                              const t2Val = getSubjectPeriodGrade(s.id, classSubject, 'term2', 'termTotal');
                              const yearlyVal = Math.round(t1Val + t2Val);

                              t1Sum += t1Val;
                              t2Sum += t2Val;
                              yearlySum += yearlyVal;

                              return (
                                <tr key={s.id}>
                                  <td>{index + 1}</td>
                                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                  <td>{t1Val}</td>
                                  <td>{t2Val}</td>
                                  <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{yearlyVal}</td>
                                </tr>
                              );
                            }
                          });

                          const count = classStudents.length;

                          if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                            return (
                              <>
                                {rows}
                                <tr style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)', fontWeight: 'bold' }}>
                                  <td colSpan="2" style={{ textAlign: 'right' }}>{lang === 'ar' ? 'متوسط درجات الفصل:' : 'Class Average:'}</td>
                                  <td>{parseFloat((hwSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((attSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((behSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((oralSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((wrtSum / count).toFixed(2))}</td>
                                  <td style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                                    {parseFloat((monthTotSum / count).toFixed(2))}
                                  </td>
                                </tr>
                              </>
                            );
                          } else if (classPeriod === 'termTotal') {
                            return (
                              <>
                                {rows}
                                <tr style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)', fontWeight: 'bold' }}>
                                  <td colSpan="2" style={{ textAlign: 'right' }}>{lang === 'ar' ? 'متوسط درجات الفصل:' : 'Class Average:'}</td>
                                  <td>{parseFloat((avgSum / count).toFixed(2))}</td>
                                  <td>{parseFloat((finalSum / count).toFixed(2))}</td>
                                  <td style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                                    {parseFloat((termTotSum / count).toFixed(2))}
                                  </td>
                                </tr>
                              </>
                            );
                          } else {
                            return (
                              <>
                                {rows}
                                <tr style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)', fontWeight: 'bold' }}>
                                  <td colSpan="2" style={{ textAlign: 'right' }}>{lang === 'ar' ? 'متوسط درجات الفصل:' : 'Class Average:'}</td>
                                  <td>{parseFloat((t1Sum / count).toFixed(2))}</td>
                                  <td>{parseFloat((t2Sum / count).toFixed(2))}</td>
                                  <td style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                                    {parseFloat((yearlySum / count).toFixed(2))}
                                  </td>
                                </tr>
                              </>
                            );
                          }
                        })()}
                      </tbody>
                    </table>
                  )}
                </div>

                {classSubject !== 'all' && (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' || classPeriod === 'termTotal') && (
                  <button 
                    className="btn-filled" 
                    style={{ alignSelf: 'flex-end', marginTop: 'var(--space-md)' }}
                    onClick={() => {
                      const classStudents = students.filter(s => `${s.grade} - ${s.section}` === selectedClass);
                      classStudents.forEach(s => {
                        syncGeneralGrades(s.id);
                      });
                      setToastMessage(t.gradesSaveSuccess);
                      setTimeout(() => setToastMessage(''), 3000);
                    }}
                  >
                    💾 {t.saveGradesBtn}
                  </button>
                )}
              </>
            )}

          </div>

          {/* ==================== PRINT ONLY VIEWS (HIDDEN ON SCREEN) ==================== */}

          {/* 1. Subject Print View */}
          <div style={{ display: 'none' }} className="print-subject-only-content printable-area">
            <PrintHeader 
              title="كشف تقييم درجات الطالب التفصيلي"
              subtitle={lang === 'ar' 
                ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
                : `Academic Year: 2026 | Term: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
              }
            />

            <div className="printable-only-metadata" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '10px 0', 
              marginBottom: '20px',
              borderBottom: '1px dashed #cbd5e1',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#0f172a',
              direction: 'rtl'
            }}>
              <div>
                <span>اسم الطالب: </span>
                <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? student?.name : student?.nameEn}</span>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                <span>الصف: </span>
                <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? student?.grade : student?.gradeEn}</span>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                <span>الشعبة: </span>
                <span style={{ fontWeight: 'normal' }}>{student?.section}</span>
              </div>
              <div className="print-hide-on-month print-hide-on-term">
                <span>المادة الدراسية: </span>
                <span style={{ fontWeight: 'normal' }}>{selectedGradeSubject}</span>
              </div>
              <div className="print-show-only-on-month" style={{ display: 'none' }}>
                <span>الفترة التقييمية: </span>
                <span style={{ fontWeight: 'normal' }}>
                  {printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}
                </span>
              </div>
              <div className="print-show-only-on-term" style={{ display: 'none' }}>
                <span>التقرير: </span>
                <span style={{ fontWeight: 'normal' }}>كشف درجات شامل</span>
              </div>
            </div>

            <div className="control-grade-table-container">
              <table className="control-grade-table">
                <thead>
                  <tr>
                    <th>{lang === 'ar' ? 'الفترة التقييمية' : 'Evaluation Period'}</th>
                    <th>{t.hwLabel}</th>
                    <th>{t.attLabel}</th>
                    <th>{t.behLabel}</th>
                    <th>{t.oralLabel}</th>
                    <th>{t.wrtLabel}</th>
                    <th>{t.monthTotalLabel} (100)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Month 1 */}
                  <tr className="print-row-m1">
                    <td style={{ fontWeight: 'bold' }}>{t.m1Label}</td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m1.homework}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m1.attendance}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m1.behavior}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m1.oral}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m1.written}</span>
                    </td>
                    <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m1_total}</td>
                  </tr>
                  
                  {/* Month 2 */}
                  <tr className="print-row-m2">
                    <td style={{ fontWeight: 'bold' }}>{t.m2Label}</td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m2.homework}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m2.attendance}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m2.behavior}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m2.oral}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m2.written}</span>
                    </td>
                    <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m2_total}</td>
                  </tr>

                  {/* Month 3 */}
                  <tr className="print-row-m3">
                    <td style={{ fontWeight: 'bold' }}>{t.m3Label}</td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m3.homework}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m3.attendance}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m3.behavior}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m3.oral}</span>
                    </td>
                    <td>
                      <span className="print-only-grade-value">{gradesData.m3.written}</span>
                    </td>
                    <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m3_total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations Panel */}
            <div className="print-hide-on-month print-hide-on-term" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              marginTop: '20px',
              direction: 'rtl'
            }}>
              <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{t.termAverageLabel}</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginTop: '4px' }}>{monthsAverage} / 20</div>
              </div>
              <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{t.finalExamLabel}</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginTop: '4px' }}>{gradesData.finalExam} / 30</div>
              </div>
              <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{t.termTotalLabel}</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>{termTotal} / 50</div>
              </div>
              {(() => {
                const record = detailedGrades.find(r => r.studentId === selectedGradeStudentId);
                if (!record) return null;
                const t1 = record.grades.term1[selectedGradeSubject] || defaultDetailedGradeObj(0,0,0,0,0,0);
                const t1_tot = calculateMonthTotal(t1.m1) + calculateMonthTotal(t1.m2) + calculateMonthTotal(t1.m3);
                const t1_avg = parseFloat((t1_tot / 15).toFixed(2));
                const t1_final = t1_avg + t1.finalExam;
                const t2 = record.grades.term2[selectedGradeSubject] || defaultDetailedGradeObj(0,0,0,0,0,0);
                const t2_tot = calculateMonthTotal(t2.m1) + calculateMonthTotal(t2.m2) + calculateMonthTotal(t2.m3);
                const t2_avg = parseFloat((t2_tot / 15).toFixed(2));
                const t2_final = t2_avg + t2.finalExam;
                const yearlyTotal = Math.round(t1_final + t2_final);
                return (
                  <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{t.yearlyTotalLabel}</span>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6', marginTop: '4px' }}>{yearlyTotal} / 100</div>
                  </div>
                );
              })()}
            </div>

            <div className="printable-only-signatures" style={{ 
              display: 'none', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '48px', 
              paddingTop: '24px',
              borderTop: '1px solid #cbd5e1',
              direction: 'rtl',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#0f172a'
            }}>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>توقيع معلم المادة</div>
                <div style={{ height: '40px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>مرشد الطلاب</div>
                <div style={{ height: '40px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>توقيع مدير المدرسة</div>
                <div style={{ height: '40px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
            </div>
          </div>

          {/* 2. Term Print View */}
          <div style={{ display: 'none' }} className="print-term-full-report printable-area">
            <PrintHeader 
              title="كشف درجات الفصل الدراسي"
              subtitle={lang === 'ar' 
                ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
                : `Academic Year: 2026 | Term: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
              }
            />

            <div className="printable-only-metadata" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '10px 0', 
              marginBottom: '20px',
              borderBottom: '1px dashed #cbd5e1',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#0f172a',
              direction: 'rtl'
            }}>
              <div>
                <span>اسم الطالب: </span>
                <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? student?.name : student?.nameEn}</span>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                <span>الصف: </span>
                <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? student?.grade : student?.gradeEn}</span>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                <span>الشعبة: </span>
                <span style={{ fontWeight: 'normal' }}>{student?.section}</span>
              </div>
              <div>
                <span>التقرير: </span>
                <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? 'كشف درجات شامل بالفصل الدراسي' : 'Full Term Academic Report'}</span>
              </div>
            </div>

            <table style={{ 
              width: '100%', borderCollapse: 'collapse', fontSize: '11px',
              border: '1px solid #cbd5e1',
              direction: 'rtl'
            }} className="print-term-table">
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المحصلة (من ٢٠)' : 'Year\'s Work (20)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'الاختبار النهائي (من ٣٠)' : 'Final Exam (30)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المجموع (من ٥٠)' : 'Total (50)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'التقدير' : 'Appreciation'}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const subjectsList = ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'];
                  let totalTermSum = 0;

                  const rows = subjectsList.map((subj) => {
                    const subjectLabel = subj === 'الرياضيات' ? t.math 
                      : subj === 'العلوم' ? t.science 
                      : subj === 'اللغة العربية' ? t.arabic 
                      : t.english;
                    const sData = getStudentDetailedGrades(selectedGradeStudentId, subj, selectedGradeTerm);
                    const calcTotal = (m) => (m.homework||0) + (m.attendance||0) + (m.behavior||0) + (m.oral||0) + (m.written||0);
                    const tm1 = calcTotal(sData.m1);
                    const tm2 = calcTotal(sData.m2);
                    const tm3 = calcTotal(sData.m3);
                    const avgMonths = parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                    const finalExamScore = sData.finalExam || 0;
                    const termSum = parseFloat((avgMonths + finalExamScore).toFixed(2));
                    totalTermSum += termSum;

                    const pct = (termSum / 50) * 100;
                    let appreciation = '';
                    if (pct >= 90) appreciation = lang === 'ar' ? 'ممتاز' : 'Excellent';
                    else if (pct >= 80) appreciation = lang === 'ar' ? 'جيد جداً' : 'Very Good';
                    else if (pct >= 70) appreciation = lang === 'ar' ? 'جيد' : 'Good';
                    else if (pct >= 50) appreciation = lang === 'ar' ? 'مقبول' : 'Pass';
                    else appreciation = lang === 'ar' ? 'ضعيف' : 'Fail';

                    return (
                      <tr key={subj}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', fontWeight: '600', color: '#1e293b' }}>{subjectLabel}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{avgMonths}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{finalExamScore}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{termSum}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: pct >= 50 ? '#0f766e' : '#be123c' }}>{appreciation}</td>
                      </tr>
                    );
                  });

                  const avgPercentage = parseFloat(((totalTermSum / 200) * 100).toFixed(2));
                  let finalAppreciation = '';
                  if (avgPercentage >= 90) finalAppreciation = lang === 'ar' ? 'ممتاز' : 'Excellent';
                  else if (avgPercentage >= 80) finalAppreciation = lang === 'ar' ? 'جيد جداً' : 'Very Good';
                  else if (avgPercentage >= 70) finalAppreciation = lang === 'ar' ? 'جيد' : 'Good';
                  else if (avgPercentage >= 50) finalAppreciation = lang === 'ar' ? 'مقبول' : 'Pass';
                  else finalAppreciation = lang === 'ar' ? 'ضعيف' : 'Fail';

                  return (
                    <>
                      {rows}
                      <tr style={{ background: '#f8fafc', fontWeight: '800' }}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', color: '#0f172a' }}>
                          {lang === 'ar' ? 'المعدل العام والتقدير' : 'Overall Average & Grade'}
                        </td>
                        <td colSpan="2" style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>
                          {lang === 'ar' ? `النسبة: ${avgPercentage}%` : `Percentage: ${avgPercentage}%`}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', color: '#0f766e', fontSize: '12px' }}>
                          {parseFloat(totalTermSum.toFixed(2))} / 200
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', color: '#0f766e' }}>
                          {finalAppreciation}
                        </td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '36px', 
              paddingTop: '20px',
              borderTop: '1px solid #cbd5e1',
              direction: 'rtl',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#0f172a'
            }}>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>توقيع مربي الفصل</div>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>المرشد الطلابي</div>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>مدير المدرسة / الختم</div>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
            </div>
          </div>

          {/* 3. Month Print View */}
          <div style={{ display: 'none' }} className="print-month-full-report printable-area">
            <PrintHeader 
              title="كشف درجات التقييم الشهري"
              subtitle={lang === 'ar' 
                ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label} | الفترة: ${printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}`
                : `Academic Year: 2026 | Term: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label} | Period: ${printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}`
              }
            />

            <div className="printable-only-metadata" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '10px 0', 
              marginBottom: '20px',
              borderBottom: '1px dashed #cbd5e1',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#0f172a',
              direction: 'rtl'
            }}>
              <div>
                <span>اسم الطالب: </span>
                <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? student?.name : student?.nameEn}</span>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                <span>الصف: </span>
                <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? student?.grade : student?.gradeEn}</span>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                <span>الشعبة: </span>
                <span style={{ fontWeight: 'normal' }}>{student?.section}</span>
              </div>
              <div>
                <span>الفترة التقييمية: </span>
                <span style={{ fontWeight: 'normal' }}>{printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}</span>
              </div>
            </div>

            <table style={{ 
              width: '100%', borderCollapse: 'collapse', fontSize: '11px',
              border: '1px solid #cbd5e1',
              direction: 'rtl'
            }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'واجبات (١٥)' : 'HW (15)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'مواظبة (١٥)' : 'Att (15)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'سلوك (١٠)' : 'Beh (10)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'شفوي (١٠)' : 'Oral (10)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'تحريري (٥٠)' : 'Written (50)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المجموع' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'].map((subj) => {
                  const subjectLabel = subj === 'الرياضيات' ? t.math 
                    : subj === 'العلوم' ? t.science 
                    : subj === 'اللغة العربية' ? t.arabic 
                    : t.english;
                  const sData = getStudentDetailedGrades(selectedGradeStudentId, subj, selectedGradeTerm);
                  const mData = sData[printSelectedMonth] || {};
                  const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);

                  return (
                    <tr key={subj}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', fontWeight: '600', color: '#1e293b' }}>{subjectLabel}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.homework ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.attendance ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.behavior ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.oral ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.written ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '36px', 
              paddingTop: '20px',
              borderTop: '1px solid #cbd5e1',
              direction: 'rtl',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#0f172a'
            }} className="print-month-signatures">
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>توقيع مربي الفصل</div>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>المرشد الطلابي</div>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>مدير المدرسة / الختم</div>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
            </div>
          </div>

          {/* 4. Class Print View */}
          <div style={{ display: 'none' }} className="print-class-report printable-area">
            <PrintHeader 
              title={classSubject === 'all' 
                ? `كشف درجات طلاب الفصل - ${selectedClass}`
                : `كشف رصد درجات الفصل التفصيلي (${classSubject}) - ${selectedClass}`
              }
              subtitle={lang === 'ar' 
                ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label} | الفترة: ${
                    classPeriod === 'm1' ? t.m1Label 
                    : classPeriod === 'm2' ? t.m2Label 
                    : classPeriod === 'm3' ? t.m3Label 
                    : classPeriod === 'termTotal' ? 'مجموع الترم' 
                    : 'المجموع السنوي'
                  }`
                : `Academic Year: 2026 | Term: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label} | Period: ${classPeriod}`
              }
            />

            <div className="printable-only-metadata" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '10px 0', 
              marginBottom: '20px',
              borderBottom: '1px dashed #cbd5e1',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#0f172a',
              direction: 'rtl'
            }}>
              <div>
                <span>الفصل الدراسي: </span>
                <span style={{ fontWeight: 'normal' }}>{selectedClass}</span>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                <span>التقرير: </span>
                <span style={{ fontWeight: 'normal' }}>
                  {classSubject === 'all' ? 'كشف رصد درجات الفصل العام' : `كشف رصد تفصيلي لمادة ${classSubject}`}
                </span>
              </div>
            </div>

            {classSubject === 'all' ? (
              <table style={{ 
                width: '100%', borderCollapse: 'collapse', fontSize: '11px',
                border: '1px solid #cbd5e1',
                direction: 'rtl'
              }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>#</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.math}</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.science}</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.arabic}</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.english}</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المعدل / المجموع' : 'Avg / Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(s => `${s.grade} - ${s.section}` === selectedClass)
                    .map((s, index) => {
                      const mathVal = getSubjectPeriodGrade(s.id, 'الرياضيات', selectedGradeTerm, classPeriod);
                      const scienceVal = getSubjectPeriodGrade(s.id, 'العلوم', selectedGradeTerm, classPeriod);
                      const arabicVal = getSubjectPeriodGrade(s.id, 'اللغة العربية', selectedGradeTerm, classPeriod);
                      const englishVal = getSubjectPeriodGrade(s.id, 'اللغة الإنجليزية', selectedGradeTerm, classPeriod);
                      const { text: totalText } = calculateStudentClassRowTotal(mathVal, scienceVal, arabicVal, englishVal, classPeriod);

                      return (
                        <tr key={s.id}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mathVal}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{scienceVal}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{arabicVal}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{englishVal}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{totalText}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            ) : classSubject === 'detailed' ? (
              <table style={{ 
                width: '100%', borderCollapse: 'collapse', fontSize: '11px',
                border: '1px solid #cbd5e1',
                direction: 'rtl'
              }}>
                <thead>
                  {classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' ? (
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>#</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.hwLabel} (15)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.attLabel} (15)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.behLabel} (10)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.oralLabel} (10)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.wrtLabel} (50)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.monthTotalLabel} (100)</th>
                    </tr>
                  ) : classPeriod === 'termTotal' ? (
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>#</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.termAverageLabel} (20)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.finalExamLabel} (30)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.termTotalLabel} (50)</th>
                    </tr>
                  ) : (
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>#</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'الترم الأول (٥٠)' : 'Term 1 (50)'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'الترم الثاني (٥٠)' : 'Term 2 (50)'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.yearlyTotalLabel} (100)</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {students
                    .filter(s => `${s.grade} - ${s.section}` === selectedClass)
                    .map((s, sIdx) => {
                      const subjectsList = ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'];
                      return subjectsList.map((subj, subIdx) => {
                        const sData = getStudentDetailedGrades(s.id, subj, selectedGradeTerm);
                        const subjectLabel = subj === 'الرياضيات' ? t.math 
                          : subj === 'العلوم' ? t.science 
                          : subj === 'اللغة العربية' ? t.arabic 
                          : t.english;

                        if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                          const mData = sData[classPeriod] || {};
                          const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);
                          return (
                            <tr key={`${s.id}-${subj}`} style={{ borderBottom: subIdx === 3 ? '2px solid #cbd5e1' : '1px solid #cbd5e1' }}>
                              {subIdx === 0 && (
                                <>
                                  <td rowSpan={4} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{sIdx + 1}</td>
                                  <td rowSpan={4} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', verticalAlign: 'middle', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                </>
                              )}
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{subjectLabel}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.homework ?? 0}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.attendance ?? 0}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.behavior ?? 0}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.oral ?? 0}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.written ?? 0}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total}</td>
                            </tr>
                          );
                        } else if (classPeriod === 'termTotal') {
                          const tm1 = calculateMonthTotal(sData.m1);
                          const tm2 = calculateMonthTotal(sData.m2);
                          const tm3 = calculateMonthTotal(sData.m3);
                          const avg = parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                          const total = parseFloat((avg + (sData.finalExam || 0)).toFixed(2));
                          return (
                            <tr key={`${s.id}-${subj}`} style={{ borderBottom: subIdx === 3 ? '2px solid #cbd5e1' : '1px solid #cbd5e1' }}>
                              {subIdx === 0 && (
                                <>
                                  <td rowSpan={4} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{sIdx + 1}</td>
                                  <td rowSpan={4} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', verticalAlign: 'middle', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                </>
                              )}
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{subjectLabel}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{avg}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{sData.finalExam ?? 0}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total}</td>
                            </tr>
                          );
                        } else {
                          const t1Val = getSubjectPeriodGrade(s.id, subj, selectedGradeTerm, 'termTotal');
                          const t2Val = getSubjectPeriodGrade(s.id, subj, 'term2', 'termTotal');
                          const yearlyVal = Math.round(t1Val + t2Val);
                          return (
                            <tr key={`${s.id}-${subj}`} style={{ borderBottom: subIdx === 3 ? '2px solid #cbd5e1' : '1px solid #cbd5e1' }}>
                              {subIdx === 0 && (
                                <>
                                  <td rowSpan={4} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{sIdx + 1}</td>
                                  <td rowSpan={4} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', verticalAlign: 'middle', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                                </>
                              )}
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{subjectLabel}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{t1Val}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{t2Val}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{yearlyVal}</td>
                            </tr>
                          );
                        }
                      });
                    })
                  }
                </tbody>
              </table>
            ) : (
              <table style={{ 
                width: '100%', borderCollapse: 'collapse', fontSize: '11px',
                border: '1px solid #cbd5e1',
                direction: 'rtl'
              }}>
                <thead>
                  {classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' ? (
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>#</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.hwLabel} (15)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.attLabel} (15)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.behLabel} (10)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.oralLabel} (10)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.wrtLabel} (50)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.monthTotalLabel} (100)</th>
                    </tr>
                  ) : classPeriod === 'termTotal' ? (
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>#</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.termAverageLabel} (20)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.finalExamLabel} (30)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.termTotalLabel} (50)</th>
                    </tr>
                  ) : (
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>#</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'الترم الأول (٥٠)' : 'Term 1 (50)'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'الترم الثاني (٥٠)' : 'Term 2 (50)'}</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.yearlyTotalLabel} (100)</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {students
                    .filter(s => `${s.grade} - ${s.section}` === selectedClass)
                    .map((s, index) => {
                      const sData = getStudentDetailedGrades(s.id, classSubject, selectedGradeTerm);

                      if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                        const mData = sData[classPeriod] || {};
                        const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);
                        return (
                          <tr key={s.id}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.homework ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.attendance ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.behavior ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.oral ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.written ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total}</td>
                          </tr>
                        );
                      } else if (classPeriod === 'termTotal') {
                        const tm1 = calculateMonthTotal(sData.m1);
                        const tm2 = calculateMonthTotal(sData.m2);
                        const tm3 = calculateMonthTotal(sData.m3);
                        const avg = parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                        const total = parseFloat((avg + (sData.finalExam || 0)).toFixed(2));
                        return (
                          <tr key={s.id}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{avg}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{sData.finalExam ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total}</td>
                          </tr>
                        );
                      } else {
                        const t1Val = getSubjectPeriodGrade(s.id, classSubject, 'term1', 'termTotal');
                        const t2Val = getSubjectPeriodGrade(s.id, classSubject, 'term2', 'termTotal');
                        const yearlyVal = Math.round(t1Val + t2Val);
                        return (
                          <tr key={s.id}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{lang === 'ar' ? s.name : s.nameEn}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{t1Val}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{t2Val}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{yearlyVal}</td>
                          </tr>
                        );
                      }
                    })
                  }
                </tbody>
              </table>
            )}

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '36px', 
              paddingTop: '20px',
              borderTop: '1px solid #cbd5e1',
              direction: 'rtl',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#0f172a'
            }}>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>توقيع مربي الفصل</div>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>المرشد الطلابي</div>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div>مدير المدرسة / الختم</div>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
