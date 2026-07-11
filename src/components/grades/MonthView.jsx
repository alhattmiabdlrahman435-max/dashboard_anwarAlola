import React from 'react';
import { useApp } from '../../context/AppContext';

export default function MonthView({ selectedMonth }) {
  const {
    lang,
    t,
    students,
    getStudentDetailedGrades,
    handleDetailedGradeChange,
    syncGeneralGrades,
    setToastMessage,
    selectedGradeStudentId,
    selectedGradeTerm
  } = useApp();

  const student = students.find(s => s.id === selectedGradeStudentId);

  return (
    <>
      <div style={{ padding: 'var(--space-md)', background: 'var(--gradient-brand)', color: '#ffffff', borderRadius: 'var(--radius-card)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <strong>{lang === 'ar' ? student?.name : student?.nameEn}</strong>
          <span style={{ marginInlineStart: '12px', opacity: 0.8, fontSize: '13px' }}>
            ({lang === 'ar' ? student?.grade : student?.gradeEn} - {student?.section})
          </span>
        </div>
        <div>
          <strong>{lang === 'ar' ? 'الفترة التقييمية: ' : 'Evaluation Period: '} </strong>
          <span>{selectedMonth === 'm1' ? t.m1Label : selectedMonth === 'm2' ? t.m2Label : t.m3Label}</span>
        </div>
      </div>

      <div className="control-grade-table-container">
        <table className="control-grade-table">
          <thead>
            <tr>
              <th>{lang === 'ar' ? 'المادة الدراسية' : 'Academic Subject'}</th>
              <th>{t.hwLabel}</th>
              <th>{t.attLabel}</th>
              <th>{t.behLabel}</th>
              <th>{t.oralLabel}</th>
              <th>{t.wrtLabel}</th>
              <th>{t.monthTotalLabel} (100)</th>
            </tr>
          </thead>
          <tbody>
            {['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'].map((subj) => {
              const subjectLabel = subj === 'الرياضيات' ? t.math 
                : subj === 'العلوم' ? t.science 
                : subj === 'اللغة العربية' ? t.arabic 
                : t.english;
              const sData = getStudentDetailedGrades(selectedGradeStudentId, subj, selectedGradeTerm);
              const mData = sData[selectedMonth] || {};
              const total = (mData.homework||0) + (mData.attendance||0) + (mData.behavior||0) + (mData.oral||0) + (mData.written||0);

              return (
                <tr key={subj}>
                  <td style={{ fontWeight: 'bold' }}>{subjectLabel}</td>
                  <td>
                    <input 
                      type="number" className="grades-input" min="0" max="15" 
                      value={mData.homework ?? 0}
                      onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'homework', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" className="grades-input" min="0" max="15" 
                      value={mData.attendance ?? 0}
                      onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'attendance', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" className="grades-input" min="0" max="10" 
                      value={mData.behavior ?? 0}
                      onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'behavior', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" className="grades-input" min="0" max="10" 
                      value={mData.oral ?? 0}
                      onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'oral', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" className="grades-input" min="0" max="50" 
                      value={mData.written ?? 0}
                      onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, subj, selectedGradeTerm, selectedMonth, 'written', e.target.value)}
                    />
                  </td>
                  <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button 
        className="btn-filled" 
        style={{ alignSelf: 'flex-end', marginTop: 'var(--space-md)' }}
        onClick={() => {
          syncGeneralGrades(selectedGradeStudentId);
          setToastMessage(t.gradesSaveSuccess);
          setTimeout(() => setToastMessage(''), 3000);
        }}
      >
        💾 {t.saveGradesBtn}
      </button>
    </>
  );
}
