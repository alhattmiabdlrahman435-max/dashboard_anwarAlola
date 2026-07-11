import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateMonthTotal, getSubjectPeriodGrade, calculateStudentClassRowTotal } from '../../utils/gradesHelper';

export default function ClassView({ selectedClass, classPeriod, classSubject }) {
  const {
    lang,
    t,
    students,
    selectedGradeTerm,
    getStudentDetailedGrades,
    handleDetailedGradeChange,
    syncGeneralGrades,
    setToastMessage
  } = useApp();

  const getSubjectPeriodGradeLocal = (studentId, subject, term, period) => {
    return getSubjectPeriodGrade(studentId, subject, term, period, getStudentDetailedGrades);
  };

  return (
    <>
      <div style={{ padding: 'var(--space-md)', background: 'var(--gradient-brand)', color: '#ffffff', borderRadius: 'var(--radius-card)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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
              <span>
                {classSubject === 'detailed' 
                  ? (lang === 'ar' ? 'جميع المواد (تفصيلي)' : 'All Subjects (Detailed)')
                  : classSubject}
              </span>
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
                const { selectedGradeTerm } = useApp();
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
                  const mathVal = getSubjectPeriodGradeLocal(s.id, 'الرياضيات', selectedGradeTerm, classPeriod);
                  const scienceVal = getSubjectPeriodGradeLocal(s.id, 'العلوم', selectedGradeTerm, classPeriod);
                  const arabicVal = getSubjectPeriodGradeLocal(s.id, 'اللغة العربية', selectedGradeTerm, classPeriod);
                  const englishVal = getSubjectPeriodGradeLocal(s.id, 'اللغة الإنجليزية', selectedGradeTerm, classPeriod);

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
                  <th>{t.hwLabel}</th>
                  <th>{t.attLabel}</th>
                  <th>{t.behLabel}</th>
                  <th>{t.oralLabel}</th>
                  <th>{t.wrtLabel}</th>
                  <th>{t.monthTotalLabel}</th>
                </tr>
              ) : classPeriod === 'termTotal' ? (
                <tr>
                  <th>#</th>
                  <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                  <th>{t.termAverageLabel}</th>
                  <th>{t.finalExamLabel}</th>
                  <th>{t.termTotalLabel}</th>
                </tr>
              ) : (
                <tr>
                  <th>#</th>
                  <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                  <th>{lang === 'ar' ? 'الفصل الدراسي الأول (٥٠)' : 'Term 1 (50)'}</th>
                  <th>{lang === 'ar' ? 'الفصل الدراسي الثاني (٥٠)' : 'Term 2 (50)'}</th>
                  <th>{t.yearlyTotalLabel}</th>
                </tr>
              )}
            </thead>
            <tbody>
              {(() => {
                const { selectedGradeTerm } = useApp();
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
                      const t1Val = getSubjectPeriodGradeLocal(s.id, subj, selectedGradeTerm, 'termTotal');
                      const t2Val = getSubjectPeriodGradeLocal(s.id, subj, 'term2', 'termTotal');
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
                      const t1Val = getSubjectPeriodGradeLocal(s.id, subj, 'term1', 'termTotal');
                      const t2Val = getSubjectPeriodGradeLocal(s.id, subj, 'term2', 'termTotal');
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
                  <th>{t.hwLabel}</th>
                  <th>{t.attLabel}</th>
                  <th>{t.behLabel}</th>
                  <th>{t.oralLabel}</th>
                  <th>{t.wrtLabel}</th>
                  <th>{t.monthTotalLabel}</th>
                </tr>
              ) : classPeriod === 'termTotal' ? (
                <tr>
                  <th>#</th>
                  <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th>{t.termAverageLabel}</th>
                  <th>{t.finalExamLabel}</th>
                  <th>{t.termTotalLabel}</th>
                </tr>
              ) : (
                <tr>
                  <th>#</th>
                  <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th>{lang === 'ar' ? 'الفصل الدراسي الأول (٥٠)' : 'Term 1 (50)'}</th>
                  <th>{lang === 'ar' ? 'الفصل الدراسي الثاني (٥٠)' : 'Term 2 (50)'}</th>
                  <th>{t.yearlyTotalLabel}</th>
                </tr>
              )}
            </thead>
            <tbody>
              {(() => {
                const { selectedGradeTerm } = useApp();
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
                    const t1Val = getSubjectPeriodGradeLocal(s.id, classSubject, 'term1', 'termTotal');
                    const t2Val = getSubjectPeriodGradeLocal(s.id, classSubject, 'term2', 'termTotal');
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
  );
}
