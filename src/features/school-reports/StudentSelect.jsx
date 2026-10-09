import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Search, X, Check, User, ChevronDown } from 'lucide-react';

const StudentSelect = memo(function StudentSelect({
  students = [],
  value = '',
  onChange,
  placeholder,
  required = false,
  disabled = false,
  loading = false,
  lang = 'ar',
}) {
  const ar = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selectedStudent = useMemo(() => {
    if (!value) return null;
    return students.find(s => String(s.id) === String(value)) || null;
  }, [students, value]);

  // Filter options based on search query
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const q = searchTerm.trim().toLowerCase();
    return students.filter(s => {
      const nameAr = (s.name_ar || '').toLowerCase();
      const nameEn = (s.name_en || '').toLowerCase();
      const code = (s.student_code || '').toLowerCase();
      return nameAr.includes(q) || nameEn.includes(q) || code.includes(q);
    });
  }, [students, searchTerm]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightIndex(0);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIndex, isOpen]);

  const handleSelect = (id) => {
    onChange(id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalCount = (!required ? 1 : 0) + filteredStudents.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev + 1) % Math.max(1, totalCount));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev - 1 + totalCount) % Math.max(1, totalCount));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!required && highlightIndex === 0) {
        handleSelect('');
      } else {
        const studentIdx = !required ? highlightIndex - 1 : highlightIndex;
        if (filteredStudents[studentIdx]) {
          handleSelect(filteredStudents[studentIdx].id);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`sr-student-select ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      dir={ar ? 'rtl' : 'ltr'}
    >
      <button
        type="button"
        className="sr-student-trigger"
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="sr-student-trigger-content">
          <User size={15} className="sr-student-icon" />
          {loading ? (
            <span className="sr-student-loading">{ar ? 'جارٍ تحميل الطلاب…' : 'Loading students…'}</span>
          ) : selectedStudent ? (
            <span className="sr-student-selected-label">
              <strong>{ar ? selectedStudent.name_ar : (selectedStudent.name_en || selectedStudent.name_ar)}</strong>
              {selectedStudent.student_code && (
                <span className="sr-student-code-badge">{selectedStudent.student_code}</span>
              )}
            </span>
          ) : (
            <span className="sr-student-placeholder">
              {placeholder || (ar ? (required ? 'اختر الطالب…' : 'جميع الطلاب (بحث بالاسم)') : (required ? 'Select student…' : 'All students (search)'))}
            </span>
          )}
        </div>

        <div className="sr-student-trigger-actions">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              className="sr-student-clear-btn"
              onClick={handleClear}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClear(e); }}
              title={ar ? 'مسح الاختيار' : 'Clear selection'}
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={15} className={`sr-student-chevron ${isOpen ? 'is-rotated' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="sr-student-dropdown">
          <div className="sr-student-search-box">
            <Search size={14} className="sr-student-search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="sr-student-search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightIndex(0);
              }}
              placeholder={ar ? 'ابحث باسم الطالب أو الرقم المدرسي…' : 'Search by name or code…'}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                className="sr-student-search-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm('');
                  inputRef.current?.focus();
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="sr-student-list" ref={listRef} role="listbox">
            {!required && !searchTerm && (
              <div
                role="option"
                aria-selected={!value}
                className={`sr-student-option ${!value ? 'is-selected' : ''} ${highlightIndex === 0 ? 'is-highlighted' : ''}`}
                onClick={() => handleSelect('')}
              >
                <span className="sr-student-option-name">{ar ? 'جميع طلاب النطاق' : 'All students in scope'}</span>
                {!value && <Check size={14} className="sr-student-check" />}
              </div>
            )}

            {filteredStudents.length === 0 ? (
              <div className="sr-student-no-results">
                {ar ? 'لا يوجد طالب مطابق للبحث' : 'No matching student found'}
              </div>
            ) : (
              filteredStudents.map((s, idx) => {
                const isSelected = String(s.id) === String(value);
                const currentIdx = !required && !searchTerm ? idx + 1 : idx;
                const isHighlighted = highlightIndex === currentIdx;

                return (
                  <div
                    key={s.id}
                    role="option"
                    aria-selected={isSelected}
                    className={`sr-student-option ${isSelected ? 'is-selected' : ''} ${isHighlighted ? 'is-highlighted' : ''}`}
                    onClick={() => handleSelect(s.id)}
                    onMouseEnter={() => setHighlightIndex(currentIdx)}
                  >
                    <div className="sr-student-option-info">
                      <span className="sr-student-option-name">
                        {ar ? s.name_ar : (s.name_en || s.name_ar)}
                      </span>
                      {s.student_code && (
                        <span className="sr-student-option-code">{s.student_code}</span>
                      )}
                    </div>
                    {isSelected && <Check size={14} className="sr-student-check" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default StudentSelect;
