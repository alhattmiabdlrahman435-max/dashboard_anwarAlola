import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit3, Trash2, Copy, Shield, ShieldCheck, ChevronDown, Search } from 'lucide-react';

const ALL_MODULES = [
  { key: 'students', labelAr: 'الطلاب', labelEn: 'Students', actions: ['view', 'create', 'update', 'delete', 'export', 'import'] },
  { key: 'parents', labelAr: 'أولياء الأمور', labelEn: 'Parents', actions: ['view', 'create', 'update', 'delete', 'export', 'import'] },
  { key: 'teachers', labelAr: 'المعلمون', labelEn: 'Teachers', actions: ['view', 'create', 'update', 'delete', 'export', 'import'] },
  { key: 'prepSupervisors', labelAr: 'مشرفو التحضير', labelEn: 'Prep Supervisors', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'classes', labelAr: 'الفصول الدراسية', labelEn: 'Classes', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'subjects', labelAr: 'المواد الدراسية', labelEn: 'Subjects', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'schedule', labelAr: 'الجدول الدراسي', labelEn: 'Timetable', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'scanner', labelAr: 'سجل الحضور', labelEn: 'Attendance', actions: ['view', 'create', 'update'] },
  { key: 'absenceRequests', labelAr: 'طلبات الغياب', labelEn: 'Absence Requests', actions: ['view', 'approve', 'reject'] },
  { key: 'assignments', labelAr: 'منصة الواجبات', labelEn: 'Assignments', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'examSchedules', labelAr: 'جداول الاختبارات', labelEn: 'Exam Schedules', actions: ['view', 'create', 'delete'] },
  { key: 'detailedGrades', labelAr: 'الدرجات', labelEn: 'Grades', actions: ['view', 'create', 'update', 'delete', 'export', 'import'], hasScope: true },
  { key: 'finance', labelAr: 'المالية والرسوم', labelEn: 'Finance', actions: ['view', 'create', 'update', 'export'] },
  { key: 'communications', labelAr: 'الإشعارات', labelEn: 'Notifications', actions: ['view', 'create'] },
  { key: 'control', labelAr: 'الكنترول الرقمي', labelEn: 'Digital Control', actions: ['view', 'update'] },
  { key: 'reports', labelAr: 'التقارير', labelEn: 'Reports', actions: ['view', 'export'] },
  { key: 'teacherReports', labelAr: 'بلاغات المعلمين', labelEn: 'Teacher Reports', actions: ['view', 'approve', 'reject'] },
];

const ACTION_LABELS = {
  ar: { view: 'عرض', create: 'إضافة', update: 'تعديل', delete: 'حذف', export: 'تصدير', import: 'استيراد', approve: 'اعتماد', reject: 'رفض' },
  en: { view: 'View', create: 'Create', update: 'Update', delete: 'Delete', export: 'Export', import: 'Import', approve: 'Approve', reject: 'Reject' },
};

const SCOPE_OPTIONS = [
  { value: 'all', labelAr: 'جميع الفصول', labelEn: 'All Classes' },
  { value: 'stage', labelAr: 'مرحلة دراسية', labelEn: 'Stage' },
  { value: 'grade', labelAr: 'صف دراسي', labelEn: 'Grade' },
  { value: 'class', labelAr: 'فصل / شعبة', labelEn: 'Class / Section' },
];

const STAGES = [
  { id: 1, labelAr: 'مرحلة التمهيدي (رياض الأطفال)', labelEn: 'Kindergarten' },
  { id: 2, labelAr: 'المرحلة الابتدائية', labelEn: 'Elementary' },
  { id: 3, labelAr: 'المرحلة المتوسطة', labelEn: 'Middle School' },
  { id: 4, labelAr: 'المرحلة الثانوية', labelEn: 'High School' },
];

const AVAILABLE_GRADES = [
  'تمهيدي أول', 'تمهيدي ثاني',
  'الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس',
  'الصف الأول المتوسط', 'الصف الثاني المتوسط', 'الصف الثالث المتوسط',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي',
];

