import { useEffect, useMemo, useState } from 'react';
import { Printer, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { archiveService } from '../../services/archive/archive.service';
import { useAllowedClasses } from '../../hooks/useAllowedClasses';
import { useClasses } from '../../contexts/Classes/useClasses';
import sloganLogo from '../../assets/slogan.jpeg';
import '../../styles/archive.css';

const SCHOOL_NAME = 'مدارس انوار العلى الدولية النموذجية';

/** أعمدة النموذج بنفس ترتيب الملف (بعد م واسم الطالب) */
const COLUMNS = [
  { key: 'birth_date', label: 'تاريخ الميلاد', type: 'date', cls: 'ar-c-date' },
  { key: 'governorate', label: 'المحافظة', cls: 'ar-c-mid' },
  { key: 'address', label: 'عنوان السكن', cls: 'ar-c-wide' },
  { key: 'phone_call', label: 'رقم التلفون اتصال', type: 'tel', cls: 'ar-c-phone', prefill: 'parent_phone' },
  { key: 'phone_whatsapp', label: 'رقم التلفون واتس', type: 'tel', cls: 'ar-c-phone' },
  { key: 'phone_other', label: 'رقم تلفون آخر', type: 'tel', cls: 'ar-c-phone' },
  { key: 'guardian_national_id', label: 'رقم البطاقة الشخصية لولي الامر', cls: 'ar-c-phone', prefill: 'parent_national_id' },
  { key: 'archive_notes', label: 'ملاحظات', cls: 'ar-c-wide' },
];

function classNumericId(cls) {
  return Number(cls?.numericId || String(cls?.id ?? '').replace(/\D/g, ''));
}

/** يحوّل بيانات الخادم إلى صفوف قابلة للتعديل، مع تعبئة رقم الاتصال والبطاقة من حساب ولي الأمر إن كانت فارغة */
function toRows(students) {
  return students.map((s) => {
    const row = { id: s.id, name_ar: s.name_ar, prefilled: {} };
    COLUMNS.forEach((c) => {
      let v = s[c.key] ?? '';
      if (c.type === 'date' && v) v = String(v).slice(0, 10);
      if (!v && c.prefill && s[c.prefill]) {
        v = String(s[c.prefill]);
        row.prefilled[c.key] = true;
      }
      row[c.key] = v;
    });
    // الصف يُعدّ «معدَّلاً» إذا عُبّئ منه شيء من حساب ولي الأمر حتى يُحفظ عند الضغط على حفظ
    row.dirty = Object.keys(row.prefilled).length > 0;
    return row;
  });
}

export default function StudentDataView() {
  const { setToastMessage } = useApp();
  const { allowedClasses } = useAllowedClasses('students');
  const { fetchClasses } = useClasses();
  const [classId, setClassId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  const classes = useMemo(() => allowedClasses || [], [allowedClasses]);
  const className = classes.find((c) => String(classNumericId(c)) === String(classId))?.name || '';

  const toast = (msg, type) => {
    setToastMessage?.(msg, type);
    setTimeout(() => setToastMessage?.(''), 3500);
  };

  useEffect(() => {
    if (!classId) return undefined;
    let cancelled = false;
    archiveService.getStudents(classId)
      .then((res) => { if (!cancelled) setRows(toRows(Array.isArray(res?.students) ? res.students : [])); })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setRows([]);
        toast(err?.message || 'تعذر تحميل بيانات الطلاب', 'error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const setCell = (id, key, value) => {
    setRows((prev) => prev.map((r) => (r.id === id
      ? { ...r, [key]: value, dirty: true, prefilled: { ...r.prefilled, [key]: false } }
      : r)));
  };

  const dirtyCount = rows.filter((r) => r.dirty).length;

  const handleSave = async () => {
    const payload = rows.filter((r) => r.dirty).map((r) => {
      const o = { id: r.id };
      COLUMNS.forEach((c) => { o[c.key] = r[c.key] === '' ? null : r[c.key]; });
      return o;
    });
    if (payload.length === 0) return;
    setSaving(true);
    try {
      const res = await archiveService.saveStudents(payload);
      setRows((prev) => prev.map((r) => ({ ...r, dirty: false, prefilled: {} })));
      toast(res?.message || 'تم حفظ بيانات الطلاب.', 'success');
    } catch (err) {
      toast(err?.message || 'تعذر حفظ بيانات الطلاب', 'error');
    } finally {
      setSaving(false);
    }
  };

  const [blankPrint, setBlankPrint] = useState(false);
  /** blank = نموذج بأسماء الطلاب وخانات فارغة لتعبئته باليد من استمارات التسجيل */
  const printForm = (blank) => {
    setBlankPrint(blank);
    setTimeout(() => {
      window.print();
      setBlankPrint(false);
    }, 50);
  };

  const hasPrefill = rows.some((r) => Object.values(r.prefilled).some(Boolean));

  return (
    <div className="ar-view">
      {/* مسار النافذة كما في الملف: «بيانات الطلاب» ← «الصف والشعبة» */}
      <div className="ar-path no-print">
        <span className="cb-tile ar-path-tile">بيانات الطلاب</span>
        <span className="ar-path-arrow" aria-hidden="true">←</span>
        <label className="cb-tile ar-path-tile ar-path-select">
          <span>الصف والشعبة</span>
          <select
            className="text-field"
            value={classId}
            aria-label="الصف والشعبة"
            onChange={(e) => {
              if (dirtyCount > 0 && !window.confirm('توجد تعديلات غير محفوظة في هذه الشعبة. هل تريد تركها؟')) return;
              setRows([]);
              setLoading(Boolean(e.target.value));
              setClassId(e.target.value);
            }}
          >
            <option value="">— اختر —</option>
            {classes.map((cls) => (
              <option key={cls.id} value={classNumericId(cls)}>{cls.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="cb-controls no-print ar-controls">
        <button type="button" className="btn-filled cb-print-btn" onClick={handleSave} disabled={saving || dirtyCount === 0}>
          <Save size={18} />
          <span>{saving ? 'جاري الحفظ...' : `حفظ${dirtyCount ? ` (${dirtyCount})` : ''}`}</span>
        </button>
        <button type="button" className="btn-elevated cb-print-btn" onClick={() => printForm(false)} disabled={!classId || loading || rows.length === 0}>
          <Printer size={18} />
          <span>طباعة النموذج</span>
        </button>
        <button type="button" className="btn-elevated cb-print-btn" onClick={() => printForm(true)} disabled={!classId || loading || rows.length === 0}>
          <Printer size={18} />
          <span>طباعة نموذج فارغ للتعبئة باليد</span>
        </button>
      </div>

      {hasPrefill && (
        <div className="cb-note no-print">
          الخانات المظللة عُبّئت مبدئياً من حساب ولي الأمر (رقم الاتصال ورقم البطاقة) — يمكنك تعديلها، ولا تُحفظ إلا عند الضغط على «حفظ».
          تعديلها هنا لا يغيّر بيانات دخول ولي الأمر للتطبيق.
        </div>
      )}
      {classId && loading && <div className="cb-status">جاري التحميل...</div>}
      {classId && !loading && rows.length === 0 && <div className="cb-status">لا يوجد طلاب في هذه الشعبة</div>}

      {/* النموذج يظهر دائماً كما في الملف — قبل اختيار الشعبة يظهر بصفوف فارغة */}
      {!(classId && (loading || rows.length === 0)) && (
        <section
          className={`ar-sheet ar-landscape ar-watermark${blankPrint ? ' ar-blank-print' : ''}`}
          style={{ '--ar-logo': `url(${sloganLogo})` }}
        >
          <div className="ar-school ar-print-only">{SCHOOL_NAME}</div>
          <div className="ar-sheet-head ar-print-only">
            <span className="ar-print-tile">بيانات الطلاب</span>
            <span className="ar-print-tile">الصف والشعبة: {className}</span>
          </div>
          <div className="cb-table-wrap ar-data-wrap">
            <table className="ar-data">
              <thead>
                <tr>
                  <th className="ar-c-idx">م</th>
                  <th className="ar-c-name">اسم الطالب</th>
                  {COLUMNS.map((c) => <th key={c.key} className={c.cls}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {!classId && [1, 2, 3, 4].map((n) => (
                  <tr key={`empty-${n}`} className="ar-empty-row">
                    <td className="ar-c-idx" />
                    <td className="ar-c-name" />
                    {COLUMNS.map((c) => <td key={c.key} className={c.cls} />)}
                  </tr>
                ))}
                {classId && rows.map((r, i) => (
                  <tr key={r.id} className={r.dirty ? 'ar-dirty' : ''}>
                    <td className="ar-c-idx">{i + 1}</td>
                    <td className="ar-c-name">{r.name_ar}</td>
                    {COLUMNS.map((c) => (
                      <td key={c.key} className={c.cls}>
                        <input
                          className={`ar-input no-print${r.prefilled[c.key] ? ' ar-prefilled' : ''}`}
                          type={c.type === 'date' ? 'date' : 'text'}
                          inputMode={c.type === 'tel' ? 'tel' : undefined}
                          dir={c.type === 'tel' || c.type === 'date' ? 'ltr' : undefined}
                          value={r[c.key]}
                          aria-label={`${c.label} - ${r.name_ar}`}
                          onChange={(e) => setCell(r.id, c.key, e.target.value)}
                        />
                        <span className="ar-print-only ar-print-val">{r[c.key]}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!classId && <div className="cb-status no-print">اختر «الصف والشعبة» ليظهر النموذج بأسماء طلاب الشعبة</div>}
        </section>
      )}
    </div>
  );
}
