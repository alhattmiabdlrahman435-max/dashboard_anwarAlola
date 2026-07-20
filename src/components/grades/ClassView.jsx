import { memo, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useStudents } from '../../contexts/Students/useStudents';
import { useSubjects } from '../../contexts/Subjects/useSubjects';
import { useClasses } from '../../contexts/Classes/useClasses';
import { calculateMonthTotal, getSubjectPeriodGrade, calculateStudentClassRowTotal } from '../../utils/gradesHelper';
import GradeInput from './GradeInput';

const ClassView = memo(function ClassView({ selectedClass, classPeriod, classSubject }) {
  const {
    lang,
    t,
    selectedGradeTerm,
    getStudentDetailedGrades,
    handleDetailedGradeChange: handleDetailedGradeChangeContext,
    canAction
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
      // 1. Direct class_id match
      if (targetClassId && (String(s.class_id) === String(targetClassId) || String(s.class_id) === String(targetClassObj?.id))) {
        return true;
      }
      // 2. Grade and section string match
      const sName = `${s.grade} - ${s.section}`;
      const sNameAr = `${s.grade_ar || s.grade} - ${s.section_ar || s.section}`;
      const sNameEn = `${s.gradeEn} - ${s.sectionEn}`;
      return sName === selectedClass || sNameAr === selectedClass || sNameEn === selectedClass;
    });
  }, [students, selectedClass, targetClassObj, targetClassId]);

  // Dynamic list of real subjects associated with selectedClass
  const classSubjectsList = useMemo(() => {
    if (targetClassObj && Array.isArray(targetClassObj.subjects)) {
      return targetClassObj.subjects;
    }
    return [];
  }, [targetClassObj]);

  const handleDetailedGradeChange = useCallback((studentId, subject, term, monthKey, field, val) => {
    handleDetailedGradeChangeContext(studentId, subject, term, monthKey, field, val, students, subjects);
  }, [handleDetailedGradeChangeContext, students, subjects]);

  const getSubjectPeriodGradeLocal = (studentId, subject, term, period) => {
    return getSubjectPeriodGrade(studentId, subject, term, period, getStudentDetailedGrades);
  };

  return (
    <>
      <div style={{ padding: 'var(--space-md)', background: 'var(--gradient-brand)', color: '#ffffff', borderRadius: 'var(--radius-card)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <strong>{lang === 'ar' ? 'فصل: ' : 'Class: '} {selectedClass}</strong>
          <span style={{ marginInline: '8px', opacity: 0.7 }}>|</span>
          <span style={{ fontSize: '13px', opacity: 0.9 }}>
            👥 {lang === 'ar' ? `عدد الطلاب: ${classStudents.length}` : `Students: ${classStudents.length}`}
          </span>
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
                {classSubjectsList.map((subj, idx) => (
                  <th key={idx}>{subj}</th>
                ))}
                <th>{lang === 'ar' ? 'المعدل / المجموع' : 'Avg / Total'}</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                if (classSubjectsList.length === 0) {
                  return (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '24px' }}>📚</span>
                          <span style={{ fontWeight: '600' }}>
                            {lang === 'ar' ? `لا توجد مواد مقررة لـ ${selectedClass}` : `No assigned subjects for ${selectedClass}`}
                          </span>
                          <span style={{ fontSize: '13px', opacity: 0.8 }}>
                            {lang === 'ar' ? 'يمكن ربط وتعيين المواد بهذا الفصل من صفحة المواد الدراسية.' : 'You can assign subjects to this class from the Subjects page.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (classStudents.length === 0) {
                  return (
                    <tr>
                      <td colSpan={classSubjectsList.length + 3} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '24px' }}>📂</span>
                          <span style={{ fontWeight: '600' }}>
                            {lang === 'ar' ? `لا يوجد طلاب مسجلين في ${selectedClass}` : `No students registered in ${selectedClass}`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                const subjectSums = {};
                classSubjectsList.forEach(s => { subjectSums[s] = 0; });
                let overallPercentageSum = 0;

                const rows = classStudents.map((s, index) => {
                  const subjectVals = classSubjectsList.map(subj => {
                    const val = getSubjectPeriodGradeLocal(s.id, subj, selectedGradeTerm, classPeriod);
                    subjectSums[subj] = (subjectSums[subj] || 0) + val;
                    return val;
                  });

                  const rowSum = subjectVals.reduce((acc, v) => acc + v, 0);
                  const maxPerSubj = (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' || classPeriod === 'yearlyTotal') ? 100 : 50;
                  const maxTotal = classSubjectsList.length * maxPerSubj;
                  const percentVal = maxTotal > 0 ? parseFloat(((rowSum / maxTotal) * 100).toFixed(1)) : 0;
                  overallPercentageSum += percentVal;

                  const totalText = (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' || classPeriod === 'yearlyTotal')
                    ? `${percentVal}%`
                    : `${rowSum} / ${maxTotal}`;

                  return (
                    <tr key={s.id}>
                      <td>{index + 1}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                      {subjectVals.map((val, vIdx) => (
                        <td key={vIdx}>{val}</td>
                      ))}
                      <td style={{ fontWeight: 'bold' }}>{totalText}</td>
                    </tr>
                  );
                });

                const count = classStudents.length;
                const classOverallAvg = parseFloat((overallPercentageSum / count).toFixed(1));
                const maxPossible = (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' || classPeriod === 'yearlyTotal') ? 100 : 50;

                return (
                  <>
                    {rows}
                    <tr style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)', fontWeight: 'bold' }}>
                      <td colSpan="2" style={{ textAlign: 'right' }}>
                        {lang === 'ar' ? 'متوسط درجات الفصل:' : 'Class Average:'}
                      </td>
                      {classSubjectsList.map((subj, idx) => {
                        const avg = parseFloat(((subjectSums[subj] || 0) / count).toFixed(1));
                        return (
                          <td key={idx} style={{ color: 'var(--color-primary)' }}>
                            {avg} / {maxPossible}
                          </td>
                        );
                      })}
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
                if (classStudents.length === 0) {
                  return (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-text-secondary)' }}>
                        {lang === 'ar' ? `لا يوجد طلاب مسجلين في ${selectedClass}` : `No students registered in ${selectedClass}`}
                      </td>
                    </tr>
                  );
                }

                const rows = classStudents.flatMap((s, sIdx) => {
                  return classSubjectsList.map((subj, subIdx) => {
                    const sData = getStudentDetailedGrades(s.id, subj, selectedGradeTerm);
                    const subjectLabel = subj;

                    if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                      const mData = sData[classPeriod] || {};
                      const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);

                      return (
                        <tr key={`${s.id}-${subj}`} style={{ borderBottom: subIdx === classSubjectsList.length - 1 ? '2px solid var(--color-border)' : '1px solid var(--color-border-light)' }}>
                          {subIdx === 0 && (
                            <>
                              <td rowSpan={classSubjectsList.length} style={{ verticalAlign: 'middle', fontWeight: 'bold', backgroundColor: 'var(--color-surface, #ffffff)', borderRight: '1px solid var(--color-border)' }}>{sIdx + 1}</td>
                              <td rowSpan={classSubjectsList.length} style={{ verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'right', backgroundColor: 'var(--color-surface, #ffffff)' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                            </>
                          )}
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>{subjectLabel}</td>
                          <td>
                            <GradeInput 
                              min="0" max="15" 
                              value={mData.homework ?? 0}
                              onChange={(val) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'homework', val)}
                              disabled={!canAction('detailedGrades', 'update')}
                            />
                          </td>
                          <td>
                            <GradeInput 
                              min="0" max="15" 
                              value={mData.attendance ?? 0}
                              onChange={(val) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'attendance', val)}
                              disabled={!canAction('detailedGrades', 'update')}
                            />
                          </td>
                          <td>
                            <GradeInput 
                              min="0" max="10" 
                              value={mData.behavior ?? 0}
                              onChange={(val) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'behavior', val)}
                              disabled={!canAction('detailedGrades', 'update')}
                            />
                          </td>
                          <td>
                            <GradeInput 
                              min="0" max="10" 
                              value={mData.oral ?? 0}
                              onChange={(val) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'oral', val)}
                              disabled={!canAction('detailedGrades', 'update')}
                            />
                          </td>
                          <td>
                            <GradeInput 
                              min="0" max="50" 
                              value={mData.written ?? 0}
                              onChange={(val) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, classPeriod, 'written', val)}
                              disabled={!canAction('detailedGrades', 'update')}
                            />
                          </td>
                          <td style={{ fontWeight: 'bold', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>
                            {total} / 100
                          </td>
                        </tr>
                      );
                    } else if (classPeriod === 'termTotal') {
                      const tm1 = calculateMonthTotal(sData.m1);
                      const tm2 = calculateMonthTotal(sData.m2);
                      const tm3 = calculateMonthTotal(sData.m3);
                      const avg = parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
                      const total = parseFloat((avg + (sData.finalExam || 0)).toFixed(2));

                      return (
                        <tr key={`${s.id}-${subj}`} style={{ borderBottom: subIdx === classSubjectsList.length - 1 ? '2px solid var(--color-border)' : '1px solid var(--color-border-light)' }}>
                          {subIdx === 0 && (
                            <>
                              <td rowSpan={classSubjectsList.length} style={{ verticalAlign: 'middle', fontWeight: 'bold', backgroundColor: 'var(--color-surface, #ffffff)', borderRight: '1px solid var(--color-border)' }}>{sIdx + 1}</td>
                              <td rowSpan={classSubjectsList.length} style={{ verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'right', backgroundColor: 'var(--color-surface, #ffffff)' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                            </>
                          )}
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>{subjectLabel}</td>
                          <td style={{ fontWeight: 'bold' }}>{avg} / 20</td>
                          <td>
                            <GradeInput 
                              min="0" max="30" 
                              value={sData.finalExam ?? 0}
                              onChange={(val) => handleDetailedGradeChange(s.id, subj, selectedGradeTerm, 'finalExam', 'finalExam', val)}
                              disabled={!canAction('detailedGrades', 'update')}
                            />
                          </td>
                          <td style={{ fontWeight: 'bold', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>
                            {total} / 50
                          </td>
                        </tr>
                      );
                    } else {
                      const t1Val = getSubjectPeriodGradeLocal(s.id, subj, 'term1', 'termTotal');
                      const t2Val = getSubjectPeriodGradeLocal(s.id, subj, 'term2', 'termTotal');
                      const yearlyTotal = Math.round(t1Val + t2Val);

                      return (
                        <tr key={`${s.id}-${subj}`} style={{ borderBottom: subIdx === classSubjectsList.length - 1 ? '2px solid var(--color-border)' : '1px solid var(--color-border-light)' }}>
                          {subIdx === 0 && (
                            <>
                              <td rowSpan={classSubjectsList.length} style={{ verticalAlign: 'middle', fontWeight: 'bold', backgroundColor: 'var(--color-surface, #ffffff)', borderRight: '1px solid var(--color-border)' }}>{sIdx + 1}</td>
                              <td rowSpan={classSubjectsList.length} style={{ verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'right', backgroundColor: 'var(--color-surface, #ffffff)' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                            </>
                          )}
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>{subjectLabel}</td>
                          <td style={{ fontWeight: 'bold' }}>{t1Val} / 50</td>
                          <td style={{ fontWeight: 'bold' }}>{t2Val} / 50</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-container, #f8fafc)', fontSize: '15px' }}>
                            {yearlyTotal} / 100
                          </td>
                        </tr>
                      );
                    }
                  });
                });

                const count = classStudents.length;
                const averageRows = classSubjectsList.map((subj, subIdx) => {
                  const subjectLabel = subj;
                  let hwSum = 0, attSum = 0, behSum = 0, oralSum = 0, wrtSum = 0, monthTotSum = 0;
                  let avgSum = 0, finalSum = 0, termTotSum = 0;
                  let t1Sum = 0, t2Sum = 0, yearlySum = 0;

                  classStudents.forEach(s => {
                    const sData = getStudentDetailedGrades(s.id, subj, selectedGradeTerm);

                    if (classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3') {
                      const mData = sData[classPeriod] || {};
                      hwSum += mData.homework || 0;
                      attSum += mData.attendance || 0;
                      behSum += mData.behavior || 0;
                      oralSum += mData.oral || 0;
                      wrtSum += mData.written || 0;
                      monthTotSum += (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);
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
                          <td rowSpan={classSubjectsList.length} colSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
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
                          <td rowSpan={classSubjectsList.length} colSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
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
                          <td rowSpan={classSubjectsList.length} colSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
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
                if (classStudents.length === 0) {
                  return (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-text-secondary)' }}>
                        {lang === 'ar' ? `لا يوجد طلاب مسجلين في ${selectedClass}` : `No students registered in ${selectedClass}`}
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
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                        <td>
                          <GradeInput 
                            min="0" max="15" 
                            value={mData.homework ?? 0}
                            onChange={(val) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'homework', val)}
                            disabled={!canAction('detailedGrades', 'update')}
                          />
                        </td>
                        <td>
                          <GradeInput 
                            min="0" max="15" 
                            value={mData.attendance ?? 0}
                            onChange={(val) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'attendance', val)}
                            disabled={!canAction('detailedGrades', 'update')}
                          />
                        </td>
                        <td>
                          <GradeInput 
                            min="0" max="10" 
                            value={mData.behavior ?? 0}
                            onChange={(val) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'behavior', val)}
                            disabled={!canAction('detailedGrades', 'update')}
                          />
                        </td>
                        <td>
                          <GradeInput 
                            min="0" max="10" 
                            value={mData.oral ?? 0}
                            onChange={(val) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'oral', val)}
                            disabled={!canAction('detailedGrades', 'update')}
                          />
                        </td>
                        <td>
                          <GradeInput 
                            min="0" max="50" 
                            value={mData.written ?? 0}
                            onChange={(val) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, classPeriod, 'written', val)}
                            disabled={!canAction('detailedGrades', 'update')}
                          />
                        </td>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>
                          {total} / 100
                        </td>
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
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                        <td style={{ fontWeight: 'bold' }}>{avg} / 20</td>
                        <td>
                          <GradeInput 
                            min="0" max="30" 
                            value={sData.finalExam ?? 0}
                            onChange={(val) => handleDetailedGradeChange(s.id, classSubject, selectedGradeTerm, 'finalExam', 'finalExam', val)}
                            disabled={!canAction('detailedGrades', 'update')}
                          />
                        </td>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-container, #f8fafc)' }}>
                          {total} / 50
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

                    return (
                      <tr key={s.id}>
                        <td>{index + 1}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lang === 'ar' ? s.name : (s.nameEn || s.name)}</td>
                        <td style={{ fontWeight: 'bold' }}>{t1Val} / 50</td>
                        <td style={{ fontWeight: 'bold' }}>{t2Val} / 50</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-container, #f8fafc)', fontSize: '15px' }}>
                          {yearlyTotal} / 100
                        </td>
                      </tr>
                    );
                  }
                });

                const count = classStudents.length;

                return (
                  <>
                    {rows}
                    <tr style={{ backgroundColor: 'var(--color-bg-container, #f8fafc)', fontWeight: 'bold' }}>
                      <td colSpan="2" style={{ textAlign: 'right' }}>
                        {lang === 'ar' ? 'متوسط درجات الفصل:' : 'Class Average:'}
                      </td>
                      {classPeriod === 'm1' || classPeriod === 'm2' || classPeriod === 'm3' ? (
                        <>
                          <td>{parseFloat((hwSum / count).toFixed(2))}</td>
                          <td>{parseFloat((attSum / count).toFixed(2))}</td>
                          <td>{parseFloat((behSum / count).toFixed(2))}</td>
                          <td>{parseFloat((oralSum / count).toFixed(2))}</td>
                          <td>{parseFloat((wrtSum / count).toFixed(2))}</td>
                          <td style={{ color: 'var(--color-success)', fontSize: '15px' }}>{parseFloat((monthTotSum / count).toFixed(2))} / 100</td>
                        </>
                      ) : classPeriod === 'termTotal' ? (
                        <>
                          <td>{parseFloat((avgSum / count).toFixed(2))}</td>
                          <td>{parseFloat((finalSum / count).toFixed(2))}</td>
                          <td style={{ color: 'var(--color-success)', fontSize: '15px' }}>{parseFloat((termTotSum / count).toFixed(2))} / 50</td>
                        </>
                      ) : (
                        <>
                          <td>{parseFloat((t1Sum / count).toFixed(2))}</td>
                          <td>{parseFloat((t2Sum / count).toFixed(2))}</td>
                          <td style={{ color: 'var(--color-success)', fontSize: '15px' }}>{parseFloat((yearlySum / count).toFixed(2))} / 100</td>
                        </>
                      )}
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
});

export default ClassView;
