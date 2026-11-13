import { useCallback, useEffect, useId, useState } from 'react';
import { controlBoardService } from '../../services/control/controlBoard.service';
import { errorText, isAbort, useControlToast } from './controlShared';
import '../../styles/controlBoardPrint.css';

/**
 * ترقيم اللجان:
 * الترقيم يدوي حسب عدد اللجان التي يضعها أعضاء الكنترول، وتظهر في نافذة أرقام اللجان
 * صفحات A4 أفقية متتالية في وسطها رقم اللجنة بخط كبير — طباعة جميع اللجان أو لجنة محددة وبالعدد المطلوب.
 */
export default function CommitteeNumberingView() {
  const toast = useControlToast();
  const uid = useId();

  const [committees, setCommittees] = useState([]);
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [printScope, setPrintScope] = useState('all'); // all | one
  const [printNumber, setPrintNumber] = useState('');
  const [copies, setCopies] = useState('1');
  const [printPages, setPrintPages] = useState(null);

  const applyCommittees = useCallback((list) => {
    setCommittees(list);
    setCount(list.length ? String(list.length) : '');
  }, []);

  useEffect(() => {
    let alive = true;
    controlBoardService
      .getCommittees()
      .then((res) => {
        if (alive) applyCommittees(res.committees || []);
      })
      .catch((err) => {
        if (alive && !isAbort(err)) toast(errorText(err));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [applyCommittees, toast]);

  // الطباعة بعد رسم الصفحات
  useEffect(() => {
    if (!printPages) return undefined;
    const done = () => setPrintPages(null);
    window.addEventListener('afterprint', done);
    const t = setTimeout(() => window.print(), 50);
    return () => {
      clearTimeout(t);
      window.removeEventListener('afterprint', done);
    };
  }, [printPages]);

  const handleSave = async () => {
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1) {
      toast('أدخل عدد اللجان');
      return;
    }
    setSaving(true);
    try {
      const res = await controlBoardService.saveCommittees(n);
      applyCommittees(res.committees || []);
      toast(res.message || 'تم حفظ ترقيم اللجان');
    } catch (err) {
      toast(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    if (committees.length === 0) {
      toast('لا توجد لجان. أدخل عدد اللجان ثم اضغط حفظ');
      return;
    }
    const nCopies = Number(copies);
    if (!Number.isInteger(nCopies) || nCopies < 1) {
      toast('أدخل عدد النسخ');
      return;
    }
    let numbers;
    if (printScope === 'one') {
      if (!printNumber) {
        toast('حدد رقم اللجنة');
        return;
      }
      numbers = [Number(printNumber)];
    } else {
      numbers = committees.map((c) => c.number);
    }
    const pages = [];
    numbers.forEach((num) => {
      for (let i = 0; i < nCopies; i += 1) pages.push({ key: `${num}-${i}`, num });
    });
    setPrintPages(pages);
  };

  return (
    <div className="cb-view">
      <div className="cb-box no-print">
        <div className="cb-field">
          <label htmlFor={`${uid}-count`}>عدد اللجان</label>
          <input
            id={`${uid}-count`}
            type="number"
            min="1"
            max="500"
            inputMode="numeric"
            className="text-field cb-num-input"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
        </div>
        <button type="button" className="cb-btn cb-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </div>

      <div className="no-print">
        {loading ? (
          <div className="cb-status">جاري التحميل...</div>
        ) : committees.length === 0 ? (
          <div className="cb-status">لم يتم ترقيم اللجان بعد. أدخل عدد اللجان ثم اضغط «حفظ».</div>
        ) : (
          <div className="cb-committee-grid" role="list" aria-label="اللجان">
            {committees.map((c) => (
              <div key={c.number} className="cb-committee-box" role="listitem">
                <strong>{c.number}</strong>
                <small>{c.students_count} طالب</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <fieldset className="cb-box no-print" style={{ margin: 0 }}>
        <legend style={{ fontWeight: 800, padding: '0 6px' }}>طباعة أرقام اللجان</legend>
        <label className="cb-radio">
          <input type="radio" name={`${uid}-scope`} value="all" checked={printScope === 'all'} onChange={() => setPrintScope('all')} />
          جميع اللجان
        </label>
        <label className="cb-radio">
          <input type="radio" name={`${uid}-scope`} value="one" checked={printScope === 'one'} onChange={() => setPrintScope('one')} />
          لجنة محددة
        </label>
        {printScope === 'one' && (
          <div className="cb-field">
            <label htmlFor={`${uid}-one`}>رقم اللجنة</label>
            <select id={`${uid}-one`} className="text-field" value={printNumber} onChange={(e) => setPrintNumber(e.target.value)}>
              <option value="">— اختر —</option>
              {committees.map((c) => (
                <option key={c.number} value={c.number}>
                  {c.number}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="cb-field">
          <label htmlFor={`${uid}-copies`}>عدد النسخ</label>
          <input
            id={`${uid}-copies`}
            type="number"
            min="1"
            inputMode="numeric"
            className="text-field cb-num-input"
            value={copies}
            onChange={(e) => setCopies(e.target.value)}
          />
        </div>
        <button type="button" className="cb-btn cb-btn-red" onClick={handlePrint} disabled={committees.length === 0}>
          طباعة
        </button>
      </fieldset>

      {printPages && (
        <div className="cb-print-only cb-committee-print">
          {printPages.map((p) => (
            <div key={p.key} className="cb-committee-print-page">
              <div className="cb-committee-print-title">اللجنة رقم ( {p.num} )</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
