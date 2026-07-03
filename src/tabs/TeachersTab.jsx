import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Trash2, Download, Upload } from 'lucide-react';

export default function TeachersTab() {
  const {
    lang, t, teachers, subjects, classes,
    handleAddTeacher, handleEditTeacher, renderAvatar,
    setToastMessage, canAction, fetchTeachers
  } = useApp();

  // Local UI states
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);

  // Form states
  const [selectedTeacherIdForEdit, setSelectedTeacherIdForEdit] = useState(null);
  const [modalTeacherName, setModalTeacherName] = useState('');
  const [modalTeacherJobId, setModalTeacherJobId] = useState('');
  const [modalTeacherPassword, setModalTeacherPassword] = useState('');
  const [modalTeacherPhoto, setModalTeacherPhoto] = useState('');
  const [modalTeacherAssignments, setModalTeacherAssignments] = useState([]);
  const [modalTeacherAssignmentSubject, setModalTeacherAssignmentSubject] = useState('');
  const [modalTeacherAssignmentClass, setModalTeacherAssignmentClass] = useState('');
  const [formError, setFormError] = useState('');

  const onAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!modalTeacherName.trim() || modalTeacherAssignments.length === 0 || !modalTeacherJobId.trim() || !modalTeacherPassword.trim()) {
      setFormError(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول وإضافة تكليف تدريس واحد على الأقل' : 'Please fill all fields and add at least one teaching assignment');
      return;
    }

    const uniqueSubjects = [...new Set(modalTeacherAssignments.map(a => a.subject))];
    const uniqueClasses = [...new Set(modalTeacherAssignments.map(a => a.class))];

    const newId = 100 + teachers.length + 1;
    const nameEnFallback = modalTeacherName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    
    const newTeacher = {
      id: newId,
      jobId: modalTeacherJobId.trim(),
      password: modalTeacherPassword.trim(),
      name: modalTeacherName,
      nameEn: nameEnFallback,
      subject: uniqueSubjects[0],
      subjectEn: uniqueSubjects[0],
      subjects: uniqueSubjects,
      classes: uniqueClasses,
      teachingAssignments: modalTeacherAssignments,
      gradesEntered: 0,
      assignments: 0,
      photo: modalTeacherPhoto || '👨‍🏫'
    };

    handleAddTeacher(newTeacher);
    setShowTeacherModal(false);

    // Reset fields
    setModalTeacherName('');
    setModalTeacherAssignments([]);
    setModalTeacherPhoto('');
    setModalTeacherJobId('');
    setModalTeacherPassword('');
    setModalTeacherAssignmentSubject('');
    setModalTeacherAssignmentClass('');
  };

  const onEditSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!modalTeacherName.trim() || modalTeacherAssignments.length === 0 || !modalTeacherJobId.trim() || !modalTeacherPassword.trim()) {
      setFormError(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول وإضافة تكليف تدريس واحد على الأقل' : 'Please fill all fields and add at least one teaching assignment');
      return;
    }

    const uniqueSubjects = [...new Set(modalTeacherAssignments.map(a => a.subject))];
    const uniqueClasses = [...new Set(modalTeacherAssignments.map(a => a.class))];

    const nameEnEn = modalTeacherName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

    const updatedTeacher = {
      id: selectedTeacherIdForEdit,
      name: modalTeacherName,
      nameEn: nameEnEn,
      jobId: modalTeacherJobId.trim(),
      password: modalTeacherPassword.trim(),
      subject: uniqueSubjects[0],
      subjectEn: uniqueSubjects[0],
      subjects: uniqueSubjects,
      classes: uniqueClasses,
      teachingAssignments: modalTeacherAssignments
    };

    handleEditTeacher(updatedTeacher, selectedTeacherIdForEdit);
    setShowEditTeacherModal(false);

    // Reset fields
    setModalTeacherName('');
    setModalTeacherAssignments([]);
    setModalTeacherJobId('');
    setModalTeacherPassword('');
    setModalTeacherAssignmentSubject('');
    setModalTeacherAssignmentClass('');
    setSelectedTeacherIdForEdit(null);
  };

  const addAssignmentRow = () => {
    if (!modalTeacherAssignmentSubject || !modalTeacherAssignmentClass) {
      setToastMessage(lang === 'ar' ? '⚠️ يرجى اختيار المادة والفصل معاً!' : '⚠️ Please select both subject and class!');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    // Check duplicate
    if (modalTeacherAssignments.some(a => a.subject === modalTeacherAssignmentSubject && a.class === modalTeacherAssignmentClass)) {
      setToastMessage(lang === 'ar' ? '⚠️ هذا التكليف مضاف بالفعل!' : '⚠️ This assignment is already added!');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const newRow = {
      subject: modalTeacherAssignmentSubject,
      class: modalTeacherAssignmentClass
    };

    setModalTeacherAssignments(prev => [...prev, newRow]);
    setModalTeacherAssignmentSubject('');
    setModalTeacherAssignmentClass('');
  };

  const removeAssignmentRow = (idx) => {
    setModalTeacherAssignments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/teachers/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تصدير البيانات' : 'Failed to export data');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'teachers_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/teachers/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(data.message);
        fetchTeachers(localStorage.getItem('auth_token'));
      } else {
        alert(data.message || (lang === 'ar' ? 'حدث خطأ أثناء الاستيراد' : 'Error importing'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch('/api/teachers/template', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'teachers_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          {t.teachersTitle}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {canAction('teachers', 'export') && (
            <button className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={16} />
              {lang === 'ar' ? 'تصدير' : 'Export'}
            </button>
          )}
          {canAction('teachers', 'import') && (
            <>
              <button className="btn-secondary" onClick={handleDownloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={lang === 'ar' ? 'تحميل النموذج الفارغ' : 'Download Template'}>
                {lang === 'ar' ? 'النموذج' : 'Template'}
              </button>
              <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0 }}>
                <Upload size={16} />
                {lang === 'ar' ? 'استيراد' : 'Import'}
                <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </>
          )}
          {canAction('teachers', 'create') && (
            <button 
              className="btn-accent"
              onClick={() => {
                setFormError('');
                setModalTeacherName('');
                setModalTeacherAssignments([]);
                setModalTeacherPhoto('');
                setModalTeacherJobId('');
                setModalTeacherPassword('');
                setModalTeacherAssignmentSubject('');
                setModalTeacherAssignmentClass('');
                setShowTeacherModal(true);
              }}
            >
              <Plus size={18} strokeWidth={2.5} style={{ marginInlineEnd: '4px' }} />
              {t.addTeacherBtn}
            </button>
          )}
        </div>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'}</th>
              <th>{t.teacherName}</th>
              <th>{t.subject}</th>
              <th>{t.assignedClasses}</th>
              <th>{lang === 'ar' ? 'كلمة المرور' : 'Password'}</th>
              <th>{t.gradesEntered}</th>
              <th>{t.assignmentsPublished}</th>
              <th className="no-print">{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{teacher.id}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{teacher.jobId || `T${teacher.id}`}</td>
                <td style={{ fontWeight: '600' }}>
                  {renderAvatar(teacher.photo, "👨‍--")}
                  {lang === 'ar' ? teacher.name : teacher.nameEn}
                </td>
                <td>
                  <span style={{
                    padding: '4px 10px',
                    background: 'rgba(30, 80, 142, 0.08)',
                    color: 'var(--color-primary-ui)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {lang === 'ar' ? teacher.subject : teacher.subjectEn}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {teacher.classes.map((c, idx) => (
                      <span key={idx} className="chip" style={{ cursor: 'default', fontSize: '11px', padding: '2px 8px' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{teacher.password || 'teacher_password123'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{teacher.gradesEntered} %</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{teacher.assignments}</td>
                <td className="no-print">
                  <button 
                    className="btn-elevated"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => {
                      setFormError('');
                      setSelectedTeacherIdForEdit(teacher.id);
                      setModalTeacherName(teacher.name);
                      setModalTeacherAssignments(teacher.teachingAssignments || [
                        { subject: teacher.subject, class: teacher.classes[0] || 'الصف الأول - أ' }
                      ]);
                      setModalTeacherJobId(teacher.jobId || `T${teacher.id}`);
                      setModalTeacherPassword(teacher.password || 'teacher_password123');
                      setShowEditTeacherModal(true);
                      setModalTeacherAssignmentSubject('');
                      setModalTeacherAssignmentClass('');
                    }}
                  >
                    📝 {lang === 'ar' ? 'تعديل / إعادة تعيين' : 'Edit / Reset'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DIALOG 4: REGISTER TEACHER FORM */}
      {showTeacherModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container">
            <header className="modal-header">
              <h3 className="modal-title">👨‍🏫 {t.addTeacherTitle}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowTeacherModal(false);
                  setFormError('');
                }}
                aria-label="Close Teacher Registration Dialog"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={onAddSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    padding: 'var(--space-md)',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    color: 'var(--color-error)',
                    borderRadius: 'var(--radius-chip)',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">{t.formTeacherName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder={lang === 'ar' ? 'مثال: أحمد الحربي' : 'e.g. Ahmad Al-Harbi'}
                    value={modalTeacherName}
                    onChange={(e) => setModalTeacherName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="text-field"
                      placeholder="T105"
                      value={modalTeacherJobId}
                      onChange={(e) => setModalTeacherJobId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'كلمة المرور' : 'Password'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="text-field"
                      placeholder="teacher_password123"
                      value={modalTeacherPassword}
                      onChange={(e) => setModalTeacherPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'rgba(30, 80, 142, 0.03)', border: '1px solid var(--color-border)', borderRadius: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary-ui)' }}>
                    🎯 {lang === 'ar' ? 'تكليفات تدريس المناهج بالفصول' : 'Class-Subject Teaching Assignments'}
                  </h4>

                  {/* Add Row Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr auto', gap: '8px', alignItems: 'end', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</label>
                      <select 
                        className="text-field"
                        style={{ height: '38px', padding: '6px 12px' }}
                        value={modalTeacherAssignmentSubject}
                        onChange={(e) => setModalTeacherAssignmentSubject(e.target.value)}
                      >
                        <option value="">{lang === 'ar' ? '-- اختر المادة --' : '-- Select Subject --'}</option>
                        {subjects.map(sub => (
                          <option key={sub.id} value={sub.name}>{lang === 'ar' ? sub.name : sub.nameEn}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>{lang === 'ar' ? 'الفصل الدراسي' : 'Class'}</label>
                      <select 
                        className="text-field"
                        style={{ height: '38px', padding: '6px 12px' }}
                        value={modalTeacherAssignmentClass}
                        onChange={(e) => setModalTeacherAssignmentClass(e.target.value)}
                      >
                        <option value="">{lang === 'ar' ? '-- اختر الفصل --' : '-- Select Class --'}</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.name}>{lang === 'ar' ? cls.name : cls.nameEn}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      className="btn-accent"
                      style={{ height: '38px', padding: '0 14px', whiteSpace: 'nowrap' }}
                      onClick={addAssignmentRow}
                    >
                      ➕
                    </button>
                  </div>

                  {/* Assignments List */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'start' }}>
                        <th style={{ padding: '6px 0', textAlign: 'start' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</th>
                        <th style={{ padding: '6px 0', textAlign: 'start' }}>{lang === 'ar' ? 'الفصل الدراسي' : 'Class'}</th>
                        <th style={{ padding: '6px 0', width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalTeacherAssignments.map((assign, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '6px 0' }}>{assign.subject}</td>
                          <td style={{ padding: '6px 0' }}>{assign.class}</td>
                          <td style={{ padding: '6px 0', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeAssignmentRow(idx)}
                              style={{ border: 'none', background: 'transparent', color: 'var(--color-error)', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {modalTeacherAssignments.length === 0 && (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', padding: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                            {lang === 'ar' ? 'لا يوجد تكليفات مضافة بعد' : 'No assignments added yet'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.formPhoto} (Teacher - Emoji or URL)</label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder="👨‍🏫 or image url"
                    value={modalTeacherPhoto}
                    onChange={(e) => setModalTeacherPhoto(e.target.value)}
                  />
                </div>
              </div>

              <footer className="modal-footer">
                <button 
                  type="button" 
                  className="btn-elevated"
                  onClick={() => setShowTeacherModal(false)}
                  style={{ height: '48px' }}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="btn-filled"
                  style={{ height: '48px' }}
                >
                  {t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: EDIT TEACHER & RESET PASSWORD */}
      {showEditTeacherModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">👨‍🏫 {lang === 'ar' ? 'تعديل بيانات المعلم ورصد الصلاحيات' : 'Edit Teacher & Reset Password'}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowEditTeacherModal(false);
                  setFormError('');
                }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <form onSubmit={onEditSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{t.formTeacherName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalTeacherName} onChange={(e) => setModalTeacherName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalTeacherJobId} onChange={(e) => setModalTeacherJobId(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'كلمة المرور' : 'Password'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalTeacherPassword} onChange={(e) => setModalTeacherPassword(e.target.value)} required />
                </div>
                
                <div style={{ padding: '14px', background: 'rgba(30, 80, 142, 0.03)', border: '1px solid var(--color-border)', borderRadius: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary-ui)' }}>
                    🎯 {lang === 'ar' ? 'تكليفات تدريس المناهج بالفصول' : 'Class-Subject Teaching Assignments'}
                  </h4>

                  {/* Add Row Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr auto', gap: '8px', alignItems: 'end', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</label>
                      <select 
                        className="text-field"
                        style={{ height: '38px', padding: '6px 12px' }}
                        value={modalTeacherAssignmentSubject}
                        onChange={(e) => setModalTeacherAssignmentSubject(e.target.value)}
                      >
                        <option value="">{lang === 'ar' ? '-- اختر المادة --' : '-- Select Subject --'}</option>
                        {subjects.map(sub => (
                          <option key={sub.id} value={sub.name}>{lang === 'ar' ? sub.name : sub.nameEn}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>{lang === 'ar' ? 'الفصل الدراسي' : 'Class'}</label>
                      <select 
                        className="text-field"
                        style={{ height: '38px', padding: '6px 12px' }}
                        value={modalTeacherAssignmentClass}
                        onChange={(e) => setModalTeacherAssignmentClass(e.target.value)}
                      >
                        <option value="">{lang === 'ar' ? '-- اختر الفصل --' : '-- Select Class --'}</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.name}>{lang === 'ar' ? cls.name : cls.nameEn}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      className="btn-accent"
                      style={{ height: '38px', padding: '0 14px', whiteSpace: 'nowrap' }}
                      onClick={addAssignmentRow}
                    >
                      ➕
                    </button>
                  </div>

                  {/* Assignments List */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'start' }}>
                        <th style={{ padding: '6px 0', textAlign: 'start' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</th>
                        <th style={{ padding: '6px 0', textAlign: 'start' }}>{lang === 'ar' ? 'الفصل الدراسي' : 'Class'}</th>
                        <th style={{ padding: '6px 0', width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalTeacherAssignments.map((assign, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '6px 0' }}>{assign.subject}</td>
                          <td style={{ padding: '6px 0' }}>{assign.class}</td>
                          <td style={{ padding: '6px 0', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeAssignmentRow(idx)}
                              style={{ border: 'none', background: 'transparent', color: 'var(--color-error)', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {modalTeacherAssignments.length === 0 && (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', padding: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                            {lang === 'ar' ? 'لا يوجد تكليفات مضافة بعد' : 'No assignments added yet'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowEditTeacherModal(false)} style={{ height: '48px' }}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px' }}>{t.submit}</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
