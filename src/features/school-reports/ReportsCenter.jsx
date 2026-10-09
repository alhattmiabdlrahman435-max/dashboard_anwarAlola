import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Printer,
  Download,
  SlidersHorizontal,
  RefreshCw,
  FileText,
  Search,
  Info,
  AlertCircle,
  RotateCcw,
  Check,
  CheckCircle2,
  Calendar,
  BookOpen,
  Filter,
  Users,
  ChevronDown,
  FileSpreadsheet,
  Award,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/Auth/useAuth';
import { api } from '../../services/api';
import logo from '../../assets/slogan.jpeg';
import { REPORTS, NOTES, buildReportQuery, cellValue, reportCsv, printReport } from './reportUtils';
import ReportsCatalog from './ReportsCatalog';
import StudentSelect from './StudentSelect';
import LedgerReportView from './views/LedgerReportView';
import SingleStudentReportView from './views/SingleStudentReportView';
import './reports.css';

const EMPTY_FILTERS = {
  class_ids: [],
  subject_id: '',
  student_id: '',
  term: '1',
  month: '1',
  from: '',
  to: '',
  search: '',
  status: 'all',
};

export default function ReportsCenter() {
  const { lang } = useApp();
  const { currentUser } = useAuth();
  const ar = lang === 'ar';
  const text = useCallback((arabic, english) => (ar ? arabic : english), [ar]);

  const [options, setOptions] = useState(null);
  const [optionsError, setOptionsError] = useState('');
  const [selected, setSelected] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [grade, setGrade] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [customize, setCustomize] = useState(false);
  const [showMultiSections, setShowMultiSections] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [page, setPage] = useState(1);
  const [studentOptions, setStudentOptions] = useState({ scope: '', rows: [], loading: false });
  const [studentError, setStudentError] = useState('');

  const requestId = useRef(0);
  const printArea = useRef(null);
  const multiSectionsRef = useRef(null);
  const customizeRef = useRef(null);

  const preferenceKey = `school-reports-columns:${currentUser?.id || 'anonymous'}:${selected}`;

  // Fetch initial permissions & options
  useEffect(() => {
    let active = true;
    api
      .get('/api/school-reports/options')
      .then((data) => {
        if (active) setOptions(data);
      })
      .catch((err) => {
        if (active) setOptionsError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const available = useMemo(
    () => REPORTS.filter((item) => options?.reports?.some((r) => r.key === item.key)),
    [options]
  );
  const definition = useMemo(() => REPORTS.find((item) => item.key === selected), [selected]);
  const permission = useMemo(() => options?.reports?.find((item) => item.key === selected), [options, selected]);

  const classes = useMemo(
    () => (options?.classes || []).filter((item) => permission?.class_ids?.includes(item.id)),
    [options, permission]
  );

  const grades = useMemo(() => [...new Set(classes.map((item) => item.grade_ar))], [classes]);
  const gradeClasses = useMemo(
    () => (grade ? classes.filter((item) => item.grade_ar === grade) : classes),
    [grade, classes]
  );
  const effectiveClassIds = useMemo(
    () => (filters.class_ids.length ? filters.class_ids : gradeClasses.map((item) => item.id)),
    [filters.class_ids, gradeClasses]
  );

  const subjects = useMemo(
    () => [
      ...new Map(
        (options?.subjects || [])
          .filter((item) => effectiveClassIds.includes(item.class_id))
          .map((item) => [item.id, item])
      ).values(),
    ],
    [options, effectiveClassIds]
  );

  const documentMode = selected.endsWith('-result');
  const studentScope = effectiveClassIds.join(',');
  const academic = definition?.group === 'academic' || documentMode;

  const dirty =
    report &&
    (report.query !== buildReportQuery({ ...filters, class_ids: effectiveClassIds }) ||
      report.key !== selected);

  const columns = useMemo(
    () => report?.columns?.filter((item) => !hiddenColumns.includes(item.key)) || [],
    [report, hiddenColumns]
  );

  const rows = report?.rows || [];
  const pageSize = 30;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize]
  );

  // Load students dynamically when class scope changes
  useEffect(() => {
    if (!studentScope || !selected) {
      setStudentOptions({ scope: '', rows: [], loading: false });
      return;
    }

    let active = true;
    setStudentOptions((prev) => ({ ...prev, loading: true }));
    const query = buildReportQuery({ class_ids: studentScope.split(',').map(Number) });

    api
      .get(`/api/school-reports/students?${query}`)
      .then((data) => {
        if (active) {
          setStudentOptions({ scope: studentScope, rows: data.students || [], loading: false });
          setStudentError('');
        }
      })
      .catch((err) => {
        if (active) {
          setStudentOptions({ scope: studentScope, rows: [], loading: false });
          setStudentError(err.message);
        }
      });

    return () => {
      active = false;
    };
  }, [studentScope, selected]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (multiSectionsRef.current && !multiSectionsRef.current.contains(event.target)) {
        setShowMultiSections(false);
      }
      if (customizeRef.current && !customizeRef.current.contains(event.target)) {
        setCustomize(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleOpenReport(key) {
    setSelected(key);
    setReport(null);
    setError('');
    setNotice('');
    setPage(1);
    setCustomize(false);
    setShowMultiSections(false);
    setFilters({ ...EMPTY_FILTERS });
    setGrade('');
    try {
      const saved = JSON.parse(
        localStorage.getItem(`school-reports-columns:${currentUser?.id}:${key}`) || '[]'
      );
      setHiddenColumns(
        Array.isArray(saved)
          ? saved.filter((val) => typeof val === 'string' && !['name', 'subject'].includes(val))
          : []
      );
    } catch {
      setHiddenColumns([]);
    }
  }

  function updateFilter(key, value) {
    requestId.current++;
    setLoading(false);
    setError('');
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    requestId.current++;
    setLoading(false);
    setError('');
    setFilters({ ...EMPTY_FILTERS });
    setGrade('');
  }

  async function loadReport() {
    if (!effectiveClassIds.length) {
      setError(text('لا توجد شعب متاحة لهذا التقرير.', 'No classes available for this report.'));
      return;
    }
    if (documentMode && !filters.student_id) {
      setError(text('يرجى اختيار الطالب لعرض النموذج.', 'Please select a student to preview the report.'));
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    setNotice('');
    const query = buildReportQuery({ ...filters, class_ids: effectiveClassIds });
    try {
      const data = await api.get(`/api/school-reports/${selected}?${query}`);
      if (requestId.current !== id) return;
      setReport({ ...data, query });
      setPage(1);
    } catch (err) {
      if (requestId.current === id) setError(err.message);
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  }

  async function exportCsv() {
    if (!report || dirty) return;
    setError('');
    try {
      const data = await api.get(`/api/school-reports/${selected}?${report.query}&export=1`);
      const blob = new Blob([reportCsv(data, columns, lang)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selected}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.message);
    }
  }

  function saveColumns() {
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(hiddenColumns));
      setNotice(
        text('حُفظ اختيار الأعمدة في هذا المتصفح.', 'Column choices saved in this browser.')
      );
      setCustomize(false);
    } catch {
      setNotice(
        text(
          'تعذر الحفظ في المتصفح؛ يمكنك استخدام التخصيص الآن.',
          'Browser storage is unavailable; current customization still works.'
        )
      );
    }
  }

  // Smart scope label formatter (prevents repeating long list of classes)
  const formattedScope = useMemo(() => {
    if (report?.student?.class) {
      return report.student.class;
    }
    if (filters.student_id && rows.length === 1 && rows[0].class) {
      return rows[0].class;
    }
    const rawScope = report?.scope || [];
    if (rawScope.length === 0) return text('جميع الصفوف والشعب', 'All classes');
    if (rawScope.length === 1) return rawScope[0];
    if (grade) {
      if (!filters.class_ids.length || filters.class_ids.length === gradeClasses.length) {
        return text(`${grade} (جميع الشعب)`, `${grade} (All sections)`);
      }
      const sectionNames = gradeClasses
        .filter((c) => filters.class_ids.includes(c.id))
        .map((c) => ar ? c.section_ar : (c.section_en || c.section_ar))
        .join('، ');
      return text(`${grade} (شعب: ${sectionNames})`, `${grade} (Sections: ${sectionNames})`);
    }
    if (rawScope.length >= 4) {
      return text(`جميع الصفوف والشعب (${rawScope.length} شعبة)`, `All classes (${rawScope.length} sections)`);
    }
    return rawScope.join('، ');
  }, [report?.scope, report?.student, filters.student_id, rows, grade, filters.class_ids, gradeClasses, ar, text]);

  const selectedStudentObj = useMemo(() => {
    if (!filters.student_id) return null;
    return studentOptions.rows?.find((s) => String(s.id) === String(filters.student_id)) || null;
  }, [filters.student_id, studentOptions.rows]);

  const isSingleStudent = documentMode || Boolean(filters.student_id) || Boolean(report?.student);
  const currentStudent = report?.student || (rows[0]?.name ? rows[0] : selectedStudentObj);

  const isLandscape = !isSingleStudent;
  const printPages = useMemo(() => {
    if (isSingleStudent || !rows.length) return [rows];

    const regularSize = isLandscape ? 28 : 38;
    const lastPageMax = isLandscape ? 24 : 34;

    // If all rows fit on a single page with signatures:
    if (rows.length <= lastPageMax) {
      return [rows];
    }

    const pages = [];
    let offset = 0;

    while (offset < rows.length) {
      const remaining = rows.length - offset;

      // If remaining rows fit on the last page with signatures:
      if (remaining <= lastPageMax) {
        pages.push(rows.slice(offset));
        break;
      }

      // When down to the final two pages, balance them gracefully
      if (remaining <= regularSize + lastPageMax) {
        const minForFirst = Math.max(Math.ceil(remaining / 2), remaining - lastPageMax);
        pages.push(rows.slice(offset, offset + minForFirst));
        offset += minForFirst;
        pages.push(rows.slice(offset));
        break;
      }

      pages.push(rows.slice(offset, offset + regularSize));
      offset += regularSize;
    }

    return pages;
  }, [isSingleStudent, isLandscape, rows]);

  if (!selected) {
    return (
      <ReportsCatalog
        available={available}
        loading={!options}
        error={optionsError}
        lang={lang}
        onOpen={handleOpenReport}
      />
    );
  }

  return (
    <div className="sr-page-container" dir={ar ? 'rtl' : 'ltr'}>
      {/* Top Header Card — Classical Official Header */}
      <header className="sr-card sr-header-card">
        <div className="sr-header-start">
          <button
            className="sr-back-btn"
            type="button"
            onClick={() => {
              requestId.current++;
              setSelected('');
              setLoading(false);
            }}
          >
            {ar ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{text('العودة للتقارير', 'Back to reports')}</span>
          </button>

          <div className="sr-header-separator" aria-hidden="true" />

          <div className="sr-title-group">
            <div className="sr-title-icon-box">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="sr-title-row">
                <h2>{definition?.[lang] || definition?.ar}</h2>
                <span className="sr-badge-pill">
                  {text(
                    definition?.group === 'academic'
                      ? 'كشف درجات وأعمال'
                      : definition?.group === 'finance'
                      ? 'كشف حساب مالي'
                      : definition?.group === 'documents'
                      ? 'نموذج وثيقة رسمية'
                      : 'سجل إداري ومتابعة',
                    'Official Report'
                  )}
                </span>
              </div>
              <p className="sr-header-subcopy">
                {ar ? definition?.description : definition?.description_en || definition?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="sr-header-end">
          {dirty && (
            <div className="sr-dirty-chip" role="status">
              <RefreshCw size={14} className="sr-spin-icon" />
              <span>{text('تغيرت الفلاتر، اضغط "عرض التقرير" للتحديث', 'Filters changed, click show report')}</span>
            </div>
          )}
        </div>
      </header>

      {/* Filter Card */}
      <section className="sr-card sr-filter-card">
        <form
          className="sr-filters-grid"
          onSubmit={(e) => {
            e.preventDefault();
            loadReport();
          }}
        >
          {/* Grade Select */}
          <div className="sr-form-group">
            <label>{text('الصف الدراسي', 'Grade')}</label>
            <select
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                updateFilter('class_ids', []);
                updateFilter('subject_id', '');
                updateFilter('student_id', '');
              }}
            >
              <option value="">{text('جميع الصفوف المسموحة', 'All allowed grades')}</option>
              {grades.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div className="sr-form-group sr-section-select-group">
            <div className="sr-label-with-action">
              <label>{text('الشعبة', 'Section')}</label>
              {gradeClasses.length > 1 && (
                <div className="sr-multi-sections-wrapper" ref={multiSectionsRef}>
                  <button
                    type="button"
                    className={`sr-multi-toggle-btn ${filters.class_ids.length > 1 ? 'is-active' : ''}`}
                    onClick={() => setShowMultiSections(!showMultiSections)}
                  >
                    <Users size={13} />
                    <span>
                      {filters.class_ids.length > 1
                        ? text(`تحديد متعدد (${filters.class_ids.length})`, `Multi (${filters.class_ids.length})`)
                        : text('تحديد متعدد', 'Multi-select')}
                    </span>
                  </button>

                  {showMultiSections && (
                    <div className="sr-multi-dropdown">
                      <div className="sr-multi-dropdown-header">
                        <strong>{text('اختيار شعب متعددة', 'Select Multiple Sections')}</strong>
                        <button
                          type="button"
                          className="sr-multi-clear"
                          onClick={() => {
                            updateFilter('class_ids', []);
                            updateFilter('subject_id', '');
                            updateFilter('student_id', '');
                          }}
                        >
                          {text('إلغاء التحديد', 'Clear')}
                        </button>
                      </div>
                      <div className="sr-multi-list">
                        {gradeClasses.map((item) => {
                          const isChecked = filters.class_ids.includes(item.id);
                          return (
                            <label key={item.id} className="sr-multi-item">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...filters.class_ids, item.id]
                                    : filters.class_ids.filter((id) => id !== item.id);
                                  updateFilter('class_ids', updated);
                                  updateFilter('subject_id', '');
                                  updateFilter('student_id', '');
                                }}
                              />
                              <span>
                                {ar
                                  ? `${item.grade_ar} — ${item.section_ar}`
                                  : `${item.grade_en || item.grade_ar} — ${item.section_en || item.section_ar}`}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <select
              value={filters.class_ids.length > 1 ? 'custom' : filters.class_ids[0] || ''}
              onChange={(e) => {
                if (e.target.value === 'custom') return;
                updateFilter('class_ids', e.target.value ? [Number(e.target.value)] : []);
                updateFilter('subject_id', '');
                updateFilter('student_id', '');
              }}
            >
              <option value="">{text('جميع شعب الصف', 'All sections')}</option>
              {filters.class_ids.length > 1 && (
                <option value="custom">
                  {text(
                    `شعب محددة (${filters.class_ids.length})`,
                    `Selected sections (${filters.class_ids.length})`
                  )}
                </option>
              )}
              {gradeClasses.map((item) => (
                <option key={item.id} value={item.id}>
                  {ar
                    ? `${item.grade_ar} — ${item.section_ar}`
                    : `${item.grade_en || item.grade_ar} — ${item.section_en || item.section_ar}`}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Term & Assessment (if applicable) */}
          {academic && (
            <>
              {!selected.startsWith('annual') && (
                <div className="sr-form-group">
                  <label>{text('الفصل الدراسي', 'Term')}</label>
                  <select
                    value={filters.term}
                    onChange={(e) => updateFilter('term', e.target.value)}
                  >
                    <option value="1">{text('الفصل الأول', 'Term 1')}</option>
                    <option value="2">{text('الفصل الثاني', 'Term 2')}</option>
                  </select>
                </div>
              )}

              {selected === 'month' && (
                <div className="sr-form-group">
                  <label>{text('المحصلة الشهرية', 'Assessment')}</label>
                  <select
                    value={filters.month}
                    onChange={(e) => updateFilter('month', e.target.value)}
                  >
                    {[1, 2, 3].map((num) => (
                      <option key={num} value={num}>
                        {text(['المحصلة الأولى', 'المحصلة الثانية', 'المحصلة الثالثة'][num - 1], `Assessment ${num}`)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!documentMode && (
                <div className="sr-form-group">
                  <label>{text('المادة الدراسية', 'Subject')}</label>
                  <select
                    value={filters.subject_id}
                    onChange={(e) => updateFilter('subject_id', e.target.value)}
                  >
                    <option value="">{text('جميع مواد الشعب', 'All assigned subjects')}</option>
                    {subjects.map((item) => (
                      <option key={item.id} value={item.id}>
                        {ar ? item.name_ar : item.name_en || item.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Attendance Dates (if applicable) */}
          {selected === 'attendance' && (
            <>
              <div className="sr-form-group">
                <label>{text('من تاريخ', 'From')}</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => updateFilter('from', e.target.value)}
                />
              </div>
              <div className="sr-form-group">
                <label>{text('إلى تاريخ', 'To')}</label>
                <input
                  type="date"
                  value={filters.to}
                  min={filters.from || undefined}
                  onChange={(e) => updateFilter('to', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Student Searchable Select */}
          <div className="sr-form-group sr-student-group">
            <label>
              {documentMode ? text('الطالب (مطلوب)', 'Student (Required)') : text('تحديد طالب بالاسم / الكود', 'Filter Student by Name')}
            </label>
            <StudentSelect
              students={studentOptions.rows}
              value={filters.student_id}
              onChange={(val) => updateFilter('student_id', val || '')}
              required={documentMode}
              loading={studentOptions.loading}
              disabled={studentOptions.loading || !effectiveClassIds.length}
              lang={lang}
              placeholder={
                documentMode
                  ? text('اختر الطالب للمعاينة…', 'Select student for preview…')
                  : text('جميع الطلاب (أو ابحث بالاسم)…', 'All students (or search by name)…')
              }
            />
          </div>

          {/* Status Select (if applicable) */}
          {!documentMode && selected !== 'registry' && (
            <div className="sr-form-group">
              <label>{text('حالة السجل', 'Status')}</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
              >
                <option value="all">{text('جميع الحالات', 'All')}</option>
                {(selected === 'finance'
                  ? [
                      ['unpaid', 'متبقٍ عليه رسوم', 'Unpaid'],
                      ['paid', 'مسدد بالكامل', 'Paid'],
                      ['credit', 'رصيد دائن', 'Credit'],
                    ]
                  : [
                      ['complete', 'مرصود ومكتمل', 'Recorded'],
                      ['incomplete', 'ناقص الرصد', 'Incomplete'],
                    ]
                ).map(([val, arabic, english]) => (
                  <option value={val} key={val}>
                    {text(arabic, english)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="sr-filter-actions">
            <button
              className="sr-btn-primary"
              type="submit"
              disabled={loading || !classes.length}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="sr-spin-icon" />
                  <span>{text('جارٍ التحميل…', 'Loading…')}</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>{text('عرض التقرير', 'Show Report')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="sr-btn-secondary"
              onClick={resetFilters}
              title={text('إعادة ضبط الفلاتر', 'Reset filters')}
            >
              <RotateCcw size={15} />
              <span>{text('إعادة تعيين', 'Reset')}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Error & Notification Banners */}
      {studentError && (
        <div className="sr-banner sr-banner-error" role="alert">
          <AlertCircle size={17} />
          <span>{studentError}</span>
        </div>
      )}
      {error && (
        <div className="sr-banner sr-banner-error" role="alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="sr-banner sr-banner-info" role="status">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Results Data Card */}
      <section className="sr-card sr-data-card">
        {!report && !loading && !error && (
          <div className="sr-empty-workspace">
            <FileText size={42} className="sr-empty-icon" />
            <h3>{text('التقرير جاهز للإعداد', 'Report Ready')}</h3>
            <p>
              {documentMode
                ? text('حدد الصف والشعبة والطالب ثم اضغط "عرض التقرير" لمعاينة النموذج.', 'Select class, section, and student then click "Show Report".')
                : text('اضبط الفلاتر المطلوبة أعلاه ثم اضغط على "عرض التقرير" لعرض البيانات الحية.', 'Adjust filters above and click "Show Report" to display live school records.')}
            </p>
          </div>
        )}

        {report && (
          <>
            {/* Toolbar Header */}
            <div className="sr-data-toolbar">
              <div className="sr-summary-chips">
                <div className="sr-chip sr-chip-main">
                  <span>{text('إجمالي السجلات:', 'Total Records:')}</span>
                  <strong>{rows.length}</strong>
                </div>
                {report.summary?.students !== undefined && (
                  <div className="sr-chip">
                    <span>{text('الطلاب:', 'Students:')}</span>
                    <strong>{report.summary.students}</strong>
                  </div>
                )}
                {report.summary?.complete !== undefined && (
                  <div className="sr-chip sr-chip-success">
                    <span>{text('مكتمل:', 'Complete:')}</span>
                    <strong>{report.summary.complete}</strong>
                  </div>
                )}
                {report.summary?.complete !== undefined && (
                  <div className="sr-chip sr-chip-warning">
                    <span>{text('ناقص:', 'Incomplete:')}</span>
                    <strong>{report.summary.students - report.summary.complete}</strong>
                  </div>
                )}
                {report.summary?.with_phone !== undefined && (
                  <div className="sr-chip sr-chip-info">
                    <span>{text('أرقام تواصل مسجلة:', 'Registered Contacts:')}</span>
                    <strong>{report.summary.with_phone} / {report.summary.students}</strong>
                  </div>
                )}
                {Object.entries(report.totals || {}).map(([key, val]) => (
                  <div key={key} className="sr-chip sr-chip-accent">
                    <span>{report.columns?.find((c) => c.key === key)?.[lang] || key}:</span>
                    <strong>{cellValue({ [key]: val }, { key }, lang)}</strong>
                  </div>
                ))}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="sr-action-buttons">
                {/* Columns Customizer Popover */}
                <div className="sr-customize-wrap" ref={customizeRef}>
                  <button
                    type="button"
                    className={`sr-tool-btn ${customize ? 'is-active' : ''}`}
                    onClick={() => setCustomize(!customize)}
                    title={text('تخصيص الأعمدة الظاهرة', 'Customize visible columns')}
                  >
                    <SlidersHorizontal size={15} />
                    <span>{text('الأعمدة', 'Columns')}</span>
                  </button>

                  {customize && (
                    <div className="sr-customize-popover">
                      <div className="sr-customize-header">
                        <strong>{text('الأعمدة الظاهرة في الكشف', 'Visible Columns')}</strong>
                      </div>
                      <div className="sr-customize-list">
                        {report.columns?.map((col) => (
                          <label key={col.key} className="sr-customize-item">
                            <input
                              type="checkbox"
                              checked={!hiddenColumns.includes(col.key)}
                              disabled={col.key === 'name' || col.key === 'subject'}
                              onChange={(e) =>
                                setHiddenColumns((prev) =>
                                  e.target.checked
                                    ? prev.filter((k) => k !== col.key)
                                    : [...prev, col.key]
                                )
                              }
                            />
                            <span>{col[lang] || col.ar}</span>
                          </label>
                        ))}
                      </div>
                      <div className="sr-customize-footer">
                        <button
                          type="button"
                          className="sr-btn-save-cols"
                          onClick={saveColumns}
                        >
                          <Check size={14} />
                          <span>{text('حفظ في هذا المتصفح', 'Save choice')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="sr-tool-btn"
                  disabled={dirty || !rows.length || !permission?.can_export}
                  onClick={exportCsv}
                  title={text('تصدير كملف إكسل CSV', 'Export as CSV for Excel')}
                >
                  <Download size={15} />
                  <span>{text('تصدير Excel', 'Export CSV')}</span>
                </button>

                <button
                  type="button"
                  className="sr-tool-btn sr-tool-btn-print"
                  disabled={dirty || !rows.length || !permission?.can_export}
                  onClick={() => printReport(printArea.current, definition?.[lang] || definition?.ar, !isSingleStudent)}
                  title={text('طباعة الكشف أو الحفظ بصيغة PDF', 'Print or save PDF')}
                >
                  <Printer size={15} />
                  <span>{text('طباعة / PDF', 'Print')}</span>
                </button>
              </div>
            </div>

            {/* Table Area (Full Page View with Sticky Headers & Internal Scroll) */}
            <div className="sr-table-container">
              {!rows.length ? (
                <div className="sr-empty-workspace">
                  <h3>{text('لا توجد بيانات مطابقة', 'No matching records')}</h3>
                  <p>{text('تأكد من اختيار نطاق شعب صحيح أو تحقق من رصد البيانات في النظام.', 'Check the selected class scope or confirm records are entered in the system.')}</p>
                </div>
              ) : (
                <>
                  {/* Official Sheet Scope Bar (Group Reports only) */}
                  {!isSingleStudent && (
                    <div className="sr-screen-scope-bar">
                      <div className="sr-scope-side-right">
                        <span><strong>{text('الصف والشعبة:', 'Class & Section:')}</strong> {formattedScope}</span>
                        <span className="sr-scope-divider">|</span>
                        <span><strong>{text('التقرير:', 'Report:')}</strong> {definition?.[lang] || definition?.ar}</span>
                      </div>
                      <div className="sr-scope-side-left">
                        <span><strong>{text('عدد الطلاب:', 'Students Count:')}</strong> {rows.length}</span>
                        {academic && (
                          <>
                            <span className="sr-scope-divider">|</span>
                            <span><strong>{text('المقررات:', 'Subjects:')}</strong> {subjects.length || rows.length || '—'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {isSingleStudent ? (
                    <SingleStudentReportView
                      report={report}
                      columns={columns}
                      rows={rows}
                      student={currentStudent}
                      reportKey={selected}
                      lang={lang}
                      text={text}
                      isPrint={false}
                    />
                  ) : (
                    <LedgerReportView
                      report={report}
                      columns={columns}
                      tableRows={visibleRows}
                      allRows={rows}
                      page={page}
                      pageSize={pageSize}
                      showTotals={page === pageCount}
                      lang={lang}
                      text={text}
                    />
                  )}
                </>
              )}
            </div>

            {/* Bottom Footer & Pagination Bar — Classical Ledger Footer */}
            <footer className="sr-data-footer">
              <div className="sr-footer-meta">
                <span className="sr-footer-record-badge">
                  {text('إجمالي الصفوف:', 'Total Rows:')} <strong>{rows.length}</strong>
                </span>

                {documentMode && (
                  <span className="sr-doc-meta-summary">
                    {text('المجموع:', 'Total:')} <strong>{report.summary?.total ?? '—'} / {report.summary?.maximum}</strong> · {text('النسبة:', 'Percentage:')} <strong>{report.summary?.percentage ?? '—'}%</strong> · {report.summary?.complete ? text('مكتمل للمراجعة', 'Complete') : text('ناقص الرصد', 'Incomplete')}
                  </span>
                )}

                {report.notes?.length > 0 && (
                  <button
                    type="button"
                    className="sr-notes-toggle-btn"
                    onClick={() => setShowNotes(!showNotes)}
                  >
                    <Info size={14} />
                    <span>{text('ملاحظات وقواعد الكشف', 'Report rules & limits')}</span>
                    <ChevronDown size={13} className={showNotes ? 'is-rotated' : ''} />
                  </button>
                )}
              </div>

              {pageCount > 1 && (
                <div className="sr-pagination-controls">
                  <button
                    type="button"
                    className="sr-page-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {text('السابق', 'Prev')}
                  </button>
                  <span className="sr-page-status">
                    {page} / {pageCount}
                  </span>
                  <button
                    type="button"
                    className="sr-page-btn"
                    disabled={page === pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    {text('التالي', 'Next')}
                  </button>
                </div>
              )}
            </footer>

            {/* Collapsible Notes Drawer */}
            {showNotes && report.notes?.length > 0 && (
              <div className="sr-notes-drawer">
                <h4>{text('ملاحظات وقواعد الحساب:', 'Report calculation notes:')}</h4>
                <ul>
                  {report.notes.map((key) => (
                    <li key={key}>{NOTES[key]?.[ar ? 0 : 1]}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hidden Printable Version with Official Ministry Header & Signatures */}
            <div className="sr-print-storage" aria-hidden="true">
              <div ref={printArea} className="sr-print-pages-wrapper" dir={ar ? 'rtl' : 'ltr'}>
                {printPages.map((pageRows, pageIdx) => {
                  const isLastPage = pageIdx === printPages.length - 1;
                  const startIndex = printPages.slice(0, pageIdx).reduce((acc, p) => acc + p.length, 0);
                  const pageNumberText = text(
                    `الصفحة ${pageIdx + 1} / ${printPages.length}`,
                    `Page ${pageIdx + 1} / ${printPages.length}`
                  );

                  return (
                    <div key={pageIdx} className="sr-print-sheet">
                      {/* 3-Column Header */}
                      <div className="sr-print-top-header">
                        <div className="sr-print-gov-ar">
                          <div>الجمهورية اليمنية</div>
                          <div>وزارة التربية والتعليم و البحث العلمي</div>
                          <div className="sr-print-school-ar">رياض و مدارس انوار العلى الدولية النموذجية</div>
                        </div>

                        <div className="sr-print-logo-box">
                          <img src={logo} alt="Logo" />
                        </div>

                        <div className="sr-print-gov-en">
                          <div>Republic of Yemen</div>
                          <div>Min. of Education & Scientific Research</div>
                          <div className="sr-print-school-en">Riyadh & Anwar Al-Ola Int. Model Schools</div>
                        </div>
                      </div>

                      {/* Centered Main Title */}
                      <div className="sr-print-title-area">
                        <h2>
                          {definition?.[lang] || definition?.ar}
                          {!isSingleStudent ? ` — ${formattedScope}` : ''}
                        </h2>
                        <div className="sr-meta-sub">
                          {academic && !selected.startsWith('annual')
                            ? `${text('الفصل الدراسي:', 'Term:')} ${filters.term === '2' ? text('الترم الثاني', 'Term 2') : text('الترم الأول', 'Term 1')} | ${text('الفترة التقييمية:', 'Assessment Period:')} ${selected === 'month' ? text(['المحصلة الأولى', 'المحصلة الثانية', 'المحصلة الثالثة'][Number(filters.month) - 1] || 'المحصلة الأولى', `Assessment ${filters.month}`) : text('كشف أعمال الفصل والنهائي', 'Full Coursework')}`
                            : selected.startsWith('annual')
                            ? text('التقييم السنوي الشامل لنتائج الفصلين الأول والثاني', 'Annual Academic Evaluation')
                            : selected === 'attendance'
                            ? `${text('فترة الحضور المسجلة:', 'Period:')} ${filters.from || '…'} — ${filters.to || '…'}`
                            : text('كشف السجلات والبيانات الرسمية المعتمدة', 'Official Verified Register')}
                        </div>
                      </div>

                      {/* Scope & Indicator Row (Group Reports only) */}
                      {!isSingleStudent && (
                        <div className="sr-print-scope-bar">
                          <div>
                            <strong>{text('الصف والشعبة:', 'Class & Section:')}</strong> {formattedScope} |{' '}
                            <strong>{text('التقرير:', 'Report:')}</strong> {definition?.[lang] || definition?.ar}
                          </div>
                          <div>
                            <strong>{text('عدد الطلاب:', 'Students Count:')}</strong> {rows.length}{' '}
                            {academic ? ` | ${text('المواد:', 'Subjects:')} ${subjects.length || rows.length || '—'}` : ''}
                          </div>
                        </div>
                      )}

                      {isSingleStudent ? (
                        <SingleStudentReportView
                          report={report}
                          columns={columns}
                          rows={pageRows}
                          student={currentStudent}
                          reportKey={selected}
                          lang={lang}
                          text={text}
                          isPrint={true}
                        />
                      ) : (
                        <LedgerReportView
                          report={report}
                          columns={columns}
                          tableRows={pageRows}
                          allRows={rows}
                          page={pageIdx + 1}
                          pageSize={pageRows.length}
                          startIndex={startIndex}
                          showTotals={isLastPage}
                          lang={lang}
                          text={text}
                        />
                      )}

                      {/* 4 Official Verification Signatures (On the last page only, or for single student) */}
                      {(isLastPage || isSingleStudent) && (
                        <div className="sr-official-signatures">
                          <div className="sr-sig-item">
                            <strong>{text('مربي الفصل', 'Class Teacher')}</strong>
                            <div className="sr-sig-line" />
                          </div>
                          <div className="sr-sig-item">
                            <strong>{text('المشرف التربوي', 'Educational Supervisor')}</strong>
                            <div className="sr-sig-line" />
                          </div>
                          <div className="sr-sig-item">
                            <strong>{text('وكيل الشؤون التعليمية', 'Academic Vice Principal')}</strong>
                            <div className="sr-sig-line" />
                          </div>
                          <div className="sr-sig-item">
                            <strong>{text('مدير المدرسة والختم', 'Principal & Seal')}</strong>
                            <div className="sr-sig-line" />
                          </div>
                        </div>
                      )}

                      {/* Dynamic Footer with Page Number */}
                      <div className="sr-print-footer-info">
                        <span>
                          {text('تاريخ الطباعة:', 'Print Date:')}{' '}
                          {new Date().toLocaleDateString(ar ? 'ar-YE' : 'en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })}{' '}
                          {new Date().toLocaleTimeString(ar ? 'ar-YE' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="sr-print-page-num">
                          {pageNumberText}
                        </span>
                        <span>
                          {text('مدارس أنوار العلا الأهلية النموذجية', 'Anwar Al-Ola Schools')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
