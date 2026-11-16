import { useEffect, useState } from 'react';
import { X, BarChart3, Users, Wallet, CheckCircle2, Lock, Printer, FileSpreadsheet } from 'lucide-react';
import { api } from '../services/api';
import { openHtmlPrintPreview } from '../utils/printPreview';
import { SLOGAN_BASE64 } from '../assets/sloganBase64';

export default function AcademicYearCompareModal({ lang, onClose, setToastMessage }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/academic-years/compare');
        if (mounted) {
          setRows(res?.comparison || []);
        }
      } catch (err) {
        if (mounted) {
          setToastMessage?.(err?.message || (lang === 'ar' ? 'تعذر تحميل مقارنة الأعوام' : 'Failed to load comparison'));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [lang, setToastMessage]);

  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

  const handlePrint = () => {
    if (!rows || rows.length === 0) return;

    const printDate = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const tableRowsHtml = rows.map((r, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="font-weight: bold; text-align: right; padding: 7px 6px;">
          ${r.name || ''} ${r.is_current ? '<span style="color: #059669; font-size: 11px;">(حالي)</span>' : ''}
        </td>
        <td style="text-align: center; padding: 7px 6px;">
          ${r.status === 'archived' ? '<span style="color: #b45309; font-weight: 600;">مؤرشف</span>' : '<span style="color: #1d4ed8; font-weight: 600;">نشط</span>'}
        </td>
        <td style="text-align: center; font-weight: bold; padding: 7px 6px;">${r.students_count ?? 0}</td>
        <td style="text-align: center; color: #059669; font-weight: 600; padding: 7px 6px;">${r.promoted_count ?? 0}</td>
        <td style="text-align: center; color: #047857; font-weight: 600; padding: 7px 6px;">${r.graduated_count ?? 0}</td>
        <td style="text-align: center; color: #d97706; font-weight: 600; padding: 7px 6px;">${r.supplementary_count ?? 0}</td>
        <td style="text-align: center; color: #b45309; font-weight: 600; padding: 7px 6px;">${r.retained_count ?? 0}</td>
        <td style="text-align: center; color: #dc2626; font-weight: 600; padding: 7px 6px;">${r.withdrawn_count ?? 0}</td>
        <td style="text-align: center; padding: 7px 6px;">${formatMoney(r.total_required)}</td>
        <td style="text-align: center; color: #059669; font-weight: bold; padding: 7px 6px;">${formatMoney(r.total_paid)}</td>
        <td style="text-align: center; color: ${Number(r.remaining) > 0 ? '#b91c1c' : 'inherit'}; font-weight: bold; padding: 7px 6px;">${formatMoney(r.remaining)}</td>
        <td style="text-align: center; font-weight: bold; color: ${r.collection_rate >= 75 ? '#059669' : '#d97706'}; padding: 7px 6px;">${r.collection_rate ?? 0}%</td>
        <td style="text-align: center; font-weight: bold; color: ${r.attendance_rate >= 80 ? '#059669' : '#d97706'}; padding: 7px 6px;">${r.attendance_rate ?? 0}%</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>تقرير مقارنة الأعوام الدراسية الشامل</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      margin: 0;
      padding: 10px;
      color: #0f172a;
      background: #ffffff;
      direction: rtl;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 10px;
    }
    .header-title {
      text-align: center;
    }
    .header-title h2 {
      margin: 0 0 4px 0;
      font-size: 20px;
      color: #1e3a8a;
    }
    .header-title p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }
    .meta-box {
      font-size: 11px;
      color: #334155;
      text-align: left;
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-top: 8px;
    }
    .comparison-table th {
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      font-weight: 700;
      padding: 8px 5px;
      border: 1px solid #1e3a8a;
      text-align: center;
      white-space: nowrap;
    }
    .comparison-table td {
      border: 1px solid #cbd5e1;
      page-break-inside: avoid;
    }
    .footer {
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 20%; text-align: right; vertical-align: middle;">
        <img src="${SLOGAN_BASE64}" alt="Logo" style="height: 55px; max-width: 160px; object-fit: contain;" />
      </td>
      <td style="width: 60%; vertical-align: middle;" class="header-title">
        <h2>تقرير مقارنة الأعوام الدراسية الشامل</h2>
        <p>نظام إدارة المدارس الذكي - مقارنة المؤشرات الأكاديمية والمالية والحضور</p>
      </td>
      <td style="width: 20%; vertical-align: middle;" class="meta-box">
        <div><strong>تاريخ الطباعة:</strong> ${printDate}</div>
        <div><strong>إجمالي الأعوام:</strong> ${rows.length}</div>
      </td>
    </tr>
  </table>

  <table class="comparison-table">
    <thead>
      <tr>
        <th style="text-align: right;">العام الدراسي</th>
        <th>الحالة</th>
        <th>إجمالي الطلاب</th>
        <th>الناجحون</th>
        <th>الخريجون</th>
        <th>المكملون</th>
        <th>المعيدون</th>
        <th>المنسحبون</th>
        <th>الرسوم الكلية</th>
        <th>المحصل</th>
        <th>المتبقي</th>
        <th>نسبة التحصيل</th>
        <th>نسبة الحضور</th>
      </tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <span>تم إنشاء التقرير آلياً عبر نظام إدارة المدارس</span>
    <span>صفحة 1 من 1</span>
  </div>
</body>
</html>`;

    openHtmlPrintPreview(html, { title: 'تقرير مقارنة الأعوام الدراسية', landscape: true });
  };

  const handleExportCsv = () => {
    if (!rows || rows.length === 0) return;
    const headers = [
      lang === 'ar' ? 'العام الدراسي' : 'Academic Year',
      lang === 'ar' ? 'الحالة' : 'Status',
      lang === 'ar' ? 'إجمالي الطلاب' : 'Total Students',
      lang === 'ar' ? 'المرفعون' : 'Promoted',
      lang === 'ar' ? 'الخريجون' : 'Graduated',
      lang === 'ar' ? 'المكملون' : 'Supplementary',
      lang === 'ar' ? 'المعيدون' : 'Retained',
      lang === 'ar' ? 'المنسحبون' : 'Withdrawn',
      lang === 'ar' ? 'إجمالي الرسوم' : 'Total Fees',
      lang === 'ar' ? 'المحصل' : 'Collected',
      lang === 'ar' ? 'المتبقي' : 'Remaining',
      lang === 'ar' ? 'نسبة التحصيل %' : 'Collection %',
      lang === 'ar' ? 'نسبة الحضور %' : 'Attendance %',
    ];

    const escapeCsv = (val) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvRows = [
      headers.map(escapeCsv).join(','),
      ...rows.map((r) => [
        escapeCsv(r.name + (r.is_current ? (lang === 'ar' ? ' (حالي)' : ' (Current)') : '')),
        escapeCsv(r.status === 'archived' ? (lang === 'ar' ? 'مؤرشف' : 'Archived') : (lang === 'ar' ? 'نشط' : 'Active')),
        escapeCsv(r.students_count),
        escapeCsv(r.promoted_count),
        escapeCsv(r.graduated_count),
        escapeCsv(r.supplementary_count),
        escapeCsv(r.retained_count),
        escapeCsv(r.withdrawn_count),
        escapeCsv(r.total_required),
        escapeCsv(r.total_paid),
        escapeCsv(r.remaining),
        escapeCsv(r.collection_rate),
        escapeCsv(r.attendance_rate),
      ].join(',')),
    ];

    // UTF-8 BOM ensures Excel displays Arabic text properly
    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_years_comparison_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '16px' }}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .compare-modal-print-area, .compare-modal-print-area * { visibility: visible !important; }
          .compare-modal-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            padding: 10px !important;
          }
          .no-print-compare { display: none !important; }
          .data-table th, .data-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 6px 8px !important;
            font-size: 11px !important;
          }
          @page { size: A4 landscape; margin: 8mm; }
        }
      `}</style>
      <div
        className="glass-panel animate-scale-up compare-modal-print-area"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '18px',
          backgroundColor: 'var(--card-bg, #ffffff)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(148,163,184,0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={22} color="#2563eb" />
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
                {lang === 'ar' ? 'تقرير المقارنة بين الأعوام الدراسية' : 'Cross-Year Comparison Report'}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
                {lang === 'ar'
                  ? 'مقارنة أعداد الطلاب وحالات القيد والتحصيل المالي ونسب الحضور عبر الأعوام'
                  : 'Compare student counts, enrollment outcomes, financial collection, and attendance across years'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="no-print-compare">
            <button
              type="button"
              disabled={loading || rows.length === 0}
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #2563eb',
                backgroundColor: 'rgba(37,99,235,0.08)',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title={lang === 'ar' ? 'طباعة تقرير المقارنة' : 'Print Comparison'}
            >
              <Printer size={15} />
              <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>
            <button
              type="button"
              disabled={loading || rows.length === 0}
              onClick={handleExportCsv}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #059669',
                backgroundColor: 'rgba(16,185,129,0.08)',
                color: '#047857',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title={lang === 'ar' ? 'تصدير جدول المقارنة إلى CSV' : 'Export to CSV'}
            >
              <FileSpreadsheet size={15} />
              <span>{lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              {lang === 'ar' ? 'جارٍ تحميل المقارنة...' : 'Loading comparison...'}
            </div>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              {lang === 'ar' ? 'لا توجد أعوام دراسية للمقارنة.' : 'No academic years to compare.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', backgroundColor: 'var(--card-bg, #ffffff)', borderRadius: '10px' }}>
              <table className="data-table" style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', backgroundColor: 'var(--card-bg, #ffffff)' }}>
                <thead style={{ backgroundColor: 'var(--bg-secondary, #f1f5f9)' }}>
                  <tr>
                    <th style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>{lang === 'ar' ? 'العام الدراسي' : 'Academic Year'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'الطلاب' : 'Students'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'ترفيع / خريج' : 'Promoted / Grad'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'مكمل / باقي' : 'Supp / Retained'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'منسحب' : 'Withdrawn'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'إجمالي الرسوم' : 'Total Fees'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'المحصل' : 'Collected'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'المتبقي' : 'Remaining'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'نسبة التحصيل' : 'Collection %'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'نسبة الحضور' : 'Attendance %'}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{r.name}</span>
                          {r.is_current && (
                            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '999px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#059669' }}>
                              {lang === 'ar' ? 'حالي' : 'Current'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {r.status === 'archived' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(245,158,11,0.15)', color: '#b45309', fontWeight: 600 }}>
                            <Lock size={11} />
                            {lang === 'ar' ? 'مؤرشف' : 'Archived'}
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(37,99,235,0.12)', color: '#1d4ed8', fontWeight: 600 }}>
                            <CheckCircle2 size={11} />
                            {lang === 'ar' ? 'نشط' : 'Active'}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={13} />
                          {r.students_count}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', color: '#059669', fontWeight: 600 }}>
                        {r.promoted_count} / {r.graduated_count}
                      </td>
                      <td style={{ textAlign: 'center', color: '#d97706', fontWeight: 600 }}>
                        {r.supplementary_count} / {r.retained_count}
                      </td>
                      <td style={{ textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>
                        {r.withdrawn_count}
                      </td>
                      <td style={{ textAlign: 'center' }}>{formatMoney(r.total_required)}</td>
                      <td style={{ textAlign: 'center', color: '#059669', fontWeight: 700 }}>{formatMoney(r.total_paid)}</td>
                      <td style={{ textAlign: 'center', color: Number(r.remaining) > 0 ? '#b91c1c' : 'inherit', fontWeight: 600 }}>
                        {formatMoney(r.remaining)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: r.collection_rate >= 75 ? '#059669' : '#d97706' }}>
                          <Wallet size={12} />
                          {r.collection_rate}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: r.attendance_rate >= 80 ? '#059669' : '#d97706' }}>
                        {r.attendance_rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(148,163,184,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print-compare">
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            {lang === 'ar' ? `عدد الأعوام المقارنة: ${rows.length}` : `Compared Years: ${rows.length}`}
          </div>
          <button type="button" className="lang-btn" onClick={onClose}>
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
