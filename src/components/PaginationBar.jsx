/**
 * PaginationBar — Full-featured pagination control
 *
 * Features:
 * - First / Previous / Page Numbers (max 7 visible, with ellipsis) / Next / Last
 * - Lucide SVG icons for crisp directional rendering without text Bidi mirroring flips
 * - Rows Per Page selector: 10 | 20 | 50 | 100 (default 20)
 * - Total records display: "Showing 21–40 of 1,247 records"
 * - RTL-aware (Arabic / English)
 * - Premium modern design with smooth hover and active states
 */

import React from 'react';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { ALLOWED_PER_PAGE } from '../hooks/usePagination';

/**
 * Build the list of page buttons to render (max 7 numbered buttons + ellipsis).
 */
function buildPageRange(page, lastPage) {
  if (lastPage <= 1) return [1];
  if (lastPage <= 9) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const items = [];
  const windowStart = Math.max(2, page - 2);
  const windowEnd   = Math.min(lastPage - 1, page + 2);

  items.push(1);

  if (windowStart > 2) {
    items.push('...');
  } else if (windowStart === 2) {
    items.push(2);
  }

  for (let p = Math.max(windowStart, 2); p <= Math.min(windowEnd, lastPage - 1); p++) {
    if (!items.includes(p)) items.push(p);
  }

  if (windowEnd < lastPage - 1) {
    items.push('...');
  } else if (windowEnd === lastPage - 1) {
    if (!items.includes(lastPage - 1)) items.push(lastPage - 1);
  }

  items.push(lastPage);

  return items;
}

