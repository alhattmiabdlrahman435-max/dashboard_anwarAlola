import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useClasses } from '../contexts/Classes/useClasses';
import { useSettings } from '../contexts/Settings/useSettings';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';
import PrintHeader from '../components/PrintHeader';

export default function ControlTab() {
  const {
    lang,
    t,
    grades,
    controlPagination,
    setToastMessage,
    canAction,
    fetchControlGrades,
  } = useApp();

  const { classes, fetchClasses } = useClasses();
  const {
    isGradesEncrypted,
    setIsGradesEncrypted,
    handleCalculateSecretCodes,
    handleEnterGradeBySecretCode,
    loading: settingsLoading,
  } = useSettings();

  const {
    page,
    perPage,
    search,
    filters,
    sort,
    direction,
    setPage,
    setPerPage,
    setSearch,
    setFilters,
    setSort,
    setDirection,
    buildQueryString,
  } = usePagination({
    moduleKey: 'control',
    defaultFilters: { class_id: 'all' },
  });

  const [isSaving, setIsSaving] = useState(false);

  // Local UI state for search to keep typing responsive (debounced backend sync)
  const [searchQuery, setSearchQuery] = useState(search);
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  const qs = buildQueryString();

  useEffect(() => {
    fetchControlGrades(qs);
  }, [fetchControlGrades, qs]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const [secretTermInput, setSecretTermInput] = useState('term1');
  const [secretSubjectInput, setSecretSubjectInput] = useState('الرياضيات');
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [secretGradeInput, setSecretGradeInput] = useState('');

  const handleToggleEncryption = () => {
    if (!isGradesEncrypted) {
      handleCalculateSecretCodes();
    } else {
      setIsGradesEncrypted(false);
      setToastMessage(lang === 'ar' ? 'تم إلغاء التشفير وإظهار الأسماء' : 'Decrypted and names revealed');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleSaveGrade = async () => {
    if (!secretCodeInput || secretGradeInput === '') {
      setToastMessage(lang === 'ar' ? 'الرجاء إدخال الرقم السري والدرجة' : 'Please enter secret code and grade');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    const success = await handleEnterGradeBySecretCode(
      secretCodeInput,
      secretGradeInput,
      secretSubjectInput,
      secretTermInput
    );
    setIsSaving(false);

    if (success) {
      setSecretCodeInput('');
      setSecretGradeInput('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSortChange = (column) => {
    if (sort === column) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column);
      setDirection('desc');
    }
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          {t.controlTitle}
        </h3>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Encrypted switch toggle */}
          {canAction('control', 'generateSecretCodes') && (
            <button 
              className="btn-accent"
              onClick={handleToggleEncryption}
            >
              🔒 {isGradesEncrypted ? t.decryptNames : t.generateSecretCodes}
            </button>
          )}

          <button 
            className="btn-elevated"
            onClick={handlePrint}
          >
            🖨️ {t.printSheet}
          </button>
        </div>
      </div>

      {/* Secret Code Final Grade Entry Form */}
      <div className="no-print" style={{
        marginBottom: 'var(--space-lg)',
        padding: 'var(--space-lg)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-xs)' }}>
          <span style={{ fontSize: '1.25rem' }}>📝</span>
          <h4 className="title-medium" style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-primary-ui)' }}>
            {lang === 'ar' ? "رصد درجات الاختبار النهائي بالرقم السري (٣٠ درجة)" : "Enter Final Exam Grades by Secret Code (30 Marks)"}
          </h4>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {/* Select Term */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="secretTermInput" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {lang === 'ar' ? "الفصل الدراسي" : "Term"}
            </label>
            <select
              id="secretTermInput"
              className="text-field"
              style={{ height: '44px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={secretTermInput}
              onChange={(e) => setSecretTermInput(e.target.value)}
            >
              <option value="term1">{t.term1Label}</option>
              <option value="term2">{t.term2Label}</option>
            </select>
          </div>

          {/* Select Subject */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="secretSubjectInput" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {t.subjectLabel}
            </label>
            <select
              id="secretSubjectInput"
              className="text-field"
              style={{ height: '44px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={secretSubjectInput}
              onChange={(e) => setSecretSubjectInput(e.target.value)}
            >
              <option value="الرياضيات">{t.math}</option>
              <option value="العلوم">{t.science}</option>
              <option value="اللغة العربية">{t.arabic}</option>
              <option value="اللغة الإنجليزية">{t.english}</option>
            </select>
          </div>

          {/* Enter Secret Code */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="secretCodeInput" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {lang === 'ar' ? "الرقم السري" : "Secret Code"}
            </label>
            <input
              id="secretCodeInput"
              type="text"
              className="form-input"
              style={{ padding: '8px 12px', minHeight: '44px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={secretCodeInput}
              onChange={(e) => setSecretCodeInput(e.target.value)}
              placeholder={lang === 'ar' ? "مثال: 608803" : "e.g. 608803"}
            />
          </div>

          {/* Enter Grade (out of 30) */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="secretGradeInput" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {lang === 'ar' ? "الدرجة (من ٣٠)" : "Grade (out of 30)"}
            </label>
            <input
              id="secretGradeInput"
              type="number"
              className="form-input"
              style={{ padding: '8px 12px', minHeight: '44px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={secretGradeInput}
              onChange={(e) => setSecretGradeInput(e.target.value)}
              min="0"
              max="30"
              placeholder="0 - 30"
            />
          </div>
        </div>

        <button
          type="button"
          className="btn-filled"
          onClick={handleSaveGrade}
          disabled={isSaving}
          style={{
            alignSelf: 'flex-end',
            padding: '12px 28px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            minHeight: '48px',
            borderRadius: 'var(--radius-button)',
            boxShadow: 'var(--shadow-md)',
            backgroundColor: 'var(--color-success)',
            color: '#ffffff',
            border: 'none',
            marginTop: '8px',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving 
            ? (lang === 'ar' ? "💾 جاري حفظ الدرجة..." : "💾 Saving Grade...") 
            : (lang === 'ar' ? "💾 رصد وحفظ الدرجة" : "💾 Save Grade")}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="table-actions no-print" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: lang === 'ar' ? '12px' : '36px', paddingRight: lang === 'ar' ? '36px' : '12px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
            placeholder={lang === 'ar' ? 'بحث باسم الطالب أو الكود أو الرقم السري...' : 'Search student, code, or secret number...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearch(e.target.value);
            }}
          />
          <span style={{ position: 'absolute', left: lang === 'ar' ? 'auto' : '12px', right: lang === 'ar' ? '12px' : 'auto', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>

        <select
          className="text-field"
          style={{ width: '180px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
          value={filters.class_id || 'all'}
          onChange={(e) => setFilters({ class_id: e.target.value })}
        >
          <option value="all">{lang === 'ar' ? 'جميع الصفوف' : 'All Classes'}</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {lang === 'ar' ? `${cls.grade} - ${cls.section}` : `${cls.gradeEn} - ${cls.sectionEn}`}
            </option>
          ))}
        </select>
      </div>

      {/* Final control sheet table grid */}
      <div>
        <PrintHeader
          title={t.gradesSheetTitle}
          subtitle={lang === 'ar' ? "كشف مطابقة الأرقام السرية" : "Secret Number Mapping Sheet"}
        />
        
        <div className="control-grade-table-container">
          <table className="control-grade-table">
            <thead>
              <tr>
                {isGradesEncrypted && (
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('secret_code')}>
                    {t.secretCode} {sort === 'secret_code' ? (direction === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                )}
                <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('id')}>
                  {lang === 'ar' ? 'رقم الطالب' : 'Student ID'} {sort === 'id' ? (direction === 'asc' ? '🔼' : '🔽') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange(lang === 'ar' ? 'name_ar' : 'name_en')}>
                  {t.studentName} {sort === (lang === 'ar' ? 'name_ar' : 'name_en') ? (direction === 'asc' ? '🔼' : '🔽') : ''}
                </th>
                <th>{lang === 'ar' ? 'صف الطالب' : 'Student Class'}</th>
              </tr>
            </thead>
            <tbody>
              {grades.length > 0 ? (
                grades.map((row) => {
                  const studentClass = lang === 'ar' ? row.class_name_ar : row.class_name_en;
                  return (
                    <tr key={row.studentId}>
                      {isGradesEncrypted && (
                        <td className="secret-code-cell">{row.secretCode}</td>
                      )}
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{row.studentId}</td>
                      <td style={{ fontWeight: '600' }}>
                        <span className={isGradesEncrypted ? 'encrypted-text' : ''}>
                          {lang === 'ar' ? row.name : row.nameEn}
                        </span>
                      </td>
                      <td>{studentClass}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isGradesEncrypted ? 4 : 3} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '32px' }}>
                        {search ? "🔍" : (filters.class_id && filters.class_id !== 'all') ? "ℹ️" : "📂"}
                      </span>
                      <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                        {search 
                          ? (lang === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matching search results found')
                          : (filters.class_id && filters.class_id !== 'all')
                            ? (lang === 'ar' ? 'لا توجد نتائج تطابق التصفية المحددة' : 'No matching filter results found')
                            : (lang === 'ar' ? 'لا توجد درجات مرصودة حالياً' : 'No grades recorded yet')
                        }
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {search 
                          ? (lang === 'ar' ? 'جرب البحث بكلمة مفتاحية مختلفة' : 'Try searching for a different keyword')
                          : (filters.class_id && filters.class_id !== 'all')
                            ? (lang === 'ar' ? 'جرب تغيير خيارات التصفية' : 'Try changing your filter selections')
                            : (lang === 'ar' ? 'لم يتم إضافة أي بيانات بعد' : 'No records have been added yet')
                        }
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationBar
        page={page}
        lastPage={controlPagination?.lastPage || 1}
        total={controlPagination?.total || 0}
        from={controlPagination?.from}
        to={controlPagination?.to}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        loading={settingsLoading}
        lang={lang}
      />
    </div>
  );
}
