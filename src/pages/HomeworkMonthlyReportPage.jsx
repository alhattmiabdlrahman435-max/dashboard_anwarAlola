import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { api } from '../services/api';
import { useAllowedClasses } from '../hooks/useAllowedClasses';
import { useClasses } from '../contexts/Classes/useClasses';
import { openElementPrintPreview } from '../utils/printPreview';
import '../styles/homeworkMonthlyReport.css';

const SCHOOL_NAME = 'مدارس انوار العلى الدولية النموذجية';
const WEEK_NAMES = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع', 'الأسبوع الخامس', 'الأسبوع السادس'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function classNumericId(cls) {
  return Number(cls?.numericId || String(cls?.id ?? '').replace(/\D/g, ''));
}

export default function HomeworkMonthlyReportPage() {
  const { allowedClasses } = useAllowedClasses('assignments');
  const { fetchClasses } = useClasses();
  const [classId, setClassId] = useState('');
  const [month, setMonth] = useState(currentMonthValue);
  const sheetRef = useRef(null);
  // fetchClasses is guarded inside the provider (no refetch when already loaded)
  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const [result, setResult] = useState({ key: '', data: null, error: '' });

  const effectiveClassId = classId || (allowedClasses?.length ? String(classNumericId(allowedClasses[0])) : '');
  const requestKey = effectiveClassId && /^\d{4}-\d{2}$/.test(month) ? `${effectiveClassId}|${month}` : '';
  const loading = Boolean(requestKey) && result.key !== requestKey;
  const report = result.key === requestKey ? result.data : null;
  const error = result.key === requestKey ? result.error : '';

  useEffect(() => {
    if (!requestKey) return undefined;
    let cancelled = false;
    const [cid, m] = requestKey.split('|');
    api.get(`/api/reports/homework-monthly?class_id=${encodeURIComponent(cid)}&month=${encodeURIComponent(m)}`)
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data, error: '' });
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setResult({ key: requestKey, data: null, error: err?.message || 'تعذر تحميل التقرير' });
      });
    return () => { cancelled = true; };
  }, [requestKey]);

  const weeks = useMemo(() => {
    const groups = [];
    (report?.days || []).forEach((day) => {
      const last = groups[groups.length - 1];
      if (last && last.week === day.week) last.days.push(day);
      else groups.push({ week: day.week, days: [day] });
    });
    return groups;
  }, [report]);

  const monthLabel = report?.month
    ? `${MONTH_NAMES[report.month.month - 1]} ${report.month.year}`
    : '';

  return (
    <div className="hw-report-page">
      <div className="section-card hw-report-controls no-print">
        <div className="hw-report-controls-row">
          <h2 className="hw-report-page-title">التقرير الشهري للواجبات</h2>
          <label className="hw-report-field">
            <span>الصف والشعبة</span>
            <select value={effectiveClassId} onChange={(e) => setClassId(e.target.value)}>
              {(allowedClasses || []).length === 0 && <option value="">لا توجد صفوف</option>}
              {(allowedClasses || []).map((cls) => (
                <option key={cls.id} value={classNumericId(cls)}>{cls.name}</option>
              ))}
            </select>
          </label>
          <label className="hw-report-field">
            <span>الشهر</span>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>
          <button
            type="button"
            className="btn-filled hw-report-print-btn"
            onClick={() => openElementPrintPreview(sheetRef.current, { title: 'معاينة التقرير الشهري للواجبات', landscape: true })}
            disabled={!report || loading}
          >
            <Eye size={18} />
            <span>معاينة وطباعة</span>
          </button>
        </div>
        {error && <div className="hw-report-error">{error}</div>}
      </div>

      {loading && <div className="hw-report-status no-print">جاري تحميل التقرير...</div>}

      {report && !loading && (
        <div ref={sheetRef} className="section-card hw-report-sheet">
          <div className="hw-report-header">
            <div className="hw-report-school">{report.school_name || SCHOOL_NAME}</div>
            <div className="hw-report-title">نموذج تقرير شهري لمتابعة إرسال الواجبات</div>
            <div className="hw-report-meta">
              <span>الصف والشعبة: <strong>{report.class?.name_ar}</strong></span>
              <span>الشهر: <strong>{monthLabel}</strong></span>
            </div>
          </div>

          <div className="hw-report-table-wrap">
            <table className="hw-report-table">
              <thead>
                <tr>
                  <th rowSpan={3} className="hw-col-subject">المادة</th>
                  <th rowSpan={3} className="hw-col-teacher sticky-col-name">المعلم</th>
                  {weeks.map((w) => (
                    <th key={`w-${w.week}`} colSpan={w.days.length} className="hw-week-head">
                      {WEEK_NAMES[w.week - 1] || `الأسبوع ${w.week}`}
                    </th>
                  ))}
                  <th rowSpan={3} className="hw-col-notes">الملاحظات</th>
                </tr>
                <tr>
                  {weeks.flatMap((w) => w.days.map((d, i) => (
                    <th key={`l-${d.date}`} className={`hw-day-head ${i === 0 ? 'hw-week-start' : ''}`} title={d.weekday_ar}>
                      {d.weekday_short}
                    </th>
                  )))}
                </tr>
                <tr>
                  {weeks.flatMap((w) => w.days.map((d, i) => (
                    <th key={`n-${d.date}`} className={`hw-day-num ${i === 0 ? 'hw-week-start' : ''}`}>
                      {d.day}
                    </th>
                  )))}
                </tr>
              </thead>
              <tbody>
                {(report.subjects || []).length === 0 && (
                  <tr>
                    <td colSpan={3 + (report.days || []).length} className="hw-empty">
                      لا توجد مواد مسجلة لهذا الصف
                    </td>
                  </tr>
                )}
                {(report.subjects || []).map((s) => (
                  <tr key={s.id}>
                    <td className="hw-col-subject">{s.name_ar}</td>
                    <td className="hw-col-teacher sticky-col-name">{s.teacher_name || ''}</td>
                    {weeks.flatMap((w) => w.days.map((d, i) => {
                      const count = s.homework?.[d.date] || 0;
                      return (
                        <td
                          key={`${s.id}-${d.date}`}
                          className={`hw-cell ${i === 0 ? 'hw-week-start' : ''} ${count ? 'hw-cell-done' : ''}`}
                          title={count ? `${d.weekday_ar} ${d.date}: ${count} واجب` : undefined}
                        >
                          {count ? '✓' : ''}
                          {count > 1 && <sup className="hw-count">{count}</sup>}
                        </td>
                      );
                    }))}
                    <td className="hw-col-notes" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="hw-report-footer">
            <span>إجمالي الواجبات المرسلة خلال الشهر: <strong>{report.total_assignments ?? 0}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
