import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useStudents } from '../contexts/Students/useStudents';
import { useClasses } from '../contexts/Classes/useClasses';
import { useAttendance } from '../contexts/Attendance/useAttendance';
import { X, ArrowUp, ArrowDown } from 'lucide-react';

export default function AbsenceRequestsTab() {
  const {
    lang,
    t,
    renderAvatar,
    setToastMessage,
    canAction
  } = useApp();

  const {
    availableGrades,
    availableSections,
    fetchClasses,
  } = useClasses();

  const {
    absenceRequests,
    handleAbsenceDecision,
    attendanceRosterDate,
    setAttendanceRosterDate,
    handleManualAttendanceChange,
    fetchAbsenceRequests,
  } = useAttendance();

  const { students, handleManualAttendanceNoteChange, fetchStudents } = useStudents();

  useEffect(() => {
    fetchAbsenceRequests();
    fetchStudents();
    fetchClasses();
  }, [fetchAbsenceRequests, fetchStudents, fetchClasses]);

  // Local tab/filters states
  const [absenceSubTab, setAbsenceSubTab] = useState('requests');
  const [absenceFilter, setAbsenceFilter] = useState('pending');
  const [dateSortOrder, setDateSortOrder] = useState('desc'); // 'desc' or 'asc'
  const [filterDate, setFilterDate] = useState('');

  const toggleDateSort = () => {
    setDateSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const [attendanceRosterGrade, setAttendanceRosterGrade] = useState('الصف الأول');
  const [attendanceRosterSection, setAttendanceRosterSection] = useState('أ');

  // Decision Modal state
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [decisionType, setDecisionType] = useState(''); // 'approved' or 'rejected'
  const [decisionNote, setDecisionNote] = useState('');

  const filteredRequests = useMemo(() => {
    return [...absenceRequests]
      .filter(r => absenceFilter === 'all' || r.status === absenceFilter)
      .filter(r => !filterDate || r.requestedDate === filterDate)
      .sort((a, b) => {
        const dateA = a.requestedDate || '';
        const dateB = b.requestedDate || '';
        return dateSortOrder === 'desc' 
          ? dateB.localeCompare(dateA) 
          : dateA.localeCompare(dateB);
      });
  }, [absenceRequests, absenceFilter, filterDate, dateSortOrder]);

  const pendingRequestsCount = useMemo(() => {
    return absenceRequests.filter(r => r.status === 'pending').length;
  }, [absenceRequests]);

  const rosterStudents = useMemo(() => {
    return students.filter(s => s.grade === attendanceRosterGrade && s.section === attendanceRosterSection);
  }, [students, attendanceRosterGrade, attendanceRosterSection]);

  const openDecisionModal = (req, type) => {
    setActiveRequest(req);
    setDecisionType(type);
    setDecisionNote('');
    setDecisionModalOpen(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (decisionType === 'rejected' && !decisionNote.trim()) {
      setToastMessage(lang === 'ar' ? 'يجب إدخال سبب الرفض' : 'Rejection reason is required');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    handleAbsenceDecision(activeRequest.id, decisionType, decisionNote, students);
    setDecisionModalOpen(false);
    setActiveRequest(null);
    setDecisionNote('');
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
      </div>      {absenceSubTab === 'requests' ?
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }} className="no-print">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  className={`chip ${absenceFilter === 'pending' ? 'selected' : ''}`}
                  onClick={() => setAbsenceFilter('pending')}
                >
                  ⏳ {t.pendingStatus} ({pendingRequestsCount})
                </button>
                  <button 
                    className={`chip ${absenceFilter === 'all' ? 'selected' : ''}`}
                    onClick={() => setAbsenceFilter('all')}
                  >
                    🗂️ {t.filterAll} ({absenceRequests.length})
                  </button>

                  {/* Date Filter Input */}
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginInlineStart: '8px' }}>
                    <input 
                      type="date"
                      className="text-field"
                      style={{ 
                        minHeight: '36px', 
                        fontSize: '12px', 
                        width: '140px', 
                        borderRadius: '8px', 
                        paddingInline: '8px',
                        backgroundColor: 'var(--color-surface-alt)',
                        color: 'var(--color-text-primary)',
                        border: '1.5px solid var(--color-border)',
                        cursor: 'pointer'
                      }}
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      title={lang === 'ar' ? 'تصفية بالتاريخ' : 'Filter by Date'}
                    />
                    {filterDate && (
                      <button
                        type="button"
                        onClick={() => setFilterDate('')}
                        style={{
                          position: 'absolute',
                          left: lang === 'ar' ? '8px' : 'auto',
                          right: lang === 'ar' ? 'auto' : '8px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-error)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                
                <button 
                  className="chip"
                  onClick={toggleDateSort}
                  style={{ 
                    border: '1px solid var(--color-border)', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-surface-alt)',
                    color: 'var(--color-text-primary)',
                    margin: 0
                  }}
                >
                  📅 {lang === 'ar' ? 'فرز بالتاريخ:' : 'Sort Date:'} 
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primary-ui)' }}>
                    {dateSortOrder === 'desc' ? (lang === 'ar' ? 'الأحدث أولاً' : 'Newest First') : (lang === 'ar' ? 'الأقدم أولاً' : 'Oldest First')}
                  </span>
                  {dateSortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                </button>
              </div>

              {filteredRequests.length > 0 ?
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>{t.studentName}</th>
                        <th 
                          onClick={toggleDateSort}
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                          title={lang === 'ar' ? 'اضغط للفرز بالتاريخ' : 'Click to sort by date'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{t.requestedDate}</span>
                            <span style={{ display: 'inline-flex', color: 'var(--color-primary-ui)' }}>
                              {dateSortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            </span>
                          </div>
                        </th>
                        <th>{t.reason}</th>
                        <th>{t.adminNoteLabel}</th>
                        <th>{t.status}</th>
                        <th className="no-print">{t.action}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((req) => {
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
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {canAction('absenceRequests', 'approve') && (
                                  <button 
                                    className="btn-filled"
                                    style={{ 
                                      padding: '6px 14px', 
                                      fontSize: '12px', 
                                      backgroundColor: 'var(--color-success, #16a34a)', 
                                      color: 'white', 
                                      borderRadius: '8px', 
                                      border: 'none', 
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    onClick={() => openDecisionModal(req, 'approved')}
                                  >
                                    ✓ {t.approveBtn || 'موافقة'}
                                  </button>
                                )}
                                {canAction('absenceRequests', 'reject') && (
                                  <button 
                                    className="btn-filled"
                                    style={{ 
                                      padding: '6px 14px', 
                                      fontSize: '12px', 
                                      backgroundColor: 'var(--color-error, #dc2626)', 
                                      color: 'white', 
                                      borderRadius: '8px', 
                                      border: 'none', 
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    onClick={() => openDecisionModal(req, 'rejected')}
                                  >
                                    ✗ {t.rejectBtn || 'رفض'}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                                {req.status === 'approved' ? (
                                  <span style={{ color: 'var(--color-success)' }}>✓ {lang === 'ar' ? 'تمت الموافقة' : 'Approved'}</span>
                                ) : (
                                  <span style={{ color: 'var(--color-error)' }}>✗ {lang === 'ar' ? 'تم الرفض' : 'Rejected'}</span>
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          :
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)' }}>
              ⏳ {t.noAbsenceRequests}
            </div>
          }
        </div>
      :
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
          {rosterStudents.length > 0 ?
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
                                  onClick={() => handleManualAttendanceChange(student.id, 'present', attendanceRosterDate, students)}
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
                                  onClick={() => handleManualAttendanceChange(student.id, 'absent', attendanceRosterDate, students)}
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
          :
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)' }}>
              ℹ️ {lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذا الصف والشعبة حالياً.' : 'No registered students in this grade and section currently.'}
            </div>
          }
        </div>
      }

      {/* DECISION POPUP MODAL */}
      {decisionModalOpen && activeRequest && (
        <div className="modal-overlay no-print" style={{ zIndex: 1100 }}>
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">
                {decisionType === 'approved' 
                  ? (lang === 'ar' ? '✅ قبول طلب الاستئذان' : '✅ Approve Absence Request') 
                  : (lang === 'ar' ? '❌ رفض طلب الاستئذان' : '❌ Reject Absence Request')
                }
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setDecisionModalOpen(false);
                  setActiveRequest(null);
                }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={handleModalSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Student Info */}
                <div style={{ backgroundColor: 'var(--color-surface-alt)', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>{lang === 'ar' ? 'اسم الطالب:' : 'Student Name:'}</strong>
                    <span>{activeRequest.studentName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>{lang === 'ar' ? 'تاريخ الغياب المطلوب:' : 'Requested Date:'}</strong>
                    <span>{activeRequest.requestedDate}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong>{lang === 'ar' ? 'السبب:' : 'Reason:'}</strong>
                    <div style={{ padding: '6px 10px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px' }}>
                      {lang === 'ar' ? activeRequest.reason : (activeRequest.reasonEn || activeRequest.reason)}
                    </div>
                  </div>
                </div>

                {/* Input Decision Note */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    {decisionType === 'rejected' 
                      ? (lang === 'ar' ? 'سبب الرفض (مطلوب):' : 'Rejection Reason (Required):') 
                      : (lang === 'ar' ? 'ملاحظات إضافية (اختياري):' : 'Additional Notes (Optional):')
                    }
                  </label>
                  <textarea
                    className="text-field"
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder={decisionType === 'rejected' 
                      ? (lang === 'ar' ? 'يرجى كتابة سبب رفض طلب الاستئذان بالتفصيل لتوضيحه لولي الأمر...' : 'Write reason for rejecting this leave request...') 
                      : (lang === 'ar' ? 'اكتب ملاحظات القبول (مثال: تمت الموافقة بعذر طبي)...' : 'Write approval note (e.g. Approved with medical note)...')
                    }
                    style={{ minHeight: '100px', resize: 'vertical', fontSize: '13px', padding: '10px' }}
                    required={decisionType === 'rejected'}
                  />
                </div>
              </div>

              <footer className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-elevated"
                  onClick={() => {
                    setDecisionModalOpen(false);
                    setActiveRequest(null);
                  }}
                  style={{ minHeight: '40px', padding: '0 16px' }}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn-filled"
                  style={{
                    minHeight: '40px',
                    padding: '0 16px',
                    backgroundColor: decisionType === 'approved' ? 'var(--color-success, #16a34a)' : 'var(--color-error, #dc2626)',
                    borderColor: 'transparent',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {decisionType === 'approved' 
                    ? (lang === 'ar' ? '✓ تأكيد القبول والموافقة' : '✓ Confirm & Approve') 
                    : (lang === 'ar' ? '✗ تأكيد الرفض' : '✗ Confirm Rejection')
                  }
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
