import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AbsenceRequestsTab() {
  const {
    lang,
    t,
    students,
    absenceRequests,
    handleAbsenceDecision,
    attendanceRosterDate,
    setAttendanceRosterDate,
    handleManualAttendanceChange,
    handleManualAttendanceNoteChange,
    renderAvatar,
    availableGrades,
    availableSections,
    setToastMessage
  } = useApp();

  // Local tab/filters states
  const [absenceSubTab, setAbsenceSubTab] = useState('requests');
  const [absenceFilter, setAbsenceFilter] = useState('pending');
  const [absenceNoteText, setAbsenceNoteText] = useState('');

  const [attendanceRosterGrade, setAttendanceRosterGrade] = useState('الصف الأول');
  const [attendanceRosterSection, setAttendanceRosterSection] = useState('أ');

  const handleDecision = (requestId, status) => {
    handleAbsenceDecision(requestId, status, absenceNoteText);
    setAbsenceNoteText('');
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 className="section-card-title headline-small" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            💼 {lang === 'ar' ? 'الحضور والغياب وطلبات الإذن' : 'Attendance & Absence Manager'}
          </h3>
          
          {/* Switch between requests list and daily roster */}
          <div className="tab-menu" style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-surface)', padding: '4px', borderRadius: 'var(--radius-chip)' }}>
            <button 
              className={`chip ${absenceSubTab === 'requests' ? 'selected' : ''}`}
              onClick={() => setAbsenceSubTab('requests')}
              style={{ border: 'none', margin: 0 }}
            >
              ✉️ {lang === 'ar' ? 'طلبات الاستئذان' : 'Absence Requests'}
            </button>
            <button 
              className={`chip ${absenceSubTab === 'roster' ? 'selected' : ''}`}
              onClick={() => setAbsenceSubTab('roster')}
              style={{ border: 'none', margin: 0 }}
            >
              📋 {lang === 'ar' ? 'رصد الحضور اليومي' : 'Daily Roster Sheet'}
            </button>
          </div>
        </div>
      </div>

      {absenceSubTab === 'requests' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }} className="no-print">
            <button 
              className={`chip ${absenceFilter === 'pending' ? 'selected' : ''}`}
              onClick={() => setAbsenceFilter('pending')}
            >
              ⏳ {t.pendingStatus} ({absenceRequests.filter(r => r.status === 'pending').length})
            </button>
            <button 
              className={`chip ${absenceFilter === 'all' ? 'selected' : ''}`}
              onClick={() => setAbsenceFilter('all')}
            >
              🗂️ {t.filterAll} ({absenceRequests.length})
            </button>
          </div>

          {absenceRequests.filter(r => absenceFilter === 'all' || r.status === absenceFilter).length > 0 ? (
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{t.studentName}</th>
                    <th>{t.requestedDate}</th>
                    <th>{t.reason}</th>
                    <th>{lang === 'ar' ? 'المرفقات' : 'Attachments'}</th>
                    <th>{t.adminNoteLabel}</th>
                    <th>{t.status}</th>
                    <th className="no-print">{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {absenceRequests
                    .filter(r => absenceFilter === 'all' || r.status === absenceFilter)
                    .map((req) => {
                      const student = students.find(s => s.id === req.studentId);
                      return (
                        <tr key={req.id}>
                          <td style={{ fontWeight: '600' }}>
                            {student ? renderAvatar(student.photo, "👨‍🎓") : "👨‍🎓"} 
                            <span>{student ? (lang === 'ar' ? student.name : student.nameEn) : req.studentName}</span>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginInlineStart: '40px' }}>
                              {lang === 'ar' ? student?.grade : student?.gradeEn} - {lang === 'ar' ? 'شعبة' : 'Section'} {student?.section}
                            </div>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{req.requestedDate}</td>
                          <td>
                            <div style={{ 
                              padding: '8px 12px', 
                              backgroundColor: 'var(--color-surface)', 
                              borderRadius: 'var(--radius-chip)', 
                              fontSize: '13px',
                              whiteSpace: 'normal',
                              maxWidth: '300px'
                            }}>
                              💬 {lang === 'ar' ? req.reason : (req.reasonEn || req.reason)}
                            </div>
                          </td>
                          <td>
                            {req.attachment ? (
                              <button 
                                className="btn-elevated"
                                style={{ 
                                  fontSize: '11px', 
                                  height: '28px', 
                                  padding: '0 8px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  setToastMessage(lang === 'ar' ? `جاري تحميل المرفق: ${req.attachment}` : `Downloading attachment: ${req.attachment}`);
                                  setTimeout(() => setToastMessage(''), 3000);
                                  
                                  // Trigger actual file download
                                  const link = document.createElement('a');
                                  link.href = req.attachment.startsWith('http') ? req.attachment : `/uploads/attachments/${req.attachment}`;
                                  link.download = req.attachment;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                📎 {req.attachment}
                              </button>
                            ) : (
                              <span style={{ fontStyle: 'italic', opacity: 0.5 }}>--</span>
                            )}
                          </td>
                          <td>
                            {req.adminNote ? (
                              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                📝 {req.adminNote}
                              </div>
                            ) : (
                              <span style={{ fontStyle: 'italic', opacity: 0.5 }}>--</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge-status ${
                              req.status === 'approved' ? 'checked-in' : req.status === 'rejected' ? 'absent' : 'on-bus'
                            }`}>
                              {req.status === 'approved' ? t.approvedStatus : req.status === 'rejected' ? t.rejectedStatus : t.pendingStatus}
                            </span>
                          </td>
                          <td className="no-print">
                            {req.status === 'pending' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input 
                                  type="text" 
                                  placeholder={lang === 'ar' ? 'ملاحظات القرار (اختياري)...' : 'Decision notes (optional)...'}
                                  className="text-field"
                                  style={{ height: '36px', padding: '6px var(--space-md)', fontSize: '12px' }}
                                  value={absenceNoteText}
                                  onChange={(e) => setAbsenceNoteText(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button 
                                    className="btn-elevated"
                                    style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--color-success)', borderColor: 'rgba(22, 163, 74, 0.3)' }}
                                    onClick={() => handleDecision(req.id, 'approved')}
                                  >
                                    ✓ {t.approveBtn}
                                  </button>
                                  <button 
                                    className="btn-elevated"
                                    style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--color-error)', borderColor: 'rgba(220, 38, 38, 0.3)' }}
                                    onClick={() => handleDecision(req.id, 'rejected')}
                                  >
                                    ✗ {t.rejectBtn}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>✓ {lang === 'ar' ? 'مكتمل' : 'Processed'}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)' }}>
              ⏳ {t.noAbsenceRequests}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          {/* Roster Filters Header */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: 'var(--space-md)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }} className="no-print">
            <div className="form-group" style={{ margin: 0, minWidth: '160px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.formGrade}</label>
              <select 
                className="text-field"
                style={{ height: '40px', padding: '0 var(--space-md)' }}
                value={attendanceRosterGrade}
                onChange={(e) => setAttendanceRosterGrade(e.target.value)}
              >
                {availableGrades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.formSection}</label>
              <select 
                className="text-field"
                style={{ height: '40px', padding: '0 var(--space-md)' }}
                value={attendanceRosterSection}
                onChange={(e) => setAttendanceRosterSection(e.target.value)}
              >
                {availableSections.map(s => {
                  const secMap = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E', 'و': 'F', 'ز': 'G' };
                  return (
                    <option key={s} value={s}>{lang === 'ar' ? s : (secMap[s] || s)}</option>
                  );
                })}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0, minWidth: '160px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{lang === 'ar' ? 'تاريخ التحضير' : 'Attendance Date'}</label>
              <input 
                type="date"
                className="text-field"
                style={{ height: '40px', padding: '0 var(--space-md)' }}
                value={attendanceRosterDate}
                onChange={(e) => setAttendanceRosterDate(e.target.value)}
              />
            </div>
          </div>

          {/* Roster Table Grid */}
          {(() => {
            const rosterStudents = students.filter(s => s.grade === attendanceRosterGrade && s.section === attendanceRosterSection);
            
            if (rosterStudents.length > 0) {
              return (
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>{t.studentId}</th>
                        <th>{t.studentName}</th>
                        <th>{lang === 'ar' ? 'الحالة الحالية' : 'Current Status'}</th>
                        <th>{lang === 'ar' ? 'ملاحظة المعلم' : 'Teacher Note'}</th>
                        <th className="no-print" style={{ textAlign: 'center' }}>{lang === 'ar' ? 'رصد وتحديث الحضور' : 'Mark Attendance'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rosterStudents.map(student => {
                        // Check if there is an approved excuse for this student today
                        const hasExcuse = absenceRequests.some(r => r.studentId === student.id && r.requestedDate === attendanceRosterDate && r.status === 'approved');
                        return (
                          <tr key={student.id}>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{student.id}</td>
                            <td style={{ fontWeight: '600' }}>
                              {renderAvatar(student.photo, '👨‍🎓')}
                              {lang === 'ar' ? student.name : student.nameEn}
                            </td>
                            <td>
                              {student.status === 'absent' && hasExcuse ? (
                                <span className="badge-status" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary-ui)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
                                  🔵 {lang === 'ar' ? 'غائب بعذر مقبول' : 'Absent (Excused)'}
                                </span>
                              ) : (
                                <span className={`badge-status ${
                                  student.status === 'present' ? 'checked-in' : 'absent'
                                }`}>
                                  {student.status === 'present' ? t.present : t.absent}
                                </span>
                              )}
                            </td>
                            <td>
                              <input 
                                type="text" 
                                className="text-field"
                                style={{ height: '34px', padding: '4px 10px', fontSize: '12px', minWidth: '150px' }}
                                placeholder={lang === 'ar' ? 'ملاحظة المعلم (مثال: عذر طبي)...' : 'Teacher note...'}
                                value={student.attendanceNote || ''}
                                onChange={(e) => handleManualAttendanceNoteChange(student.id, e.target.value)}
                              />
                            </td>
                            <td className="no-print">
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  className={`chip ${student.status === 'present' ? 'selected' : ''}`}
                                  style={{
                                    border: '1px solid rgba(22, 163, 74, 0.2)',
                                    color: student.status === 'present' ? '#ffffff' : 'var(--color-success)',
                                    backgroundColor: student.status === 'present' ? 'var(--color-success)' : 'transparent',
                                    cursor: 'pointer',
                                    margin: 0
                                  }}
                                  onClick={() => handleManualAttendanceChange(student.id, 'present', attendanceRosterDate)}
                                >
                                  🟢 {t.present}
                                </button>

                                <button
                                  className={`chip ${student.status === 'absent' ? 'selected' : ''}`}
                                  style={{
                                    border: '1px solid rgba(220, 38, 38, 0.2)',
                                    color: student.status === 'absent' ? '#ffffff' : 'var(--color-error)',
                                    backgroundColor: student.status === 'absent' ? 'var(--color-error)' : 'transparent',
                                    cursor: 'pointer',
                                    margin: 0
                                  }}
                                  onClick={() => handleManualAttendanceChange(student.id, 'absent', attendanceRosterDate)}
                                >
                                  🔴 {t.absent}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            } else {
              return (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)' }}>
                  ℹ️ {lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذا الصف والشعبة حالياً.' : 'No registered students in this grade and section currently.'}
                </div>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
}
