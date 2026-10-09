import React from 'react';
import { cellValue } from '../reportUtils';

/**
 * LedgerReportView — Classical wide accounting & academic ledger table for group reports.
 */
export default function LedgerReportView({
  report,
  columns,
  tableRows,
  allRows,
  page = 1,
  pageSize = 30,
  showTotals = true,
  startIndex,
  lang,
  text,
}) {
  const isArabic = lang === 'ar';

  return (
    <div className="sr-table-wrap">
      <table className="sr-table">
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
                  column.key === 'name' ? 'sr-col-start' : 'sr-col-center'
                } ${column.numeric ? 'sr-numeric-col' : ''}`}
              >
                {column[lang] || column.ar}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, index) => {
            const rowNumber =
              startIndex !== undefined
                ? startIndex + index + 1
                : index + 1 + (tableRows === allRows ? 0 : (page - 1) * pageSize);

            return (
              <tr key={row.id || index}>
                <td className="sr-col-num">{rowNumber}</td>
                {columns.map((column) => (
                  <td
                    className={`sr-td-cell ${
                      column.key === 'name' ? 'sr-col-start sr-col-name' : 'sr-col-center'
                    } ${column.numeric ? 'sr-numeric-col' : ''}`}
                    key={column.key}
                  >
                    {cellValue(row, column, lang)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        {showTotals && Object.keys(report?.totals || {}).length > 0 && (
          <tfoot className="sr-table-foot">
            <tr>
              <th scope="row" className="sr-col-num">
                {text('الإجمالي', 'Total')}
              </th>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`sr-td-cell ${
                    column.key === 'name' ? 'sr-col-start' : 'sr-col-center'
                  } ${column.numeric ? 'sr-numeric-col' : ''}`}
                >
                  {report.totals[column.key] !== undefined
                    ? cellValue(report.totals, column, lang)
                    : ''}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
