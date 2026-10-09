import React, { useMemo } from 'react';
import { cellValue } from '../reportUtils';

/**
 * SingleStudentReportView — High-clarity vertical layout for a single student.
 * Used when a user filters any report by student or views an individual student certificate.
 */
export default function SingleStudentReportView({
  report,
  columns,
  rows,
  student,
  reportKey,
  lang,
  text,
  isPrint = false,
}) {
  const isArabic = lang === 'ar';
  const targetStudent = student || (rows.length === 1 ? rows[0] : report?.student);
  const row = rows[0] || {};
  const isDoc = reportKey === 'term-result' || reportKey === 'annual-result';

  // Transform horizontal subject columns to vertical rows for academic ledger reports
  const subjectRows = useMemo(() => {
    if (isDoc) {
      // Document modes already have vertical subject rows in `rows`
      return rows;
    }
    const subCols = columns.filter((c) => c.key.startsWith('subject_'));
    if (!subCols.length) return [];
    return subCols.map((c, i) => ({
      index: i + 1,
      subject: c[lang] || c.ar,
      score: row[c.key] !== undefined && row[c.key] !== null ? row[c.key] : '—',
      maximum: reportKey === 'month' || reportKey?.startsWith('annual') ? 100 : 50,
    }));
  }, [isDoc, rows, columns, row, reportKey, lang]);

  return (
    <div className={`sr-single-student-wrap ${isPrint ? 'is-print' : ''}`}>
      {/* Student Profile Ribbon */}
      <div className="sr-student-doc-badge">
        <div className="sr-badge-col">
          <strong>{text('اسم الطالب:', 'Student Name:')}</strong>{' '}
          <span className="sr-badge-val">{targetStudent?.name || row.name || '—'}</span>
        </div>
        <div className="sr-badge-col">
          <strong>{text('الصف والشعبة:', 'Class & Section:')}</strong>{' '}
          <span className="sr-badge-val">{targetStudent?.class || row.class || '—'}</span>
        </div>
        {(targetStudent?.code || row.code) && (
          <div className="sr-badge-col">
            <strong>{text('الرقم المدرسي:', 'Student ID:')}</strong>{' '}
            <span className="sr-badge-val">{targetStudent?.code || row.code}</span>
          </div>
        )}
      </div>

      {/* Vertical Data Table */}
      {isDoc ? (
        // Document modes with Coursework & Exam columns
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead className="sr-table-head">
              <tr>
                <th scope="col" className="sr-col-num">{text('م', '#')}</th>
                {columns.map((column) => (
                  <th
                    scope="col"
                    key={column.key}
                    className={`sr-th-cell ${column.key === 'subject' ? 'sr-col-start' : 'sr-col-center'} ${column.numeric ? 'sr-numeric-col' : ''}`}
                  >
                    {column[lang] || column.ar}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => (
                <tr key={r.id || index}>
                  <td className="sr-col-num">{index + 1}</td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`sr-td-cell ${column.key === 'subject' ? 'sr-col-start sr-col-name' : 'sr-col-center'} ${column.numeric ? 'sr-numeric-col' : ''}`}
                    >
                      {cellValue(r, column, lang)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : subjectRows.length > 0 ? (
        // Multi-subject report formatted as clean vertical subject list
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead className="sr-table-head">
              <tr>
                <th scope="col" className="sr-col-num">{text('م', '#')}</th>
                <th scope="col" className="sr-col-start">{text('المادة الدراسية', 'Subject')}</th>
                <th scope="col" className="sr-col-center">{text('الدرجة المحصلة', 'Score')}</th>
                <th scope="col" className="sr-col-center">{text('الدرجة العظمى', 'Max')}</th>
              </tr>
            </thead>
            <tbody>
              {subjectRows.map((sub, index) => (
                <tr key={sub.index || index}>
                  <td className="sr-col-num">{index + 1}</td>
                  <td className="sr-col-start sr-col-name">{sub.subject}</td>
                  <td className="sr-col-center sr-numeric-col font-bold">{sub.score}</td>
                  <td className="sr-col-center sr-numeric-col">{sub.maximum}</td>
                </tr>
              ))}
            </tbody>
            {row.total !== undefined && (
              <tfoot className="sr-table-foot">
                <tr>
                  <th scope="row" className="sr-col-num">{text('—', '—')}</th>
                  <th scope="row" className="sr-col-start">{text('المجموع والنسبة العامة', 'Total & Average')}</th>
                  <td className="sr-col-center sr-numeric-col">
                    <strong>{row.total ?? '—'}</strong>
                  </td>
                  <td className="sr-col-center sr-numeric-col">
                    {row.percentage !== undefined ? `${row.percentage}%` : '—'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : (
        // Non-subject single student reports (Finance / Attendance / Registry)
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead className="sr-table-head">
              <tr>
                {columns
                  .filter((c) => c.key !== 'name' && c.key !== 'class')
                  .map((column) => (
                    <th
                      scope="col"
                      key={column.key}
                      className={`sr-th-cell sr-col-center ${column.numeric ? 'sr-numeric-col' : ''}`}
                    >
                      {column[lang] || column.ar}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {columns
                  .filter((c) => c.key !== 'name' && c.key !== 'class')
                  .map((column) => (
                    <td
                      key={column.key}
                      className={`sr-td-cell sr-col-center ${column.numeric ? 'sr-numeric-col' : ''}`}
                    >
                      {cellValue(row, column, lang)}
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Result Academic Summary Strip for document modes without a table foot */}
      {isDoc && (row.total !== undefined || report?.summary?.total !== undefined) && (
        <div className="sr-document-summary">
          <span>
            <strong>{text('المجموع الكلي:', 'Total Score:')}</strong>{' '}
            {row.total ?? report?.summary?.total ?? '—'} /{' '}
            {report?.summary?.maximum ?? (subjectRows.length * (reportKey === 'month' ? 100 : 50)) || '—'}
          </span>
          <span>
            <strong>{text('النسبة المئوية:', 'Percentage:')}</strong>{' '}
            {row.percentage ?? report?.summary?.percentage ?? '—'}%
          </span>
          <span>
            <strong>{text('حالة الرصد:', 'Status:')}</strong>{' '}
            {row.status === 'complete' || report?.summary?.complete
              ? text('مرصود ومكتمل', 'Complete')
              : text('ناقص الرصد', 'Incomplete')}
          </span>
        </div>
      )}
    </div>
  );
}
