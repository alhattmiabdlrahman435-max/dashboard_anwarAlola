import { useEffect, useRef, useState, useCallback } from 'react';
import { Printer, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { PRINT_PREVIEW_EVENT } from '../utils/printPreview';

/**
 * Global Full-Screen Print Preview Modal
 * - Automatically scales the page to fit any viewport (mobile, split-screen, desktop)
 *   so no part of the sheet is ever clipped or hidden.
 * - Supports double-click (anywhere on the sheet) or toolbar toggle to zoom in/out.
 * - Provides a Print button at the top and preserves crisp unscaled @page printing.
 */
export default function GlobalPrintPreviewModal() {
  const [payload, setPayload] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [containerWidth, setContainerWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [contentSize, setContentSize] = useState({ width: 794, height: 1123 });

  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const onOpen = (e) => {
      const detail = e?.detail;
      if (!detail || !detail.html) return;
      const defaultWidth = detail.widthPx || (detail.landscape ? 1122 : 794);
      setContentSize({ width: defaultWidth, height: detail.landscape ? 794 : 1123 });
      setIsZoomed(false);
      setPayload(detail);
    };
    window.addEventListener(PRINT_PREVIEW_EVENT, onOpen);
    return () => window.removeEventListener(PRINT_PREVIEW_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!payload) return;
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      setContainerWidth(el.clientWidth || window.innerWidth);
    };
    updateWidth();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateWidth);
      ro.observe(el);
    }
    window.addEventListener('resize', updateWidth);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, [payload]);

  const measureIframeContent = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.body) return;

      // Inject double-click zoom toggle inside iframe document
      if (!doc.body.dataset.dblclickBound) {
        doc.body.dataset.dblclickBound = '1';
        doc.body.style.cursor = 'zoom-in';
        doc.addEventListener('dblclick', () => {
          window.dispatchEvent(new CustomEvent('app:toggle-print-preview-zoom'));
        });
      }

      const baseWidth = payload?.widthPx || (payload?.landscape ? 1122 : 794);
      const measuredW = Math.max(baseWidth, doc.documentElement.scrollWidth || 0, doc.body.scrollWidth || 0);
      const measuredH = Math.max(600, doc.documentElement.scrollHeight || 0, doc.body.scrollHeight || 0);
      setContentSize({ width: measuredW, height: measuredH });
    } catch {
      // Ignore cross-frame measurement issues
    }
  }, [payload]);

  useEffect(() => {
    const onToggleZoom = () => setIsZoomed((z) => !z);
    window.addEventListener('app:toggle-print-preview-zoom', onToggleZoom);
    return () => window.removeEventListener('app:toggle-print-preview-zoom', onToggleZoom);
  }, []);

  useEffect(() => {
    if (!payload) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setPayload(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [payload]);

  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  if (!payload) return null;

  const availableW = Math.max(260, containerWidth - 28);
  const fitScale = Math.min(1, availableW / Math.max(1, contentSize.width));
  const activeScale = isZoomed ? Math.max(1.25, fitScale * 1.45) : fitScale;
  const scaledWidth = Math.ceil(contentSize.width * activeScale);
  const scaledHeight = Math.ceil(contentSize.height * activeScale);

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        direction: 'rtl',
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 900, fontSize: '14.5px', color: '#93c5fd' }}>
            {payload.title || 'معاينة قبل الطباعة'}
          </span>
          <span
            style={{
              fontSize: '11.5px',
              background: 'rgba(255,255,255,0.14)',
              padding: '3px 8px',
              borderRadius: '999px',
              fontWeight: 700,
            }}
          >
            {isZoomed ? `مكبّر (${Math.round(activeScale * 100)}%)` : `ملاءمة للشاشة (${Math.round(activeScale * 100)}%)`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsZoomed((z) => !z)}
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.35)',
              background: isZoomed ? '#f59e0b' : 'rgba(255,255,255,0.14)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isZoomed ? <Maximize2 size={15} /> : <ZoomIn size={15} />}
            <span>{isZoomed ? 'ملاءمة حجم الشاشة' : 'تكبير الكشف'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              height: '36px',
              padding: '0 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(22, 163, 74, 0.35)',
            }}
          >
            <Printer size={17} />
            <span>طباعة الآن</span>
          </button>

          <button
            type="button"
            onClick={() => setPayload(null)}
            title="إغلاق المعاينة"
            style={{
              height: '36px',
              width: '36px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.85)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Auto-Fit Canvas */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '14px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            margin: '0 auto',
            position: 'relative',
            background: '#ffffff',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.18)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <iframe
            ref={iframeRef}
            title={payload.title || 'Print Preview'}
            srcDoc={payload.html}
            onLoad={() => {
              measureIframeContent();
              setTimeout(measureIframeContent, 250);
            }}
            style={{
              width: `${contentSize.width}px`,
              height: `${contentSize.height}px`,
              border: 'none',
              transform: `scale(${activeScale})`,
              transformOrigin: 'top right',
              display: 'block',
              background: '#ffffff',
            }}
          />
        </div>
      </div>
    </div>
  );
}
