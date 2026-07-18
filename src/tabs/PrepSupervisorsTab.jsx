import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTeachers } from '../contexts/Teachers/useTeachers';
import { useClasses } from '../contexts/Classes/useClasses';
import { Plus, X, Camera, User } from 'lucide-react';

export default function PrepSupervisorsTab() {
  const {
    lang, t, renderAvatar,
    setToastMessage, triggerConfirm, canAction
  } = useApp();

  const {
    supervisors,
    handleAddSupervisor,
    handleEditSupervisor,
    handleDeleteSupervisor
  } = useTeachers();

  const { classes } = useClasses();

  // Local UI states
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [showEditSupervisorModal, setShowEditSupervisorModal] = useState(false);

  // Form states
  const [selectedSupervisorIdForEdit, setSelectedSupervisorIdForEdit] = useState(null);
  const [modalName, setModalName] = useState('');
  const [modalJobId, setModalJobId] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalPhoto, setModalPhoto] = useState('');
  const [modalClasses, setModalClasses] = useState([]);
  const [modalSelectedClass, setModalSelectedClass] = useState('');
  const [formError, setFormError] = useState('');

  const onAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!modalName.trim() || !modalJobId.trim() || !modalPhone.trim()) {
      setFormError(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (modalClasses.length === 0) {
      setFormError(lang === 'ar' ? 'الرجاء تكليف المشرف بفصل دراسي واحد على الأقل' : 'Please assign the supervisor to at least one class');
      return;
    }

    const newId = 300 + supervisors.length + 1;
    const nameEnFallback = modalName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

    const newSupervisor = {
      id: newId,
      jobId: modalJobId.trim(),
      password: modalPhone.trim(),
      name: modalName,
      nameEn: nameEnFallback,
      classes: modalClasses,
      photo: modalPhoto || '👩‍🏫',
      phone: modalPhone.trim()
    };

    handleAddSupervisor(newSupervisor);
    setShowSupervisorModal(false);

    // Reset fields
    setModalName('');
    setModalJobId('');
    setModalPhone('');
    setModalPhoto('');
    setModalClasses([]);
    setModalSelectedClass('');
  };

  const onEditSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!modalName.trim() || !modalJobId.trim() || !modalPhone.trim()) {
      setFormError(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (modalClasses.length === 0) {
      setFormError(lang === 'ar' ? 'الرجاء تكليف المشرف بفصل دراسي واحد على الأقل' : 'Please assign the supervisor to at least one class');
      return;
    }

    const nameEnFallback = modalName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

    const updatedSupervisor = {
      id: selectedSupervisorIdForEdit,
      jobId: modalJobId.trim(),
      password: modalPhone.trim(),
      name: modalName,
      nameEn: nameEnFallback,
      classes: modalClasses,
      photo: modalPhoto || '👩‍🏫',
      phone: modalPhone.trim()
    };

    handleEditSupervisor(updatedSupervisor, selectedSupervisorIdForEdit);
    setShowEditSupervisorModal(false);

    // Reset fields
    setModalName('');
    setModalJobId('');
    setModalPhone('');
    setModalPhoto('');
    setModalClasses([]);
    setModalSelectedClass('');
    setSelectedSupervisorIdForEdit(null);
  };

  const addClassRow = () => {
    if (!modalSelectedClass) {
      setToastMessage(lang === 'ar' ? '⚠️ يرجى اختيار الفصل الدراسي أولاً!' : '⚠️ Please select a class first!');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    // Check duplicate
    if (modalClasses.includes(modalSelectedClass)) {
      setToastMessage(lang === 'ar' ? '⚠️ هذا الفصل الدراسي مضاف بالفعل للمشرف!' : '⚠️ This class is already assigned to this supervisor!');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setModalClasses(prev => [...prev, modalSelectedClass]);
    setModalSelectedClass('');
  };

  const removeClassRow = (className) => {
    setModalClasses(prev => prev.filter(c => c !== className));
  };

  const handleDeleteClick = (supervisorId) => {
    triggerConfirm({
      title: lang === 'ar' ? 'حذف مشرف التحضير' : 'Delete Prep Supervisor',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا المشرف نهائياً من النظام؟' : 'Are you sure you want to delete this supervisor from the system permanently?',
      onConfirm: () => handleDeleteSupervisor(supervisorId)
    });
  };

  return (
    <>
      <div className="section-card">
        <div className="section-card-header no-print">
          <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
            {lang === 'ar' ? 'إدارة مشرفي التحضير وفصول التكليف' : 'Prep Supervisors Management'}
          </h3>
          {canAction('prepSupervisors', 'create') && (
            <button 
              className="btn-accent"
              onClick={() => {
                setFormError('');
                setModalName('');
                setModalJobId('');
                setModalPhone('');
                setModalPhoto('');
                setModalClasses([]);
                setModalSelectedClass('');
                setShowSupervisorModal(true);
              }}
            >
              <Plus size={18} strokeWidth={2.5} style={{ marginInlineEnd: '4px' }} />
              {lang === 'ar' ? 'إضافة مشرف تحضير' : 'Add Prep Supervisor'}
            </button>
          )}
        </div>

        <div className="students-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'}</th>
                <th>{lang === 'ar' ? 'اسم المشرف' : 'Supervisor Name'}</th>
                <th>{lang === 'ar' ? 'الفصول المكلف بها للتحضير' : 'Assigned Classes'}</th>
                <th>{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'}</th>
                {(canAction('prepSupervisors', 'update') || canAction('prepSupervisors', 'delete')) && <th className="no-print">{t.action}</th>}
              </tr>
            </thead>
            <tbody>
              {supervisors.map((supervisor) => (
                <tr key={supervisor.jobId}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{supervisor.jobId}</td>
                  <td style={{ fontWeight: '600' }}>
                    {renderAvatar(supervisor.photo, "👩‍🏫")}
                    {lang === 'ar' ? supervisor.name : supervisor.nameEn}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {supervisor.classes.map((c, idx) => (
                        <span key={idx} className="chip" style={{ cursor: 'default', fontSize: '11px', padding: '2px 8px' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{supervisor.phone || supervisor.password}</td>
                  {(canAction('prepSupervisors', 'update') || canAction('prepSupervisors', 'delete')) && (
                    <td className="no-print">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canAction('prepSupervisors', 'update') && (
                          <button 
                            className="btn-elevated"
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                            onClick={() => {
                              setFormError('');
                              setSelectedSupervisorIdForEdit(supervisor.id);
                              setModalName(supervisor.name);
                              setModalJobId(supervisor.jobId);
                              setModalPhone(supervisor.phone || supervisor.password);
                              setModalPhoto(supervisor.photo);
                              setModalClasses(supervisor.classes || []);
                              setModalSelectedClass('');
                              setShowEditSupervisorModal(true);
                            }}
                          >
                            📝 {lang === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                        )}
                        {canAction('prepSupervisors', 'delete') && (
                          <button 
                            className="btn-elevated"
                            style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)' }}
                            onClick={() => handleDeleteClick(supervisor.id)}
                          >
                            🗑️ {lang === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DIALOG: ADD SUPERVISOR */}
      {showSupervisorModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">👩‍🏫 {lang === 'ar' ? 'إضافة مشرف تحضير جديد' : 'Add New Prep Supervisor'}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowSupervisorModal(false);
                  setFormError('');
                }}
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
                  <label className="form-label">{lang === 'ar' ? 'اسم المشرف ثنائي أو ثلاثي' : 'Supervisor Name'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder={lang === 'ar' ? 'مثال: أ. منى الحربي' : 'e.g. Ms. Mona Al-Harbi'}
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="text-field"
                      placeholder="P102"
                      value={modalJobId}
                      onChange={(e) => setModalJobId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="text-field"
                      placeholder="7xxxxxxxx"
                      value={modalPhone}
                      onChange={(e) => setModalPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'rgba(30, 80, 142, 0.03)', border: '1px solid var(--color-border)', borderRadius: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary-ui)' }}>
                    🎯 {lang === 'ar' ? 'الفصول المكلف بها للتحضير' : 'Assigned Classes for Prep'}
                  </h4>

                  {/* Add Class Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr auto', gap: '8px', alignItems: 'end', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <select 
                        className="text-field"
                        style={{ height: '38px', padding: '6px 12px' }}
                        value={modalSelectedClass}
                        onChange={(e) => setModalSelectedClass(e.target.value)}
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
                      onClick={addClassRow}
                    >
                      ➕ {lang === 'ar' ? 'إضافة فصل' : 'Add Class'}
                    </button>
                  </div>

                  {/* Classes List */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {modalClasses.map((className, idx) => (
                      <span key={idx} className="chip" style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {className}
                        <button
                          type="button"
                          onClick={() => removeClassRow(className)}
                          style={{ border: 'none', background: 'transparent', color: 'var(--color-error)', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {modalClasses.length === 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        {lang === 'ar' ? 'لم يتم تكليف المشرف بأي فصول بعد' : 'No classes assigned yet'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الصورة الشخصية' : 'Profile Photo'}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      id="add-supervisor-photo-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setModalPhoto(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <div style={{ position: 'relative' }}>
                      <label 
                        htmlFor="add-supervisor-photo-input" 
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          width: '120px', height: '120px', borderRadius: '50%',
                          border: modalPhoto && modalPhoto.startsWith('data:') ? '2px solid var(--color-primary)' : '2px dashed var(--color-border)',
                          cursor: 'pointer', overflow: 'hidden', backgroundColor: 'var(--color-surface)',
                          transition: 'all 0.2s ease', position: 'relative', boxShadow: 'var(--shadow-sm)'
                        }}
                        className="avatar-upload-label"
                      >
                        {modalPhoto && modalPhoto.startsWith('data:') ? (
                          <>
                            <img src={modalPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease', color: '#ffffff', fontSize: '11px' }} className="avatar-hover-overlay">
                              <Camera size={20} style={{ marginBottom: '4px' }} />
                              <span>{lang === 'ar' ? 'تغيير الصورة' : 'Change'}</span>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                            <User size={36} style={{ strokeWidth: 1.5, marginBottom: '4px', color: 'var(--color-text-tertiary)' }} />
                            <span style={{ fontSize: '11px', fontWeight: '500' }}>{lang === 'ar' ? 'رفع الصورة' : 'Upload'}</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowSupervisorModal(false)} style={{ height: '48px' }}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px' }}>{t.submit}</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: EDIT SUPERVISOR */}
      {showEditSupervisorModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">👩‍🏫 {lang === 'ar' ? 'تعديل بيانات مشرف التحضير' : 'Edit Prep Supervisor'}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowEditSupervisorModal(false);
                  setFormError('');
                }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={onEditSubmit}>
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
                  <label className="form-label">{lang === 'ar' ? 'اسم المشرف ثنائي أو ثلاثي' : 'Supervisor Name'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="text-field"
                      value={modalJobId}
                      onChange={(e) => setModalJobId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="text-field"
                      value={modalPhone}
                      onChange={(e) => setModalPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'rgba(30, 80, 142, 0.03)', border: '1px solid var(--color-border)', borderRadius: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary-ui)' }}>
                    🎯 {lang === 'ar' ? 'الفصول المكلف بها للتحضير' : 'Assigned Classes for Prep'}
                  </h4>

                  {/* Add Class Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr auto', gap: '8px', alignItems: 'end', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <select 
                        className="text-field"
                        style={{ height: '38px', padding: '6px 12px' }}
                        value={modalSelectedClass}
                        onChange={(e) => setModalSelectedClass(e.target.value)}
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
                      onClick={addClassRow}
                    >
                      ➕ {lang === 'ar' ? 'إضافة فصل' : 'Add Class'}
                    </button>
                  </div>

                  {/* Classes List */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {modalClasses.map((className, idx) => (
                      <span key={idx} className="chip" style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {className}
                        <button
                          type="button"
                          onClick={() => removeClassRow(className)}
                          style={{ border: 'none', background: 'transparent', color: 'var(--color-error)', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {modalClasses.length === 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        {lang === 'ar' ? 'لم يتم تكليف المشرف بأي فصول بعد' : 'No classes assigned yet'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الصورة الشخصية' : 'Profile Photo'}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      id="edit-supervisor-photo-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setModalPhoto(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <div style={{ position: 'relative' }}>
                      <label 
                        htmlFor="edit-supervisor-photo-input" 
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          width: '120px', height: '120px', borderRadius: '50%',
                          border: (modalPhoto && (modalPhoto.startsWith('data:') || modalPhoto.startsWith('http'))) ? '2px solid var(--color-primary)' : '2px dashed var(--color-border)',
                          cursor: 'pointer', overflow: 'hidden', backgroundColor: 'var(--color-surface)',
                          transition: 'all 0.2s ease', position: 'relative', boxShadow: 'var(--shadow-sm)'
                        }}
                        className="avatar-upload-label"
                      >
                        {modalPhoto && (modalPhoto.startsWith('data:') || modalPhoto.startsWith('http')) ? (
                          <>
                            <img src={modalPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease', color: '#ffffff', fontSize: '11px' }} className="avatar-hover-overlay">
                              <Camera size={20} style={{ marginBottom: '4px' }} />
                              <span>{lang === 'ar' ? 'تغيير الصورة' : 'Change'}</span>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                            <User size={36} style={{ strokeWidth: 1.5, marginBottom: '4px', color: 'var(--color-text-tertiary)' }} />
                            <span style={{ fontSize: '11px', fontWeight: '500' }}>{lang === 'ar' ? 'رفع الصورة' : 'Upload'}</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowEditSupervisorModal(false)} style={{ height: '48px' }}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px' }}>{t.submit}</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
