import React from 'react';
import { cellValue } from '../reportUtils';

/**
 * StudentResultView — Specialized document/certificate view for individual student academic results.
 */
export default function StudentResultView({
  report,
  columns,
  rows,
  lang,
  text,
  isPrint = false,
}) {
  const student = report?.student;
  const summary = report?.summary;

  return (
    <div className={`sr-student-doc-wrapper ${isPrint ? 'is-print' : ''}`}>
      {/* Student Academic Identity Card */}
      {student && (
        <div className="sr-student-doc-badge">
          <div>
            <strong>{text('اسم الطالب:', 'Student Name:')}</strong>{' '}
            <span>{student.name}</span>
          </div>
          <div>
            <strong>{text('الصف والشعبة:', 'Class & Section:')}</strong>{' '}
            <span>{student.class}</span>
          </div>
          {student.code && (
            <div>
              <strong>{text('الرقم المدرسي:', 'Student ID:')}</strong>{' '}
              <span>{student.code}</span>
            </div>
          )}
        </div>
      )}

      {/* Subjects & Marks Table */}
      <div className="sr-table-wrap">
        <table className="sr-table sr-doc-table">
          <thead className="sr-table-head">
            <tr>
              <th scope="col" className="sr-col-num">
                {text('م', '#')}
              </th>
              {columns.map((column) => (
                <th
                  scope="col"
                  key={column.key}
                  className={`sr-th-cell ${
                    column.key === 'subject' ? 'sr-col-start' : 'sr-col-center'
                  } ${column.numeric ? 'sr-numeric-col' : ''}`}
                >
                  {column[lang] || column.ar}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || index}>
                <td className="sr-col-num">{index + 1}</td>
                {columns.map((column) => (
                  <td
                    className={`sr-td-cell ${
                      column.key === 'subject'
                        ? 'sr-col-start sr-col-name'
                        : 'sr-col-center'
                    } ${column.numeric ? 'sr-numeric-col' : ''}`}
                    key={column.key}
                  >
                    {cellValue(row, column, lang)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result Academic Summary Strip */}
      {summary && (
        <div className="sr-document-summary">
          <span>
            <strong>{text('المجموع الكلي:', 'Total Score:')}</strong>{' '}
            {summary.total ?? '—'} / {summary.maximum ?? '—'}
          </span>
          <span>
            <strong>{text('النسبة المئوية:', 'Percentage:')}</strong>{' '}
            {summary.percentage !== null && summary.percentage !== undefined
              ? `${summary.percentage}%`
              : '—'}
          </span>
          <span>
            <strong>{text('حالة الرصد:', 'Status:')}</strong>{' '}
            {summary.complete
              ? text('مكتمل للمراجعة والاعتماد', 'Complete for Approval')
              : text('ناقص الرصد (يرجى استكمال الدرجات)', 'Incomplete Grades')}
          </span>
        </div>
      )}
    </div>
  );
}
