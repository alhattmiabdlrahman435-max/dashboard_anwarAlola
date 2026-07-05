import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit3, Trash2, Copy, Shield, ShieldCheck, ChevronDown, Search, X } from 'lucide-react';

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

const MODULE_CATEGORIES = [
  {
    id: 'users',
    titleAr: 'المستفيدون وطاقم العمل',
    titleEn: 'Users & Staff',
    icon: '👥',
    modules: ['students', 'parents', 'teachers', 'prepSupervisors']
  },
  {
    id: 'academics',
    titleAr: 'الشؤون التعليمية والأكاديمية',
    titleEn: 'Academics & School Work',
    icon: '📖',
    modules: ['classes', 'subjects', 'schedule', 'assignments', 'examSchedules', 'detailedGrades']
  },
  {
    id: 'operations',
    titleAr: 'المتابعة والعمليات اليومية',
    titleEn: 'Daily Operations & Attendance',
    icon: '⚙️',
    modules: ['scanner', 'absenceRequests', 'teacherReports', 'communications']
  },
  {
    id: 'administration',
    titleAr: 'الشؤون الإدارية والمالية والرقابة',
    titleEn: 'Administration, Finance & Control',
    icon: '💼',
    modules: ['finance', 'control', 'reports']
  }
];

const actionStyles = {
  view: { bg: 'rgba(37, 99, 235, 0.08)', border: '#2563eb', text: '#2563eb' },
  create: { bg: 'rgba(22, 163, 74, 0.08)', border: '#16a34a', text: '#16a34a' },
  update: { bg: 'rgba(217, 119, 6, 0.08)', border: '#d97706', text: '#d97706' },
  delete: { bg: 'rgba(220, 38, 38, 0.08)', border: '#dc2626', text: '#dc2626' },
  export: { bg: 'rgba(79, 70, 229, 0.08)', border: '#4f46e5', text: '#4f46e5' },
  import: { bg: 'rgba(13, 148, 136, 0.08)', border: '#0d9488', text: '#0d9488' },
  approve: { bg: 'rgba(16, 185, 129, 0.08)', border: '#10b981', text: '#10b981' },
  reject: { bg: 'rgba(225, 29, 72, 0.08)', border: '#e11d48', text: '#e11d48' },
};

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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => openEditModal(vp)} 
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
                    <button 
                      onClick={() => handleDelete(vp)} 
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
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '820px', width: '90%', maxHeight: '90vh' }}>
            <header className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {editingVP ? (lang === 'ar' ? '✏️ تعديل بيانات وصلاحيات الوكيل' : '✏️ Edit Vice Principal Details') : (lang === 'ar' ? '➕ إضافة وكيل جديد وتحديد الصلاحيات' : '➕ Add New Vice Principal')}
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="modal-body" style={{ overflowY: 'auto' }}>
              {formError && (
                <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                  {formError}
                </div>
              )}

            {/* Basic Info */}
            <div style={{
              background: 'var(--color-surface, #ffffff)',
              border: '1.5px solid var(--color-border)',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary-ui)', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 14px 0', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px' }}>
                👤 {lang === 'ar' ? 'البيانات الأساسية للوكيل' : 'Basic Information'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'اسم الوكيل الكامل' : 'Full Name'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={formName} onChange={e => setFormName(e.target.value)} style={{ height: '42px', borderRadius: '10px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="text" className="text-field" value={formJobId} onChange={e => setFormJobId(e.target.value)} style={{ height: '42px', borderRadius: '10px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'}</label>
                  <input type="text" className="text-field" value={formPhone} onChange={e => setFormPhone(e.target.value)} style={{ height: '42px', borderRadius: '10px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'كلمة المرور' : 'Password'} {!editingVP && <span style={{ color: 'var(--color-error)' }}>*</span>}</label>
                  <input type="text" className="text-field" value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder={editingVP ? (lang === 'ar' ? 'اتركه فارغاً للإبقاء كما هو' : 'Leave empty to keep current') : ''} style={{ height: '42px', borderRadius: '10px' }} />
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div style={{
              background: 'var(--color-surface, #ffffff)',
              border: '1.5px solid var(--color-border)',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary-ui)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Shield size={18} /> {lang === 'ar' ? 'إدارة الصلاحيات والأدوار' : 'Permissions & Roles Management'}
                </h4>

                {/* Copy Permissions Button */}
                {vicePrincipals.length > 0 && (
                  <div style={{ position: 'relative' }}>
                    <button className="btn-secondary" onClick={() => setShowCopyDropdown(!showCopyDropdown)} style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '8px', height: '32px' }}>
                      <Copy size={13} /> {lang === 'ar' ? 'نسخ صلاحيات من وكيل آخر...' : 'Copy from another...'}
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
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: fullAccess ? 'rgba(34, 197, 94, 0.08)' : 'rgba(100, 116, 139, 0.02)', border: `1.5px solid ${fullAccess ? '#22c55e' : 'var(--color-border)'}`, borderRadius: '12px', cursor: 'pointer', marginBottom: '14px', transition: 'all 0.2s ease', boxShadow: fullAccess ? '0 2px 10px rgba(34, 197, 94, 0.05)' : 'none' }}>
                <input type="checkbox" checked={fullAccess} onChange={e => setFullAccess(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#22c55e', cursor: 'pointer' }} />
                <ShieldCheck size={20} style={{ color: fullAccess ? '#22c55e' : 'var(--color-text-secondary)' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: fullAccess ? '#16a34a' : 'var(--color-text-primary)' }}>
                    {lang === 'ar' ? 'كامل الصلاحيات (مدير النظام - Full Access)' : 'Full Access (Administrator)'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {lang === 'ar' ? 'يمنح هذا الخيار الوكيل جميع الصلاحيات بالكامل على كافة الأقسام تلقائياً' : 'Automatically grants all admin permissions on all modules'}
                  </div>
                </div>
              </label>

              {/* Detailed Permissions restructured */}
              {!fullAccess && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  {MODULE_CATEGORIES.map(category => {
                    const categoryModules = ALL_MODULES.filter(m => category.modules.includes(m.key));
                    return (
                      <div key={category.id} style={{
                        border: '1.5px solid var(--color-border)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: 'var(--color-surface)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.01)'
                      }}>
                        {/* Category Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          background: 'rgba(30, 80, 142, 0.04)',
                          borderBottom: '1px solid var(--color-border)',
                          fontWeight: 'bold',
                          color: 'var(--color-primary-ui)',
                          fontSize: '13px'
                        }}>
                          <span style={{ fontSize: '15px' }}>{category.icon}</span>
                          <span>{lang === 'ar' ? category.titleAr : category.titleEn}</span>
                        </div>

                        {/* Category Body / Module Rows */}
                        <div style={{ padding: '4px 14px' }}>
                          {categoryModules.map(mod => {
                            const mp = modulePerms[mod.key] || { actions: [], scope: 'all', scope_ids: [] };
                            const isEnabled = mp.actions.length > 0;
                            return (
                              <div key={mod.key} style={{
                                padding: '12px 0',
                                borderBottom: '1px solid var(--color-border-light, #f1f5f9)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}>
                                {/* Row Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', color: 'var(--color-text-primary)' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={mod.actions.every(a => mp.actions.includes(a)) && mp.actions.length > 0} 
                                      onChange={() => handleToggleAllActions(mod.key, mod.actions)} 
                                      style={{ width: '15px', height: '15px', accentColor: 'var(--color-primary-ui)', cursor: 'pointer' }} 
                                    />
                                    <span>{lang === 'ar' ? mod.labelAr : mod.labelEn}</span>
                                  </label>

                                  {/* State Indicator Badge */}
                                  <span style={{
                                    fontSize: '9px',
                                    fontWeight: 'bold',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: isEnabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.08)',
                                    color: isEnabled ? '#16a34a' : '#64748b'
                                  }}>
                                    {isEnabled 
                                      ? (lang === 'ar' ? `مفعّل (${mp.actions.length} صلاحيات)` : `Active (${mp.actions.length} perms)`)
                                      : (lang === 'ar' ? 'معطّل' : 'Disabled')}
                                  </span>
                                </div>

                                {/* Row Body - Actions list */}
                                <div style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '6px',
                                  paddingInlineStart: '23px'
                                }}>
                                  {['view', 'create', 'update', 'delete', 'export', 'import', 'approve', 'reject'].map(action => {
                                    return mod.actions.includes(action) && (
                                      <label key={action} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '5px 10px',
                                        borderRadius: '16px',
                                        border: `1.5px solid ${mp.actions.includes(action) ? actionStyles[action].border : 'var(--color-border)'}`,
                                        background: mp.actions.includes(action) ? actionStyles[action].bg : 'var(--color-surface)',
                                        color: mp.actions.includes(action) ? actionStyles[action].text : 'var(--color-text-secondary)',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transition: 'all 0.15s ease',
                                        boxShadow: mp.actions.includes(action) ? '0 1px 3px rgba(0,0,0,0.02)' : 'none'
                                      }}
                                        onMouseOver={e => { if(!mp.actions.includes(action)) e.currentTarget.style.borderColor = 'var(--color-primary-light)' }}
                                        onMouseOut={e => { if(!mp.actions.includes(action)) e.currentTarget.style.borderColor = 'var(--color-border)' }}
                                      >
                                        <input 
                                          type="checkbox" 
                                          checked={mp.actions.includes(action)} 
                                          onChange={() => handleToggleModuleAction(mod.key, action)} 
                                          style={{ display: 'none' }}
                                        />
                                        <span>{mp.actions.includes(action) ? '✓ ' : ''}{t[action]}</span>
                                      </label>
                                    );
                                  })}
                                </div>

                                {/* Scope Settings */}
                                {mod.hasScope && isEnabled && (
                                  <div style={{
                                    marginInlineStart: '23px',
                                    padding: '10px',
                                    background: 'rgba(30, 80, 142, 0.02)',
                                    border: '1px dashed var(--color-border)',
                                    borderRadius: '10px',
                                    marginTop: '4px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                                        {lang === 'ar' ? 'نطاق الصلاحية للدرجات:' : 'Scope of Access for Grades:'}
                                      </span>
                                      <select 
                                        className="text-field" 
                                        value={mp.scope} 
                                        onChange={e => handleScopeChange(mod.key, e.target.value)} 
                                        style={{ fontSize: '11px', padding: '2px 6px', height: '26px', width: 'auto', display: 'inline-block' }}
                                      >
                                        {SCOPE_OPTIONS.map(opt => (
                                          <option key={opt.value} value={opt.value}>{lang === 'ar' ? opt.labelAr : opt.labelEn}</option>
                                        ))}
                                      </select>
                                    </div>
                                    {mp.scope !== 'all' && (
                                      <div style={{
                                        display: 'flex',
                                        flexDirection: mp.scope === 'class' ? 'column' : 'row',
                                        flexWrap: 'wrap',
                                        gap: mp.scope === 'class' ? '12px' : '6px',
                                        background: 'var(--color-surface)',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border-light)',
                                        alignItems: mp.scope === 'class' ? 'stretch' : 'center'
                                      }}>
                                        {mp.scope === 'class' ? (() => {
                                          // Group classes by grade name
                                          const classesByGrade = {};
                                          (classes || []).forEach(c => {
                                            const gradeKey = lang === 'ar' ? c.grade : c.gradeEn;
                                            if (!classesByGrade[gradeKey]) classesByGrade[gradeKey] = [];
                                            classesByGrade[gradeKey].push(c);
                                          });

                                          return Object.keys(classesByGrade).map(gradeName => (
                                            <div key={gradeName} style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '12px',
                                              paddingBottom: '8px',
                                              borderBottom: '1px dashed var(--color-border-light)',
                                              width: '100%',
                                              flexWrap: 'wrap'
                                            }}>
                                              <span style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '110px', color: 'var(--color-text-primary)' }}>
                                                {gradeName}
                                              </span>
                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {classesByGrade[gradeName].map(c => {
                                                  const isSelected = mp.scope_ids.includes(c.id);
                                                  return (
                                                    <label key={c.id} style={{
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      gap: '4px',
                                                      fontSize: '11px',
                                                      padding: '3px 8px',
                                                      borderRadius: '12px',
                                                      border: `1px solid ${isSelected ? 'var(--color-primary-light)' : 'var(--color-border)'}`,
                                                      background: isSelected ? 'rgba(30, 80, 142, 0.08)' : 'transparent',
                                                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                                      cursor: 'pointer',
                                                      transition: 'all 0.15s ease',
                                                      userSelect: 'none'
                                                    }}>
                                                      <input 
                                                        type="checkbox" 
                                                        checked={isSelected} 
                                                        onChange={() => handleScopeIdsToggle(mod.key, c.id)} 
                                                        style={{ width: '12px', height: '12px', accentColor: 'var(--color-primary-ui)' }} 
                                                      />
                                                      <span>{lang === 'ar' ? c.section : c.sectionEn}</span>
                                                    </label>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          ));
                                        })() : (
                                          getScopeValueOptions(mod.key, mp.scope).map(opt => {
                                            const isSelected = mp.scope_ids.includes(opt.id);
                                            return (
                                              <label key={opt.id} style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '11px',
                                                padding: '3px 8px',
                                                borderRadius: '12px',
                                                border: `1px solid ${isSelected ? 'var(--color-primary-light)' : 'var(--color-border)'}`,
                                                background: isSelected ? 'rgba(30, 80, 142, 0.08)' : 'transparent',
                                                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                userSelect: 'none'
                                              }}>
                                                <input 
                                                  type="checkbox" 
                                                  checked={isSelected} 
                                                  onChange={() => handleScopeIdsToggle(mod.key, opt.id)} 
                                                  style={{ width: '12px', height: '12px', accentColor: 'var(--color-primary-ui)' }} 
                                                />
                                                <span>{lang === 'ar' ? opt.labelAr : opt.labelEn}</span>
                                              </label>
                                            );
                                          })
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            </div>

            {/* Actions */}
            <div className="modal-footer">
              <button className="btn-elevated" onClick={() => setShowModal(false)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button className="btn-filled" onClick={handleSubmit}>
                {editingVP ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'إنشاء الحساب' : 'Create Account')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
