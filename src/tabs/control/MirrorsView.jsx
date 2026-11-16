import { useEffect, useMemo, useRef, useState } from 'react';
import { Printer, ChevronRight, ChevronLeft, CheckSquare, Square, ZoomIn, ZoomOut, Layers, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { controlBoardService } from '../../services/control/controlBoard.service';
import PrintHeader from '../../components/PrintHeader';
import { openElementPrintPreview } from '../../utils/printPreview';
import {
  cell, classNumericId, groupByClass, seatSortValue, useControlClasses, useControlStudents,
} from './controlPrintShared';
import '../../styles/controlBoardPrint.css';

/** مرايا الصفوف: الأعمدة لكل نوع بحسب ملحق 2 (صفحة 5 و 6) */
const CLASS_MIRRORS = {
  'names-seat': {
    title: 'مرايا الاسماء مع ارقام الجلوس',
    columns: [
      { key: 'seat_number', label: 'رقم الجلوس', cls: 'cb-col-num' },
      { key: 'name_ar', label: 'اسم الطالب', cls: 'cb-col-name' },
    ],
  },
  'seat-grades': {
    title: 'مرايا ارقام الجلوس والدرجات',
    sortBySeat: true,
    hasSubjectHeader: true,
    columns: [
      { key: 'seat_number', label: 'رقم الجلوس', cls: 'cb-col-num' },
      { key: '_grade_num', label: 'الدرجة رقما', cls: 'cb-col-grade-blank', blank: true },
      { key: '_grade_words', label: 'الدرجة كتابة', cls: 'cb-col-grade-words', blank: true },
    ],
  },
  'names-secret': {
    title: 'مرايا الاسماء مع الارقام السرية',
    columns: [
      { key: 'secret_number', label: 'الرقم السري', cls: 'cb-col-num' },
      { key: 'name_ar', label: 'اسم الطالب', cls: 'cb-col-name' },
    ],
  },
  'secret-grades': {
    title: 'مرايا الارقام السرية والدرجات',
    hasSubjectHeader: true,
    columns: [
      { key: 'secret_number', label: 'الرقم السري', cls: 'cb-col-num' },
      { key: '_grade_num', label: 'الدرجة رقما', cls: 'cb-col-grade-blank', blank: true },
      { key: '_grade_words', label: 'الدرجة كتابة', cls: 'cb-col-grade-words', blank: true },
    ],
  },
  'names-seat-secret': {
    title: 'مرايا ارقام الجلوس والاسماء و الارقام السرية',
    columns: [
      { key: 'seat_number', label: 'ارقام الجلوس', cls: 'cb-col-num' },
      { key: 'name_ar', label: 'اسم الطالب', cls: 'cb-col-name' },
      { key: 'secret_number', label: 'الارقام السرية', cls: 'cb-col-num' },
    ],
  },
  'seat-secret': {
    title: 'مرايا ارقام الجلوس و الارقام السرية',
    sortBySeat: true,
    columns: [
      { key: 'seat_number', label: 'ارقام الجلوس', cls: 'cb-col-num' },
      { key: 'secret_number', label: 'الارقام السرية', cls: 'cb-col-num' },
    ],
  },
};

export default function MirrorsView({ type }) {
  if (CLASS_MIRRORS[type]) return <ClassMirror config={CLASS_MIRRORS[type]} />;
  if (type === 'committees-envelopes' || type === 'committees-small') return <CommitteeSmallEnvelopes />;
  if (type === 'committees-subjects' || type === 'committees-large') return <CommitteeLargeEnvelopes />;
  return <div className="cb-status">نوع المرآة غير معروف</div>;
}

/* ===================== مرايا الصفوف ===================== */
function ClassMirror({ config }) {
  const { setToastMessage } = useApp();
  const classes = useControlClasses();
  const [classId, setClassId] = useState('all');
  const [subjectName, setSubjectName] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const printAreaRef = useRef(null);
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
    <div ref={printAreaRef} className={`cb-print-view${isZoomed ? ' cb-zoomed' : ''}`}>
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

        {config.hasSubjectHeader && (
          <label className="cb-field">
            <span>اسم المادة (اختياري)</span>
            <input
              type="text"
              className="text-field"
              placeholder="مثال: القرآن الكريم (أو اتركه فارغاً)"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </label>
        )}

        <button
          type="button"
          className="btn-outlined"
          onClick={() => setIsZoomed((z) => !z)}
          title="يمكنك أيضاً النقر المزدوج على الكشف للتكبير والتصغير"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          <span>{isZoomed ? 'تصغير الكشف' : 'تكبير الكشف'}</span>
        </button>

        <button
          type="button"
          className="btn-filled cb-print-btn"
          onClick={() => openElementPrintPreview(printAreaRef.current, { title: config.title, landscape: false })}
          disabled={loading || groups.length === 0}
        >
          <Eye size={18} />
          <span>معاينة وطباعة</span>
        </button>
      </div>

      {loading && <div className="cb-status">جاري التحميل...</div>}
      {!loading && groups.length === 0 && <div className="cb-status">لا يوجد طلاب</div>}

      {!loading &&
        groups.map((g) => (
          <section
            key={String(g.classId)}
            className="cb-sheet cb-portrait-page cb-mirror-page cb-framed-sheet"
            onDoubleClick={() => setIsZoomed((z) => !z)}
            title="انقر نقراً مزدوجاً للتكبير أو التصغير"
          >
            <PrintHeader
              title={config.title}
              scopeRight={`الصف والشعبة: ${g.label}`}
              scopeLeft={
                config.hasSubjectHeader
                  ? `اسم المادة : ( ${subjectName.trim() || '                        '} )`
                  : `عدد الطلاب: ${g.students.length}`
              }
            />
            <table className="cb-print-table cb-mirror-table">
              <thead>
                <tr>
                  <th className="cb-col-idx">م</th>
                  {config.columns.map((c) => (
                    <th key={c.key} className={c.cls}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.students.map((s, i) => (
                  <tr key={s.id}>
                    <td className="cb-col-idx">{i + 1}</td>
                    {config.columns.map((c) => (
                      <td key={c.key} className={c.cls}>
                        {c.blank ? '' : cell(s[c.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
    </div>
  );
}

/* ===================== اللجان المساعدة ===================== */
function useCommittees() {
  const { setToastMessage } = useApp();
  const [state, setState] = useState({ loading: true, committees: [] });
  useEffect(() => {
    let cancelled = false;
    controlBoardService
      .getCommittees()
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
    return () => {
      cancelled = true;
    };
  }, [setToastMessage]);
  return state;
}

function CommitteeSelect({ committees, value, onChange }) {
  return (
    <label className="cb-field">
      <span>اللجنة</span>
      <select className="text-field" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">جميع اللجان</option>
        {committees.map((c) => (
          <option key={c.number} value={c.number}>
            اللجنة رقم {c.number}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ===================== 5. مرايا اللجان للظروف الصغيرة ===================== */
function CommitteeSmallEnvelopes() {
  const { setToastMessage } = useApp();
  const { loading: commLoading, committees } = useCommittees();
  const { students, loading: stuLoading } = useControlStudents('all');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [schedules, setSchedules] = useState({ loading: true, list: [] });
  const [scheduleId, setScheduleId] = useState('manual');
  const [manualSubjectsText, setManualSubjectsText] = useState('القرآن الكريم');
  const [examDateText, setExamDateText] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} م`;
  });
  const [viewSingleMode, setViewSingleMode] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());
  const [printOnlySelected, setPrintOnlySelected] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const printAreaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/exam-schedules?per_page=1000')
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.exam_schedules) ? res.exam_schedules : [];
        setSchedules({ loading: false, list });
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setSchedules({ loading: false, list: [] });
        setToastMessage?.(err?.message || 'تعذر تحميل جداول الاختبارات', 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [setToastMessage]);

  // استخراج المواد مع التاريخ
  const subjectsList = useMemo(() => {
    if (scheduleId === 'manual' || schedules.list.length === 0) {
      const lines = manualSubjectsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) {
        return [{ key: 'sub-0', name: '', date: examDateText }];
      }
      return lines.map((line, idx) => {
        const parts = line.split('|').map((p) => p.trim());
        return {
          key: `sub-${idx}`,
          name: parts[0] || '',
          date: parts[1] || examDateText,
        };
      });
    }
    const sch = schedules.list.find((s) => String(s.id) === String(scheduleId));
    const subs = (sch?.subjects || []).map((sub, idx) => ({
      key: String(sub.id || idx),
      name: sub.name_ar || sub.name_en || '',
      date: sub.exam_date || examDateText,
    }));
    return subs.length > 0 ? subs : [{ key: 'sub-0', name: '', date: examDateText }];
  }, [scheduleId, schedules.list, manualSubjectsText, examDateText]);

  // تجميع الطلاب حسب (رقم اللجنة × الصف والشعبة)
  const committeeClassGroups = useMemo(() => {
    const byComm = new Map();
    students.forEach((s) => {
      const cNum = Number(s.committee_number);
      if (!cNum || Number.isNaN(cNum)) return;
      if (!byComm.has(cNum)) byComm.set(cNum, new Map());
      const clsMap = byComm.get(cNum);
      const clsKey = String(s.class_id ?? s.class_name ?? 'unknown');
      const clsLabel = s.class_name || [s.grade_ar, s.section_ar].filter(Boolean).join(' ') || 'غير محدد';
      if (!clsMap.has(clsKey)) {
        clsMap.set(clsKey, { classId: clsKey, className: clsLabel, count: 0 });
      }
      clsMap.get(clsKey).count += 1;
    });
    return byComm;
  }, [students]);

  // قائمة الشعب المتاحة للفلترة
  const availableClassesInCommittees = useMemo(() => {
    const map = new Map();
    committeeClassGroups.forEach((clsMap) => {
      clsMap.forEach((info) => {
        if (!map.has(info.classId)) map.set(info.classId, info.className);
      });
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [committeeClassGroups]);

  // توليد جميع مرايا الظروف الصغيرة: لكل (لجنة × صف وشعبة داخل اللجنة × مادة)
  const allMirrors = useMemo(() => {
    const commList =
      selectedCommittee === 'all'
        ? committees
        : committees.filter((c) => String(c.number) === String(selectedCommittee));

    const out = [];
    commList.forEach((c) => {
      const clsMap = committeeClassGroups.get(c.number);
      const classEntries = clsMap && clsMap.size > 0
        ? Array.from(clsMap.values())
        : [{ classId: 'all', className: 'جميع شعب اللجنة', count: c.students_count || 0 }];

      classEntries
        .filter((clsInfo) => selectedClass === 'all' || String(clsInfo.classId) === String(selectedClass))
        .forEach((clsInfo) => {
          subjectsList.forEach((sub) => {
            out.push({
              key: `small-${c.number}-${clsInfo.classId}-${sub.key}`,
              committeeNumber: c.number,
              className: clsInfo.className,
              studentsCount: clsInfo.count,
              subjectName: sub.name,
              examDate: sub.date,
            });
          });
        });
    });
    return out;
  }, [committees, selectedCommittee, selectedClass, committeeClassGroups, subjectsList]);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCommittee, selectedClass, scheduleId, manualSubjectsText]);

  const safeIndex = allMirrors.length > 0 ? Math.min(activeIndex, allMirrors.length - 1) : 0;

  const toggleSelectKey = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllMirrors = () => {
    setSelectedKeys(new Set(allMirrors.map((m) => m.key)));
  };

  const clearSelection = () => {
    setSelectedKeys(new Set());
  };

  const handlePrint = (onlySelectedMode) => {
    setPrintOnlySelected(onlySelectedMode);
    setTimeout(() => {
      openElementPrintPreview(printAreaRef.current, {
        title: 'معاينة مرايا اللجان',
        landscape: true,
      });
    }, 80);
  };

  const loading = commLoading || stuLoading;
  const currentMirror = allMirrors[safeIndex];

  return (
    <div ref={printAreaRef} className={`cb-print-view${isZoomed ? ' cb-zoomed' : ''}`}>
      <div className="cb-controls no-print">
        <CommitteeSelect committees={committees} value={selectedCommittee} onChange={setSelectedCommittee} />

        <label className="cb-field">
          <span>الصف والشعبة</span>
          <select className="text-field" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="all">جميع الصفوف والشعب في اللجنة</option>
            {availableClassesInCommittees.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="cb-field">
          <span>مصدر المواد</span>
          <select className="text-field" value={scheduleId} onChange={(e) => setScheduleId(e.target.value)}>
            <option value="manual">إدخال المواد يدوياً</option>
            {schedules.list.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.title} {[s.grade, s.section].filter(Boolean).join(' - ')}
              </option>
            ))}
          </select>
        </label>

        <label className="cb-field">
          <span>التاريخ</span>
          <input
            type="text"
            className="text-field"
            value={examDateText}
            onChange={(e) => setExamDateText(e.target.value)}
            placeholder="2026/9/10 م"
          />
        </label>

        <button
          type="button"
          className="btn-outlined"
          onClick={() => setIsZoomed((z) => !z)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          <span>{isZoomed ? 'تصغير' : 'تكبير'}</span>
        </button>

        <button
          type="button"
          className="btn-filled cb-print-btn"
          onClick={() => handlePrint(false)}
          disabled={loading || allMirrors.length === 0}
        >
          <Eye size={18} />
          <span>معاينة وطباعة الكل ({allMirrors.length})</span>
        </button>

        {selectedKeys.size > 0 && (
          <button
            type="button"
            className="btn-filled"
            style={{ background: '#059669', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => handlePrint(true)}
          >
            <Printer size={18} />
            <span>طباعة المحدد ({selectedKeys.size})</span>
          </button>
        )}
      </div>

      {scheduleId === 'manual' && (
        <div className="cb-controls no-print" style={{ marginTop: '-6px' }}>
          <label className="cb-field cb-field-wide">
            <span>المواد (اكتب مادة في كل سطر — لتوليد مرآة لكل صف ولكل مادة داخل اللجنة)</span>
            <textarea
              className="text-field cb-textarea"
              rows={3}
              value={manualSubjectsText}
              onChange={(e) => setManualSubjectsText(e.target.value)}
              placeholder={'القرآن الكريم\nالتربية الإسلامية\nاللغة العربية\nالرياضيات'}
            />
          </label>
        </div>
      )}

      {/* شريط التنقل بين المرايا (السابق / التالي) وتحديد المرايا */}
      {!loading && allMirrors.length > 0 && (
        <div className="cb-mirror-nav-bar no-print">
          <div className="cb-mirror-nav-controls">
            <button
              type="button"
              className="btn-outlined cb-nav-btn"
              disabled={safeIndex <= 0}
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronRight size={18} />
              <span>السابق</span>
            </button>

            <span className="cb-mirror-counter">
              المرآة <strong>{safeIndex + 1}</strong> من <strong>{allMirrors.length}</strong>
              {currentMirror
                ? ` — اللجنة (${currentMirror.committeeNumber}) / ${currentMirror.className} / ${currentMirror.subjectName || 'بدون مادة'}`
                : ''}
            </span>

            <button
              type="button"
              className="btn-filled cb-nav-btn"
              disabled={safeIndex >= allMirrors.length - 1}
              onClick={() => setActiveIndex((i) => Math.min(allMirrors.length - 1, i + 1))}
            >
              <span>التالي</span>
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className="cb-mirror-selection-controls">
            {currentMirror && (
              <button
                type="button"
                className="btn-outlined"
                onClick={() => toggleSelectKey(currentMirror.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: selectedKeys.has(currentMirror.key) ? '#059669' : undefined,
                  color: selectedKeys.has(currentMirror.key) ? '#059669' : undefined,
                }}
              >
                {selectedKeys.has(currentMirror.key) ? <CheckSquare size={16} /> : <Square size={16} />}
                <span>{selectedKeys.has(currentMirror.key) ? 'تم تحديد هذه المرآة' : 'تحديد هذه المرآة للطباعة'}</span>
              </button>
            )}

            <button type="button" className="btn-outlined" onClick={selectAllMirrors}>
              تحديد الكل ({allMirrors.length})
            </button>
            {selectedKeys.size > 0 && (
              <button type="button" className="btn-outlined" onClick={clearSelection}>
                إلغاء التحديد ({selectedKeys.size})
              </button>
            )}

            <button
              type="button"
              className="btn-outlined"
              onClick={() => setViewSingleMode((v) => !v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Layers size={16} />
              <span>{viewSingleMode ? 'عرض جميع المرايا تحت بعض' : 'عرض مرآة واحدة مع زر (التالي)'}</span>
            </button>
          </div>
        </div>
      )}

      {loading && <div className="cb-status">جاري التحميل...</div>}
      {!loading && committees.length === 0 && (
        <div className="cb-status">لا توجد لجان. ابدأ من «ترقيم اللجان» و«توزيع الطلاب في اللجان».</div>
      )}

      {!loading &&
        allMirrors.map((m, idx) => {
          const isCurrent = idx === safeIndex;
          const isSelected = selectedKeys.has(m.key);
          const hideOnScreen = viewSingleMode && !isCurrent;
          const hideInPrint = printOnlySelected && selectedKeys.size > 0 && !isSelected;

          return (
            <section
              key={m.key}
              className={`cb-sheet cb-landscape-page cb-envelope-page cb-framed-sheet${hideOnScreen ? ' cb-screen-hidden' : ''}${hideInPrint ? ' no-print' : ''}`}
              onDoubleClick={() => setIsZoomed((z) => !z)}
              title="انقر نقراً مزدوجاً للتكبير أو التصغير"
            >
              <div className="no-print cb-sheet-select-bar">
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectKey(m.key)}
                    style={{ width: '17px', height: '17px' }}
                  />
                  <span>
                    تحديد للطباعة — مرآة رقم ({idx + 1}): اللجنة {m.committeeNumber} — {m.className} — {m.subjectName}
                  </span>
                </label>
              </div>

              <PrintHeader title="مرايا اللجان للظروف الصغيرة" />

              <table className="cb-small-envelope-table">
                <tbody>
                  <tr>
                    <th>رقم اللجنة :</th>
                    <td className="cb-env-big-num">{m.committeeNumber}</td>
                  </tr>
                  <tr>
                    <th>الصف والشعبة :</th>
                    <td>{m.className}</td>
                  </tr>
                  <tr>
                    <th>عدد الطلاب :</th>
                    <td>{m.studentsCount}</td>
                  </tr>
                  <tr>
                    <th>المادة :</th>
                    <td>{m.subjectName || '........................'}</td>
                  </tr>
                  <tr>
                    <th>التاريخ :</th>
                    <td>{m.examDate || '........................'}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          );
        })}
    </div>
  );
}

/* ===================== 6. مرايا اللجان للظروف الكبيرة ===================== */
function CommitteeLargeEnvelopes() {
  const { loading: commLoading, committees } = useCommittees();
  const { students, loading: stuLoading } = useControlStudents('all');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [subjectsLine, setSubjectsLine] = useState('قرآن - عربي - رياضيات - اجتماعيات');
  const [examDay, setExamDay] = useState('الاثنين');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}م`;
  });
  const [customClassesOverride, setCustomClassesOverride] = useState({});
  const [viewSingleMode, setViewSingleMode] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());
  const [printOnlySelected, setPrintOnlySelected] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const printAreaRef = useRef(null);

  // استخراج الصفوف والشعب الموجودة فعلياً في كل لجنة
  const classesPerCommittee = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      const cNum = Number(s.committee_number);
      if (!cNum || Number.isNaN(cNum)) return;
      if (!map.has(cNum)) map.set(cNum, new Set());
      const clsLabel = s.class_name || [s.grade_ar, s.section_ar].filter(Boolean).join(' ');
      if (clsLabel) map.get(cNum).add(clsLabel);
    });
    const result = new Map();
    map.forEach((set, cNum) => {
      result.set(cNum, Array.from(set).join(' - '));
    });
    return result;
  }, [students]);

  const allMirrors = useMemo(() => {
    const list =
      selectedCommittee === 'all'
        ? committees
        : committees.filter((c) => String(c.number) === String(selectedCommittee));

    return list.map((c) => {
      const autoClasses = classesPerCommittee.get(c.number) || 'جميع الصفوف الموزعة في اللجنة';
      const classesText =
        customClassesOverride[c.number] !== undefined ? customClassesOverride[c.number] : autoClasses;
      return {
        key: `large-${c.number}`,
        committeeNumber: c.number,
        classesText,
        subjectsText: subjectsLine,
        dayText: examDay,
        dateText: examDate,
      };
    });
  }, [committees, selectedCommittee, classesPerCommittee, customClassesOverride, subjectsLine, examDay, examDate]);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCommittee]);

  const safeIndex = allMirrors.length > 0 ? Math.min(activeIndex, allMirrors.length - 1) : 0;
  const currentMirror = allMirrors[safeIndex];

  const toggleSelectKey = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllMirrors = () => setSelectedKeys(new Set(allMirrors.map((m) => m.key)));
  const clearSelection = () => setSelectedKeys(new Set());

  const handlePrint = (onlySelectedMode) => {
    setPrintOnlySelected(onlySelectedMode);
    setTimeout(() => {
      openElementPrintPreview(printAreaRef.current, {
        title: 'معاينة مرايا اللجان',
        landscape: true,
      });
    }, 80);
  };

  const loading = commLoading || stuLoading;

  return (
    <div ref={printAreaRef} className={`cb-print-view${isZoomed ? ' cb-zoomed' : ''}`}>
      <div className="cb-controls no-print">
        <CommitteeSelect committees={committees} value={selectedCommittee} onChange={setSelectedCommittee} />

        <label className="cb-field cb-field-wide" style={{ minWidth: '260px' }}>
          <span>المواد في الظرف الكبير</span>
          <input
            type="text"
            className="text-field"
            value={subjectsLine}
            onChange={(e) => setSubjectsLine(e.target.value)}
            placeholder="قرآن - عربي - رياضيات - اجتماعيات"
          />
        </label>

        <label className="cb-field cb-field-sm">
          <span>اليوم</span>
          <input
            type="text"
            className="text-field"
            value={examDay}
            onChange={(e) => setExamDay(e.target.value)}
            placeholder="الاثنين"
          />
        </label>

        <label className="cb-field">
          <span>التاريخ</span>
          <input
            type="text"
            className="text-field"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            placeholder="2026/9/10م"
          />
        </label>

        <button
          type="button"
          className="btn-outlined"
          onClick={() => setIsZoomed((z) => !z)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          <span>{isZoomed ? 'تصغير' : 'تكبير'}</span>
        </button>

        <button
          type="button"
          className="btn-filled cb-print-btn"
          onClick={() => handlePrint(false)}
          disabled={loading || allMirrors.length === 0}
        >
          <Eye size={18} />
          <span>معاينة وطباعة الكل ({allMirrors.length})</span>
        </button>

        {selectedKeys.size > 0 && (
          <button
            type="button"
            className="btn-filled"
            style={{ background: '#059669', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => handlePrint(true)}
          >
            <Printer size={18} />
            <span>طباعة المحدد ({selectedKeys.size})</span>
          </button>
        )}
      </div>

      {/* تعديل نص الصفوف للجنة الحالية عند الحاجة */}
      {!loading && currentMirror && (
        <div className="cb-controls no-print" style={{ marginTop: '-6px' }}>
          <label className="cb-field cb-field-wide">
            <span>الصفوف في اللجنة رقم ({currentMirror.committeeNumber}) — تُجلب تلقائياً من توزيع اللجان ويمكنك تعديلها:</span>
            <input
              type="text"
              className="text-field"
              value={currentMirror.classesText}
              onChange={(e) =>
                setCustomClassesOverride((prev) => ({
                  ...prev,
                  [currentMirror.committeeNumber]: e.target.value,
                }))
              }
            />
          </label>
        </div>
      )}

      {/* شريط التنقل بين المرايا (السابق / التالي) وتحديد المرايا */}
      {!loading && allMirrors.length > 0 && (
        <div className="cb-mirror-nav-bar no-print">
          <div className="cb-mirror-nav-controls">
            <button
              type="button"
              className="btn-outlined cb-nav-btn"
              disabled={safeIndex <= 0}
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronRight size={18} />
              <span>السابق</span>
            </button>

            <span className="cb-mirror-counter">
              المرآة <strong>{safeIndex + 1}</strong> من <strong>{allMirrors.length}</strong>
              {currentMirror ? ` — اللجنة رقم ( ${currentMirror.committeeNumber} )` : ''}
            </span>

            <button
              type="button"
              className="btn-filled cb-nav-btn"
              disabled={safeIndex >= allMirrors.length - 1}
              onClick={() => setActiveIndex((i) => Math.min(allMirrors.length - 1, i + 1))}
            >
              <span>التالي</span>
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className="cb-mirror-selection-controls">
            {currentMirror && (
              <button
                type="button"
                className="btn-outlined"
                onClick={() => toggleSelectKey(currentMirror.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: selectedKeys.has(currentMirror.key) ? '#059669' : undefined,
                  color: selectedKeys.has(currentMirror.key) ? '#059669' : undefined,
                }}
              >
                {selectedKeys.has(currentMirror.key) ? <CheckSquare size={16} /> : <Square size={16} />}
                <span>{selectedKeys.has(currentMirror.key) ? 'تم تحديد هذه المرآة' : 'تحديد هذه المرآة للطباعة'}</span>
              </button>
            )}

            <button type="button" className="btn-outlined" onClick={selectAllMirrors}>
              تحديد الكل ({allMirrors.length})
            </button>
            {selectedKeys.size > 0 && (
              <button type="button" className="btn-outlined" onClick={clearSelection}>
                إلغاء التحديد ({selectedKeys.size})
              </button>
            )}

            <button
              type="button"
              className="btn-outlined"
              onClick={() => setViewSingleMode((v) => !v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Layers size={16} />
              <span>{viewSingleMode ? 'عرض جميع المرايا تحت بعض' : 'عرض مرآة واحدة مع زر (التالي)'}</span>
            </button>
          </div>
        </div>
      )}

      {loading && <div className="cb-status">جاري التحميل...</div>}
      {!loading && committees.length === 0 && (
        <div className="cb-status">لا توجد لجان. ابدأ من «ترقيم اللجان».</div>
      )}

      {!loading &&
        allMirrors.map((m, idx) => {
          const isCurrent = idx === safeIndex;
          const isSelected = selectedKeys.has(m.key);
          const hideOnScreen = viewSingleMode && !isCurrent;
          const hideInPrint = printOnlySelected && selectedKeys.size > 0 && !isSelected;

          return (
            <section
              key={m.key}
              className={`cb-sheet cb-landscape-page cb-envelope-page cb-framed-sheet${hideOnScreen ? ' cb-screen-hidden' : ''}${hideInPrint ? ' no-print' : ''}`}
              onDoubleClick={() => setIsZoomed((z) => !z)}
              title="انقر نقراً مزدوجاً للتكبير أو التصغير"
            >
              <div className="no-print cb-sheet-select-bar">
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectKey(m.key)}
                    style={{ width: '17px', height: '17px' }}
                  />
                  <span>تحديد للطباعة — اللجنة رقم ({m.committeeNumber})</span>
                </label>
              </div>

              <PrintHeader title="مرايا اللجان للظروف الكبيرة" />

              <div className="cb-large-envelope-boxes">
                <div className="cb-large-env-row">
                  <strong>الصف :</strong> ( {m.classesText} )
                </div>
                <div className="cb-large-env-row">
                  <strong>المواد :</strong> ( {m.subjectsText} )
                </div>
                <div className="cb-large-env-row cb-large-env-committee">
                  اللجنة رقم : ( {m.committeeNumber} )
                </div>
                <div className="cb-large-env-row cb-large-env-footer">
                  <span>
                    <strong>اليوم :</strong> {m.dayText}
                  </span>
                  <span>
                    <strong>التاريخ :</strong> {m.dateText}
                  </span>
                </div>
              </div>
            </section>
          );
        })}
    </div>
  );
}
