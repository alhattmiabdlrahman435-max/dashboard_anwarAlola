import React from 'react';
import { useApp } from '../../context/AppContext';
import PrintHeader from '../PrintHeader';

export default function PrintMonthView() {
  const {
    lang,
    t,
    students,
    getStudentDetailedGrades,
    selectedGradeStudentId,
    selectedGradeTerm,
    printSelectedMonth
  } = useApp();

  const student = students.find(s => s.id === selectedGradeStudentId);

  return (
    <div style={{ display: 'none' }} className="print-month-full-report printable-area">
      <PrintHeader 
        title="كشف درجات التقييم الشهري"
        subtitle={lang === 'ar' 
          ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label} | الفترة: ${printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}`
          : `Academic Year: 2026 | Term: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label} | Period: ${printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}`
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
          <span>الفترة التقييمية: </span>
          <span style={{ fontWeight: 'normal' }}>{printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}</span>
        </div>
      </div>

      <table style={{ 
        width: '100%', borderCollapse: 'collapse', fontSize: '11px',
        border: '1px solid #cbd5e1',
        direction: 'rtl'
      }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'واجبات (١٥)' : 'HW (15)'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'مواظبة (١٥)' : 'Att (15)'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'سلوك (١٠)' : 'Beh (10)'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'شفوي (١٠)' : 'Oral (10)'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'تحريري (٥٠)' : 'Written (50)'}</th>
            <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{lang === 'ar' ? 'المجموع' : 'Total'}</th>
          </tr>
        </thead>
        <tbody>
          {['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'].map((subj) => {
            const subjectLabel = subj === 'الرياضيات' ? t.math 
              : subj === 'العلوم' ? t.science 
              : subj === 'اللغة العربية' ? t.arabic 
              : t.english;
            const sData = getStudentDetailedGrades(selectedGradeStudentId, subj, selectedGradeTerm);
            const mData = sData[printSelectedMonth] || {};
            const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);

            return (
              <tr key={subj}>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', fontWeight: '600', color: '#1e293b' }}>{subjectLabel}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.homework ?? 0}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.attendance ?? 0}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.behavior ?? 0}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.oral ?? 0}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{mData.written ?? 0}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{total}</td>
              </tr>
            );
          })}
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
      }} className="print-month-signatures">
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
