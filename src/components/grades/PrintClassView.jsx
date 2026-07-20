import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useStudents } from '../../contexts/Students/useStudents';
import { useSubjects } from '../../contexts/Subjects/useSubjects';
import { useClasses } from '../../contexts/Classes/useClasses';
import PrintHeader from '../PrintHeader';
import { calculateMonthTotal, getSubjectPeriodGrade, calculateStudentClassRowTotal } from '../../utils/gradesHelper';

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
      `${c.gradeEn} - ${c.sectionEn}` === selectedClass
    );
  }, [classes, selectedClass]);

  const targetClassId = useMemo(() => {
    if (!targetClassObj) return null;
    return typeof targetClassObj.id === 'string'
      ? targetClassObj.id.replace('cls-', '')
      : String(targetClassObj.id);
  }, [targetClassObj]);

  // Dynamic list of real students associated with selectedClass
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => {
      if (targetClassId && (String(s.class_id) === String(targetClassId) || String(s.class_id) === String(targetClassObj?.id))) {
        return true;
      }
      const sName = `${s.grade} - ${s.section}`;
      const sNameAr = `${s.grade_ar || s.grade} - ${s.section_ar || s.section}`;
      const sNameEn = `${s.gradeEn} - ${s.sectionEn}`;
      return sName === selectedClass || sNameAr === selectedClass || sNameEn === selectedClass;
    });
  }, [students, selectedClass, targetClassObj, targetClassId]);

  // Dynamic list of real subjects associated with selectedClass or overall subjects
  const classSubjectsList = useMemo(() => {
    if (targetClassObj && targetClassObj.subjects && targetClassObj.subjects.length > 0) {
      return targetClassObj.subjects;
    }
    if (subjects && subjects.length > 0) {
      return subjects.map(sub => lang === 'ar' ? sub.name : (sub.nameEn || sub.name));
    }
    return ['الرياضيات', 'العلوم', 'لغتي', 'اللغة الإنجليزية'];
  }, [targetClassObj, subjects, lang]);

  const getSubjectPeriodGradeLocal = (studentId, subject, term, period) => {
    return getSubjectPeriodGrade(studentId, subject, term, period, getStudentDetailedGrades);
  };

  return (
    <div style={{ display: 'none' }} className={`print-class-report printable-area ${classSubject === 'detailed' ? 'detailed-mode' : ''}`}>
      {classSubject === 'all' ? (
        <>
          <PrintHeader 
            title={`كشف درجات طلاب الفصل - ${selectedClass}`}
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
              <span style={{ fontWeight: 'normal' }}>كشف رصد درجات الفصل العام</span>
            </div>
          </div>

          <table style={{ 
            width: '100%', borderCollapse: 'collapse', fontSize: '11px',
            border: '1px solid #cbd5e1',
            direction: 'rtl'
          }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>#</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                {classSubjectsList.map((subj, idx) => (
                  <th key={idx} style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{subj}</th>
                ))}
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المعدل / المجموع' : 'Avg / Total'}</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s, index) => {
                const subjectVals = classSubjectsList.map(subj => getSubjectPeriodGradeLocal(s.id, subj, selectedGradeTerm, classPeriod));
                const rowSum = subjectVals.reduce((acc, v) => acc + v, 0);
                const maxPerSubj = (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' || classPeriod === 'yearlyTotal') ? 100 : 50;
                const maxTotal = classSubjectsList.length * maxPerSubj;
                const percentVal = maxTotal > 0 ? parseFloat(((rowSum / maxTotal) * 100).toFixed(1)) : 0;
                const totalText = (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' || classPeriod === 'yearlyTotal')
                  ? `${percentVal}%`
                  : `${rowSum} / ${maxTotal}`;

                return (
                  <tr key={s.id}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                    {subjectVals.map((val, vIdx) => (
                      <td key={vIdx} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{val}</td>
                    ))}
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{totalText}</td>
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
        </>
      ) : classSubject === 'detailed' ? (
        <div className="class-detailed-print-container">
          {classStudents.map((s) => {
            return (
              <div key={s.id} className="student-report-card-page">
                <PrintHeader 
                  title="كشف درجات الطالب التفصيلي"
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
                    <span>اسم الطالب: </span>
                    <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</span>
                    <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                    <span>الصف الدراسي: </span>
                    <span style={{ fontWeight: 'normal' }}>{selectedClass}</span>
                    <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
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
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.hwLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.attLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.behLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.oralLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.wrtLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.monthTotalLabel} (١٠٠)</th>
                      </tr>
                    ) : classPeriod === 'termTotal' ? (
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.termAverageLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.finalExamLabel}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.termTotalLabel}</th>
                      </tr>
                    ) : (
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'الترم الأول (٥٠)' : 'Term 1 (50)'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'الترم الثاني (٥٠)' : 'Term 2 (50)'}</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{t.yearlyTotalLabel}</th>
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
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{subj}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.homework ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.attendance ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.behavior ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.oral ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.written ?? 0}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total} / 100</td>
                          </tr>
                        );
                      } else if (classPeriod === 'termTotal') {
                        const tm1 = calculateMonthTotal(sData.m1);
                        const tm2 = calculateMonthTotal(sData.m2);
                        const tm3 = calculateMonthTotal(sData.m3);
                        const avg = parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                        const total = parseFloat((avg + (sData.finalExam || 0)).toFixed(2));
                        return (
                          <tr key={subj}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{subj}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{avg} / 20</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{sData.finalExam ?? 0} / 30</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total} / 50</td>
                          </tr>
                        );
                      } else {
                        const t1Val = getSubjectPeriodGradeLocal(s.id, subj, 'term1', 'termTotal');
                        const t2Val = getSubjectPeriodGradeLocal(s.id, subj, 'term2', 'termTotal');
                        const yearlyTotal = Math.round(t1Val + t2Val);
                        return (
                          <tr key={subj}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{subj}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{t1Val} / 50</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{t2Val} / 50</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{yearlyTotal} / 100</td>
                          </tr>
                        );
                      }
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
            );
          })}
        </div>
      ) : (
        <>
          <PrintHeader 
            title={`كشف درجات مادة ${classSubject} - ${selectedClass}`}
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
              <span style={{ fontWeight: 'normal' }}>كشف رصد تفصيلي لمادة {classSubject}</span>
            </div>
          </div>

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
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.hwLabel}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.attLabel}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.behLabel}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.oralLabel}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.wrtLabel}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.monthTotalLabel}</th>
                </tr>
              ) : classPeriod === 'termTotal' ? (
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>#</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.termAverageLabel}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.finalExamLabel}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.termTotalLabel}</th>
                </tr>
              ) : (
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>#</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'الترم الأول (٥٠)' : 'Term 1 (50)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'الترم الثاني (٥٠)' : 'Term 2 (50)'}</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.yearlyTotalLabel}</th>
                </tr>
              )}
            </thead>
            <tbody>
              {classStudents.map((s, index) => {
                const sData = getStudentDetailedGrades(s.id, classSubject, selectedGradeTerm);

                if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                  const mData = sData[classPeriod] || {};
                  const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);
                  return (
                    <tr key={s.id}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.homework ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.attendance ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.behavior ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.oral ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{mData.written ?? 0}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total} / 100</td>
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
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{avg} / 20</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{sData.finalExam ?? 0} / 30</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total} / 50</td>
                    </tr>
                  );
                } else {
                  const t1Val = getSubjectPeriodGradeLocal(s.id, classSubject, 'term1', 'termTotal');
                  const t2Val = getSubjectPeriodGradeLocal(s.id, classSubject, 'term2', 'termTotal');
                  const yearlyTotal = Math.round(t1Val + t2Val);
                  return (
                    <tr key={s.id}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: '600' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{t1Val} / 50</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{t2Val} / 50</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>{yearlyTotal} / 100</td>
                    </tr>
                  );
                }
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
        </>
      )}
    </div>
  );
}
