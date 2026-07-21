/**
 * usePagination — Per-module pagination state manager
 *
 * Features:
 * - URL sync via React Router useSearchParams (Back/Forward supported natively)
 * - sessionStorage persistence of page + perPage (survives tab switches)
 * - 300ms debounced search with automatic cancellation of pending timers
 * - Auto-reset to page 1 on search / filter / sort / perPage change
 * - CRUD helpers: buildQueryString, goToPrevIfEmpty
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export const ALLOWED_PER_PAGE = [10, 20, 50, 100];
export const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

function clampPerPage(value) {
  const n = parseInt(value, 10);
  if (isNaN(n) || !ALLOWED_PER_PAGE.includes(n)) return DEFAULT_PER_PAGE;
  return Math.min(n, MAX_PER_PAGE);
}

const SESSION_KEY = (moduleKey) => `pg_${moduleKey}`;

function readSession(moduleKey) {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY(moduleKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      page: parseInt(parsed.page, 10) || 1,
      perPage: clampPerPage(parsed.perPage),
    };
  } catch {
    return null;
  }
}

function writeSession(moduleKey, page, perPage) {
  try {
    sessionStorage.setItem(SESSION_KEY(moduleKey), JSON.stringify({ page, perPage }));
  } catch { /* ignore quota errors */ }
}

/** Call on logout to clear all pagination caches */
export function clearAllPaginationCache() {
  try {
    const toRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('pg_')) toRemove.push(key);
    }
    toRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch { /* ignore */ }
}

/**
 * @param {object} opts
 * @param {string}  opts.moduleKey      - unique key (e.g. 'students')
 * @param {object}  [opts.defaultFilters] - initial filter values e.g. { class_id: '', status: '' }
 * @param {number}  [opts.defaultPerPage] - default rows/page (default: 20)
 */
