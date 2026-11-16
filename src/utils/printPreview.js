/**
 * Universal Print Preview Dispatcher
 * Opens any full HTML document or DOM element in a responsive full-screen
 * print preview modal before calling the browser's print dialog.
 */

export const PRINT_PREVIEW_EVENT = 'app:open-print-preview';

/**
 * Open a full HTML string in the global full-screen Print Preview modal.
 * @param {string} html Full HTML document string
 * @param {{ title?: string, landscape?: boolean, widthPx?: number }} [options]
 */
export function openHtmlPrintPreview(html, options = {}) {
  if (typeof window === 'undefined') return;

  let actualHtml = html;
  let mergedOptions = options || {};

  // Defensive support: handle single-object call { html, title, ... }
  if (html && typeof html === 'object' && typeof html.html === 'string') {
    actualHtml = html.html;
    mergedOptions = { ...html, ...(options || {}) };
  }

  window.dispatchEvent(
    new CustomEvent(PRINT_PREVIEW_EVENT, {
      detail: {
        html: actualHtml,
        title: mergedOptions.title || 'معاينة قبل الطباعة',
        landscape: Boolean(mergedOptions.landscape),
        widthPx: mergedOptions.widthPx || null,
      },
    })
  );
}

/**
 * Clone a DOM element along with active stylesheets into a standalone HTML document
 * and open it in the global full-screen Print Preview modal.
 * @param {HTMLElement} element
 * @param {{ title?: string, landscape?: boolean, extraCss?: string, dir?: string }} [options]
 */
export function openElementPrintPreview(element, options = {}) {
  if (!element || typeof document === 'undefined') return;

  const title = options.title || document.title || 'معاينة قبل الطباعة';
  const landscape = Boolean(options.landscape);
  const dir = options.dir || element.dir || document.documentElement.dir || 'rtl';

  const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');

  const clone = element.cloneNode(true);
  // Remove any .no-print elements from the cloned preview
  clone.querySelectorAll('.no-print').forEach((el) => el.remove());

  const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <title>${title.replace(/</g, '&lt;')}</title>
  ${headStyles}
  <style>
    @page {
      size: A4 ${landscape ? 'landscape' : 'portrait'};
      margin: 8mm;
    }
    html, body {
      margin: 0;
      padding: 12px;
      background: #ffffff;
      color: #0f172a;
      direction: ${dir};
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print { display: none !important; }
    .cb-screen-hidden { display: block !important; }
    ${options.extraCss || ''}
    @media print {
      body { padding: 0 !important; }
    }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

  openHtmlPrintPreview(fullHtml, { title, landscape });
}
