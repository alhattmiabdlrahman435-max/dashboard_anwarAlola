import { useEffect, useId, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { controlBoardService } from '../../services/control/controlBoard.service';
import { classLabel, classValue, errorText, isAbort, useControlClasses, useControlToast } from './controlShared';

/**
 * توزيع الطلاب في اللجان:
 * تحديد الصف والشعبة والنقر على «توزيع الطلاب في اللجان» يظهر كشف فيه
 * رقم الجلوس واسم الطالب ورقم اللجنة، ويوضع رقم اللجنة المخصص للطالب أمام اسمه.
 */
export default function CommitteeAssignmentView() {
  const { lang } = useApp();
  const toast = useControlToast();
  const classes = useControlClasses();
  const uid = useId();

  const [committees, setCommittees] = useState([]);
  const [committeesLoaded, setCommitteesLoaded] = useState(false);

  const [classId, setClassId] = useState('');
  const [students, setStudents] = useState(null); // null = لم يُعرض الكشف بعد
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fillFrom, setFillFrom] = useState('');
  const [fillTo, setFillTo] = useState('');
  const [fillCommittee, setFillCommittee] = useState('');

  useEffect(() => {
    let alive = true;
    controlBoardService
      .getCommittees()
      .then((res) => {
        if (alive) setCommittees(res.committees || []);
      })
      .catch((err) => {
        if (alive && !isAbort(err)) toast(errorText(err));
      })
      .finally(() => {
        if (alive) setCommitteesLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [toast]);

  const loadSheet = async () => {
    if (!classId) {
      toast('حدد الصف والشعبة أولاً');
      return;
    }
    setLoading(true);
    try {
      const res = await controlBoardService.getStudents(classId);
      const list = res.students || [];
      setStudents(list);
      const d = {};
      list.forEach((s) => {
        d[s.id] = s.committee_number == null ? '' : String(s.committee_number);
      });
      setDrafts(d);
      setFillFrom(list.length ? '1' : '');
      setFillTo(list.length ? String(list.length) : '');
    } catch (err) {
      if (!isAbort(err)) toast(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  const missingSeat = useMemo(() => (students || []).some((s) => s.seat_number == null || s.seat_number === ''), [students]);

  const dirty = useMemo(
    () =>
      (students || []).some((s) => (drafts[s.id] ?? '') !== (s.committee_number == null ? '' : String(s.committee_number))),
    [students, drafts],
  );

  const applyQuickFill = () => {
    if (!students || students.length === 0) return;
    const from = Number(fillFrom);
    const to = Number(fillTo);
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from || to > students.length) {
      toast(`أدخل نطاقاً صحيحاً من 1 إلى ${students.length}`);
      return;
    }
    if (!fillCommittee) {
      toast('حدد رقم اللجنة');
      return;
    }
    setDrafts((d) => {
      const next = { ...d };
      students.slice(from - 1, to).forEach((s) => {
        next[s.id] = fillCommittee;
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!students || students.length === 0) return;
    setSaving(true);
    try {
      const payload = students.map((s) => ({
        student_id: s.id,
        committee_number: drafts[s.id] ? Number(drafts[s.id]) : null,
      }));
      const res = await controlBoardService.saveAssignments(payload);
      setStudents((list) =>
        list.map((s) => ({ ...s, committee_number: drafts[s.id] ? Number(drafts[s.id]) : null })),
      );
      toast(res.message || 'تم حفظ توزيع الطلاب في اللجان.');
      controlBoardService
        .getCommittees()
        .then((r) => setCommittees(r.committees || []))
        .catch(() => {});
    } catch (err) {
      toast(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const noCommittees = committeesLoaded && committees.length === 0;

  return (
    <div className="cb-view">
      {noCommittees && (
        <div className="cb-note cb-note-warn" role="status">
          لا توجد لجان بعد. أضف عدد اللجان أولاً من نافذة «ترقيم اللجان».
        </div>
      )}

      <div className="cb-box no-print">
        <div className="cb-field">
          <label htmlFor={`${uid}-class`}>الصف والشعبة :</label>
          <select
            id={`${uid}-class`}
            className="text-field"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setStudents(null);
            }}
          >
            <option value="">— اختر —</option>
            {classes.map((cls) => (
              <option key={cls.id} value={classValue(cls)}>
                {classLabel(cls, lang)}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="cb-btn cb-btn-red" onClick={loadSheet} disabled={!classId || loading}>
          {loading ? 'جاري التحميل...' : 'توزيع الطلاب في اللجان'}
        </button>
      </div>

      {students && students.length === 0 && <div className="cb-status">لا يوجد طلاب في هذه الشعبة</div>}

      {students && students.length > 0 && (
        <>
          {missingSeat && (
            <div className="cb-note cb-note-warn" role="status">
              بعض الطلاب ليس لديهم أرقام جلوس. رقّمهم أولاً من نافذة «ارقام الجلوس».
            </div>
          )}

          <fieldset className="cb-box no-print" style={{ margin: 0 }} disabled={committees.length === 0}>
            <legend style={{ fontWeight: 800, padding: '0 6px' }}>تعبئة سريعة</legend>
            <div className="cb-field">
              <label htmlFor={`${uid}-from`}>من الصف رقم</label>
              <input
                id={`${uid}-from`}
                type="number"
                min="1"
                max={students.length}
                inputMode="numeric"
                className="text-field cb-num-input"
                value={fillFrom}
                onChange={(e) => setFillFrom(e.target.value)}
              />
            </div>
            <div className="cb-field">
              <label htmlFor={`${uid}-to`}>إلى الصف رقم</label>
              <input
                id={`${uid}-to`}
                type="number"
                min="1"
                max={students.length}
                inputMode="numeric"
                className="text-field cb-num-input"
                value={fillTo}
                onChange={(e) => setFillTo(e.target.value)}
              />
            </div>
            <div className="cb-field">
              <label htmlFor={`${uid}-fill`}>اللجنة رقم</label>
              <select id={`${uid}-fill`} className="text-field" value={fillCommittee} onChange={(e) => setFillCommittee(e.target.value)}>
                <option value="">— اختر —</option>
                {committees.map((c) => (
                  <option key={c.number} value={c.number}>
                    {c.number}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="cb-btn" onClick={applyQuickFill}>
              تعبئة
            </button>
          </fieldset>

          <div className="cb-table-wrap">
            <table className="cb-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: 120 }}>رقم الجلوس</th>
                  <th scope="col">اسم الطالب</th>
                  <th scope="col" style={{ width: 160 }}>رقم اللجنة</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const value = drafts[s.id] ?? '';
                  const unknown = value !== '' && !committees.some((c) => String(c.number) === value);
                  return (
                    <tr key={s.id}>
                      <td>{s.seat_number ?? '—'}</td>
                      <td className="cb-name">{s.name_ar}</td>
                      <td>
                        <select
                          className="text-field"
                          aria-label={`رقم اللجنة - ${s.name_ar}`}
                          value={value}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDrafts((d) => ({ ...d, [s.id]: v }));
                          }}
                        >
                          <option value="">—</option>
                          {unknown && <option value={value}>{value}</option>}
                          {committees.map((c) => (
                            <option key={c.number} value={c.number}>
                              {c.number}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="cb-box no-print" style={{ justifyContent: 'flex-start' }}>
            <button type="button" className="cb-btn cb-btn-primary" onClick={handleSave} disabled={saving || !dirty}>
              {saving ? 'جاري الحفظ...' : 'حفظ التوزيع'}
            </button>
            {dirty && <span className="cb-note" style={{ border: 'none', padding: 0 }}>توجد تعديلات غير محفوظة</span>}
          </div>
        </>
      )}
    </div>
  );
}
