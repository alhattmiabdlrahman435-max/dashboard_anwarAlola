import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { controlBoardService } from '../../services/control/controlBoard.service';
import PrintHeader from '../../components/PrintHeader';
import { openElementPrintPreview } from '../../utils/printPreview';
import { classNumericId, useControlClasses } from './controlPrintShared';

/**
 * ترحيل المحصلات ودرجات الاختبارات (ملحق 2 صفحة 7) — داخل قسم الكنترول:
 *  الصف والشعبة ← «ترحيل المحصلة الأولى / الثانية» (تُحسب من المحصلات الشهرية لكل المواد)
 *  ← «إدخال درجات نصف العام»: م1 (محصلة من 20) + ن1 (اختبار من 30 يدوياً) + مج (من 50)
 *  ← «إدخال درجات نهاية العام»: م1 ن1 م2 ن2 + مج (من 100)
 * الجدول يضم كل مواد الشعبة مع رقم الجلوس والرقم السري واسم الطالب.
 */

const EXAM_MAX = 30;
const toNum = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v) || 0);
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));

export default function TermSheetsView() {
  const { setToastMessage } = useApp();
  const classes = useControlClasses();
  const [classId, setClassId] = useState('');
  const [students, setStudents] = useState([]); // من الكنترول: الاسم + رقم الجلوس + الرقم السري
  const [grades, setGrades] = useState({}); // studentId → { term1: {subject: {coursework, finalExam}}, term2: {...} }
  const [subjectIds, setSubjectIds] = useState({}); // اسم المادة → id
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [reloadTick, setReloadTick] = useState(0);
  const midRef = useRef(null);
  const finalRef = useRef(null);

  const toast = useCallback((msg, type) => {
    setToastMessage?.(msg, type);
    setTimeout(() => setToastMessage?.(''), 3500);
  }, [setToastMessage]);

  const cls = useMemo(() => classes.find((c) => String(classNumericId(c)) === String(classId)), [classes, classId]);
  const className = cls?.name || '';

  // مواد الشعبة: من تعريف الشعبة، وإن لم يوجد فالمواد التي لها درجات
  const subjectNames = useMemo(() => {
    const declared = Array.isArray(cls?.subjects) ? cls.subjects.filter(Boolean) : [];
    if (declared.length) return declared;
    const used = new Set();
    Object.values(grades).forEach((g) => ['term1', 'term2'].forEach((t) => Object.entries(g?.[t] || {}).forEach(([name, v]) => {
      if ((v?.coursework ?? 0) || (v?.finalExam ?? 0)) used.add(name);
    })));
    return [...used];
  }, [cls, grades]);

  useEffect(() => {
    api.get('/api/subjects?per_page=300')
      .then((res) => {
        const list = res?.subjects || res?.data || [];
        const map = {};
        list.forEach((s) => { map[s.name_ar || s.name] = s.id; });
        setSubjectIds(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!classId) return undefined;
    let cancelled = false;
    Promise.all([controlBoardService.getStudents(classId), api.get(`/api/grades/class/${classId}`)])
      .then(([st, gr]) => {
        if (cancelled) return;
        const map = {};
        (gr?.students || []).forEach((s) => { map[String(s.studentId)] = s.grades; });
        setStudents(Array.isArray(st?.students) ? st.students : []);
        setGrades(map);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setStudents([]);
        setGrades({});
        setLoading(false);
        toast(err?.message || 'تعذر تحميل الدرجات', 'error');
      });
    return () => { cancelled = true; };
  }, [classId, reloadTick, toast]);

  const cell = (studentId, term, subject) => grades[String(studentId)]?.[term]?.[subject] || {};

  const transfer = async (termKey, label) => {
    if (!classId) return;
    if (!window.confirm(`سيتم ${label} لكل مواد ${className}: المحصلة = (م1 + م2 + م3) ÷ 15 من 20، وتُكتب في كشف الترم. متابعة؟`)) return;
    setBusy(termKey);
    try {
      const res = await api.post('/api/grades/transfer-coursework', { class_id: Number(classId), term: termKey });
      toast(res?.message || 'تم الترحيل', 'success');
      setReloadTick((n) => n + 1);
    } catch (err) {
      toast(err?.message || 'تعذر ترحيل المحصلة', 'error');
    } finally {
      setBusy('');
    }
  };

  const setExam = async (student, termKey, subject, raw) => {
    const sid = subjectIds[subject];
    if (!sid) { toast(`المادة «${subject}» غير معرّفة`, 'error'); return; }
    let val = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(val) || val < 0) val = 0;
    if (val > EXAM_MAX) { toast(`درجة الاختبار لا تزيد عن ${EXAM_MAX}`, 'error'); val = EXAM_MAX; }
    // تحديث فوري على الشاشة ثم حفظ
    setGrades((prev) => {
      const g = { ...(prev[String(student.id)] || {}) };
      g[termKey] = { ...(g[termKey] || {}), [subject]: { ...(g[termKey]?.[subject] || {}), finalExam: val } };
      return { ...prev, [String(student.id)]: g };
    });
    try {
      await api.post('/api/grades/detailed', { student_id: student.id, subject_id: sid, term: termKey, month: 'final', final_exam: val });
    } catch (err) {
      toast(err?.message || 'تعذر حفظ الدرجة', 'error');
      setReloadTick((n) => n + 1);
    }
  };

  const examInput = (student, termKey, subject) => {
    const v = cell(student.id, termKey, subject).finalExam;
    return (
      <>
        <input
          className="ts-input no-print"
          type="number"
          min="0"
          max={EXAM_MAX}
          step="0.5"
          inputMode="decimal"
          value={v === undefined || v === null || Number(v) === 0 ? '' : v}
          aria-label={`${subject} - ${student.name_ar}`}
          onChange={(e) => setGrades((prev) => {
            const g = { ...(prev[String(student.id)] || {}) };
            g[termKey] = { ...(g[termKey] || {}), [subject]: { ...(g[termKey]?.[subject] || {}), finalExam: e.target.value } };
            return { ...prev, [String(student.id)]: g };
          })}
          onBlur={(e) => setExam(student, termKey, subject, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        />
        <span className="ts-print-val">{v ? fmt(toNum(v)) : ''}</span>
      </>
    );
  };

  const cw = (studentId, termKey, subject) => {
    const c = cell(studentId, termKey, subject).coursework;
    return c === null || c === undefined ? null : toNum(c);
  };

  const print = (ref, title) => openElementPrintPreview(ref.current, {
    title, landscape: true, extraCss: '.ts-print-val{display:inline !important}.ts-table{font-size:10px}',
  });

  const idCols = (
    <>
      <th rowSpan={2} className="ts-c-idx">م</th>
      <th rowSpan={2} className="ts-c-num">رقم الجلوس</th>
      <th rowSpan={2} className="ts-c-num">الرقم السري</th>
      <th rowSpan={2} className="ts-c-name">اسم الطالب</th>
    </>
  );

  const idCells = (s, i) => (
    <>
      <td className="ts-c-idx">{i + 1}</td>
      <td className="ts-c-num">{s.seat_number ?? ''}</td>
      <td className="ts-c-num">{s.secret_number ?? ''}</td>
      <td className="ts-c-name">{s.name_ar}</td>
    </>
  );

  return (
    <div className="cb-view ts-view">
      <div className="cb-box no-print">
        <div className="cb-field">
          <label htmlFor="ts-class">الصف والشعبة :</label>
          <select
            id="ts-class"
            className="text-field"
            value={classId}
            onChange={(e) => { setClassId(e.target.value); setLoading(Boolean(e.target.value)); setStudents([]); setGrades({}); }}
          >
            <option value="">— اختر —</option>
            {classes.map((c) => <option key={c.id} value={classNumericId(c)}>{c.name}</option>)}
          </select>
        </div>
        <button type="button" className="cb-btn cb-btn-red" disabled={!classId || !!busy} onClick={() => transfer('term1', 'ترحيل المحصلة الأولى')}>
          {busy === 'term1' ? 'جاري الترحيل...' : 'ترحيل المحصلة الأولى'}
        </button>
        <button type="button" className="cb-btn cb-btn-red" disabled={!classId || !!busy} onClick={() => transfer('term2', 'ترحيل المحصلة الثانية')}>
          {busy === 'term2' ? 'جاري الترحيل...' : 'ترحيل المحصلة الثانية'}
        </button>
      </div>

      {!classId && <div className="cb-status">حدد الصف والشعبة</div>}
      {classId && loading && <div className="cb-status">جاري التحميل...</div>}
      {classId && !loading && students.length === 0 && <div className="cb-status">لا يوجد طلاب في هذه الشعبة</div>}
      {classId && !loading && students.length > 0 && subjectNames.length === 0 && (
        <div className="cb-note cb-note-warn">لا توجد مواد معرّفة لهذه الشعبة — أضف المواد من صفحة «الصفوف».</div>
      )}

      {classId && !loading && students.length > 0 && subjectNames.length > 0 && (
        <>
          {/* ===== إدخال درجات نصف العام ===== */}
          <section className="ts-section">
            <div className="ts-head no-print">
              <h3 className="ts-title">ادخال درجات نصف العام</h3>
              <button type="button" className="cb-btn" onClick={() => print(midRef, `درجات نصف العام — ${className}`)}>
                <Printer size={16} style={{ verticalAlign: 'middle' }} /> طباعة
              </button>
            </div>
            <div ref={midRef} className="ts-sheet" dir="rtl">
              <PrintHeader title="درجات نصف العام (الترم الأول)" scopeRight={`الصف والشعبة: ${className}`} scopeLeft={`عدد الطلاب: ${students.length}`} />
              <div className="cb-table-wrap">
                <table className="cb-table ts-table">
                  <thead>
                    <tr>
                      {idCols}
                      {subjectNames.map((sub) => <th key={sub} colSpan={3} className="ts-sub">{sub}</th>)}
                    </tr>
                    <tr>
                      {subjectNames.map((sub) => (
                        <FragmentCols key={sub} cols={['م١', 'ن١', 'مج']} />
                      ))}
                    </tr>
                    <tr className="ts-max">
                      <td colSpan={4} />
                      {subjectNames.map((sub) => <FragmentCols key={sub} cols={['20', '30', '50']} tag="td" />)}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id}>
                        {idCells(s, i)}
                        {subjectNames.map((sub) => {
                          const c = cw(s.id, 'term1', sub);
                          const e = toNum(cell(s.id, 'term1', sub).finalExam);
                          return (
                            <FragmentCells key={sub}>
                              <td className="ts-c-g">{c === null ? '' : fmt(c)}</td>
                              <td className="ts-c-g">{examInput(s, 'term1', sub)}</td>
                              <td className="ts-c-g ts-total">{c === null && e === 0 ? '' : fmt(toNum(c) + e)}</td>
                            </FragmentCells>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="cb-note no-print">
              المحصلة (م١) تظهر بعد «ترحيل المحصلة الأولى». درجة الاختبار (ن١) تُدخل يدوياً من 30، ويظهر المجموع (مج) تلقائياً من 50. تُحفظ كل درجة بمجرد الانتقال من الخانة.
            </p>
          </section>

          {/* ===== إدخال درجات نهاية العام ===== */}
          <section className="ts-section">
            <div className="ts-head no-print">
              <h3 className="ts-title">ادخال درجات نهاية العام</h3>
              <button type="button" className="cb-btn" onClick={() => print(finalRef, `درجات نهاية العام — ${className}`)}>
                <Printer size={16} style={{ verticalAlign: 'middle' }} /> طباعة
              </button>
            </div>
            <div ref={finalRef} className="ts-sheet" dir="rtl">
              <PrintHeader title="درجات نهاية العام (الترمان)" scopeRight={`الصف والشعبة: ${className}`} scopeLeft={`عدد الطلاب: ${students.length}`} />
              <div className="cb-table-wrap">
                <table className="cb-table ts-table">
                  <thead>
                    <tr>
                      {idCols}
                      {subjectNames.map((sub) => <th key={sub} colSpan={5} className="ts-sub">{sub}</th>)}
                    </tr>
                    <tr>
                      {subjectNames.map((sub) => (
                        <FragmentCols key={sub} cols={['م١', 'ن١', 'م٢', 'ن٢', 'مج']} />
                      ))}
                    </tr>
                    <tr className="ts-max">
                      <td colSpan={4} />
                      {subjectNames.map((sub) => <FragmentCols key={sub} cols={['20', '30', '20', '30', '100']} tag="td" />)}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id}>
                        {idCells(s, i)}
                        {subjectNames.map((sub) => {
                          const c1 = cw(s.id, 'term1', sub);
                          const c2 = cw(s.id, 'term2', sub);
                          const e1 = toNum(cell(s.id, 'term1', sub).finalExam);
                          const e2 = toNum(cell(s.id, 'term2', sub).finalExam);
                          const any = c1 !== null || c2 !== null || e1 || e2;
                          return (
                            <FragmentCells key={sub}>
                              <td className="ts-c-g">{c1 === null ? '' : fmt(c1)}</td>
                              <td className="ts-c-g">{examInput(s, 'term1', sub)}</td>
                              <td className="ts-c-g">{c2 === null ? '' : fmt(c2)}</td>
                              <td className="ts-c-g">{examInput(s, 'term2', sub)}</td>
                              <td className="ts-c-g ts-total">{any ? fmt(toNum(c1) + e1 + toNum(c2) + e2) : ''}</td>
                            </FragmentCells>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="cb-note no-print">
              م١ ون١ للترم الأول، م٢ ون٢ للترم الثاني، والمجموع (مج) من 100 يظهر تلقائياً. ترحيل المحصلة الثانية يملأ م٢.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

/** أعمدة رأس لمادة (th أو td) — مكوّن صغير حتى لا نستعمل Fragment بمفاتيح مكررة */
function FragmentCols({ cols, tag = 'th' }) {
  const Tag = tag;
  return cols.map((c, i) => <Tag key={`${c}-${i}`} className="ts-c-g">{c}</Tag>);
}

function FragmentCells({ children }) {
  return children;
}