export function usePagination({ moduleKey, defaultFilters = {}, defaultPerPage = DEFAULT_PER_PAGE }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Derive initial state from URL (primary) or sessionStorage (fallback) ──
  const getInitial = () => {
    const urlPage = parseInt(searchParams.get('page'), 10);
    const urlPerPage = searchParams.get('per_page');
    const hasUrlState = !isNaN(urlPage) && urlPage > 0;

    if (hasUrlState) {
      const urlFilters = { ...defaultFilters };
      Object.keys(defaultFilters).forEach((k) => {
        const v = searchParams.get(k);
        if (v !== null) urlFilters[k] = v;
      });
      return {
        page: Math.max(1, urlPage),
        perPage: clampPerPage(urlPerPage || String(defaultPerPage)),
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || '',
        direction: searchParams.get('direction') || 'desc',
        filters: urlFilters,
      };
    }

    const session = readSession(moduleKey);
    return {
      page: session?.page || 1,
      perPage: session?.perPage || clampPerPage(String(defaultPerPage)),
      search: '',
      sort: '',
      direction: 'desc',
      filters: { ...defaultFilters },
    };
  };

  const init = getInitial(); // computed once on mount

  const [page, _setPage]         = useState(init.page);
  const [perPage, _setPerPage]   = useState(init.perPage);
  const [search, _setSearch]     = useState(init.search);
  const [sort, _setSort]         = useState(init.sort);
  const [direction, _setDir]     = useState(init.direction);
  const [filters, _setFilters]   = useState(init.filters);

  // Pagination metadata returned from API
  const [pagination, setPagination] = useState({
    total: 0,
    lastPage: 1,
    from: 0,
    to: 0,
    currentPage: init.page,
  });

  const debounceRef = useRef(null);

  // ── Stable ref: always holds latest state without causing dep churn ──
  const stateRef = useRef({ page, perPage, search, sort, direction, filters, defaultPerPage });
  useEffect(() => {
    stateRef.current = { page, perPage, search, sort, direction, filters, defaultPerPage };
  }); // no deps — runs after every render to stay current

  // ── Sync sessionStorage whenever page / perPage change ──
  useEffect(() => {
    writeSession(moduleKey, page, perPage);
  }, [moduleKey, page, perPage]);

  // ── Re-sync local state when URL changes (Back / Forward navigation) ──
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page'), 10);
    if (!isNaN(urlPage) && urlPage > 0 && urlPage !== stateRef.current.page) {
      _setPage(urlPage);
    }

    const urlPP = clampPerPage(searchParams.get('per_page') || String(stateRef.current.perPage));
    if (urlPP !== stateRef.current.perPage) _setPerPage(urlPP);

    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== stateRef.current.search) _setSearch(urlSearch);

    const urlSort = searchParams.get('sort') || '';
    if (urlSort !== stateRef.current.sort) _setSort(urlSort);

    const urlDir = searchParams.get('direction') || 'desc';
    if (urlDir !== stateRef.current.direction) _setDir(urlDir);

    // ── FIX: also sync filters from URL (was missing before) ──
    const currentFilters = stateRef.current.filters;
    const newFilters = { ...currentFilters };
    let filtersChanged = false;
    Object.keys(defaultFilters).forEach((k) => {
      const v = searchParams.get(k) ?? '';
      if (v !== (currentFilters[k] ?? '')) {
        newFilters[k] = v;
        filtersChanged = true;
      }
    });
    if (filtersChanged) _setFilters(newFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // only re-run when URL actually changes

  // ── Internal: push state to URL (stable — uses ref, not state deps) ──
  const pushToUrl = useCallback(
    (state) => {
      const { defaultPerPage: dp } = stateRef.current;
      const params = new URLSearchParams();
      if (state.page > 1) params.set('page', String(state.page));
      if (state.perPage !== dp) params.set('per_page', String(state.perPage));
      if (state.search) params.set('search', state.search);
      if (state.sort) params.set('sort', state.sort);
      if (state.direction && state.direction !== 'desc') params.set('direction', state.direction);
      Object.entries(state.filters || {}).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '' && v !== 'all') params.set(k, String(v));
      });

      setSearchParams(params, { replace: true });
    },
    [setSearchParams] // stable — setSearchParams from react-router never changes
  );

  // ── Public setters — all stable (ref-based, no state in deps) ──

  const setPage = useCallback(
    (newPage) => {
      const validPage = Math.max(1, parseInt(newPage, 10) || 1);
      _setPage(validPage);
      const s = stateRef.current;
      pushToUrl({ page: validPage, perPage: s.perPage, search: s.search, sort: s.sort, direction: s.direction, filters: s.filters });
    },
    [pushToUrl]
  );

  const setPerPage = useCallback(
    (newPerPage) => {
      const clamped = clampPerPage(String(newPerPage));
      _setPerPage(clamped);
      _setPage(1);
      const s = stateRef.current;
      pushToUrl({ page: 1, perPage: clamped, search: s.search, sort: s.sort, direction: s.direction, filters: s.filters });
    },
    [pushToUrl]
  );

  const setSort = useCallback(
    (newSort, newDir = 'desc') => {
      _setSort(newSort);
      _setDir(newDir);
      _setPage(1);
      const s = stateRef.current;
      pushToUrl({ page: 1, perPage: s.perPage, search: s.search, sort: newSort, direction: newDir, filters: s.filters });
    },
    [pushToUrl]
  );

  const setFilters = useCallback(
    (newFilters) => {
      const s = stateRef.current;
      const merged = { ...s.filters, ...newFilters };
      _setFilters(merged);
      _setPage(1);
      pushToUrl({ page: 1, perPage: s.perPage, search: s.search, sort: s.sort, direction: s.direction, filters: merged });
    },
    [pushToUrl]
  );

  /** Debounced search — cancels previous timer before scheduling next */
  const setSearch = useCallback(
    (newSearch) => {
      _setSearch(newSearch);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        _setPage(1);
        const s = stateRef.current;
        pushToUrl({ page: 1, perPage: s.perPage, search: newSearch, sort: s.sort, direction: s.direction, filters: s.filters });
      }, 300);
    },
    [pushToUrl]
  );

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // ── Query string builder for API calls ──
  // NOTE: Must keep state in deps so `const qs = buildQueryString()` returns
  // a new string value (and triggers useEffect) whenever state changes.
  const buildQueryString = useCallback(
    (overrides = {}) => {
      const s = { page, perPage, search, sort, direction, filters, ...overrides };
      const params = new URLSearchParams();
      params.set('page', String(s.page));
      params.set('per_page', String(s.perPage));
      if (s.search) params.set('search', s.search);
      if (s.sort) params.set('sort', s.sort);
      if (s.direction) params.set('direction', s.direction);
      Object.entries(s.filters || {}).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '' && v !== 'all') params.set(k, String(v));
      });
      return '?' + params.toString();
    },
    [page, perPage, search, sort, direction, filters]
  );


  /**
   * After delete: if itemsOnCurrentPage === 0 AND page > 1, decrement page.
   * Returns the query string for the next fetch.
   */
  const goToPrevIfEmpty = useCallback(
    (itemsOnCurrentPage) => {
      if (itemsOnCurrentPage === 0 && stateRef.current.page > 1) {
        const prev = stateRef.current.page - 1;
        _setPage(prev);
        const s = stateRef.current;
        pushToUrl({ page: prev, perPage: s.perPage, search: s.search, sort: s.sort, direction: s.direction, filters: s.filters });
        return buildQueryString({ page: prev });
      }
      return buildQueryString();
    },
    [buildQueryString, pushToUrl]
  );

  return {
    // State
    page, perPage, search, sort, direction, filters,
    pagination, setPagination,
    // Setters
    setPage, setPerPage, setSort, setSearch, setFilters,
    // Helpers
    buildQueryString,
    goToPrevIfEmpty,
  };
}
