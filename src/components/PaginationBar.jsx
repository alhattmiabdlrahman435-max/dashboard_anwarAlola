/**
 * PaginationBar — Full-featured pagination control
 *
 * Features:
 * - First / Previous / Page Numbers (max 7 visible, with ellipsis) / Next / Last
 * - Rows Per Page selector: 10 | 20 | 50 | 100 (default 20)
 * - Total records display: "Showing 21–40 of 1,247 records"
 * - Retry button when error prop is truthy
 * - RTL-aware (Arabic / English)
 * - Disabled states for boundary pages
 */

import React from 'react';
import { ALLOWED_PER_PAGE } from '../hooks/usePagination';

/**
 * Build the list of page buttons to render (max 7 numbered buttons + ellipsis).
 * Always shows first and last page.
 * Shows a window of 5 pages centered on current page.
 * Inserts '...' for gaps > 1 page.
 *
 * Examples (lastPage=58, current=17):
 *   [1, '...', 15, 16, 17, 18, 19, '...', 58]
 */
function buildPageRange(page, lastPage) {
  if (lastPage <= 1) return [1];
  if (lastPage <= 9) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const items = [];
  // Window: current ± 2 (5 pages centered on current)
  const windowStart = Math.max(2, page - 2);
  const windowEnd   = Math.min(lastPage - 1, page + 2);

  // First page always
  items.push(1);

  // Left ellipsis
  if (windowStart > 2) {
    items.push('...');
  } else if (windowStart === 2) {
    items.push(2);
  }

  // Window pages (exclude 1 and lastPage — handled separately)
  for (let p = Math.max(windowStart, 2); p <= Math.min(windowEnd, lastPage - 1); p++) {
    if (!items.includes(p)) items.push(p);
  }

  // Right ellipsis
  if (windowEnd < lastPage - 1) {
    items.push('...');
  } else if (windowEnd === lastPage - 1) {
    if (!items.includes(lastPage - 1)) items.push(lastPage - 1);
  }

  // Last page always
  items.push(lastPage);

  return items;
}

/**
 * @param {object} props
 * @param {number}   props.page            - current page (1-indexed)
 * @param {number}   props.lastPage        - total pages
 * @param {number}   props.total           - total records
 * @param {number}   [props.from]          - first record index on this page
 * @param {number}   [props.to]            - last record index on this page
 * @param {number}   props.perPage         - currently selected rows per page
 * @param {function} props.onPageChange    - (page: number) => void
 * @param {function} props.onPerPageChange - (perPage: number) => void
 * @param {boolean}  [props.loading]       - show skeleton / disable buttons
 * @param {Error}    [props.error]         - if truthy, show retry button
 * @param {function} [props.onRetry]       - called when retry is clicked
 * @param {string}   [props.lang]          - 'ar' | 'en'
 */
