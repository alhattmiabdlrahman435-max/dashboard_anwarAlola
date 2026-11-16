import { useCallback, useEffect, useId, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { controlBoardService } from '../../services/control/controlBoard.service';
import { classLabel, classValue, errorText, isAbort, useControlClasses, useControlToast } from './controlShared';

/**
 * نافذة (ارقام الجلوس) / (الارقام السرية):
 * تحديد الصف والشعبة ← وضع رقم لأول طالب أو عند «بدء الترقيم من: ( )» ← زر «بدء الترقيم»
 * فيُرقَّم جميع طلاب الشعبة آلياً وبالتسلسل، مع بقاء إمكانية تعديل رقم أي طالب.
 */
export default function NumberingView({ field = 'seat' }) {
  const { lang, triggerConfirm } = useApp();
  const toast = useControlToast();
  const classes = useControlClasses();
  const uid = useId();

  const column = field === 'secret' ? 'secret_number' : 'seat_number';
  const numberHeader = field === 'secret' ? 'الارقام السرية' : 'ترقيم جلوس';

  const [classId, setClassId] = useState('');
  const [start, setStart] = useState('');
  const [students, setStudents] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [numbering, setNumbering] = useState(false);

  const applyStudents = useCallback(
    (list) => {
      setStudents(list);
      const d = {};
      list.forEach((s) => {
        d[s.id] = s[column] == null ? '' : String(s[column]);
      });
      setDrafts(d);
      setErrors({});
    },
    [column],
  );

  useEffect(() => {
    if (!classId) {
      applyStudents([]);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    controlBoardService
      .getStudents(classId)
      .then((res) => {
        if (alive) applyStudents(res.students || []);
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
  }, [classId, applyStudents, toast]);

  const saveOne = async (student) => {
    const raw = (drafts[student.id] ?? '').trim();
    const current = student[column] == null ? '' : String(student[column]);
    if (raw === current) return;
    if (raw !== '' && !/^\d+$/.test(raw)) {
      setErrors((e) => ({ ...e, [student.id]: 'أدخل رقماً صحيحاً' }));
      return;
    }
    try {
      const res = await controlBoardService.updateStudent(student.id, { [column]: raw === '' ? null : Number(raw) });
      const updated = res.student || { ...student, [column]: raw === '' ? null : Number(raw) };
      setStudents((list) => list.map((s) => (s.id === student.id ? { ...s, ...updated } : s)));
      setErrors((e) => {
        const next = { ...e };
        delete next[student.id];
        return next;
      });
    } catch (err) {
      setErrors((e) => ({ ...e, [student.id]: errorText(err) }));
    }
  };

  const runNumbering = async (startNumber) => {
    setNumbering(true);
    try {
      const res = await controlBoardService.autoNumber(classId, field, startNumber);
      if (res.students) applyStudents(res.students);
      toast(res.message || 'تم الترقيم بنجاح');
    } catch (err) {
      toast(errorText(err));
    } finally {
      setNumbering(false);
    }
  };

  const handleStart = () => {
    if (!classId) {
      toast('حدد الصف والشعبة أولاً');
      return;
    }
    if (students.length === 0) {
      toast('لا يوجد طلاب في هذه الشعبة');
      return;
    }
    // «بدء الترقيم من» أو الرقم الموضوع لأول طالب
    let value = String(start).trim();
    if (value === '') value = (drafts[students[0].id] ?? '').trim();
    if (!/^\d+$/.test(value) || Number(value) < 1) {
      toast('ضع رقماً عند «بدء الترقيم من» أو لأول طالب في الشعبة');
      return;
    }
    const startNumber = Number(value);

    const hasExisting = students.some(
      (s, i) => s[column] != null && !(i === 0 && Number(s[column]) === startNumber),
    );
    if (hasExisting) {
      const message = `يوجد طلاب في هذه الشعبة لديهم ${field === 'secret' ? 'ارقام سرية' : 'ارقام جلوس'}. سيتم استبدالها بترقيم جديد يبدأ من ${startNumber}. هل تريد المتابعة؟`;
      if (triggerConfirm) {
        triggerConfirm({ title: 'بدء الترقيم', message, type: 'danger', onConfirm: () => runNumbering(startNumber) });
      } else if (window.confirm(message)) {
        runNumbering(startNumber);
      }
      return;
    }
    runNumbering(startNumber);
  };

  return (
    <div className="cb-view">
      <div className="cb-box no-print">
        <div className="cb-field">
          <label htmlFor={`${uid}-class`}>الصف والشعبة :</label>
          <select
            id={`${uid}-class`}
            className="text-field"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setStart('');
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

        <div className="cb-field cb-red">
          <label htmlFor={`${uid}-start`}>بدء الترقيم من : (</label>
          <input
            id={`${uid}-start`}
            type="number"
            min="1"
            inputMode="numeric"
            className="text-field cb-num-input"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStart();
            }}
          />
          <span aria-hidden="true">)</span>
        </div>

        <button type="button" className="cb-btn cb-btn-red" onClick={handleStart} disabled={!classId || numbering || loading}>
          {numbering ? 'جاري الترقيم...' : 'بدء الترقيم'}
        </button>
      </div>

      {field === 'secret' && <div className="cb-note">الرقم السري هو نفسه المستخدم في رصد الدرجات بالرقم السري</div>}

      {!classId ? (
        <div className="cb-status">حدد الصف والشعبة</div>
      ) : loading ? (
        <div className="cb-status">جاري التحميل...</div>
      ) : students.length === 0 ? (
        <div className="cb-status">لا يوجد طلاب في هذه الشعبة</div>
      ) : (
        <div className="cb-table-wrap">
          <table className="cb-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: 56 }}>م</th>
                <th scope="col" className="sticky-col-name">اسم الطالب</th>
                <th scope="col" style={{ width: 170 }}>{numberHeader}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td className="cb-name sticky-col-name">{s.name_ar}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      className={`text-field${errors[s.id] ? ' cb-input-error' : ''}`}
                      aria-label={`${numberHeader} - ${s.name_ar}`}
                      aria-invalid={errors[s.id] ? 'true' : undefined}
                      value={drafts[s.id] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDrafts((d) => ({ ...d, [s.id]: v }));
                      }}
                      onBlur={() => saveOne(s)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                      }}
                    />
                    {errors[s.id] && (
                      <span className="cb-cell-error" role="alert">
                        {errors[s.id]}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
