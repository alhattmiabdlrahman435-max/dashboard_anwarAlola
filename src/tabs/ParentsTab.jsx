import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import { useParents } from '../contexts/Parents/useParents';
import { useStudents } from '../contexts/Students/useStudents';
import { parentsService } from '../services/parents/parents.service';
import { Search, X, Download, Upload, FileSpreadsheet, Edit3, Trash2, KeyRound, Printer } from 'lucide-react';
import { SLOGAN_BASE64 } from '../assets/sloganBase64';
import { useClasses } from '../contexts/Classes/useClasses';
import { useAllowedClasses } from '../hooks/useAllowedClasses';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';

export default function ParentsTab() {
  const {
    lang, t, renderAvatar,
    canAction, setToastMessage, triggerConfirm
  } = useApp();

  const {
    parentUsers,
    loading,
    parentsPagination,
    fetchParents,
    handleAddParent,
    handleEditParent,
    handleDeleteParent
  } = useParents();

  const {
    page,
    perPage,
    search,
    setPage,
    setPerPage,
    setSearch,
    buildQueryString,
  } = usePagination({
    moduleKey: 'parents',
  });

  const { students, fetchStudents } = useStudents();
  const { currentUser } = useAuth();
  const { classes, fetchClasses } = useClasses();
  const { allowedClasses } = useAllowedClasses('parents');
  const currentClasses = (allowedClasses && allowedClasses.length > 0) ? allowedClasses : (classes || []);

  // Print Roster states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printClassId, setPrintClassId] = useState('');
  const [printRosterType, setPrintRosterType] = useState('class_no_id');
  const [isPrintingRoster, setIsPrintingRoster] = useState(false);

  const qs = buildQueryString();

  useEffect(() => {
    fetchParents(qs);
  }, [fetchParents, qs]);

  useEffect(() => {
    if (fetchClasses) fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentClasses && currentClasses.length > 0 && !printClassId) {
      const firstNumId = typeof currentClasses[0].id === 'string' && currentClasses[0].id.startsWith('cls-')
        ? currentClasses[0].id.replace('cls-', '')
        : (currentClasses[0].numericId || currentClasses[0].id);
      setPrintClassId(String(firstNumId));
    }
  }, [currentClasses, printClassId]);

  // Local UI states
  const [isSaving, setIsSaving] = useState(false);
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
  const [resetPasswordModalParent, setResetPasswordModalParent] = useState(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleResetPassword = async (type) => {
    if (!resetPasswordModalParent) return;
    setIsResettingPassword(true);
    try {
      const res = await parentsService.resetPassword(resetPasswordModalParent.id, type);
      if (res.data?.success) {
        setToastMessage(res.data.message || (lang === 'ar' ? 'تم تصفير كلمة المرور بنجاح' : 'Password reset successfully'));
        setResetPasswordModalParent(null);
      } else {
        setToastMessage(res.data?.message || (lang === 'ar' ? 'فشل تصفير كلمة المرور' : 'Failed to reset password'));
      }
    } catch (err) {
      setToastMessage(err.response?.data?.message || err.message || (lang === 'ar' ? 'حدث خطأ أثناء تصفير كلمة المرور' : 'Error resetting password'));
    } finally {
      setIsResettingPassword(false);
    }
  };

  const onAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!modalParentNameAr.trim() || !modalParentPhoneNum.trim() || !modalParentNationalIdVal.trim()) {
      setFormError(t.emptyError);
      return;
    }

    const nationalIdDigits = modalParentNationalIdVal.trim();

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

    setIsSaving(true);
    handleAddParent(newParent)
      .then((res) => {
        if (res && res.success) {
          setShowAddParentModal(false);
          // Reset fields on success only
          setModalParentNameAr('');
          setModalParentNameEn('');
          setModalParentPhoneNum('');
          setModalParentNationalIdVal('');
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

    setIsSaving(true);
    handleEditParent(updatedParent, null, selectedParentIdForEdit)
      .then((res) => {
        if (res && res.success) {
          setShowEditParentModal(false);
          // Reset fields on success only
          setModalParentNameAr('');
          setModalParentNameEn('');
          setModalParentPhoneNum('');
          setModalParentNationalIdVal('');
          setSelectedParentIdForEdit('');
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

  const handleExport = async () => {
    try {
      const res = await parentsService.exportParents();
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
      const data = await parentsService.importParents(formData);
      if (data.success) {
        setToastMessage(data.message);
        const token = localStorage.getItem('auth_token');
        fetchParents(token);
        fetchStudents(token);
      } else {
        alert(data.message || (lang === 'ar' ? 'حدث خطأ أثناء الاستيراد' : 'Error importing'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintRoster = async () => {
    setIsPrintingRoster(true);
    try {
      let parentsToPrint = [];
      const needsClass = printRosterType === 'class_no_id' || printRosterType === 'class_with_id';
      let effectiveClassId = printClassId;
      if (needsClass && (!effectiveClassId || effectiveClassId === 'all')) {
        const firstCls = currentClasses[0];
        effectiveClassId = firstCls ? (firstCls.numericId || String(firstCls.id).replace(/\D/g, '')) : '';
      }

      const numericClassId = (effectiveClassId && effectiveClassId !== 'all')
        ? String(effectiveClassId).replace(/\D/g, '')
        : '';

      if (numericClassId) {
        try {
          const res = await parentsService.getParents(`?class_id=${numericClassId}&per_page=1000`);
          if (Array.isArray(res?.parents)) {
            parentsToPrint = res.parents;
          } else if (Array.isArray(res?.data?.parents)) {
            parentsToPrint = res.data.parents;
          } else if (Array.isArray(res?.data)) {
            parentsToPrint = res.data;
          } else if (Array.isArray(res)) {
            parentsToPrint = res;
          }
        } catch (e) {
          console.warn('API class fetch failed, falling back to local state:', e);
        }
      } else {
        try {
          const res = await parentsService.getParents('?per_page=1000');
          if (Array.isArray(res?.parents)) {
            parentsToPrint = res.parents;
          } else if (Array.isArray(res?.data?.parents)) {
            parentsToPrint = res.data.parents;
          } else if (Array.isArray(res?.data)) {
            parentsToPrint = res.data;
          } else if (Array.isArray(res)) {
            parentsToPrint = res;
          }
        } catch (e) {
          console.warn('API all fetch failed, falling back to local state:', e);
        }
      }

      // Robust fallback if API returned 0 results
      if (parentsToPrint.length === 0) {
        if (numericClassId) {
          const classStudents = students.filter(s => {
            const sCls = String(s.class_id || s.classId || '').replace(/\D/g, '');
            return sCls === String(numericClassId);
          });

          const parentIdSet = new Set(classStudents.map(s => Number(s.parentId || s.parent_id)).filter(Boolean));
          const parentNatIdSet = new Set(classStudents.map(s => String(s.parentNationalId || '')).filter(Boolean));

          parentsToPrint = parentUsers.filter(p => 
            parentIdSet.has(Number(p.id)) || 
            (p.nationalId && parentNatIdSet.has(String(p.nationalId)))
          );

          if (parentsToPrint.length === 0 && classStudents.length > 0) {
            const pMap = new Map();
            classStudents.forEach(st => {
              const key = st.parentId || st.parentNationalId || st.parentName;
              if (!key) return;
              if (!pMap.has(key)) {
                pMap.set(key, {
                  id: st.parentId,
                  nationalId: st.parentNationalId || '',
                  name: st.parentName || '',
                  phone: st.phone || '',
                  children: []
                });
              }
              pMap.get(key).children.push({
                id: st.id,
                name: st.name,
                grade: st.grade,
                section: st.section
              });
            });
            parentsToPrint = Array.from(pMap.values());
          }
        } else {
          parentsToPrint = [...parentUsers];
        }
      }

      parentsToPrint = parentsToPrint.map(p => {
        const nationalId = p.national_id || p.nationalId || '';
        const name = p.name_ar || p.name || '';
        let children = p.children || [];
        if (!children || children.length === 0) {
          children = students.filter(s => 
            (s.parentId && p.id && Number(s.parentId) === Number(p.id)) ||
            (nationalId && s.parentNationalId === nationalId)
          );
        }
        return {
          id: p.id,
          nationalId,
          name,
          phone: p.phone || '',
          children: children.map(c => ({
            id: c.id,
            name: c.name_ar || c.name || '',
            grade: c.grade || (c.schoolClass ? c.schoolClass.grade_ar : '') || '',
            section: c.section || (c.schoolClass ? c.schoolClass.section_ar : '') || '',
          }))
        };
      });

      const normalizeArabic = (text) => {
        if (!text) return '';
        return text
          .replace(/[\u064B-\u065F\u0670]/g, '')
          .replace(/[إأآٱ]/g, 'ا')
          .replace(/ة/g, 'ه')
          .replace(/ى/g, 'ي')
          .trim();
      };

      parentsToPrint.sort((a, b) => {
        const normA = normalizeArabic(a.name || '');
        const normB = normalizeArabic(b.name || '');
        const cmp = normA.localeCompare(normB, 'ar');
        return cmp !== 0 ? cmp : (a.name || '').localeCompare(b.name || '', 'ar');
      });

      const selectedClassObj = currentClasses.find(c => {
        const cNum = typeof c.id === 'string' && c.id.startsWith('cls-') ? c.id.replace('cls-', '') : (c.numericId || c.id);
        return String(cNum) === String(numericClassId) || String(c.id) === String(effectiveClassId);
      });

      const className = selectedClassObj 
        ? `${selectedClassObj.grade || selectedClassObj.name || ''} - ${selectedClassObj.section || ''}`
        : (numericClassId ? `الصف ${numericClassId}` : 'جميع الفصول الدراسية');

      const todayStr = new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });

      let rowsHtml = '';
      if (parentsToPrint.length === 0) {
        const colSpanMap = {
          class_no_id: 3,
          class_with_id: 4,
          all_with_id_count: 5,
          all_with_id_children_details: 6
        };
        rowsHtml = `
          <tr>
            <td colspan="${colSpanMap[printRosterType] || 4}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد بيانات أولياء أمور مسجلة لهذا النطاق
            </td>
          </tr>
        `;
      } else {
        rowsHtml = parentsToPrint.map((p, idx) => {
          if (printRosterType === 'class_no_id') {
            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-name">${p.name}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;
          } else if (printRosterType === 'class_with_id') {
            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-code">${p.nationalId}</td>
                <td class="col-name">${p.name}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;
          } else if (printRosterType === 'all_with_id_count') {
            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-code">${p.nationalId}</td>
                <td class="col-name">${p.name}</td>
                <td style="text-align:center;font-weight:800;font-size:12px;">${p.children.length}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;
          } else {
            const childrenText = p.children.length > 0 ? p.children.map(ch => `
              <div style="margin-bottom: 3px; font-size: 10.5px; line-height: 1.35;">
                <span style="font-weight: 700;">• ${ch.name}</span>
                ${(ch.grade || ch.section) ? `<span style="color:#475569; font-size: 10px;"> (${ch.grade}${ch.section ? ' - ' + ch.section : ''})</span>` : ''}
              </div>
            `).join('') : '<span style="color:#94a3b8; font-size: 10.5px; font-style: italic;">لا يوجد أبناء مسجلين</span>';

            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-code">${p.nationalId}</td>
                <td class="col-name" style="width: 170px;">${p.name}</td>
                <td style="text-align:center;font-weight:800;font-size:12px;width: 60px;">${p.children.length}</td>
                <td style="text-align:right;vertical-align:top;padding:6px 10px;">${childrenText}</td>
                <td class="col-notes" style="width: 140px;">&nbsp;</td>
              </tr>
            `;
          }
        }).join('');
      }

      let theadHtml = '';
      if (printRosterType === 'class_no_id') {
        theadHtml = `
          <tr>
            <th style="width: 38px;">م</th>
            <th style="text-align: right;">اسم ولي الأمر</th>
            <th style="width: 240px; text-align: right;">الملاحظات</th>
          </tr>
        `;
      } else if (printRosterType === 'class_with_id') {
        theadHtml = `
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 130px; text-align: center;">الرقم الوطني</th>
            <th style="text-align: right;">اسم ولي الأمر</th>
            <th style="width: 220px; text-align: right;">الملاحظات</th>
          </tr>
        `;
      } else if (printRosterType === 'all_with_id_count') {
        theadHtml = `
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 130px; text-align: center;">الرقم الوطني</th>
            <th style="text-align: right;">اسم ولي الأمر</th>
            <th style="width: 90px; text-align: center;">عدد الأبناء</th>
            <th style="width: 200px; text-align: right;">الملاحظات</th>
          </tr>
        `;
      } else {
        theadHtml = `
          <tr>
            <th style="width: 36px;">م</th>
            <th style="width: 120px; text-align: center;">الرقم الوطني</th>
            <th style="width: 170px; text-align: right;">اسم ولي الأمر</th>
            <th style="width: 65px; text-align: center;">عدد الأبناء</th>
            <th style="text-align: right;">بيانات الأبناء (الاسم - الصف والشعبة)</th>
            <th style="width: 150px; text-align: right;">الملاحظات</th>
          </tr>
        `;
      }

      const showClassMeta = (printRosterType === 'class_no_id' || printRosterType === 'class_with_id' || (effectiveClassId && effectiveClassId !== 'all'));

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>كشف أولياء الأمور - ${showClassMeta ? className : 'المدرسة'}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Almarai:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4 portrait;
    margin: 8mm 10mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    direction: rtl;
    font-family: 'Tajawal', 'Almarai', 'Segoe UI', Tahoma, Arial, sans-serif;
    color: #0f172a;
    background: #fff;
    font-size: 11px;
    line-height: 1.4;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-page-wrapper {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    min-height: 275mm;
  }
  .sr-official-header {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1.3fr;
    align-items: center;
    width: 100%;
    padding-bottom: 8px;
    border-bottom: 2px solid #1e3a8a;
    margin-bottom: 10px;
  }
  .sr-header-ar {
    text-align: right;
    font-size: 11px;
    line-height: 1.5;
    font-weight: 700;
    color: #0f172a;
  }
  .sr-header-school-ar {
    font-weight: 800;
    font-size: 12.5px;
    color: #1e3a8a;
    margin-top: 2px;
  }
  .sr-header-logo {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .sr-header-logo img {
    width: 60px;
    height: 60px;
    object-fit: contain;
    border-radius: 50%;
    border: 2px solid #1e3a8a;
    padding: 2px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  }
  .sr-header-en {
    text-align: left;
    font-size: 10px;
    line-height: 1.5;
    font-weight: 700;
    color: #0f172a;
    direction: ltr;
  }
  .sr-header-school-en {
    font-weight: 800;
    font-size: 11px;
    color: #1e3a8a;
    margin-top: 2px;
  }
  .sr-title-bar {
    text-align: center;
    margin-bottom: 8px;
  }
  .sr-meta-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px 14px;
    margin-top: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #1e293b;
  }
  .sr-meta-item strong {
    color: #1e3a8a;
  }
  table.roster-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    border: 1.5px solid #1e3a8a;
    font-size: 11px;
  }
  table.roster-table thead th {
    background-color: #f1f5f9;
    color: #0f2e5a;
    font-weight: 800;
    padding: 8px 10px;
    border: 1px solid #94a3b8;
    border-bottom: 2px solid #1e3a8a;
  }
  table.roster-table tbody td {
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    vertical-align: middle;
  }
  table.roster-table tbody tr:nth-child(even) {
    background-color: #f8fafc;
  }
  .col-num {
    width: 38px;
    text-align: center;
    font-weight: 700;
    background-color: #f1f5f9;
  }
  .col-code {
    width: 120px;
    text-align: center;
    font-family: monospace;
    font-weight: 700;
    font-size: 11.5px;
  }
  .col-name {
    text-align: right;
    font-weight: 700;
    font-size: 11.5px;
  }
  .col-notes {
    text-align: right;
    background-color: #ffffff;
  }
  .sr-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #cbd5e1;
    padding-top: 6px;
    font-size: 9px;
    color: #64748b;
    margin-top: 16px;
    page-break-inside: avoid;
  }
</style>
</head>
<body>
  <div class="print-page-wrapper">
    <div class="sr-official-header">
      <div class="sr-header-ar">
        <div>الجمهورية اليمنية</div>
        <div>وزارة التربية والتعليم والبحث العلمي</div>
        <div class="sr-header-school-ar">رياض ومدارس أنوار العلى الدولية النموذجية</div>
      </div>
      <div class="sr-header-logo">
        <img src="${SLOGAN_BASE64}" alt="Logo" />
      </div>
      <div class="sr-header-en">
        <div>Republic of Yemen</div>
        <div>Min. of Education & Scientific Research</div>
        <div class="sr-header-school-en">Riyadh & Anwar Al-Ola Int. Model Schools</div>
      </div>
    </div>

    <div class="sr-title-bar">
      <div class="sr-meta-bar">
        ${showClassMeta ? `<div class="sr-meta-item">الصف والشعبة: <strong>${className}</strong></div>` : `<div class="sr-meta-item">النطاق: <strong>جميع الصفوف الدراسية</strong></div>`}
        <div class="sr-meta-item">العام الدراسي: <strong>1447-1448هـ (2025-2026م)</strong></div>
        <div class="sr-meta-item">إجمالي أولياء الأمور: <strong>${parentsToPrint.length} ولي أمر</strong></div>
        <div class="sr-meta-item">التاريخ: <strong>${todayStr}</strong></div>
      </div>
    </div>

    <table class="roster-table">
      <thead>
        ${theadHtml}
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="sr-footer">
      <span>تم إصدار الكشف آلياً عبر نظام إدارة رياض ومدارس أنوار العلى الدولية النموذجية</span>
      <span>صفحة 1 من 1</span>
    </div>
  </div>
</body>
</html>`;

      let iframe = document.getElementById('parents-print-frame');
      if (iframe) iframe.remove();
      iframe = document.createElement('iframe');
      iframe.id = 'parents-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow || iframe.contentDocument;
      const doc = frameDoc.document || frameDoc;
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          console.error('Print trigger error:', err);
        }
      }, 350);

      setShowPrintModal(false);
    } catch (err) {
      console.error('Roster generation failed:', err);
      alert('حدث خطأ أثناء إعداد كشف الطباعة');
    } finally {
      setIsPrintingRoster(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await parentsService.downloadTemplate();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parents_template.xlsx';
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
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setShowPrintModal(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '8px 16px', 
              fontSize: '13px', 
              fontWeight: '700',
              color: '#d97706',
              borderColor: '#fcd34d',
              backgroundColor: '#fffbeb'
            }}
          >
            <Printer size={16} />
            {lang === 'ar' ? 'طباعة كشف' : 'Print Roster'}
          </button>
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
                <input type="file" accept=".csv,.xlsx" onChange={handleImport} style={{ display: 'none' }} />
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
            id="search-parents"
            name="search"
            type="text"
            className="text-field"
            placeholder={t.searchParentPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Parents List Table */}
      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th className="sticky-col-1">
                {t.parentNationalIdShort}
              </th>
              <th className="sticky-col-2">
                {t.parentName}
              </th>
              <th>{t.parentPhone}</th>
              <th>{t.parentSonsCount}</th>
              <th>{t.parentSonsList}</th>
              {(currentUser?.role === 'admin' || canAction('parents', 'update') || canAction('parents', 'delete')) && <th className="no-print">{t.action}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredParents.length > 0 ? (
              filteredParents.map((parent) => {
                const children = (parent.children && parent.children.length > 0)
                  ? parent.children
                  : students.filter(s => s.parentNationalId === parent.nationalId);
                return (
                  <tr key={parent.nationalId}>
                    <td className="sticky-col-1" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                      {parent.nationalId}
                    </td>
                    <td className="sticky-col-2" style={{ fontWeight: '600' }}>
                      {renderAvatar(parent.photo, "🧔")} 
                      {lang === 'ar' ? parent.name : (parent.nameEn || parent.name)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{parent.phone}</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{children.length}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {children.map(child => (
                          <span key={child.id} className="chip" style={{ cursor: 'default', padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {renderAvatar(child.photo, "👨‍🎓")}
                            <span>{lang === 'ar' ? child.name : (child.nameEn || child.name)} ({lang === 'ar' ? (child.grade || '') : (child.gradeEn || child.grade || '')})</span>
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
                    {(currentUser?.role === 'admin' || canAction('parents', 'update') || canAction('parents', 'delete')) && (
                      <td className="no-print">
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {canAction('parents', 'update') && (
                            <button 
                              className="btn-elevated"
                              style={{ 
                                padding: '6px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '1px solid rgba(37, 99, 235, 0.15)',
                                background: 'rgba(37, 99, 235, 0.06)',
                                color: '#2563eb',
                                width: '32px',
                                height: '32px',
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
                              onClick={() => {
                                setFormError('');
                                setSelectedParentIdForEdit(parent.nationalId);
                                setModalParentNameAr(parent.name);
                                setModalParentNameEn(parent.nameEn || '');
                                setModalParentPhoneNum(parent.phone);
                                setModalParentNationalIdVal(parent.nationalId);
                                setShowEditParentModal(true);
                              }}
                              title={lang === 'ar' ? 'تعديل' : 'Edit'}
                            >
                              <Edit3 size={15} />
                            </button>
                          )}

                          {canAction('parents', 'update') && (
                            <button
                              onClick={() => setResetPasswordModalParent(parent)}
                              title={lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                              style={{
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                background: 'rgba(245, 158, 11, 0.08)',
                                color: '#d97706',
                                width: '32px',
                                height: '32px',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.18)';
                                e.currentTarget.style.borderColor = '#d97706';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)';
                                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.2)';
                              }}
                            >
                              <KeyRound size={15} />
                            </button>
                          )}

                          {canAction('parents', 'delete') && (
                            <button 
                              onClick={() => {
                                triggerConfirm({
                                  title: lang === 'ar' ? 'حذف حساب ولي الأمر' : 'Delete Parent Account',
                                  message: lang === 'ar' 
                                    ? `هل أنت متأكد من حذف حساب ولي الأمر ${parent.name} وحسابه بالكامل؟` 
                                    : `Are you sure you want to delete parent ${parent.name} and their account?`,
                                  onConfirm: () => handleDeleteParent(parent.id)
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
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px' }}>
                      {searchQuery ? "🔍" : "📂"}
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                      {searchQuery 
                        ? (lang === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matching results found')
                        : (lang === 'ar' ? 'لا يوجد أولياء أمور مسجلين حالياً' : 'No parent accounts registered yet')
                      }
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {searchQuery 
                        ? (lang === 'ar' ? 'جرب البحث بكلمة مفتاحية مختلفة' : 'Try searching for a different keyword')
                        : (lang === 'ar' ? 'لم يتم إضافة أي بيانات بعد' : 'No records have been added yet')
                      }
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={parentsPagination?.currentPage || page}
        lastPage={parentsPagination?.lastPage || 1}
        total={parentsPagination?.total || parentUsers.length}
        from={parentsPagination?.from || 1}
        to={parentsPagination?.to || parentUsers.length}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        loading={loading}
        lang={lang}
      />

      {/* MODAL DIALOG: ADD PARENT ACCOUNT */}
      {showAddParentModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">👨🏼‍💼 {lang === 'ar' ? 'تسجيل حساب ولي أمر جديد' : 'Register New Parent'}</h3>
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
                  <input id="parent-name-ar" name="name_ar" type="text" className="text-field" value={modalParentNameAr} onChange={(e) => setModalParentNameAr(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم ولي الأمر (بالانجليزية - اختياري)' : 'Parent Name (English - Optional)'}</label>
                  <input id="parent-name-en" name="name_en" type="text" className="text-field" value={modalParentNameEn} onChange={(e) => setModalParentNameEn(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الرقم الوطني' : 'National ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input id="parent-national-id" name="national_id" type="text" className="text-field" value={modalParentNationalIdVal} onChange={(e) => setModalParentNationalIdVal(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input id="parent-phone" name="phone" type="text" className="text-field" value={modalParentPhoneNum} onChange={(e) => setModalParentPhoneNum(e.target.value)} placeholder="7XXXXXXXX" required />
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowAddParentModal(false)} style={{ height: '48px' }} disabled={isSaving}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
                </button>
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
                  <input id="edit-parent-name-ar" name="edit_name_ar" type="text" className="text-field" value={modalParentNameAr} onChange={(e) => setModalParentNameAr(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم ولي الأمر (بالانجليزية)' : 'Parent Name (English)'}</label>
                  <input id="edit-parent-name-en" name="edit_name_en" type="text" className="text-field" value={modalParentNameEn} onChange={(e) => setModalParentNameEn(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الرقم المدني / الوطني' : 'Civil / National ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input id="edit-parent-national-id" name="edit_national_id" type="text" className="text-field" value={modalParentNationalIdVal} onChange={(e) => setModalParentNationalIdVal(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input id="edit-parent-phone" name="edit_phone" type="text" className="text-field" value={modalParentPhoneNum} onChange={(e) => setModalParentPhoneNum(e.target.value)} placeholder="7XXXXXXXX" required />
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowEditParentModal(false)} style={{ height: '48px' }} disabled={isSaving}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: RESET PARENT PASSWORD */}
      {/* Print Roster Modal */}
      {showPrintModal && (
        <div className="modal-overlay no-print" style={{ zIndex: 9999 }}>
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <header className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={20} color="#d97706" />
                <span>{lang === 'ar' ? 'طباعة كشوفات أولياء الأمور' : 'Print Parents Rosters'}</span>
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowPrintModal(false)}
                disabled={isPrintingRoster}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  {lang === 'ar' ? 'اختر الصف والشعبة' : 'Select Class & Section'}
                </label>
                <select
                  value={printClassId}
                  onChange={(e) => setPrintClassId(e.target.value)}
                  className="text-field"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                  disabled={isPrintingRoster}
                >
                  {(printRosterType === 'all_with_id_count' || printRosterType === 'all_with_id_children_details') && (
                    <option value="all">{lang === 'ar' ? 'جميع الصفوف (كامل المدرسة)' : 'All Classes (Whole School)'}</option>
                  )}
                  {currentClasses.map(cls => {
                    const numId = typeof cls.id === 'string' && cls.id.startsWith('cls-')
                      ? cls.id.replace('cls-', '')
                      : (cls.numericId || cls.id);
                    return (
                      <option key={cls.id} value={numId}>
                        {cls.grade || cls.name} - {cls.section || cls.section_ar || ''}
                      </option>
                    );
                  })}
                </select>
                {(printRosterType === 'class_no_id' || printRosterType === 'class_with_id') && printClassId === 'all' && (
                  <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    * هذا الكشف يتطلب تحديد صف وشعبة معينة
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                  {lang === 'ar' ? 'نوع الكشف المطلوب' : 'Roster Type'}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label 
                    onClick={() => {
                      setPrintRosterType('class_no_id');
                      if ((printClassId === 'all' || !printClassId) && currentClasses[0]?.id) {
                        const firstNumId = typeof currentClasses[0].id === 'string' && currentClasses[0].id.startsWith('cls-')
                          ? currentClasses[0].id.replace('cls-', '')
                          : (currentClasses[0].numericId || currentClasses[0].id);
                        setPrintClassId(String(firstNumId));
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: `1.5px solid ${printRosterType === 'class_no_id' ? '#d97706' : 'var(--color-border)'}`,
                      backgroundColor: printRosterType === 'class_no_id' ? 'rgba(217, 119, 6, 0.05)' : 'var(--color-surface)',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="rosterType" 
                      value="class_no_id"
                      checked={printRosterType === 'class_no_id'}
                      onChange={() => {
                        setPrintRosterType('class_no_id');
                        if ((printClassId === 'all' || !printClassId) && currentClasses[0]?.id) {
                          const firstNumId = typeof currentClasses[0].id === 'string' && currentClasses[0].id.startsWith('cls-')
                            ? currentClasses[0].id.replace('cls-', '')
                            : (currentClasses[0].numericId || currentClasses[0].id);
                          setPrintClassId(String(firstNumId));
                        }
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: printRosterType === 'class_no_id' ? '700' : '500' }}>
                      {lang === 'ar' ? 'كشف بأسماء أولياء الأمور لصف وشعبة محددة بدون الرقم الوطني' : 'Class Parents Roster without National ID'}
                    </span>
                  </label>

                  <label 
                    onClick={() => {
                      setPrintRosterType('class_with_id');
                      if ((printClassId === 'all' || !printClassId) && currentClasses[0]?.id) {
                        const firstNumId = typeof currentClasses[0].id === 'string' && currentClasses[0].id.startsWith('cls-')
                          ? currentClasses[0].id.replace('cls-', '')
                          : (currentClasses[0].numericId || currentClasses[0].id);
                        setPrintClassId(String(firstNumId));
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: `1.5px solid ${printRosterType === 'class_with_id' ? '#d97706' : 'var(--color-border)'}`,
                      backgroundColor: printRosterType === 'class_with_id' ? 'rgba(217, 119, 6, 0.05)' : 'var(--color-surface)',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="rosterType" 
                      value="class_with_id"
                      checked={printRosterType === 'class_with_id'}
                      onChange={() => {
                        setPrintRosterType('class_with_id');
                        if ((printClassId === 'all' || !printClassId) && currentClasses[0]?.id) {
                          const firstNumId = typeof currentClasses[0].id === 'string' && currentClasses[0].id.startsWith('cls-')
                            ? currentClasses[0].id.replace('cls-', '')
                            : (currentClasses[0].numericId || currentClasses[0].id);
                          setPrintClassId(String(firstNumId));
                        }
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: printRosterType === 'class_with_id' ? '700' : '500' }}>
                      {lang === 'ar' ? 'كشف بأسماء أولياء الأمور لصف وشعبة محددة مع الرقم الوطني' : 'Class Parents Roster with National ID'}
                    </span>
                  </label>

                  <label 
                    onClick={() => setPrintRosterType('all_with_id_count')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: `1.5px solid ${printRosterType === 'all_with_id_count' ? '#d97706' : 'var(--color-border)'}`,
                      backgroundColor: printRosterType === 'all_with_id_count' ? 'rgba(217, 119, 6, 0.05)' : 'var(--color-surface)',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="rosterType" 
                      value="all_with_id_count"
                      checked={printRosterType === 'all_with_id_count'}
                      onChange={() => setPrintRosterType('all_with_id_count')}
                    />
                    <span style={{ fontSize: '13px', fontWeight: printRosterType === 'all_with_id_count' ? '700' : '500' }}>
                      {lang === 'ar' ? 'كشف بأسماء أولياء الأمور مع الرقم الوطني وعدد الأبناء' : 'Parents Roster with National ID & Children Count'}
                    </span>
                  </label>

                  <label 
                    onClick={() => setPrintRosterType('all_with_id_children_details')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: `1.5px solid ${printRosterType === 'all_with_id_children_details' ? '#d97706' : 'var(--color-border)'}`,
                      backgroundColor: printRosterType === 'all_with_id_children_details' ? 'rgba(217, 119, 6, 0.05)' : 'var(--color-surface)',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="rosterType" 
                      value="all_with_id_children_details"
                      checked={printRosterType === 'all_with_id_children_details'}
                      onChange={() => setPrintRosterType('all_with_id_children_details')}
                    />
                    <span style={{ fontSize: '13px', fontWeight: printRosterType === 'all_with_id_children_details' ? '700' : '500' }}>
                      {lang === 'ar' ? 'كشف بأسماء أولياء الأمور مع الرقم الوطني وعدد الأبناء وأسمائهم مع الصف والشعبة' : 'Parents Roster with ID, Children Names & Classes'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
              <button 
                type="button" 
                className="btn-filled"
                onClick={handlePrintRoster}
                disabled={isPrintingRoster || ((printRosterType === 'class_no_id' || printRosterType === 'class_with_id') && (!printClassId || printClassId === 'all'))}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  backgroundColor: '#d97706', 
                  borderColor: '#d97706',
                  color: '#fff',
                  padding: '8px 20px',
                  opacity: ((printRosterType === 'class_no_id' || printRosterType === 'class_with_id') && (!printClassId || printClassId === 'all')) ? 0.6 : 1
                }}
              >
                <Printer size={16} />
                <span>{isPrintingRoster ? (lang === 'ar' ? 'جاري تجهيز الكشف...' : 'Preparing...') : (lang === 'ar' ? 'طباعة' : 'Print')}</span>
              </button>
              <button 
                type="button" 
                className="btn-elevated" 
                onClick={() => setShowPrintModal(false)}
                disabled={isPrintingRoster}
              >
                {t.cancel}
              </button>
            </footer>
          </div>
        </div>
      )}

      {resetPasswordModalParent && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <header className="modal-header">
              <h3 className="modal-title">🔑 {lang === 'ar' ? 'إعادة تعيين كلمة مرور ولي الأمر' : 'Reset Parent Password'}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setResetPasswordModalParent(null)}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--color-bg-secondary, #f8fafc)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                  {resetPasswordModalParent.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>🆔 {resetPasswordModalParent.nationalId}</span>
                  <span>📱 {resetPasswordModalParent.phone || 'غير مسجل'}</span>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ar' 
                  ? 'اختر خيار إعادة تعيين كلمة المرور المطلوب لحساب ولي الأمر ليتمكن من الدخول إلى التطبيق:' 
                  : 'Select the reset option for this parent account to enable mobile app login:'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn-filled" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    backgroundColor: '#062A5A',
                    color: '#ffffff',
                    cursor: isResettingPassword ? 'wait' : 'pointer'
                  }}
                  disabled={isResettingPassword}
                  onClick={() => handleResetPassword('default')}
                >
                  <div style={{ textAlign: 'start' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>
                      {lang === 'ar' ? 'تصفير إلى الرمز الافتراضي (12345678)' : 'Reset to Default (12345678)'}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                      {lang === 'ar' ? 'الرمز الموحد الأساسي لجميع أولياء الأمور' : 'Standard default code for all parents'}
                    </div>
                  </div>
                  <span style={{ fontSize: '18px' }}>⚡</span>
                </button>

                <button 
                  type="button" 
                  className="btn-elevated" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid #2563eb',
                    color: '#2563eb',
                    background: 'rgba(37, 99, 235, 0.05)',
                    cursor: isResettingPassword ? 'wait' : 'pointer',
                    opacity: !resetPasswordModalParent.phone ? 0.5 : 1
                  }}
                  disabled={isResettingPassword || !resetPasswordModalParent.phone}
                  onClick={() => handleResetPassword('phone')}
                >
                  <div style={{ textAlign: 'start' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>
                      {lang === 'ar' 
                        ? `تصفير إلى رقم الجوال (${resetPasswordModalParent.phone || 'غير متوفر'})` 
                        : `Reset to Phone (${resetPasswordModalParent.phone || 'N/A'})`}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                      {lang === 'ar' ? 'يجعل كلمة المرور مطابقة لرقم هاتف ولي الأمر' : 'Sets password to match parent phone number'}
                    </div>
                  </div>
                  <span style={{ fontSize: '18px' }}>📱</span>
                </button>
              </div>
            </div>
            <footer className="modal-footer">
              <button 
                type="button" 
                className="btn-elevated" 
                onClick={() => setResetPasswordModalParent(null)}
                disabled={isResettingPassword}
              >
                {t.cancel}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
