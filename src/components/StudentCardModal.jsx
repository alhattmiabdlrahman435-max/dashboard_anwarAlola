import { useApp } from '../context/AppContext';
import { X, Printer, Calendar, BookOpen, FileText } from 'lucide-react';
import sloganLogo from '../assets/slogan.jpeg';

export default function StudentCardModal() {
  const {
    lang, t, students,
    showCardVisualizerModal, setShowCardVisualizerModal,
    selectedStudentForCard, setSelectedStudentForCard,
    showPrintModal, setShowPrintModal,
    printMode, setPrintMode,
    printSelectedMonth, setPrintSelectedMonth,
    selectedGradeStudentId,
    selectedGradeTerm,
    selectedGradeSubject,
    printStudentObject, setPrintStudentObject,
    renderAvatar
  } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const executePrint = () => {
    setShowPrintModal(false);
    setTimeout(() => {
      window.print();
      const afterPrintCleanup = () => {
        document.body.removeAttribute('data-print-mode');
        document.body.removeAttribute('data-print-month');
      };
      window.addEventListener('afterprint', afterPrintCleanup, { once: true });
    }, 150);
  };

  return (
    <>
      {/* MODAL DIALOG 2: SMART QR CARD VISUALIZER */}
      {showCardVisualizerModal && selectedStudentForCard && (
        <div className="modal-overlay no-print animate-fade-in">
          <div className="modal-container glass-panel animate-scale-up" style={{ maxWidth: '380px' }}>
            <header className="modal-header no-print">
              <h3 className="modal-title">🪪 {t.viewCard}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowCardVisualizerModal(false);
                  setSelectedStudentForCard(null);
                }}
                aria-label="Close Smart Card View"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="modal-body student-card-visualizer">
              <div className="student-id-card">
                <img 
                  src={sloganLogo} 
                  alt="School Logo" 
                  style={{ 
                    height: '42px', 
                    width: '42px', 
                    objectFit: 'contain',
                    borderRadius: '50%',
                    border: '1.5px solid var(--color-border)',
                    padding: '2px',
                    backgroundColor: '#ffffff',
                    marginTop: '5px',
                    marginBottom: '5px'
                  }} 
                />
                <div className="card-school-title" style={{ marginTop: '2px', marginBottom: '12px', fontSize: '0.78rem', textAlign: 'center', fontWeight: '800' }}>
                  {lang === 'ar' ? 'رياض و مدارس انوار العلى الدولية النموذجية' : 'Riyadh & Anwar Al-Ola International Model Schools'}
                </div>
                
                <div className="card-avatar" style={{ overflow: 'hidden' }}>
                  {renderAvatar(selectedStudentForCard.photo, "👨‍🎓", { width: '100%', height: '100%', marginInlineEnd: 0, fontSize: '40px' })}
                </div>

                <div className="card-name">
                  {lang === 'ar' ? selectedStudentForCard.name : selectedStudentForCard.nameEn}
                </div>

                <div className="card-detail-row">
                  <div className="card-detail-item">
                    <span style={{ fontSize: '10px' }}>{t.grade}</span>
                    <span className="card-detail-val">
                      {lang === 'ar' ? selectedStudentForCard.grade : selectedStudentForCard.gradeEn}
                    </span>
                  </div>
                  <div className="card-detail-item">
                    <span style={{ fontSize: '10px' }}>{t.section}</span>
                    <span className="card-detail-val">
                      {lang === 'ar' ? selectedStudentForCard.section : selectedStudentForCard.sectionEn}
                    </span>
                  </div>
                </div>

                <div className="card-qr-box">
                  <svg className="card-qr-svg" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="none" />
                    <rect x="0" y="0" width="30" height="30" fill="var(--color-primary)" />
                    <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="10" width="10" height="10" fill="var(--color-primary)" />

                    <rect x="70" y="0" width="30" height="30" fill="var(--color-primary)" />
                    <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="80" y="10" width="10" height="10" fill="var(--color-primary)" />

                    <rect x="0" y="70" width="30" height="30" fill="var(--color-primary)" />
                    <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="80" width="10" height="10" fill="var(--color-primary)" />

                    <rect x="40" y="10" width="10" height="10" fill="var(--color-primary)" />
                    <rect x="50" y="20" width="10" height="10" fill="var(--color-primary)" />
                    <rect x="40" y="40" width="20" height="20" fill="var(--color-primary)" />
                    <rect x="80" y="45" width="10" height="10" fill="var(--color-primary)" />
                    <rect x="15" y="45" width="10" height="10" fill="var(--color-primary)" />
                    <rect x="45" y="75" width="15" height="15" fill="var(--color-primary)" />
                    <rect x="75" y="75" width="20" height="10" fill="var(--color-primary)" />
                  </svg>
                </div>

                <div className="card-id-number">
                  {selectedStudentForCard.qrCode}
                </div>
              </div>

              {(() => {
                const siblings = students.filter(s => s.parentNationalId === selectedStudentForCard.parentNationalId && s.id !== selectedStudentForCard.id);
                if (siblings.length === 0) return null;
                return (
                  <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-chip)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }} className="no-print">
                    <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '6px', color: 'var(--color-primary-ui)', textAlign: 'start' }}>
                      👥 {t.siblings} ({siblings.length}):
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'start' }}>
                      {siblings.map(sib => (
                        <li key={sib.id} style={{ color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>🔹</span>
                          <span>{lang === 'ar' ? sib.name : sib.nameEn} ({lang === 'ar' ? sib.grade : sib.gradeEn} - {lang === 'ar' ? sib.section : sib.sectionEn})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>

            <footer className="modal-footer no-print">
              <button 
                className="btn-elevated"
                onClick={() => {
                  setShowCardVisualizerModal(false);
                  setSelectedStudentForCard(null);
                }}
                style={{ height: '44px' }}
              >
                {t.closeBtn}
              </button>
              <button 
                className="btn-filled"
                onClick={handlePrint}
                style={{ height: '44px' }}
              >
                🖨️ {t.printBtn}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ===== PRINT OPTIONS MODAL ===== */}
      {showPrintModal && (
        <div className="modal-overlay no-print animate-fade-in" style={{ zIndex: 99999 }} onClick={() => setShowPrintModal(false)}>
          <div 
            className="modal-container glass-panel print-options-modal animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '560px', width: '100%', padding: 0, overflow: 'hidden' }}
          >
            <div className="print-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="print-modal-icon">
                  <Printer size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>{t.printOptionsTitle}</h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>{t.printOptionsSubtitle}</p>
                </div>
              </div>
              <button className="print-modal-close-btn" onClick={() => setShowPrintModal(false)}>✕</button>
            </div>

            <div className="print-modal-body">
              {(() => {
                const student = students.find(s => s.id === selectedGradeStudentId);
                return (
                  <div className="print-modal-student-banner">
                    {renderAvatar(student?.photo, "👨‍🎓")}
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{lang === 'ar' ? student?.name : student?.nameEn}</div>
                      <div style={{ fontSize: '12px', opacity: 0.75 }}>
                        {lang === 'ar' ? student?.grade : student?.gradeEn} — {student?.section}
                        <span style={{ marginInline: '8px', opacity: 0.4 }}>|</span>
                        {selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                {t.printModeLabel}
              </p>

              <div className="print-mode-cards">
                <div 
                  className={`print-mode-card ${printMode === 'month' ? 'selected' : ''}`}
                  onClick={() => setPrintMode('month')}
                >
                  <div className="print-mode-card-icon month-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="print-mode-card-content">
                    <div className="print-mode-card-title">{t.printByMonth}</div>
                    <div className="print-mode-card-desc">{t.printByMonthDesc}</div>
                  </div>
                  <div className="print-mode-card-radio">
                    <div className={`radio-dot ${printMode === 'month' ? 'active' : ''}`}/>
                  </div>
                </div>

                <div 
                  className={`print-mode-card ${printMode === 'subject' ? 'selected' : ''}`}
                  onClick={() => setPrintMode('subject')}
                >
                  <div className="print-mode-card-icon subject-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="print-mode-card-content">
                    <div className="print-mode-card-title">{t.printBySubject}</div>
                    <div className="print-mode-card-desc">{t.printBySubjectDesc}</div>
                  </div>
                  <div className="print-mode-card-radio">
                    <div className={`radio-dot ${printMode === 'subject' ? 'active' : ''}`}/>
                  </div>
                </div>

                <div 
                  className={`print-mode-card ${printMode === 'term' ? 'selected' : ''}`}
                  onClick={() => setPrintMode('term')}
                >
                  <div className="print-mode-card-icon term-icon">
                    <FileText size={20} />
                  </div>
                  <div className="print-mode-card-content">
                    <div className="print-mode-card-title">{t.printByTerm}</div>
                    <div className="print-mode-card-desc">{t.printByTermDesc}</div>
                  </div>
                  <div className="print-mode-card-radio">
                    <div className={`radio-dot ${printMode === 'term' ? 'active' : ''}`}/>
                  </div>
                </div>
              </div>

              {printMode === 'month' && (
                <div className="print-sub-options">
                  <label className="print-sub-label">{t.selectMonthLabel}</label>
                  <div className="print-month-chips">
                    {[
                      { key: 'm1', label: t.m1Label },
                      { key: 'm2', label: t.m2Label },
                      { key: 'm3', label: t.m3Label },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        className={`month-chip ${printSelectedMonth === key ? 'active' : ''}`}
                        onClick={() => setPrintSelectedMonth(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="print-sub-note">
                    {lang === 'ar' 
                      ? `سيتم طباعة درجات ${printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label} لجميع المواد الدراسية`
                      : `Will print grades for ${printSelectedMonth === 'm1' ? t.m1Label : printSelectedMonth === 'm2' ? t.m2Label : t.m3Label} for all academic subjects`
                    }
                  </div>
                </div>
              )}

              {printMode === 'subject' && (
                <div className="print-sub-options">
                  <div className="print-sub-note">
                    {lang === 'ar' 
                      ? `سيتم طباعة جميع الأشهر الثلاثة + درجة النهائي — مادة: ${selectedGradeSubject} — ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
                      : `Will print all 3 months + final exam — Subject: ${selectedGradeSubject} — ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
                    }
                  </div>
                </div>
              )}

              {printMode === 'term' && (
                <div className="print-sub-options">
                  <div className="print-sub-note">
                    {lang === 'ar' 
                      ? `سيتم طباعة كشف شامل لجميع المواد الأربع في ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label} بالكامل`
                      : `Will print a full report for all 4 subjects in ${selectedGradeTerm === 'term1' ? t.term1Label : t.term2Label}`
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="print-modal-footer">
              <button className="btn-ghost" onClick={() => setShowPrintModal(false)}>
                {t.closeBtn}
              </button>
              <button 
                className="btn-filled print-confirm-btn"
                onClick={() => {
                  document.body.setAttribute('data-print-mode', printMode);
                  document.body.setAttribute('data-print-month', printSelectedMonth);
                  executePrint();
                }}
              >
                <Printer size={16} strokeWidth={2.5} />
                {t.confirmPrintBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
