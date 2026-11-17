import { SLOGAN_BASE64 } from '../assets/sloganBase64';
import { openHtmlPrintPreview } from './printPreview';

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** الأعمدة المتاحة للتفعيل/الإلغاء في الاستمارة (بالترتيب المعتمد في الورقة المدرسية) */
export const SHEET_COLUMNS = [
  { key: 'homework', label: 'الواجبات', max: '15', defaultOn: true },
  { key: 'attendance', label: 'المواظبة', max: '15', defaultOn: true },
  { key: 'behavior', label: 'السلوك', max: '10', defaultOn: true },
  { key: 'oral', label: 'الشفوي', max: '10', defaultOn: true },
  { key: 'written', label: 'التحريري', max: '50', defaultOn: true },
  // أعمدة اختيارية فارغة (الأصل بلا مجموع ولا محصلة؛ يظهران في لوحة التحكم تلقائياً)
  { key: 'total', label: 'المجموع', max: '100', defaultOn: false },
  { key: 'coursework', label: 'المحصلة', max: '20', defaultOn: false },
  { key: 'notes', label: 'ملاحظات', max: '', defaultOn: false },
];

export const DEFAULT_SHEET_OPTIONS = {
  columns: SHEET_COLUMNS.filter((c) => c.defaultOn).map((c) => c.key),
  orientation: 'portrait',      // portrait | landscape
  rowsMode: 'fixed',            // fixed (عدد ثابت من الصفوف مع صفوف فارغة) | students (بعدد الطلاب فقط)
  rowsPerPage: 35,
  title: 'استمارة رصد شهر',
  subtitle: '(روضة – تمهيدي – أساسي – ثانوي)',
  showMonthTerm: true,
  showHeaderMeta: true,         // التاريخ والعام الدراسي والفترة في الترويسة
  showCode: false,              // عمود رقم القيد
  teacherMode: 'system',        // system (من النظام) | blank (اتركه فارغاً للكتابة)
  showSignature: true,
  signatureLabel: 'التوقيع',
  studentOrder: 'dashboard',    // dashboard (كما في لوحة التحكم) | code (برقم القيد)
};

// أبعاد الصفحة المتاحة بعد الهوامش (مم)
const PAGE = { portrait: { w: 198, h: 285 }, landscape: { w: 285, h: 198 } };
const FIXED_MM = 54; // ترويسة + عنوان + بيانات + رأس الجدول + التوقيع

export const maxRowsFor = (orientation) => Math.floor((PAGE[orientation].h - FIXED_MM) / 5);

export function normalizeOptions(raw) {
  const o = { ...DEFAULT_SHEET_OPTIONS, ...(raw || {}) };
  o.orientation = o.orientation === 'landscape' ? 'landscape' : 'portrait';
  const cols = (o.columns || []).filter((k) => SHEET_COLUMNS.some((c) => c.key === k));
  o.columns = cols;
  const max = maxRowsFor(o.orientation);
  o.rowsPerPage = Math.min(max, Math.max(5, parseInt(o.rowsPerPage, 10) || DEFAULT_SHEET_OPTIONS.rowsPerPage));
  return o;
}

/**
 * استمارات رصد فارغة للمعلمين، صفحة (أو أكثر) لكل صف + مادة.
 * sheets: [{ students: [{name, code}], subjectName, teacherName, className }]
 */
