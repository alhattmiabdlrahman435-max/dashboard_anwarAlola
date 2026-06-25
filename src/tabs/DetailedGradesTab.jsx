import React from 'react';
import { useApp } from '../context/AppContext';
import PrintHeader from '../components/PrintHeader';

const defaultDetailedGradeObj = (hw, att, beh, oral, wrt, final) => ({
  m1: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  m2: { homework: Math.max(0, hw - 1), attendance: att, behavior: beh, oral: Math.max(0, oral - 1), written: Math.max(0, wrt - 2) },
  m3: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  finalExam: final
});

export default function DetailedGradesTab() {
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
    setSelectedGradeStudentId,
    selectedGradeTerm,
    setSelectedGradeTerm,
    selectedGradeSubject,
    setSelectedGradeSubject,
    setShowPrintModal,
    printSelectedMonth
  } = useApp();

  const student = students.find(s => s.id === selectedGradeStudentId);
  const gradesData = getStudentDetailedGrades(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm);

  // Month totals
  const calculateMonthTotal = (monthObj) => {
    return (monthObj.homework || 0) + (monthObj.attendance || 0) + (monthObj.behavior || 0) + (monthObj.oral || 0) + (monthObj.written || 0);
  };

  const m1_total = calculateMonthTotal(gradesData.m1);
  const m2_total = calculateMonthTotal(gradesData.m2);
  const m3_total = calculateMonthTotal(gradesData.m3);
  
  // Outcome calculation (Term Average out of 20)
  const monthsAverage = parseFloat(((m1_total + m2_total + m3_total) / 15).toFixed(2));
  const termTotal = parseFloat((monthsAverage + (gradesData.finalExam || 0)).toFixed(2));

  return (
    <div className="section-card">
      {/* Header with Print Button */}
      <div className="section-card-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px', margin: 0 }}>
          📊 {t.detailedGradesTitle}
        </h3>
        <button 
          className="btn-elevated"
          onClick={() => setShowPrintModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          🖨️ {lang === 'ar' ? 'طباعة كشف الدرجات' : 'Print Report Card'}
        </button>
      </div>

      {/* Selection Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)'
      }} className="no-print">
        
        {/* Select Student */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.selectStudent}</label>
          <select 
            value={selectedGradeStudentId}
            onChange={(e) => setSelectedGradeStudentId(Number(e.target.value))}
            className="text-field"
            style={{ height: '40px', padding: '0 12px' }}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{lang === 'ar' ? s.name : s.nameEn} ({s.id})</option>
            ))}
          </select>
        </div>

        {/* Select Term */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.selectTerm}</label>
          <select 
            value={selectedGradeTerm}
            onChange={(e) => setSelectedGradeTerm(e.target.value)}
            className="text-field"
            style={{ height: '40px', padding: '0 12px' }}
          >
            <option value="term1">{t.term1Label}</option>
            <option value="term2">{t.term2Label}</option>
          </select>
        </div>

        {/* Select Subject */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.subjectLabel}</label>
          <select 
            value={selectedGradeSubject}
            onChange={(e) => setSelectedGradeSubject(e.target.value)}
            className="text-field"
            style={{ height: '40px', padding: '0 12px' }}
          >
            <option value="الرياضيات">{t.math}</option>
            <option value="العلوم">{t.science}</option>
            <option value="اللغة العربية">{t.arabic}</option>
            <option value="اللغة الإنجليزية">{t.english}</option>
          </select>
        </div>
      </div>

      {/* Grading Grid Sheet */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Print-only Page Style Setup */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page {
                size: portrait;
                margin: 1.5cm;
              }
              body {
                background: #ffffff !important;
                color: #000000 !important;
              }
              .section-card {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                background: transparent !important;
              }
              .control-grade-table th {
                background-color: #f8fafc !important;
                color: #0f172a !important;
                border-bottom: 2px solid #0f172a !important;
                font-weight: bold !important;
              }
              .control-grade-table td, .control-grade-table th {
                border-color: #cbd5e1 !important;
                padding: 10px !important;
                font-size: 11px !important;
              }
              .print-only-grade-value {
                display: inline !important;
                font-weight: bold !important;
              }
              .printable-only-header,
              .printable-only-metadata,
              .printable-only-signatures {
                display: flex !important;
              }
            }
          `}} />

          <div className="print-subject-only-content">
            <PrintHeader 
              title="كشف تقييم درجات الطالب التفصيلي"
              subtitle={lang === 'ar' 
                ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
                : `Academic Year: 2026 | Term: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
              }
            />

            {/* Print-only Student Metadata Block */}
            <div className="printable-only-metadata" style={{ 
              display: 'none', 
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

            {/* Screen View Banner */}
            <div className="no-print" style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-primary-ui)', color: '#ffffff', borderRadius: 'var(--radius-card)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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
                  <tr className="print-row-m1">
                    <td style={{ fontWeight: 'bold' }}>{t.m1Label}</td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="15" 
                        value={gradesData.m1.homework}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'homework', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m1.homework}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="15" 
                        value={gradesData.m1.attendance}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'attendance', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m1.attendance}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="10" 
                        value={gradesData.m1.behavior}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'behavior', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m1.behavior}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="10" 
                        value={gradesData.m1.oral}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'oral', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m1.oral}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="50" 
                        value={gradesData.m1.written}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm1', 'written', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m1.written}</span>
                    </td>
                    <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m1_total}</td>
                  </tr>
                  
                  {/* Month 2 */}
                  <tr className="print-row-m2">
                    <td style={{ fontWeight: 'bold' }}>{t.m2Label}</td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="15" 
                        value={gradesData.m2.homework}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'homework', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m2.homework}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="15" 
                        value={gradesData.m2.attendance}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'attendance', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m2.attendance}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="10" 
                        value={gradesData.m2.behavior}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'behavior', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m2.behavior}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="10" 
                        value={gradesData.m2.oral}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'oral', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m2.oral}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="50" 
                        value={gradesData.m2.written}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm2', 'written', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m2.written}</span>
                    </td>
                    <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m2_total}</td>
                  </tr>

                  {/* Month 3 */}
                  <tr className="print-row-m3">
                    <td style={{ fontWeight: 'bold' }}>{t.m3Label}</td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="15" 
                        value={gradesData.m3.homework}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'homework', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m3.homework}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="15" 
                        value={gradesData.m3.attendance}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'attendance', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m3.attendance}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="10" 
                        value={gradesData.m3.behavior}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'behavior', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m3.behavior}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="10" 
                        value={gradesData.m3.oral}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'oral', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m3.oral}</span>
                    </td>
                    <td>
                      <input 
                        type="number" className="grades-input no-print" min="0" max="50" 
                        value={gradesData.m3.written}
                        onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'm3', 'written', e.target.value)}
                      />
                      <span className="print-only-grade-value" style={{ display: 'none' }}>{gradesData.m3.written}</span>
                    </td>
                    <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m3_total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations Panel */}
            <div className="print-hide-on-month print-hide-on-term" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-lg)',
              marginTop: 'var(--space-md)'
            }}>
              
              {/* Term Average out of 20 */}
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

              {/* Final Exam Grade out of 30 */}
              <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  📝 {t.finalExamLabel}
                </span>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    className="grades-input no-print" 
                    style={{ width: '100px', fontSize: '20px', height: '46px', textAlign: 'center', fontWeight: 'bold' }} 
                    min="0" max="30"
                    value={gradesData.finalExam}
                    onChange={(e) => handleDetailedGradeChange(selectedGradeStudentId, selectedGradeSubject, selectedGradeTerm, 'finalExam', '', e.target.value)}
                  />
                  <span className="print-only-grade-value" style={{ display: 'none', fontSize: '26px', fontWeight: '900', color: 'var(--color-primary)' }}>{gradesData.finalExam} / 30</span>
                </div>
              </div>

              {/* Total Term Grade out of 50 */}
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

              {/* Yearly Total Grade out of 100 */}
              {(() => {
                const record = detailedGrades.find(r => r.studentId === selectedGradeStudentId);
                if (!record) return null;
                
                // Term 1 Calculations
                const t1 = record.grades.term1[selectedGradeSubject] || defaultDetailedGradeObj(0,0,0,0,0,0);
                const t1_tot = calculateMonthTotal(t1.m1) + calculateMonthTotal(t1.m2) + calculateMonthTotal(t1.m3);
                const t1_avg = parseFloat((t1_tot / 15).toFixed(2));
                const t1_final = t1_avg + t1.finalExam;
                
                // Term 2 Calculations
                const t2 = record.grades.term2[selectedGradeSubject] || defaultDetailedGradeObj(0,0,0,0,0,0);
                const t2_tot = calculateMonthTotal(t2.m1) + calculateMonthTotal(t2.m2) + calculateMonthTotal(t2.m3);
                const t2_avg = parseFloat((t2_tot / 15).toFixed(2));
                const t2_final = t2_avg + t2.finalExam;

                const yearlyTotal = Math.round(t1_final + t2_final);

                return (
                  <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', textAlign: 'center', gridColumn: 'span 1' }}>
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

            {/* Print-only Signatures Block */}
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

          {/* Screen-only Save button */}
          <button 
            className="btn-filled no-print" 
            style={{ alignSelf: 'flex-end', marginTop: 'var(--space-md)' }}
            onClick={() => {
              syncGeneralGrades(selectedGradeStudentId);
              setToastMessage(t.gradesSaveSuccess);
              setTimeout(() => setToastMessage(''), 3000);
            }}
          >
            💾 {t.saveGradesBtn}
          </button>

          {/* ========== PRINT-ONLY: FULL TERM REPORT (all subjects consolidated) ========== */}
          <div style={{ display: 'none' }} className="print-term-full-report">
            <PrintHeader 
              title="كشف درجات الفصل الدراسي"
              subtitle={lang === 'ar' 
                ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
                : `Academic Year: 2026 | Term: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
              }
            />

            {/* Print-only Student Metadata Block */}
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

            {/* Consolidated single table of all subjects */}
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

                    // Helper for appreciation
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

            {/* Dedicated print-only signatures for Term Report */}
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

          {/* ========== PRINT-ONLY: FULL MONTH REPORT (all subjects) ========== */}
          <div style={{ display: 'none' }} className="print-month-full-report">
            <PrintHeader 
              title="كشف درجات التقييم الشهري"
              subtitle={lang === 'ar' 
                ? `العام الدراسي: ١٤٤٧ هـ | الفصل الدراسي: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label} | الفترة: ${printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}`
                : `Academic Year: 2026 | Term: ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label} | Period: ${printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label}`
              }
            />

            {/* Print-only Student Metadata Block */}
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

            {/* A single clean table displaying all subjects for this month */}
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

            {/* Dedicated print-only signatures for Month Report */}
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
        </div>
      </div>
    </div>
  );
}
