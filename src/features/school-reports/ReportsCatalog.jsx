import { useState, useMemo } from 'react';
import {
  WalletCards,
  NotebookPen,
  GraduationCap,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Search,
  Info,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';

const GROUPS = [
  {
    key: 'academic',
    ar: 'المحصلات والشيتات',
    en: 'Assessments and sheets',
    icon: NotebookPen,
    badgeAr: 'أكاديمي',
    badgeEn: 'Academic',
    accentColor: '#3b82f6',
  },
  {
    key: 'documents',
    ar: 'نماذج النتائج والشهادات',
    en: 'Result templates',
    icon: GraduationCap,
    badgeAr: 'نماذج رسمية',
    badgeEn: 'Documents',
    accentColor: '#8b5cf6',
  },
  {
    key: 'finance',
    ar: 'المالية والرسوم',
    en: 'Finance & fees',
    icon: WalletCards,
    badgeAr: 'مالي',
    badgeEn: 'Finance',
    accentColor: '#10b981',
  },
  {
    key: 'followup',
    ar: 'سجلات المدرسة والمتابعة',
    en: 'School registers',
    icon: ClipboardList,
    badgeAr: 'سجلات',
    badgeEn: 'Registers',
    accentColor: '#f59e0b',
  },
];

export default function ReportsCatalog({ available, loading, error, lang, onOpen }) {
  const ar = lang === 'ar';
  const text = (arabic, english) => (ar ? arabic : english);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');

  const query = search.trim().toLowerCase();

  const matching = useMemo(() => {
    return available.filter((item) => {
      const matchesSearch =
        !query ||
        `${item.ar} ${item.en} ${item.description || ''} ${item.description_en || ''}`
          .toLowerCase()
          .includes(query);
      const matchesGroup = activeGroup === 'all' || item.group === activeGroup;
      return matchesSearch && matchesGroup;
    });
  }, [available, query, activeGroup]);

  return (
    <div className="sr-catalog-wrapper" dir={ar ? 'rtl' : 'ltr'}>
      {/* Top Header Card */}
      <header className="sr-catalog-header-card">
        <div className="sr-catalog-header-info">
          <div className="sr-catalog-header-icon-box">
            <FileSpreadsheet size={24} className="sr-catalog-header-icon" />
          </div>
          <div>
            <h2>{text('مركز التقارير والكشوف المدرسية', 'School Reports & Registers')}</h2>
            <p>
              {text(
                'استعراض شامل للتقارير الأكاديمية والمالية وسجلات المتابعة مع إمكانية التخصيص والطباعة وتصدير Excel.',
                'Comprehensive overview of academic, financial, and administrative registers with customizable print & Excel export.'
              )}
            </p>
          </div>
        </div>

        {/* Search & Statistics Bar */}
        <div className="sr-catalog-toolbar">
          <div className="sr-catalog-search-wrap">
            <Search size={16} className="sr-catalog-search-icon" aria-hidden="true" />
            <input
              type="search"
              aria-label={text('بحث عن تقرير', 'Search reports')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={text('ابحث باسم التقرير أو الوصف…', 'Search reports by title or description…')}
            />
            {search && (
              <button
                type="button"
                className="sr-catalog-search-clear-btn"
                onClick={() => setSearch('')}
                title={text('مسح البحث', 'Clear search')}
              >
                ×
              </button>
            )}
          </div>

          <div className="sr-catalog-count-badge">
            <Layers size={15} />
            <span>{text('التقارير المتاحة:', 'Available:')}</span>
            <strong>{available.length}</strong>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="sr-catalog-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeGroup === 'all'}
            className={`sr-catalog-tab-btn ${activeGroup === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveGroup('all')}
          >
            <Sparkles size={15} />
            <span>{text('جميع الأقسام', 'All Categories')}</span>
            <span className="sr-tab-count">
              {available.length}
            </span>
          </button>
          {GROUPS.map(({ key, ar: arabic, en, icon: Icon, badgeAr, badgeEn }) => {
            const count = available.filter((item) => item.group === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeGroup === key}
                className={`sr-catalog-tab-btn ${activeGroup === key ? 'is-active' : ''}`}
                onClick={() => setActiveGroup(key)}
              >
                <Icon size={15} />
                <span>{text(arabic, en)}</span>
                <span className="sr-tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="sr-catalog-body">
        {error ? (
          <div role="alert" className="sr-error-banner">
            <AlertCircle size={22} />
            <div className="sr-error-content">
              <strong>{text('تعذر تحميل التقارير', 'Failed to load reports')}</strong>
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="sr-retry-btn"
              onClick={() => window.location.reload()}
            >
              {text('إعادة المحاولة', 'Retry')}
            </button>
          </div>
        ) : loading ? (
          <div className="sr-loading-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="sr-card-skeleton" />
            ))}
          </div>
        ) : available.length === 0 ? (
          <div className="sr-empty-card">
            <AlertCircle size={36} />
            <h3>{text('لا توجد تقارير متاحة', 'No reports available')}</h3>
            <p>{text('ليس لديك صلاحيات لعرض التقارير المدرسية حالياً.', 'You do not currently have permissions to view school reports.')}</p>
          </div>
        ) : matching.length === 0 ? (
          <div className="sr-empty-card">
            <Search size={36} />
            <h3>{text('لا توجد نتائج مطابقة', 'No matching reports')}</h3>
            <p>{text('لم نجد تقارير تطابق عبارة البحث الحالية.', 'No reports matched your search term.')}</p>
            <button
              type="button"
              className="sr-catalog-reset-btn"
              onClick={() => {
                setSearch('');
                setActiveGroup('all');
              }}
            >
              {text('عرض جميع التقارير', 'Show all reports')}
            </button>
          </div>
        ) : (
          <div className="sr-groups-container">
            {GROUPS.map(({ key, ar: arabic, en, icon: Icon, badgeAr, badgeEn, accentColor }) => {
              const entries = matching.filter((item) => item.group === key);
              if (!entries.length) return null;

              return (
                <section key={key} className="sr-group-section">
                  <div className="sr-group-title-row">
                    <div className="sr-group-icon-pill" style={{ '--accent': accentColor }}>
                      <Icon size={18} />
                    </div>
                    <h3>{text(arabic, en)}</h3>
                    <span className="sr-group-count">
                      {entries.length} {text('تقرير', 'reports')}
                    </span>
                  </div>

                  <div className="sr-cards-grid">
                    {entries.map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        className="sr-report-card"
                        onClick={() => onOpen(item.key)}
                      >
                        <div className="sr-report-card-top">
                          <span className="sr-card-group-tag" style={{ '--accent': accentColor }}>
                            {text(badgeAr, badgeEn)}
                          </span>
                          <span className="sr-card-arrow-btn">
                            {ar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                          </span>
                        </div>

                        <div className="sr-report-card-main">
                          <h4>{item[lang] || item.ar}</h4>
                          <p>{ar ? item.description : item.description_en || item.description}</p>
                        </div>

                        <div className="sr-report-card-bottom">
                          <span className="sr-card-action-text">{text('فتح الكشف والطباعة', 'Open & Print')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="sr-catalog-footer">
        <Info size={15} />
        <span>
          {text(
            'جميع الكشوف تقرأ البيانات الحية الفعلية للنظام مباشرة وتخضع لصلاحيات المستخدم والمستوى الإداري.',
            'All reports read live system records directly according to user permissions and administrative scope.'
          )}
        </span>
      </footer>
    </div>
  );
}
