import { memo, useMemo, useState } from 'react';
import { ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useStudents } from '../../contexts/Students/useStudents';
import { useSubjects } from '../../contexts/Subjects/useSubjects';
import { useClasses } from '../../contexts/Classes/useClasses';
import { calculateMonthTotal } from '../../utils/gradesHelper';
import GradeInput from './GradeInput';

const getEstimate = (total) => {
  if (!total || isNaN(total)) return '-';
  const pct = (total / 50) * 100;
  if (pct >= 90) return 'ممتاز';
  if (pct >= 80) return 'جيد جداً';
  if (pct >= 65) return 'جيد';
  if (pct >= 50) return 'مقبول';
  return 'ضعيف';
};

const TermTransferView = memo(function TermTransferView({ selectedClass, selectedSubject }) {
  const {
    lang,
    selectedGradeTerm,
    getStudentDetailedGrades,
    handleDetailedGradeChange: handleDetailedGradeChangeContext,
    fetchClassGrades,
    setToastMessage,
    triggerConfirm,
    canAction,
  } = useApp();

  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { classes } = useClasses();

  const [isTransferring, setIsTransferring] = useState(false);

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

  const subjectObj = useMemo(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      return subjects.find((s) => (s.name || s.name_ar) === selectedSubject) || subjects[0];
    }
    return subjects[0];
  }, [selectedSubject, subjects]);

  const subjectName = subjectObj ? (subjectObj.name || subjectObj.name_ar) : 'القرآن الكريم';
  const subjectId = subjectObj ? Number(String(subjectObj.id).replace(/\D/g, '')) : null;

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students
      .filter((s) => {
        if (targetClassId && s.class_id && Number(s.class_id) === Number(targetClassId)) return true;
        return `${s.grade} - ${s.section}` === selectedClass || `${s.grade_ar} - ${s.section_ar}` === selectedClass;
      })
      .sort((a, b) => (a.name || a.name_ar || '').localeCompare(b.name || b.name_ar || '', 'ar'));
  }, [students, selectedClass, targetClassId]);

  const termLabel = selectedGradeTerm === 'term1'
    ? (lang === 'ar' ? 'نصف العام (الترم الأول)' : 'Midyear (Term 1)')
    : (lang === 'ar' ? 'نهاية العام (الترم الثاني)' : 'Final (Term 2)');

  const examLabel = selectedGradeTerm === 'term1'
    ? (lang === 'ar' ? 'اختبار نصف العام (30)' : 'Midyear Exam (30)')
    : (lang === 'ar' ? 'اختبار نهاية العام (30)' : 'Final Exam (30)');

  const executeTransfer = async (allSubjects = false) => {
    if (!targetClassId) return;
    setIsTransferring(true);
    try {
      const res = await api.post('/api/grades/transfer-coursework', {
        class_id: Number(targetClassId),
        term: selectedGradeTerm,
        ...(allSubjects || !subjectId ? {} : { subject_id: subjectId }),
      });
      await fetchClassGrades?.(targetClassId, true);
      setToastMessage?.(res?.message || (lang === 'ar' ? 'تم ترحيل المحصلة بنجاح' : 'Coursework transferred'));
    } catch (err) {
      setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر ترحيل المحصلة' : 'Transfer failed'));
    } finally {
      setIsTransferring(false);
    }
  };

  const handleTransferClick = (allSubjects) => {
    const scopeText = allSubjects
      ? `جميع مواد الصف (${selectedClass})`
      : `مادة (${subjectName}) في (${selectedClass})`;
    triggerConfirm?.({
      title: lang === 'ar' ? 'تأكيد ترحيل المحصلة' : 'Confirm Coursework Transfer',
      message: lang === 'ar'
        ? `سيتم احتساب محصلة (م1 + م2 + م3 ÷ 15) من 20 وتثبيتها في سجل ${termLabel} لـ ${scopeText}. هل تريد المتابعة؟`
        : `Transfer calculated coursework (m1+m2+m3 / 15) out of 20 for ${scopeText}?`,
      type: 'info',
      onConfirm: () => executeTransfer(allSubjects),
    });
  };

  const editable = canAction('detailedGrades', 'update');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.08))',
          border: '1px solid rgba(16,185,129,0.25)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>{lang === 'ar' ? 'الفصل الدراسي:' : 'Term:'} </span>
            <strong>{termLabel}</strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>{lang === 'ar' ? 'الصف:' : 'Class:'} </span>
            <strong>{selectedClass}</strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>{lang === 'ar' ? 'المادة:' : 'Subject:'} </span>
            <strong>{subjectName}</strong>
          </div>
        </div>

        {editable && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              disabled={isTransferring || !targetClassId}
              onClick={() => handleTransferClick(false)}
              className="btn-primary-glass"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <ArrowRightLeft size={15} />
              <span>{lang === 'ar' ? `ترحيل محصلة (${subjectName})` : 'Transfer Subject Coursework'}</span>
            </button>
            <button
              type="button"
              disabled={isTransferring || !targetClassId}
              onClick={() => handleTransferClick(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #059669',
                backgroundColor: 'rgba(16,185,129,0.12)',
                color: '#047857',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={15} />
              <span>{lang === 'ar' ? 'ترحيل محصلة جميع المواد' : 'Transfer All Subjects'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="control-grade-table-container">
        <table className="control-grade-table">
          <thead>
            <tr>
              <th style={{ width: '48px' }}>#</th>
              <th className="sticky-col-name" style={{ textAlign: 'right', minWidth: '200px' }}>
                {lang === 'ar' ? 'اسم الطالب' : 'Student Name'}
              </th>
              <th>{lang === 'ar' ? 'م1 (100)' : 'M1'}</th>
              <th>{lang === 'ar' ? 'م2 (100)' : 'M2'}</th>
              <th>{lang === 'ar' ? 'م3 (100)' : 'M3'}</th>
              <th>{lang === 'ar' ? 'المحسوب (20)' : 'Calc (20)'}</th>
              <th>{lang === 'ar' ? 'المحصلة المرحلة (20)' : 'Transferred (20)'}</th>
              <th>{examLabel}</th>
              <th>{lang === 'ar' ? 'مجموع الترم (50)' : 'Term Total (50)'}</th>
              <th>{lang === 'ar' ? 'التقدير' : 'Estimate'}</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
                  {lang === 'ar' ? 'لا يوجد طلاب في هذا الصف.' : 'No students in this class.'}
                </td>
              </tr>
            ) : (
              classStudents.map((st, idx) => {
                const sData = getStudentDetailedGrades(st.id, subjectName, selectedGradeTerm) || {};
                const m1 = calculateMonthTotal(sData.m1);
                const m2 = calculateMonthTotal(sData.m2);
                const m3 = calculateMonthTotal(sData.m3);
                const calcCw = parseFloat(((m1 + m2 + m3) / 15).toFixed(2));
                const activeCw = sData.coursework !== undefined && sData.coursework !== null && sData.coursework !== ''
                  ? parseFloat(sData.coursework)
                  : calcCw;
                const finalExam = parseFloat(sData.finalExam || 0);
                const termTotal = parseFloat((activeCw + finalExam).toFixed(2));

                return (
                  <tr key={st.id}>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                    <td className="sticky-col-name" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {lang === 'ar' ? (st.name || st.name_ar) : (st.nameEn || st.name)}
                    </td>
                    <td style={{ textAlign: 'center' }}>{m1}</td>
                    <td style={{ textAlign: 'center' }}>{m2}</td>
                    <td style={{ textAlign: 'center' }}>{m3}</td>
                    <td style={{ textAlign: 'center', opacity: 0.75 }}>{calcCw}</td>
                    <td>
                      <GradeInput
                        min="0"
                        max="20"
                        step="0.5"
                        value={sData.coursework ?? calcCw}
                        disabled={!editable}
                        onChange={(val) =>
                          handleDetailedGradeChangeContext(
                            st.id,
                            subjectName,
                            selectedGradeTerm,
                            'coursework',
                            'coursework',
                            val,
                            students,
                            subjects
                          )
                        }
                      />
                    </td>
                    <td>
                      <GradeInput
                        min="0"
                        max="30"
                        step="0.5"
                        value={sData.finalExam ?? 0}
                        disabled={!editable}
                        onChange={(val) =>
                          handleDetailedGradeChangeContext(
                            st.id,
                            subjectName,
                            selectedGradeTerm,
                            'finalExam',
                            'finalExam',
                            val,
                            students,
                            subjects
                          )
                        }
                      />
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: termTotal >= 25 ? '#047857' : '#dc2626' }}>
                      {termTotal}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{getEstimate(termTotal)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default TermTransferView;
