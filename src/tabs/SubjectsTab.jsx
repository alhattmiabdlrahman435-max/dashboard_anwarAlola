import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTeachers } from '../contexts/Teachers/useTeachers';
import { useClasses } from '../contexts/Classes/useClasses';
import { useSubjects } from '../contexts/Subjects/useSubjects';
import { subjectsService } from '../services/subjects/subjects.service';
import { Plus, Search, X } from 'lucide-react';

export default function SubjectsTab() {
  const {
    lang,
    t,
    setToastMessage,
    triggerConfirm,
    renderAvatar,
    canAction,
  } = useApp();

  const { subjects, fetchSubjects } = useSubjects();

  const { classes, fetchClasses } = useClasses();

  const { teachers, fetchTeachers } = useTeachers();

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    fetchTeachers();
  }, [fetchSubjects, fetchClasses, fetchTeachers]);


  // Local state for searching & modals
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modals visibility
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [showSubjectDetailsModal, setShowSubjectDetailsModal] = useState(false);
  const [selectedSubjectForDetails, setSelectedSubjectForDetails] = useState(null);
  const [selectedSubjectIdForEdit, setSelectedSubjectIdForEdit] = useState(null);

  // Form Fields
  const [modalSubjectNameAr, setModalSubjectNameAr] = useState('');
  const [modalSubjectNameEn, setModalSubjectNameEn] = useState('');
  const [modalSubjectClasses, setModalSubjectClasses] = useState([]);

  // CRUD Handlers
  const handleAddSubject = (e) => {
    e.preventDefault();
    setFormError('');
    if (!modalSubjectNameAr.trim() || !modalSubjectNameEn.trim()) {
      setFormError(t.emptyError);
      return;
    }

    if (subjects.some(s => s.name.toLowerCase() === modalSubjectNameAr.trim().toLowerCase())) {
      setFormError(lang === 'ar' ? 'هذه المادة مسجلة بالفعل!' : 'Subject name already exists!');
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('auth_token');

    subjectsService.createSubject({
      name_ar: modalSubjectNameAr.trim(),
      name_en: modalSubjectNameEn.trim()
    })
    .then(data => {
      if (data.success && data.subject) {
        subjectsService.syncClasses(data.subject.id, modalSubjectClasses)
        .then(() => {
          if (token) {
            fetchSubjects(token);
            fetchClasses(token);
          }
          setShowSubjectModal(false);
          setToastMessage(lang === 'ar' ? 'تمت إضافة المادة بنجاح!' : 'Subject created successfully!');
          setTimeout(() => setToastMessage(''), 3000);
        })
        .catch(err => {
          console.error("Error syncing classes:", err);
          setFormError(lang === 'ar' ? 'حدث خطأ أثناء تعيين الفصول الدراسية' : 'Error assigning classes');
        })
        .finally(() => {
          setIsSaving(false);
        });
      } else {
        setFormError(data.message || 'Error');
        setIsSaving(false);
      }
    })
    .catch(err => {
      console.error("Error adding subject:", err);
      setFormError(lang === 'ar' ? 'حدث خطأ أثناء حفظ المادة' : 'Error saving subject');
      setIsSaving(false);
    });
  };

  const handleEditSubject = (e) => {
    e.preventDefault();
    setFormError('');
    if (!modalSubjectNameAr.trim() || !modalSubjectNameEn.trim()) {
      setFormError(t.emptyError);
      return;
    }

    const targetSub = subjects.find(s => s.id === selectedSubjectIdForEdit);
    if (!targetSub) return;

    setIsSaving(true);
    const dbSubjectId = Number(String(selectedSubjectIdForEdit).replace('sub-', ''));
    const token = localStorage.getItem('auth_token');

    subjectsService.updateSubject(dbSubjectId, {
      name_ar: modalSubjectNameAr.trim(),
      name_en: modalSubjectNameEn.trim()
    })
    .then(data => {
      if (data.success) {
        subjectsService.syncClasses(dbSubjectId, modalSubjectClasses)
        .then(() => {
          if (token) {
            fetchSubjects(token);
            fetchClasses(token);
          }
          setShowEditSubjectModal(false);
          setToastMessage(lang === 'ar' ? 'تم تحديث المادة بنجاح!' : 'Subject details updated successfully!');
          setTimeout(() => setToastMessage(''), 3000);
        })
        .catch(err => {
          console.error("Error syncing classes:", err);
          setFormError(lang === 'ar' ? 'حدث خطأ أثناء تحديث الفصول الدراسية' : 'Error updating classes');
        })
        .finally(() => {
          setIsSaving(false);
        });
      } else {
        setFormError(data.message || 'Error');
        setIsSaving(false);
      }
    })
    .catch(err => {
      console.error("Error updating subject:", err);
      setFormError(lang === 'ar' ? 'حدث خطأ أثناء تعديل المادة' : 'Error editing subject');
      setIsSaving(false);
    });
  };

  const handleDeleteSubject = (id) => {
    const sub = subjects.find(s => s.id === id);
    if (!sub) return;
    triggerConfirm({
      title: lang === 'ar' ? 'حذف المادة الدراسية' : 'Delete Subject',
      message: lang === 'ar' ? `هل أنت متأكد من حذف مادة ${sub.name}؟ سيتم إزالتها من جميع الفصول وتكليفات المعلمين.` : `Are you sure you want to delete ${sub.nameEn}? It will be removed from all classes and teacher assignments.`,
      onConfirm: () => {
        const dbSubjectId = Number(String(id).replace('sub-', ''));
        const token = localStorage.getItem('auth_token');

        subjectsService.deleteSubject(dbSubjectId)
        .then(data => {
          if (data.success) {
            if (token) {
              fetchSubjects(token);
              fetchClasses(token);
            }
            setToastMessage(lang === 'ar' ? 'تم حذف المادة بنجاح' : 'Subject deleted successfully');
            setTimeout(() => setToastMessage(''), 3000);
          }
        })
        .catch(err => {
          console.error("Error deleting subject:", err);
        });
      }
    });
  };

  return (
    <>
      <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          {lang === 'ar' ? 'سجل المواد الدراسية والمناهج' : 'Subjects & Curriculum Registry'}
        </h3>
        {canAction('subjects', 'create') && (
          <button 
            className="btn-accent"
            onClick={() => {
              setFormError('');
              setModalSubjectNameAr('');
              setModalSubjectNameEn('');
              setModalSubjectClasses([]);
              setShowSubjectModal(true);
            }}
          >
            <Plus size={18} strokeWidth={2.5} style={{ marginInlineEnd: '4px' }} />
            {lang === 'ar' ? 'إضافة مادة جديدة' : 'Add New Subject'}
          </button>
        )}
      </div>

      {/* Search Box */}
      <div className="students-controls no-print" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text"
            className="text-field"
            placeholder={lang === 'ar' ? 'ابحث عن مادة...' : 'Search for a subject...'}
            value={subjectSearchQuery}
            onChange={(e) => setSubjectSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Subjects grid container */}
      <div className="subjects-grid">
        {subjects
          .filter(sub => {
            const query = subjectSearchQuery.toLowerCase();
            return (
              sub.name.toLowerCase().includes(query) ||
              sub.nameEn.toLowerCase().includes(query)
            );
          })
          .map(sub => {
            // Find classes studying this subject
            const studyingClasses = classes.filter(c => c.subjects.includes(sub.name));
            // Find teachers teaching this subject
            const teachingTeachers = teachers.filter(t => (t.subjects && t.subjects.includes(sub.name)) || t.subject === sub.name);

            return (
              <div className="subject-card" key={sub.id}>
                <div className="subject-card-icon" style={{ fontSize: '24px', color: 'var(--color-accent)' }}>
                  📚
                </div>
                <div className="subject-card-header-info">
                  <h4 className="title-large" style={{ margin: 0, fontWeight: '700' }}>
                    {lang === 'ar' ? sub.name : sub.nameEn}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {sub.id}
                  </span>
                </div>
                
                <div className="subject-card-body" style={{ marginTop: '8px' }}>
                  {/* Classes using this subject */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                      🏫 {lang === 'ar' ? 'الفصول التي تدرس المادة:' : 'Classes studying this subject:'}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxHeight: '55px', overflowY: 'auto' }}>
                      {studyingClasses.length > 0 ? (
                        studyingClasses.map((cls, cIdx) => (
                          <span key={cIdx} className="chip" style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(30, 80, 142, 0.05)', color: 'var(--color-primary-ui)', cursor: 'default', border: '1px solid rgba(30, 80, 142, 0.1)' }}>
                            {lang === 'ar' ? cls.name : cls.nameEn}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'لم تسند لأي فصل بعد' : 'Not assigned to any class yet'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teachers teaching this subject */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                      👨‍🏫 {lang === 'ar' ? 'المعلمون المدرسون للمادة:' : 'Teachers teaching this subject:'}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {teachingTeachers.length > 0 ? (
                        teachingTeachers.map((teach, tIdx) => (
                          <span 
                            key={tIdx} 
                            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'rgba(30, 80, 142, 0.04)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                          >
                            <span>{teach.photo || "👨‍🏫"}</span>
                            <span style={{ fontWeight: '500' }}>{lang === 'ar' ? teach.name : teach.nameEn}</span>
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'لا يوجد معلم مسند' : 'No teacher assigned'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="subject-card-actions" style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <button 
                    className="btn-elevated"
                    style={{ flex: 1, padding: '8px 4px', fontSize: '12px' }}
                    onClick={() => {
                      setSelectedSubjectForDetails(sub);
                      setShowSubjectDetailsModal(true);
                    }}
                  >
                    🔍 {lang === 'ar' ? 'عرض التفاصيل' : 'Details'}
                  </button>
                  {canAction('subjects', 'update') && (
                    <button 
                      className="btn-elevated"
                      style={{ padding: '8px 10px', fontSize: '12px' }}
                      onClick={() => {
                        setFormError('');
                        setSelectedSubjectIdForEdit(sub.id);
                        setModalSubjectNameAr(sub.name);
                        setModalSubjectNameEn(sub.nameEn);
                        setModalSubjectClasses(classes.filter(c => c.subjects.includes(sub.name)).map(c => c.name));
                        setShowEditSubjectModal(true);
                      }}
                    >
                      📝
                    </button>
                  )}
                  {canAction('subjects', 'delete') && (
                    <button 
                      className="btn-elevated danger"
                      style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--color-error)' }}
                      onClick={() => handleDeleteSubject(sub.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      </div>

      {/* MODAL DIALOG: ADD SUBJECT */}
      {showSubjectModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">📚 {lang === 'ar' ? 'إضافة مادة دراسية جديدة' : 'Add New Subject'}</h3>
              <button className="modal-close-btn" onClick={() => setShowSubjectModal(false)}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <form onSubmit={handleAddSubject}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم المادة (بالعربية)' : 'Subject Name (Arabic)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder="مثال: التربية الفنية"
                    value={modalSubjectNameAr}
                    onChange={(e) => setModalSubjectNameAr(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم المادة (بالإنجليزية)' : 'Subject Name (English)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder="e.g. Art Education"
                    value={modalSubjectNameEn}
                    onChange={(e) => setModalSubjectNameEn(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الفصول المدرسية للمادة' : 'Classes Studying This Subject'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-input)' }}>
                    {classes.map(cls => (
                      <label key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={modalSubjectClasses.includes(cls.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModalSubjectClasses(prev => [...prev, cls.name]);
                            } else {
                              setModalSubjectClasses(prev => prev.filter(c => c !== cls.name));
                            }
                          }}
                        />
                        {lang === 'ar' ? cls.name : cls.nameEn}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowSubjectModal(false)} style={{ height: '48px' }} disabled={isSaving}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: EDIT SUBJECT */}
      {showEditSubjectModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">📚 {lang === 'ar' ? 'تعديل المادة الدراسية' : 'Edit Subject Details'}</h3>
              <button className="modal-close-btn" onClick={() => setShowEditSubjectModal(false)}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <form onSubmit={handleEditSubject}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم المادة (بالعربية)' : 'Subject Name (Arabic)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    value={modalSubjectNameAr}
                    onChange={(e) => setModalSubjectNameAr(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم المادة (بالإنجليزية)' : 'Subject Name (English)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    value={modalSubjectNameEn}
                    onChange={(e) => setModalSubjectNameEn(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الفصول المدرسية للمادة' : 'Classes Studying This Subject'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-input)' }}>
                    {classes.map(cls => (
                      <label key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={modalSubjectClasses.includes(cls.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModalSubjectClasses(prev => [...prev, cls.name]);
                            } else {
                              setModalSubjectClasses(prev => prev.filter(c => c !== cls.name));
                            }
                          }}
                        />
                        {lang === 'ar' ? cls.name : cls.nameEn}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowEditSubjectModal(false)} style={{ height: '48px' }} disabled={isSaving}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: SUBJECT DETAILS */}
      {showSubjectDetailsModal && selectedSubjectForDetails && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <header className="modal-header">
              <h3 className="modal-title">📚 {lang === 'ar' ? `تفاصيل المادة: ${selectedSubjectForDetails.name}` : `Subject Details: ${selectedSubjectForDetails.nameEn}`}</h3>
              <button className="modal-close-btn" onClick={() => { setShowSubjectDetailsModal(false); setSelectedSubjectForDetails(null); }}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <div className="modal-body">
              {/* Classes studying this subject and their assigned teachers */}
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>🏫 {lang === 'ar' ? 'الفصول الدراسية والمعلمون المكلفون:' : 'Classes & Assigned Teachers:'}</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '12px', marginBottom: '20px' }}>
                <table className="students-table" style={{ margin: 0, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', fontSize: '12px' }}>{lang === 'ar' ? 'الفصل الدراسي' : 'Class'}</th>
                      <th style={{ padding: '8px 12px', fontSize: '12px' }}>{t.teacherName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.filter(c => c.subjects.includes(selectedSubjectForDetails.name)).length > 0 ? (
                      classes
                        .filter(c => c.subjects.includes(selectedSubjectForDetails.name))
                        .map((cls, idx) => {
                          const classTeacher = teachers.find(t => 
                            t.teachingAssignments && 
                            t.teachingAssignments.some(a => a.class === cls.name && a.subject === selectedSubjectForDetails.name)
                          );
                          return (
                            <tr key={idx}>
                              <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 'bold' }}>
                                {lang === 'ar' ? cls.name : cls.nameEn}
                              </td>
                              <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '600' }}>
                                {classTeacher ? (
                                  <>
                                    {renderAvatar(classTeacher.photo, "👨‍🏫")}
                                    {lang === 'ar' ? classTeacher.name : classTeacher.nameEn}
                                  </>
                                ) : (
                                  <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                    {lang === 'ar' ? 'غير مسند' : 'Not Assigned'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                          {lang === 'ar' ? 'لا توجد فصول تدرس هذه المادة حالياً' : 'No classes are studying this subject currently'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Teachers Teaching list */}
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>👨‍🏫 {lang === 'ar' ? 'معلمو المادة المقيدون:' : 'Teachers teaching this subject:'}</h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                <table className="students-table" style={{ margin: 0, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', fontSize: '12px' }}>{t.teacherName}</th>
                      <th style={{ padding: '8px 12px', fontSize: '12px' }}>{t.assignedClasses}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.filter(t => t.teachingAssignments && t.teachingAssignments.some(a => a.subject === selectedSubjectForDetails.name)).length > 0 ? (
                      teachers
                        .filter(t => t.teachingAssignments && t.teachingAssignments.some(a => a.subject === selectedSubjectForDetails.name))
                        .map(teach => {
                          const assignedClassesForThisSubject = teach.teachingAssignments
                             .filter(a => a.subject === selectedSubjectForDetails.name)
                             .map(a => a.class);
                          return (
                            <tr key={teach.id}>
                              <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '600' }}>
                                {renderAvatar(teach.photo, "👨‍🏫")}
                                {lang === 'ar' ? teach.name : teach.nameEn}
                              </td>
                              <td style={{ padding: '8px 12px', fontSize: '12px' }}>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {assignedClassesForThisSubject.map((cName, cIdx) => (
                                    <span key={cIdx} className="chip" style={{ fontSize: '10px', padding: '1px 6px', cursor: 'default' }}>
                                      {cName}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                          {lang === 'ar' ? 'لا يوجد معلمون مسندون لهذه المادة بعد' : 'No teachers assigned to this subject yet'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <footer className="modal-footer">
              <button className="btn-filled" onClick={() => { setShowSubjectDetailsModal(false); setSelectedSubjectForDetails(null); }}>
                {lang === 'ar' ? 'إغلاق النافذة' : 'Close'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
