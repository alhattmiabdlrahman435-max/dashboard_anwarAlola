import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PrintHeader from '../components/PrintHeader';

export default function ControlTab() {
  const {
    lang,
    t,
    grades,
    students,
    isGradesEncrypted,
    setIsGradesEncrypted,
    setToastMessage,
    handleCalculateSecretCodes,
    handleEnterGradeBySecretCode
  } = useApp();

  const [secretTermInput, setSecretTermInput] = useState('term1');
  const [secretSubjectInput, setSecretSubjectInput] = useState('الرياضيات');
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [secretGradeInput, setSecretGradeInput] = useState('');

  const handleToggleEncryption = () => {
    if (!isGradesEncrypted) {
      handleCalculateSecretCodes();
    } else {
      setIsGradesEncrypted(false);
      setToastMessage(lang === 'ar' ? 'تم إلغاء التشفير وإظهار الأسماء' : 'Decrypted and names revealed');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleSaveGrade = () => {
    if (!secretCodeInput || secretGradeInput === '') {
      setToastMessage(lang === 'ar' ? 'الرجاء إدخال الرقم السري والدرجة' : 'Please enter secret code and grade');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const success = handleEnterGradeBySecretCode(
      secretCodeInput,
      secretGradeInput,
      secretSubjectInput,
      secretTermInput
    );

    if (success) {
      setSecretCodeInput('');
      setSecretGradeInput('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          {t.controlTitle}
        </h3>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Encrypted switch toggle */}
          <button 
            className="btn-accent"
            onClick={handleToggleEncryption}
          >
            🔒 {isGradesEncrypted ? t.decryptNames : t.generateSecretCodes}
          </button>

          <button 
            className="btn-elevated"
            onClick={handlePrint}
          >
            🖨️ {t.printSheet}
          </button>
        </div>
      </div>

      {/* Secret Code Final Grade Entry Form */}
      <div className="no-print" style={{
        marginBottom: 'var(--space-lg)',
        padding: 'var(--space-lg)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-xs)' }}>
          <span style={{ fontSize: '1.25rem' }}>📝</span>
          <h4 className="title-medium" style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-primary-ui)' }}>
            {lang === 'ar' ? "رصد درجات الاختبار النهائي بالرقم السري (٣٠ درجة)" : "Enter Final Exam Grades by Secret Code (30 Marks)"}
          </h4>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {/* Select Term */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="secretTermInput" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {lang === 'ar' ? "الفصل الدراسي" : "Term"}
            </label>
            <select
              id="secretTermInput"
              className="text-field"
              style={{ height: '44px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={secretTermInput}
              onChange={(e) => setSecretTermInput(e.target.value)}
            >
              <option value="term1">{t.term1Label}</option>
              <option value="term2">{t.term2Label}</option>
            </select>
          </div>

          {/* Select Subject */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="secretSubjectInput" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {t.subjectLabel}
            </label>
            <select
              id="secretSubjectInput"
              className="text-field"
              style={{ height: '44px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={secretSubjectInput}
              onChange={(e) => setSecretSubjectInput(e.target.value)}
            >
              <option value="الرياضيات">{t.math}</option>
              <option value="العلوم">{t.science}</option>
              <option value="اللغة العربية">{t.arabic}</option>
              <option value="اللغة الإنجليزية">{t.english}</option>
            </select>
          </div>

          {/* Enter Secret Code */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="secretCodeInput" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {lang === 'ar' ? "الرقم السري" : "Secret Code"}
            </label>
            <input
              id="secretCodeInput"
              type="text"
              className="form-input"
              style={{ padding: '8px 12px', minHeight: '44px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={secretCodeInput}
              onChange={(e) => setSecretCodeInput(e.target.value)}
              placeholder={lang === 'ar' ? "مثال: 608803" : "e.g. 608803"}
            />
          </div>

          {/* Enter Grade (out of 30) */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="secretGradeInput" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {lang === 'ar' ? "الدرجة (من ٣٠)" : "Grade (out of 30)"}
            </label>
            <input
              id="secretGradeInput"
              type="number"
              className="form-input"
              style={{ padding: '8px 12px', minHeight: '44px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={secretGradeInput}
              onChange={(e) => setSecretGradeInput(e.target.value)}
              min="0"
              max="30"
              placeholder="0 - 30"
            />
          </div>
        </div>

        <button
          type="button"
          className="btn-filled"
          onClick={handleSaveGrade}
          style={{
            alignSelf: 'flex-end',
            padding: '12px 28px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            minHeight: '48px',
            borderRadius: 'var(--radius-button)',
            boxShadow: 'var(--shadow-md)',
            backgroundColor: 'var(--color-success)',
            color: '#ffffff',
            border: 'none',
            marginTop: '8px'
          }}
        >
          💾 {lang === 'ar' ? "رصد وحفظ الدرجة" : "Save Grade"}
        </button>
      </div>

      {/* Final control sheet table grid */}
      <div>
        <PrintHeader
          title={t.gradesSheetTitle}
          subtitle={lang === 'ar' ? "كشف مطابقة الأرقام السرية" : "Secret Number Mapping Sheet"}
        />
        
        <div className="control-grade-table-container">
          <table className="control-grade-table">
            <thead>
              <tr>
                {isGradesEncrypted && <th>{t.secretCode}</th>}
                <th>{lang === 'ar' ? 'رقم الطالب' : 'Student ID'}</th>
                <th>{t.studentName}</th>
                <th>{lang === 'ar' ? 'صف الطالب' : 'Student Class'}</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((row) => {
                const student = students.find(s => s.id === row.studentId);
                const studentClass = student ? (lang === 'ar' ? `${student.grade} - ${student.section}` : `${student.gradeEn} - ${student.sectionEn}`) : '';
                return (
                  <tr key={row.studentId}>
                    {isGradesEncrypted && (
                      <td className="secret-code-cell">{row.secretCode}</td>
                    )}
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{row.studentId}</td>
                    <td style={{ fontWeight: '600' }}>
                      <span className={isGradesEncrypted ? 'encrypted-text' : ''}>
                        {lang === 'ar' ? row.name : row.nameEn}
                      </span>
                    </td>
                    <td>{studentClass}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
