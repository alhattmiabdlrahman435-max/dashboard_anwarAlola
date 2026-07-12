import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { X, Filter, Calendar, User, BookOpen } from 'lucide-react';

export default function AssignmentsTab() {
  const {
    lang,
    t,
    students,
    teachers,
    setTeachers,
    assignments,
    setAssignments,
    setToastMessage,
    setSmsLogs,
    renderAvatar,
    availableGrades,
    availableSections,
    subjects,
    classes
  } = useApp();

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || null);
  
  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterTeacherId, setFilterTeacherId] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // Modal visibility
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Form Fields
  const [modalAssignmentGrade, setModalAssignmentGrade] = useState('الصف الأول');
  const [modalAssignmentSection, setModalAssignmentSection] = useState('أ');
  const [modalAssignmentSubject, setModalAssignmentSubject] = useState('');
  const [modalAssignmentTitle, setModalAssignmentTitle] = useState('');
  const [modalAssignmentContent, setModalAssignmentContent] = useState('');
  const [modalAssignmentDueDate, setModalAssignmentDueDate] = useState('');
  const [modalAssignmentAttachment, setModalAssignmentAttachment] = useState('');

  // Default subject once loaded
  React.useEffect(() => {
    if (subjects && subjects.length > 0 && !modalAssignmentSubject) {
      setModalAssignmentSubject(subjects[0].name);
    }
  }, [subjects, modalAssignmentSubject]);

  // Standardize any date format to YYYY-MM-DD
  const standardizeDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    const dmyRegex = /^(\d{2})[-/](\d{2})[-/](\d{4})$/;
    const match = dateStr.trim().match(dmyRegex);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    const ymdRegex = /^(\d{4})[-/](\d{2})[-/](\d{2})/;
    const matchYmd = dateStr.trim().match(ymdRegex);
    if (matchYmd) {
      return `${matchYmd[1]}-${matchYmd[2]}-${matchYmd[3]}`;
    }
    return dateStr.trim();
  };

  // Compute filtered assignments
  const filteredAssignments = assignments.filter(assign => {
    if (filterDate) {
      const standardFilter = standardizeDate(filterDate);
      const standardDue = standardizeDate(assign.dueDate);
      const standardCreated = standardizeDate(assign.dateCreated);
      if (standardDue !== standardFilter && standardCreated !== standardFilter) return false;
    }
    if (filterTeacherId !== 'all' && Number(assign.teacherId) !== Number(filterTeacherId)) return false;
    if (filterSubject !== 'all' && assign.subjectName !== filterSubject && assign.subjectNameEn !== filterSubject) return false;
    return true;
  });

  // Sync selected assignment with filtered list
  React.useEffect(() => {
    if (filteredAssignments.length > 0) {
      const exists = filteredAssignments.some(a => a.id === selectedAssignmentId);
      if (!exists) {
        setSelectedAssignmentId(filteredAssignments[0].id);
      }
    } else {
      setSelectedAssignmentId(null);
    }
  }, [filteredAssignments, selectedAssignmentId]);

  // CRUD Handlers
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!modalAssignmentTitle.trim() || !modalAssignmentContent.trim() || !modalAssignmentDueDate) {
      setToastMessage(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Please fill all required fields');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    // Find class_id
    const targetClass = classes?.find(
      (c) => c.grade_ar === modalAssignmentGrade && c.section_ar === modalAssignmentSection
    );
    if (!targetClass) {
      setToastMessage(lang === 'ar' ? 'الصف المحدد غير موجود في قاعدة البيانات' : 'Selected class not found in DB');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    // Find subject_id
    const targetSubject = subjects?.find(
      (s) => s.name === modalAssignmentSubject || s.nameEn === modalAssignmentSubject
    );
    if (!targetSubject) {
      setToastMessage(lang === 'ar' ? 'المادة المحددة غير موجودة' : 'Selected subject not found');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    try {
      const res = await api.post('/api/assignments', {
        class_id: targetClass.id,
        subject_id: targetSubject.id,
        title: modalAssignmentTitle,
        content: modalAssignmentContent,
        due_date: modalAssignmentDueDate,
      });

      if (res.success) {
        // Find matching teacher
        const matchingTeacher = teachers.find(teach => teach.subjects?.includes(modalAssignmentSubject) || teach.subject === modalAssignmentSubject);

        const newId = res.assignment?.id || Date.now();
        const newAssignment = {
          id: newId,
          grade: modalAssignmentGrade,
          section: modalAssignmentSection,
          subjectName: modalAssignmentSubject,
          subjectNameEn: modalAssignmentSubject === 'الرياضيات' ? 'Mathematics' : modalAssignmentSubject === 'العلوم' ? 'Science' : modalAssignmentSubject === 'اللغة العربية' ? 'Arabic' : 'English',
          teacherName: matchingTeacher ? matchingTeacher.name : (lang === 'ar' ? 'غير محدد' : 'N/A'),
          teacherNameEn: matchingTeacher ? matchingTeacher.nameEn : (lang === 'ar' ? 'غير محدد' : 'N/A'),
          teacherId: matchingTeacher ? matchingTeacher.id : null,
          title: modalAssignmentTitle,
          content: modalAssignmentContent,
          dateCreated: new Date().toISOString().split('T')[0],
          dueDate: modalAssignmentDueDate,
          attachments: modalAssignmentAttachment.trim() ? [modalAssignmentAttachment.trim()] : [],
          submissions: students
            .filter(s => s.grade === modalAssignmentGrade && s.section === modalAssignmentSection)
            .map(s => ({ studentId: s.id, studentName: s.name, status: 'notSubmitted', teacherNote: '' }))
        };

        setAssignments(prev => [newAssignment, ...prev]);
        setSelectedAssignmentId(newId);
        setShowAssignmentModal(false);
        
        if (matchingTeacher) {
          setTeachers(prev => prev.map(t => {
            if (t.id === matchingTeacher.id) {
              return { ...t, assignments: t.assignments + 1 };
            }
            return t;
          }));
        }

        setToastMessage(res.message || t.assignmentSuccessToast);
        setTimeout(() => setToastMessage(''), 3000);
        
        // Clear fields
        setModalAssignmentTitle('');
        setModalAssignmentContent('');
        setModalAssignmentDueDate('');
        setModalAssignmentAttachment('');

        // Trigger simulated SMS warning
        const classStudents = students.filter(s => s.grade === modalAssignmentGrade && s.section === modalAssignmentSection);
        classStudents.forEach(student => {
          const smsText = lang === 'ar'
            ? `تم نشر واجب جديد للمادة ${modalAssignmentSubject}: "${modalAssignmentTitle}". موعد التسليم: ${modalAssignmentDueDate}. رياض و مدارس انوار العلى.`
            : `New homework assignment published for ${modalAssignmentSubject}: "${modalAssignmentTitle}". Due: ${modalAssignmentDueDate}. Riyadh & Anwar Al-Ola.`;
          setSmsLogs(logs => [{
            id: Date.now() + Math.random(),
            studentId: student.id,
            recipient: student.phone,
            text: smsText,
            time: "14:30",
            type: 'present'
          }, ...logs]);
        });
      } else {
        setToastMessage(res.message || 'Error creating assignment');
        setTimeout(() => setToastMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setToastMessage(lang === 'ar' ? 'حدث خطأ أثناء إضافة الواجب' : 'Failed to add assignment');
      setTimeout(() => setToastMessage(''), 3000);
    }

  };

  // Update Assignment Submissions
  const handleUpdateSubmissionStatus = (assignmentId, studentId, newStatus, note) => {
    setAssignments(prev => prev.map(assign => {
      if (assign.id === assignmentId) {
        const updatedSubs = assign.submissions.map(sub => {
          if (sub.studentId === studentId) {
            return { ...sub, status: newStatus, teacherNote: note };
          }
          return sub;
        });
        const exists = assign.submissions.some(sub => sub.studentId === studentId);
        if (!exists) {
          const student = students.find(s => s.id === studentId);
          updatedSubs.push({
            studentId,
            studentName: student ? student.name : '',
            status: newStatus,
            teacherNote: note
          });
        }
        return { ...assign, submissions: updatedSubs };
      }
      return assign;
    }));
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          📝 {t.assignmentsHubTitle}
        </h3>
        
        <button 
          className="btn-accent"
          onClick={() => setShowAssignmentModal(true)}
        >
          ➕ {t.addAssignmentBtn}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
        marginBottom: '20px'
      }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '700' }}>
          <Filter size={15} />
          <span>{lang === 'ar' ? 'تصفية الواجبات:' : 'Filter Assignments:'}</span>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="date"
            className="text-field"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ minHeight: '38px', fontSize: '12px', padding: '4px 10px', borderRadius: '10px', width: '130px' }}
          />
          {filterDate && (
            <button 
              onClick={() => setFilterDate('')} 
              style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '12px', padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Teacher Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <select
            className="text-field"
            value={filterTeacherId}
            onChange={e => setFilterTeacherId(e.target.value)}
            style={{ minHeight: '38px', fontSize: '12px', padding: '4px 10px', borderRadius: '10px', width: 'auto' }}
          >
            <option value="all">{lang === 'ar' ? 'جميع المعلمين' : 'All Teachers'}</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{lang === 'ar' ? t.name : t.nameEn}</option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <select
            className="text-field"
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            style={{ minHeight: '38px', fontSize: '12px', padding: '4px 10px', borderRadius: '10px', width: 'auto' }}
          >
            <option value="all">{lang === 'ar' ? 'جميع المواد' : 'All Subjects'}</option>
            {subjects && subjects.length > 0 ? (
              subjects.map(s => (
                <option key={s.id} value={s.name}>{lang === 'ar' ? s.name : s.nameEn}</option>
              ))
            ) : (
              <>
                <option value="الرياضيات">{t.math}</option>
                <option value="العلوم">{t.science}</option>
                <option value="اللغة العربية">{t.arabic}</option>
                <option value="اللغة الإنجليزية">{t.english}</option>
              </>
            )}
          </select>
        </div>

        <div style={{ marginInlineStart: 'auto', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
          {lang === 'ar' ? `النتائج: ${filteredAssignments.length}` : `Results: ${filteredAssignments.length}`}
        </div>
      </div>

      <div className="dashboard-main-grid">
        {/* Assignments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            🗓️ {lang === 'ar' ? 'الواجبات المنشورة حالياً' : 'Currently Published Assignments'}
          </h4>

          {filteredAssignments.length > 0 ? (
            filteredAssignments.map(assign => (
              <div 
                key={assign.id} 
                style={{
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: selectedAssignmentId === assign.id ? 'rgba(30, 80, 142, 0.05)' : 'var(--color-surface-alt)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all var(--transition-fast)'
                }}
                onClick={() => setSelectedAssignmentId(assign.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge-status reached" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {lang === 'ar' ? assign.subjectName : assign.subjectNameEn}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {lang === 'ar' ? 'الصف' : 'Class'}: {assign.grade} - {assign.section}
                  </span>
                </div>
                <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '6px' }}>{assign.title}</h5>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{assign.content}</p>
                {assign.attachments && assign.attachments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {assign.attachments.map((file, idx) => (
                      <span 
                        key={idx} 
                        style={{ 
                          fontSize: '11px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                          backdropFilter: 'blur(4px)',
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          border: '1px solid var(--color-border)',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setToastMessage(lang === 'ar' ? `جاري تحميل المرفق: ${file}` : `Downloading attachment: ${file}`);
                          setTimeout(() => setToastMessage(''), 3000);
                        }}
                      >
                        📎 {file}
                      </span>
                    ))}
                  </div>
                )}
                {assign.teacherName && (
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} />
                    <span>{lang === 'ar' ? 'المعلم' : 'Teacher'}: {lang === 'ar' ? assign.teacherName : assign.teacherNameEn}</span>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span>📅 {lang === 'ar' ? 'تاريخ النشر:' : 'Published:'} {assign.dateCreated}</span>
                    <span>⌛ {t.dueDateLabel}: {assign.dueDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {lang === 'ar' ? 'عرض التسليمات' : 'View Submissions'} ➔
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px dashed var(--color-border)' }}>
              🔍 {lang === 'ar' ? 'لا توجد واجبات تطابق خيارات التصفية.' : 'No assignments match the filters.'}
            </div>
          )}
        </div>

        {/* Assignment Submissions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            🎓 {t.submissionsTitle}
          </h4>

          {selectedAssignmentId ? (
            (() => {
              const selectedAssign = assignments.find(a => a.id === selectedAssignmentId);
              if (!selectedAssign) return null;
              
              // Filter students who are in this class/section
              const classStudents = students.filter(s => s.grade === selectedAssign.grade && s.section === selectedAssign.section);
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--color-primary)' }}>{selectedAssign.title}</strong>
                    <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-text-secondary)' }}>{selectedAssign.content}</p>
                    {selectedAssign.attachments && selectedAssign.attachments.length > 0 && (
                      <div style={{ marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                        <strong style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                          📎 {lang === 'ar' ? 'المرفقات:' : 'Attachments:'}
                        </strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {selectedAssign.attachments.map((file, idx) => (
                            <button 
                              key={idx}
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
                                setToastMessage(lang === 'ar' ? `جاري تحميل المرفق: ${file}` : `Downloading attachment: ${file}`);
                                setTimeout(() => setToastMessage(''), 3000);
                              }}
                            >
                              📥 {file}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="students-table-container">
                    <table className="students-table">
                      <thead>
                        <tr>
                          <th>{t.studentName}</th>
                          <th>{t.status}</th>
                          <th>{t.teacherNoteLabel}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map(student => {
                          const submission = selectedAssign.submissions.find(sub => sub.studentId === student.id) || { status: 'notSubmitted', teacherNote: '' };
                          return (
                            <tr key={student.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {renderAvatar(student.photo, "👨‍🎓")}
                                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{lang === 'ar' ? student.name : student.nameEn}</span>
                                </div>
                              </td>
                              <td>
                                <select 
                                  value={submission.status}
                                  onChange={(e) => handleUpdateSubmissionStatus(selectedAssign.id, student.id, e.target.value, submission.teacherNote)}
                                  className="text-field"
                                  style={{ height: '34px', padding: '4px 10px', fontSize: '12px', width: '130px' }}
                                >
                                  <option value="submitted">{t.submittedStatus}</option>
                                  <option value="submittedLate">{t.submittedLateStatus}</option>
                                  <option value="notSubmitted">{t.notSubmittedStatus}</option>
                                </select>
                              </td>
                              <td>
                                <input 
                                  type="text" 
                                  placeholder={lang === 'ar' ? 'ملاحظة المعلم...' : 'Note...'}
                                  value={submission.teacherNote}
                                  onChange={(e) => handleUpdateSubmissionStatus(selectedAssign.id, student.id, submission.status, e.target.value)}
                                  className="text-field"
                                  style={{ height: '34px', padding: '4px 10px', fontSize: '12px' }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button 
                    className="btn-filled" 
                    style={{ alignSelf: 'flex-end', height: '40px', minHeight: '40px' }}
                    onClick={async () => {
                      try {
                        const payload = selectedAssign.submissions.map(sub => ({
                          student_id: sub.studentId,
                          status: sub.status === 'submittedLate' ? 'submitted_late' : (sub.status === 'submitted' ? 'submitted' : 'not_submitted'),
                          teacher_note: sub.teacherNote || ''
                        }));
                        const res = await api.put(`/api/assignments/${selectedAssign.id}/submissions`, { submissions: payload });
                        if (res.success) {
                          setToastMessage(res.message || (lang === 'ar' ? 'تم حفظ بيانات تسليمات الطلاب بنجاح!' : 'Submissions updated successfully!'));
                        } else {
                          setToastMessage(res.message || (lang === 'ar' ? 'فشل الحفظ' : 'Error updating submissions'));
                        }
                      } catch(err) {
                        setToastMessage(lang === 'ar' ? 'خطأ في الاتصال' : 'Connection error');
                      }
                      setTimeout(() => setToastMessage(''), 3000);

                    }}
                  >
                    💾 {t.saveSubmissionsBtn}
                  </button>
                </div>
              );
            })()
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)', fontStyle: 'italic' }}>
              👉 {lang === 'ar' ? 'اختر واجباً من القائمة لعرض تسليمات الطلاب وتعديلها' : 'Select an assignment from the list to view and manage student submissions'}
            </div>
          )}
        </div>
      </div>

      {/* ADD ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <header className="modal-header">
              <h3 className="modal-title">📝 {t.addAssignmentBtn}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowAssignmentModal(false)}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={handleAddAssignment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                
                {/* Select Class */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.formGrade}</label>
                    <select 
                      value={modalAssignmentGrade} 
                      onChange={(e) => setModalAssignmentGrade(e.target.value)}
                      className="text-field"
                    >
                      {availableGrades.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.formSection}</label>
                    <select 
                      value={modalAssignmentSection} 
                      onChange={(e) => setModalAssignmentSection(e.target.value)}
                      className="text-field"
                    >
                      {availableSections.map(s => {
                        const secMap = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E', 'و': 'F', 'ز': 'G' };
                        return (
                          <option key={s} value={s}>{lang === 'ar' ? s : (secMap[s] || s)}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.subjectLabel}</label>
                  <select 
                    value={modalAssignmentSubject} 
                    onChange={(e) => setModalAssignmentSubject(e.target.value)}
                    className="text-field"
                  >
                    {subjects && subjects.length > 0 ? (
                      subjects.map(s => (
                        <option key={s.id} value={s.name}>{lang === 'ar' ? s.name : s.nameEn}</option>
                      ))
                    ) : (
                      <>
                        <option value="الرياضيات">{t.math}</option>
                        <option value="العلوم">{t.science}</option>
                        <option value="اللغة العربية">{t.arabic}</option>
                        <option value="اللغة الإنجليزية">{t.english}</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.assignmentTitleLabel}</label>
                  <input 
                    type="text" 
                    value={modalAssignmentTitle} 
                    onChange={(e) => setModalAssignmentTitle(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب عنوان الواجب...' : 'Enter assignment title...'}
                    className="text-field"
                    required
                  />
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.assignmentContentLabel}</label>
                  <textarea 
                    value={modalAssignmentContent} 
                    onChange={(e) => setModalAssignmentContent(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب تفاصيل الواجب والتعليمات...' : 'Enter homework details...'}
                    className="text-field"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    required
                  />
                </div>

                {/* Due Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.dueDateLabel}</label>
                  <input 
                    type="date" 
                    value={modalAssignmentDueDate} 
                    onChange={(e) => setModalAssignmentDueDate(e.target.value)}
                    className="text-field"
                    required
                  />
                </div>

                {/* Attachment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{lang === 'ar' ? 'مرفقات الواجب (اختياري)' : 'Homework Attachment (Optional)'}</label>
                  <input 
                    type="text" 
                    value={modalAssignmentAttachment} 
                    onChange={(e) => setModalAssignmentAttachment(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: worksheet.pdf' : 'e.g. worksheet.pdf'}
                    className="text-field"
                  />
                </div>
              </div>

              <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: 'var(--space-lg) var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
                <button 
                  type="button" 
                  className="btn-elevated"
                  onClick={() => setShowAssignmentModal(false)}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="btn-filled"
                >
                  🚀 {t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
