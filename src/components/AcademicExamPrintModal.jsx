import { useState, useMemo, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, CheckSquare, Square, Layers, BookOpen, AlertCircle, Clock, Calendar } from 'lucide-react';
import sloganLogo from '../assets/slogan.jpeg';
import '../styles/printExamSchedule.css';

/**
 * Robustly parses and sorts time range, guaranteeing:
 * 1. Start time is ALWAYS earlier than End time (e.g. 09:30 always comes before 10:01).
 * 2. Formats clearly in Arabic with start & end parts isolated.
 * 3. Accurately calculates duration without negative modulo bugs.
 */
function parseTimeRange(timeStr, lang = 'ar') {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const timeRegex = /(\d{1,2}):(\d{2})(?:\s*(ص|م|AM|PM|am|pm))?/gi;
  const matches = [...timeStr.matchAll(timeRegex)];

  if (matches.length < 2) {
    return {
      startStr: timeStr,
      endStr: '',
      formattedText: timeStr,
      durationText: '—'
    };
  }

  const parseItem = (m) => {
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const rawPeriod = m[3] ? m[3].trim().toUpperCase() : '';

    const isPM = rawPeriod === 'م' || rawPeriod === 'PM';
    const isAM = rawPeriod === 'ص' || rawPeriod === 'AM';

    let hour24 = h;
    if (isPM && h < 12) hour24 += 12;
    if (isAM && h === 12) hour24 = 0;

    return {
      h: h % 12 === 0 ? 12 : h % 12,
      min,
      totalMinutes: hour24 * 60 + min,
      period: isPM ? 'م' : 'ص'
    };
  };

  const t1 = parseItem(matches[0]);
  const t2 = parseItem(matches[1]);

  let start = t1;
  let end = t2;
  if (t1.totalMinutes > t2.totalMinutes) {
    start = t2;
    end = t1;
  }

  let diffMinutes = end.totalMinutes - start.totalMinutes;
  if (diffMinutes <= 0) diffMinutes += 12 * 60;

  const pad = (n) => String(n).padStart(2, '0');
  const startStr = `${pad(start.h)}:${pad(start.min)} ${start.period}`;
  const endStr = `${pad(end.h)}:${pad(end.min)} ${end.period}`;

  let durationText = `${diffMinutes} دقيقة`;
  if (diffMinutes === 30) durationText = 'نصف ساعة';
  else if (diffMinutes === 45) durationText = '45 دقيقة';
  else if (diffMinutes === 60) durationText = 'ساعة واحدة';
  else if (diffMinutes === 90) durationText = 'ساعة ونصف';
  else if (diffMinutes === 120) durationText = 'ساعتان';
  else if (diffMinutes === 150) durationText = 'ساعتان ونصف';
  else if (diffMinutes === 180) durationText = 'ثلاث ساعات';
  else if (diffMinutes > 60) {
    const hours = Math.floor(diffMinutes / 60);
    const remMins = diffMinutes % 60;
    if (remMins === 0) durationText = `${hours} ساعات`;
    else durationText = `${hours} ساعة و ${remMins} دقيقة`;
  }

  return {
    startStr,
    endStr,
    formattedText: `من ${startStr} إلى ${endStr}`,
    durationMinutes: diffMinutes,
    durationText
  };
}

const formatArabicDay = (dateStr) => {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return '';
  const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return daysAr[dateObj.getDay()];
};

