import { useApp } from '../../context/AppContext';
import { useStudents } from '../../contexts/Students/useStudents';
import PrintHeader from '../PrintHeader';
import { calculateMonthTotal } from '../../utils/gradesHelper';

const defaultDetailedGradeObj = (hw, att, beh, oral, wrt, final) => ({
  m1: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  m2: { homework: Math.max(0, hw - 1), attendance: att, behavior: beh, oral: Math.max(0, oral - 1), written: Math.max(0, wrt - 2) },
  m3: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  finalExam: final
});

export default function PrintSubjectView() {
  const {
    lang,
    t,
    detailedGrades,
    getStudentDetailedGrades,
    selectedGradeStudentId,
    selectedGradeTerm,
    selectedGradeSubject,
    printSelectedMonth
  } = useApp();

  const { students } = useStudents();

  const student = students.find(s => s.id === selectedGradeStudentId);
  const gradesData = getStudentDetailedGrades(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm);

  const m1_total = calculateMonthTotal(gradesData.m1);
  const m2_total = calculateMonthTotal(gradesData.m2);
  const m3_total = calculateMonthTotal(gradesData.m3);
  
  const monthsAverage = parseFloat(((m1_total + m2_total + m3_total) / 15).toFixed(2));
  const termTotal = parseFloat((monthsAverage + (gradesData.finalExam || 0)).toFixed(2));

  return (
    <div style={{ display: 'none' }} className="print-subject-only-content printable-area">
      <PrintHeader 
        title="كشف تقييم درجات الطالب التفصيلي"
        subtitle={lang === 'ar' 
          ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
          : `Academic Year: 2026 | Term: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
        }
      />

      <div className="printable-only-metadata" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px 0', 
        marginBottom: '20px',
        borderBottom: '1px dashed #cbd5e1',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#0f172a',
        direction: 'rtl'
      }}>
        <div>
          <span>اسم الطالب: </span>
          <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? student?.name : student?.nameEn}</span>
          <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
          <span>الصف: </span>
          <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? student?.grade : student?.gradeEn}</span>
          <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
          <span>الشعبة: </span>
          <span style={{ fontWeight: 'normal' }}>{student?.section}</span>
        </div>
        <div className="print-hide-on-month print-hide-on-term">
          <span>المادة الدراسية: </span>
          <span style={{ fontWeight: 'normal' }}>{selectedGradeSubject}</span>
        </div>
        <div className="print-show-only-on-month" style={{ display: 'none' }}>
          <span>الفترة التقييمية: </span>
          <span style={{ fontWeight: 'normal' }}>
            {printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}
          </span>
        </div>
        <div className="print-show-only-on-term" style={{ display: 'none' }}>
          <span>التقرير: </span>
          <span style={{ fontWeight: 'normal' }}>كشف درجات شامل</span>
        </div>
      </div>

      <div className="control-grade-table-container">
        <table className="control-grade-table">
          <thead>
            <tr>
              <th>{lang === 'ar' ? 'الفترة التقييمية' : 'Evaluation Period'}</th>
              <th>{t.hwLabel}</th>
              <th>{t.attLabel}</th>
              <th>{t.behLabel}</th>
              <th>{t.oralLabel}</th>
              <th>{t.wrtLabel}</th>
              <th>{t.monthTotalLabel} (100)</th>
            </tr>
          </thead>
          <tbody>
            {/* Month 1 */}
            <tr className="print-row-m1">
              <td style={{ fontWeight: 'bold' }}>{t.m1Label}</td>
              <td>
                <span className="print-only-grade-value">{gradesData.m1.homework}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m1.attendance}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m1.behavior}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m1.oral}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m1.written}</span>
              </td>
              <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m1_total}</td>
            </tr>
            
            {/* Month 2 */}
            <tr className="print-row-m2">
              <td style={{ fontWeight: 'bold' }}>{t.m2Label}</td>
              <td>
                <span className="print-only-grade-value">{gradesData.m2.homework}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m2.attendance}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m2.behavior}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m2.oral}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m2.written}</span>
              </td>
              <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m2_total}</td>
            </tr>

            {/* Month 3 */}
            <tr className="print-row-m3">
              <td style={{ fontWeight: 'bold' }}>{t.m3Label}</td>
              <td>
                <span className="print-only-grade-value">{gradesData.m3.homework}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m3.attendance}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m3.behavior}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m3.oral}</span>
              </td>
              <td>
                <span className="print-only-grade-value">{gradesData.m3.written}</span>
              </td>
              <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m3_total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Calculations Panel */}
      <div className="print-hide-on-month print-hide-on-term" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginTop: '20px',
        direction: 'rtl'
      }}>
        <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{t.termAverageLabel}</span>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginTop: '4px' }}>{monthsAverage} / 20</div>
        </div>
        <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{t.finalExamLabel}</span>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginTop: '4px' }}>{gradesData.finalExam} / 30</div>
        </div>
        <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{t.termTotalLabel}</span>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>{termTotal} / 50</div>
        </div>
        {(() => {
          const record = detailedGrades.find(r => r.studentId === selectedGradeStudentId);
          if (!record) return null;
          const t1 = record.grades.term1[selectedGradeSubject] || defaultDetailedGradeObj(0,0,0,0,0,0);
          const t1_tot = calculateMonthTotal(t1.m1) + calculateMonthTotal(t1.m2) + calculateMonthTotal(t1.m3);
          const t1_avg = parseFloat((t1_tot / 15).toFixed(2));
          const t1_final = t1_avg + t1.finalExam;
          const t2 = record.grades.term2[selectedGradeSubject] || defaultDetailedGradeObj(0,0,0,0,0,0);
          const t2_tot = calculateMonthTotal(t2.m1) + calculateMonthTotal(t2.m2) + calculateMonthTotal(t2.m3);
          const t2_avg = parseFloat((t2_tot / 15).toFixed(2));
          const t2_final = t2_avg + t2.finalExam;
          const yearlyTotal = Math.round(t1_final + t2_final);
          return (
            <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{t.yearlyTotalLabel}</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6', marginTop: '4px' }}>{yearlyTotal} / 100</div>
            </div>
          );
        })()}
      </div>

      <div className="printable-only-signatures" style={{ 
        display: 'none', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '48px', 
        paddingTop: '24px',
        borderTop: '1px solid #cbd5e1',
        direction: 'rtl',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#0f172a'
      }}>
        <div style={{ textAlign: 'center', width: '30%' }}>
          <div>توقيع معلم المادة</div>
          <div style={{ height: '40px' }}></div>
          <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
        </div>
        <div style={{ textAlign: 'center', width: '30%' }}>
          <div>مرشد الطلاب</div>
          <div style={{ height: '40px' }}></div>
          <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
        </div>
        <div style={{ textAlign: 'center', width: '30%' }}>
          <div>توقيع مدير المدرسة</div>
          <div style={{ height: '40px' }}></div>
          <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
        </div>
      </div>
    </div>
  );
}
