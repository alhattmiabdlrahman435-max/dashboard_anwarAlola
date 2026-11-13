import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Wand2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { archiveService } from '../../services/archive/archive.service';
import { useAllowedClasses } from '../../hooks/useAllowedClasses';
import { useClasses } from '../../contexts/Classes/useClasses';
import { suggestGender } from './genderSuggest';
import '../../styles/archive.css';

function classNumericId(cls) {
  return Number(cls?.numericId || String(cls?.id ?? '').replace(/\D/g, ''));
}

/**
 * تحديد الجنس — دفعة واحدة:
 *  - «جميع الشعب»: كل طلاب المدرسة الذين بدون جنس في شاشة واحدة.
 *  - «اقتراح الجنس من الاسم» / «الكل ذكر» / «الكل أنثى» ثم تعديل الاستثناءات فقط.
 *  - لا يُحفظ شيء إلا بالضغط على «حفظ» بعد المراجعة.
 */
export default function GenderEntryView() {
  const { setToastMessage } = useApp();
  const [params, setParams] = useSearchParams();
  const { allowedClasses } = useAllowedClasses('students');
  const { fetchClasses } = useClasses();
  const classId = params.get('class_id') || 'all';
  const [state, setState] = useState({ key: '', students: [] });
  const [choice, setChoice] = useState({}); // id → 'male' | 'female'
  const [suggested, setSuggested] = useState({}); // id → 'name' | 'branch' (اقتراح لم يُراجع يدوياً)
  // تجميع للعرض فقط (لا يغيّر ترتيب الطلاب في فصولهم ولا أي بيانات): يُثبَّت لحظة الضغط على «اقتراح»
  const [groupOf, setGroupOf] = useState(null); // id → 'manual' | 'branch' | 'name'
  // ميزة اختيارية: الاقتراح من فرع الشعبة (الصف السابع فما فوق) — متوقفة افتراضياً
  const [useBranch, setUseBranch] = useState(() => {
    try { return localStorage.getItem('archive-gender-use-branch') === '1'; } catch { return false; }
  });
  const toggleBranch = (on) => {
    setUseBranch(on);
    try { localStorage.setItem('archive-gender-use-branch', on ? '1' : '0'); } catch { /* تخزين غير متاح */ }
  };
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  const classes = useMemo(() => allowedClasses || [], [allowedClasses]);

  const toast = (msg, type) => {
    setToastMessage?.(msg, type);
    setTimeout(() => setToastMessage?.(''), 4000);
  };

  const loadKey = `${classId}:${reload}`;
  useEffect(() => {
    let cancelled = false;
    archiveService.getStudents(classId, { missingGender: classId === 'all' })
      .then((res) => {
        if (!cancelled) setState({ key: loadKey, students: Array.isArray(res?.students) ? res.students : [] });
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setState({ key: loadKey, students: [] });
        toast(err?.message || 'تعذر تحميل الطلاب', 'error');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadKey]);

  const loading = state.key !== loadKey;
  const students = loading ? [] : state.students;
  const current = (s) => choice[s.id] ?? s.gender ?? '';
  const changed = students.filter((s) => choice[s.id] && choice[s.id] !== s.gender);
  const missing = students.filter((s) => !current(s)).length;
  const males = students.filter((s) => current(s) === 'male').length;
  const females = students.filter((s) => current(s) === 'female').length;
  const byName = students.filter((s) => suggested[s.id] === 'name' && choice[s.id]).length;
  const byBranch = students.filter((s) => suggested[s.id] === 'branch' && choice[s.id]).length;

  const changeClass = (v) => {
    if (changed.length && !window.confirm('توجد اختيارات غير محفوظة. هل تريد تركها؟')) return;
    setChoice({});
    setSuggested({});
    setGroupOf(null);
    const next = { view: 'gender', class_id: v };
    if (params.get('back')) next.back = params.get('back');
    setParams(next);
  };

  const pick = (id, v) => {
    setChoice((c) => ({ ...c, [id]: v }));
    setSuggested((x) => ({ ...x, [id]: false }));
  };

  /** يملأ فقط الطلاب الذين لم يُحدَّد جنسهم بعد */
  const applyToEmpty = (fn, isSuggestion) => {
    const nextChoice = { ...choice };
    const nextSug = { ...suggested };
    let n = 0;
    students.forEach((s) => {
      if (current(s)) return;
      const v = fn(s);
      if (v) { nextChoice[s.id] = v; nextSug[s.id] = isSuggestion; n += 1; }
    });
    setChoice(nextChoice);
    setSuggested(nextSug);
    return n;
  };

  /**
   * 1) من الاسم الأول.
   * 2) إن لم يُعرف من الاسم: في الصف السابع فما فوق فقط (شعب غير مختلطة) يُقترح من فرع الشعبة.
   *    التمهيدي–السادس شعب مختلطة → يبقى للتحديد اليدوي.
   */
  const suggestAll = () => {
    const nextChoice = { ...choice };
    const nextSug = { ...suggested };
    const groups = {};
    let nName = 0;
    let nBranch = 0;
    let nManual = 0;
    students.forEach((s) => {
      if (current(s)) { groups[s.id] = 'name'; return; }
      const g = suggestGender(s.name_ar);
      if (g) { nextChoice[s.id] = g; nextSug[s.id] = 'name'; groups[s.id] = 'name'; nName += 1; return; }
      if (useBranch && Number(s.stage) === 2 && (s.branch === 'boys' || s.branch === 'girls')) {
        nextChoice[s.id] = s.branch === 'boys' ? 'male' : 'female';
        nextSug[s.id] = 'branch';
        groups[s.id] = 'branch';
        nBranch += 1;
        return;
      }
      groups[s.id] = 'manual';
      nManual += 1;
    });
    setChoice(nextChoice);
    setSuggested(nextSug);
    setGroupOf(groups);
    toast(
      `اقتراح من الاسم: ${nName}${useBranch ? ` — من فرع الشعبة: ${nBranch}` : ''}${nManual ? ` — يحتاج تحديد يدوي: ${nManual} (في أعلى القائمة)` : ''}. راجع ثم اضغط «حفظ».`,
      'info',
    );
  };

  /** الطلاب مرتبون للعرض: «يحتاج تحديد يدوي» ثم «مقترح من الفرع» ثم الباقي — مع الحفاظ على ترتيبهم داخل كل مجموعة */
  const GROUPS = [
    ['manual', 'يحتاج تحديد يدوي — لم يُعرف الجنس من الاسم'],
    ['branch', 'مقترح من فرع الشعبة (الصف السابع فما فوق) — راجعها'],
    ['name', 'مقترح من الاسم أو محدد مسبقاً'],
  ];
  const sections = groupOf
    ? GROUPS.map(([key, title]) => ({ key, title, list: students.filter((s) => (groupOf[s.id] || 'name') === key) }))
      .filter((g) => g.list.length > 0)
    : [{ key: 'all', title: null, list: students }];

  const setAll = (v) => {
    if (classId === 'all' && !window.confirm(`سيتم تعيين «${v === 'male' ? 'ذكر' : 'أنثى'}» لكل الطلاب غير المحددين في كل الشعب. متأكد؟`)) return;
    applyToEmpty(() => v, false);
  };

  const save = async () => {
    if (!changed.length) return;
    if (missing > 0 && !window.confirm(`سيتم حفظ ${changed.length} طالب، وسيبقى ${missing} بدون جنس. متابعة؟`)) return;
    setSaving(true);
    try {
      const res = await archiveService.saveGenders(changed.map((s) => ({ id: s.id, gender: choice[s.id] })));
      toast(res?.message || 'تم الحفظ', 'success');
      setChoice({});
      setSuggested({});
      setGroupOf(null);
      setReload((n) => n + 1);
    } catch (err) {
      toast(err?.message || 'تعذر الحفظ', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ar-view">
      <div className="cb-controls no-print ar-controls">
        <label className="cb-field">
          <span>الصف والشعبة</span>
          <select className="text-field" value={classId} onChange={(e) => changeClass(e.target.value)}>
            <option value="all">جميع الشعب — كل الطلاب بدون جنس</option>
            {classes.map((cls) => (
              <option key={cls.id} value={classNumericId(cls)}>{cls.name}</option>
            ))}
          </select>
        </label>
        <label className="cb-radio ar-branch-opt" title="للأسماء التي لا يُعرف جنسها من الاسم فقط، وفي الصف السابع فما فوق (شعب غير مختلطة)">
          <input
            type="checkbox"
            checked={useBranch}
            onChange={(e) => toggleBranch(e.target.checked)}
            disabled={!!groupOf}
          />
          الاقتراح من فرع الشعبة (السابع فما فوق)
        </label>
        <button type="button" className="cb-btn" onClick={suggestAll} disabled={loading || missing === 0}>
          <Wand2 size={16} style={{ verticalAlign: 'middle' }} /> اقتراح الجنس من الاسم
        </button>
        <button type="button" className="cb-btn" onClick={() => setAll('male')} disabled={loading || missing === 0}>الكل ذكر</button>
        <button type="button" className="cb-btn" onClick={() => setAll('female')} disabled={loading || missing === 0}>الكل أنثى</button>
        <button type="button" className="btn-filled cb-print-btn" onClick={save} disabled={saving || !changed.length}>
          <Save size={18} />
          <span>{saving ? 'جاري الحفظ...' : `حفظ${changed.length ? ` (${changed.length})` : ''}`}</span>
        </button>
      </div>

      <div className="cb-note">
        «الكل ذكر / الكل أنثى / الاقتراح» تملأ الطلاب غير المحددين فقط ولا تغيّر ما حُدِّد سابقاً.
        الاقتراح من الاسم الأول{useBranch ? '، وإن لم يُعرف ففي الصف السابع فما فوق من فرع الشعبة' : ''}. بعد الاقتراح يظهر
        من يحتاج تحديداً يدوياً مجمَّعاً في أعلى القائمة (العرض فقط — لا يتغير ترتيب الطلاب في فصولهم).
      </div>

      {loading && <div className="cb-status">جاري التحميل...</div>}
      {!loading && students.length === 0 && (
        <div className="cb-status">{classId === 'all' ? 'لا يوجد طلاب بدون جنس — البيانات مكتملة ✓' : 'لا يوجد طلاب في هذه الشعبة'}</div>
      )}

      {!loading && students.length > 0 && (
        <>
          <div className={`cb-note ${missing ? 'ar-note-error' : ''}`}>
            عدد الطلاب: <strong>{students.length}</strong> — ذكور: <strong>{males}</strong> — إناث: <strong>{females}</strong>
            {missing > 0 ? <> — بدون جنس: <strong>{missing}</strong></> : ' — مكتمل ✓'}
            {byName > 0 && <> — مقترح من الاسم: <strong>{byName}</strong></>}
            {byBranch > 0 && <> — مقترح من الفرع: <strong>{byBranch}</strong></>}
          </div>
          <div className="cb-table-wrap">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>م</th>
                  <th>اسم الطالب</th>
                  {classId === 'all' && <th>الصف والشعبة</th>}
                  <th>الجنس</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((g) => [
                  g.title && (
                    <tr key={`h-${g.key}`} className={`ar-group-head ar-group-${g.key}`}>
                      <th colSpan={classId === 'all' ? 4 : 3}>{g.title} ({g.list.length})</th>
                    </tr>
                  ),
                  ...g.list.map((s, i) => (
                    <tr key={s.id} className={!current(s) ? 'ar-row-incomplete' : ''}>
                      <td>{i + 1}</td>
                      <td className="cb-name">
                        {s.name_ar}
                        {suggested[s.id] === 'name' && choice[s.id] && <span className="ar-sug"> مقترح من الاسم</span>}
                        {suggested[s.id] === 'branch' && choice[s.id] && <span className="ar-sug ar-sug-branch"> مقترح من الفرع</span>}
                      </td>
                      {classId === 'all' && <td>{s.class_name}</td>}
                      <td>
                        <div className="ar-gender" role="radiogroup" aria-label={`الجنس - ${s.name_ar}`}>
                          {[['male', 'ذكر'], ['female', 'أنثى']].map(([v, label]) => (
                            <label key={v} className={`ar-gender-opt${current(s) === v ? ' is-on' : ''}`}>
                              <input
                                type="radio"
                                name={`g-${s.id}`}
                                value={v}
                                checked={current(s) === v}
                                onChange={() => pick(s.id, v)}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
