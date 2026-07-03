import React from 'react';
import { useApp } from '../../context/AppContext';
import PrintHeader from '../PrintHeader';

export default function PrintTermView() {
  const {
    lang,
    t,
    students,
    getStudentDetailedGrades,
    selectedGradeStudentId,
    selectedGradeTerm
  } = useApp();

  const student = students.find(s => s.id === selectedGradeStudentId);

  return (
    <div style={{ display: 'none' }} className="print-term-full-report printable-area">
      <PrintHeader 
        title="كشف درجات الفصل الدراسي"
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
        <div>
          <span>التقرير: </span>
          <span style={{ fontWeight: 'normal' }}>{lang === 'ar' ? 'كشف درجات شامل بالفصل الدراسي' : 'Full Term Academic Report'}</span>
        </div>
      </div>

      <table style={{ 
        width: '100%', borderCollapse: 'collapse', fontSize: '11px',
        border: '1px solid #cbd5e1',
        direction: 'rtl'
      }} className="print-term-table">
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المحصلة (من ٢٠)' : 'Year\'s Work (20)'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'الاختبار النهائي (من ٣٠)' : 'Final Exam (30)'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المجموع (من ٥٠)' : 'Total (50)'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'التقدير' : 'Appreciation'}</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const subjectsList = ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'];
            let totalTermSum = 0;

            const rows = subjectsList.map((subj) => {
              const subjectLabel = subj === 'الرياضيات' ? t.math 
                : subj === 'العلوم' ? t.science 
                : subj === 'اللغة العربية' ? t.arabic 
                : t.english;
              const sData = getStudentDetailedGrades(selectedGradeStudentId, subj, selectedGradeTerm);
              const calcTotal = (m) => (m.homework||0) + (m.attendance||0) + (m.behavior||0) + (m.oral||0) + (m.written||0);
              const tm1 = calcTotal(sData.m1);
              const tm2 = calcTotal(sData.m2);
              const tm3 = calcTotal(sData.m3);
              const avgMonths = parseFloat(((tm1 + tm2 + tm3) / 15).toFixed(2));
              const finalExamScore = sData.finalExam || 0;
              const termSum = parseFloat((avgMonths + finalExamScore).toFixed(2));
              totalTermSum += termSum;

              const pct = (termSum / 50) * 100;
              let appreciation = '';
              if (pct >= 90) appreciation = lang === 'ar' ? 'ممتاز' : 'Excellent';
              else if (pct >= 80) appreciation = lang === 'ar' ? 'جيد جداً' : 'Very Good';
              else if (pct >= 70) appreciation = lang === 'ar' ? 'جيد' : 'Good';
              else if (pct >= 50) appreciation = lang === 'ar' ? 'مقبول' : 'Pass';
              else appreciation = lang === 'ar' ? 'ضعيف' : 'Fail';

              return (
                <tr key={subj}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', fontWeight: '600', color: '#1e293b' }}>{subjectLabel}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{avgMonths}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{finalExamScore}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{termSum}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: pct >= 50 ? '#0f766e' : '#be123c' }}>{appreciation}</td>
                </tr>
              );
            });

            const avgPercentage = parseFloat(((totalTermSum / 200) * 100).toFixed(2));
            let finalAppreciation = '';
            if (avgPercentage >= 90) finalAppreciation = lang === 'ar' ? 'ممتاز' : 'Excellent';
            else if (avgPercentage >= 80) finalAppreciation = lang === 'ar' ? 'جيد جداً' : 'Very Good';
            else if (avgPercentage >= 70) finalAppreciation = lang === 'ar' ? 'جيد' : 'Good';
            else if (avgPercentage >= 50) finalAppreciation = lang === 'ar' ? 'مقبول' : 'Pass';
            else finalAppreciation = lang === 'ar' ? 'ضعيف' : 'Fail';

            return (
              <>
                {rows}
                <tr style={{ background: '#f8fafc', fontWeight: '800' }}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', color: '#0f172a' }}>
                    {lang === 'ar' ? 'المعدل العام والتقدير' : 'Overall Average & Grade'}
                  </td>
                  <td colSpan="2" style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>
                    {lang === 'ar' ? `النسبة: ${avgPercentage}%` : `Percentage: ${avgPercentage}%`}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', color: '#0f766e', fontSize: '12px' }}>
                    {parseFloat(totalTermSum.toFixed(2))} / 200
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', color: '#0f766e' }}>
                    {finalAppreciation}
                  </td>
                </tr>
              </>
            );
          })()}
        </tbody>
      </table>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '36px', 
        paddingTop: '20px',
        borderTop: '1px solid #cbd5e1',
        direction: 'rtl',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#0f172a'
      }}>
        <div style={{ textAlign: 'center', width: '30%' }}>
          <div>توقيع مربي الفصل</div>
          <div style={{ height: '35px' }}></div>
          <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
        </div>
        <div style={{ textAlign: 'center', width: '30%' }}>
          <div>المرشد الطلابي</div>
          <div style={{ height: '35px' }}></div>
          <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
        </div>
        <div style={{ textAlign: 'center', width: '30%' }}>
          <div>مدير المدرسة / الختم</div>
          <div style={{ height: '35px' }}></div>
          <div style={{ borderBottom: '1px dotted #94a3b8', width: '80%', margin: '0 auto' }}></div>
        </div>
      </div>
    </div>
  );
}
