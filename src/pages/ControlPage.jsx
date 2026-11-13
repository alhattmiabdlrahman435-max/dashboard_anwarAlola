import { Suspense } from 'react';
import { safeLazy } from '../utils/safeLazy';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ControlTab from '../tabs/ControlTab';
import '../styles/controlBoard.css';

/**
 * الكنترول — النوافذ كما في ملحق المدرسة:
 * ( ارقام الجلوس – الارقام السرية – ترقيم اللجان – توزيع الطلاب في اللجان – كشوفات المناداة – البطائق – المرايا )
 * كل نافذة في ملف مستقل داخل src/tabs/control/
 */
const NumberingView = safeLazy(() => import('../tabs/control/NumberingView'));
const CommitteeNumberingView = safeLazy(() => import('../tabs/control/CommitteeNumberingView'));
const CommitteeAssignmentView = safeLazy(() => import('../tabs/control/CommitteeAssignmentView'));
const CallSheetsView = safeLazy(() => import('../tabs/control/CallSheetsView'));
const CardsView = safeLazy(() => import('../tabs/control/CardsView'));
const MirrorsView = safeLazy(() => import('../tabs/control/MirrorsView'));

/** الأزرار بنفس ترتيب صورة الملحق (صفحة 2) — 3 في كل صف، من اليمين لليسار */
const CONTROL_WINDOWS = [
  { key: 'seat', label: 'ارقام الجلوس' },
  { key: 'secret', label: 'الارقام السرية' },
  { key: 'committees', label: 'ترقيم اللجان' },
  { key: 'call-sheets', label: 'كشوفات المناداة' },
  { key: 'cards', label: 'البطائق' },
  { key: 'mirror-committees-envelopes', label: 'مرايا اللجان والظروف' },
  { key: 'mirror-committees-subjects', label: 'مرايا اللجان و المواد للظروف' },
  { key: 'mirror-names-seat', label: 'مرايا الاسماء مع ارقام الجلوس' },
  { key: 'mirror-names-secret', label: 'مرايا الاسماء مع الارقام السرية' },
  { key: 'mirror-names-seat-secret', label: 'مرايا الاسماء مع ارقام الجلوس و الارقام السرية' },
  { key: 'mirror-seat-secret', label: 'مرايا ارقام الجلوس مع الارقام السرية' },
  // توزيع الطلاب (صفحة 4 من الملحق) + رصد الدرجات الموجود سابقاً — في صف مستقل تحت أزرار الصورة
  { key: 'assignment', label: 'توزيع الطلاب في اللجان', extra: true },
  { key: 'grades', label: 'رصد الدرجات بالرقم السري', extra: true },
];

function renderWindow(key) {
  switch (key) {
    case 'seat':
      return <NumberingView field="seat" />;
    case 'secret':
      return <NumberingView field="secret" />;
    case 'committees':
      return <CommitteeNumberingView />;
    case 'assignment':
      return <CommitteeAssignmentView />;
    case 'call-sheets':
      return <CallSheetsView />;
    case 'cards':
      return <CardsView />;
    case 'grades':
      return <ControlTab />;
    default:
      if (key.startsWith('mirror-')) return <MirrorsView type={key.replace('mirror-', '')} />;
      return null;
  }
}

export default function ControlPage() {
  const { lang } = useApp();
  const [params, setParams] = useSearchParams();
  const current = params.get('view');
  const win = CONTROL_WINDOWS.find((w) => w.key === current);

  if (!win) {
    return (
      <div className="cb-page" dir="rtl">
        <div className="cb-header no-print">
          <h2 className="cb-title">{lang === 'ar' ? 'الكنترول' : 'Control'}</h2>
        </div>
        {[false, true].map((extra) => (
          <div key={String(extra)} className={`cb-tiles${extra ? ' cb-tiles-extra' : ''}`}>
            {CONTROL_WINDOWS.filter((w) => !!w.extra === extra).map((w) => (
              <button key={w.key} type="button" className="cb-tile" onClick={() => setParams({ view: w.key })}>
                {w.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="cb-page" dir="rtl">
      <div className="cb-header no-print">
        <button type="button" className="cb-back" onClick={() => setParams({})}>
          <ArrowRight size={16} />
          <span>{lang === 'ar' ? 'الكنترول' : 'Control'}</span>
        </button>
        <h2 className="cb-title">{win.label}</h2>
      </div>
      <Suspense fallback={<div className="cb-status">جاري التحميل...</div>}>{renderWindow(win.key)}</Suspense>
    </div>
  );
}
