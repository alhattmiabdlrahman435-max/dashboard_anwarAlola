import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateMonthTotal } from '../../utils/gradesHelper';

const defaultDetailedGradeObj = (hw, att, beh, oral, wrt, final) => ({
  m1: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  m2: { homework: Math.max(0, hw - 1), attendance: att, behavior: beh, oral: Math.max(0, oral - 1), written: Math.max(0, wrt - 2) },
  m3: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  finalExam: final
});

export default function SubjectView() {
  const {
    lang,
    t,
    students,
    detailedGrades,
    getStudentDetailedGrades,
    handleDetailedGradeChange,
    syncGeneralGrades,
    setToastMessage,
    selectedGradeStudentId,
    selectedGradeTerm,
    selectedGradeSubject
  } = useApp();

  const student = students.find(s => s.id === selectedGradeStudentId);
  const gradesData = getStudentDetailedGrades(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm);

  const m1_total = calculateMonthTotal(gradesData.m1);
  const m2_total = calculateMonthTotal(gradesData.m2);
  const m3_total = calculateMonthTotal(gradesData.m3);
  
  const monthsAverage = parseFloat(((m1_total + m2_total + m3_total) / 15).toFixed(2));
  const termTotal = parseFloat((monthsAverage + (gradesData.finalExam || 0)).toFixed(2));

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
          <strong>{t.subjectLabel}: </strong>
          <span>{selectedGradeSubject}</span>
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
            <tr>
              <td style={{ fontWeight: 'bold' }}>{t.m1Label}</td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="15" 
                  value={gradesData.m1.homework}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'homework', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="15" 
                  value={gradesData.m1.attendance}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'attendance', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="10" 
                  value={gradesData.m1.behavior}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'behavior', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="10" 
                  value={gradesData.m1.oral}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'oral', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="50" 
                  value={gradesData.m1.written}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'written', e.target.value)}
                />
              </td>
              <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m1_total}</td>
            </tr>
            
            {/* Month 2 */}
            <tr>
              <td style={{ fontWeight: 'bold' }}>{t.m2Label}</td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="15" 
                  value={gradesData.m2.homework}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'homework', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="15" 
                  value={gradesData.m2.attendance}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'attendance', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="10" 
                  value={gradesData.m2.behavior}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'behavior', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="10" 
                  value={gradesData.m2.oral}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'oral', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="50" 
                  value={gradesData.m2.written}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'written', e.target.value)}
                />
              </td>
              <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m2_total}</td>
            </tr>

            {/* Month 3 */}
            <tr>
              <td style={{ fontWeight: 'bold' }}>{t.m3Label}</td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="15" 
                  value={gradesData.m3.homework}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'homework', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="15" 
                  value={gradesData.m3.attendance}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'attendance', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="10" 
                  value={gradesData.m3.behavior}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'behavior', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="10" 
                  value={gradesData.m3.oral}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'oral', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" className="grades-input" min="0" max="50" 
                  value={gradesData.m3.written}
                  onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'written', e.target.value)}
                />
              </td>
              <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m3_total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Calculations Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-lg)',
        marginTop: 'var(--space-md)'
      }}>
        {/* Term Average */}
        <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            📈 {t.termAverageLabel}
          </span>
          <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-primary)', marginTop: '8px' }}>
            {monthsAverage} / 20
          </div>
          <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
            {lang === 'ar' ? '(مجموع الـ ٣ أشهر مقسوماً على ١٥)' : '(Total of 3 months divided by 15)'}
          </span>
        </div>

        {/* Final Exam Grade */}
        <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            📝 {t.finalExamLabel}
          </span>
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <input 
              type="number" 
              className="grades-input" 
              style={{ width: '100px', fontSize: '20px', height: '46px', textAlign: 'center', fontWeight: 'bold' }} 
              min="0" max="30"
              value={gradesData.finalExam}
              onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'finalExam', '', e.target.value)}
            />
          </div>
        </div>

        {/* Total Term Grade */}
        <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            🏆 {t.termTotalLabel}
          </span>
          <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-success)', marginTop: '8px' }}>
            {termTotal} / 50
          </div>
          <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
            {lang === 'ar' ? '(المحصلة + درجة النهائي)' : '(Avg + Final Exam score)'}
          </span>
        </div>

        {/* Yearly Total Grade */}
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
            <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                👑 {t.yearlyTotalLabel}
              </span>
              <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-accent)', marginTop: '8px' }}>
                {yearlyTotal} / 100
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? `(الفصل ١: ${t1_final.toFixed(1)} + الفصل ٢: ${t2_final.toFixed(1)})` : `(T1: ${t1_final.toFixed(1)} + T2: ${t2_final.toFixed(1)})`}
              </span>
            </div>
          );
        })()}
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
