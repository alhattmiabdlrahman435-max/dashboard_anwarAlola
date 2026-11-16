import { useEffect, useState, useCallback } from 'react';
import { X, GraduationCap, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAcademicYear } from '../contexts/AcademicYear/AcademicYearContext';
import { useApp } from '../context/AppContext';

export default function AcademicYearPromotionModal({ isOpen, onClose }) {
  const { lang, setToastMessage, triggerConfirm } = useApp();
  const { academicYears, currentYear, fetchAcademicYears, switchAcademicYear } = useAcademicYear();

  const [fromYearId, setFromYearId] = useState('');
  const [toYearId, setToYearId] = useState('');
  const [passingScore, setPassingScore] = useState(50);
  const [subjectPassScore, setSubjectPassScore] = useState(50);
  const [maxSuppSubjects, setMaxSuppSubjects] = useState(2);
  const [closeSourceYear, setCloseSourceYear] = useState(true);
  const [setTargetCurrent, setSetTargetCurrent] = useState(true);
  const [carryoverArrears, setCarryoverArrears] = useState(true);
  // أرقام الكنترول (جلوس/سرية/لجنة) تخص العام: تُحفظ في سجل العام القديم وتُصفَّر للعام الجديد
  const [resetControlNumbers, setResetControlNumbers] = useState(true);
  const [bulkClassId, setBulkClassId] = useState('');
  const [bulkTuition, setBulkTuition] = useState('');
  const [secondRoundStudent, setSecondRoundStudent] = useState(null);
  const [secondRoundScores, setSecondRoundScores] = useState({});
  const [savingSecondRound, setSavingSecondRound] = useState(false);

  const [classes, setClasses] = useState([]);
  const [items, setItems] = useState([]);
  const [targetExistingCount, setTargetExistingCount] = useState(0);
  const [filterClassId, setFilterClassId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    Promise.resolve().then(() => {
      if (ignore) return;
      if (currentYear && !fromYearId) {
        setFromYearId(String(currentYear.id));
      }
      const other = academicYears.find((y) => Number(y.id) !== Number(currentYear?.id));
      if (other && !toYearId) {
        setToYearId(String(other.id));
      }
    });
    return () => {
      ignore = true;
    };
  }, [isOpen, academicYears, currentYear, fromYearId, toYearId]);

  const loadPreview = useCallback(async () => {
    if (!fromYearId || !toYearId || fromYearId === toYearId) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        from_year_id: fromYearId,
        to_year_id: toYearId,
        passing_score: String(passingScore),
        subject_pass_score: String(subjectPassScore),
        max_supplementary_subjects: String(maxSuppSubjects),
      });
      const res = await api.get(`/api/academic-years/promotion/preview?${qs.toString()}`);
      setClasses(res?.classes || []);
      setItems(res?.items || []);
      setTargetExistingCount(res?.target_existing_enrollments || 0);
    } catch (err) {
      setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر تحميل معاينة الترحيل' : 'Failed to load preview'));
    } finally {
      setLoading(false);
    }
  }, [fromYearId, toYearId, passingScore, subjectPassScore, maxSuppSubjects, setToastMessage, lang]);

  const applyBulkTuition = () => {
    if (!bulkClassId || bulkTuition === '') return;
    const feeVal = Math.max(0, Number(bulkTuition) || 0);
    let updatedCount = 0;
    setItems((prev) =>
      prev.map((it) => {
        if (!['promote', 'retain', 'supplementary'].includes(it.recommended_action)) return it;
        if (bulkClassId === 'all' || String(it.target_class_id) === String(bulkClassId)) {
          updatedCount++;
          return { ...it, tuition_fee: feeVal };
        }
        return it;
      })
    );
    setToastMessage?.(
      lang === 'ar'
        ? `تم تطبيق الرسوم (${feeVal}) على ${updatedCount} طالب`
        : `Applied tuition (${feeVal}) to ${updatedCount} students`
    );
  };

  const openSecondRoundModal = (item) => {
    const initial = {};
    (item.failed_subjects || []).forEach((fs) => {
      initial[fs.subject_id] = fs.second_round_score ?? '';
    });
    setSecondRoundScores(initial);
    setSecondRoundStudent(item);
  };

  const handleSaveSecondRound = async (e) => {
    e.preventDefault();
    if (!secondRoundStudent || !fromYearId) return;
    setSavingSecondRound(true);
    try {
      const scores = Object.entries(secondRoundScores)
        .filter(([, val]) => val !== '' && val !== null && val !== undefined)
        .map(([subjectId, val]) => ({
          subject_id: Number(subjectId),
          second_round_score: Number(val),
        }));
      await api.post('/api/academic-years/promotion/second-round', {
        academic_year_id: Number(fromYearId),
        student_id: secondRoundStudent.student_id,
        scores,
      });
      setToastMessage?.(lang === 'ar' ? 'تم حفظ درجات الدور الثاني وإعادة التقييم' : 'Second round scores saved');
      setSecondRoundStudent(null);
      await loadPreview();
    } catch (err) {
      setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر حفظ درجات الدور الثاني' : 'Failed to save second round scores'));
    } finally {
      setSavingSecondRound(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (isOpen && fromYearId && toYearId && fromYearId !== toYearId) {
      Promise.resolve().then(() => {
        if (!ignore) {
          loadPreview();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, fromYearId, toYearId, loadPreview]);

  if (!isOpen) return null;

  const filteredItems = filterClassId === 'all'
    ? items
    : items.filter((it) => String(it.source_class_id) === String(filterClassId));

  const updateItem = (studentId, patch) => {
    setItems((prev) =>
      prev.map((it) => (it.student_id === studentId ? { ...it, ...patch } : it))
    );
  };

  const handleExecute = () => {
    if (!fromYearId || !toYearId || items.length === 0) return;
    triggerConfirm?.({
      title: lang === 'ar' ? 'تأكيد تنفيذ الترحيل السنوي' : 'Confirm Annual Promotion',
      message: lang === 'ar'
        ? `سيتم ترحيل ${items.length} طالب إلى العام المحدد وفق الحالات المختارة. هل تريد المتابعة؟`
        : `Promote ${items.length} students to the target academic year?`,
      type: 'info',
      onConfirm: async () => {
        setExecuting(true);
        try {
          const payload = {
            from_year_id: Number(fromYearId),
            to_year_id: Number(toYearId),
            close_source_year: closeSourceYear,
            set_target_current: setTargetCurrent,
            carryover_arrears: carryoverArrears,
            reset_control_numbers: resetControlNumbers,
            items: items.map((it) => ({
              student_id: it.student_id,
              action: it.recommended_action,
              target_class_id: it.target_class_id ? Number(it.target_class_id) : null,
              tuition_fee: Number(it.tuition_fee || 0),
              previous_balance: carryoverArrears ? Number(it.previous_balance || 0) : 0,
            })),
          };
          const res = await api.post('/api/academic-years/promotion/execute', payload);
          setToastMessage?.(res?.message || (lang === 'ar' ? 'تم الترحيل بنجاح' : 'Promotion complete'));
          await fetchAcademicYears();
          if (setTargetCurrent) {
            switchAcademicYear(Number(toYearId), { reload: true });
          } else {
            onClose();
          }
        } catch (err) {
          setToastMessage?.(err?.message || (lang === 'ar' ? 'فشل تنفيذ الترحيل' : 'Promotion failed'));
        } finally {
          setExecuting(false);
        }
      },
    });
  };

  const handleRollback = () => {
    if (!fromYearId || !toYearId) return;
    triggerConfirm?.({
      title: lang === 'ar' ? 'التراجع الآمن عن الترحيل' : 'Rollback Promotion',
      message: lang === 'ar'
        ? 'سيتم حذف قيود الطلاب في العام الهدف واستعادة صفوف الطلاب وحالتهم إلى العام المصدر. هل تريد المتابعة؟'
        : 'Remove target year enrollments and restore source year?',
      type: 'danger',
      onConfirm: async () => {
        setExecuting(true);
        try {
          const res = await api.post('/api/academic-years/promotion/rollback', {
            from_year_id: Number(fromYearId),
            to_year_id: Number(toYearId),
          });
          setToastMessage?.(res?.message || (lang === 'ar' ? 'تم التراجع بنجاح' : 'Rollback complete'));
          await fetchAcademicYears();
          switchAcademicYear(Number(fromYearId), { reload: true });
        } catch (err) {
          setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر التراجع عن الترحيل' : 'Rollback failed'));
        } finally {
          setExecuting(false);
        }
      },
    });
  };

  return (
    <div
      className="modal-overlay"
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '16px' }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{ width: '100%', maxWidth: '1050px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '18px', backgroundColor: 'var(--card-bg, #ffffff)', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(148,163,184,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={22} style={{ color: '#2563eb' }} />
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
              {lang === 'ar' ? 'ترحيل الطلاب لنهاية العام الدراسي' : 'End-of-Year Student Promotion'}
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', borderBottom: '1px solid rgba(148,163,184,0.2)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, opacity: 0.75 }}>{lang === 'ar' ? 'من العام (المصدر)' : 'From Year'}</label>
            <select value={fromYearId} onChange={(e) => setFromYearId(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)', fontWeight: 700 }}>
              <option value="">--</option>
              {academicYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, opacity: 0.75 }}>{lang === 'ar' ? 'إلى العام (الهدف)' : 'To Year'}</label>
            <select value={toYearId} onChange={(e) => setToYearId(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)', fontWeight: 700 }}>
              <option value="">--</option>
              {academicYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, opacity: 0.75 }}>{lang === 'ar' ? 'نسبة النجاح %' : 'Pass %'}</label>
            <input type="number" min="1" max="100" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value) || 50)} style={{ width: '68px', padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)', textAlign: 'center', fontWeight: 700 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, opacity: 0.75 }}>{lang === 'ar' ? 'نجاح المادة %' : 'Subj Pass %'}</label>
            <input type="number" min="1" max="100" value={subjectPassScore} onChange={(e) => setSubjectPassScore(Number(e.target.value) || 50)} style={{ width: '68px', padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)', textAlign: 'center', fontWeight: 700 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, opacity: 0.75 }}>{lang === 'ar' ? 'حد الإكمال' : 'Max Supp'}</label>
            <input type="number" min="0" max="10" value={maxSuppSubjects} onChange={(e) => setMaxSuppSubjects(Math.max(0, Number(e.target.value) || 0))} style={{ width: '58px', padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)', textAlign: 'center', fontWeight: 700 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, opacity: 0.75 }}>{lang === 'ar' ? 'تصفية حسب الصف' : 'Filter Class'}</label>
            <select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.4)', fontWeight: 700 }}>
              <option value="all">{lang === 'ar' ? 'جميع الصفوف' : 'All Classes'}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
            <input type="checkbox" checked={closeSourceYear} onChange={(e) => setCloseSourceYear(e.target.checked)} />
            <span>{lang === 'ar' ? 'أرشفة العام المصدر' : 'Archive source year'}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
            <input type="checkbox" checked={setTargetCurrent} onChange={(e) => setSetTargetCurrent(e.target.checked)} />
            <span>{lang === 'ar' ? 'تعيين الهدف كعام حالي' : 'Set target as current'}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
            <input type="checkbox" checked={carryoverArrears} onChange={(e) => setCarryoverArrears(e.target.checked)} />
            <span>{lang === 'ar' ? 'ترحيل المتأخرات المالية تلقائياً' : 'Carryover unpaid arrears'}</span>
          </label>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}
            title={lang === 'ar' ? 'تبقى أرقام العام القديم محفوظة في أرشيفه، ويبدأ العام الجديد بلا أرقام جلوس ولا أرقام سرية ولا لجان' : 'Old-year numbers stay in its archive; the new year starts with none'}
          >
            <input type="checkbox" checked={resetControlNumbers} onChange={(e) => setResetControlNumbers(e.target.checked)} />
            <span>{lang === 'ar' ? 'تصفير أرقام الجلوس والأرقام السرية واللجان للعام الجديد' : 'Reset seat / secret / committee numbers'}</span>
          </label>
        </div>

        {academicYears.length < 2 && (
          <div style={{ margin: '14px 20px 0', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(245,158,11,0.14)', color: '#92400e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{lang === 'ar' ? 'يجب إضافة عام دراسي جديد أولاً من محوّل الأعوام (مثلاً 2027-2028) قبل تنفيذ الترحيل.' : 'Create a new academic year first before promoting.'}</span>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>{lang === 'ar' ? 'جارٍ تجهيز قائمة الترحيل...' : 'Loading...'}</div>
          ) : (
            <table className="control-grade-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student'}</th>
                  <th>{lang === 'ar' ? 'الصف الحالي' : 'Current Class'}</th>
                  <th>{lang === 'ar' ? 'المعدل %' : '%'}</th>
                  <th>{lang === 'ar' ? 'القرار' : 'Action'}</th>
                  <th>{lang === 'ar' ? 'الصف الهدف' : 'Target Class'}</th>
                  <th>{lang === 'ar' ? 'الرسوم الجديدة' : 'Tuition'}</th>
                  <th>{lang === 'ar' ? 'متأخرات سابقة' : 'Arrears'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((it, idx) => (
                  <tr key={it.student_id}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{it.name_ar}</td>
                    <td style={{ textAlign: 'center' }}>{it.source_class_name}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                      {it.percentage !== null ? `${it.percentage}%` : (
                        <span
                          title={lang === 'ar' ? 'لا توجد درجات مرصودة لهذا الطالب في العام المصدر — الإجراء المقترح افتراضي، راجعه يدوياً' : 'No grades recorded in the source year — review manually'}
                          style={{ color: '#b71c1c', background: 'rgba(211,47,47,.10)', borderRadius: 6, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' }}
                        >
                          {lang === 'ar' ? 'بلا درجات' : 'No grades'}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <select
                        value={it.recommended_action}
                        onChange={(e) => {
                          const act = e.target.value;
                          updateItem(it.student_id, {
                            recommended_action: act,
                            target_class_id: act === 'retain' ? it.source_class_id : (act === 'graduate' || act === 'withdraw' ? null : it.target_class_id),
                          });
                        }}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.4)', fontWeight: 700 }}
                      >
                        <option value="promote">{lang === 'ar' ? 'ترفيع' : 'Promote'}</option>
                        <option value="supplementary">{lang === 'ar' ? 'مكمل / دور ثاني' : 'Supplementary'}</option>
                        <option value="retain">{lang === 'ar' ? 'بقاء / إعادة' : 'Retain'}</option>
                        <option value="graduate">{lang === 'ar' ? 'خريج' : 'Graduate'}</option>
                        <option value="withdraw">{lang === 'ar' ? 'منسحب' : 'Withdraw'}</option>
                      </select>
                      {Array.isArray(it.failed_subjects) && it.failed_subjects.length > 0 && (
                        <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                          {it.failed_subjects.map((fs) => (
                            <span
                              key={fs.subject_id}
                              style={{
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(239,68,68,0.12)',
                                color: '#b91c1c',
                              }}
                              title={`${fs.subject_name}: ${fs.score ?? fs.percentage ?? fs.average ?? '-'}${fs.second_round_score !== null && fs.second_round_score !== undefined ? ` -> ${fs.second_round_score}` : ''}`}
                            >
                              {fs.subject_name} ({fs.second_round_score ?? fs.score ?? fs.percentage ?? fs.average ?? '-'})
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => openSecondRoundModal(it)}
                            style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: '1px solid #2563eb',
                              backgroundColor: 'rgba(37,99,235,0.1)',
                              color: '#1d4ed8',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {lang === 'ar' ? 'رصد دور ثاني' : '2nd Round'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {['promote', 'retain', 'supplementary'].includes(it.recommended_action) ? (
                        <select
                          value={it.target_class_id || ''}
                          onChange={(e) => updateItem(it.student_id, { target_class_id: e.target.value ? Number(e.target.value) : null })}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.4)' }}
                        >
                          <option value="">--</option>
                          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      ) : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        value={it.tuition_fee}
                        onChange={(e) => updateItem(it.student_id, { tuition_fee: Number(e.target.value) || 0 })}
                        style={{ width: '85px', padding: '4px 6px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.4)', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {carryoverArrears ? (
                        <input
                          type="number"
                          min="0"
                          value={it.previous_balance ?? 0}
                          onChange={(e) => updateItem(it.student_id, { previous_balance: Number(e.target.value) || 0 })}
                          style={{
                            width: '85px',
                            padding: '4px 6px',
                            borderRadius: '6px',
                            border: '1px solid rgba(148,163,184,0.4)',
                            textAlign: 'center',
                            color: Number(it.previous_balance || 0) > 0 ? '#b91c1c' : 'inherit',
                            fontWeight: Number(it.previous_balance || 0) > 0 ? 700 : 400,
                          }}
                        />
                      ) : (
                        <span style={{ opacity: 0.5 }}>0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(148,163,184,0.18)', backgroundColor: 'rgba(148,163,184,0.05)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700 }}>
            {lang === 'ar' ? 'تطبيق رسوم موحدة حسب الصف الهدف:' : 'Bulk Tuition by Target Class:'}
          </span>
          <select
            value={bulkClassId}
            onChange={(e) => setBulkClassId(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.4)', fontSize: '12px' }}
          >
            <option value="">{lang === 'ar' ? '-- اختر الصف الهدف --' : '-- Target Class --'}</option>
            <option value="all">{lang === 'ar' ? 'جميع الصفوف' : 'All Classes'}</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            type="number"
            min="0"
            placeholder={lang === 'ar' ? 'الرسوم الجديدة' : 'New tuition'}
            value={bulkTuition}
            onChange={(e) => setBulkTuition(e.target.value)}
            style={{ width: '110px', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.4)', fontSize: '12px' }}
          />
          <button
            type="button"
            onClick={applyBulkTuition}
            disabled={!bulkClassId || bulkTuition === '' || items.length === 0}
            style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #2563eb', backgroundColor: 'rgba(37,99,235,0.1)', color: '#1d4ed8', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
          >
            {lang === 'ar' ? 'تطبيق' : 'Apply'}
          </button>
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(148,163,184,0.25)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            {lang === 'ar' ? `عدد الطلاب بالمعاينة: ${filteredItems.length}` : `Students: ${filteredItems.length}`}
            {targetExistingCount > 0 && ` • (${lang === 'ar' ? `يوجد ${targetExistingCount} قيد مسبق في العام الهدف` : `${targetExistingCount} existing in target`})`}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {targetExistingCount > 0 && (
              <button
                type="button"
                disabled={executing}
                onClick={handleRollback}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #dc2626', backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626', fontWeight: 700, cursor: 'pointer' }}
              >
                <RotateCcw size={15} />
                <span>{lang === 'ar' ? 'التراجع عن الترحيل' : 'Rollback'}</span>
              </button>
            )}
            <button type="button" className="lang-btn" onClick={onClose}>
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
            <button
              type="button"
              disabled={executing || items.length === 0 || !fromYearId || !toYearId || fromYearId === toYearId}
              onClick={handleExecute}
              className="btn-primary-glass"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
            >
              <CheckCircle2 size={15} />
              <span>{executing ? (lang === 'ar' ? 'جارٍ التنفيذ...' : 'Executing...') : (lang === 'ar' ? 'تنفيذ الترحيل' : 'Execute Promotion')}</span>
            </button>
          </div>
        </div>
      </div>

      {secondRoundStudent && (
        <div
          className="modal-overlay"
          onClick={() => setSecondRoundStudent(null)}
          style={{ zIndex: 1300 }}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '92%', maxWidth: '420px', padding: '18px' }}
          >
            <h4 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 700 }}>
              {lang === 'ar'
                ? `رصد درجات الدور الثاني - ${secondRoundStudent.name_ar || secondRoundStudent.name || ''}`
                : `Second Round Scores - ${secondRoundStudent.name_ar || secondRoundStudent.name || ''}`}
            </h4>
            <form onSubmit={handleSaveSecondRound} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(secondRoundStudent.failed_subjects || []).map((fs) => (
                <div key={fs.subject_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    {fs.subject_name} <span style={{ opacity: 0.65, fontSize: '11px' }}>({lang === 'ar' ? 'المعدل:' : 'Avg:'} {fs.score ?? fs.percentage ?? fs.average ?? '-'})</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={secondRoundScores[fs.subject_id] ?? ''}
                    onChange={(e) =>
                      setSecondRoundScores((prev) => ({ ...prev, [fs.subject_id]: e.target.value }))
                    }
                    placeholder="0 - 100"
                    style={{ width: '90px', padding: '5px 8px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.4)', textAlign: 'center' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="lang-btn" onClick={() => setSecondRoundStudent(null)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savingSecondRound}
                  className="btn-primary-glass"
                  style={{ padding: '7px 14px' }}
                >
                  {savingSecondRound ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ الدرجات' : 'Save Scores')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
