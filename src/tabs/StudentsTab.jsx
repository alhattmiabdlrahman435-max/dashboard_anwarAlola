import { api } from "../services/api";
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, X, Download, Upload, Camera, User, Edit3, Trash2 } from 'lucide-react';

export default function StudentsTab() {
  const {
    lang, t, students, parentUsers, availableGrades, availableSections,
    setSelectedStudentForCard, setShowCardVisualizerModal,
    handleAddStudent, handleEditStudent, handleDeleteStudent, renderAvatar, currentUser, controlMultiplier, controlOffset,
    canAction, fetchStudents, setToastMessage, classes, triggerConfirm
  } = useApp();

  // Local UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Student Form states
  const [modalStudentName, setModalStudentName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  // Edit Student Form states
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editStudentPhoto, setEditStudentPhoto] = useState('');
  const [editTuitionFee, setEditTuitionFee] = useState('10000');
  const [editFormError, setEditFormError] = useState('');
  const [modalParentNationalId, setModalParentNationalId] = useState('');
  const [modalParentName, setModalParentName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalStudentPhoto, setModalStudentPhoto] = useState('');
  const [modalParentPhoto, setModalParentPhoto] = useState('');
  const [modalTuitionFee, setModalTuitionFee] = useState('10000');
  const [formError, setFormError] = useState('');
  const [selectedParentLinkOption, setSelectedParentLinkOption] = useState('');
  const [parentSearchText, setParentSearchText] = useState('');

  const handleNationalIdChange = (val) => {
    setModalParentNationalId(val);
    const cleanId = val.replace(/\D/g, '');
    if (cleanId.length === 10) {
      const existingRelation = students.find(s => s.parentNationalId === cleanId);
      if (existingRelation) {
        setModalParentName(existingRelation.parentName);
        setModalPhone(existingRelation.phone);
        setModalParentPhoto(existingRelation.parentPhoto || "🧔");
      }
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedParentLinkOption) {
      setFormError(lang === 'ar' ? 'الرجاء اختيار ولي أمر الطالب أولاً' : 'Please select the student\'s parent first');
      return;
    }

    const selectedParentObj = parentUsers.find(p => p.nationalId === selectedParentLinkOption);
    if (!selectedParentObj) {
      setFormError(lang === 'ar' ? 'فشل العثور على حساب ولي الأمر المحدد!' : 'Selected parent account not found!');
      return;
    }

    const parentNameVal = selectedParentObj.name;
    const parentPhoneVal = selectedParentObj.phone;
    const parentNationalIdVal = selectedParentObj.nationalId;
    const parentPhotoVal = selectedParentObj.photo || '🧔';
    const newParentObj = null;

    if (!modalStudentName.trim()) {
      setFormError(t.emptyError);
      return;
    }

    if (!modalStudentPhoto) {
      setFormError(t.photoErrorStudent);
      return;
    }

    const classObj = classes.find(c => c.id === selectedClassId);
    if (!classObj) {
      setFormError(lang === 'ar' ? 'الرجاء اختيار فصل دراسي صالح!' : 'Please select a valid class!');
      return;
    }

    const getStageIndex = (className) => {
      if (className.includes("تمهيدي أول") || className.includes("KG1") || className.includes("الروضة الأولى")) return "1";
      if (className.includes("تمهيدي ثاني") || className.includes("KG2") || className.includes("الروضة الثانية")) return "2";
      if (className.includes("الأول") && !className.includes("المتوسط") && !className.includes("الثانوي")) return "3";
      if (className.includes("الثاني") && !className.includes("المتوسط") && !className.includes("الثانوي")) return "4";
      if (className.includes("الثالث") && !className.includes("المتوسط") && !className.includes("الثانوي")) return "5";
      if (className.includes("الرابع")) return "6";
      if (className.includes("الخامس")) return "7";
      if (className.includes("السادس")) return "8";
      if (className.includes("المتوسط") && className.includes("الأول")) return "9";
      if (className.includes("المتوسط") && className.includes("الثاني")) return "10";
      if (className.includes("المتوسط") && className.includes("الثالث")) return "11";
      if (className.includes("الثانوي") && className.includes("الأول")) return "12";
      if (className.includes("الثانوي") && className.includes("الثاني")) return "13";
      if (className.includes("الثانوي") && className.includes("الثالث")) return "14";
      return "3";
    };

    const stageIndex = getStageIndex(classObj.grade);
    const studentsInSameGrade = students.filter(s => s.grade === classObj.grade);
    const studentSeq = String(studentsInSameGrade.length + 1);
    const generatedStudentCode = `2026${stageIndex}${studentSeq}`;
    const newId = Number(generatedStudentCode);

    const nameEnFallback = modalStudentName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    
    const newStudent = {
      id: newId,
      name: modalStudentName,
      nameEn: nameEnFallback,
      grade: classObj.grade,
      gradeEn: classObj.gradeEn || classObj.grade,
      section: classObj.section,
      sectionEn: classObj.sectionEn || classObj.section,
      parentName: parentNameVal,
      parentNameEn: parentNameVal,
      parentNationalId: parentNationalIdVal,
      phone: parentPhoneVal,
      status: 'absent', // registers as absent initially until scanned
      time: '--:--',
      qrCode: generatedStudentCode,
      photo: modalStudentPhoto,
      parentPhoto: parentPhotoVal,
      tuitionFee: Number(modalTuitionFee || 10000)
    };

    const calculatedNumericPart = newId * Number(controlMultiplier) + Number(controlOffset);
    const newGradeRow = {
      studentId: newId,
      name: modalStudentName,
      nameEn: nameEnFallback,
      secretCode: calculatedNumericPart.toString(),
      math: 0,
      science: 0,
      arabic: 0,
      english: 0
    };

    // Save to global context
    handleAddStudent(newStudent, newGradeRow, newParentObj);

    setShowStudentModal(false);
  };

  const openEditModal = (student) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name);
    const studentClass = classes.find(c => c.grade === student.grade && c.section === student.section);
    setEditClassId(studentClass ? studentClass.id : '');
    setEditStudentPhoto(student.photo || '');
    setEditTuitionFee(String(student.tuitionFee || 10000));
    setEditFormError('');
    setShowEditStudentModal(true);
  };

  const onEditSubmit = (e) => {
    e.preventDefault();
    setEditFormError('');

    if (!editStudentName.trim()) {
      setEditFormError(t.emptyError);
      return;
    }

    if (!editStudentPhoto) {
      setEditFormError(t.photoErrorStudent);
      return;
    }

    const classObj = classes.find(c => c.id === editClassId);
    if (!classObj) {
      setEditFormError(lang === 'ar' ? 'الرجاء اختيار فصل دراسي صالح!' : 'Please select a valid class!');
      return;
    }

    handleEditStudent(editingStudentId, {
      name: editStudentName,
      grade: classObj.grade,
      gradeEn: classObj.gradeEn || classObj.grade,
      section: classObj.section,
      sectionEn: classObj.sectionEn || classObj.section,
      photo: editStudentPhoto,
      tuitionFee: Number(editTuitionFee || 10000)
    });

    setShowEditStudentModal(false);

    // Reset inputs
    setModalStudentName('');
    if (classes.length > 0) {
      setSelectedClassId(classes[0].id);
    } else {
      setSelectedClassId('');
    }
    setModalParentNationalId('');
    setModalParentName('');
    setModalPhone('');
    setModalStudentPhoto('');
    setModalParentPhoto('');
    setModalTuitionFee('10000');
    setSelectedParentLinkOption('');
    setParentSearchText('');
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/api/students/export');
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تصدير البيانات' : 'Failed to export data');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students_export.csv';
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
      const data = await api.post('/api/students/import', formData);
      if (data.success) {
        setToastMessage(data.message);
        fetchStudents(localStorage.getItem('auth_token'));
      } else {
        alert(data.message || (lang === 'ar' ? 'حدث خطأ أثناء الاستيراد' : 'Error importing'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/api/students/template');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(student => {
    if (currentUser?.role === 'parent' && student.parentNationalId !== currentUser.username) {
      return false;
    }
    
    const matchesSearch = lang === 'ar'
      ? student.name.toLowerCase().includes(searchQuery.toLowerCase()) || (student.qrCode && student.qrCode.includes(searchQuery))
      : student.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || (student.qrCode && student.qrCode.includes(searchQuery));
    
    const matchesFilter = statusFilter === 'all' || student.status === statusFilter;

    const studentClass = `${student.grade} - ${student.section}`;
    const matchesClass = classFilter === 'all' || studentClass === classFilter;
    
    return matchesSearch && matchesFilter && matchesClass;
  });

  const filteredParentUsers = parentUsers.filter(p => {
    const term = parentSearchText.trim().toLowerCase();
    if (!term) return true;
    return p.name.toLowerCase().includes(term) || p.nationalId.includes(term);
  });

  return (
    <>
      <div className="section-card">
        <div className="section-card-header no-print">
          <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
            {lang === 'ar' ? 'سجل شؤون الطلاب والبطاقات الذكية' : 'Student Registry & Smart Cards'}
          </h3>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {canAction('students', 'export') && (
              <button className="btn-elevated" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download size={16} />
                {lang === 'ar' ? 'تصدير' : 'Export'}
              </button>
            )}
            {canAction('students', 'import') && (
              <>
                <button className="btn-elevated" onClick={handleDownloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={lang === 'ar' ? 'تحميل النموذج الفارغ' : 'Download Template'}>
                  {lang === 'ar' ? 'النموذج' : 'Template'}
                </button>
                <label className="btn-elevated" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0 }}>
                  <Upload size={16} />
                  {lang === 'ar' ? 'استيراد' : 'Import'}
                  <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
                </label>
              </>
            )}
            {canAction('students', 'create') && (
              <button 
                className="btn-accent"
                onClick={() => {
                  setFormError('');
                  setModalStudentName('');
                  setModalParentNationalId('');
                  setModalParentName('');
                  setModalPhone('');
                  setModalStudentPhoto('');
                  setModalParentPhoto('');
                  setSelectedParentLinkOption('');
                  setParentSearchText('');
                  if (classes.length > 0) {
                    setSelectedClassId(classes[0].id);
                  } else {
                    setSelectedClassId('');
                  }
                  setShowStudentModal(true);
                }}
              >
                <Plus size={18} strokeWidth={2.5} style={{ marginInlineEnd: '4px' }} />
                {t.requestCardBtn}
              </button>
            )}
          </div>
        </div>

        {/* Searching and Filter Chips */}
        <div className="students-controls no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            <div className="search-box" style={{ margin: 0, minWidth: '280px' }}>
              <Search size={18} />
              <input 
                type="text"
                className="text-field"
                placeholder={lang === 'ar' ? 'البحث باسم الطالب أو الرقم الأكاديمي...' : 'Search by name or student number...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Class Filter Dropdown */}
            <select 
              className="text-field"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{ fontSize: '13px', padding: '0 12px', height: '42px', width: 'auto', minWidth: '180px', borderRadius: '10px' }}
            >
              <option value="all">{lang === 'ar' ? '🔍 كل الفصول' : '🔍 All Classes'}</option>
              {(classes || []).map(cls => (
                <option key={cls.id} value={cls.name}>
                  🏫 {lang === 'ar' ? cls.name : cls.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className={`chip ${statusFilter === 'all' ? 'selected' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              {t.filterAll}
            </button>
            <button 
              className={`chip ${statusFilter === 'present' ? 'selected' : ''}`}
              onClick={() => setStatusFilter('present')}
            >
              {t.present}
            </button>
            <button 
              className={`chip ${statusFilter === 'absent' ? 'selected' : ''}`}
              onClick={() => setStatusFilter('absent')}
            >
              {t.absent}
            </button>
          </div>
        </div>

        {/* Students Data Grid Table */}
        <div className="students-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>{t.studentId}</th>
                <th>{t.studentName}</th>
                <th>{t.grade}</th>
                <th>{t.section}</th>
                <th>{t.status}</th>
                <th>{t.parentName}</th>
                <th className="no-print">{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{student.qrCode || student.id}</td>
                    <td style={{ fontWeight: '600' }}>
                      {renderAvatar(student.photo, "👨‍🎓")}
                      {lang === 'ar' ? student.name : student.nameEn}
                    </td>
                    <td>{lang === 'ar' ? student.grade : student.gradeEn}</td>
                    <td>{lang === 'ar' ? student.section : student.sectionEn}</td>
                    <td>
                      <span className={`badge-status ${student.status === 'present' || student.status === 'late' ? 'checked-in' : 'absent'}`}>
                        {(student.status === 'present' || student.status === 'late') ? t.present : t.absent}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{renderAvatar(student.parentPhoto, "🧔")} {lang === 'ar' ? student.parentName : student.parentNameEn}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        {lang === 'ar' ? 'الرقم الوطني: ' : 'National ID: '}{student.parentNationalId}
                      </div>
                    </td>
                    <td className="no-print">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          className="btn-elevated"
                          style={{ padding: '6px 12px', fontSize: '12px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => {
                            setSelectedStudentForCard(student);
                            setShowCardVisualizerModal(true);
                          }}
                        >
                          🪪 {t.viewCard}
                        </button>
                        
                        {canAction('edit') && (
                          <button 
                            onClick={() => openEditModal(student)} 
                            title={lang === 'ar' ? 'تعديل' : 'Edit'}
                            style={{
                              background: 'rgba(37, 99, 235, 0.06)',
                              border: '1px solid rgba(37, 99, 235, 0.15)',
                              color: '#2563eb',
                              borderRadius: '8px',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.12)';
                              e.currentTarget.style.borderColor = '#2563eb';
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.06)';
                              e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.15)';
                            }}
                          >
                            <Edit3 size={15} />
                          </button>
                        )}

                        {canAction('delete') && (
                          <button 
                            onClick={() => {
                              triggerConfirm({
                                title: lang === 'ar' ? 'حذف الطالب' : 'Delete Student',
                                message: lang === 'ar' ? `هل أنت متأكد من حذف الطالب ${student.name}؟` : `Are you sure you want to delete ${student.name}?`,
                                onConfirm: () => handleDeleteStudent(student.id)
                              });
                            }} 
                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                            style={{
                              background: 'rgba(220, 38, 38, 0.06)',
                              border: '1px solid rgba(220, 38, 38, 0.15)',
                              color: '#dc2626',
                              borderRadius: '8px',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.12)';
                              e.currentTarget.style.borderColor = '#dc2626';
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.06)';
                              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.15)';
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                    {lang === 'ar' ? 'لا يوجد نتائج تطابق البحث' : 'No matching results found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DIALOG 1: REGISTER STUDENT FORM */}
      {showStudentModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container">
            <header className="modal-header">
              <h3 className="modal-title">{t.addStudentTitle}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowStudentModal(false)}
                aria-label="Close Registration Dialog"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={onSubmit}>
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
                  <label className="form-label">{t.formStudentName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder="مثال: عبدالمجيد بن فهد العتيبي"
                    value={modalStudentName}
                    onChange={(e) => setModalStudentName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الفصل الدراسي والشعبة' : 'Class & Section'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <select 
                    className="text-field"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    required
                  >
                    <option value="">{lang === 'ar' ? '-- اختر الفصل --' : '-- Select Class --'}</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ar' ? c.name : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الرسوم الدراسية السنوية (ر.ي)' : 'Annual Tuition Fee (R.Y)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="number" 
                    className="text-field"
                    placeholder="10000"
                    value={modalTuitionFee}
                    onChange={(e) => setModalTuitionFee(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                  <label className="form-label">{lang === 'ar' ? 'ربط بحساب ولي أمر' : 'Link to Parent Account'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  
                  {/* Parent Search Input */}
                  <input
                    type="text"
                    className="text-field"
                    style={{ marginBottom: '8px' }}
                    placeholder={lang === 'ar' ? '🔍 اكتب اسم ولي الأمر أو الرقم الوطني للبحث...' : '🔍 Type parent name or national ID to search...'}
                    value={parentSearchText}
                    onChange={(e) => setParentSearchText(e.target.value)}
                  />

                  <select
                    className="text-field"
                    value={selectedParentLinkOption}
                    onChange={(e) => {
                      const opt = e.target.value;
                      setSelectedParentLinkOption(opt);
                      const parent = parentUsers.find(p => p.nationalId === opt);
                      if (parent) {
                        setModalParentNationalId(parent.nationalId);
                        setModalParentName(parent.name);
                        setModalPhone(parent.phone);
                        setModalParentPhoto(parent.photo || '🧔');
                      } else {
                        setModalParentNationalId('');
                        setModalParentName('');
                        setModalPhone('');
                        setModalParentPhoto('');
                      }
                    }}
                    required
                  >
                    <option value="">{lang === 'ar' ? '-- اختر ولي الأمر --' : '-- Select Parent --'}</option>
                    {filteredParentUsers.map(p => (
                      <option key={p.nationalId} value={p.nationalId}>
                        {p.name} ({p.nationalId})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedParentLinkOption && (
                  <div style={{ 
                    padding: '14px', 
                    background: 'rgba(30, 80, 142, 0.03)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '16px', 
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderAvatar(modalParentPhoto, "🧔")}
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{modalParentName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'الرقم الوطني لولي الأمر: ' : 'National ID: '}{modalParentNationalId}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📞 {lang === 'ar' ? 'رقم الجوال: ' : 'Phone Number: '} {modalPhone}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">
                      {t.formPhoto} (Student) <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        id="student-photo-input"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setModalStudentPhoto(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      
                      <div style={{ position: 'relative' }}>
                        {/* Circle Container */}
                        <label 
                          htmlFor="student-photo-input" 
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            border: modalStudentPhoto ? '2px solid var(--color-primary)' : '2px dashed var(--color-border)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            backgroundColor: 'var(--color-surface)',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          className="avatar-upload-label"
                        >
                          {modalStudentPhoto ? (
                            <>
                              <img 
                                src={modalStudentPhoto} 
                                alt="Student Preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              {/* Hover overlay to change image */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                color: '#ffffff',
                                fontSize: '11px'
                              }} className="avatar-hover-overlay">
                                <Camera size={20} style={{ marginBottom: '4px' }} />
                                <span>{lang === 'ar' ? 'تغيير الصورة' : 'Change'}</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                              <User size={36} style={{ strokeWidth: 1.5, marginBottom: '4px', color: 'var(--color-text-tertiary)' }} />
                              <span style={{ fontSize: '11px', fontWeight: '500' }}>
                                {lang === 'ar' ? 'رفع الصورة' : 'Upload'}
                              </span>
                            </div>
                          )}
                        </label>

                        {/* Delete / Clear button */}
                        {modalStudentPhoto && (
                          <button
                            type="button"
                            onClick={() => {
                              setModalStudentPhoto(null);
                              const fileInput = document.getElementById('student-photo-input');
                              if (fileInput) fileInput.value = '';
                            }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: '#ef4444',
                              color: '#ffffff',
                              border: '2px solid #ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                              zIndex: 10,
                              padding: 0
                            }}
                            title={lang === 'ar' ? 'إزالة الصورة' : 'Remove Photo'}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '4px' }}>
                        {lang === 'ar' ? 'صيغ الصور المدعومة: JPG, PNG. الحد الأقصى 5MB.' : 'Supported formats: JPG, PNG. Max 5MB.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button 
                  type="button" 
                  className="btn-elevated"
                  onClick={() => setShowStudentModal(false)}
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

      {/* MODAL DIALOG 3: EDIT STUDENT FORM */}
      {showEditStudentModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container">
            <header className="modal-header">
              <h2 className="headline-small" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {lang === 'ar' ? '✏️ تعديل بيانات الطالب' : '✏️ Edit Student Details'}
              </h2>
              <button 
                className="btn-text" 
                onClick={() => setShowEditStudentModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={onEditSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {editFormError && (
                  <div style={{ color: 'var(--color-error)', fontSize: '13px', fontWeight: '600', padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '6px' }}>
                    ⚠️ {editFormError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">{t.studentName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: ياسر بن محمد الرويلي' : 'e.g. Yasser bin Mohammed'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الفصل الدراسي والشعبة' : 'Class & Section'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <select 
                    className="text-field"
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
                    required
                  >
                    <option value="">{lang === 'ar' ? '-- اختر الفصل --' : '-- Select Class --'}</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ar' ? c.name : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الرسوم الدراسية السنوية (ر.ي)' : 'Annual Tuition Fee (R.Y)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="number" 
                    className="text-field"
                    value={editTuitionFee}
                    onChange={(e) => setEditTuitionFee(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">
                      {t.formPhoto} (Student) <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        id="edit-student-photo-input"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditStudentPhoto(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      
                      <div style={{ position: 'relative' }}>
                        <label 
                          htmlFor="edit-student-photo-input" 
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            border: editStudentPhoto ? '2px solid var(--color-primary)' : '2px dashed var(--color-border)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            backgroundColor: 'var(--color-surface)',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          className="avatar-upload-label"
                        >
                          {editStudentPhoto ? (
                            <>
                              <img 
                                src={editStudentPhoto} 
                                alt="Student Preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                color: '#ffffff',
                                fontSize: '11px'
                              }} className="avatar-hover-overlay">
                                <Camera size={20} style={{ marginBottom: '4px' }} />
                                <span>{lang === 'ar' ? 'تغيير الصورة' : 'Change'}</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                              <User size={36} style={{ strokeWidth: 1.5, marginBottom: '4px', color: 'var(--color-text-tertiary)' }} />
                              <span style={{ fontSize: '11px', fontWeight: '500' }}>
                                {lang === 'ar' ? 'رفع الصورة' : 'Upload'}
                              </span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button 
                  type="button" 
                  className="btn-elevated" 
                  onClick={() => setShowEditStudentModal(false)}
                  style={{ height: '48px' }}
                >
                  {t.cancel}
                </button>
                <button type="submit" className="btn-filled" style={{ height: '48px' }}>
                  {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </>
  );
}