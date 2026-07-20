/**
 * usePaginatedFetch — Generic paginated API data fetcher
 *
 * Features:
 * - AbortController: cancels in-flight requests on new fetch or unmount
 * - Request ID guard: stale responses can never overwrite newer state
 * - Cancelled responses are completely ignored
 * - error state + retry() re-runs last request without page reload
 * - Extracts pagination metadata from Laravel paginator response
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * @param {object} opts
 * @param {(queryString: string, signal: AbortSignal) => Promise} opts.fetchFn
 *   The service call. Must accept a queryString and an AbortSignal.
 * @param {string}   opts.dataKey      - key in the API response containing the array (e.g. 'students')
 * @param {function} [opts.mapFn]      - optional: (rawItem) => mappedItem
 * @param {function} [opts.onSuccess]  - optional: (data, meta) => void (e.g. to update a provider)
 */
export function usePaginatedFetch({ fetchFn, dataKey, mapFn, onSuccess }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [meta, setMeta]       = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    from: 0,
    to: 0,
  });

  // Request sequencing — ensures stale responses are dropped
  const reqIdRef   = useRef(0);
  // AbortController for the in-flight request
  const abortRef   = useRef(null);
  // Store last query string for retry
  const lastQsRef  = useRef('?page=1&per_page=20');

  const fetchPage = useCallback(
    async (queryString) => {
      // ── Cancel any in-flight request ──
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      // ── Increment request ID ──
      const reqId = ++reqIdRef.current;
      lastQsRef.current = queryString;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchFn(queryString, controller.signal);

        // ── Guard: if aborted, ignore completely ──
        if (controller.signal.aborted) return;

        // ── Guard: if a newer request has started, ignore this response ──
        if (reqId !== reqIdRef.current) return;

        if (!response.success) {
          throw new Error(response.message || 'Request failed');
        }

        // ── Extract data array ──
        const rawItems = response[dataKey] || [];
        const mapped = mapFn ? rawItems.map(mapFn) : rawItems;

        // ── Extract Laravel paginator metadata ──
        // Laravel paginate() returns: current_page, last_page, per_page, total, from, to
        const pagination = response.pagination || response.meta || {};
        const extractedMeta = {
          total:       pagination.total       ?? response.total       ?? rawItems.length,
          currentPage: pagination.current_page ?? response.current_page ?? 1,
          lastPage:    pagination.last_page    ?? response.last_page    ?? 1,
          perPage:     pagination.per_page     ?? response.per_page     ?? rawItems.length,
          from:        pagination.from         ?? response.from         ?? 1,
          to:          pagination.to           ?? response.to           ?? rawItems.length,
        };

        setData(mapped);
        setMeta(extractedMeta);

        if (onSuccess) onSuccess(mapped, extractedMeta);
      } catch (err) {
        // ── Ignore abort errors — they are intentional cancellations ──
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        if (reqId !== reqIdRef.current) return;

        setError(err);
      } finally {
        // ── Only clear loading if this is still the active request ──
        if (reqId === reqIdRef.current) {
          setLoading(false);
          abortRef.current = null;
        }
      }
    },
    [fetchFn, dataKey, mapFn, onSuccess]
  );

  // Cancel requests on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  /** Re-run the last failed request (no page reload needed) */
  const retry = useCallback(() => {
    fetchPage(lastQsRef.current);
  }, [fetchPage]);

  return { data, loading, error, meta, fetchPage, retry };
}
