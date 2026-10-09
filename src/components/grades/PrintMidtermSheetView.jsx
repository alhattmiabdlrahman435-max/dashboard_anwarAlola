import React from 'react';

/**
 * مكون طباعة شيت الكنترول النصفي الرسمي A4 Landscape
 * مطابق تماماً لنموذج المدرسة: "كشوفات رصد الفصل الاول 2026.xlsx"
 */
export default function PrintMidtermSheetView({
  className = '',
  subjects = [],
  students = [],
  statistics = {},
  onClose = null,
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-midterm-container">
      {/* شريط الأزرار للتحكم (يختفي أثناء الطباعة) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        borderRadius: '8px',
        marginBottom: '20px',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🖨️</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              معاينة طباعة كشف الكنترول النصفي الرسمي ({className})
            </h4>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              تم ضبط الورقة على النمط العرضي (A4 Landscape) لتتسع لكافة المواد والأعمدة الرسمية
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '10px 24px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🖨️</span>
            <span>طباعة الكشف الآن</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#475569',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              إغلاق المعاينة
            </button>
          )}
        </div>
      </div>

      {/* الصفحة المطبوعة الرسمية */}
      <div className="print-official-sheet" style={{ direction: 'rtl', fontFamily: 'Arial, "Segoe UI", sans-serif' }}>
        {/* ترويسة الكشف الرسمية */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          alignItems: 'center',
          borderBottom: '2px solid #000000',
          paddingBottom: '8px',
          marginBottom: '10px'
        }}>
          {/* الجانب الأيمن: الترويسة الوزارية */}
          <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.4', fontWeight: 'bold', color: '#000000' }}>
            <div>الجمهورية اليمنية</div>
            <div>وزارة التربية والتعليم</div>
            <div>مكتب التربية والتعليم بالأمانة / المحافظة</div>
            <div>إدارة التربية والتعليم بالمديرية</div>
            <div>مدرسة أنوار العُلا الأهلية النموذجية</div>
          </div>

          {/* المنتصف: عنوان الكشف والصف */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '17px',
              fontWeight: '900',
              color: '#000000',
              letterSpacing: '0.5px'
            }}>
              كشف رصد درجات الفصل الأول للعام الدراسي 2026م – 2027م
            </h2>
            <div style={{
              display: 'inline-block',
              padding: '3px 18px',
              backgroundColor: '#f1f5f9',
              border: '1.5px solid #000000',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 'bold',
              marginTop: '2px'
            }}>
              الصف: {className}
            </div>
          </div>

          {/* الجانب الأيسر: جدول إحصائيات الحضور والغياب كما في كشف الإكسل الأصلي */}
          <div style={{ textAlign: 'left', display: 'flex', justifyContent: 'flex-end' }}>
            <table style={{
              borderCollapse: 'collapse',
              fontSize: '10px',
              border: '1px solid #000000',
              textAlign: 'center',
              backgroundColor: '#ffffff'
            }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '2px 6px', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>عدد الطلاب</td>
                  <td style={{ border: '1px solid #000', padding: '2px 8px', fontWeight: 'bold' }}>{statistics.total_students || students.length || 0}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '2px 6px', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>الحاضرون</td>
                  <td style={{ border: '1px solid #000', padding: '2px 8px', fontWeight: 'bold' }}>{statistics.attended || students.length || 0}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '2px 6px', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>الغائبون</td>
                  <td style={{ border: '1px solid #000', padding: '2px 8px', fontWeight: 'bold' }}>{statistics.absent || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* الجدول الشامل لجميع المواد (مطابق لأعمدة م1 / ن1 / مج1) */}
        <table className="official-grade-table" style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1.5px solid #000000',
          textAlign: 'center',
          fontSize: '10px'
        }}>
          <thead>
            {/* الصف الأول من العناوين: المواد الأساسية */}
            <tr style={{ backgroundColor: '#e2e8f0', color: '#000000' }}>
              <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px 2px', width: '28px' }}>م</th>
              <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px 2px', width: '55px' }}>رقم الجلوس</th>
              <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px 2px', width: '50px' }}>الرقم السري</th>
              <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right', minWidth: '140px' }}>اســــــم الطـــــالب</th>

              {subjects.map(sub => (
                <th key={sub.id} colSpan="3" style={{
                  border: '1px solid #000',
                  padding: '4px 2px',
                  fontWeight: 'bold',
                  backgroundColor: '#f1f5f9'
                }}>
                  {sub.name_ar}
                </th>
              ))}

              <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px 2px', width: '45px', backgroundColor: '#e2e8f0', fontWeight: '900' }}>
                المجموع<br /><span style={{ fontSize: '9px', fontWeight: 'normal' }}>({subjects.length * 50})</span>
              </th>
              <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px 2px', width: '40px', backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                النسبة<br /><span style={{ fontSize: '9px', fontWeight: 'normal' }}>(%)</span>
              </th>
              <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px 2px', width: '40px', backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                الترتيب
              </th>
            </tr>

            {/* الصف الثاني من العناوين: التفريعات الثلاثية لكل مادة (م1 / ن1 / مج1) */}
            <tr style={{ backgroundColor: '#f8fafc', color: '#000000', fontSize: '9px' }}>
              {subjects.map(sub => (
                <React.Fragment key={`sub-cols-${sub.id}`}>
                  <th style={{ border: '1px solid #000', padding: '2px 1px', width: '24px' }} title="أعمال الفصل (20)">م1</th>
                  <th style={{ border: '1px solid #000', padding: '2px 1px', width: '24px' }} title="اختبار النصفي (30)">ن1</th>
                  <th style={{ border: '1px solid #000', padding: '2px 1px', width: '26px', backgroundColor: '#e2e8f0', fontWeight: 'bold' }} title="مجموع المادة (50)">مج1</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.length > 0 ? (
              students.map((student, idx) => (
                <tr key={student.id} style={{
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc',
                  pageBreakInside: 'avoid'
                }}>
                  <td style={{ border: '1px solid #000', padding: '3px 1px', fontWeight: 'bold' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '3px 1px', fontFamily: 'monospace' }}>{student.student_code || student.id}</td>
                  <td style={{ border: '1px solid #000', padding: '3px 1px', fontFamily: 'monospace' }}>{student.secret_code || '—'}</td>
                  <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {student.name_ar}
                  </td>

                  {subjects.map(sub => {
                    const gradeObj = (student.subjects && student.subjects[sub.id]) || { m1: 0, n1: null, maj1: 0 };
                    return (
                      <React.Fragment key={`cell-${student.id}-${sub.id}`}>
                        <td style={{ border: '1px solid #000', padding: '3px 1px', color: '#334155' }}>
                          {gradeObj.m1 !== undefined ? gradeObj.m1 : 0}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 1px', color: '#1e3a8a', fontWeight: '600' }}>
                          {gradeObj.n1 !== null && gradeObj.n1 !== undefined ? gradeObj.n1 : '—'}
                        </td>
                        <td style={{
                          border: '1px solid #000',
                          padding: '3px 1px',
                          fontWeight: 'bold',
                          backgroundColor: '#f8fafc',
                          color: '#000000'
                        }}>
                          {gradeObj.maj1 !== undefined ? gradeObj.maj1 : 0}
                        </td>
                      </React.Fragment>
                    );
                  })}

                  <td style={{ border: '1px solid #000', padding: '3px 2px', fontWeight: '900', backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                    {student.total !== undefined ? student.total : 0}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 1px', fontWeight: 'bold' }}>
                    {student.percentage !== undefined ? `${student.percentage}%` : '0%'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 1px', fontWeight: 'bold', color: student.rank <= 3 ? '#b45309' : '#334155' }}>
                    {student.rank || idx + 1}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4 + (subjects.length * 3) + 3} style={{ border: '1px solid #000', padding: '24px', textAlign: 'center' }}>
                  لا توجد درجات مرصودة لطلاب هذا الفصل حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* كتلة التوقيعات والاعتماد الرسمية المعتمدة في كشف المدرسة */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          marginTop: '25px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#000000',
          pageBreakInside: 'avoid'
        }}>
          <div>
            <div style={{ marginBottom: '8px' }}>رئيس قسم الامتحانات</div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b' }}>أ / ناصر عتيق</div>
            <div style={{ marginTop: '20px', color: '#64748b', fontSize: '11px' }}>التوقيع: ............................</div>
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>مدير المدرسة</div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b' }}>أ / حكمت عبد الرحمن عثمان</div>
            <div style={{ marginTop: '20px', color: '#64748b', fontSize: '11px' }}>التوقيع والختم: ............................</div>
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>يعتمد - مدير إدارة التربية والتعليم بالمديرية</div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b' }}>أ / حســــن وهبــــــان</div>
            <div style={{ marginTop: '20px', color: '#64748b', fontSize: '11px' }}>التوقيع والختم: ............................</div>
          </div>
        </div>
      </div>

      {/* تنسيقات الطباعة الصارمة لضمان النمط العرضي A4 وعدم قص أي مادة */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 6mm 5mm 6mm 5mm !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print,
          .navbar,
          .sidebar,
          header,
          footer,
          .section-card-header {
            display: none !important;
          }
          .print-midterm-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-official-sheet {
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          .official-grade-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 8.5pt !important;
          }
          .official-grade-table th,
          .official-grade-table td {
            border: 1px solid #000000 !important;
            padding: 2px 1px !important;
          }
          .official-grade-table thead {
            display: table-header-group !important;
          }
          .official-grade-table tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
