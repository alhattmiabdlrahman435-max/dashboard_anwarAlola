import { Suspense } from 'react';
import { safeLazy } from '../utils/safeLazy';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import '../styles/controlBoard.css';

/**
 * قسم الأرشيف — حسب ملف «احصائية قسم الارشيف»:
 *  الاحصائية ← ( احصائية شاملة للفرعين نموذج 1 – نموذج 2 – احصائية لفرع البنين – احصائية لفرع البنات )
 *  بيانات الطلاب ← الصف والشعبة
 */
const StatisticsView = safeLazy(() => import('../tabs/archive/StatisticsView'));
const StudentDataView = safeLazy(() => import('../tabs/archive/StudentDataView'));
const GenderEntryView = safeLazy(() => import('../tabs/archive/GenderEntryView'));

const MAIN = [
  { key: 'statistics', label: 'الاحصائية' },
  { key: 'students', label: 'بيانات الطلاب' },
];

/** أزرار الاحصائية بنفس ترتيب صورة الملف (من اليمين) */
const STAT_MODELS = [
  { key: 'model1', label: 'احصائية شاملة للفرعين نموذج 1' },
  { key: 'model2', label: 'احصائية شاملة للفرعين نموذج 2' },
  { key: 'boys', label: 'احصائية لفرع البنين' },
  { key: 'girls', label: 'احصائية لفرع البنات' },
];

export default function ArchivePage() {
  const [params, setParams] = useSearchParams();
  const view = params.get('view');
  const model = params.get('model');
  const statModel = STAT_MODELS.find((m) => m.key === model);

  const header = (title, onBack, backLabel) => (
    <div className="cb-header no-print">
      {onBack && (
        <button type="button" className="cb-back" onClick={onBack}>
          <ArrowRight size={16} />
          <span>{backLabel}</span>
        </button>
      )}
      <h2 className="cb-title">{title}</h2>
    </div>
  );

  if (view === 'statistics' && statModel) {
    return (
      <div className="cb-page" dir="rtl">
        {header(statModel.label, () => setParams({ view: 'statistics' }), 'الاحصائية')}
        <Suspense fallback={<div className="cb-status">جاري التحميل...</div>}>
          <StatisticsView model={statModel.key} title={statModel.label} />
        </Suspense>
      </div>
    );
  }

  if (view === 'statistics') {
    return (
      <div className="cb-page" dir="rtl">
        {header('الاحصائية', () => setParams({}), 'الأرشيف')}
        <div className="cb-tiles cb-tiles-4">
          {STAT_MODELS.map((m) => (
            <button key={m.key} type="button" className="cb-tile" onClick={() => setParams({ view: 'statistics', model: m.key })}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // تحديد الجنس (يُفتح من تنبيه «الاحصائية غير مكتملة»)
  if (view === 'gender') {
    const back = STAT_MODELS.find((m) => m.key === params.get('back'));
    return (
      <div className="cb-page" dir="rtl">
        {header(
          'تحديد الجنس',
          () => setParams(back ? { view: 'statistics', model: back.key } : { view: 'statistics' }),
          back ? back.label : 'الاحصائية',
        )}
        <Suspense fallback={<div className="cb-status">جاري التحميل...</div>}>
          <GenderEntryView />
        </Suspense>
      </div>
    );
  }

  if (view === 'students') {
    return (
      <div className="cb-page" dir="rtl">
        {header('بيانات الطلاب', () => setParams({}), 'الأرشيف')}
        <Suspense fallback={<div className="cb-status">جاري التحميل...</div>}>
          <StudentDataView />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="cb-page" dir="rtl">
      {header('الأرشيف')}
      <div className="cb-tiles">
        {MAIN.map((w) => (
          <button key={w.key} type="button" className="cb-tile" onClick={() => setParams({ view: w.key })}>
            {w.label}
          </button>
        ))}
      </div>
      {/* أداة مساعدة (ليست من نوافذ الملف): إكمال «الجنس» اللازم لعدد الذكور/الإناث في الاحصائية */}
      <div className="cb-tiles cb-tiles-extra">
        <button type="button" className="cb-tile" onClick={() => setParams({ view: 'gender', class_id: 'all' })}>
          تحديد الجنس للطلاب
        </button>
      </div>
    </div>
  );
}
