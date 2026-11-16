import { memo, useMemo, useState } from 'react';
import { Printer, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useStudents } from '../../contexts/Students/useStudents';
import { useSubjects } from '../../contexts/Subjects/useSubjects';
import { useClasses } from '../../contexts/Classes/useClasses';
import { calculateMonthTotal } from '../../utils/gradesHelper';
import GradeInput from './GradeInput';

const MonthlySheetsView = memo(function MonthlySheetsView({
  selectedClass,
  selectedMonth,
  selectedSubject,
  calendarMonthName: propMonthName,
  onChangeCalendarMonthName,
  onPrintSheet,
}) {
  const {
    lang,
    t,
    selectedGradeTerm,
    getStudentDetailedGrades,
    handleDetailedGradeChange: handleDetailedGradeChangeContext,
    canAction,
  } = useApp();

  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { classes } = useClasses();

  const targetClassObj = useMemo(() => {
    if (!selectedClass) return null;
    return classes.find((c) =>
      c.name === selectedClass ||
      `${c.grade} - ${c.section}` === selectedClass ||
      `${c.grade_ar} - ${c.section_ar}` === selectedClass ||
      String(c.id) === String(selectedClass)
    );
  }, [classes, selectedClass]);

  const targetClassId = targetClassObj
    ? (targetClassObj.numericId || String(targetClassObj.id).replace(/\D/g, ''))
    : null;

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students
      .filter((s) => {
        if (targetClassId && s.class_id && Number(s.class_id) === Number(targetClassId)) return true;
        return `${s.grade} - ${s.section}` === selectedClass || `${s.grade_ar} - ${s.section_ar}` === selectedClass;
      })
      .sort((a, b) => (a.name || a.name_ar || '').localeCompare(b.name || b.name_ar || '', 'ar'));
  }, [students, selectedClass, targetClassId]);

  const subjectName = useMemo(() => {
    if (selectedSubject && selectedSubject !== 'all') return selectedSubject;
    const first = subjects?.[0];
    return first ? (first.name || first.name_ar) : 'القرآن الكريم';
  }, [selectedSubject, subjects]);

  const assignedTeacher = targetClassObj?.subject_teachers?.[subjectName] || '';
  const [teacherOverride, setTeacherOverride] = useState('');
  const [localMonthName, setLocalMonthName] = useState('نوفمبر');
  const calendarMonthName = propMonthName || localMonthName;
  const setCalendarMonthName = onChangeCalendarMonthName || setLocalMonthName;
  const displayTeacher = teacherOverride || assignedTeacher || (lang === 'ar' ? 'غير محدد' : 'Unassigned');

  const monthLabel = selectedMonth === 'm1'
    ? 'المحصلة الأولى'
    : selectedMonth === 'm2'
      ? 'المحصلة الثانية'
      : 'المحصلة الثالثة';

  const sheetTitle = `كشف ${monthLabel} .. شهر ${calendarMonthName}`;

  const termLabel = selectedGradeTerm === 'term1'
    ? (lang === 'ar' ? 'الترم الأول' : 'Term 1')
    : (lang === 'ar' ? 'الترم الثاني' : 'Term 2');

  const handleChange = (studentId, field, val) => {
    handleDetailedGradeChangeContext(
      studentId,
      subjectName,
      selectedGradeTerm,
      selectedMonth,
      field,
      val,
      students,
      subjects
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* بطاقة بيانات المحصلة الشهرية واسم المعلم */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 18px',
          borderRadius: '14px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.08))',
          border: '1px solid rgba(37,99,235,0.18)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>{lang === 'ar' ? 'اسم الكشف:' : 'Sheet Title:'} </span>
            <strong style={{ color: '#1e3a8a' }}>{sheetTitle}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>{lang === 'ar' ? 'الشهر:' : 'Month:'}</span>
            <select
              value={calendarMonthName}
              onChange={(e) => setCalendarMonthName(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: '8px',
                border: '1px solid rgba(148,163,184,0.4)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>{lang === 'ar' ? 'الفترة:' : 'Period:'} </span>
            <strong>{termLabel}</strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>{lang === 'ar' ? 'الصف / الشعبة:' : 'Class:'} </span>
            <strong>{selectedClass}</strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>{lang === 'ar' ? 'المادة:' : 'Subject:'} </span>
            <strong>{subjectName}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={15} style={{ color: '#059669' }} />
            <span style={{ fontSize: '12px', opacity: 0.75 }}>{lang === 'ar' ? 'معلم المادة:' : 'Teacher:'}</span>
            <input
              type="text"
              value={teacherOverride || assignedTeacher}
              placeholder={displayTeacher}
              onChange={(e) => setTeacherOverride(e.target.value)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(148,163,184,0.4)',
                fontSize: '13px',
                fontWeight: 700,
                minWidth: '150px',
              }}
            />
          </div>
        </div>

        {onPrintSheet && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              className="lang-btn"
              onClick={() => onPrintSheet({ template: 'template_1_blank_year', subjectName, teacherName: displayTeacher, monthLabel, calendarMonthName, termLabel })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontWeight: 700 }}
            >
              <Printer size={15} />
              <span>{lang === 'ar' ? 'طباعة كشف فارغ طوال العام' : 'Print Blank Sheet'}</span>
            </button>
            <button
              type="button"
              className="btn-primary-glass"
              onClick={() => onPrintSheet({ template: 'template_2_monthly_sheet', subjectName, teacherName: displayTeacher, monthLabel, calendarMonthName, termLabel })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <Printer size={15} />
              <span>{lang === 'ar' ? 'طباعة كشف الشهر بالدرجات' : 'Print Filled Monthly Sheet'}</span>
            </button>
          </div>
        )}
      </div>

      {/* جدول المحصلة الشهرية */}
      <div className="control-grade-table-container">
        <table className="control-grade-table">
          <thead>
            <tr>
              <th style={{ width: '48px' }}>#</th>
              <th className="sticky-col-name" style={{ textAlign: 'right', minWidth: '200px' }}>
                {lang === 'ar' ? 'اسم الطالب' : 'Student Name'}
              </th>
              <th>{t.hwLabel || 'الواجبات (15)'}</th>
              <th>{t.attLabel || 'المواظبة (15)'}</th>
              <th>{t.behLabel || 'السلوك (10)'}</th>
              <th>{t.oralLabel || 'الشفهي (10)'}</th>
              <th>{t.wrtLabel || 'التحريري (50)'}</th>
              <th>{lang === 'ar' ? 'المجموع (100)' : 'Total (100)'}</th>
              <th>{lang === 'ar' ? 'المحصلة (20)' : 'Coursework (20)'}</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
                  {lang === 'ar' ? 'لا يوجد طلاب في هذا الصف.' : 'No students in this class.'}
                </td>
              </tr>
            ) : (
              classStudents.map((st, idx) => {
                const sData = getStudentDetailedGrades(st.id, subjectName, selectedGradeTerm);
                const mData = sData?.[selectedMonth] || {};
                const total100 = calculateMonthTotal(mData);
                const outOf20 = parseFloat((total100 / 5).toFixed(2));
                const editable = canAction('detailedGrades', 'update');

                return (
                  <tr key={st.id}>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                    <td className="sticky-col-name" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {lang === 'ar' ? (st.name || st.name_ar) : (st.nameEn || st.name)}
                    </td>
                    <td>
                      <GradeInput min="0" max="15" value={mData.homework ?? 0} disabled={!editable} onChange={(val) => handleChange(st.id, 'homework', val)} />
                    </td>
                    <td>
                      <GradeInput min="0" max="15" value={mData.attendance ?? 0} disabled={!editable} onChange={(val) => handleChange(st.id, 'attendance', val)} />
                    </td>
                    <td>
                      <GradeInput min="0" max="10" value={mData.behavior ?? 0} disabled={!editable} onChange={(val) => handleChange(st.id, 'behavior', val)} />
                    </td>
                    <td>
                      <GradeInput min="0" max="10" value={mData.oral ?? 0} disabled={!editable} onChange={(val) => handleChange(st.id, 'oral', val)} />
                    </td>
                    <td>
                      <GradeInput min="0" max="50" value={mData.written ?? 0} disabled={!editable} onChange={(val) => handleChange(st.id, 'written', val)} />
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: total100 >= 50 ? '#047857' : '#dc2626' }}>
                      {total100}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, backgroundColor: 'rgba(37, 99, 235, 0.06)' }}>
                      {outOf20}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* خانة توقيع المعلم واعتماد الإدارة */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px dashed rgba(148,163,184,0.5)',
          fontSize: '13px',
        }}
      >
        <div>
          <strong>{lang === 'ar' ? 'معلم المادة:' : 'Subject Teacher:'}</strong> {displayTeacher}
        </div>
        <div>
          <strong>{lang === 'ar' ? 'توقيع المعلم:' : 'Teacher Signature:'}</strong> ______________________
        </div>
        <div>
          <strong>{lang === 'ar' ? 'اعتماد الوكيل / الإدارة:' : 'Supervisor Approval:'}</strong> ______________________
        </div>
      </div>
    </div>
  );
});

export default MonthlySheetsView;
