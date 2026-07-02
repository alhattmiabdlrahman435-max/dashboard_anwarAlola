import React from 'react';
import { useApp } from '../../context/AppContext';
import PrintHeader from '../PrintHeader';
import { calculateMonthTotal, getSubjectPeriodGrade, calculateStudentClassRowTotal } from '../../utils/gradesHelper';

export default function PrintClassView({ selectedClass, classPeriod, classSubject }) {
  const {
    lang,
    t,
    students,
    getStudentDetailedGrades,
    selectedGradeTerm
  } = useApp();

  const getSubjectPeriodGradeLocal = (studentId, subject, term, period) => {
    return getSubjectPeriodGrade(studentId, subject, term, period, getStudentDetailedGrades);
  };

  return (
    <div style={{ display: 'none' }} className="print-class-report printable-area">
      <PrintHeader 
        title={classSubject === 'all' 
          ? `كشف درجات طلاب الفصل - ${selectedClass}`
          : classSubject === 'detailed'
          ? `كشف رصد درجات الفصل التفصيلي (لجميع المواد) - ${selectedClass}`
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
            {classSubject === 'all' 
              ? 'كشف رصد درجات الفصل العام' 
              : classSubject === 'detailed'
              ? 'كشف رصد تفصيلي لجميع المواد'
              : `كشف رصد تفصيلي لمادة ${classSubject}`
            }
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
                const mathVal = getSubjectPeriodGradeLocal(s.id, 'الرياضيات', selectedGradeTerm, classPeriod);
                const scienceVal = getSubjectPeriodGradeLocal(s.id, 'العلوم', selectedGradeTerm, classPeriod);
                const arabicVal = getSubjectPeriodGradeLocal(s.id, 'اللغة العربية', selectedGradeTerm, classPeriod);
                const englishVal = getSubjectPeriodGradeLocal(s.id, 'اللغة الإنجليزية', selectedGradeTerm, classPeriod);
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
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.termAverageLabel}</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.finalExamLabel}</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.termTotalLabel}</th>
              </tr>
            ) : (
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>#</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'الترم الأول (٥٠)' : 'Term 1 (50)'}</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{lang === 'ar' ? 'الترم الثاني (٥٠)' : 'Term 2 (50)'}</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{t.yearlyTotalLabel}</th>
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
                    const t1Val = getSubjectPeriodGradeLocal(s.id, subj, selectedGradeTerm, 'termTotal');
                    const t2Val = getSubjectPeriodGradeLocal(s.id, subj, 'term2', 'termTotal');
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
                  const t1Val = getSubjectPeriodGradeLocal(s.id, classSubject, 'term1', 'termTotal');
                  const t2Val = getSubjectPeriodGradeLocal(s.id, classSubject, 'term2', 'termTotal');
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
  );
}