export function buildTeacherSheetsHtml({ sheets, monthLabel, calendarMonthName, termLabel, yearLabel, options }) {
  const o = normalizeOptions(options);
  const today = new Date().toLocaleDateString('ar-EG');
  const page = PAGE[o.orientation];
  const rowsPerPage = o.rowsPerPage;
  const activeCols = SHEET_COLUMNS.filter((c) => o.columns.includes(c.key));
  const rowH = o.rowsMode === 'fixed'
    ? Math.min(14, Math.max(5, (page.h - FIXED_MM) / rowsPerPage))
    : 7;
  const nameWidth = activeCols.length <= 5 ? 38 : 30;
  const dataColsHtml = activeCols.map((c) => `<th>${esc(c.label)}${c.max ? `<br><small>(${c.max})</small>` : ''}</th>`).join('');

  let out = '';
  sheets.forEach((sheet) => {
    const students = sheet.students || [];
    const pages = Math.max(1, Math.ceil(students.length / rowsPerPage));
    const teacher = (o.teacherMode === 'system' && sheet.teacherName) ? esc(sheet.teacherName) : '..............................';
    for (let p = 0; p < pages; p++) {
      const slice = students.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
      const count = o.rowsMode === 'fixed' ? rowsPerPage : Math.max(1, slice.length);
      let rows = '';
      for (let i = 0; i < count; i++) {
        const st = slice[i];
        rows += `<tr><td>${p * rowsPerPage + i + 1}</td>${o.showCode ? `<td>${st ? esc(st.code || '') : ''}</td>` : ''}<td class="nm">${st ? esc(st.name) : ''}</td>${activeCols.map(() => '<td></td>').join('')}</tr>`;
      }
      out += `<div class="page">
        ${o.showHeaderMeta ? `<div class="hd">
          <div class="hr"><div>الجمهورية اليمنية</div><div>وزارة التربية والتعليم</div><div><b>رياض ومدارس أنوار العلى الدولية النموذجية</b></div></div>
          <div class="hc"><img src="${SLOGAN_BASE64}" alt="" /></div>
          <div class="hl"><div>التاريخ: ${today}</div><div>العام الدراسي: ${esc(yearLabel)}</div><div>${esc(termLabel)}</div></div>
        </div>` : ''}
        <div class="title">${esc(o.title)}${o.subtitle ? ` <small>${esc(o.subtitle)}</small>` : ''}</div>
        <div class="meta">
          <span><b>اسم المعلم:</b> ${teacher}</span>
          <span><b>المادة:</b> ${esc(sheet.subjectName)}</span>
          <span><b>الصف / الشعبة:</b> ${esc(sheet.className)}</span>
        </div>
        ${o.showMonthTerm ? `<div class="meta2"><span><b>الشهر:</b> ${esc(calendarMonthName)}</span><span><b>الفترة:</b> ${esc(monthLabel)}</span></div>` : ''}
        <table><thead><tr><th style="width:5%">م</th>${o.showCode ? '<th style="width:9%">رقم القيد</th>' : ''}<th style="width:${nameWidth}%">اسم الطالب</th>${dataColsHtml}</tr></thead>
        <tbody>${rows}</tbody></table>
        ${(o.showSignature || pages > 1) ? `<div class="sig"><div>${o.showSignature ? `${esc(o.signatureLabel)}: ........................................` : ''}</div>${pages > 1 ? `<div class="pg">صفحة ${p + 1} من ${pages}</div>` : ''}</div>` : ''}
      </div>`;
    }
  });
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>استمارة رصد</title><style>
    @page{size:A4 ${o.orientation};margin:6mm}
    *{box-sizing:border-box}
    body{margin:0;font-family:Tahoma,Arial,sans-serif;color:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{width:${page.w}mm;height:${page.h}mm;margin:0 auto;padding:4mm;page-break-after:always;overflow:hidden;background:#fff}
    .page:last-child{page-break-after:auto}
    .hd{display:flex;justify-content:space-between;align-items:center;font-size:10px;line-height:1.6}
    .hr{text-align:right;width:36%}.hl{text-align:left;width:36%}.hc{text-align:center}.hc img{height:48px}
    .title{text-align:center;font-weight:800;font-size:15px;margin:4px 0;padding:3px;border:1.5px solid #1e3a8a;border-radius:6px;background:#eff6ff}
    .title small{font-weight:600;font-size:11px}
    .meta{display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px}
    .meta2{display:flex;gap:24px;font-size:11px;margin-bottom:4px;color:#334155}
    table{width:100%;border-collapse:collapse;table-layout:fixed}
    th,td{border:1px solid #334155;text-align:center;font-size:11px}
    th{background:#f1f5f9;padding:2px;height:28px}
    th small{font-weight:400}
    td{height:${rowH.toFixed(2)}mm}
    td.nm{text-align:right;padding:0 5px;font-weight:600;font-size:10.5px;line-height:1.2}
    .sig{display:flex;justify-content:space-between;margin-top:6px;font-size:11px}
    .pg{font-size:10px;color:#64748b}
  </style></head><body>${out}</body></html>`;
}

export function printTeacherSheets(opts, title = 'استمارة رصد') {
  const o = normalizeOptions(opts.options);
  openHtmlPrintPreview(buildTeacherSheetsHtml(opts), { title, landscape: o.orientation === 'landscape' });
}
