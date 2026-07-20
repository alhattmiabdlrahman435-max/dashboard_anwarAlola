import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTeachers } from '../contexts/Teachers/useTeachers';
import { useClasses } from '../contexts/Classes/useClasses';
import { useSubjects } from '../contexts/Subjects/useSubjects';
import { teachersService } from '../services/teachers/teachers.service';
import { Plus, X, Trash2, Download, Upload, FileSpreadsheet } from 'lucide-react';

export default function TeachersTab() {
  const {
    lang, t, renderAvatar,
    setToastMessage, canAction
  } = useApp();

  const { classes, fetchClasses } = useClasses();
  const { subjects, fetchSubjects } = useSubjects();

  const {
    teachers,
    fetchTeachers,
    handleAddTeacher,
    handleEditTeacher
  } = useTeachers();

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
    fetchSubjects();
  }, [fetchTeachers, fetchClasses, fetchSubjects]);

  // Local UI states
  const [isSaving, setIsSaving] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);

  // Form states
  const [selectedTeacherIdForEdit, setSelectedTeacherIdForEdit] = useState(null);
  const [modalTeacherName, setModalTeacherName] = useState('');
  const [modalTeacherJobId, setModalTeacherJobId] = useState('');
  const [modalTeacherPhone, setModalTeacherPhone] = useState('');
  const [modalTeacherAddress, setModalTeacherAddress] = useState('');
  const [modalTeacherPhoto, setModalTeacherPhoto] = useState('');
  const [modalTeacherAssignments, setModalTeacherAssignments] = useState([]);
  const [modalTeacherAssignmentSubject, setModalTeacherAssignmentSubject] = useState('');
  const [modalTeacherAssignmentClass, setModalTeacherAssignmentClass] = useState('');
  const [formError, setFormError] = useState('');

  // Excel Modal States for Teachers
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelModalTab, setExcelModalTab] = useState('import'); // 'import' | 'export'
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const onAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!modalTeacherName.trim() || !modalTeacherJobId.trim() || !modalTeacherPhone.trim()) {
      setFormError(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة (الاسم، الرقم الوظيفي، رقم الجوال)' : 'Please fill all required fields (name, job ID, phone)');
      return;
    }

    const phoneDigits = modalTeacherPhone.replace(/\D/g, '');
    if (phoneDigits.length !== 9 || !phoneDigits.startsWith('7')) {
      setFormError(lang === 'ar' ? 'رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 7' : 'Phone must be 9 digits starting with 7');
      return;
    }

    const uniqueSubjects = modalTeacherAssignments.length > 0
      ? [...new Set(modalTeacherAssignments.map(a => a.subject))]
      : [];
    const uniqueClasses = modalTeacherAssignments.length > 0
      ? [...new Set(modalTeacherAssignments.map(a => a.class))]
      : [];

    const newId = 100 + teachers.length + 1;
    const nameEnFallback = modalTeacherName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    
    const newTeacher = {
      id: newId,
      jobId: modalTeacherJobId.trim(),
      phone: phoneDigits,
      address: modalTeacherAddress.trim(),
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

    setIsSaving(true);
    handleAddTeacher(newTeacher)
      .then((res) => {
        if (res && res.success) {
          setShowTeacherModal(false);
          // Reset fields on success only
          setModalTeacherName('');
          setModalTeacherAssignments([]);
          setModalTeacherPhoto('');
          setModalTeacherJobId('');
          setModalTeacherPhone('');
          setModalTeacherAddress('');
          setModalTeacherAssignmentSubject('');
          setModalTeacherAssignmentClass('');
        } else {
          setFormError(res?.message || (lang === 'ar' ? 'فشلت العملية' : 'Operation failed'));
        }
      })
      .catch((err) => {
        setFormError(err.message || 'Error occurred');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const onEditSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!modalTeacherName.trim() || !modalTeacherJobId.trim() || !modalTeacherPhone.trim()) {
      setFormError(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة (الاسم، الرقم الوظيفي، رقم الجوال)' : 'Please fill all required fields (name, job ID, phone)');
      return;
    }

    const phoneDigits = modalTeacherPhone.replace(/\D/g, '');
    if (phoneDigits.length !== 9 || !phoneDigits.startsWith('7')) {
      setFormError(lang === 'ar' ? 'رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 7' : 'Phone must be 9 digits starting with 7');
      return;
    }

    const uniqueSubjects = modalTeacherAssignments.length > 0
      ? [...new Set(modalTeacherAssignments.map(a => a.subject))]
      : [];
    const uniqueClasses = modalTeacherAssignments.length > 0
      ? [...new Set(modalTeacherAssignments.map(a => a.class))]
      : [];

    const nameEnEn = modalTeacherName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

    const updatedTeacher = {
      id: selectedTeacherIdForEdit,
      name: modalTeacherName,
      nameEn: nameEnEn,
      jobId: modalTeacherJobId.trim(),
      phone: phoneDigits,
      address: modalTeacherAddress.trim(),
      subject: uniqueSubjects[0],
      subjectEn: uniqueSubjects[0],
      subjects: uniqueSubjects,
      classes: uniqueClasses,
      teachingAssignments: modalTeacherAssignments,
      photo: modalTeacherPhoto
    };

    setIsSaving(true);
    handleEditTeacher(updatedTeacher, selectedTeacherIdForEdit)
      .then((res) => {
        if (res && res.success) {
          setShowEditTeacherModal(false);
          // Reset fields on success only
          setModalTeacherName('');
          setModalTeacherAssignments([]);
          setModalTeacherPhoto('');
          setModalTeacherJobId('');
          setModalTeacherPhone('');
          setModalTeacherAddress('');
          setModalTeacherPhoto('');
          setModalTeacherAssignmentSubject('');
          setModalTeacherAssignmentClass('');
          setSelectedTeacherIdForEdit(null);
        } else {
          setFormError(res?.message || (lang === 'ar' ? 'فشلت العملية' : 'Operation failed'));
        }
      })
      .catch((err) => {
        setFormError(err.message || 'Error occurred');
      })
      .finally(() => {
        setIsSaving(false);
      });
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
      setIsExporting(true);
      const res = await teachersService.exportTeachers();
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تصدير البيانات' : 'Failed to export data');
        setIsExporting(false);
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
      alert(lang === 'ar' ? 'حدث خطأ أثناء التصدير' : 'Error exporting');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsLoadingTemplate(true);
      const res = await teachersService.downloadTemplate();
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تحميل النموذج' : 'Failed to download template');
        setIsLoadingTemplate(false);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'teachers_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert(lang === 'ar' ? 'حدث خطأ أثناء تحميل النموذج' : 'Error downloading template');
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const handleImportExcel = async (e) => {
    if (e) e.preventDefault();
    if (!importFile) {
      alert(lang === 'ar' ? 'يرجى اختيار ملف أولاً' : 'Please select a file first');
      return;
    }

    setIsImporting(true);
    setImportProgress(10);
    setImportStatus(lang === 'ar' ? 'جاري رفع الملف...' : 'Uploading file...');
    setImportErrors([]);
    setImportSuccess(false);

    const formData = new FormData();
    formData.append('file', importFile);

    // Mock progress animation
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const data = await teachersService.importTeachers(formData);
      clearInterval(interval);
      setImportProgress(100);
      if (data.success) {
        setImportSuccess(true);
        setImportStatus(data.message);
        if (data.errors && data.errors.length > 0) {
          setImportErrors(data.errors);
        }
        setToastMessage(data.message);
        fetchTeachers(localStorage.getItem('auth_token'), true);
      } else {
        setImportStatus(lang === 'ar' ? 'فشل استيراد البيانات' : 'Import failed');
        if (data.errors && data.errors.length > 0) {
          setImportErrors(data.errors);
        } else {
          setImportErrors([data.message || (lang === 'ar' ? 'فشل استيراد البيانات' : 'Import failed')]);
        }
      }
    } catch (err) {
      clearInterval(interval);
      setImportProgress(100);
      setImportStatus(lang === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم' : 'Error communicating with server');
      setImportErrors([err.message || 'Error']);
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          {t.teachersTitle}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {(canAction('teachers', 'export') || canAction('teachers', 'import')) && (
            <button 
              className="btn-elevated" 
              onClick={() => {
                setImportFile(null);
                setImportProgress(0);
                setImportStatus('');
                setImportErrors([]);
                setImportSuccess(false);
                setShowExcelModal(true);
              }} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                backgroundColor: 'rgba(49, 133, 156, 0.08)', 
                borderColor: 'rgba(49, 133, 156, 0.25)', 
                color: '#31859C' 
              }}
            >
              <Upload size={16} />
              {lang === 'ar' ? 'الاستيراد والتصدير (Excel)' : 'Excel Import & Export'}
            </button>
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
                setModalTeacherPhone('');
                setModalTeacherAddress('');
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
              <th>{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'}</th>
              <th>{t.teacherName}</th>
              <th>{t.subject}</th>
              <th>{t.assignedClasses}</th>
              <th>{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'}</th>
              <th>{lang === 'ar' ? 'عنوان السكن' : 'Home Address'}</th>
              <th>{t.gradesEntered}</th>
              <th>{t.assignmentsPublished}</th>
              <th className="no-print">{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <tr key={teacher.id}>
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
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{teacher.phone || '—'}</td>
                  <td style={{ fontSize: '12px' }}>{teacher.address || '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{teacher.gradesEntered} %</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{teacher.assignments}</td>
                  <td className="no-print">
                    {canAction('teachers', 'update') && (
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
                          setModalTeacherPhone(teacher.phone || '');
                          setModalTeacherAddress(teacher.address || '');
                          setModalTeacherPhoto(teacher.photo || '');
                          setShowEditTeacherModal(true);
                          setModalTeacherAssignmentSubject('');
                          setModalTeacherAssignmentClass('');
                        }}
                      >
                        📝 {lang === 'ar' ? 'تعديل / إعادة تعيين' : 'Edit / Reset'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px' }}>
                      📂
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                      {lang === 'ar' ? 'لا يوجد معلمون مسجلون حالياً' : 'No teachers registered yet'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? 'لم يتم إضافة أي بيانات بعد' : 'No records have been added yet'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
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

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', border: '2px dashed var(--color-primary-ui)', padding: '4px', cursor: 'pointer', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(30, 80, 142, 0.02)', transition: 'all 0.2s ease' }}
                       onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                       onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-ui)'}
                       onClick={() => document.getElementById('teacher-photo-input').click()}
                  >
                    {modalTeacherPhoto && modalTeacherPhoto !== '👨‍🏫' ? (
                      <img src={modalTeacherPhoto.includes('/uploads/avatars/') ? modalTeacherPhoto.substring(modalTeacherPhoto.indexOf('/uploads/avatars/')) : modalTeacherPhoto} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)', userSelect: 'none' }}>
                        <span style={{ fontSize: '24px' }}>📷</span>
                        <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>{lang === 'ar' ? 'رفع صورة' : 'Upload'}</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      id="teacher-photo-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setModalTeacherPhoto(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                    {lang === 'ar' ? 'الصورة الشخصية للمعلم' : 'Teacher Profile Photo'}
                  </span>
                </div>

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
                      placeholder="1011111111"
                      value={modalTeacherJobId}
                      onChange={(e) => setModalTeacherJobId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="text-field"
                      placeholder="7XXXXXXXX"
                      value={modalTeacherPhone}
                      onChange={(e) => setModalTeacherPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'عنوان السكن' : 'Home Address'}</label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder={lang === 'ar' ? 'مثال: حي النزهة، الرياض' : 'e.g. Al-Nuzha, Riyadh'}
                    value={modalTeacherAddress}
                    onChange={(e) => setModalTeacherAddress(e.target.value)}
                  />
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
                <button 
                  type="button" 
                  className="btn-elevated"
                  onClick={() => setShowTeacherModal(false)}
                  style={{ height: '48px' }}
                  disabled={isSaving}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="btn-filled"
                  style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }}
                  disabled={isSaving}
                >
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
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
              <h3 className="modal-title">👨‍🏫 {lang === 'ar' ? 'تعديل بيانات المعلم ورصد الصلاحيات' : 'Edit Teacher'}</h3>
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
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', border: '2px dashed var(--color-primary-ui)', padding: '4px', cursor: 'pointer', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(30, 80, 142, 0.02)', transition: 'all 0.2s ease' }}
                       onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                       onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-ui)'}
                       onClick={() => document.getElementById('edit-teacher-photo-input').click()}
                  >
                    {modalTeacherPhoto && modalTeacherPhoto !== '👨‍🏫' ? (
                      <img src={modalTeacherPhoto.includes('/uploads/avatars/') ? modalTeacherPhoto.substring(modalTeacherPhoto.indexOf('/uploads/avatars/')) : modalTeacherPhoto} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)', userSelect: 'none' }}>
                        <span style={{ fontSize: '24px' }}>📷</span>
                        <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>{lang === 'ar' ? 'رفع صورة' : 'Upload'}</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      id="edit-teacher-photo-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setModalTeacherPhoto(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                    {lang === 'ar' ? 'الصورة الشخصية للمعلم' : 'Teacher Profile Photo'}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.formTeacherName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalTeacherName} onChange={(e) => setModalTeacherName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalTeacherJobId} onChange={(e) => setModalTeacherJobId(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalTeacherPhone} onChange={(e) => setModalTeacherPhone(e.target.value)} placeholder="7XXXXXXXX" required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'عنوان السكن' : 'Home Address'}</label>
                  <input type="text" className="text-field" value={modalTeacherAddress} onChange={(e) => setModalTeacherAddress(e.target.value)} placeholder={lang === 'ar' ? 'مثال: صنعاء، شارع حدة' : 'e.g. Sanaa, Hadda St'} />
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
                <button type="button" className="btn-elevated" onClick={() => setShowEditTeacherModal(false)} style={{ height: '48px' }} disabled={isSaving}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {showExcelModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '580px', width: '90%' }}>
            <header className="modal-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#31859C' }}>
                <Upload size={22} />
                {lang === 'ar' ? 'الاستيراد والتصدير الذكي (Excel)' : 'Smart Import & Export (Excel)'}
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowExcelModal(false)}
                aria-label="Close Modal"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            {/* Custom Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <button
                type="button"
                onClick={() => setExcelModalTab('import')}
                style={{
                  flex: 1,
                  padding: '14px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderBottom: excelModalTab === 'import' ? '3px solid #31859C' : '3px solid transparent',
                  color: excelModalTab === 'import' ? '#31859C' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                {lang === 'ar' ? '📥 استيراد المعلمين' : '📥 Import Teachers'}
              </button>
              <button
                type="button"
                onClick={() => setExcelModalTab('export')}
                style={{
                  flex: 1,
                  padding: '14px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderBottom: excelModalTab === 'export' ? '3px solid #31859C' : '3px solid transparent',
                  color: excelModalTab === 'export' ? '#31859C' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                {lang === 'ar' ? '📤 التصدير والنموذج' : '📤 Export & Template'}
              </button>
            </div>

            <div className="modal-body" style={{ padding: '24px' }}>
              {excelModalTab === 'import' ? (
                <form onSubmit={handleImportExcel} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Drag-n-drop file container */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600' }}>
                      {lang === 'ar' ? 'ملف Excel أو CSV المراد استيراده (.xlsx, .csv)' : 'Excel or CSV File to Import (.xlsx, .csv)'}
                    </label>
                    <div 
                      style={{
                        border: '2px dashed rgba(49, 133, 156, 0.3)',
                        borderRadius: '16px',
                        padding: '30px 20px',
                        textAlign: 'center',
                        backgroundColor: importFile ? 'rgba(49, 133, 156, 0.02)' : 'rgba(0,0,0,0.01)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      onClick={() => document.getElementById('excel-file-uploader').click()}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
                          setImportFile(file);
                        } else {
                          alert(lang === 'ar' ? 'يرجى اختيار ملف Excel أو CSV صالح.' : 'Please choose a valid Excel or CSV file.');
                        }
                      }}
                    >
                      <input 
                        type="file" 
                        id="excel-file-uploader" 
                        accept=".xlsx, .xls, .csv"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setImportFile(file);
                        }}
                      />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Upload size={32} style={{ color: '#31859C', opacity: 0.8 }} />
                        {importFile ? (
                          <div>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-text)', fontSize: '14px' }}>{importFile.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                              {(importFile.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                              {lang === 'ar' ? 'اسحب وأفلت الملف هنا أو انقر للتصفح' : 'Drag & drop file here or click to browse'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                              {lang === 'ar' ? 'صيغة الملف المدعومة: Excel (.xlsx) أو CSV' : 'Supported extension: Excel (.xlsx) or CSV'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress & Feedback State */}
                  {(isImporting || importProgress > 0) && (
                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#31859C' }}>
                          {importStatus}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                          {importProgress}%
                        </span>
                      </div>
                      
                      {/* Progress Bar Container */}
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${importProgress}%`, 
                            height: '100%', 
                            backgroundColor: importSuccess ? '#10b981' : '#31859C', 
                            borderRadius: '999px', 
                            transition: 'width 0.2s ease-out' 
                          }} 
                        />
                      </div>

                      {/* Warnings / Error list */}
                      {importErrors.length > 0 && (
                        <div style={{ marginTop: '14px', borderTop: '1px dashed var(--color-border)', paddingTop: '12px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <span>⚠️ {lang === 'ar' ? 'تنبيهات وتفاصيل الأخطاء:' : 'Warnings & Error Details:'}</span>
                          </div>
                          <ul style={{ 
                            maxHeight: '120px', 
                            overflowY: 'auto', 
                            paddingInlineStart: '16px', 
                            margin: 0, 
                            fontSize: '12px', 
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            {importErrors.map((err, i) => (
                              <li key={i} style={{ direction: 'rtl', textAlign: 'right' }}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn-elevated"
                      onClick={() => setShowExcelModal(false)}
                      disabled={isImporting}
                      style={{ height: '44px', padding: '0 18px' }}
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="btn-filled"
                      disabled={isImporting || !importFile}
                      style={{ height: '44px', padding: '0 24px', backgroundColor: '#31859C', borderColor: '#31859C', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isImporting ? (
                        <>
                          {lang === 'ar' ? 'جاري الاستيراد...' : 'Importing...'}
                        </>
                      ) : (
                        lang === 'ar' ? 'بدء الاستيراد' : 'Start Import'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Download Template Box */}
                  <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '16px', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--color-text)' }}>
                      {lang === 'ar' ? '1. تحميل نموذج Excel فارغ' : '1. Download Empty Excel Template'}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
                      {lang === 'ar' ? 'قم بتحميل القالب لتعبئة بيانات المعلمين مع حقل الرقم الوطني الاختياري.' : 'Download template to fill in teachers\' data with optional national ID.'}
                    </p>
                    <button
                      type="button"
                      className="btn-accent"
                      onClick={handleDownloadTemplate}
                      disabled={isLoadingTemplate}
                      style={{ height: '42px', padding: '0 20px', backgroundColor: '#31859C', borderColor: '#31859C' }}
                    >
                      {isLoadingTemplate ? (
                        lang === 'ar' ? 'جاري التحميل...' : 'Downloading...'
                      ) : (
                        lang === 'ar' ? 'تحميل القالب (.xlsx)' : 'Download Template (.xlsx)'
                      )}
                    </button>
                  </div>

                  {/* Export Teachers Box */}
                  <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '16px', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--color-text)' }}>
                      {lang === 'ar' ? '2. تصدير بيانات المعلمين الحالية' : '2. Export Current Teachers Data'}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
                      {lang === 'ar' ? 'تصدير كافة المعلمين المسجلين في النظام بصيغة CSV تدعم اللغة العربية.' : 'Export all registered teachers into an Arabic-friendly CSV file.'}
                    </p>
                    <button
                      type="button"
                      className="btn-filled"
                      onClick={handleExport}
                      disabled={isExporting}
                      style={{ height: '42px', padding: '0 20px', backgroundColor: '#31859C', borderColor: '#31859C' }}
                    >
                      {isExporting ? (
                        lang === 'ar' ? 'جاري التصدير...' : 'Exporting...'
                      ) : (
                        lang === 'ar' ? 'تصدير البيانات' : 'Export Data'
                      )}
                    </button>
                  </div>

                  {/* Close Footer button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn-elevated"
                      onClick={() => setShowExcelModal(false)}
                      style={{ height: '44px', padding: '0 18px' }}
                    >
                      {lang === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
