import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, Download, Upload, FileSpreadsheet } from 'lucide-react';

export default function ParentsTab() {
  const {
    lang, t, parentUsers, students,
    handleAddParent, handleEditParent, renderAvatar, currentUser,
    canAction, fetchParents, setToastMessage
  } = useApp();

  // Local UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [showEditParentModal, setShowEditParentModal] = useState(false);

  // Form states
  const [selectedParentIdForEdit, setSelectedParentIdForEdit] = useState('');
  const [modalParentNameAr, setModalParentNameAr] = useState('');
  const [modalParentNameEn, setModalParentNameEn] = useState('');
  const [modalParentPhoneNum, setModalParentPhoneNum] = useState('');
  const [modalParentNationalIdVal, setModalParentNationalIdVal] = useState('');
  const [formError, setFormError] = useState('');

  const onAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!modalParentNameAr.trim() || !modalParentPhoneNum.trim() || !modalParentNationalIdVal.trim()) {
      setFormError(t.emptyError);
      return;
    }

    const nationalIdDigits = modalParentNationalIdVal.replace(/\D/g, '');
    if (nationalIdDigits.length !== 10 || (!nationalIdDigits.startsWith('1') && !nationalIdDigits.startsWith('2'))) {
      setFormError(t.nationalIdError);
      return;
    }

    const phoneDigits = modalParentPhoneNum.replace(/\D/g, '');
    if (phoneDigits.length !== 9 || !phoneDigits.startsWith('7')) {
      setFormError(t.phoneError);
      return;
    }

    if (parentUsers.some(p => p.nationalId === nationalIdDigits)) {
      setFormError(lang === 'ar' ? 'الرقم الوطني مسجل مسبقاً لولي أمر آخر!' : 'National ID already registered!');
      return;
    }

    const nameEn = modalParentNameEn.trim() || modalParentNameAr.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    const newParent = {
      nationalId: nationalIdDigits,
      name: modalParentNameAr,
      nameEn: nameEn,
      phone: phoneDigits,
      username: nationalIdDigits,
      password: phoneDigits,
      photo: '🧔'
    };

    handleAddParent(newParent);
    setShowAddParentModal(false);

    // Reset fields
    setModalParentNameAr('');
    setModalParentNameEn('');
    setModalParentPhoneNum('');
    setModalParentNationalIdVal('');
  };

  const onEditSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!modalParentNameAr.trim() || !modalParentPhoneNum.trim() || !modalParentNationalIdVal.trim()) {
      setFormError(t.emptyError);
      return;
    }

    const phoneDigits = modalParentPhoneNum.replace(/\D/g, '');
    if (phoneDigits.length !== 9 || !phoneDigits.startsWith('7')) {
      setFormError(t.phoneError);
      return;
    }

    const nameEn = modalParentNameEn.trim() || modalParentNameAr.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

    const updatedParent = {
      nationalId: modalParentNationalIdVal,
      name: modalParentNameAr,
      nameEn: nameEn,
      phone: phoneDigits,
      username: modalParentNationalIdVal,
      password: phoneDigits,
      photo: '🧔'
    };

    handleEditParent(updatedParent, null, selectedParentIdForEdit);
    setShowEditParentModal(false);

    // Reset fields
    setModalParentNameAr('');
    setModalParentNameEn('');
    setModalParentPhoneNum('');
    setModalParentNationalIdVal('');
    setSelectedParentIdForEdit('');
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/parents/export', {
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
      a.download = 'parents_export.csv';
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
      const res = await fetch('/api/parents/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(data.message);
        fetchParents(localStorage.getItem('auth_token'));
      } else {
        alert(data.message || (lang === 'ar' ? 'حدث خطأ أثناء الاستيراد' : 'Error importing'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch('/api/parents/template', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parents_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredParents = parentUsers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.nationalId.includes(searchQuery)
  );

  return (
    <div className="section-card">
      <div className="section-card-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-md)' }}>
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px', margin: 0 }}>
          {t.parentsTitle}
        </h3>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {canAction('parents', 'export') && (
            <button className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', fontSize: '13px' }}>
              <Download size={16} />
              {lang === 'ar' ? 'تصدير' : 'Export'}
            </button>
          )}
          {canAction('parents', 'import') && (
            <>
              <button className="btn-secondary" onClick={handleDownloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', fontSize: '13px' }} title={lang === 'ar' ? 'تحميل النموذج الفارغ' : 'Download Template'}>
                <FileSpreadsheet size={16} />
                {lang === 'ar' ? 'النموذج' : 'Template'}
              </button>
              <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0, padding: '8px 16px', fontSize: '13px' }}>
                <Upload size={16} />
                {lang === 'ar' ? 'استيراد' : 'Import'}
                <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </>
          )}
          {canAction('parents', 'create') && (
            <button 
              className="btn-filled"
              onClick={() => {
                setFormError('');
                setModalParentNameAr('');
                setModalParentNameEn('');
                setModalParentPhoneNum('');
                setModalParentNationalIdVal('');
                setShowAddParentModal(true);
              }}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              👨🏼‍💼 {lang === 'ar' ? 'تسجيل حساب ولي أمر جديد' : 'Register New Parent'}
            </button>
          )}
        </div>
      </div>

      {/* Search Box */}
      <div className="students-controls no-print" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text"
            className="text-field"
            placeholder={t.searchParentPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Parents List Table */}
      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>{t.parentNationalIdShort}</th>
              <th>{t.parentName}</th>
              <th>{t.parentPhone}</th>
              <th>{t.parentSonsCount}</th>
              <th>{t.parentSonsList}</th>
              {currentUser?.role === 'admin' && <th className="no-print">{t.action}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredParents.length > 0 ? (
              filteredParents.map((parent) => {
                const children = students.filter(s => s.parentNationalId === parent.nationalId);
                return (
                  <tr key={parent.nationalId}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{parent.nationalId}</td>
                    <td style={{ fontWeight: '600' }}>
                      {renderAvatar(parent.photo, "🧔")} 
                      {lang === 'ar' ? parent.name : (parent.nameEn || parent.name)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>+967 {parent.phone}</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{children.length}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {children.map(child => (
                          <span key={child.id} className="chip" style={{ cursor: 'default', padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {renderAvatar(child.photo, "👨‍🎓")}
                            <span>{lang === 'ar' ? child.name : child.nameEn} ({lang === 'ar' ? child.grade : child.gradeEn})</span>
                            <span style={{ marginInlineStart: '6px', fontSize: '9px', opacity: 0.8 }}>
                              {(child.status === 'present' || child.status === 'late') ? '🟢' : '🔴'}
                            </span>
                          </span>
                        ))}
                        {children.length === 0 && (
                          <span style={{ fontStyle: 'italic', opacity: 0.5, fontSize: '11px' }}>
                            {lang === 'ar' ? 'لا يوجد أبناء مرتبطين' : 'No linked children'}
                          </span>
                        )}
                      </div>
                    </td>
                    {currentUser?.role === 'admin' && (
                      <td className="no-print">
                        <button 
                          className="btn-elevated"
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                          onClick={() => {
                            setFormError('');
                            setSelectedParentIdForEdit(parent.nationalId);
                            setModalParentNameAr(parent.name);
                            setModalParentNameEn(parent.nameEn || '');
                            setModalParentPhoneNum(parent.phone);
                            setModalParentNationalIdVal(parent.nationalId);
                            setShowEditParentModal(true);
                          }}
                        >
                          📝 {lang === 'ar' ? 'تعديل الحساب' : 'Edit Account'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
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

      {/* MODAL DIALOG: ADD PARENT ACCOUNT */}
      {showAddParentModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">👨🏼‍💼 {lang === 'ar' ? 'تسجيل حساب ولي أمر جديد' : 'Register New Parent Account'}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowAddParentModal(false);
                  setFormError('');
                }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <form onSubmit={onAddSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم ولي الأمر (بالعربية)' : 'Parent Name (Arabic)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalParentNameAr} onChange={(e) => setModalParentNameAr(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم ولي الأمر (بالانجليزية - اختياري)' : 'Parent Name (English - Optional)'}</label>
                  <input type="text" className="text-field" value={modalParentNameEn} onChange={(e) => setModalParentNameEn(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الرقم الوطني (10 أرقام)' : 'National ID (10 digits)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalParentNationalIdVal} onChange={(e) => setModalParentNationalIdVal(e.target.value)} maxLength={10} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalParentPhoneNum} onChange={(e) => setModalParentPhoneNum(e.target.value)} placeholder="7XXXXXXXX" required />
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowAddParentModal(false)} style={{ height: '48px' }}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px' }}>{t.submit}</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: EDIT PARENT & RESET PASSWORD */}
      {showEditParentModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">👨🏼‍💼 {lang === 'ar' ? 'تعديل حساب ولي الأمر / إعادة تعيين كلمة المرور' : 'Edit Parent / Reset Password'}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowEditParentModal(false);
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
                  <label className="form-label">{lang === 'ar' ? 'اسم ولي الأمر (بالعربية)' : 'Parent Name (Arabic)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalParentNameAr} onChange={(e) => setModalParentNameAr(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم ولي الأمر (بالانجليزية)' : 'Parent Name (English)'}</label>
                  <input type="text" className="text-field" value={modalParentNameEn} onChange={(e) => setModalParentNameEn(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الرقم الوطني (لا يمكن تعديله)' : 'National ID (Cannot be modified)'}</label>
                  <input type="text" className="text-field" value={modalParentNationalIdVal} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={modalParentPhoneNum} onChange={(e) => setModalParentPhoneNum(e.target.value)} placeholder="7XXXXXXXX" required />
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowEditParentModal(false)} style={{ height: '48px' }}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px' }}>{t.submit}</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
