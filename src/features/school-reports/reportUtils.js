export const REPORTS = [
  { key: 'finance', group: 'finance', ar: 'كشف الرسوم والمدفوعات', en: 'Fees and payments', description: 'أرصدة طلاب الصف أو الشعبة من الحسابات الموجودة.' },
  { key: 'month', group: 'academic', ar: 'كشف المحصلات', en: 'Monthly assessment', description: 'المحصلة الأولى أو الثانية أو الثالثة حسب مواد الشعبة.' },
  { key: 'term', group: 'academic', ar: 'شيت الفصل الدراسي', en: 'Term sheet', description: 'أعمال الفصل والاختبار والمجموع للمراجعة.' },
  { key: 'annual', group: 'academic', ar: 'شيت نهاية العام', en: 'Annual sheet', description: 'نتائج الفصلين ومجموع المواد من الدرجات التفصيلية.' },
  { key: 'term-result', group: 'documents', ar: 'نموذج النتيجة النصفية', en: 'Term result template', description: 'نموذج فردي قابل للطباعة بعد مراجعة اكتمال النتائج.' },
  { key: 'annual-result', group: 'documents', ar: 'نموذج شهادة نهاية العام', en: 'Annual certificate template', description: 'معاينة درجات الطالب السنوية في قالب أكاديمي.' },
  { key: 'attendance', group: 'followup', ar: 'كشف الحضور والغياب', en: 'Attendance register', description: 'أيام الحضور والغياب المسجلة خلال الفترة المختارة.' },
  { key: 'registry', group: 'followup', ar: 'سجل قيد وبيانات الطلاب', en: 'Student Roster & Directory', description: 'دليل رسمي شامل لطلاب الشعبة يتضمن الأرقام المدرسية، بيانات أولياء الأمور، وهواتف التواصل وتواريخ القيد للمتابعة الميدانية.' },
];

export const NOTES = {
  financial_details_unavailable: ['الخصومات والنقل والرسوم الأخرى والرصيد السابق ليست مفصلة في البيانات الحالية؛ لا تُضاف إلى المبلغ المسجل.', 'Discounts, transport, other fees and prior balances are not itemized in the current data.'],
  finance_current_balance: ['الأرصدة حسب الرسوم الحالية وجميع الدفعات المسجلة، دون تخصيص للأعوام أو إعادة بناء رصيد تاريخي.', 'Current recorded fees and all recorded payments; no allocation to academic years or historical balance.'],
  attendance_recorded_only: ['نسبة الحضور محسوبة من الأيام التي سُجلت حاضرًا أو غائبًا فقط؛ اليوم غير المسجل لا يُعتبر غيابًا.', 'Attendance percentage uses marked present/absent days only. Unmarked days are excluded.'],
  grades_current_context: ['تُعرض بيانات الرصد الحالية؛ لا يوجد ربط بالعام الدراسي في هذه البيانات.', 'These are current recorded grades; no academic year is attached to these records.'],
  grades_detailed_source: ['المصدر: الدرجات التفصيلية. درجات الكنترول لا تُدمج معها تلقائيًا.', 'Source: detailed grades. Control grades are not merged automatically.'],
  grades_calculation: ['الحساب الحالي: مجموع المحصلات الثلاث ÷ 15 لأعمال من 20، ثم اختبار من 30. يُراجع مع سياسة المدرسة قبل الاعتماد.', 'Current formula: three monthly totals ÷ 15 for coursework /20, plus exam /30. Review against school policy.'],
  document_review_only: ['نموذج للمراجعة والطباعة، دون اعتماد أو إصدار شهادة رسمية أو إرسال لولي الأمر.', 'Review and print template; no official approval, certificate issuance or parent notification.'],
  subjects_missing: ['بعض الشعب ليس لها مواد مسندة؛ لا يمكن اعتبار نتائجها مكتملة قبل التأكد من المقرر.', 'Some classes have no assigned subjects. Their results cannot be considered complete.'],
  registry_official_record: ['سجل قيد معتمد لطلاب الشعبة مع بيانات أولياء الأمور وهواتف التواصل؛ مخصص للمناداة اليومية والمتابعة الميدانية ومربي الفصل.', 'Official class roster & guardian directory with contact phones and enrollment dates; used for roll calls and administrative follow-up.'],
};