const AcademicExamPrintModal = memo(function AcademicExamPrintModal({
  isOpen,
  onClose,
  initialSchedule,
  allSchedules = [],
  classes = [],
  lang = 'ar'
}) {
  if (!isOpen) return null;

  // Extract initial grade & section
  const initialGrade = initialSchedule
    ? (initialSchedule.grade || initialSchedule.class?.grade_ar || initialSchedule.class?.grade || '')
    : (allSchedules[0]?.grade || allSchedules[0]?.class?.grade_ar || '');

  const initialClassId = initialSchedule
    ? String(initialSchedule.class_id || initialSchedule.classId || initialSchedule.class?.id || '')
    : '';

  // Print Settings State
  const [printScope, setPrintScope] = useState('grade_unified'); // 'grade_unified' | 'single_section' | 'all_filtered'
  const [selectedGrade, setSelectedGrade] = useState(initialGrade || 'الصف الأول');
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || 'all');
  const [academicYear, setAcademicYear] = useState('2025 - 2026م');

  // Customizable Metadata fields
  const [attendanceTime, setAttendanceTime] = useState('7:45 صباحاً');
  const [showAttendanceTime, setShowAttendanceTime] = useState(true);

  const [customExamPeriod, setCustomExamPeriod] = useState('');
  const [showExamPeriod, setShowExamPeriod] = useState(true);

  // Exam Duration Settings: in Ribbon vs Table column
  const [customExamDuration, setCustomExamDuration] = useState('');
  const [showExamDurationInRibbon, setShowExamDurationInRibbon] = useState(true);
  const [showDurationInTable, setShowDurationInTable] = useState(false); // Default: hidden from table per user request

  const [showInstructions, setShowInstructions] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);

  // Unique grades available in current schedules
  const availableGrades = useMemo(() => {
    const set = new Set();
    allSchedules.forEach(s => {
      const g = s.grade || s.class?.grade_ar || s.class?.grade;
      if (g) set.add(g);
    });
    if (classes && classes.length > 0) {
      classes.forEach(c => {
        if (c.grade) set.add(c.grade);
      });
    }
    return Array.from(set);
  }, [allSchedules, classes]);

  // Classes of the selected grade
  const classesOfSelectedGrade = useMemo(() => {
    return (classes || []).filter(c => c.grade === selectedGrade);
  }, [classes, selectedGrade]);

  // Determine which sheets to render based on scope
  const sheetsData = useMemo(() => {
    if (printScope === 'single_section') {
      const targetSched = allSchedules.find(s => {
        const sCid = String(s.class_id || s.classId || s.class?.id || '');
        const targetClean = String(selectedClassId).replace('cls-', '');
        const sClean = sCid.replace('cls-', '');
        return sClean === targetClean;
      }) || initialSchedule || allSchedules[0];

      if (!targetSched) return [];

      const grade = targetSched.grade || targetSched.class?.grade_ar || targetSched.class?.grade || '';
      const section = targetSched.section || targetSched.class?.section_ar || targetSched.class?.section || '';

      return [{
        key: `single-${targetSched.id}`,
        title: targetSched.period || targetSched.title || (lang === 'ar' ? 'جدول سير الاختبارات' : 'Exam Timetable'),
        term: targetSched.term === 'term2' || targetSched.term === 'الفصل الثاني' ? (lang === 'ar' ? 'الفصل الدراسي الثاني' : 'Second Term') : (lang === 'ar' ? 'الفصل الدراسي الأول' : 'First Term'),
        grade: grade,
        sectionsLabel: section ? (lang === 'ar' ? `شعبة (${section})` : `Section (${section})`) : '',
        subjects: [...(targetSched.subjects || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
      }];
    }

    if (printScope === 'grade_unified') {
      const gradeSchedules = allSchedules.filter(s => {
        const g = s.grade || s.class?.grade_ar || s.class?.grade;
        return g === selectedGrade;
      });

      const baseSched = gradeSchedules[0] || initialSchedule || allSchedules[0];
      if (!baseSched) return [];

      const sections = classesOfSelectedGrade.map(c => c.section).filter(Boolean);
      const sectionsStr = sections.length > 0
        ? (lang === 'ar' ? `جميع الشُعب (${sections.join(' ، ')})` : `All Sections (${sections.join(', ')})`)
        : (lang === 'ar' ? 'كافة الشُعب' : 'All Sections');

      return [{
        key: `unified-${selectedGrade}`,
        title: baseSched.period || baseSched.title || (lang === 'ar' ? 'جدول سير الاختبارات الموحد' : 'Unified Examination Timetable'),
        term: baseSched.term === 'term2' || baseSched.term === 'الفصل الثاني' ? (lang === 'ar' ? 'الفصل الدراسي الثاني' : 'Second Term') : (lang === 'ar' ? 'الفصل الدراسي الأول' : 'First Term'),
        grade: selectedGrade,
        sectionsLabel: sectionsStr,
        subjects: [...(baseSched.subjects || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
      }];
    }

    if (printScope === 'all_filtered') {
      const byGrade = {};
      allSchedules.forEach(s => {
        const g = s.grade || s.class?.grade_ar || s.class?.grade || 'عام';
        if (!byGrade[g]) {
          byGrade[g] = s;
        }
      });

      return Object.entries(byGrade).map(([gName, sched], idx) => {
        const gSections = (classes || []).filter(c => c.grade === gName).map(c => c.section).filter(Boolean);
        const sectionsStr = gSections.length > 0
          ? (lang === 'ar' ? `الشُعب (${gSections.join(' ، ')})` : `Sections (${gSections.join(', ')})`)
          : (sched.section ? `شعبة (${sched.section})` : '');

        return {
          key: `bulk-${idx}-${gName}`,
          title: sched.period || sched.title || (lang === 'ar' ? 'جدول سير الاختبارات' : 'Exam Timetable'),
          term: sched.term === 'term2' || sched.term === 'الفصل الثاني' ? (lang === 'ar' ? 'الفصل الدراسي الثاني' : 'Second Term') : (lang === 'ar' ? 'الفصل الدراسي الأول' : 'First Term'),
          grade: gName,
          sectionsLabel: sectionsStr,
          subjects: [...(sched.subjects || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
        };
      });
    }

    return [];
  }, [printScope, selectedGrade, selectedClassId, allSchedules, initialSchedule, classesOfSelectedGrade, classes, lang]);

  // Compute auto date range across all sheets
  const computedDateRange = useMemo(() => {
    const allDates = [];
    sheetsData.forEach(sheet => {
      (sheet.subjects || []).forEach(sub => {
        if (sub.date) allDates.push(sub.date);
      });
    });
    if (allDates.length === 0) return '';
    allDates.sort();
    const first = allDates[0];
    const last = allDates[allDates.length - 1];
    if (first === last) return first;
    return `من ${first} إلى ${last}`;
  }, [sheetsData]);

  // Auto detect typical duration from schedule
  const autoCalculatedDuration = useMemo(() => {
    for (const sheet of sheetsData) {
      for (const sub of (sheet.subjects || [])) {
        const parsed = parseTimeRange(sub.time);
        if (parsed && parsed.durationText && parsed.durationText !== '—') {
          return parsed.durationText;
        }
      }
    }
    return 'ساعتان';
  }, [sheetsData]);

  // Handle print mode and keyboard Ctrl+P cleanly
  useEffect(() => {
    if (!isOpen) return;

    const handleBeforePrint = () => {
      document.body.setAttribute('data-print-mode', 'exam-schedule');
    };
    const handleAfterPrint = () => {
      document.body.removeAttribute('data-print-mode');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      document.body.removeAttribute('data-print-mode');
    };
  }, [isOpen]);

  // Trigger print
  const handlePrint = () => {
    document.body.setAttribute('data-print-mode', 'exam-schedule');
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 60);
    });
  };

  const modalContent = (
    <div className="modal-overlay academic-print-modal-overlay" id="academic-print-modal-overlay" style={{ zIndex: 99999 }}>
      <div className="modal-container academic-print-modal-container" style={{ maxWidth: '1000px', width: '96%', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header (Hidden on print) */}
        <header className="modal-header no-print" style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={20} style={{ color: 'var(--color-primary-ui)' }} />
            <h3 className="modal-title" style={{ fontSize: '16px', margin: 0 }}>
              {lang === 'ar' ? 'طباعة جدول الاختبارات الأكاديمي الرسمي (معايير المدارس الدولية)' : 'Print Official Academic Timetable'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} title={lang === 'ar' ? 'إغلاق' : 'Close'}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        {/* Modal Controls Bar (Hidden on print) */}
        <div className="print-modal-controls no-print" style={{
          padding: '14px 20px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Top Row: Scope Selection Pills & Print Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'نطاق المستند:' : 'Scope:'}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setPrintScope('grade_unified')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: printScope === 'grade_unified' ? '1.5px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                    background: printScope === 'grade_unified' ? 'rgba(30, 80, 142, 0.1)' : 'var(--color-surface-alt)',
                    color: printScope === 'grade_unified' ? 'var(--color-primary-ui)' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {lang === 'ar' ? '🏛️ جدول موحد للصف (كافة الشُعب)' : 'Unified Grade'}
                </button>

                <button
                  type="button"
                  onClick={() => setPrintScope('single_section')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: printScope === 'single_section' ? '1.5px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                    background: printScope === 'single_section' ? 'rgba(30, 80, 142, 0.1)' : 'var(--color-surface-alt)',
                    color: printScope === 'single_section' ? 'var(--color-primary-ui)' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {lang === 'ar' ? '👤 جدول شعبة محددة' : 'Single Section'}
                </button>

                <button
                  type="button"
                  onClick={() => setPrintScope('all_filtered')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: printScope === 'all_filtered' ? '1.5px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                    background: printScope === 'all_filtered' ? 'rgba(30, 80, 142, 0.1)' : 'var(--color-surface-alt)',
                    color: printScope === 'all_filtered' ? 'var(--color-primary-ui)' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {lang === 'ar' ? '📚 طباعة مجمعة لكافة الصفوف' : 'All Grades (Booklet)'}
                </button>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-filled"
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  backgroundColor: '#0f766e',
                  boxShadow: '0 2px 6px rgba(15, 118, 110, 0.3)'
                }}
              >
                <Printer size={16} />
                <span>{lang === 'ar' ? 'طباعة المستند الرسمي (A4)' : 'Print Official A4'}</span>
              </button>
            </div>
          </div>

          {/* Second Row: Selectors & Custom Text Inputs */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingTop: '4px' }}>
            {printScope !== 'all_filtered' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                  {lang === 'ar' ? 'الصف الدراسي:' : 'Grade:'}
                </label>
                <select
                  className="text-field"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  style={{ height: '32px', fontSize: '11px', fontWeight: '600', padding: '0 8px', borderRadius: '6px' }}
                >
                  {availableGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )}

            {printScope === 'single_section' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                  {lang === 'ar' ? 'الشعبة:' : 'Section:'}
                </label>
                <select
                  className="text-field"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  style={{ height: '32px', fontSize: '11px', fontWeight: '600', padding: '0 8px', borderRadius: '6px' }}
                >
                  {classesOfSelectedGrade.map(c => {
                    const cleanId = String(c.id).replace('cls-', '');
                    return (
                      <option key={c.id} value={cleanId}>
                        {lang === 'ar' ? `شعبة (${c.section})` : `Sec (${c.sectionEn || c.section})`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Academic Year input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'العام الدراسي:' : 'Year:'}
              </label>
              <input
                type="text"
                className="text-field"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                style={{ height: '32px', width: '100px', fontSize: '11px', fontWeight: '600', padding: '0 8px', borderRadius: '6px' }}
              />
            </div>

            {/* Attendance Time input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'زمن الحضور:' : 'Attendance:'}
              </label>
              <input
                type="text"
                className="text-field"
                value={attendanceTime}
                onChange={(e) => setAttendanceTime(e.target.value)}
                placeholder="7:45 صباحاً"
                style={{ height: '32px', width: '105px', fontSize: '11px', fontWeight: '600', padding: '0 8px', borderRadius: '6px' }}
              />
            </div>

            {/* Exam Period input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'فترة الاختبارات:' : 'Period:'}
              </label>
              <input
                type="text"
                className="text-field"
                value={customExamPeriod}
                onChange={(e) => setCustomExamPeriod(e.target.value)}
                placeholder={computedDateRange || (lang === 'ar' ? 'تاريخ أو فترة الاختبارات' : 'Date range')}
                style={{ height: '32px', width: '140px', fontSize: '11px', fontWeight: '600', padding: '0 8px', borderRadius: '6px' }}
              />
            </div>

            {/* Exam Duration input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'زمن الإجابة:' : 'Duration:'}
              </label>
              <input
                type="text"
                className="text-field"
                value={customExamDuration}
                onChange={(e) => setCustomExamDuration(e.target.value)}
                placeholder={autoCalculatedDuration || 'ساعتان'}
                style={{ height: '32px', width: '110px', fontSize: '11px', fontWeight: '600', padding: '0 8px', borderRadius: '6px' }}
              />
            </div>
          </div>

          {/* Third Row: Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '4px', borderTop: '1px dashed var(--color-border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showExamDurationInRibbon}
                onChange={(e) => setShowExamDurationInRibbon(e.target.checked)}
              />
              <span style={{ color: '#0f766e', fontWeight: '700' }}>{lang === 'ar' ? '✓ إظهار زمن الإجابة بالشريط العلوي' : 'Show Duration in Ribbon'}</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showDurationInTable}
                onChange={(e) => setShowDurationInTable(e.target.checked)}
              />
              <span>{lang === 'ar' ? 'إظهار عمود زمن الإجابة بالجدول' : 'Show Duration Column in Table'}</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showAttendanceTime}
                onChange={(e) => setShowAttendanceTime(e.target.checked)}
              />
              <span>{lang === 'ar' ? 'إظهار زمن الحضور' : 'Show Attendance Time'}</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showExamPeriod}
                onChange={(e) => setShowExamPeriod(e.target.checked)}
              />
              <span>{lang === 'ar' ? 'إظهار فترة الاختبارات' : 'Show Exam Period'}</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showInstructions}
                onChange={(e) => setShowInstructions(e.target.checked)}
              />
              <span>{lang === 'ar' ? 'إظهار تعليمات وضوابط القاعة' : 'Show Instructions'}</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={(e) => setShowSignatures(e.target.checked)}
              />
              <span>{lang === 'ar' ? 'إظهار التواقيع والأختام' : 'Show Signatures & Seal'}</span>
            </label>
          </div>
        </div>

        {/* Live A4 Print Paper Preview Area */}
        <div 
          className="academic-preview-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#525659',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          <div id="academic-exam-print-area" style={{ width: '100%', maxWidth: '210mm' }}>
            {sheetsData.length > 0 ? (
              sheetsData.map((sheet, sIndex) => {
                const isLastSheet = sIndex === sheetsData.length - 1;

                // Auto date range for this specific sheet
                const sheetDates = (sheet.subjects || []).map(s => s.date).filter(Boolean).sort();
                let sheetAutoRange = '';
                if (sheetDates.length > 0) {
                  const first = sheetDates[0];
                  const last = sheetDates[sheetDates.length - 1];
                  sheetAutoRange = first === last ? first : `من ${first} إلى ${last}`;
                }

                const effectiveExamPeriod = customExamPeriod.trim() || sheetAutoRange || computedDateRange;
                const effectiveDuration = customExamDuration.trim() || autoCalculatedDuration;

                return (
                  <div
                    key={sheet.key}
                    className={`academic-exam-sheet ${!isLastSheet ? 'page-break-after' : ''}`}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      padding: '20px 24px',
                      borderRadius: '2px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                      marginBottom: isLastSheet ? '0' : '24px',
                      boxSizing: 'border-box',
                      width: '100%',
                      maxWidth: '100%',
                      direction: 'rtl',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {/* 1. Official Ministry & School Top Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.3fr 1fr 1.3fr',
                      alignItems: 'center',
                      borderBottom: '2px solid #0f172a',
                      paddingBottom: '12px',
                      marginBottom: '12px'
                    }}>
                      {/* Right: Arabic Ministry Details */}
                      <div style={{ fontSize: '11px', lineHeight: '1.6', textAlign: 'right', fontWeight: 'bold' }}>
                        <div>الجمهورية اليمنية</div>
                        <div>وزارة التربية والتعليم والبحث العلمي</div>
                        <div>مكتب التربية والتعليم بالأمانة</div>
                        <div style={{ fontWeight: '800', fontSize: '12px', color: '#0f766e', marginTop: '2px' }}>
                          مدارس أنوار العُلى الدولية النموذجية
                        </div>
                      </div>

                      {/* Center: School Emblem */}
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={sloganLogo}
                          alt="School Emblem"
                          style={{
                            height: '60px',
                            width: '60px',
                            objectFit: 'contain',
                            borderRadius: '50%',
                            border: '1.5px solid #0f172a',
                            padding: '2px',
                            backgroundColor: '#ffffff'
                          }}
                        />
                      </div>

                      {/* Left: English Ministry & School Details */}
                      <div style={{ fontSize: '10px', lineHeight: '1.5', textAlign: 'left', direction: 'ltr', fontWeight: 'bold', color: '#1e293b' }}>
                        <div>Republic of Yemen</div>
                        <div>Min. of Education & Scientific Research</div>
                        <div>Education Office - Capital Secretariat</div>
                        <div style={{ fontWeight: '800', fontSize: '11px', color: '#0f766e', marginTop: '2px' }}>
                          Anwar Al-Ola Int. Model Schools
                        </div>
                      </div>
                    </div>

                    {/* 2. Main Document Title */}
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                        {sheet.title} للعام الدراسي ({academicYear})
                      </h2>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                        {sheet.term}
                      </div>
                    </div>

                    {/* 3. Metadata Details Ribbon */}
                    <div style={{
                      border: '1px solid #1e293b',
                      backgroundColor: '#f8fafc',
                      padding: '7px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px 14px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      boxSizing: 'border-box'
                    }}>
                      <div>
                        <span>الصف الدراسي: </span>
                        <span style={{ color: '#0f766e' }}>{sheet.grade}</span>
                        {sheet.sectionsLabel && (
                          <span style={{ marginInlineStart: '6px', color: '#1e293b' }}>
                            — {sheet.sectionsLabel}
                          </span>
                        )}
                      </div>

                      {showExamPeriod && effectiveExamPeriod && (
                        <div>
                          <span>فترة الاختبارات: </span>
                          <span style={{ color: '#0f172a' }}>{effectiveExamPeriod}</span>
                        </div>
                      )}

                      {showAttendanceTime && attendanceTime.trim() && (
                        <div>
                          <span>زمن الحضور: </span>
                          <span style={{ color: '#0f172a' }}>{attendanceTime}</span>
                        </div>
                      )}

                      {showExamDurationInRibbon && effectiveDuration && (
                        <div>
                          <span>زمن الإجابة: </span>
                          <span style={{ color: '#0f766e' }}>{effectiveDuration}</span>
                        </div>
                      )}
                    </div>

                    {/* 4. Classical Academic Table */}
                    <table 
                      className="academic-classical-table" 
                      style={{ 
                        width: '100%', 
                        tableLayout: 'fixed',
                        borderCollapse: 'collapse', 
                        textAlign: 'center',
                        boxSizing: 'border-box',
                        marginBottom: '14px'
                      }}
                    >
                      <colgroup>
                        <col style={{ width: '4%' }} />   {/* م */}
                        <col style={{ width: '12%' }} />  {/* اليوم */}
                        <col style={{ width: '15%' }} />  {/* التاريخ */}
                        <col style={{ width: showDurationInTable ? '18%' : '20%' }} />  {/* المادة */}
                        <col style={{ width: showDurationInTable ? '17%' : '19%' }} />  {/* وقت الاختبار */}
                        {showDurationInTable && <col style={{ width: '11%' }} />}      {/* زمن الإجابة (اختياري) */}
                        <col style={{ width: showDurationInTable ? '25%' : '30%' }} />  {/* مقرر الاختبار والملاحظات (واسع وبدون بادينج) */}
                      </colgroup>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #0f172a' }}>
                          <th style={{ border: '1px solid #0f172a', padding: '5px 3px', fontSize: '11px', boxSizing: 'border-box' }}>م</th>
                          <th style={{ border: '1px solid #0f172a', padding: '5px 3px', fontSize: '11px', boxSizing: 'border-box' }}>اليوم</th>
                          <th style={{ border: '1px solid #0f172a', padding: '5px 3px', fontSize: '11px', boxSizing: 'border-box' }}>التاريخ</th>
                          <th style={{ border: '1px solid #0f172a', padding: '5px 5px', fontSize: '11px', textAlign: 'right', boxSizing: 'border-box' }}>المادة الدراسية</th>
                          <th style={{ border: '1px solid #0f172a', padding: '5px 3px', fontSize: '11px', boxSizing: 'border-box' }}>وقت الاختبار</th>
                          {showDurationInTable && (
                            <th style={{ border: '1px solid #0f172a', padding: '5px 3px', fontSize: '11px', boxSizing: 'border-box' }}>زمن الإجابة</th>
                          )}
                          <th className="exam-note-th" style={{ border: '1px solid #0f172a', padding: '4px 3px', fontSize: '10px', textAlign: 'right', boxSizing: 'border-box' }}>مقرر الاختبار والملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sheet.subjects.length > 0 ? (
                          sheet.subjects.map((sub, idx) => {
                            const day = formatArabicDay(sub.date);
                            const parsedTime = parseTimeRange(sub.time, lang);

                            return (
                              <tr key={sub.id || idx} style={{ backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                                <td style={{ border: '1px solid #0f172a', padding: '6px 3px', fontSize: '11px', fontWeight: 'bold', boxSizing: 'border-box' }}>
                                  {idx + 1}
                                </td>
                                <td style={{ border: '1px solid #0f172a', padding: '6px 3px', fontSize: '11px', fontWeight: 'bold', boxSizing: 'border-box' }}>
                                  {day || '—'}
                                </td>
                                <td style={{ border: '1px solid #0f172a', padding: '6px 3px', fontSize: '11px', fontFamily: 'monospace', fontWeight: '600', boxSizing: 'border-box' }}>
                                  {sub.date || '—'}
                                </td>
                                <td style={{ border: '1px solid #0f172a', padding: '6px 6px', fontSize: '12px', fontWeight: '800', textAlign: 'right', boxSizing: 'border-box' }}>
                                  {sub.subjectName || sub.name_ar || sub.subject_name || sub.name || '—'}
                                </td>
                                <td style={{ border: '1px solid #0f172a', padding: '5px 3px', fontSize: '11px', boxSizing: 'border-box' }}>
                                  {parsedTime && parsedTime.startStr && parsedTime.endStr ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: '1.35' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap', color: '#0f172a' }}>
                                        من {parsedTime.startStr}
                                      </span>
                                      <span style={{ fontSize: '10.5px', fontWeight: '700', whiteSpace: 'nowrap', color: '#334155' }}>
                                        إلى {parsedTime.endStr}
                                      </span>
                                    </div>
                                  ) : (
                                    <span style={{ fontWeight: '700' }}>{sub.time || '—'}</span>
                                  )}
                                </td>
                                {showDurationInTable && (
                                  <td style={{ border: '1px solid #0f172a', padding: '6px 3px', fontSize: '11px', color: '#1e293b', fontWeight: '600', boxSizing: 'border-box' }}>
                                    {parsedTime ? parsedTime.durationText : '—'}
                                  </td>
                                )}
                                <td 
                                  className="exam-note-cell"
                                  style={{ 
                                    border: '1px solid #0f172a', 
                                    padding: '2px 3px', 
                                    fontSize: '8.5px', 
                                    textAlign: 'right', 
                                    color: '#0f172a', 
                                    lineHeight: '1.25', 
                                    boxSizing: 'border-box', 
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    whiteSpace: 'normal',
                                    verticalAlign: 'middle'
                                  }}
                                >
                                  {sub.note || 'بحسب المقرر بالخطة الدراسية'}
                                </td>
                              </tr>
                            );
                          })

                        ) : (
                          <tr>
                            <td colSpan={showDurationInTable ? 7 : 6} style={{ padding: '20px', border: '1px solid #0f172a', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                              لا توجد مواد مسجلة في هذا الجدول
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* 5. Examination Instructions Box (Natural Flow - No forced gap) */}
                    {showInstructions && (
                      <div className="academic-instructions-box" style={{
                        border: '1px solid #1e293b',
                        backgroundColor: '#f8fafc',
                        padding: '8px 12px',
                        marginTop: '12px',
                        fontSize: '10px',
                        lineHeight: '1.6',
                        boxSizing: 'border-box'
                      }}>
                        <strong style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#0f172a' }}>
                          تعليمات وضوابط هامة لأبنائنا الطلاب وأولياء الأمور الكرام:
                        </strong>
                        <ol style={{ margin: 0, paddingInlineStart: '18px' }}>
                          <li>يبدأ الاختبار في تمام الموعد المحدد، ويُرجى حضور الطلاب إلى المدرسة قبل موعد الاختبار بـ 15 دقيقة على الأقل.</li>
                          <li>الالتزام بالزي المدرسي الكامل وإحضار كافة الأدوات الكتابية والهندسية اللازمة، حيث يُمنع منعاً باتاً تبادل الأدوات داخل القاعة.</li>
                          <li>يمنع منعاً باتاً إدخال الهواتف المحمولة أو الساعات الذكية أو أي مذكرات ورقية داخل قاعة الاختبارات.</li>
                          <li>لا يُسمح لأي طالب بمغادرة قاعة الاختبار إلا بعد انقضاء نصف الوقت المخصص للمادة.</li>
                        </ol>
                      </div>
                    )}

                    {/* 6. Official Signatures & Seal Section */}
                    {showSignatures && (
                      <div className="academic-signatures-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        marginTop: '20px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}>
                        <div>
                          <div>لجنة الكنترول والامتحانات</div>
                          <div style={{ marginTop: '28px', color: '#64748b', fontSize: '10px' }}>....................................</div>
                        </div>
                        <div>
                          <div>وكيل المرحلة / الشؤون التعليمية</div>
                          <div style={{ marginTop: '28px', color: '#64748b', fontSize: '10px' }}>....................................</div>
                        </div>
                        <div>
                          <div>مدير المدرسة والختم الرسمي</div>
                          <div style={{ marginTop: '28px', color: '#64748b', fontSize: '10px' }}>[ خــتــم الـمـدرســة ]</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ backgroundColor: '#ffffff', padding: '36px', textAlign: 'center', borderRadius: '4px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  لا توجد بيانات متاحة للطباعة وفق الخيارات المحددة.
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});

export default AcademicExamPrintModal;
