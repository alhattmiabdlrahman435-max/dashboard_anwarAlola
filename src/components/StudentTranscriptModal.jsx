import { useCallback, useEffect, useState } from 'react';
import { X, BookOpen, Plus, Trash2, Printer, Building2, GraduationCap } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAcademicYear } from '../contexts/AcademicYear/AcademicYearContext';
import { openHtmlPrintPreview } from '../utils/printPreview';
import { SLOGAN_BASE64 } from '../assets/sloganBase64';

const STATUS_LABELS = {
  active: { ar: 'نشط', en: 'Active', bg: '#dcfce7', color: '#15803d' },
  promoted: { ar: 'ناجح ومنقول', en: 'Promoted', bg: '#dbeafe', color: '#1d4ed8' },
  supplementary: { ar: 'مكمل / دور ثاني', en: 'Supplementary', bg: '#fef3c7', color: '#b45309' },
  retained: { ar: 'راسب / معيد', en: 'Retained', bg: '#fee2e2', color: '#b91c1c' },
  graduated: { ar: 'متخرج', en: 'Graduated', bg: '#f3e8ff', color: '#7e22ce' },
  withdrawn: { ar: 'منسحب', en: 'Withdrawn', bg: '#f1f5f9', color: '#475569' },
};

export default function StudentTranscriptModal({ isOpen, student, onClose, canManage = false }) {
  const { lang, setToastMessage, triggerConfirm } = useApp();
  const { academicYears } = useAcademicYear();

  const [selectedYearFilter, setSelectedYearFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [showPriorForm, setShowPriorForm] = useState(false);
  const [savingPrior, setSavingPrior] = useState(false);
  const [priorForm, setPriorForm] = useState({
    school_name: '',
    academic_year_label: '',
    grade_name: '',
    term_label: '',
    total_score: '',
    max_score: '',
    percentage: '',
    result_status: 'ناجح',
    notes: '',
    subject_grades: [],
  });

  const loadTranscript = useCallback(async (yearOverride) => {
    if (!isOpen || !student?.id) return;
    const effectiveYear = yearOverride !== undefined ? yearOverride : selectedYearFilter;
    setLoading(true);
    try {
      const qs = effectiveYear && effectiveYear !== 'all'
        ? `?academic_year_id=${effectiveYear}`
        : '';
      const res = await api.get(`/api/students/${student.id}/transcript${qs}`);
      if (res?.success) {
        setData(res);
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر تحميل السجل الأكاديمي' : 'Failed to load transcript'), 'error');
    } finally {
      setLoading(false);
    }
  }, [isOpen, student, selectedYearFilter, setToastMessage, lang]);

  useEffect(() => {
    let ignore = false;
    if (isOpen && student?.id) {
      Promise.resolve().then(() => {
        if (!ignore) {
          loadTranscript();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, student, loadTranscript]);

  if (!isOpen || !student) return null;

  const handleAddSubjectRow = () => {
    setPriorForm((prev) => ({
      ...prev,
      subject_grades: [...prev.subject_grades, { subject: '', score: '', max_score: '100' }],
    }));
  };

  const handleUpdateSubjectRow = (idx, patch) => {
    setPriorForm((prev) => ({
      ...prev,
      subject_grades: prev.subject_grades.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  };

  const handleRemoveSubjectRow = (idx) => {
    setPriorForm((prev) => ({
      ...prev,
      subject_grades: prev.subject_grades.filter((_, i) => i !== idx),
    }));
  };

  const handleSavePriorRecord = async (e) => {
    e.preventDefault();
    if (!priorForm.school_name.trim() || !priorForm.academic_year_label.trim() || !priorForm.grade_name.trim()) {
      setToastMessage?.(lang === 'ar' ? 'يرجى إدخال اسم المدرسة السابقة والعام الدراسي والصف.' : 'Fill required fields', 'error');
      return;
    }

    setSavingPrior(true);
    try {
      const validSubjects = priorForm.subject_grades
        .filter((r) => r.subject.trim() && r.score !== '')
        .map((r) => ({
          subject: r.subject.trim(),
          score: Number(r.score) || 0,
          max_score: Number(r.max_score) || 100,
        }));

      const payload = {
        school_name: priorForm.school_name.trim(),
        academic_year_label: priorForm.academic_year_label.trim(),
        grade_name: priorForm.grade_name.trim(),
        term_label: priorForm.term_label.trim() || null,
        total_score: priorForm.total_score !== '' ? Number(priorForm.total_score) : null,
        max_score: priorForm.max_score !== '' ? Number(priorForm.max_score) : null,
        percentage: priorForm.percentage !== '' ? Number(priorForm.percentage) : null,
        result_status: priorForm.result_status,
        notes: priorForm.notes.trim() || null,
        subject_grades: validSubjects.length > 0 ? validSubjects : null,
      };

      const res = await api.post(`/api/students/${student.id}/prior-records`, payload);
      setToastMessage?.(res?.message || (lang === 'ar' ? 'تمت إضافة السجل بنجاح' : 'Added'), 'success');
      setShowPriorForm(false);
      setPriorForm({
        school_name: '',
        academic_year_label: '',
        grade_name: '',
        term_label: '',
        total_score: '',
        max_score: '',
        percentage: '',
        result_status: 'ناجح',
        notes: '',
        subject_grades: [],
      });
      loadTranscript();
    } catch (err) {
      setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر حفظ السجل السابق' : 'Save failed'), 'error');
    } finally {
      setSavingPrior(false);
    }
  };

  const handleDeletePriorRecord = (recordId) => {
    triggerConfirm?.({
      title: lang === 'ar' ? 'حذف السجل الدراسي السابق' : 'Delete Prior Record',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا السجل؟' : 'Are you sure?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/api/students/${student.id}/prior-records/${recordId}`);
          setToastMessage?.(res?.message || (lang === 'ar' ? 'تم الحذف بنجاح' : 'Deleted'), 'success');
          loadTranscript();
        } catch (err) {
          setToastMessage?.(err?.message || (lang === 'ar' ? 'فشل الحذف' : 'Delete failed'), 'error');
        }
      },
    });
  };

  const handlePrintTranscript = () => {
    if (!data) return;
    const yearsHtml = (data.years || []).map((yr) => {
      const st = STATUS_LABELS[yr.enrollment_status]?.ar || yr.enrollment_status;
      const subjRows = (yr.subjects || []).map((s, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td style="text-align:right;font-weight:600;">${s.subject_name}</td>
          <td>${s.term1 ?? '-'}</td>
          <td>${s.term2 ?? '-'}</td>
          <td><strong>${s.total} / ${s.max}</strong></td>
        </tr>
      `).join('');
      return `
        <div style="margin-bottom:18px;border:1px solid #cbd5e1;border-radius:8px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:8px;">
            <div><strong>العام الدراسي: ${yr.academic_year_name}</strong> — الصف: ${yr.class_name}</div>
            <div>الحالة: <strong>${st}</strong> ${yr.overall_percentage !== null ? `| المعدل: <strong>${yr.overall_percentage}%</strong>` : ''}</div>
          </div>
          <div style="font-size:12px;margin-bottom:8px;color:#334155;">
            الرسوم: <strong>${yr.financial.tuition_fee}</strong> | متأخرات سابقة: <strong>${yr.financial.previous_balance}</strong> | المدفوع: <strong>${yr.financial.total_paid}</strong> | المتبقي: <strong>${yr.financial.remaining}</strong>
          </div>
          ${subjRows ? `
            <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:center;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th style="border:1px solid #cbd5e1;padding:5px;">م</th>
                  <th style="border:1px solid #cbd5e1;padding:5px;text-align:right;">المادة</th>
                  <th style="border:1px solid #cbd5e1;padding:5px;">الترم الأول (50)</th>
                  <th style="border:1px solid #cbd5e1;padding:5px;">الترم الثاني (50)</th>
                  <th style="border:1px solid #cbd5e1;padding:5px;">المجموع</th>
                </tr>
              </thead>
              <tbody>${subjRows}</tbody>
            </table>
          ` : '<div style="font-size:12px;color:#64748b;">لا توجد درجات مرصودة لهذا العام.</div>'}
        </div>
      `;
    }).join('');

    const priorHtml = (data.prior_records || []).map((pr) => {
      const subs = Array.isArray(pr.subject_grades) && pr.subject_grades.length > 0
        ? `<div style="margin-top:6px;font-size:12px;">${pr.subject_grades.map((s) => `${s.subject}: ${s.score}/${s.max_score || 100}`).join(' | ')}</div>`
        : '';
      return `
        <div class="prior-record-block" style="margin-bottom:12px;border:1px solid #cbd5e1;border-radius:8px;padding:12px;page-break-inside:avoid;background-color:#ffffff;">
          <div><strong>${pr.school_name}</strong> — العام: ${pr.academic_year_label} — الصف: ${pr.grade_name} ${pr.term_label ? `(${pr.term_label})` : ''}</div>
          <div style="font-size:12px;margin-top:4px;">النتيجة: <strong>${pr.result_status}</strong> ${pr.percentage !== null ? `| النسبة: <strong>${pr.percentage}%</strong>` : ''} ${pr.total_score !== null ? `| المجموع: ${pr.total_score}/${pr.max_score || '-'}` : ''}</div>
          ${subs}
          ${pr.notes ? `<div style="font-size:11px;color:#64748b;margin-top:4px;">ملاحظات: ${pr.notes}</div>` : ''}
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>السجل الأكاديمي للطالب</title>
      <style>
        body { font-family: 'Cairo', Tahoma, Arial, sans-serif; padding: 20px; color: #0f172a; direction: rtl; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; page-break-inside: avoid; }
        td, th { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 12px; }
        th { background-color: #f8fafc; font-weight: 700; color: #1e293b; }
        .prior-record-block { page-break-inside: avoid; }
        @media print {
          body { padding: 10px; }
          .prior-record-block { page-break-inside: avoid; }
          table { page-break-inside: avoid; }
          @page { size: A4 portrait; margin: 10mm; }
        }
      </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1e3a8a;padding-bottom:10px;margin-bottom:16px;">
        <div><h2 style="margin:0;color:#1e3a8a;">السجل الأكاديمي الشامل للطالب</h2><div>${data.student.name_ar} (${data.student.student_code || data.student.id}) — ${data.student.class_name}</div></div>
        <img src="${SLOGAN_BASE64}" style="height:56px;" alt="logo" />
      </div>
      ${yearsHtml || '<p>لا توجد سجلات أعوام في المدرسة.</p>'}
      ${priorHtml ? `<h3 style="margin-top:20px;color:#0f766e;border-bottom:1px solid #cbd5e1;padding-bottom:6px;">السجل الدراسي السابق (من مدارس أخرى)</h3>${priorHtml}` : ''}
      </body></html>
    `;
    openHtmlPrintPreview(html, { title: `السجل الأكاديمي - ${data?.student?.name_ar || data?.student?.name || ''}` });
  };

  return (
    <div
      className="modal-overlay"
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '16px' }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{ width: '100%', maxWidth: '980px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '18px', backgroundColor: 'var(--card-bg, #ffffff)', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={22} color="var(--color-primary, #1e3a8a)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                {lang === 'ar' ? 'السجل الأكاديمي الشامل للطالب' : 'Student Academic Transcript'}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {student.name} ({student.studentCode || student.id}) — {student.grade} {student.section}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="text-field"
              style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontWeight: 600 }}
            >
              <option value="all">{lang === 'ar' ? 'جميع الأعوام الدراسية' : 'All Academic Years'}</option>
              {(academicYears || []).map((yr) => (
                <option key={yr.id} value={String(yr.id)}>{yr.name}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handlePrintTranscript}
              disabled={!data}
              className="btn-elevated"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 12px', fontSize: '13px', fontWeight: 700 }}
            >
              <Printer size={15} />
              <span>{lang === 'ar' ? 'طباعة السجل' : 'Print'}</span>
            </button>

            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              {lang === 'ar' ? 'جارٍ تحميل السجل الأكاديمي...' : 'Loading transcript...'}
            </div>
          ) : (
            <>
              {(data?.years || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                  <div>{lang === 'ar' ? 'لا توجد قيود مسجلة لهذا الطالب في النطاق المختار.' : 'No year records found.'}</div>
                  {selectedYearFilter !== 'all' && (
                    <button
                      type="button"
                      className="btn-elevated"
                      onClick={() => setSelectedYearFilter('all')}
                      style={{ marginTop: '10px', fontSize: '12px', padding: '6px 14px' }}
                    >
                      {lang === 'ar' ? 'عرض جميع الأعوام الدراسية' : 'Show All Academic Years'}
                    </button>
                  )}
                </div>
              ) : (
                (data?.years || []).map((yr) => {
                  const st = STATUS_LABELS[yr.enrollment_status] || STATUS_LABELS.active;
                  return (
                    <div key={yr.academic_year_id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', background: 'var(--color-surface-alt, #f8fafc)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <BookOpen size={16} color="#1e3a8a" />
                          <strong>{yr.academic_year_name}</strong>
                          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>• {yr.class_name}</span>
                          <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: st.bg, color: st.color }}>
                            {lang === 'ar' ? st.ar : st.en}
                          </span>
                        </div>
                        {yr.overall_percentage !== null && (
                          <div style={{ fontWeight: 800, color: yr.overall_percentage >= 50 ? '#15803d' : '#b91c1c' }}>
                            {lang === 'ar' ? `المعدل العام: ${yr.overall_percentage}%` : `Average: ${yr.overall_percentage}%`}
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '10px 16px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', borderBottom: '1px solid var(--color-border)', background: '#fff' }}>
                        <span>{lang === 'ar' ? 'الرسوم:' : 'Tuition:'} <strong>{yr.financial.tuition_fee}</strong></span>
                        <span>{lang === 'ar' ? 'متأخرات سابقة:' : 'Arrears:'} <strong style={{ color: yr.financial.previous_balance > 0 ? '#b91c1c' : 'inherit' }}>{yr.financial.previous_balance}</strong></span>
                        <span>{lang === 'ar' ? 'المدفوع:' : 'Paid:'} <strong style={{ color: '#15803d' }}>{yr.financial.total_paid}</strong></span>
                        <span>{lang === 'ar' ? 'المتبقي:' : 'Remaining:'} <strong style={{ color: yr.financial.remaining > 0 ? '#b91c1c' : '#15803d' }}>{yr.financial.remaining}</strong></span>
                      </div>

                      {(yr.subjects || []).length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="control-grade-table" style={{ width: '100%' }}>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                                <th>{lang === 'ar' ? 'الترم الأول (50)' : 'Term 1'}</th>
                                <th>{lang === 'ar' ? 'الترم الثاني (50)' : 'Term 2'}</th>
                                <th>{lang === 'ar' ? 'المجموع' : 'Total'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {yr.subjects.map((s, idx) => (
                                <tr key={s.subject_id}>
                                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{s.subject_name}</td>
                                  <td style={{ textAlign: 'center' }}>{s.term1 ?? '-'}</td>
                                  <td style={{ textAlign: 'center' }}>{s.term2 ?? '-'}</td>
                                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.total} / {s.max}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'لا توجد درجات مرصودة لهذا العام.' : 'No grades recorded for this year.'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Prior School Records Section */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px', color: '#0f766e' }}>
                    <Building2 size={18} />
                    <span>{lang === 'ar' ? 'السجل الدراسي السابق (الطلاب المنقولون من مدارس أخرى)' : 'Prior School Academic Records'}</span>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setShowPriorForm((v) => !v)}
                      className="btn-elevated"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, color: '#0f766e', borderColor: '#0f766e' }}
                    >
                      <Plus size={14} />
                      <span>{lang === 'ar' ? 'إضافة سجل مدرسة سابقة' : 'Add Prior Record'}</span>
                    </button>
                  )}
                </div>

                {showPriorForm && (
                  <form onSubmit={handleSavePriorRecord} style={{ padding: '14px', borderRadius: '10px', background: 'var(--color-surface-alt, #f8fafc)', border: '1px solid var(--color-border)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                      <input type="text" required placeholder={lang === 'ar' ? 'اسم المدرسة السابقة *' : 'Previous School *'} value={priorForm.school_name} onChange={(e) => setPriorForm({ ...priorForm, school_name: e.target.value })} className="text-field" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                      <input type="text" required placeholder={lang === 'ar' ? 'العام الدراسي (مثلاً 2024-2025) *' : 'Academic Year *'} value={priorForm.academic_year_label} onChange={(e) => setPriorForm({ ...priorForm, academic_year_label: e.target.value })} className="text-field" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                      <input type="text" required placeholder={lang === 'ar' ? 'الصف الدراسي *' : 'Grade *'} value={priorForm.grade_name} onChange={(e) => setPriorForm({ ...priorForm, grade_name: e.target.value })} className="text-field" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                      <input type="text" placeholder={lang === 'ar' ? 'الفصل الدراسي (اختياري)' : 'Term (Optional)'} value={priorForm.term_label} onChange={(e) => setPriorForm({ ...priorForm, term_label: e.target.value })} className="text-field" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                      <select value={priorForm.result_status} onChange={(e) => setPriorForm({ ...priorForm, result_status: e.target.value })} className="text-field" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <option value="ناجح">ناجح</option>
                        <option value="منقول">منقول</option>
                        <option value="راسب">راسب</option>
                      </select>
                      <input type="number" step="0.01" placeholder={lang === 'ar' ? 'المجموع' : 'Total Score'} value={priorForm.total_score} onChange={(e) => setPriorForm({ ...priorForm, total_score: e.target.value })} className="text-field" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                      <input type="number" step="0.01" placeholder={lang === 'ar' ? 'النهاية العظمى' : 'Max Score'} value={priorForm.max_score} onChange={(e) => setPriorForm({ ...priorForm, max_score: e.target.value })} className="text-field" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                      <input type="number" step="0.01" placeholder={lang === 'ar' ? 'النسبة % (تلقائي أو يدوي)' : 'Percentage %'} value={priorForm.percentage} onChange={(e) => setPriorForm({ ...priorForm, percentage: e.target.value })} className="text-field" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>{lang === 'ar' ? 'تفاصيل درجات المواد (اختياري):' : 'Subject Grades (Optional):'}</span>
                        <button type="button" onClick={handleAddSubjectRow} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '6px', border: '1px solid #0f766e', background: 'transparent', color: '#0f766e', cursor: 'pointer', fontWeight: 700 }}>
                          + {lang === 'ar' ? 'إضافة مادة' : 'Add Subject'}
                        </button>
                      </div>
                      {priorForm.subject_grades.map((row, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                          <input type="text" placeholder={lang === 'ar' ? 'اسم المادة' : 'Subject'} value={row.subject} onChange={(e) => handleUpdateSubjectRow(idx, { subject: e.target.value })} style={{ flex: 2, padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                          <input type="number" step="0.01" placeholder={lang === 'ar' ? 'الدرجة' : 'Score'} value={row.score} onChange={(e) => handleUpdateSubjectRow(idx, { score: e.target.value })} style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                          <input type="number" step="0.01" placeholder={lang === 'ar' ? 'العظمى' : 'Max'} value={row.max_score} onChange={(e) => handleUpdateSubjectRow(idx, { max_score: e.target.value })} style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                          <button type="button" onClick={() => handleRemoveSubjectRow(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                      ))}
                    </div>

                    <input type="text" placeholder={lang === 'ar' ? 'ملاحظات إضافية' : 'Notes'} value={priorForm.notes} onChange={(e) => setPriorForm({ ...priorForm, notes: e.target.value })} className="text-field" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button type="button" className="btn-elevated" onClick={() => setShowPriorForm(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                      <button type="submit" disabled={savingPrior} className="btn-primary-glass" style={{ padding: '6px 16px' }}>
                        {savingPrior ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ السجل السابق' : 'Save')}
                      </button>
                    </div>
                  </form>
                )}

                {(data?.prior_records || []).length === 0 ? (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {lang === 'ar' ? 'لا توجد سجلات لمدارس سابقة لهذا الطالب.' : 'No prior school records.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.prior_records.map((pr) => (
                      <div key={pr.id} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div>
                            <strong>{pr.school_name}</strong> — {pr.academic_year_label} — {pr.grade_name} {pr.term_label ? `(${pr.term_label})` : ''}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e' }}>
                              {pr.result_status} {pr.percentage !== null ? `• ${pr.percentage}%` : ''} {pr.total_score !== null ? `(${pr.total_score}/${pr.max_score || '-'})` : ''}
                            </span>
                            {canManage && (
                              <button type="button" onClick={() => handleDeletePriorRecord(pr.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }} title={lang === 'ar' ? 'حذف' : 'Delete'}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                        {Array.isArray(pr.subject_grades) && pr.subject_grades.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {pr.subject_grades.map((sg, i) => (
                              <span key={i} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                                {sg.subject}: <strong>{sg.score}</strong> / {sg.max_score || 100}
                              </span>
                            ))}
                          </div>
                        )}
                        {pr.notes && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>{pr.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