export function buildReportQuery(filters, exporting = false) {
  const query = new URLSearchParams();
  for (const id of filters.class_ids || []) query.append('class_ids[]', String(id));
  for (const key of ['subject_id', 'student_id', 'term', 'month', 'from', 'to', 'search', 'status']) {
    if (filters[key] !== '' && filters[key] !== undefined && filters[key] !== null) query.set(key, String(filters[key]));
  }
  if (exporting) query.set('export', '1');
  return query.toString();
}

export function cellValue(row, column, lang = 'ar') {
  const translated = row[`${column.key}_en`];
  const value = lang === 'en' && translated ? translated : row[column.key];
  if (value === null || value === undefined || value === '') return '—';
  if (column.key === 'status') return ({
    complete: ['مرصود', 'Recorded'],
    incomplete: ['ناقص الرصد', 'Incomplete'],
    paid: ['مسدد', 'Paid'],
    unpaid: ['متبقٍ', 'Unpaid'],
    credit: ['رصيد دائن', 'Credit'],
    active: ['منتظم / نشط', 'Active'],
    inactive: ['غير منتظم', 'Inactive'],
  })[value]?.[lang === 'ar' ? 0 : 1] || value;
  return typeof value === 'number' ? new Intl.NumberFormat(lang === 'ar' ? 'ar' : 'en', { maximumFractionDigits: 2 }).format(value) : String(value);
}

