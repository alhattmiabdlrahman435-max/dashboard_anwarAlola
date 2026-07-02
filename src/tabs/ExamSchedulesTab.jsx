import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

export default function ExamSchedulesTab() {
  const {
    lang,
    t,
    availableGrades,
    availableSections,
    examSchedules,
    setExamSchedules,
    setToastMessage,
    students,
    setSmsLogs,
    handlePublishExamSchedule: publishExamSchedule,
    handleDeleteExamSchedule
  } = useApp();

  // Modal visibility
  const [showExamScheduleModal, setShowExamScheduleModal] = useState(false);

  // Form Fields
  const [modalExamGrade, setModalExamGrade] = useState('الصف الأول');
  const [modalExamSection, setModalExamSection] = useState('أ');
  const [modalExamTerm, setModalExamTerm] = useState('الفصل الأول');
  const [modalExamPeriod, setModalExamPeriod] = useState('الشهر الأول');

  // Subjects inside the exam schedule (temporary list)
  const [modalExamSubjects, setModalExamSubjects] = useState([]);

  // Sub-form for adding a subject to the temporary list
  const [modalExamSubName, setModalExamSubName] = useState('الرياضيات');
  const [modalExamSubDate, setModalExamSubDate] = useState('');
  const [modalExamSubTime, setModalExamSubTime] = useState('08:00 - 09:30 ص');
  const [modalExamSubNote, setModalExamSubNote] = useState('');

  const handleAddExamSubject = () => {
    if (!modalExamSubDate) {
      setToastMessage(lang === 'ar' ? 'الرجاء تحديد تاريخ الاختبار' : 'Please select exam date');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    const newSubject = {
      id: Date.now() + Math.random(),
      subjectName: modalExamSubName,
      date: modalExamSubDate,
      time: modalExamSubTime,
      note: modalExamSubNote
    };
    setModalExamSubjects(prev => [...prev, newSubject]);
    setModalExamSubDate('');
    setModalExamSubNote('');
  };

  const handlePublishExamSchedule = () => {
    if (modalExamSubjects.length === 0) {
      setToastMessage(lang === 'ar' ? 'الرجاء إضافة مادة واحدة على الأقل للجدول' : 'Please add at least one subject to the schedule');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const newSchedule = {
      id: Date.now(),
      grade: modalExamGrade,
      section: modalExamSection,
      term: modalExamTerm,
      termEn: modalExamTerm === 'الفصل الأول' ? 'First Term' : 'Second Term',
      period: modalExamPeriod,
      periodEn: modalExamPeriod === 'الشهر الأول' ? 'Month 1' : modalExamPeriod === 'الشهر الثاني' ? 'Month 2' : modalExamPeriod === 'الشهر الثالث' ? 'Month 3' : 'Final Term Exam',
      subjects: modalExamSubjects
    };

    publishExamSchedule(newSchedule);
    setModalExamSubjects([]);
    setShowExamScheduleModal(false);
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          📅 {t.examSchedulesTitle}
        </h3>
        
        <button 
          className="btn-accent"
          onClick={() => setShowExamScheduleModal(true)}
        >
          ➕ {t.addExamScheduleBtn}
        </button>
      </div>

      {/* Schedules Grid List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          📋 {t.examSchedulesList}
        </h4>

        {examSchedules.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-xl)'
          }}>
            {examSchedules.map(sched => (
              <div 
                key={sched.id}
                style={{
                  padding: 'var(--space-xl)',
                  backgroundColor: 'var(--color-surface-alt)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--color-shadow)',
                  backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.03) 0%, transparent 50%)'
                }}
                className="printable-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-ui)', paddingBottom: '8px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--color-primary-ui)' }}>
                      {lang === 'ar' ? sched.grade : sched.gradeEn} - {lang === 'ar' ? 'شعبة' : 'Sec'} {sched.section}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? sched.term : sched.termEn} - {lang === 'ar' ? sched.period : sched.periodEn}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      className="btn-elevated no-print" 
                      style={{ color: 'var(--color-error)', borderColor: 'rgba(220, 38, 38, 0.2)', padding: '2px 8px', fontSize: '10px' }}
                      onClick={() => handleDeleteExamSchedule(sched.id)}
                    >
                      {lang === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                    <span style={{ fontSize: '20px' }}>📅</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sched.subjects.map((sub, sidx) => (
                    <div 
                      key={sub.id || sidx}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-card)',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{sub.subjectName}</span>
                        <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>{sub.date}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '11px' }}>
                        <span>⏰ {sub.time}</span>
                        <span>📖 {sub.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)' }}>
            📝 {t.noExamSchedules}
          </div>
        )}
      </div>

      {/* ADD EXAM SCHEDULE MODAL */}
      {showExamScheduleModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '700px' }}>
            <header className="modal-header">
              <h3 className="modal-title">📅 {t.addExamScheduleBtn}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowExamScheduleModal(false);
                  setModalExamSubjects([]);
                }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              
              {/* Header Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-md)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.formGrade}</label>
                  <select value={modalExamGrade} onChange={(e) => setModalExamGrade(e.target.value)} className="text-field" style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}>
                    {availableGrades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.formSection}</label>
                  <select value={modalExamSection} onChange={(e) => setModalExamSection(e.target.value)} className="text-field" style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}>
                    {availableSections.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.selectTerm}</label>
                  <select value={modalExamTerm} onChange={(e) => setModalExamTerm(e.target.value)} className="text-field" style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}>
                    <option value="الفصل الأول">الفصل الدراسي الأول</option>
                    <option value="الفصل الثاني">الفصل الدراسي الثاني</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'الفترة التقييمية' : 'Period'}</label>
                  <select value={modalExamPeriod} onChange={(e) => setModalExamPeriod(e.target.value)} className="text-field" style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}>
                    <option value="الشهر الأول">الشهر الأول</option>
                    <option value="الشهر الثاني">الشهر الثاني</option>
                    <option value="الشهر الثالث">الشهر الثالث</option>
                    <option value="اختبار نهاية الترم">اختبار نهاية الترم</option>
                  </select>
                </div>
              </div>

              {/* Add Exam Subject Sub-Form */}
              <div style={{
                padding: 'var(--space-md)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)'
              }}>
                <strong style={{ fontSize: '13px', color: 'var(--color-primary)' }}>✍️ {t.addExamSubjectBtn}</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px' }}>{t.subjectLabel}</label>
                    <select value={modalExamSubName} onChange={(e) => setModalExamSubName(e.target.value)} className="text-field" style={{ height: '34px', padding: '0 8px', fontSize: '11px' }}>
                      <option value="الرياضيات">{t.math}</option>
                      <option value="العلوم">{t.science}</option>
                      <option value="اللغة العربية">{t.arabic}</option>
                      <option value="اللغة الإنجليزية">{t.english}</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px' }}>{t.examDateLabel}</label>
                    <input type="date" value={modalExamSubDate} onChange={(e) => setModalExamSubDate(e.target.value)} className="text-field" style={{ height: '34px', padding: '0 8px', fontSize: '11px' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px' }}>{t.examTimeLabel}</label>
                    <input type="text" placeholder="08:00 - 09:30 ص" value={modalExamSubTime} onChange={(e) => setModalExamSubTime(e.target.value)} className="text-field" style={{ height: '34px', padding: '0 8px', fontSize: '11px' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px' }}>{t.examNoteLabel}</label>
                    <input type="text" placeholder={lang === 'ar' ? 'المقرر...' : 'Topics...'} value={modalExamSubNote} onChange={(e) => setModalExamSubNote(e.target.value)} className="text-field" style={{ height: '34px', padding: '0 8px', fontSize: '11px' }} />
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-accent"
                  style={{ alignSelf: 'flex-end', height: '32px', minHeight: '32px', fontSize: '11px', padding: '0 12px' }}
                  onClick={handleAddExamSubject}
                >
                  ＋ {lang === 'ar' ? 'إضافة المادة للجدول المؤقت' : 'Add to Temp List'}
                </button>
              </div>

              {/* Added subjects preview list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong style={{ fontSize: '12px' }}>📝 {lang === 'ar' ? 'المواد المضافة حالياً في الجدول:' : 'Current subjects added:'}</strong>
                {modalExamSubjects.length > 0 ? (
                  <div className="students-table-container">
                    <table className="students-table">
                      <thead>
                        <tr>
                          <th>{t.subjectLabel}</th>
                          <th>{t.examDateLabel}</th>
                          <th>{t.examTimeLabel}</th>
                          <th>{t.examNoteLabel}</th>
                          <th>{t.action}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalExamSubjects.map((sub, sidx) => (
                          <tr key={sub.id || sidx}>
                            <td style={{ fontWeight: 'bold' }}>{sub.subjectName}</td>
                            <td>{sub.date}</td>
                            <td>{sub.time}</td>
                            <td>{sub.note}</td>
                            <td>
                              <button 
                                type="button"
                                className="btn-elevated"
                                style={{ color: 'var(--color-error)', borderColor: 'rgba(220, 38, 38, 0.2)', padding: '2px 8px', fontSize: '10px' }}
                                onClick={() => setModalExamSubjects(prev => prev.filter((_, idx) => idx !== sidx))}
                              >
                                {lang === 'ar' ? 'حذف' : 'Remove'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', fontStyle: 'italic', opacity: 0.6, textAlign: 'center', padding: '12px 0' }}>
                    {lang === 'ar' ? 'لا توجد مواد مضافة بعد.' : 'No subjects added to schedule yet.'}
                  </span>
                )}
              </div>

            </div>

            <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: 'var(--space-lg) var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
              <button 
                type="button" 
                className="btn-elevated"
                onClick={() => {
                  setShowExamScheduleModal(false);
                  setModalExamSubjects([]);
                }}
              >
                {t.cancel}
              </button>
              <button 
                type="button" 
                className="btn-filled"
                onClick={handlePublishExamSchedule}
              >
                📢 {lang === 'ar' ? 'نشر الجدول نهائياً' : 'Publish Timetable'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
