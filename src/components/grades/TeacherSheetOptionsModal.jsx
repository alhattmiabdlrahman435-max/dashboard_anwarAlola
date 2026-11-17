import { memo } from 'react';
import { X, Printer, RotateCcw } from 'lucide-react';
import { SHEET_COLUMNS, DEFAULT_SHEET_OPTIONS, maxRowsFor } from '../../utils/teacherSheetPrint';

const box = { border: '1px solid rgba(148,163,184,0.35)', borderRadius: '10px', padding: '10px 12px' };
const lbl = { fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' };
const inp = { padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.5)', fontSize: '13px', width: '100%', background: 'var(--color-surface, #fff)', color: 'inherit' };
const row = { display: 'flex', flexWrap: 'wrap', gap: '8px 14px', alignItems: 'center' };

const Check = ({ checked, onChange, children }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span>{children}</span>
  </label>
);

const TeacherSheetOptionsModal = memo(function TeacherSheetOptionsModal({
  open, onClose, options, setOptions, scope, classes, subjectNames, selection, setSelection, onPrint,
}) {
  if (!open) return null;
  const set = (patch) => setOptions((prev) => ({ ...prev, ...patch }));
  const toggleIn = (arr, v, on) => (on ? Array.from(new Set([...arr, v])) : arr.filter((x) => x !== v));
  const maxRows = maxRowsFor(options.orientation);

  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} dir="rtl"
        style={{ background: 'var(--color-surface, #fff)', color: 'var(--color-text, #0f172a)', width: 'min(760px, 100%)', maxHeight: '92vh', overflowY: 'auto', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>⚙️ تخصيص استمارة الرصد</h3>
          <button type="button" onClick={onClose} aria-label="إغلاق" style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'inherit' }}><X size={18} /></button>
        </div>

        {scope === 'custom' && (
          <div style={box}>
            <span style={lbl}>الشعب والمواد المطلوب طباعتها</span>
            <div style={{ ...row, marginBottom: '6px' }}>
              <strong style={{ fontSize: '12px' }}>الشعب:</strong>
              <button type="button" className="lang-btn" style={{ padding: '2px 8px' }} onClick={() => setSelection((s) => ({ ...s, classIds: classes.map((c) => c.id) }))}>تحديد الكل</button>
              <button type="button" className="lang-btn" style={{ padding: '2px 8px' }} onClick={() => setSelection((s) => ({ ...s, classIds: [] }))}>إلغاء الكل</button>
            </div>
            <div style={{ ...row, maxHeight: '130px', overflowY: 'auto', marginBottom: '8px' }}>
              {classes.map((c) => (
                <Check key={c.id} checked={selection.classIds.includes(c.id)} onChange={(on) => setSelection((s) => ({ ...s, classIds: toggleIn(s.classIds, c.id, on) }))}>{c.name}</Check>
              ))}
            </div>
            <div style={{ ...row, marginBottom: '6px' }}>
              <strong style={{ fontSize: '12px' }}>المواد:</strong>
              <button type="button" className="lang-btn" style={{ padding: '2px 8px' }} onClick={() => setSelection((s) => ({ ...s, subjects: [...subjectNames] }))}>تحديد الكل</button>
              <button type="button" className="lang-btn" style={{ padding: '2px 8px' }} onClick={() => setSelection((s) => ({ ...s, subjects: [] }))}>إلغاء الكل</button>
            </div>
            <div style={{ ...row, maxHeight: '110px', overflowY: 'auto' }}>
              {subjectNames.map((n) => (
                <Check key={n} checked={selection.subjects.includes(n)} onChange={(on) => setSelection((s) => ({ ...s, subjects: toggleIn(s.subjects, n, on) }))}>{n}</Check>
              ))}
            </div>
          </div>
        )}

        <div style={box}>
          <span style={lbl}>الأعمدة التي تظهر في الاستمارة</span>
          <div style={row}>
            {SHEET_COLUMNS.map((c) => (
              <Check key={c.key} checked={options.columns.includes(c.key)} onChange={(on) => set({ columns: on ? SHEET_COLUMNS.filter((x) => options.columns.includes(x.key) || x.key === c.key).map((x) => x.key) : options.columns.filter((k) => k !== c.key) })}>
                {c.label}{c.max ? ` (${c.max})` : ''}
              </Check>
            ))}
            <Check checked={options.showCode} onChange={(on) => set({ showCode: on })}>عمود رقم القيد</Check>
          </div>
          <small style={{ opacity: 0.7 }}>الأعمدة الخمسة الأولى هي الأصل. المجموع والمحصلة يظهران تلقائياً في لوحة التحكم، فتركهما مطفأين هو الافتراضي.</small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={box}>
            <span style={lbl}>اتجاه الصفحة</span>
            <select style={inp} value={options.orientation} onChange={(e) => set({ orientation: e.target.value })}>
              <option value="portrait">↕️ طولي (A4)</option>
              <option value="landscape">↔️ عرضي (A4)</option>
            </select>
          </div>
          <div style={box}>
            <span style={lbl}>عدد الصفوف</span>
            <select style={{ ...inp, marginBottom: '6px' }} value={options.rowsMode} onChange={(e) => set({ rowsMode: e.target.value })}>
              <option value="fixed">عدد ثابت مع صفوف فارغة</option>
              <option value="students">بعدد الطلاب فقط</option>
            </select>
            {options.rowsMode === 'fixed' && (
              <input type="number" style={inp} min={5} max={maxRows} value={options.rowsPerPage}
                onChange={(e) => set({ rowsPerPage: e.target.value })} title={`من 5 إلى ${maxRows}`} />
            )}
            <small style={{ opacity: 0.7 }}>الحد الأقصى في الصفحة: {maxRows}</small>
          </div>
          <div style={box}>
            <span style={lbl}>ترتيب الطلاب</span>
            <select style={inp} value={options.studentOrder} onChange={(e) => set({ studentOrder: e.target.value })}>
              <option value="dashboard">كما في لوحة التحكم (الأفضل)</option>
              <option value="code">برقم القيد</option>
            </select>
          </div>
          <div style={box}>
            <span style={lbl}>اسم المعلم</span>
            <select style={inp} value={options.teacherMode} onChange={(e) => set({ teacherMode: e.target.value })}>
              <option value="system">من النظام (إن وُجد)</option>
              <option value="blank">اتركه فارغاً للكتابة بالقلم</option>
            </select>
          </div>
        </div>

        <div style={box}>
          <span style={lbl}>النصوص والعناصر</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '8px' }}>
            <div><small>العنوان</small><input style={inp} value={options.title} onChange={(e) => set({ title: e.target.value })} /></div>
            <div><small>العنوان الفرعي (اتركه فارغاً لإخفائه)</small><input style={inp} value={options.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></div>
            <div><small>نص التوقيع</small><input style={inp} value={options.signatureLabel} onChange={(e) => set({ signatureLabel: e.target.value })} /></div>
          </div>
          <div style={row}>
            <Check checked={options.showHeaderMeta} onChange={(on) => set({ showHeaderMeta: on })}>الترويسة (الشعار والتاريخ والعام الدراسي)</Check>
            <Check checked={options.showMonthTerm} onChange={(on) => set({ showMonthTerm: on })}>سطر الشهر والفترة</Check>
            <Check checked={options.showSignature} onChange={(on) => set({ showSignature: on })}>سطر التوقيع</Check>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="lang-btn" onClick={() => setOptions({ ...DEFAULT_SHEET_OPTIONS })} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
            <RotateCcw size={14} /> إعادة الافتراضي
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="lang-btn" onClick={onClose} style={{ padding: '8px 14px' }}>إغلاق</button>
            <button type="button" className="btn-primary-glass" onClick={() => { onClose(); onPrint(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}>
              <Printer size={15} /> معاينة وطباعة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TeacherSheetOptionsModal;
