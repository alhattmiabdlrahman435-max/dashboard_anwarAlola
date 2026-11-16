import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { controlBoardService } from '../../services/control/controlBoard.service';
import PrintHeader from '../../components/PrintHeader';
import { openElementPrintPreview } from '../../utils/printPreview';
import { cell, groupByClass, useControlStudents } from './controlPrintShared';
import '../../styles/controlBoardPrint.css';

/**
 * كشوفات المناداة — صفحة لكل لجنة:
 * محاطة بكليشة المدرسة + "اللجنة رقم N" (أحمر كبير) ثم الطلاب مجمّعين حسب الصف والشعبة:
 * رأس المجموعة (الصف والشعبة + عدد الطلاب) ثم: م | رقم الجلوس | اسم الطالب
 */
export default function CallSheetsView() {
  const { setToastMessage } = useApp();
  const { students, loading, error } = useControlStudents('all');
  const [committees, setCommittees] = useState([]);
  const [selected, setSelected] = useState('all');
  const [isZoomed, setIsZoomed] = useState(false);
  const printAreaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    controlBoardService.getCommittees()
      .then((res) => { if (!cancelled) setCommittees(Array.isArray(res?.committees) ? res.committees : []); })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setToastMessage?.(err?.message || 'تعذر تحميل اللجان', 'error');
      });
    return () => { cancelled = true; };
  }, [setToastMessage]);

  useEffect(() => {
    if (error) setToastMessage?.(error, 'error');
  }, [error, setToastMessage]);

  const unassignedCount = useMemo(
    () => students.filter((s) => s.committee_number === null || s.committee_number === undefined || s.committee_number === '').length,
    [students],
  );

  const committeeNumbers = useMemo(() => {
    const set = new Set(committees.map((c) => Number(c.number)));
    students.forEach((s) => {
      if (s.committee_number !== null && s.committee_number !== undefined && s.committee_number !== '') set.add(Number(s.committee_number));
    });
    return [...set].filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
  }, [committees, students]);

  const pages = useMemo(() => {
    const nums = selected === 'all' ? committeeNumbers : [Number(selected)];
    const list = nums.map((num) => ({
      number: num,
      groups: groupByClass(students.filter((s) => Number(s.committee_number) === num && s.committee_number !== null && s.committee_number !== '')),
    }));
    // «جميع اللجان»: لا تُطبع صفحات للجان الفارغة
    return selected === 'all' ? list.filter((p) => p.groups.length > 0) : list;
  }, [selected, committeeNumbers, students]);

  return (
    <div ref={printAreaRef} className={`cb-print-view${isZoomed ? ' cb-zoomed' : ''}`}>
      <div className="cb-controls no-print">
        <label className="cb-field">
          <span>اللجنة</span>
          <select className="text-field" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="all">جميع اللجان</option>
            {committeeNumbers.map((n) => (
              <option key={n} value={n}>اللجنة رقم {n}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn-outlined"
          onClick={() => setIsZoomed((z) => !z)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          <span>{isZoomed ? 'تصغير الكشف' : 'تكبير الكشف'}</span>
        </button>
        <button
          type="button"
          className="btn-filled cb-print-btn"
          onClick={() => openElementPrintPreview(printAreaRef.current, { title: 'معاينة كشوفات المناداة', landscape: false })}
          disabled={loading || pages.length === 0}
        >
          <Eye size={18} />
          <span>معاينة وطباعة</span>
        </button>
      </div>

      {!loading && unassignedCount > 0 && (
        <div className="cb-note no-print">
          يوجد {unassignedCount} طالب/طالبة بدون لجنة ولن يظهروا في كشوفات المناداة — يمكن توزيعهم من نافذة «توزيع الطلاب في اللجان».
        </div>
      )}

      {loading && <div className="cb-status">جاري التحميل...</div>}
      {!loading && pages.length === 0 && <div className="cb-status">لا توجد لجان. ابدأ من «ترقيم اللجان» ثم «توزيع الطلاب في اللجان».</div>}

      {!loading && pages.map((page) => (
        <section
          key={page.number}
          className="cb-sheet cb-portrait-page cb-call-page cb-framed-sheet"
          onDoubleClick={() => setIsZoomed((z) => !z)}
          title="انقر نقراً مزدوجاً للتكبير أو التصغير"
        >
          <PrintHeader title="كشف مناداة اللجان" scopeRight={`اللجنة رقم: ( ${page.number} )`} />
          <h1 className="cb-call-title">اللجنة رقم {page.number}</h1>
          {page.groups.length === 0 ? (
            <div className="cb-status">لا يوجد طلاب في هذه اللجنة</div>
          ) : (
            <div className="cb-call-groups">
              {page.groups.map((g) => (
                <div key={String(g.classId)} className="cb-call-group">
                  <div className="cb-call-group-head">
                    <span className="cb-call-class">{g.label}</span>
                    <span className="cb-call-count">عدد الطلاب ( {g.students.length} )</span>
                  </div>
                  <table className="cb-print-table">
                    <thead>
                      <tr>
                        <th className="cb-col-idx">م</th>
                        <th className="cb-col-num">رقم الجلوس</th>
                        <th>اسم الطالب</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.students.map((s, i) => (
                        <tr key={s.id}>
                          <td className="cb-col-idx">{i + 1}</td>
                          <td className="cb-col-num">{cell(s.seat_number)}</td>
                          <td className="cb-col-name">{cell(s.name_ar)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
