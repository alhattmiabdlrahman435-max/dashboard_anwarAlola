import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { archiveService } from '../../services/archive/archive.service';
import { openElementPrintPreview } from '../../utils/printPreview';
import sloganLogo from '../../assets/slogan.jpeg';
import '../../styles/archive.css';

const SCHOOL_NAME = 'مدارس انوار العلى الدولية النموذجية';

/**
 * الاحصائية — تُحسب لحظياً من سجلات الطلاب (أي إضافة أو حذف طالب يغيّر الأرقام تلقائياً).
 * model1: فرع البنين | فرع البنات
 * model2: تمهيدي – سادس | سابع – ثالث ثانوي
 * boys / girls: جدول فرع واحد
 */
export default function StatisticsView({ model, title }) {
  const { setToastMessage } = useApp();
  const [, setParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, rows: [] });
  const printAreaRef = useRef(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    archiveService.getStatistics()
      .then((res) => { if (!cancelled) setState({ loading: false, rows: Array.isArray(res?.rows) ? res.rows : [] }); })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setState({ loading: false, rows: [] });
        setToastMessage?.(err?.message || 'تعذر تحميل الاحصائية', 'error');
      });
    return () => { cancelled = true; };
  }, [tick, setToastMessage]);

  // تحديث تلقائي عند الرجوع للصفحة (بعد إضافة/حذف طالب في تبويب آخر)
  useEffect(() => {
    const onFocus = () => setTick((t) => t + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const tables = useMemo(() => {
    const rows = state.rows;
    if (model === 'model1') {
      return [
        { title: 'فرع البنين', rows: rows.filter((r) => r.branch === 'boys') },
        { title: 'فرع البنات', rows: rows.filter((r) => r.branch === 'girls') },
      ];
    }
    if (model === 'model2') {
      return [
        { title: 'تمهيدي – سادس', rows: rows.filter((r) => Number(r.stage) === 1) },
        { title: 'سابع – ثالث ثانوي', rows: rows.filter((r) => Number(r.stage) !== 1) },
      ];
    }
    if (model === 'boys') return [{ title: 'فرع البنين', rows: rows.filter((r) => r.branch === 'boys') }];
    return [{ title: 'فرع البنات', rows: rows.filter((r) => r.branch === 'girls') }];
  }, [state.rows, model]);

  const shown = tables.flatMap((t) => t.rows);
  const sum = (list, k) => list.reduce((a, r) => a + (Number(r[k]) || 0), 0);
  const unknown = sum(shown, 'unknown');
  const noBranch = model === 'model2' ? 0 : state.rows.filter((r) => !r.branch).length;
  /** الشعب التي فيها طلاب بدون جنس — الاحصائية غير مكتملة ولا تُطبع حتى تكتمل */
  const incomplete = shown.filter((r) => Number(r.unknown) > 0);
  const complete = unknown === 0 && noBranch === 0;
  // تحقق داخلي: عدد الذكور + عدد الاناث + غير المحدد = الاجمالي لكل شعبة
  const broken = shown.filter((r) => Number(r.males) + Number(r.females) + Number(r.unknown) !== Number(r.total));

  const totals = (
    <div className="ar-totals">
      <div className="ar-total"><span>اجمالي عدد الذكور</span><strong>{sum(shown, 'males')}</strong></div>
      <div className="ar-total"><span>اجمالي عدد الاناث</span><strong>{sum(shown, 'females')}</strong></div>
      <div className="ar-total"><span>الاجمالي الكلي</span><strong>{sum(shown, 'total')}</strong></div>
    </div>
  );

  return (
    <div ref={printAreaRef} className="ar-view">
      <div className="cb-controls no-print ar-controls">
        <button
          type="button"
          className="btn-filled cb-print-btn"
          onClick={() => openElementPrintPreview(printAreaRef.current, { title: title || 'معاينة الإحصائية', landscape: false })}
          disabled={state.loading || !complete || broken.length > 0}
          title={complete ? '' : 'لا يمكن الطباعة قبل اكتمال البيانات'}
        >
          <Eye size={18} />
          <span>معاينة وطباعة</span>
        </button>
      </div>

      {!state.loading && broken.length > 0 && (
        <div className="cb-note ar-note-error no-print" role="alert">
          خطأ في الأرقام: {broken.map((r) => r.short_name).join('، ')} — مجموع الذكور والإناث لا يساوي الاجمالي. أبلغ الدعم الفني.
        </div>
      )}
      {!state.loading && unknown > 0 && (
        <div className="cb-note ar-note-error no-print" role="alert">
          <strong>الاحصائية غير مكتملة — الطباعة متوقفة.</strong>{' '}
          يوجد <strong>{unknown}</strong> طالب/طالبة بدون تحديد «الجنس» في <strong>{incomplete.length}</strong> شعبة،
          فلا يساوي «عدد الذكور + عدد الاناث» «الاجمالي» في هذه الشعب (مظللة بالأحمر).
          <div className="ar-fix-links">
            {incomplete.map((r) => (
              <button
                key={r.class_id}
                type="button"
                className="cb-btn ar-fix-btn"
                onClick={() => setParams({ view: 'gender', class_id: String(r.class_id), back: model })}
              >
                {r.short_name} ({r.unknown})
              </button>
            ))}
          </div>
        </div>
      )}
      {!state.loading && noBranch > 0 && (
        <div className="cb-note cb-note-warn no-print">
          يوجد {noBranch} شعبة بدون تحديد «الفرع» — لن تظهر في هذه الاحصائية. حدّد الفرع من صفحة الصفوف.
        </div>
      )}

      {state.loading ? (
        <div className="cb-status">جاري التحميل...</div>
      ) : (
        <section className="ar-sheet ar-watermark" style={{ '--ar-logo': `url(${sloganLogo})` }}>
          <div className="ar-school">{SCHOOL_NAME}</div>
          {/* عنوان الصفحة كما في الملف: «احصائية فرع البنين/البنات» (الزر نفسه «احصائية لفرع ...») */}
          <div className="ar-title-box">
            {model === 'boys' ? 'احصائية فرع البنين' : model === 'girls' ? 'احصائية فرع البنات' : title}
          </div>

          <div className={`ar-tables ${tables.length > 1 ? 'ar-two' : 'ar-one'}`}>
            {tables.map((t, ti) => (
              <div key={t.title} className="ar-col">
                {tables.length > 1 && <h3 className="ar-branch">{t.title}</h3>}
                <table className="ar-table">
                  <thead>
                    <tr>
                      <th className="ar-diag" aria-label="الصف والشعبة" />
                      <th>عدد الذكور</th>
                      <th>عدد الاناث</th>
                      <th>الاجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((r) => (
                      <tr key={r.class_id} className={Number(r.unknown) > 0 ? 'ar-row-incomplete' : ''}>
                        <th scope="row" className="ar-cls">
                          {r.short_name}
                          {Number(r.unknown) > 0 && <span className="ar-miss no-print"> ({r.unknown} بدون جنس)</span>}
                        </th>
                        <td>{r.males}</td>
                        <td>{r.females}</td>
                        <td>{r.total}</td>
                      </tr>
                    ))}
                    {t.rows.length === 0 && (
                      <tr><td colSpan={4} className="ar-empty">لا توجد شعب</td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">الاجمالي</th>
                      <td>{sum(t.rows, 'males')}</td>
                      <td>{sum(t.rows, 'females')}</td>
                      <td>{sum(t.rows, 'total')}</td>
                    </tr>
                  </tfoot>
                </table>
                {/* كما في الملف: مربعات الإجماليات تحت الجدول الأيسر (في الصفحة ذات الجدولين) */}
                {tables.length > 1 && ti === tables.length - 1 && totals}
              </div>
            ))}
            {/* صفحة الفرع الواحد: المربعات على يسار الجدول عند أسفله */}
            {tables.length === 1 && <div className="ar-side">{totals}</div>}
          </div>

          <div className="ar-sign">ادارة المدرسة</div>
        </section>
      )}
    </div>
  );
}
