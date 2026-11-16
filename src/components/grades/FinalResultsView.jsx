import { memo, useEffect, useMemo, useState } from 'react';
import { Award, Printer, Send, ArrowUpDown } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useStudents } from '../../contexts/Students/useStudents';
import { useSubjects } from '../../contexts/Subjects/useSubjects';
import { useClasses } from '../../contexts/Classes/useClasses';
import { getSubjectPeriodGrade } from '../../utils/gradesHelper';
import { controlBoardService } from '../../services/control/controlBoard.service';

const getEstimate = (pct) => {
  if (pct >= 90) return 'ممتاز';
  if (pct >= 80) return 'جيد جداً';
  if (pct >= 65) return 'جيد';
  if (pct >= 50) return 'مقبول';
  return 'ضعيف';
};

const getRankLabel = (rank) => {
  if (rank === 1) return '🥇 الأول';
  if (rank === 2) return '🥈 الثاني';
  if (rank === 3) return '🥉 الثالث';
  return `${rank}`;
};

const FinalResultsView = memo(function FinalResultsView({ selectedClass, onPrintResults }) {
  const {
    lang,
    getStudentDetailedGrades,
    setToastMessage,
    triggerConfirm,
  } = useApp();

  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { classes } = useClasses();

  const [scope, setScope] = useState('yearly'); // 'term1' | 'term2' | 'yearly'
  const [passingPct, setPassingPct] = useState(50);
  const [sortByRank, setSortByRank] = useState(true);
  const [isSending, setIsSending] = useState(false);

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

  // رقم الجلوس والرقم السري (من الكنترول) لإظهارهما في كشف النتائج
  const [controlNums, setControlNums] = useState({});
  const controlClassId = Number(targetClassObj?.numericId || String(targetClassObj?.id ?? '').replace(/\D/g, '')) || null;
  useEffect(() => {
    if (!controlClassId) return undefined;
    let cancelled = false;
    controlBoardService.getStudents(controlClassId)
      .then((res) => {
        if (cancelled) return;
        const m = {};
        (res?.students || []).forEach((x) => { m[String(x.id)] = { seat: x.seat_number, secret: x.secret_number }; });
        setControlNums(m);
      })
      .catch(() => { if (!cancelled) setControlNums({}); });
    return () => { cancelled = true; };
  }, [controlClassId]);

  const classSubjects = useMemo(() => {
    const teacherMap = targetClassObj?.subject_teachers || {};
    const teacherSubNames = Object.keys(teacherMap);
    if (teacherSubNames.length > 0) {
      return subjects.filter((s) => teacherSubNames.includes(s.name || s.name_ar));
    }
    return subjects || [];
  }, [subjects, targetClassObj]);

  const subjectNames = useMemo(
    () => classSubjects.map((s) => s.name || s.name_ar).filter(Boolean),
    [classSubjects]
  );

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => {
      if (targetClassId && s.class_id && Number(s.class_id) === Number(targetClassId)) return true;
      return `${s.grade} - ${s.section}` === selectedClass || `${s.grade_ar} - ${s.section_ar}` === selectedClass;
    });
  }, [students, selectedClass, targetClassId]);

  const maxPerSubject = scope === 'yearly' ? 100 : 50;
  const maxTotal = Math.max(1, subjectNames.length) * maxPerSubject;

  const computedRows = useMemo(() => {
    const rows = classStudents.map((st) => {
      const subjectScores = {};
      let total = 0;

      subjectNames.forEach((subName) => {
        let val;
        if (scope === 'term1') {
          val = getSubjectPeriodGrade(st.id, subName, 'term1', 'termTotal', getStudentDetailedGrades);
        } else if (scope === 'term2') {
          val = getSubjectPeriodGrade(st.id, subName, 'term2', 'termTotal', getStudentDetailedGrades);
        } else {
          val = getSubjectPeriodGrade(st.id, subName, 'term1', 'yearlyTotal', getStudentDetailedGrades);
        }
        subjectScores[subName] = val;
        total += Number(val || 0);
      });

      total = parseFloat(total.toFixed(2));
      const pct = maxTotal > 0 ? parseFloat(((total / maxTotal) * 100).toFixed(2)) : 0;

      return {
        student: st,
        name: lang === 'ar' ? (st.name || st.name_ar) : (st.nameEn || st.name),
        subjectScores,
        total,
        percentage: pct,
        estimate: getEstimate(pct),
        passed: pct >= passingPct,
      };
    });

    // Assign rank by descending total
    const ranked = [...rows].sort((a, b) => b.total - a.total);
    ranked.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    if (sortByRank) return ranked;
    return [...ranked].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [classStudents, subjectNames, scope, maxTotal, passingPct, sortByRank, getStudentDetailedGrades, lang]);

  const topThree = useMemo(() => {
    return [...computedRows].sort((a, b) => a.rank - b.rank).slice(0, 3);
  }, [computedRows]);

  const stats = useMemo(() => {
    const count = computedRows.length;
    const passedCount = computedRows.filter((r) => r.passed).length;
    const failedCount = count - passedCount;
    const passRate = count > 0 ? Math.round((passedCount / count) * 100) : 0;
    return { count, passedCount, failedCount, passRate };
  }, [computedRows]);

  const scopeLabel = scope === 'term1'
    ? (lang === 'ar' ? 'نصف العام (الترم الأول)' : 'Term 1')
    : scope === 'term2'
      ? (lang === 'ar' ? 'الترم الثاني' : 'Term 2')
      : (lang === 'ar' ? 'نهاية العام الدراسي' : 'Yearly Final');

  const handleSendToParents = () => {
    if (!targetClassId) return;
    triggerConfirm?.({
      title: lang === 'ar' ? 'إرسال النتائج لأولياء الأمور' : 'Send Results to Parents',
      message: lang === 'ar'
        ? `هل تريد إرسال إشعارات نتائج (${scopeLabel}) لـ ${stats.count} طالب في (${selectedClass}) إلى حسابات أولياء أمورهم؟`
        : `Send ${scopeLabel} results notifications for ${stats.count} students in ${selectedClass}?`,
      type: 'info',
      onConfirm: async () => {
        setIsSending(true);
        try {
          const res = await api.post('/api/grades/send-results', {
            class_id: Number(targetClassId),
            scope,
            passing_score: passingPct,
          });
          setToastMessage?.(res?.message || (lang === 'ar' ? 'تم إرسال النتائج بنجاح' : 'Results sent'));
        } catch (err) {
          setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر إرسال النتائج' : 'Failed to send results'));
        } finally {
          setIsSending(false);
        }
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* شريط التحكم بالنتائج النهائية */}
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
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(37,99,235,0.08))',
          border: '1px solid rgba(245,158,11,0.25)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <select
            className="filter-select-glass"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={{ minWidth: '170px', fontWeight: 700 }}
          >
            <option value="term1">{lang === 'ar' ? 'نتائج نصف العام (من 50)' : 'Term 1 (50)'}</option>
            <option value="term2">{lang === 'ar' ? 'نتائج الترم الثاني (من 50)' : 'Term 2 (50)'}</option>
            <option value="yearly">{lang === 'ar' ? 'النتيجة النهائية للعام (من 100)' : 'Yearly Final (100)'}</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
            <span>{lang === 'ar' ? 'نسبة النجاح %:' : 'Pass %:'}</span>
            <input
              type="number"
              min="1"
              max="100"
              value={passingPct}
              onChange={(e) => setPassingPct(Number(e.target.value) || 50)}
              style={{ width: '64px', padding: '5px 8px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)', textAlign: 'center', fontWeight: 700 }}
            />
          </label>

          <button
            type="button"
            onClick={() => setSortByRank((v) => !v)}
            className="lang-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowUpDown size={14} />
            <span>{sortByRank ? (lang === 'ar' ? 'الترتيب: الأوائل أولاً' : 'Sort: Rank') : (lang === 'ar' ? 'الترتيب: أبجدي' : 'Sort: Name')}</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {onPrintResults && (
            <button
              type="button"
              onClick={() => onPrintResults({ scope, scopeLabel, rows: computedRows, maxTotal })}
              className="lang-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Printer size={15} />
              <span>{lang === 'ar' ? 'طباعة كشف النتائج / الأوائل' : 'Print Results'}</span>
            </button>
          )}
          <button
            type="button"
            disabled={isSending || !targetClassId || stats.count === 0}
            onClick={handleSendToParents}
            className="btn-primary-glass"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
          >
            <Send size={15} />
            <span>{isSending ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إرسال النتائج لأولياء الأمور' : 'Send to Parents')}</span>
          </button>
        </div>
      </div>

      {/* بطاقات الملخص والأوائل */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
        <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>{lang === 'ar' ? 'إجمالي الطلاب' : 'Total Students'}</div>
          <div style={{ fontSize: '20px', fontWeight: 800 }}>{stats.count}</div>
        </div>
        <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>{lang === 'ar' ? 'الناجحون' : 'Passed'}</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>{stats.passedCount} ({stats.passRate}%)</div>
        </div>
        <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>{lang === 'ar' ? 'الراسبون' : 'Failed'}</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626' }}>{stats.failedCount}</div>
        </div>
        {topThree.length > 0 && (
          <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '12px', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '12px', opacity: 0.75, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Award size={14} style={{ color: '#d97706' }} />
              <span>{lang === 'ar' ? 'أوائل الصف' : 'Top 3 Students'}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '13px', fontWeight: 700 }}>
              {topThree.map((t) => (
                <span key={t.student.id} style={{ padding: '3px 8px', borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.12)' }}>
                  {getRankLabel(t.rank)}: {t.name} ({t.percentage}%)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* جدول النتائج النهائية */}
      <div className="control-grade-table-container">
        <table className="control-grade-table">
          <thead>
            <tr>
              <th style={{ minWidth: '85px' }}>{lang === 'ar' ? 'الترتيب' : 'Rank'}</th>
              <th>{lang === 'ar' ? 'رقم الجلوس' : 'Seat No.'}</th>
              <th>{lang === 'ar' ? 'الرقم السري' : 'Secret No.'}</th>
              <th className="sticky-col-name" style={{ textAlign: 'right', minWidth: '200px' }}>
                {lang === 'ar' ? 'اسم الطالب' : 'Student Name'}
              </th>
              {subjectNames.map((sub) => (
                <th key={sub}>{sub} ({maxPerSubject})</th>
              ))}
              <th>{lang === 'ar' ? `المجموع (${maxTotal})` : `Total (${maxTotal})`}</th>
              <th>{lang === 'ar' ? 'النسبة %' : '%'}</th>
              <th>{lang === 'ar' ? 'التقدير' : 'Estimate'}</th>
              <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {computedRows.length === 0 ? (
              <tr>
                <td colSpan={subjectNames.length + 8} style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
                  {lang === 'ar' ? 'لا يوجد طلاب في هذا الصف.' : 'No students in this class.'}
                </td>
              </tr>
            ) : (
              computedRows.map((row) => (
                <tr key={row.student.id}>
                  <td style={{ textAlign: 'center', fontWeight: 800 }}>{getRankLabel(row.rank)}</td>
                  <td style={{ textAlign: 'center' }}>{controlNums[String(row.student.id)]?.seat ?? ''}</td>
                  <td style={{ textAlign: 'center' }}>{controlNums[String(row.student.id)]?.secret ?? ''}</td>
                  <td className="sticky-col-name" style={{ textAlign: 'right', fontWeight: 700 }}>{row.name}</td>
                  {subjectNames.map((sub) => (
                    <td key={sub} style={{ textAlign: 'center' }}>{row.subjectScores[sub] ?? 0}</td>
                  ))}
                  <td style={{ textAlign: 'center', fontWeight: 800 }}>{row.total}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: row.passed ? '#047857' : '#dc2626' }}>
                    {row.percentage}%
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{row.estimate}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: row.passed ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)',
                        color: row.passed ? '#047857' : '#dc2626',
                      }}
                    >
                      {row.passed ? (lang === 'ar' ? 'ناجح' : 'Pass') : (lang === 'ar' ? 'راسب' : 'Fail')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default FinalResultsView;
