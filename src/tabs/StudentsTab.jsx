import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, X, Download, Upload } from 'lucide-react';

export default function StudentsTab() {
  const {
    lang, t, students, parentUsers, availableGrades, availableSections,
    setSelectedStudentForCard, setShowCardVisualizerModal,
    handleAddStudent, renderAvatar, currentUser, controlMultiplier, controlOffset,
    canAction, fetchStudents, setToastMessage
  } = useApp();

  // Local UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Student Form states
  const [modalStudentName, setModalStudentName] = useState('');
  const [modalGrade, setModalGrade] = useState('الصف الأول');
  const [modalSection, setModalSection] = useState('أ');
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

    const newId = 202600 + students.length + 1;
    const nameEnFallback = modalStudentName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    
    const newStudent = {
      id: newId,
      name: modalStudentName,
      nameEn: nameEnFallback,
      grade: modalGrade,
      gradeEn: modalGrade === 'الصف الأول' ? 'Grade 1' : modalGrade === 'الصف الثاني' ? 'Grade 2' : 'Grade 3',
      section: modalSection,
      sectionEn: modalSection === 'أ' ? 'A' : 'B',
      parentName: parentNameVal,
      parentNameEn: parentNameVal,
      parentNationalId: parentNationalIdVal,
      phone: parentPhoneVal,
      status: 'absent', // registers as absent initially until scanned
      time: '--:--',
      qrCode: `ANWAR-${newId}`,
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

    // Reset inputs
    setModalStudentName('');
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
      const res = await fetch('/api/students/export', {
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
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      const data = await res.json();
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
      const res = await fetch('/api/students/template', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        }
      });
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
      ? student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.id.toString().includes(searchQuery)
      : student.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || student.id.toString().includes(searchQuery);
    
    const matchesFilter = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesFilter;
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
              <button className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download size={16} />
                {lang === 'ar' ? 'تصدير' : 'Export'}
              </button>
            )}
            {canAction('students', 'import') && (
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
        <div className="students-controls no-print">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text"
              className="text-field"
              placeholder={lang === 'ar' ? 'البحث باسم الطالب أو الرقم الأكاديمي...' : 'Search by name or student number...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{student.id}</td>
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
                      <button 
                        className="btn-elevated"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => {
                          setSelectedStudentForCard(student);
                          setShowCardVisualizerModal(true);
                        }}
                      >
                        🪪 {t.viewCard}
                      </button>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">{t.formGrade} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field"
                      value={modalGrade}
                      onChange={(e) => setModalGrade(e.target.value)}
                    >
                      {availableGrades.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.formSection} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field"
                      value={modalSection}
                      onChange={(e) => setModalSection(e.target.value)}
                    >
                      {availableSections.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الرسوم الدراسية السنوية (ر.س)' : 'Annual Tuition Fee (SAR)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
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
                      📞 {lang === 'ar' ? 'رقم الجوال: ' : 'Phone Number: '} +966 {modalPhone}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">{t.formPhoto} (Student) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      <label htmlFor="student-photo-input" className="btn-elevated" style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer' }}>
                        📁 {t.uploadPhoto}
                      </label>
                      {modalStudentPhoto && (
                        <img src={modalStudentPhoto} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      )}
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
    </>
  );
}