export default function SupervisorsTab() {
  const { lang, currentUser, vicePrincipals, setVicePrincipals, classes, setToastMessage, triggerConfirm } = useApp();
  const t = ACTION_LABELS[lang] || ACTION_LABELS.ar;

  const API_BASE = '/api';
  const getToken = () => localStorage.getItem('auth_token');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVP, setEditingVP] = useState(null);
  const [formError, setFormError] = useState('');

  // Form fields
  const [formName, setFormName] = useState('');
  const [formJobId, setFormJobId] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [fullAccess, setFullAccess] = useState(true);
  const [modulePerms, setModulePerms] = useState({});

  // Copy permissions
  const [showCopyDropdown, setShowCopyDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch vice principals on mount
  useEffect(() => {
    fetchVicePrincipals();
  }, []);

  const fetchVicePrincipals = async () => {
    try {
      const res = await fetch(`${API_BASE}/vice-principals`, {
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.success) setVicePrincipals(data.data);
    } catch (err) {
      console.error('Failed to fetch vice principals:', err);
    }
  };

  const openAddModal = () => {
    setEditingVP(null);
    setFormName('');
    setFormJobId('');
    setFormPhone('');
    setFormPassword('');
    setFullAccess(true);
    setModulePerms({});
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (vp) => {
    setEditingVP(vp);
    setFormName(vp.name || '');
    setFormJobId(vp.jobId || vp.username || '');
    setFormPhone(vp.phone || '');
    setFormPassword('');
    const perms = vp.permissions || {};
    setFullAccess(!!perms.full_access);
    // Build modulePerms from permissions object
    const mp = {};
    ALL_MODULES.forEach(mod => {
      if (perms[mod.key]) {
        const p = perms[mod.key];
        mp[mod.key] = {
          actions: Array.isArray(p) ? p : (p.actions || []),
          scope: p.scope || 'all',
          scope_ids: p.scope_ids || [],
        };
      }
    });
    setModulePerms(mp);
    setFormError('');
    setShowModal(true);
  };

  const handleToggleModuleAction = (moduleKey, action) => {
    setModulePerms(prev => {
      const current = prev[moduleKey] || { actions: [], scope: 'all', scope_ids: [] };
      const actions = current.actions.includes(action)
        ? current.actions.filter(a => a !== action)
        : [...current.actions, action];
      return { ...prev, [moduleKey]: { ...current, actions } };
    });
  };

  const handleToggleAllActions = (moduleKey, allActions) => {
    setModulePerms(prev => {
      const current = prev[moduleKey] || { actions: [], scope: 'all', scope_ids: [] };
      const hasAll = allActions.every(a => current.actions.includes(a));
      const actions = hasAll ? [] : [...allActions];
      return { ...prev, [moduleKey]: { ...current, actions } };
    });
  };

  const handleScopeChange = (moduleKey, scope) => {
    setModulePerms(prev => {
      const current = prev[moduleKey] || { actions: [], scope: 'all', scope_ids: [] };
      return { ...prev, [moduleKey]: { ...current, scope, scope_ids: [] } };
    });
  };

  const handleScopeIdsToggle = (moduleKey, id) => {
    setModulePerms(prev => {
      const current = prev[moduleKey] || { actions: [], scope: 'all', scope_ids: [] };
      const ids = current.scope_ids.includes(id)
        ? current.scope_ids.filter(i => i !== id)
        : [...current.scope_ids, id];
      return { ...prev, [moduleKey]: { ...current, scope_ids: ids } };
    });
  };

  const copyPermissionsFrom = (sourceVP) => {
    const perms = sourceVP.permissions || {};
    setFullAccess(!!perms.full_access);
    const mp = {};
    ALL_MODULES.forEach(mod => {
      if (perms[mod.key]) {
        const p = perms[mod.key];
        mp[mod.key] = {
          actions: Array.isArray(p) ? p : (p.actions || []),
          scope: p.scope || 'all',
          scope_ids: p.scope_ids || [],
        };
      }
    });
    setModulePerms(mp);
    setShowCopyDropdown(false);
    setToastMessage(lang === 'ar' ? `تم نسخ صلاحيات ${sourceVP.name}` : `Permissions copied from ${sourceVP.name}`);
  };

  const buildPermissionsJSON = () => {
    if (fullAccess) return { full_access: true };
    const perms = {};
    ALL_MODULES.forEach(mod => {
      const mp = modulePerms[mod.key];
      if (mp && mp.actions && mp.actions.length > 0) {
        if (mod.hasScope && mp.scope !== 'all') {
          perms[mod.key] = { actions: mp.actions, scope: mp.scope, scope_ids: mp.scope_ids };
        } else {
          perms[mod.key] = { actions: mp.actions, scope: 'all' };
        }
      }
    });
    return perms;
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formJobId.trim()) {
      setFormError(lang === 'ar' ? 'الرجاء تعبئة الاسم والرقم الوظيفي.' : 'Name and Job ID are required.');
      return;
    }
    if (!editingVP && !formPassword.trim()) {
      setFormError(lang === 'ar' ? 'الرجاء إدخال كلمة المرور.' : 'Password is required.');
      return;
    }

    const permissions = buildPermissionsJSON();
    const body = {
      name_ar: formName,
      job_id: formJobId,
      phone: formPhone,
      permissions,
    };
    if (formPassword) body.password = formPassword;

    try {
      const url = editingVP ? `${API_BASE}/vice-principals/${editingVP.id}` : `${API_BASE}/vice-principals`;
      const method = editingVP ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchVicePrincipals();
        setToastMessage(data.message || (lang === 'ar' ? 'تمت العملية بنجاح' : 'Operation successful'));
      } else {
        setFormError(data.message || 'Error');
      }
    } catch (err) {
      setFormError(lang === 'ar' ? 'حدث خطأ في الاتصال.' : 'Connection error.');
    }
  };

  const handleDelete = (vp) => {
    triggerConfirm({
      title: lang === 'ar' ? 'حذف وكيل' : 'Delete Vice Principal',
      message: lang === 'ar' ? `هل أنت متأكد من حذف حساب "${vp.name}"؟` : `Are you sure you want to delete "${vp.name}"?`,
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/vice-principals/${vp.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' },
          });
          fetchVicePrincipals();
          setToastMessage(lang === 'ar' ? 'تم حذف الوكيل بنجاح.' : 'Vice principal deleted.');
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const getPermissionSummary = (perms) => {
    if (!perms) return lang === 'ar' ? 'لا صلاحيات' : 'No permissions';
    if (perms.full_access) return lang === 'ar' ? '✅ كامل الصلاحيات' : '✅ Full Access';
    const count = Object.keys(perms).filter(k => k !== 'full_access').length;
    return lang === 'ar' ? `${count} قسم مفعّل` : `${count} modules`;
  };

  const getScopeValueOptions = (moduleKey, scope) => {
    if (scope === 'stage') return STAGES;
    if (scope === 'grade') return AVAILABLE_GRADES.map((g, i) => ({ id: g, labelAr: g, labelEn: g }));
    if (scope === 'class') return (classes || []).map(c => ({ id: c.id, labelAr: c.name || c.nameAr || `${c.grade} - ${c.section}`, labelEn: c.nameEn || c.name || `${c.gradeEn} - ${c.sectionEn}` }));
    return [];
  };

  const filteredVPs = vicePrincipals.filter(vp => 
    vp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vp.jobId && vp.jobId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (vp.phone && vp.phone.includes(searchQuery))
  );

  return (
    <div className="section-card">
      <div className="section-card-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px', margin: 0 }}>
          🛡️ {lang === 'ar' ? 'إدارة وكلاء المدرسة والصلاحيات' : 'Vice Principals & Permissions Management'}
        </h3>
        <button className="btn-accent" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} />
          {lang === 'ar' ? 'إضافة وكيل جديد' : 'Add Vice Principal'}
        </button>
      </div>

      {/* Searching Box */}
      <div className="students-controls no-print" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text"
            className="text-field"
            placeholder={lang === 'ar' ? 'البحث باسم الوكيل أو الرقم الوظيفي...' : 'Search by name or Job ID...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>{lang === 'ar' ? 'الرقم الوظيفي' : 'Job ID'}</th>
              <th>{lang === 'ar' ? 'الاسم' : 'Name'}</th>
              <th>{lang === 'ar' ? 'الجوال' : 'Phone'}</th>
              <th>{lang === 'ar' ? 'الصلاحيات' : 'Permissions'}</th>
              <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredVPs.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'لا يوجد وكلاء مطابقين للبحث' : 'No matching vice principals registered'}
              </td></tr>
            ) : filteredVPs.map(vp => (
              <tr key={vp.id}>
                <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>{vp.jobId || vp.username}</td>
                <td>{vp.name}</td>
                <td dir="ltr">{vp.phone}</td>
                <td>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: vp.permissions?.full_access ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: vp.permissions?.full_access ? '#16a34a' : '#2563eb',
                  }}>
                    {getPermissionSummary(vp.permissions)}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    background: vp.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: vp.isActive ? '#16a34a' : '#dc2626',
                  }}>
                    {vp.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطل' : 'Inactive')}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-icon" onClick={() => openEditModal(vp)} title={lang === 'ar' ? 'تعديل' : 'Edit'}>
                      <Edit3 size={16} />
                    </button>
                    <button className="btn-icon btn-danger-icon" onClick={() => handleDelete(vp)} title={lang === 'ar' ? 'حذف' : 'Delete'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="modal-title">
              {editingVP ? (lang === 'ar' ? '✏️ تعديل بيانات وكيل' : '✏️ Edit Vice Principal') : (lang === 'ar' ? '➕ إضافة وكيل جديد' : '➕ Add Vice Principal')}
            </h3>

            {formError && (
              <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                {formError}
              </div>
            )}

            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'اسم الوكيل' : 'Name'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input type="text" className="text-field" value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input type="text" className="text-field" value={formJobId} onChange={e => setFormJobId(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone'}</label>
                <input type="text" className="text-field" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'كلمة المرور' : 'Password'} {!editingVP && <span style={{ color: 'var(--color-error)' }}>*</span>}</label>
                <input type="text" className="text-field" value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder={editingVP ? (lang === 'ar' ? 'اتركه فارغاً للإبقاء' : 'Leave empty to keep') : ''} />
              </div>
            </div>

            {/* Permissions Section */}
            <div style={{ padding: '16px', background: 'rgba(30, 80, 142, 0.03)', border: '1px solid var(--color-border)', borderRadius: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary-ui)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={18} /> {lang === 'ar' ? 'إدارة الصلاحيات' : 'Permissions Management'}
                </h4>

                {/* Copy Permissions Button */}
                {vicePrincipals.length > 0 && (
                  <div style={{ position: 'relative' }}>
                    <button className="btn-secondary" onClick={() => setShowCopyDropdown(!showCopyDropdown)} style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Copy size={14} /> {lang === 'ar' ? 'نسخ صلاحيات من...' : 'Copy from...'}
                    </button>
                    {showCopyDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: lang === 'ar' ? 'auto' : 0, right: lang === 'ar' ? 0 : 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '200px', marginTop: '4px' }}>
                        {vicePrincipals.filter(v => !editingVP || v.id !== editingVP.id).map(v => (
                          <button key={v.id} onClick={() => copyPermissionsFrom(v)} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px', color: 'var(--color-text-primary)' }}
                            onMouseOver={e => e.target.style.background = 'var(--color-surface-alt)'}
                            onMouseOut={e => e.target.style.background = 'none'}>
                            {v.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Full Access Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: fullAccess ? 'rgba(34, 197, 94, 0.08)' : 'var(--color-surface)', border: `1.5px solid ${fullAccess ? '#22c55e' : 'var(--color-border)'}`, borderRadius: '12px', cursor: 'pointer', marginBottom: '14px', transition: 'all 0.2s ease' }}>
                <input type="checkbox" checked={fullAccess} onChange={e => setFullAccess(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#22c55e' }} />
                <ShieldCheck size={20} style={{ color: fullAccess ? '#22c55e' : 'var(--color-text-secondary)' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: fullAccess ? '#16a34a' : 'var(--color-text-primary)' }}>
                    {lang === 'ar' ? 'كامل الصلاحيات (Full Access)' : 'Full Access'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {lang === 'ar' ? 'يمنح الوكيل جميع صلاحيات المدير بالكامل' : 'Grants all admin permissions'}
                  </div>
                </div>
              </label>

              {/* Detailed Permissions Table */}
              {!fullAccess && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-surface)' }}>
                        <th style={{ padding: '10px', textAlign: lang === 'ar' ? 'right' : 'left', borderBottom: '1px solid var(--color-border)', fontWeight: '700', minWidth: '140px' }}>
                          {lang === 'ar' ? 'القسم' : 'Module'}
                        </th>
                        {['view', 'create', 'update', 'delete', 'export', 'import', 'approve', 'reject'].map(action => (
                          <th key={action} style={{ padding: '10px 6px', textAlign: 'center', borderBottom: '1px solid var(--color-border)', fontWeight: '600', fontSize: '11px' }}>
                            {t[action]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_MODULES.map(mod => {
                        const mp = modulePerms[mod.key] || { actions: [], scope: 'all', scope_ids: [] };
                        return (
                          <tr key={mod.key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '8px 10px', fontWeight: '600' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input type="checkbox" checked={mod.actions.every(a => mp.actions.includes(a))} onChange={() => handleToggleAllActions(mod.key, mod.actions)} style={{ accentColor: 'var(--color-primary-ui)' }} />
                                {lang === 'ar' ? mod.labelAr : mod.labelEn}
                              </div>
                              {/* Scope selector for grades */}
                              {mod.hasScope && mp.actions.length > 0 && (
                                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--color-border)' }}>
                                  <select className="text-field" value={mp.scope} onChange={e => handleScopeChange(mod.key, e.target.value)} style={{ fontSize: '11px', padding: '4px 8px', marginBottom: '4px' }}>
                                    {SCOPE_OPTIONS.map(opt => (
                                      <option key={opt.value} value={opt.value}>{lang === 'ar' ? opt.labelAr : opt.labelEn}</option>
                                    ))}
                                  </select>
                                  {mp.scope !== 'all' && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                      {getScopeValueOptions(mod.key, mp.scope).map(opt => (
                                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', padding: '2px 6px', borderRadius: '6px', background: mp.scope_ids.includes(opt.id) ? 'rgba(30, 80, 142, 0.1)' : 'transparent', cursor: 'pointer' }}>
                                          <input type="checkbox" checked={mp.scope_ids.includes(opt.id)} onChange={() => handleScopeIdsToggle(mod.key, opt.id)} style={{ width: '12px', height: '12px' }} />
                                          {lang === 'ar' ? opt.labelAr : opt.labelEn}
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            {['view', 'create', 'update', 'delete', 'export', 'import', 'approve', 'reject'].map(action => (
                              <td key={action} style={{ padding: '8px 6px', textAlign: 'center' }}>
                                {mod.actions.includes(action) ? (
                                  <input type="checkbox" checked={mp.actions.includes(action)} onChange={() => handleToggleModuleAction(mod.key, action)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary-ui)', cursor: 'pointer' }} />
                                ) : (
                                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                {editingVP ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'إنشاء الحساب' : 'Create Account')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
