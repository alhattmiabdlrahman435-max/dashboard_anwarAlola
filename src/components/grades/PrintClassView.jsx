import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useStudents } from '../../contexts/Students/useStudents';
import { useSubjects } from '../../contexts/Subjects/useSubjects';
import { useClasses } from '../../contexts/Classes/useClasses';
import PrintHeader from '../PrintHeader';
import { calculateMonthTotal, getSubjectPeriodGrade } from '../../utils/gradesHelper';

// Helper for Arabic grade estimate
const getGradeEstimate = (total, max = 100) => {
  if (total === null || total === undefined || total === 0) return '-';
  const ratio = (total / max) * 100;
  if (ratio >= 90) return 'ممتاز';
  if (ratio >= 80) return 'جيد جداً';
  if (ratio >= 65) return 'جيد';
  if (ratio >= 50) return 'مقبول';
  return 'ضعيف';
};

export default function PrintClassView({ selectedClass, classPeriod, classSubject }) {
  const {
    lang,
    t,
    getStudentDetailedGrades,
    selectedGradeTerm
  } = useApp();

  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { classes } = useClasses();

  // Find target class object matching selectedClass name
  const targetClassObj = useMemo(() => {
    if (!selectedClass) return null;
    return classes.find(c =>
      c.name === selectedClass ||
      `${c.grade} - ${c.section}` === selectedClass ||
      `${c.grade_ar} - ${c.section_ar}` === selectedClass ||
      `${c.gradeEn} - ${c.sectionEn}` === selectedClass ||
      String(c.id) === String(selectedClass) ||
      String(c.id).replace('cls-', '') === String(selectedClass)
    );
  }, [classes, selectedClass]);

  const targetClassId = useMemo(() => {
    if (!targetClassObj) return null;
    return targetClassObj.numericId || (typeof targetClassObj.id === 'string'
      ? targetClassObj.id.replace(/\D/g, '')
      : String(targetClassObj.id));
  }, [targetClassObj]);

  // Dynamic list of real students associated with selectedClass
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => {
      if (targetClassId && s.class_id && Number(s.class_id) === Number(targetClassId)) {
        return true;
      }
      if (targetClassObj && targetClassObj.id && String(s.class_id) === String(targetClassObj.id)) {
        return true;
      }
      const sName = `${s.grade} - ${s.section}`;
      const sNameAr = `${s.grade_ar || s.grade} - ${s.section_ar || s.section}`;
      const sNameEn = `${s.gradeEn || s.grade} - ${s.sectionEn || s.section}`;
      return sName === selectedClass || sNameAr === selectedClass || sNameEn === selectedClass;
    });
  }, [students, selectedClass, targetClassObj, targetClassId]);

  // Dynamic list of real subjects associated with selectedClass
  const classSubjectsList = useMemo(() => {
    if (targetClassObj && Array.isArray(targetClassObj.subjects) && targetClassObj.subjects.length > 0) {
      return targetClassObj.subjects;
    }
    // Fallback: use all loaded active subjects if class-specific array isn't populated
    if (Array.isArray(subjects) && subjects.length > 0) {
      return subjects.map(s => s.name || s.name_ar).filter(Boolean);
    }
    return [];
  }, [targetClassObj, subjects]);

  const getSubjectPeriodGradeLocal = (studentId, subject, term, period) => {
    return getSubjectPeriodGrade(studentId, subject, term, period, getStudentDetailedGrades);
  };

  const periodLabelText = useMemo(() => {
    switch (classPeriod) {
      case 'm1': return 'المحصلة الأولى';
      case 'm2': return 'المحصلة الثانية';
      case 'm3': return 'المحصلة الثالثة';
      case 'termTotal': return 'مجموع الترم';
      case 'yearlyTotal': return 'المجموع السنوي';
      default: return classPeriod;
    }
  }, [classPeriod]);

  const termLabelText = selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label;

  return (
    <div 
      style={{ display: 'none' }} 
      className={`print-class-report printable-area ${classSubject === 'all' ? 'landscape-mode' : classSubject === 'detailed' ? 'detailed-mode' : 'portrait-mode'}`}
    >
      {/* ========================================================================= */}
      {/* 1. كشف المحصلة العام للفصل (جميع المواد - A4 Landscape)                    */}
      {/* ========================================================================= */}
      {classSubject === 'all' ? (
        <>
          <PrintHeader 
            title={`كشف المحصلة العام للفصل - ${selectedClass}`}
            subtitle={lang === 'ar' 
              ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${termLabelText} | الفترة التقييمية: ${periodLabelText}`
              : `Academic Year: 2026 | Term: ${termLabelText} | Assessment: ${periodLabelText}`
            }
          />

          <div className="printable-only-metadata" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '6px 0', 
            marginBottom: '12px',
            borderBottom: '1px dashed #cbd5e1',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#0f172a',
            direction: 'rtl'
          }}>
            <div>
              <span>الصف والشعبة: </span>
              <span style={{ fontWeight: 'normal' }}>{selectedClass}</span>
              <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
              <span>التقرير: </span>
              <span style={{ fontWeight: 'normal' }}>كشف رصد المحصلة العام لجميع مواد الفصل</span>
            </div>
            <div>
              <span>عدد الطلاب: </span>
              <span style={{ fontWeight: 'normal' }}>{classStudents.length}</span>
              <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
              <span>عدد المواد المقررة: </span>
              <span style={{ fontWeight: 'normal' }}>{classSubjectsList.length}</span>
            </div>
          </div>

          <table className="class-general-print-table" style={{ 
            width: '100%', 
            tableLayout: 'fixed', 
            borderCollapse: 'collapse', 
            fontSize: '9.5px',
            border: '1.5px solid #64748b',
            direction: 'rtl'
          }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ width: '3%', border: '1px solid #64748b', padding: '4px 2px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>#</th>
                <th style={{ width: '19%', border: '1px solid #64748b', padding: '4px 4px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                {classSubjectsList.map((subj, idx) => {
                  const subColWidth = `${64 / Math.max(classSubjectsList.length, 1)}%`;
                  return (
                    <th key={idx} style={{ width: subColWidth, border: '1px solid #64748b', padding: '4px 2px', textAlign: 'center', fontWeight: '700', color: '#0f172a', fontSize: '9px', lineHeight: 1.15 }}>
                      {subj}
                    </th>
                  );
                })}
                <th style={{ width: '7.5%', border: '1px solid #64748b', padding: '4px 2px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>{lang === 'ar' ? 'المجموع' : 'Total'}</th>
                <th style={{ width: '6.5%', border: '1px solid #64748b', padding: '4px 2px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>{lang === 'ar' ? 'المعدل %' : 'Rate %'}</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const subjectSums = {};
                const subjectPassCounts = {};
                classSubjectsList.forEach(s => { 
                  subjectSums[s] = 0; 
                  subjectPassCounts[s] = 0; 
                });
                let overallTotalSum = 0;
                let overallPercentageSum = 0;
                let overallPassCount = 0;

                const maxPerSubj = (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' || classPeriod === 'yearlyTotal') ? 100 : 50;
                const maxTotal = classSubjectsList.length * maxPerSubj;
                const passThreshold = maxPerSubj * 0.5;

                const studentRows = classStudents.map((s, index) => {
                  const subjectVals = classSubjectsList.map(subj => {
                    const val = getSubjectPeriodGradeLocal(s.id, subj, selectedGradeTerm, classPeriod);
                    subjectSums[subj] = (subjectSums[subj] || 0) + val;
                    if (val >= passThreshold) {
                      subjectPassCounts[subj] = (subjectPassCounts[subj] || 0) + 1;
                    }
                    return val;
                  });

                  const rowSum = subjectVals.reduce((acc, v) => acc + v, 0);
                  const percentVal = maxTotal > 0 ? parseFloat(((rowSum / maxTotal) * 100).toFixed(1)) : 0;
                  
                  overallTotalSum += rowSum;
                  overallPercentageSum += percentVal;
                  if (percentVal >= 50) {
                    overallPassCount++;
                  }

                  return (
                    <tr key={s.id} style={{ height: '22px' }}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '3px 2px', textAlign: 'center' }}>{index + 1}</td>
                      <td className="student-name-cell" style={{ border: '1px solid #cbd5e1', padding: '3px 4px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lang === 'ar' ? s.name : (s.nameEn || s.name)}
                      </td>
                      {subjectVals.map((val, vIdx) => (
                        <td key={vIdx} style={{ border: '1px solid #cbd5e1', padding: '3px 2px', textAlign: 'center', color: val < passThreshold ? '#b91c1c' : '#0f172a' }}>
                          {val}
                        </td>
                      ))}
                      <td className="total-cell" style={{ border: '1px solid #cbd5e1', padding: '3px 2px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                        {rowSum}
                      </td>
                      <td className="percentage-cell" style={{ border: '1px solid #cbd5e1', padding: '3px 2px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f1f5f9', color: percentVal >= 50 ? '#0f766e' : '#b91c1c' }}>
                        {percentVal}%
                      </td>
                    </tr>
                  );
                });

                const count = classStudents.length || 1;
                const classOverallAvgPercent = parseFloat((overallPercentageSum / count).toFixed(1));
                const classOverallAvgTotal = parseFloat((overallTotalSum / count).toFixed(1));
                const overallPassRate = parseFloat(((overallPassCount / count) * 100).toFixed(0));

                return (
                  <>
                    {studentRows}
                    {/* Footer Row 1: مجموع درجات الفصل */}
                    <tr style={{ background: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #64748b' }}>
                      <td colSpan="2" style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'right' }}>
                        {lang === 'ar' ? 'مجموع درجات الفصل:' : 'Class Sum:'}
                      </td>
                      {classSubjectsList.map((subj, idx) => (
                        <td key={idx} style={{ border: '1px solid #cbd5e1', padding: '4px 2px', textAlign: 'center', color: '#0f766e' }}>
                          {subjectSums[subj] || 0}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 2px', textAlign: 'center', fontWeight: 'bold', color: '#0f766e' }}>
                        {overallTotalSum}
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 2px', textAlign: 'center', color: '#64748b' }}>-</td>
                    </tr>

                    {/* Footer Row 2: متوسط درجات الفصل */}
                    <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                      <td colSpan="2" style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'right' }}>
                        {lang === 'ar' ? `متوسط درجات الفصل (من ${maxPerSubj}):` : 'Class Average:'}
                      </td>
                      {classSubjectsList.map((subj, idx) => {
                        const avg = parseFloat(((subjectSums[subj] || 0) / count).toFixed(1));
                        return (
                          <td key={idx} style={{ border: '1px solid #cbd5e1', padding: '4px 2px', textAlign: 'center', color: '#1e3a8a' }}>
                            {avg}
                          </td>
                        );
                      })}
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 2px', textAlign: 'center', fontWeight: 'bold', color: '#1e3a8a' }}>
                        {classOverallAvgTotal}
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 2px', textAlign: 'center', fontWeight: 'bold', color: '#0f766e' }}>
                        {classOverallAvgPercent}%
                      </td>
                    </tr>

                    {/* Footer Row 3: نسبة النجاح في كل مادة */}
                    <tr style={{ background: '#ffffff', fontWeight: 'bold' }}>
                      <td colSpan="2" style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'right' }}>
                        {lang === 'ar' ? 'نسبة النجاح بالمادة (≥ ٥٠%):' : 'Pass Rate %:'}
                      </td>
                      {classSubjectsList.map((subj, idx) => {
                        const pRate = parseFloat((((subjectPassCounts[subj] || 0) / count) * 100).toFixed(0));
                        return (
                          <td key={idx} style={{ border: '1px solid #cbd5e1', padding: '4px 2px', textAlign: 'center', color: pRate >= 70 ? '#15803d' : pRate >= 50 ? '#b45309' : '#b91c1c' }}>
                            {pRate}%
                          </td>
                        );
                      })}
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 2px', textAlign: 'center', color: '#64748b' }}>-</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 2px', textAlign: 'center', fontWeight: 'bold', color: overallPassRate >= 70 ? '#15803d' : '#b45309' }}>
                        {overallPassRate}%
                      </td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>

          {/* Official Signatures Row */}
          <div className="print-signatures-row" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '20px', 
            paddingTop: '14px',
            borderTop: '1px solid #cbd5e1',
            direction: 'rtl',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#0f172a'
          }}>
            <div style={{ textAlign: 'center', width: '22%' }}>
              <div>مربي الفصل</div>
              <div style={{ height: '30px' }}></div>
              <div style={{ borderBottom: '1px dotted #94a3b8', width: '85%', margin: '0 auto' }}></div>
            </div>
            <div style={{ textAlign: 'center', width: '22%' }}>
              <div>المشرف التربوي</div>
              <div style={{ height: '30px' }}></div>
              <div style={{ borderBottom: '1px dotted #94a3b8', width: '85%', margin: '0 auto' }}></div>
            </div>
            <div style={{ textAlign: 'center', width: '22%' }}>
              <div>وكيل الشؤون التعليمية</div>
              <div style={{ height: '30px' }}></div>
              <div style={{ borderBottom: '1px dotted #94a3b8', width: '85%', margin: '0 auto' }}></div>
            </div>
            <div style={{ textAlign: 'center', width: '22%' }}>
              <div>مدير المدرسة والختم</div>
              <div style={{ height: '30px' }}></div>
              <div style={{ borderBottom: '1px dotted #94a3b8', width: '85%', margin: '0 auto' }}></div>
            </div>
          </div>
        </>
      ) : classSubject === 'detailed' ? (
        /* ========================================================================= */
        /* 2. كشوفات تفصيلية فردية للطلاب                                             */
        /* ========================================================================= */
        <div className="class-detailed-print-container">
          {classStudents.map((s) => {
            return (
              <div key={s.id} className="student-report-card-page">
                <PrintHeader 
                  title="كشف درجات الطالب التفصيلي"
                  subtitle={lang === 'ar' 
                    ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${termLabelText} | الفترة: ${periodLabelText}`
                    : `Academic Year: 2026 | Term: ${termLabelText} | Period: ${periodLabelText}`
                  }
                />

                <div className="printable-only-metadata" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '8px 0', 
                  marginBottom: '16px',
                  borderBottom: '1px dashed #cbd5e1',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  direction: 'rtl'
                }}>
                  <div>
                    <span>اسم الطالب: </span>
                    <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</span>
                    <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                    <span>رقم القيد: </span>
                    <span style={{ fontWeight: 'normal' }}>{s.student_code || s.id}</span>
                    <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                    <span>الصف الدراسي: </span>
                    <span style={{ fontWeight: 'normal' }}>{selectedClass}</span>
                  </div>
                  <div>
                    <span>التقرير: </span>
                    <span style={{ fontWeight: 'normal' }}>كشف رصد تفصيلي لجميع المواد</span>
                  </div>
                </div>

                <table className="control-grade-table" style={{ 
                  width: '100%', borderCollapse: 'collapse', fontSize: '11px',
                  border: '1.5px solid #0f766e',
                  direction: 'rtl'
                }}>
                  <thead>
                    {classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' ? (
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.hwLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.attLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.behLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.oralLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.wrtLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.monthTotalLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>التقدير</th>
                      </tr>
                    ) : classPeriod === 'termTotal' ? (
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.termAverageLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.finalExamLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.termTotalLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>التقدير</th>
                      </tr>
                    ) : (
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'الترم الأول (٥٠)' : 'Term 1 (50)'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'الترم الثاني (٥٠)' : 'Term 2 (50)'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.yearlyTotalLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>التقدير</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {classSubjectsList.map((subj) => {
                      const sData = getStudentDetailedGrades(s.id, subj, selectedGradeTerm);

                      if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                        const mData = sData[classPeriod] || {};
                        const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);
                        return (
                          <tr key={subj}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', fontWeight: '600' }}>{subj}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{mData.homework ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{mData.attendance ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{mData.behavior ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{mData.oral ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{mData.written ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total} / 100</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', fontWeight: '600' }}>{getGradeEstimate(total, 100)}</td>
                          </tr>
                        );
                      } else if (classPeriod === 'termTotal') {
                        const tm1 = calculateMonthTotal(sData.m1);
                        const tm2 = calculateMonthTotal(sData.m2);
                        const tm3 = calculateMonthTotal(sData.m3);
                        const avg = (sData.coursework !== undefined && sData.coursework !== null && sData.coursework !== '')
                          ? parseFloat(sData.coursework)
                          : parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                        const total = parseFloat((avg + (sData.finalExam || 0)).toFixed(2));
                        return (
                          <tr key={subj}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', fontWeight: '600' }}>{subj}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{avg} / 20</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{sData.finalExam ?? 0} / 30</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total} / 50</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', fontWeight: '600' }}>{getGradeEstimate(total, 50)}</td>
                          </tr>
                        );
                      } else {
                        const t1Val = getSubjectPeriodGradeLocal(s.id, subj, 'term1', 'termTotal');
                        const t2Val = getSubjectPeriodGradeLocal(s.id, subj, 'term2', 'termTotal');
                        const yearlyTotal = Math.round(t1Val + t2Val);
                        return (
                          <tr key={subj}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', fontWeight: '600' }}>{subj}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{t1Val} / 50</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center' }}>{t2Val} / 50</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>{yearlyTotal} / 100</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', fontWeight: '600' }}>{getGradeEstimate(yearlyTotal, 100)}</td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>

                <div className="print-signatures-row" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '30px', 
                  paddingTop: '16px', 
                  borderTop: '1px solid #cbd5e1', 
                  direction: 'rtl', 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  color: '#0f172a' 
                }}>
                  <div style={{ textAlign: 'center', width: '30%' }}>
                    <div>مربي الفصل</div>
                    <div style={{ height: '30px' }}></div>
                    <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
                  </div>
                  <div style={{ textAlign: 'center', width: '30%' }}>
                    <div>المرشد الطلابي</div>
                    <div style={{ height: '30px' }}></div>
                    <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
                  </div>
                  <div style={{ textAlign: 'center', width: '30%' }}>
                    <div>مدير المدرسة / الختم</div>
                    <div style={{ height: '30px' }}></div>
                    <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. كشف رصد المادة للمعلم (مادة محددة - طباعة رسمية A4 Portrait)             */
        /* ========================================================================= */
        <>
          <PrintHeader 
            title={`كشف رصد درجات مادة ${classSubject}`}
            subtitle={lang === 'ar' 
              ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${termLabelText} | الفترة التقييمية: ${periodLabelText}`
              : `Academic Year: 2026 | Term: ${termLabelText} | Assessment: ${periodLabelText}`
            }
          />

          {/* Official Subject Teacher Metadata Box */}
          <div className="printable-only-metadata" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '8px 12px', 
            marginBottom: '14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#0f172a',
            direction: 'rtl'
          }}>
            <div>
              <span>الصف والشعبة: </span>
              <span style={{ fontWeight: 'normal', color: '#0f766e' }}>{selectedClass}</span>
              <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
              <span>المادة الدراسية: </span>
              <span style={{ fontWeight: 'normal', color: '#0f766e' }}>{classSubject}</span>
            </div>
            <div>
              <span>الفترة: </span>
              <span style={{ fontWeight: 'normal' }}>{periodLabelText}</span>
              <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
              <span>عدد الطلاب المقيدين: </span>
              <span style={{ fontWeight: 'normal' }}>{classStudents.length}</span>
            </div>
          </div>

          <table className="subject-teacher-print-table" style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontSize: '11px',
            border: '1.5px solid #64748b',
            direction: 'rtl'
          }}>
            <thead>
              {classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' ? (
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '4%' }}>#</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '11%' }}>{lang === 'ar' ? 'رقم القيد' : 'Code'}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 6px', textAlign: 'right', width: '25%' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '8%' }}>{t.hwLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '8%' }}>{t.attLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '8%' }}>{t.behLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '8%' }}>{t.oralLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '9%' }}>{t.wrtLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '11%', background: '#e2e8f0', fontWeight: 'bold' }}>{t.monthTotalLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '8%' }}>التقدير</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '8%' }}>ملاحظات</th>
                </tr>
              ) : classPeriod === 'termTotal' ? (
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '5%' }}>#</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '13%' }}>{lang === 'ar' ? 'رقم القيد' : 'Code'}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 6px', textAlign: 'right', width: '30%' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '13%' }}>{t.termAverageLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '13%' }}>{t.finalExamLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '14%', background: '#e2e8f0' }}>{t.termTotalLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '12%' }}>التقدير</th>
                </tr>
              ) : (
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '5%' }}>#</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '13%' }}>{lang === 'ar' ? 'رقم القيد' : 'Code'}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 6px', textAlign: 'right', width: '30%' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '13%' }}>{lang === 'ar' ? 'الترم الأول (٥٠)' : 'Term 1 (50)'}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '13%' }}>{lang === 'ar' ? 'الترم الثاني (٥٠)' : 'Term 2 (50)'}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '14%', background: '#e2e8f0' }}>{t.yearlyTotalLabel}</th>
                  <th style={{ border: '1px solid #64748b', padding: '6px 4px', textAlign: 'center', width: '12%' }}>التقدير</th>
                </tr>
              )}
            </thead>
            <tbody>
              {(() => {
                let hwSum = 0, attSum = 0, behSum = 0, oralSum = 0, wrtSum = 0, monthTotSum = 0;
                let avgSum = 0, finalSum = 0, termTotSum = 0;
                let t1Sum = 0, t2Sum = 0, yearlySum = 0;
                let passCount = 0;
                let maxGrade = -1;
                let minGrade = 999;

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

                    if (total >= 50) passCount++;
                    if (total > maxGrade) maxGrade = total;
                    if (total < minGrade) minGrade = total;

                    return (
                      <tr key={s.id}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', color: '#64748b' }}>{s.student_code || s.id}</td>
                        <td className="student-name-cell" style={{ border: '1px solid #cbd5e1', padding: '5px 6px', fontWeight: '600' }}>
                          {lang === 'ar' ? s.name : (s.nameEn || s.name)}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{mData.homework ?? 0}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{mData.attendance ?? 0}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{mData.behavior ?? 0}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{mData.oral ?? 0}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{mData.written ?? 0}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8fafc', color: total >= 50 ? '#0f766e' : '#b91c1c' }}>
                          {total}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', fontWeight: '600' }}>
                          {getGradeEstimate(total, 100)}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', color: '#94a3b8' }}>-</td>
                      </tr>
                    );
                  } else if (classPeriod === 'termTotal') {
                    const tm1 = calculateMonthTotal(sData.m1);
                    const tm2 = calculateMonthTotal(sData.m2);
                    const tm3 = calculateMonthTotal(sData.m3);
                    const avg = (sData.coursework !== undefined && sData.coursework !== null && sData.coursework !== '')
                      ? parseFloat(sData.coursework)
                      : parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                    const total = parseFloat((avg + (sData.finalExam || 0)).toFixed(2));
                    avgSum += avg;
                    finalSum += sData.finalExam || 0;
                    termTotSum += total;

                    if (total >= 25) passCount++;
                    if (total > maxGrade) maxGrade = total;
                    if (total < minGrade) minGrade = total;

                    return (
                      <tr key={s.id}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', color: '#64748b' }}>{s.student_code || s.id}</td>
                        <td className="student-name-cell" style={{ border: '1px solid #cbd5e1', padding: '5px 6px', fontWeight: '600' }}>
                          {lang === 'ar' ? s.name : (s.nameEn || s.name)}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{avg} / 20</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{sData.finalExam ?? 0} / 30</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                          {total} / 50
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', fontWeight: '600' }}>
                          {getGradeEstimate(total, 50)}
                        </td>
                      </tr>
                    );
                  } else {
                    const t1Val = getSubjectPeriodGradeLocal(s.id, classSubject, 'term1', 'termTotal');
                    const t2Val = getSubjectPeriodGradeLocal(s.id, classSubject, 'term2', 'termTotal');
                    const yearlyTotal = Math.round(t1Val + t2Val);
                    t1Sum += t1Val;
                    t2Sum += t2Val;
                    yearlySum += yearlyTotal;

                    if (yearlyTotal >= 50) passCount++;
                    if (yearlyTotal > maxGrade) maxGrade = yearlyTotal;
                    if (yearlyTotal < minGrade) minGrade = yearlyTotal;

                    return (
                      <tr key={s.id}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', color: '#64748b' }}>{s.student_code || s.id}</td>
                        <td className="student-name-cell" style={{ border: '1px solid #cbd5e1', padding: '5px 6px', fontWeight: '600' }}>
                          {lang === 'ar' ? s.name : (s.nameEn || s.name)}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{t1Val} / 50</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center' }}>{t2Val} / 50</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                          {yearlyTotal} / 100
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px 4px', textAlign: 'center', fontWeight: '600' }}>
                          {getGradeEstimate(yearlyTotal, 100)}
                        </td>
                      </tr>
                    );
                  }
                });

                const count = classStudents.length || 1;
                const passRate = parseFloat(((passCount / count) * 100).toFixed(0));

                return (
                  <>
                    {rows}
                    {/* Summary row in table */}
                    <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #64748b' }}>
                      <td colSpan="3" style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right' }}>
                        {lang === 'ar' ? 'متوسط درجات الفصل:' : 'Class Average:'}
                      </td>
                      {classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' ? (
                        <>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{parseFloat((hwSum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{parseFloat((attSum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{parseFloat((behSum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{parseFloat((oralSum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{parseFloat((wrtSum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center', color: '#0f766e', fontSize: '12px' }}>
                            {parseFloat((monthTotSum / count).toFixed(1))}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{getGradeEstimate(parseFloat((monthTotSum / count).toFixed(1)), 100)}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>-</td>
                        </>
                      ) : classPeriod === 'termTotal' ? (
                        <>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{parseFloat((avgSum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{parseFloat((finalSum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center', color: '#0f766e' }}>{parseFloat((termTotSum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{getGradeEstimate(parseFloat((termTotSum / count).toFixed(1)), 50)}</td>
                        </>
                      ) : (
                        <>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{parseFloat((t1Sum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{parseFloat((t2Sum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center', color: '#0f766e' }}>{parseFloat((yearlySum / count).toFixed(1))}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center' }}>{getGradeEstimate(parseFloat((yearlySum / count).toFixed(1)), 100)}</td>
                        </>
                      )}
                    </tr>

                    {/* Statistics Summary Box */}
                    <tr>
                      <td colSpan={classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' ? 11 : 7} style={{ padding: '0', border: 'none' }}>
                        <div className="print-stats-box" style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          margin: '12px 0 0 0', 
                          padding: '8px 14px', 
                          backgroundColor: '#f8fafc', 
                          border: '1px solid #cbd5e1', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: '#0f172a'
                        }}>
                          <div><span>إجمالي المقيدين: </span><span style={{ fontWeight: 'normal' }}>{count}</span></div>
                          <div><span>الناجحون (≥ ٥٠%): </span><span style={{ fontWeight: 'normal', color: '#15803d' }}>{passCount}</span></div>
                          <div><span>نسبة النجاح: </span><span style={{ fontWeight: 'normal', color: '#0f766e' }}>{passRate}%</span></div>
                          <div><span>أعلى درجة: </span><span style={{ fontWeight: 'normal' }}>{maxGrade >= 0 ? maxGrade : '-'}</span></div>
                          <div><span>أدنى درجة: </span><span style={{ fontWeight: 'normal' }}>{minGrade <= 100 ? minGrade : '-'}</span></div>
                        </div>
                      </td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>

          {/* Official Signatures Row */}
          <div className="print-signatures-row" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '26px', 
            paddingTop: '16px',
            borderTop: '1px solid #cbd5e1',
            direction: 'rtl',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#0f172a'
          }}>
            <div style={{ textAlign: 'center', width: '22%' }}>
              <div>معلم المادة</div>
              <div style={{ height: '32px' }}></div>
              <div style={{ borderBottom: '1px dotted #94a3b8', width: '85%', margin: '0 auto' }}></div>
            </div>
            <div style={{ textAlign: 'center', width: '22%' }}>
              <div>المشرف التربوي</div>
              <div style={{ height: '32px' }}></div>
              <div style={{ borderBottom: '1px dotted #94a3b8', width: '85%', margin: '0 auto' }}></div>
            </div>
            <div style={{ textAlign: 'center', width: '22%' }}>
              <div>وكيل الشؤون التعليمية</div>
              <div style={{ height: '32px' }}></div>
              <div style={{ borderBottom: '1px dotted #94a3b8', width: '85%', margin: '0 auto' }}></div>
            </div>
            <div style={{ textAlign: 'center', width: '22%' }}>
              <div>مدير المدرسة والختم</div>
              <div style={{ height: '32px' }}></div>
              <div style={{ borderBottom: '1px dotted #94a3b8', width: '85%', margin: '0 auto' }}></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

