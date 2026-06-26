import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, X } from 'lucide-react';

export default function StudentsTab() {
  const {
    lang, t, students, parentUsers, availableGrades, availableSections,
    setSelectedStudentForCard, setShowCardVisualizerModal,
    handleAddStudent, renderAvatar, currentUser, controlMultiplier, controlOffset
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
  const [formError, setFormError] = useState('');
  const [selectedParentLinkOption, setSelectedParentLinkOption] = useState('new');

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

    let parentNameVal;
    let parentPhoneVal;
    let parentNationalIdVal;
    let newParentObj = null;

    if (selectedParentLinkOption !== 'new') {
      const selectedParentObj = parentUsers.find(p => p.nationalId === selectedParentLinkOption);
      if (selectedParentObj) {
        parentNameVal = selectedParentObj.name;
        parentPhoneVal = selectedParentObj.phone;
        parentNationalIdVal = selectedParentObj.nationalId;
      } else {
        setFormError(lang === 'ar' ? 'فشل العثور على حساب ولي الأمر المحدد!' : 'Selected parent account not found!');
        return;
      }
    } else {
      // Validate inputs for new parent
      if (!modalStudentName.trim() || !modalParentName.trim() || !modalPhone.trim() || !modalParentNationalId.trim()) {
        setFormError(t.emptyError);
        return;
      }

      const nationalIdDigits = modalParentNationalId.replace(/\D/g, '');
      if (nationalIdDigits.length !== 10 || (!nationalIdDigits.startsWith('1') && !nationalIdDigits.startsWith('2'))) {
        setFormError(t.nationalIdError);
        return;
      }

      const phoneDigits = modalPhone.replace(/\D/g, '');
      if (phoneDigits.length !== 9 || !phoneDigits.startsWith('5')) {
        setFormError(t.phoneError);
        return;
      }

      parentNationalIdVal = nationalIdDigits;
      parentPhoneVal = phoneDigits;
      parentNameVal = modalParentName;

      // If parent does not exist, prepare parent info to add
      if (!parentUsers.some(p => p.nationalId === parentNationalIdVal)) {
        const nameEn = modalParentName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
        newParentObj = {
          nationalId: parentNationalIdVal,
          name: parentNameVal,
          nameEn: nameEn,
          phone: parentPhoneVal,
          username: parentNationalIdVal,
          password: 'parent_password123',
          photo: modalParentPhoto || '🧔'
        };
      }
    }

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
      parentPhoto: modalParentPhoto || '🧔'
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
    setSelectedParentLinkOption('new');
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

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          {lang === 'ar' ? 'سجل شؤون الطلاب والبطاقات الذكية' : 'Student Registry & Smart Cards'}
        </h3>
        
        <button 
          className="btn-accent"
          onClick={() => setShowStudentModal(true)}
        >
          <Plus size={18} strokeWidth={2.5} style={{ marginInlineEnd: '4px' }} />
          {t.requestCardBtn}
        </button>
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
              <th>{t.arrivalTime}</th>
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
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{student.time}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{renderAvatar(student.parentPhoto, "🧔")} {lang === 'ar' ? student.parentName : student.parentNameEn}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      ID: {student.parentNationalId}
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

                <div className="form-group" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                  <label className="form-label">{lang === 'ar' ? 'ربط بحساب ولي أمر' : 'Link to Parent Account'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <select
                    className="text-field"
                    value={selectedParentLinkOption}
                    onChange={(e) => {
                      const opt = e.target.value;
                      setSelectedParentLinkOption(opt);
                      if (opt !== 'new') {
                        const parent = parentUsers.find(p => p.nationalId === opt);
                        if (parent) {
                          setModalParentNationalId(parent.nationalId);
                          setModalParentName(parent.name);
                          setModalPhone(parent.phone);
                          setModalParentPhoto(parent.photo || '🧔');
                        }
                      } else {
                        setModalParentNationalId('');
                        setModalParentName('');
                        setModalPhone('');
                        setModalParentPhoto('');
                      }
                    }}
                  >
                    <option value="new">{lang === 'ar' ? '➕ تسجيل حساب ولي أمر جديد...' : '➕ Register New Parent...'}</option>
                    {parentUsers.map(p => (
                      <option key={p.nationalId} value={p.nationalId}>
                        {p.name} ({p.nationalId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.formParentNationalId} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder="1XXXXXXXXX"
                    value={modalParentNationalId}
                    onChange={(e) => handleNationalIdChange(e.target.value)}
                    maxLength={10}
                    disabled={selectedParentLinkOption !== 'new'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.formParentName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="text-field"
                    placeholder="مثال: فهد العتيبي"
                    value={modalParentName}
                    onChange={(e) => setModalParentName(e.target.value)}
                    disabled={selectedParentLinkOption !== 'new'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.formParentPhone} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      position: 'absolute',
                      left: lang === 'en' ? '16px' : 'auto',
                      right: lang === 'ar' ? '16px' : 'auto',
                      color: 'var(--color-text-secondary)',
                      fontSize: '14px',
                      fontWeight: '600',
                      pointerEvents: 'none'
                    }}>
                      +966
                    </span>
                    <input 
                      type="tel"
                      className="text-field"
                      style={{
                        paddingLeft: lang === 'en' ? '64px' : 'var(--space-lg)',
                        paddingRight: lang === 'ar' ? '64px' : 'var(--space-lg)'
                      }}
                      placeholder="5XXXXXXXX"
                      value={modalPhone}
                      onChange={(e) => setModalPhone(e.target.value)}
                      disabled={selectedParentLinkOption !== 'new'}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
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

                  {selectedParentLinkOption === 'new' && (
                    <div className="form-group">
                      <label className="form-label">{t.formPhoto} (Parent) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="file" 
                          accept="image/*"
                          id="parent-photo-input"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setModalParentPhoto(reader.result);
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="parent-photo-input" className="btn-elevated" style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer' }}>
                          📁 {t.uploadPhoto}
                        </label>
                        {modalParentPhoto && (
                          <img src={modalParentPhoto} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                      </div>
                    </div>
                  )}
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
    </div>
  );
}
