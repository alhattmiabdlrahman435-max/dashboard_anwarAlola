import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, X } from 'lucide-react';

export default function ClassesTab() {
  const {
    lang,
    t,
    classes,
    setClasses,
    students,
    teachers,
    subjects,
    availableGrades,
    availableSections,
    setToastMessage
  } = useApp();

  // Local state for searching & modals
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  
  // Modals visibility
  const [showClassModal, setShowClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showClassDetailsModal, setShowClassDetailsModal] = useState(false);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState(null);
  const [selectedClassIdForEdit, setSelectedClassIdForEdit] = useState(null);

  // Form Fields
  const [modalClassNameAr, setModalClassNameAr] = useState('');
  const [modalClassNameEn, setModalClassNameEn] = useState('');
  const [modalClassGrade, setModalClassGrade] = useState('الصف الأول');
  const [modalClassGradeEn, setModalClassGradeEn] = useState('Grade 1');
  const [modalClassSection, setModalClassSection] = useState('أ');
  const [modalClassSectionEn, setModalClassSectionEn] = useState('A');
  const [modalClassSubjects, setModalClassSubjects] = useState([]);

  // CRUD Handlers
  const handleAddClass = (e) => {
    e.preventDefault();
    setFormError('');
    if (!modalClassNameAr.trim() || !modalClassNameEn.trim()) {
      setFormError(t.emptyError);
      return;
    }
    
    // Check if name already exists
    if (classes.some(c => c.name === modalClassNameAr.trim())) {
      setFormError(lang === 'ar' ? 'هذا الفصل مسجل بالفعل!' : 'Class name already exists!');
      return;
    }

    const newClass = {
      id: 'cls-' + Date.now(),
      name: modalClassNameAr.trim(),
      nameEn: modalClassNameEn.trim(),
      grade: modalClassGrade,
      gradeEn: modalClassGradeEn,
      section: modalClassSection,
      sectionEn: modalClassSectionEn,
      subjects: modalClassSubjects
    };

    setClasses(prev => [...prev, newClass]);
    setShowClassModal(false);
    setToastMessage(lang === 'ar' ? 'تمت إضافة الفصل الدراسي بنجاح!' : 'Class created successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleEditClass = (e) => {
    e.preventDefault();
    setFormError('');
    if (!modalClassNameAr.trim() || !modalClassNameEn.trim()) {
      setFormError(t.emptyError);
      return;
    }

    setClasses(prev => prev.map(c => {
      if (c.id === selectedClassIdForEdit) {
        return {
          ...c,
          name: modalClassNameAr.trim(),
          nameEn: modalClassNameEn.trim(),
          grade: modalClassGrade,
          gradeEn: modalClassGradeEn,
          section: modalClassSection,
          sectionEn: modalClassSectionEn,
          subjects: modalClassSubjects
        };
      }
      return c;
    }));

    setShowEditClassModal(false);
    setToastMessage(lang === 'ar' ? 'تم تحديث بيانات الفصل بنجاح!' : 'Class details updated successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteClass = (id) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الفصل؟' : 'Are you sure you want to delete this class?')) {
      setClasses(prev => prev.filter(c => c.id !== id));
      setToastMessage(lang === 'ar' ? 'تم حذف الفصل بنجاح' : 'Class deleted successfully');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          {lang === 'ar' ? 'سجل الفصول الدراسية والشُعب' : 'Classes & Sections Registry'}
        </h3>
        <button 
          className="btn-accent"
          onClick={() => {
            setFormError('');
            setModalClassNameAr('');
            setModalClassNameEn('');
            setModalClassGrade('الصف الأول');
            setModalClassGradeEn('Grade 1');
            setModalClassSection('أ');
            setModalClassSectionEn('A');
            setModalClassSubjects([]);
            setShowClassModal(true);
          }}
        >
          <Plus size={18} strokeWidth={2.5} style={{ marginInlineEnd: '4px' }} />
          {lang === 'ar' ? 'إضافة فصل جديد' : 'Add New Class'}
        </button>
      </div>

      {/* Search Box */}
      <div className="students-controls no-print" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text"
            className="text-field"
            placeholder={lang === 'ar' ? 'ابحث عن فصل...' : 'Search for a class...'}
            value={classSearchQuery}
            onChange={(e) => setClassSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Classes grid container */}
      <div className="classes-grid">
        {classes
          .filter(cls => {
            const query = classSearchQuery.toLowerCase();
            return (
              cls.name.toLowerCase().includes(query) ||
              (cls.nameEn && cls.nameEn.toLowerCase().includes(query)) ||
              cls.grade.toLowerCase().includes(query)
            );
          })
          .map(cls => {
            // Calculate students count in this class
            const studentCount = students.filter(s => s.grade === cls.grade && s.section === cls.section).length;
            // Find teachers teaching in this class
            const classTeachers = teachers.filter(t => t.classes.includes(cls.name));

            return (
              <div className="class-card" key={cls.id}>
                <div className="class-card-icon" style={{ fontSize: '24px', color: 'var(--color-primary-ui)' }}>
                  🏫
                </div>
                <div className="class-card-header-info">
                  <h4 className="title-large" style={{ margin: 0, fontWeight: '700' }}>
                    {lang === 'ar' ? cls.name : (cls.nameEn || cls.name)}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {lang === 'ar' ? `المرحلة: ${cls.grade}` : `Grade: ${cls.gradeEn || cls.grade}`}
                  </span>
                </div>
                
                <div className="class-card-body" style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>👥 {lang === 'ar' ? 'الطلاب:' : 'Students:'}</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{studentCount} {lang === 'ar' ? 'طالب' : 'students'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                    <span>👨‍🏫 {lang === 'ar' ? 'المعلمون:' : 'Teachers:'}</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{classTeachers.length} {lang === 'ar' ? 'معلم' : 'teachers'}</strong>
                  </div>

                  {/* Subjects count & preview */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                      📚 {lang === 'ar' ? 'المواد المقررة:' : 'Assigned Subjects:'}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxHeight: '55px', overflowY: 'auto' }}>
                      {cls.subjects && cls.subjects.length > 0 ? (
                        cls.subjects.map((subName, sIdx) => (
                          <span key={sIdx} className="chip" style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(30, 80, 142, 0.05)', color: 'var(--color-primary-ui)', cursor: 'default', border: '1px solid rgba(30, 80, 142, 0.1)' }}>
                            {subName}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'لا يوجد مواد' : 'No subjects assigned'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teachers preview */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                      🎓 {lang === 'ar' ? 'المدرسون:' : 'Instructors:'}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {classTeachers.length > 0 ? (
                        classTeachers.map((teach, tIdx) => (
                          <span 
                            key={tIdx} 
                            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'rgba(30, 80, 142, 0.04)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                            title={lang === 'ar' ? teach.subject : teach.subjectEn}
                          >
                            <span>{teach.photo || "👨‍🏫"}</span>
                            <span style={{ fontWeight: '500' }}>{lang === 'ar' ? teach.name.split(' ').slice(1).join(' ') : teach.nameEn}</span>
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'لا يوجد معلمون' : 'No teachers assigned'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="class-card-actions" style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <button 
                    className="btn-elevated"
                    style={{ flex: 1, padding: '8px 4px', fontSize: '12px' }}
                    onClick={() => {
                      setSelectedClassForDetails(cls);
                      setShowClassDetailsModal(true);
                    }}
                  >
                    🔍 {lang === 'ar' ? 'عرض التفاصيل' : 'Details'}
                  </button>
                  <button 
                    className="btn-elevated"
                    style={{ padding: '8px 10px', fontSize: '12px' }}
                    onClick={() => {
                      setFormError('');
                      setSelectedClassIdForEdit(cls.id);
                      setModalClassNameAr(cls.name);
                      setModalClassNameEn(cls.nameEn || '');
                      setModalClassGrade(cls.grade);
                      setModalClassGradeEn(cls.gradeEn || '');
                      setModalClassSection(cls.section);
                      setModalClassSectionEn(cls.sectionEn || '');
                      setModalClassSubjects(cls.subjects || []);
                      setShowEditClassModal(true);
                    }}
                  >
                    📝
                  </button>
                  <button 
                    className="btn-elevated danger"
                    style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--color-error)' }}
                    onClick={() => handleDeleteClass(cls.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* MODAL DIALOG: ADD CLASS */}
      {showClassModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">🏫 {lang === 'ar' ? 'إنشاء فصل دراسي جديد' : 'Create New Class'}</h3>
              <button className="modal-close-btn" onClick={() => setShowClassModal(false)}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <form onSubmit={handleAddClass}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم الفصل الدراسي' : 'Class Name'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder={lang === 'ar' ? 'مثال: الصف الأول - أ' : 'e.g. Grade 1 - A'}
                    value={modalClassNameAr}
                    onChange={(e) => {
                      setModalClassNameAr(e.target.value);
                      // Auto generate English name
                      setModalClassNameEn(e.target.value.replace('الصف الأول', 'Grade 1').replace('الصف الثاني', 'Grade 2').replace('الصف الثالث', 'Grade 3').replace('أ', 'A').replace('ب', 'B').replace('ج', 'C'));
                    }}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الصف' : 'Grade'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field" 
                      value={modalClassGrade} 
                      onChange={(e) => {
                        setModalClassGrade(e.target.value);
                        const gradeMap = { 'الصف الأول': 'Grade 1', 'الصف الثاني': 'Grade 2', 'الصف الثالث': 'Grade 3' };
                        setModalClassGradeEn(gradeMap[e.target.value] || 'Grade 1');
                      }}
                    >
                      {availableGrades.map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الشعبة (القسم)' : 'Section'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field" 
                      value={modalClassSection} 
                      onChange={(e) => {
                        setModalClassSection(e.target.value);
                        const secMap = { 'أ': 'A', 'ب': 'B', 'ج': 'C' };
                        setModalClassSectionEn(secMap[e.target.value] || 'A');
                      }}
                    >
                      {availableSections.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'المواد المقررة للفصل' : 'Assigned Subjects'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-input)' }}>
                    {subjects.map(sub => (
                      <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={modalClassSubjects.includes(sub.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModalClassSubjects(prev => [...prev, sub.name]);
                            } else {
                              setModalClassSubjects(prev => prev.filter(s => s !== sub.name));
                            }
                          }}
                        />
                        {lang === 'ar' ? sub.name : sub.nameEn}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowClassModal(false)} style={{ height: '48px' }}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px' }}>{t.submit}</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: EDIT CLASS */}
      {showEditClassModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">🏫 {lang === 'ar' ? 'تعديل بيانات الفصل الدراسي' : 'Edit Class Details'}</h3>
              <button className="modal-close-btn" onClick={() => setShowEditClassModal(false)}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <form onSubmit={handleEditClass}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم الفصل الدراسي' : 'Class Name'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    value={modalClassNameAr}
                    onChange={(e) => setModalClassNameAr(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الصف' : 'Grade'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field" 
                      value={modalClassGrade} 
                      onChange={(e) => {
                        setModalClassGrade(e.target.value);
                        const gradeMap = { 'الصف الأول': 'Grade 1', 'الصف الثاني': 'Grade 2', 'الصف الثالث': 'Grade 3' };
                        setModalClassGradeEn(gradeMap[e.target.value] || 'Grade 1');
                      }}
                    >
                      {availableGrades.map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الشعبة (القسم)' : 'Section'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field" 
                      value={modalClassSection} 
                      onChange={(e) => {
                        setModalClassSection(e.target.value);
                        const secMap = { 'أ': 'A', 'ب': 'B', 'ج': 'C' };
                        setModalClassSectionEn(secMap[e.target.value] || 'A');
                      }}
                    >
                      {availableSections.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'المواد المقررة للفصل' : 'Assigned Subjects'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-input)' }}>
                    {subjects.map(sub => (
                      <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={modalClassSubjects.includes(sub.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModalClassSubjects(prev => [...prev, sub.name]);
                            } else {
                              setModalClassSubjects(prev => prev.filter(s => s !== sub.name));
                            }
                          }}
                        />
                        {lang === 'ar' ? sub.name : sub.nameEn}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowEditClassModal(false)} style={{ height: '48px' }}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px' }}>{t.submit}</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: CLASS DETAILS & STUDENTS LIST */}
      {showClassDetailsModal && selectedClassForDetails && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '650px' }}>
            <header className="modal-header">
              <h3 className="modal-title">🏫 {lang === 'ar' ? `تفاصيل الفصل: ${selectedClassForDetails.name}` : `Class Details: ${selectedClassForDetails.nameEn || selectedClassForDetails.name}`}</h3>
              <button className="modal-close-btn" onClick={() => { setShowClassDetailsModal(false); setSelectedClassForDetails(null); }}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <div className="modal-body">
              {/* Quick Class Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {students.filter(s => s.grade === selectedClassForDetails.grade && s.section === selectedClassForDetails.section).length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'الطلاب المقيدون' : 'Enrolled Students'}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {selectedClassForDetails.subjects ? selectedClassForDetails.subjects.length : 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'المواد المقررة' : 'Assigned Subjects'}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {teachers.filter(t => t.classes.includes(selectedClassForDetails.name)).length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'المعلمون الفاعلون' : 'Active Teachers'}</div>
                </div>
              </div>

              {/* Students List */}
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>👥 {lang === 'ar' ? 'قائمة الطلاب المقيدين بالفصل:' : 'Enrolled Students List:'}</h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '12px', marginBottom: '16px' }}>
                <table className="students-table" style={{ margin: 0, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>ID</th>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>{t.studentName}</th>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.grade === selectedClassForDetails.grade && s.section === selectedClassForDetails.section).length > 0 ? (
                      students
                        .filter(s => s.grade === selectedClassForDetails.grade && s.section === selectedClassForDetails.section)
                        .map(student => (
                          <tr key={student.id}>
                            <td style={{ padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{student.id}</td>
                            <td style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}>
                              {student.photo ? (
                                <span style={{ marginInlineEnd: '6px' }}>{student.photo}</span>
                              ) : null}
                              {lang === 'ar' ? student.name : student.nameEn}
                            </td>
                            <td style={{ padding: '6px 12px', fontSize: '12px' }}>
                              <span className={`badge-status ${student.status === 'present' ? 'checked-in' : 'absent'}`} style={{ padding: '2px 8px', fontSize: '10px' }}>
                                {student.status === 'present' ? t.present : t.absent}
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                          {lang === 'ar' ? 'لا يوجد طلاب مقيدين في هذا الفصل' : 'No students enrolled in this class'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Class Teachers & Subjects mapping */}
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>👨‍🏫 {lang === 'ar' ? 'المعلمون والمواد المقررة:' : 'Teachers & Course Schedule:'}</h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                <table className="students-table" style={{ margin: 0, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>{t.subject}</th>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>{t.teacherName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClassForDetails.subjects && selectedClassForDetails.subjects.length > 0 ? (
                      selectedClassForDetails.subjects.map((subName, index) => {
                        const subjectObj = subjects.find(s => s.name === subName);
                        const subNameEn = subjectObj ? subjectObj.nameEn : subName;
                        const teacherObj = teachers.find(t => 
                          t.teachingAssignments && 
                          t.teachingAssignments.some(a => a.subject === subName && a.class === selectedClassForDetails.name)
                        );
                        return (
                          <tr key={index}>
                            <td style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold' }}>
                              {lang === 'ar' ? subName : subNameEn}
                            </td>
                            <td style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}>
                              {teacherObj ? (
                                <>
                                  {teacherObj.photo ? <span style={{ marginInlineEnd: '6px' }}>{teacherObj.photo}</span> : "👨‍🏫 "}
                                  {lang === 'ar' ? teacherObj.name : teacherObj.nameEn}
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
                          {lang === 'ar' ? 'لا توجد مواد مقرر في هذا الفصل' : 'No subjects assigned to this class'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <footer className="modal-footer">
              <button className="btn-filled" onClick={() => { setShowClassDetailsModal(false); setSelectedClassForDetails(null); }}>
                {lang === 'ar' ? 'إغلاق النافذة' : 'Close'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