export default function PaginationBar({
  page,
  lastPage,
  total,
  from,
  to,
  perPage,
  onPageChange,
  onPerPageChange,
  loading = false,
  error = null,
  onRetry,
  lang = 'ar',
}) {
  const isRtl = lang === 'ar';
  const isFirst = page <= 1;
  const isLast  = page >= lastPage;

  const pageItems = buildPageRange(page, lastPage || 1);

  // Labels
  const labels = {
    ar: {
      first: '«',
      prev:  '‹',
      next:  '›',
      last:  '»',
      rows:  'عدد الصفوف:',
      showing: (f, t, total) => `عرض ${f}–${t} من ${total.toLocaleString('ar-SA')} سجل`,
      retry:   'إعادة المحاولة',
      error:   'فشل التحميل.',
    },
    en: {
      first: '«',
      prev:  '‹',
      next:  '›',
      last:  '»',
      rows:  'Rows:',
      showing: (f, t, total) => `Showing ${f}–${t} of ${total.toLocaleString()} records`,
      retry:   'Retry',
      error:   'Failed to load.',
    },
  };
  const L = labels[lang] || labels.en;

  // ── Styles (inline, no external CSS dependency) ──
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '12px 0',
    direction: isRtl ? 'rtl' : 'ltr',
    fontSize: '13px',
  };

  const groupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  };

  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '32px',
    padding: '0 8px',
    borderRadius: '6px',
    border: '1px solid var(--color-border, #e2e8f0)',
    background: 'var(--color-surface, #ffffff)',
    color: 'var(--color-text, #1e293b)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px',
    transition: 'background 0.15s, border-color 0.15s',
    lineHeight: 1,
  };

  const btnActive = {
    ...btnBase,
    background: 'var(--color-primary-ui, #4f46e5)',
    borderColor: 'var(--color-primary-ui, #4f46e5)',
    color: '#ffffff',
    fontWeight: '700',
  };

  const btnDisabled = {
    ...btnBase,
    opacity: 0.35,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  };

  const btnNavStyle = (disabled) => (disabled || loading ? btnDisabled : btnBase);

  const selectStyle = {
    height: '32px',
    padding: '0 8px',
    borderRadius: '6px',
    border: '1px solid var(--color-border, #e2e8f0)',
    background: 'var(--color-surface, #ffffff)',
    color: 'var(--color-text, #1e293b)',
    fontSize: '13px',
    cursor: 'pointer',
  };

  const infoStyle = {
    color: 'var(--color-text-secondary, #64748b)',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  };

  const errorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-danger, #ef4444)',
    fontSize: '13px',
  };

  const retryBtnStyle = {
    ...btnBase,
    borderColor: 'var(--color-danger, #ef4444)',
    color: 'var(--color-danger, #ef4444)',
    padding: '0 10px',
    fontSize: '12px',
  };

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <span>{L.error}</span>
          {onRetry && (
            <button style={retryBtnStyle} onClick={onRetry}>
              {L.retry}
            </button>
          )}
        </div>
      </div>
    );
  }

  const showingText =
    total > 0 && from != null && to != null
      ? L.showing(from, to, total)
      : null;

  return (
    <div style={containerStyle}>
      {/* ── Left: records info ── */}
      <div style={groupStyle}>
        {showingText && <span style={infoStyle}>{showingText}</span>}
      </div>

      {/* ── Center: page buttons ── */}
      <div style={groupStyle}>
        {/* First */}
        <button
          style={btnNavStyle(isFirst)}
          onClick={() => !isFirst && onPageChange(1)}
          aria-label={lang === 'ar' ? 'أول صفحة' : 'First page'}
          disabled={isFirst || loading}
        >
          {isRtl ? L.last : L.first}
        </button>

        {/* Previous */}
        <button
          style={btnNavStyle(isFirst)}
          onClick={() => !isFirst && onPageChange(page - 1)}
          aria-label={lang === 'ar' ? 'الصفحة السابقة' : 'Previous page'}
          disabled={isFirst || loading}
        >
          {isRtl ? L.next : L.prev}
        </button>

        {/* Page numbers */}
        {pageItems.map((item, idx) =>
          item === '...' ? (
            <span key={`ellipsis-${idx}`} style={{ ...btnBase, cursor: 'default', borderColor: 'transparent', background: 'transparent' }}>
              …
            </span>
          ) : (
            <button
              key={item}
              style={item === page ? btnActive : (loading ? btnDisabled : btnBase)}
              onClick={() => item !== page && onPageChange(item)}
              aria-label={`${lang === 'ar' ? 'صفحة' : 'Page'} ${item}`}
              aria-current={item === page ? 'page' : undefined}
              disabled={loading}
            >
              {item}
            </button>
          )
        )}

        {/* Next */}
        <button
          style={btnNavStyle(isLast)}
          onClick={() => !isLast && onPageChange(page + 1)}
          aria-label={lang === 'ar' ? 'الصفحة التالية' : 'Next page'}
          disabled={isLast || loading}
        >
          {isRtl ? L.prev : L.next}
        </button>

        {/* Last */}
        <button
          style={btnNavStyle(isLast)}
          onClick={() => !isLast && onPageChange(lastPage)}
          aria-label={lang === 'ar' ? 'آخر صفحة' : 'Last page'}
          disabled={isLast || loading}
        >
          {isRtl ? L.first : L.last}
        </button>
      </div>

      {/* ── Right: rows per page ── */}
      <div style={groupStyle}>
        <label htmlFor="paginationbar-perpage" style={infoStyle}>{L.rows}</label>
        <select
          id="paginationbar-perpage"
          style={selectStyle}
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          disabled={loading}
        >
          {ALLOWED_PER_PAGE.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