// Escape spreadsheet formula prefixes as well as RFC 4180 delimiters; preserve actual numeric values.
export function reportCsv(report, columns, lang) {
  const quote = (value) => {
    let text = value === null || value === undefined ? '' : String(value);
    if (typeof value !== 'number' && /^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const lines = [columns.map(c => quote(c[lang] || c.ar)).join(',')];
  for (const row of report.rows) lines.push(columns.map(c => quote(c.numeric ? row[c.key] : cellValue(row, c, lang))).join(','));
  if (Object.keys(report.totals || {}).length) lines.push(columns.map((c, i) => quote(report.totals[c.key] ?? (i === 0 ? (lang === 'ar' ? 'الإجمالي' : 'Total') : ''))).join(','));
  return '\ufeff' + lines.join('\r\n');
}

export function printReport(reportElement, title, landscape) {
  // An isolated document prevents existing global print styles from affecting other pages.
  const frame = document.createElement('iframe');
  frame.title = title;
  frame.style.cssText = 'position:absolute;width:1px;height:1px;border:0;inset-inline-start:-10000px';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Almarai:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 5mm; }
    * { box-sizing: border-box; }
    body {
      color: #0f172a;
      background: white;
      font-family: 'Tajawal', 'Almarai', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: 10px;
      line-height: 1.3;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sr-print-sheet {
      border: 1.5px solid #1e3a8a;
      border-radius: 4px;
      padding: 4px 7px 3px;
      background: #ffffff;
      width: 100%;
      min-height: ${landscape ? '192mm' : '278mm'};
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sr-print-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .sr-print-top-header {
      display: grid;
      grid-template-columns: 1.3fr 1fr 1.3fr;
      align-items: center;
      width: 100%;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #1e3a8a;
    }
    .sr-print-gov-ar {
      font-size: 9.8px;
      line-height: 1.45;
      text-align: right;
      font-weight: 700;
      color: #0f172a;
    }
    .sr-print-school-ar {
      font-weight: 800;
      font-size: 10.8px;
      color: #1e3a8a;
      margin-top: 1px;
    }
    .sr-print-logo-box {
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .sr-print-logo-box img {
      width: 42px;
      height: 42px;
      object-fit: contain;
      border-radius: 50%;
      border: 1.5px solid #1e3a8a;
      padding: 1px;
      background: #ffffff;
    }
    .sr-print-gov-en {
      font-size: 9px;
      line-height: 1.45;
      text-align: left;
      font-weight: 700;
      color: #0f172a;
      direction: ltr;
    }
    .sr-print-school-en {
      font-weight: 800;
      font-size: 10px;
      color: #1e3a8a;
      margin-top: 1px;
    }
    .sr-print-title-area {
      text-align: center;
      margin: 4px 0 3px;
    }
    .sr-print-title-area h2 {
      font-size: 14.5px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 2px;
    }
    .sr-print-title-area .sr-meta-sub {
      font-size: 10px;
      color: #334155;
      font-weight: 700;
    }
    .sr-print-scope-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      font-weight: 700;
      color: #0f172a;
      padding: 2.5px 6px;
      border-top: 1px solid #94a3b8;
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 4px;
      background: #f8fafc;
    }
    .sr-table-wrap { width: 100%; overflow: visible; margin-bottom: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      border: 1.5px solid #1e3a8a;
    }
    th, td {
      border: 1px solid #94a3b8;
      padding: 3.5px 4.5px;
      text-align: center;
      font-size: 9.8px;
      line-height: 1.3;
    }
    th {
      background: #f1f5f9;
      color: #0f2e5a;
      font-weight: 800;
      border-bottom: 1.5px solid #1e3a8a;
      padding: 4px 4.5px;
    }
    thead { display: table-header-group; }
    tfoot { display: table-row-group; }
    tr { break-inside: avoid; }
    .sr-col-num { width: 28px; text-align: center !important; font-weight: 700; background: #f8fafc; }
    .sr-col-start { text-align: start !important; }
    .sr-col-center { text-align: center !important; }
    .sr-col-name { text-align: start !important; font-weight: 700; }
    .sr-numeric-col, .sr-numeric { font-variant-numeric: tabular-nums; text-align: center !important; }
    tfoot tr {
      background: #e2e8f0;
      font-weight: 800;
      border-top: 2px solid #1e3a8a;
    }
    tfoot th, tfoot td {
      border: 1px solid #94a3b8;
      background: #e2e8f0;
      color: #0f172a;
      font-weight: 800;
      text-align: center;
    }
    .sr-single-student-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }
    .sr-student-doc-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 14px;
      background: #f8fafc;
      border: 1px solid #1e3a8a;
      border-radius: 4px;
      margin-bottom: 10px;
      font-size: 11px;
    }
    .sr-student-doc-badge .sr-badge-col {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sr-student-doc-badge strong {
      color: #1e3a8a;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
    }
    .sr-student-doc-badge .sr-badge-val {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }
    .sr-document-summary {
      font-weight: 700;
      font-size: 11px;
      margin: 8px 0;
      padding: 6px 12px;
      background: #f1f5f9;
      border-radius: 4px;
      border: 1px solid #1e3a8a;
      color: #0f2e5a;
      text-align: center;
    }
    .sr-official-signatures {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      text-align: center;
      gap: 6px;
      margin-top: auto;
      padding-top: 4px;
      padding-bottom: 2px;
    }
    .sr-sig-item strong {
      display: block;
      font-size: 9px;
      color: #0f172a;
      margin-bottom: 9px;
    }
    .sr-sig-item .sr-sig-line {
      border-bottom: 1px dashed #94a3b8;
      width: 75%;
      margin: 0 auto;
    }
    .sr-print-footer-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      color: #64748b;
      border-top: 1px solid #cbd5e1;
      padding-top: 2px;
      margin-top: auto;
    }
    .sr-print-page-num {
      font-weight: 700;
      color: #0f172a;
      display: inline-block;
    }
  </style></head><body></body></html>`);
  doc.close();
  doc.title = title;
  doc.documentElement.dir = reportElement.dir || document.documentElement.dir || 'rtl';
  doc.body.appendChild(reportElement.cloneNode(true));
  const cleanup = () => { if (frame.isConnected) frame.remove(); };
  frame.contentWindow.addEventListener('afterprint', cleanup, { once: true });
  const images = [...doc.images].map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }));
  Promise.all(images).then(() => { frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(cleanup, 60000); });
}
