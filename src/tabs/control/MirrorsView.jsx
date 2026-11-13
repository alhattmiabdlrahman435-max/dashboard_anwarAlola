import { useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { controlBoardService } from '../../services/control/controlBoard.service';
import PrintHeader from '../../components/PrintHeader';
import {
  cell, classNumericId, groupByClass, seatSortValue, useControlClasses, useControlStudents,
} from './controlPrintShared';
import '../../styles/controlBoardPrint.css';

/** مرايا الصفوف: الأعمدة لكل نوع */
const CLASS_MIRRORS = {
  'names-seat': {
    title: 'مرايا الاسماء مع ارقام الجلوس',
    columns: [
      { key: 'name_ar', label: 'اسم الطالب', cls: 'cb-col-name' },
      { key: 'seat_number', label: 'رقم الجلوس', cls: 'cb-col-num' },
    ],
  },
  'names-secret': {
    title: 'مرايا الاسماء مع الارقام السرية',
    columns: [
      { key: 'name_ar', label: 'اسم الطالب', cls: 'cb-col-name' },
      { key: 'secret_number', label: 'الرقم السري', cls: 'cb-col-num' },
    ],
  },
  'names-seat-secret': {
    title: 'مرايا الاسماء مع ارقام الجلوس و الارقام السرية',
    columns: [
      { key: 'name_ar', label: 'اسم الطالب', cls: 'cb-col-name' },
      { key: 'seat_number', label: 'رقم الجلوس', cls: 'cb-col-num' },
      { key: 'secret_number', label: 'الرقم السري', cls: 'cb-col-num' },
    ],
  },
  'seat-secret': {
    title: 'مرايا ارقام الجلوس مع الارقام السرية',
    sortBySeat: true,
    columns: [
      { key: 'seat_number', label: 'رقم الجلوس', cls: 'cb-col-num' },
      { key: 'secret_number', label: 'الرقم السري', cls: 'cb-col-num' },
    ],
  },
};

export default function MirrorsView({ type }) {
  if (CLASS_MIRRORS[type]) return <ClassMirror config={CLASS_MIRRORS[type]} />;
  if (type === 'committees-envelopes') return <CommitteeEnvelopes />;
  if (type === 'committees-subjects') return <CommitteeSubjectEnvelopes />;
  return <div className="cb-status">نوع المرآة غير معروف</div>;
}

/* ===================== مرايا الصفوف ===================== */
function ClassMirror({ config }) {
  const { setToastMessage } = useApp();
  const classes = useControlClasses();
  const [classId, setClassId] = useState('all');
  const { students, loading, error } = useControlStudents(classId);

  useEffect(() => {
    if (error) setToastMessage?.(error, 'error');
  }, [error, setToastMessage]);

  const groups = useMemo(() => {
    const gs = groupByClass(students);
    if (!config.sortBySeat) return gs;
    return gs.map((g) => ({
      ...g,
      students: [...g.students].sort((a, b) => seatSortValue(a.seat_number) - seatSortValue(b.seat_number)),
    }));
  }, [students, config.sortBySeat]);

  return (
    <div className="cb-print-view">
      <div className="cb-controls no-print">
        <label className="cb-field">
          <span>الصف والشعبة</span>
          <select className="text-field" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="all">جميع الشعب</option>
            {classes.map((cls) => (
              <option key={cls.id} value={classNumericId(cls)}>{cls.name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-filled cb-print-btn" onClick={() => window.print()} disabled={loading || groups.length === 0}>
          <Printer size={18} />
          <span>طباعة</span>
        </button>
      </div>

      {loading && <div className="cb-status">جاري التحميل...</div>}
      {!loading && groups.length === 0 && <div className="cb-status">لا يوجد طلاب</div>}

      {!loading && groups.map((g) => (
        <section key={String(g.classId)} className="cb-sheet cb-portrait-page cb-mirror-page">
          <PrintHeader title={config.title} scopeRight={`الصف والشعبة: ${g.label}`} scopeLeft={`عدد الطلاب: ${g.students.length}`} />
          <table className="cb-print-table cb-mirror-table">
            <thead>
              <tr>
                <th className="cb-col-idx">م</th>
                {config.columns.map((c) => <th key={c.key} className={c.cls}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {g.students.map((s, i) => (
                <tr key={s.id}>
                  <td className="cb-col-idx">{i + 1}</td>
                  {config.columns.map((c) => <td key={c.key} className={c.cls}>{cell(s[c.key])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

/* ===================== اللجان ===================== */
function useCommittees() {
  const { setToastMessage } = useApp();
  const [state, setState] = useState({ loading: true, committees: [] });
  useEffect(() => {
    let cancelled = false;
    controlBoardService.getCommittees()
      .then((res) => {
        if (cancelled) return;
        const list = (Array.isArray(res?.committees) ? res.committees : [])
          .map((c) => ({ number: Number(c.number), students_count: Number(c.students_count) || 0 }))
          .filter((c) => !Number.isNaN(c.number))
          .sort((a, b) => a.number - b.number);
        setState({ loading: false, committees: list });
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setState({ loading: false, committees: [] });
        setToastMessage?.(err?.message || 'تعذر تحميل اللجان', 'error');
      });
    return () => { cancelled = true; };
  }, [setToastMessage]);
  return state;
}

function CommitteeSelect({ committees, value, onChange }) {
  return (
    <label className="cb-field">
      <span>اللجنة</span>
      <select className="text-field" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">جميع اللجان</option>
        {committees.map((c) => <option key={c.number} value={c.number}>اللجنة رقم {c.number}</option>)}
      </select>
    </label>
  );
}

function clampCopies(v) {
  const n = Math.floor(Number(v));
  if (Number.isNaN(n) || n < 1) return 1;
  return Math.min(n, 20);
}

/** مرايا اللجان والظروف: صفحة A4 عرضية لكل لجنة "اللجنة رقم ( N )" */
function CommitteeEnvelopes() {
  const { loading, committees } = useCommittees();
  const [selected, setSelected] = useState('all');
  const [copies, setCopies] = useState(1);

  const pages = useMemo(() => {
    const list = selected === 'all' ? committees : committees.filter((c) => String(c.number) === String(selected));
    const out = [];
    list.forEach((c) => {
      for (let i = 0; i < clampCopies(copies); i += 1) out.push({ key: `${c.number}-${i}`, number: c.number });
    });
    return out;
  }, [committees, selected, copies]);

  return (
    <div className="cb-print-view">
      <div className="cb-controls no-print">
        <CommitteeSelect committees={committees} value={selected} onChange={setSelected} />
        <label className="cb-field cb-field-sm">
          <span>عدد النسخ</span>
          <input className="text-field" type="number" min={1} max={20} value={copies} onChange={(e) => setCopies(e.target.value)} />
        </label>
        <button type="button" className="btn-filled cb-print-btn" onClick={() => window.print()} disabled={loading || pages.length === 0}>
          <Printer size={18} />
          <span>طباعة</span>
        </button>
      </div>

      {loading && <div className="cb-status">جاري التحميل...</div>}
      {!loading && committees.length === 0 && <div className="cb-status">لا توجد لجان. ابدأ من «ترقيم اللجان».</div>}

      {!loading && pages.map((p) => (
        <section key={p.key} className="cb-sheet cb-landscape-page cb-envelope-page">
          <div className="cb-envelope-title">اللجنة رقم ( {p.number} )</div>
        </section>
      ))}
    </div>
  );
}

/** مرايا اللجان و المواد للظروف: صفحة A4 عرضية لكل (لجنة × مادة) */
function CommitteeSubjectEnvelopes() {
  const { setToastMessage } = useApp();
  const { loading, committees } = useCommittees();
  const [selected, setSelected] = useState('all');
  const [schedules, setSchedules] = useState({ loading: true, list: [] });
  const [scheduleId, setScheduleId] = useState('');
  const [manualText, setManualText] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get('/api/exam-schedules?per_page=1000')
      .then((res) => {
        if (cancelled) return;
        setSchedules({ loading: false, list: Array.isArray(res?.exam_schedules) ? res.exam_schedules : [] });
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setSchedules({ loading: false, list: [] });
        setToastMessage?.(err?.message || 'تعذر تحميل جداول الاختبارات', 'error');
      });
    return () => { cancelled = true; };
  }, [setToastMessage]);

  const hasSchedules = schedules.list.length > 0;
  const effectiveScheduleId = scheduleId || (hasSchedules ? String(schedules.list[0].id) : 'manual');
  const isManual = effectiveScheduleId === 'manual';

  const subjects = useMemo(() => {
    if (isManual) {
      return manualText.split('\n').map((l) => l.trim()).filter(Boolean)
        .map((name, i) => ({ key: `m${i}`, name, date: '', time: '' }));
    }
    const sch = schedules.list.find((s) => String(s.id) === effectiveScheduleId);
    return (sch?.subjects || []).map((sub) => ({
      key: String(sub.id),
      name: sub.name_ar || sub.name_en || '',
      date: sub.exam_date || '',
      time: sub.exam_time || '',
    }));
  }, [isManual, manualText, schedules.list, effectiveScheduleId]);

  const pages = useMemo(() => {
    const list = selected === 'all' ? committees : committees.filter((c) => String(c.number) === String(selected));
    const out = [];
    list.forEach((c) => subjects.forEach((sub) => out.push({ key: `${c.number}-${sub.key}`, committee: c, subject: sub })));
    return out;
  }, [committees, selected, subjects]);

  const scheduleLabel = (s) => [s.title, [s.grade, s.section].filter(Boolean).join(' - ')].filter(Boolean).join(' — ');

  return (
    <div className="cb-print-view">
      <div className="cb-controls no-print">
        <CommitteeSelect committees={committees} value={selected} onChange={setSelected} />
        <label className="cb-field">
          <span>جدول الاختبارات</span>
          <select className="text-field" value={effectiveScheduleId} onChange={(e) => setScheduleId(e.target.value)} disabled={schedules.loading}>
            {schedules.list.map((s) => <option key={s.id} value={String(s.id)}>{scheduleLabel(s)}</option>)}
            <option value="manual">إدخال المواد يدوياً</option>
          </select>
        </label>
        <button type="button" className="btn-filled cb-print-btn" onClick={() => window.print()} disabled={loading || pages.length === 0}>
          <Printer size={18} />
          <span>طباعة</span>
        </button>
      </div>

      {isManual && (
        <div className="cb-controls no-print">
          <label className="cb-field cb-field-wide">
            <span>المواد (مادة في كل سطر)</span>
            <textarea className="text-field cb-textarea" rows={5} value={manualText} onChange={(e) => setManualText(e.target.value)} />
          </label>
        </div>
      )}

      {(loading || schedules.loading) && <div className="cb-status">جاري التحميل...</div>}
      {!loading && committees.length === 0 && <div className="cb-status">لا توجد لجان. ابدأ من «ترقيم اللجان».</div>}
      {!loading && !schedules.loading && committees.length > 0 && subjects.length === 0 && (
        <div className="cb-status">لا توجد مواد — اختر جدول اختبارات أو أدخل المواد يدوياً.</div>
      )}

      {!loading && pages.map((p) => (
        <section key={p.key} className="cb-sheet cb-landscape-page cb-envelope-page cb-envelope-subject">
          <div className="cb-envelope-title">اللجنة رقم ( {p.committee.number} )</div>
          <div className="cb-envelope-subject-name">المادة: {p.subject.name}</div>
          {(p.subject.date || p.subject.time) && (
            <div className="cb-envelope-meta">
              {p.subject.date && <span>التاريخ: {p.subject.date}</span>}
              {p.subject.time && <span>الفترة: {p.subject.time}</span>}
            </div>
          )}
          <div className="cb-envelope-meta">عدد الطلاب: {p.committee.students_count}</div>
        </section>
      ))}
    </div>
  );
}