export default function PaginationBar({
  page: propPage,
  lastPage: propLastPage,
  total: propTotal,
  from: propFrom,
  to: propTo,
  perPage: propPerPage,
  pagination,
  onPageChange,
  onPerPageChange,
  loading = false,
  error = null,
  onRetry,
  lang = 'ar',
}) {
  const page = Math.max(1, Number(propPage ?? pagination?.currentPage ?? pagination?.page ?? 1) || 1);
  const lastPage = Math.max(1, Number(propLastPage ?? pagination?.lastPage ?? 1) || 1);
  const total = Math.max(0, Number(propTotal ?? pagination?.total ?? 0) || 0);
  const perPage = Math.max(1, Number(propPerPage ?? pagination?.perPage ?? 20) || 20);
  const from = Number(propFrom ?? pagination?.from ?? ((page - 1) * perPage + 1)) || 1;
  const to = Number(propTo ?? pagination?.to ?? Math.min(from + perPage - 1, total)) || total;

  const isRtl = lang === 'ar';
  const isFirst = page <= 1;
  const isLast  = page >= lastPage;

  const pageItems = buildPageRange(page, lastPage || 1);

  // Labels
  const labels = {
    ar: {
      first: 'الصفحة الأولى',
      prev:  'الصفحة السابقة',
      next:  'الصفحة التالية',
      last:  'الصفحة الأخيرة',
      rows:  'عدد الصفوف:',
      showing: (f, t, total) => `عرض ${f}–${t} من ${total.toLocaleString('ar-SA')} سجل`,
      retry:   'إعادة المحاولة',
      error:   'فشل التحميل.',
    },
    en: {
      first: 'First page',
      prev:  'Previous page',
      next:  'Next page',
      last:  'Last page',
      rows:  'Rows:',
      showing: (f, t, total) => `Showing ${f}–${t} of ${total.toLocaleString()} records`,
      retry:   'Retry',
      error:   'Failed to load.',
    },
  };
  const L = labels[lang] || labels.en;

  // Inline styling tokens for premium appearance
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '16px 4px',
    direction: isRtl ? 'rtl' : 'ltr',
    fontSize: '13px',
    userSelect: 'none',
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
    minWidth: '36px',
    height: '36px',
    padding: '0 8px',
    borderRadius: '10px',
    border: '1px solid var(--color-border, #e2e8f0)',
    background: 'var(--color-surface, #ffffff)',
    color: 'var(--color-text, #1e293b)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    lineHeight: 1,
  };

  const btnActive = {
    ...btnBase,
    background: 'var(--color-primary-ui, #1E508E)',
    borderColor: 'var(--color-primary-ui, #1E508E)',
    color: '#ffffff',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(30, 80, 142, 0.28)',
  };

  const btnDisabled = {
    ...btnBase,
    opacity: 0.35,
    cursor: 'not-allowed',
    pointerEvents: 'none',
    boxShadow: 'none',
    background: 'var(--color-surface-hover, #f8fafc)',
  };

  const btnNavStyle = (disabled) => (disabled || loading ? btnDisabled : btnBase);

  const selectStyle = {
    height: '36px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1px solid var(--color-border, #e2e8f0)',
    background: 'var(--color-surface, #ffffff)',
    color: 'var(--color-text, #1e293b)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    outline: 'none',
  };

  const infoStyle = {
    color: 'var(--color-text-secondary, #64748b)',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  };

  const errorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-danger, #ef4444)',
    fontSize: '13px',
    fontWeight: '600',
  };

  const retryBtnStyle = {
    ...btnBase,
    borderColor: 'var(--color-danger, #ef4444)',
    color: 'var(--color-danger, #ef4444)',
    padding: '0 12px',
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

  /**
   * Directional Icon Assignments:
   *
   * In RTL (Arabic):
   * - Buttons on the RIGHT of numbers (First & Prev) MUST point RIGHT (ChevronsRight & ChevronRight).
   * - Buttons on the LEFT of numbers (Next & Last) MUST point LEFT (ChevronLeft & ChevronsLeft).
   *
   * In LTR (English):
   * - Buttons on the LEFT of numbers (First & Prev) point LEFT (ChevronsLeft & ChevronLeft).
   * - Buttons on the RIGHT of numbers (Next & Last) point RIGHT (ChevronRight & ChevronsRight).
   */
  const FirstIcon = isRtl ? ChevronsRight : ChevronsLeft;
  const PrevIcon  = isRtl ? ChevronRight  : ChevronLeft;
  const NextIcon  = isRtl ? ChevronLeft   : ChevronRight;
  const LastIcon  = isRtl ? ChevronsLeft  : ChevronsRight;

  return (
    <div style={containerStyle} className="pagination-bar-container">
      {/* ── Left: records info ── */}
      <div style={groupStyle}>
        {showingText && <span style={infoStyle}>{showingText}</span>}
      </div>

      {/* ── Center: page buttons ── */}
      <div style={groupStyle} className="pagination-buttons-group">
        {/* First Page Button */}
        <button
          type="button"
          style={btnNavStyle(isFirst)}
          onClick={() => !isFirst && onPageChange(1)}
          aria-label={L.first}
          title={L.first}
          disabled={isFirst || loading}
        >
          <FirstIcon size={18} strokeWidth={2.2} />
        </button>

        {/* Previous Page Button */}
        <button
          type="button"
          style={btnNavStyle(isFirst)}
          onClick={() => !isFirst && onPageChange(page - 1)}
          aria-label={L.prev}
          title={L.prev}
          disabled={isFirst || loading}
        >
          <PrevIcon size={18} strokeWidth={2.2} />
        </button>

        {/* Page numbers */}
        {pageItems.map((item, idx) =>
          item === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              style={{
                ...btnBase,
                cursor: 'default',
                borderColor: 'transparent',
                background: 'transparent',
                boxShadow: 'none',
                color: 'var(--color-text-secondary, #94a3b8)',
              }}
            >
              …
            </span>
          ) : (
            <button
              type="button"
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

        {/* Next Page Button */}
        <button
          type="button"
          style={btnNavStyle(isLast)}
          onClick={() => !isLast && onPageChange(page + 1)}
          aria-label={L.next}
          title={L.next}
          disabled={isLast || loading}
        >
          <NextIcon size={18} strokeWidth={2.2} />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          style={btnNavStyle(isLast)}
          onClick={() => !isLast && onPageChange(lastPage)}
          aria-label={L.last}
          title={L.last}
          disabled={isLast || loading}
        >
          <LastIcon size={18} strokeWidth={2.2} />
        </button>
      </div>

      {/* ── Right: rows per page ── */}
      <div style={groupStyle}>
        <label htmlFor="paginationbar-perpage" style={infoStyle}>{L.rows}</label>
        <select
          id="paginationbar-perpage"
          name="per_page"
          style={selectStyle}
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          disabled={loading}
          aria-label={L.rows}
        >
          {ALLOWED_PER_PAGE.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
