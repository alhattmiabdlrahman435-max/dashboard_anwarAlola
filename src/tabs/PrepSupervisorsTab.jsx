import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTeachers } from '../contexts/Teachers/useTeachers';
import { useClasses } from '../contexts/Classes/useClasses';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';
import { Plus, X, Camera, User, Search, Printer, Upload } from 'lucide-react';
import { teachersService } from '../services/teachers/teachers.service';
import { SLOGAN_BASE64 } from '../assets/sloganBase64';

export default function PrepSupervisorsTab() {
  const {
    lang, t, renderAvatar,
    setToastMessage, triggerConfirm, canAction
  } = useApp();

  const {
    supervisors,
    supervisorsPagination,
    handleAddSupervisor,
    handleEditSupervisor,
    handleDeleteSupervisor,
    fetchSupervisors,
    loading
  } = useTeachers();

  const { classes, fetchClasses } = useClasses();

  const {
    page,
    perPage,
    search,
    sort,
    direction,
    setPage,
    setPerPage,
    setSearch,
    buildQueryString,
    goToPrevIfEmpty,
  } = usePagination({
    moduleKey: 'supervisors',
  });

  const qs = buildQueryString();

  useEffect(() => {
    fetchSupervisors(qs);
  }, [fetchSupervisors, qs]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Local UI states
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search);

  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [showEditSupervisorModal, setShowEditSupervisorModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printRosterType, setPrintRosterType] = useState('job_id');
  const [isPrintingRoster, setIsPrintingRoster] = useState(false);

  // Excel Import & Export states
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelModalTab, setExcelModalTab] = useState('import');
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await teachersService.exportSupervisors();
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تصدير البيانات' : 'Failed to export data');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'supervisors_export.csv';
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
      const res = await teachersService.downloadSupervisorTemplate();
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تحميل النموذج' : 'Failed to download template');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'supervisors_template.xlsx';
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
      const data = await teachersService.importSupervisors(formData);
      clearInterval(interval);
      setImportProgress(100);
      if (data.success) {
        setImportSuccess(true);
        setImportStatus(data.message);
        if (data.errors && data.errors.length > 0) {
          setImportErrors(data.errors);
        }
        setToastMessage(data.message);
        fetchSupervisors(true);
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

  const handlePrintRoster = async () => {
    setIsPrintingRoster(true);
    try {
      let supervisorsToPrint = [];
      try {
        const res = await teachersService.getSupervisors('?per_page=1000');
        if (Array.isArray(res?.supervisors)) {
          supervisorsToPrint = res.supervisors;
        } else if (Array.isArray(res?.data?.supervisors)) {
          supervisorsToPrint = res.data.supervisors;
        } else if (Array.isArray(res?.data)) {
          supervisorsToPrint = res.data;
        } else if (Array.isArray(res)) {
          supervisorsToPrint = res;
        }
      } catch (e) {
        console.warn('API supervisors fetch failed, falling back to local state:', e);
      }

      if (supervisorsToPrint.length === 0 && supervisors.length > 0) {
        supervisorsToPrint = [...supervisors];
      }

      supervisorsToPrint = supervisorsToPrint.map(s => ({
        id: s.id,
        jobId: s.jobId || s.job_id || '',
        name: s.name_ar || s.name || '',
        phone: s.phone || s.password || '',
        classes: Array.isArray(s.classes) ? s.classes : []
      }));

      const normalizeArabic = (text) => {
        if (!text) return '';
        return text
          .replace(/[\u064B-\u065F\u0670]/g, '')
          .replace(/[إأآٱ]/g, 'ا')
          .replace(/ة/g, 'ه')
          .replace(/ى/g, 'ي')
          .trim();
      };

      supervisorsToPrint.sort((a, b) => {
        const normA = normalizeArabic(a.name || '');
        const normB = normalizeArabic(b.name || '');
        const cmp = normA.localeCompare(normB, 'ar');
        return cmp !== 0 ? cmp : (a.name || '').localeCompare(b.name || '', 'ar');
      });

      const todayStr = new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });

      let theadHtml = '';
      if (printRosterType === 'job_id') {
        theadHtml = `
          <tr>
            <th style="width: 42px;">م</th>
            <th style="width: 150px; text-align: center;">الرقم الوظيفي</th>
            <th style="text-align: right;">اسم مشرف التحضير</th>
          </tr>
        `;
      } else if (printRosterType === 'job_id_phone') {
        theadHtml = `
          <tr>
            <th style="width: 42px;">م</th>
            <th style="width: 150px; text-align: center;">الرقم الوظيفي</th>
            <th style="text-align: right;">اسم مشرف التحضير</th>
            <th style="width: 160px; text-align: center;">رقم التلفون</th>
          </tr>
        `;
      } else {
        theadHtml = `
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 120px; text-align: center;">الرقم الوظيفي</th>
            <th style="width: 190px; text-align: right;">اسم مشرف التحضير</th>
            <th style="width: 130px; text-align: center;">رقم التلفون</th>
            <th style="text-align: right;">الفصول والشعب المكلف بها</th>
          </tr>
        `;
      }

      let rowsHtml = '';
      if (supervisorsToPrint.length === 0) {
        const colSpanMap = {
          job_id: 3,
          job_id_phone: 4,
          job_id_phone_classes: 5
        };
        rowsHtml = `
          <tr>
            <td colspan="${colSpanMap[printRosterType] || 3}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد بيانات مشرفي تحضير مسجلة حالياً
            </td>
          </tr>
        `;
      } else {
        rowsHtml = supervisorsToPrint.map((s, idx) => {
          if (printRosterType === 'job_id') {
            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-code">${s.jobId}</td>
                <td class="col-name">${s.name}</td>
              </tr>
            `;
          } else if (printRosterType === 'job_id_phone') {
            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-code">${s.jobId}</td>
                <td class="col-name">${s.name}</td>
                <td class="col-phone">${s.phone}</td>
              </tr>
            `;
          } else {
            const classesText = s.classes && s.classes.length > 0
              ? s.classes.map(c => `<span class="cls-badge">${c}</span>`).join(' ')
              : '<span style="color:#94a3b8;font-style:italic;">غير مكلف بفصول</span>';
            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-code">${s.jobId}</td>
                <td class="col-name">${s.name}</td>
                <td class="col-phone">${s.phone}</td>
                <td class="col-classes">${classesText}</td>
              </tr>
            `;
          }
        }).join('');
      }

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>كشف مشرفي التحضير</title>
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
    font-weight: 700;
    color: #1e3a8a;
    line-height: 1.5;
  }
  .sr-header-school-ar {
    font-size: 12.5px;
    font-weight: 800;
    color: #0f2e5a;
  }
  .sr-header-logo {
    text-align: center;
  }
  .sr-header-logo img {
    height: 62px;
    width: auto;
    object-fit: contain;
  }
  .sr-header-en {
    text-align: left;
    direction: ltr;
    font-size: 10px;
    font-weight: 700;
    color: #1e3a8a;
    line-height: 1.5;
  }
  .sr-header-school-en {
    font-size: 11px;
    font-weight: 800;
    color: #0f2e5a;
  }
  .sr-title-bar {
    text-align: center;
    margin: 4px 0 10px;
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
    padding: 7px 10px;
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
  .col-phone {
    text-align: center;
    font-family: monospace;
    font-weight: 700;
    font-size: 11.5px;
    direction: ltr;
  }
  .col-classes {
    text-align: right;
    line-height: 1.6;
  }
  .cls-badge {
    display: inline-block;
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 1px 6px;
    margin: 2px;
    font-size: 10px;
    font-weight: 700;
    color: #1e293b;
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
        <div class="sr-meta-item">العام الدراسي: <strong>1447-1448هـ (2025-2026م)</strong></div>
        <div class="sr-meta-item">إجمالي مشرفي التحضير: <strong>${supervisorsToPrint.length} مشرف</strong></div>
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

      let iframe = document.getElementById('supervisors-print-frame');
      if (iframe) iframe.remove();
      iframe = document.createElement('iframe');
      iframe.id = 'supervisors-print-frame';
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

    setIsSaving(true);
    handleAddSupervisor(newSupervisor)
      .then((res) => {
        if (res && res.success) {
          setShowSupervisorModal(false);
          // Reset fields on success only
          setModalName('');
          setModalJobId('');
          setModalPhone('');
          setModalPhoto('');
          setModalClasses([]);
          setModalSelectedClass('');
          fetchSupervisors(qs);
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

    setIsSaving(true);
    handleEditSupervisor(updatedSupervisor, selectedSupervisorIdForEdit)
      .then((res) => {
        if (res && res.success) {
          setShowEditSupervisorModal(false);
          // Reset fields on success only
          setModalName('');
          setModalJobId('');
          setModalPhone('');
          setModalPhoto('');
          setModalClasses([]);
          setModalSelectedClass('');
          setSelectedSupervisorIdForEdit(null);
          fetchSupervisors(qs);
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
      onConfirm: () => {
        handleDeleteSupervisor(supervisorId)
          .then((res) => {
            if (res && res.success) {
              const nextQs = goToPrevIfEmpty(supervisors.length - 1);
              fetchSupervisors(nextQs);
            }
          });
      }
    });
  };

  return (
    <>
      <div className="section-card">
        <div className="section-card-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <h3 className="section-card-title headline-small" style={{ fontSize: '18px', margin: 0 }}>
            {lang === 'ar' ? 'إدارة مشرفي التحضير وفصول التكليف' : 'Prep Supervisors Management'}
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
        </div>

        {/* Search Box */}
        <div className="students-controls no-print" style={{ marginBottom: 'var(--space-md)', padding: '0 var(--space-md)' }}>
          <div className="search-box">
            <Search size={18} />
            <input 
              id="search-prep-supervisors"
              name="search"
              type="text"
              className="text-field"
              placeholder={lang === 'ar' ? 'البحث باسم المشرف، الرقم الوظيفي، أو الجوال...' : 'Search by supervisor name, job ID, or phone...'}
              value={searchQuery}
              aria-label={lang === 'ar' ? 'البحث باسم المشرف' : 'Search supervisors'}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="students-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th className="sticky-col-1">{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'}</th>
                <th className="sticky-col-2">{lang === 'ar' ? 'اسم المشرف' : 'Supervisor Name'}</th>
                <th>{lang === 'ar' ? 'الفصول المكلف بها للتحضير' : 'Assigned Classes'}</th>
                <th>{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'}</th>
                {(canAction('prepSupervisors', 'update') || canAction('prepSupervisors', 'delete')) && <th className="no-print">{t.action}</th>}
              </tr>
            </thead>
            <tbody>
              {supervisors.map((supervisor) => (
                <tr key={supervisor.jobId}>
                  <td className="sticky-col-1" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{supervisor.jobId}</td>
                  <td className="sticky-col-2" style={{ fontWeight: '600' }}>
                    {renderAvatar(supervisor.photo, "👩‍🏫")}
                    {lang === 'ar' ? supervisor.name : supervisor.nameEn}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxHeight: '54px', overflowY: 'auto' }}>
                      {supervisor.classes && supervisor.classes.length > 0 ? (
                        <>
                          {supervisor.classes.slice(0, 3).map((c, idx) => (
                            <span key={idx} className="chip" style={{ cursor: 'default', fontSize: '11px', padding: '2px 8px' }}>
                              {c}
                            </span>
                          ))}
                          {supervisor.classes.length > 3 && (
                            <span title={supervisor.classes.join(', ')} className="chip" style={{ cursor: 'help', fontSize: '11px', padding: '2px 8px', background: 'var(--color-primary-ui)', color: '#fff', fontWeight: 'bold' }}>
                              +{supervisor.classes.length - 3} {lang === 'ar' ? 'فصول أخرى' : 'more'}
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>—</span>
                      )}
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
        <div className="no-print" style={{ padding: '0 var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <PaginationBar
            page={page}
            lastPage={supervisorsPagination.lastPage}
            total={supervisorsPagination.total}
            from={supervisorsPagination.from}
            to={supervisorsPagination.to}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            loading={loading}
            lang={lang}
          />
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
                  <label htmlFor="add-prep-name" className="form-label">{lang === 'ar' ? 'اسم المشرف ثنائي أو ثلاثي' : 'Supervisor Name'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    id="add-prep-name"
                    name="name"
                    type="text" 
                    className="text-field"
                    placeholder={lang === 'ar' ? 'مثال: أ. منى الحربي' : 'e.g. Ms. Mona Al-Harbi'}
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label htmlFor="add-prep-job-id" className="form-label">{lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      id="add-prep-job-id"
                      name="job_id"
                      type="text" 
                      className="text-field"
                      placeholder="P102"
                      value={modalJobId}
                      onChange={(e) => setModalJobId(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="add-prep-phone" className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      id="add-prep-phone"
                      name="phone"
                      type="text" 
                      className="text-field"
                      placeholder="7xxxxxxxx"
                      value={modalPhone}
                      onChange={(e) => setModalPhone(e.target.value)}
                      required
                      autoComplete="tel"
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
                        id="add-prep-assigned-class"
                        name="assigned_class"
                        aria-label={lang === 'ar' ? 'اختر الفصل الدراسي للتكليف' : 'Select assigned class'}
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
                <button type="button" className="btn-elevated" onClick={() => setShowSupervisorModal(false)} style={{ height: '48px' }} disabled={isSaving}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
                </button>
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
                  <label htmlFor="edit-prep-name" className="form-label">{lang === 'ar' ? 'اسم المشرف ثنائي أو ثلاثي' : 'Supervisor Name'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    id="edit-prep-name"
                    name="name"
                    type="text" 
                    className="text-field"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label htmlFor="edit-prep-job-id" className="form-label">
                      {lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginInlineStart: '6px' }}>🔒 {lang === 'ar' ? '(ثابت لا يمكن تعديله)' : '(Read-Only)'}</span>
                    </label>
                    <input 
                      id="edit-prep-job-id"
                      name="job_id"
                      type="text" 
                      className="text-field"
                      value={modalJobId}
                      readOnly={true}
                      disabled={true}
                      tabIndex={-1}
                      style={{ 
                        opacity: 0.7, 
                        cursor: 'not-allowed', 
                        backgroundColor: '#e2e8f0', 
                        color: '#334155', 
                        fontWeight: 'bold', 
                        pointerEvents: 'none', 
                        userSelect: 'none',
                        border: '1.5px solid #cbd5e1'
                      }}
                      title={lang === 'ar' ? 'الرقم الوظيفي للقراءة فقط وغير قابل للتعديل' : 'Job ID is read-only'}
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-prep-phone" className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      id="edit-prep-phone"
                      name="phone"
                      type="text" 
                      className="text-field"
                      value={modalPhone}
                      onChange={(e) => setModalPhone(e.target.value)}
                      required
                      autoComplete="tel"
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
                        id="edit-prep-assigned-class"
                        name="assigned_class"
                        aria-label={lang === 'ar' ? 'اختر الفصل الدراسي للتكليف' : 'Select assigned class'}
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
                <button type="button" className="btn-elevated" onClick={() => setShowEditSupervisorModal(false)} style={{ height: '48px' }} disabled={isSaving}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: PRINT ROSTER */}
      {showPrintModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '580px' }}>
            <header className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={20} color="#d97706" />
                <span>{lang === 'ar' ? 'طباعة كشوفات مشرفي التحضير الجاهزة' : 'Print Prep Supervisors Rosters'}</span>
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowPrintModal(false)}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', marginBottom: '10px', display: 'block' }}>
                  {lang === 'ar' ? 'اختر نوع الكشف المطلوب للطباعة:' : 'Select Roster Template:'}
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    {
                      id: 'job_id',
                      title: '1. كشف بأسماء مشرفي التحضير مع الأرقام الوظيفية',
                      desc: 'يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، واسم مشرف التحضير'
                    },
                    {
                      id: 'job_id_phone',
                      title: '2. كشف بأسماء مشرفي التحضير مع الأرقام الوظيفية وأرقام التلفونات',
                      desc: 'يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم مشرف التحضير، ورقم التلفون'
                    },
                    {
                      id: 'job_id_phone_classes',
                      title: '3. كشف بأسماء مشرفي التحضير مع الأرقام الوظيفية وأرقام التلفونات والفصول والشعب المكلف بها',
                      desc: 'يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم مشرف التحضير، رقم التلفون، والفصول والشعب المكلف بها'
                    }
                  ].map((opt) => {
                    const isSelected = printRosterType === opt.id;
                    return (
                      <label
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #d97706' : '1px solid var(--color-border, #cbd5e1)',
                          backgroundColor: isSelected ? '#fffbeb' : 'var(--color-bg-secondary, #f8fafc)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="radio"
                          name="supervisor_print_roster_type"
                          value={opt.id}
                          checked={isSelected}
                          onChange={(e) => setPrintRosterType(e.target.value)}
                          style={{ marginTop: '4px', accentColor: '#d97706', width: '16px', height: '16px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: '13.5px', color: isSelected ? '#92400e' : 'var(--color-text-primary, #0f172a)' }}>
                            {opt.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary, #64748b)', marginTop: '4px' }}>
                            {opt.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
              <button
                type="button"
                className="btn-filled"
                onClick={handlePrintRoster}
                disabled={isPrintingRoster}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#d97706',
                  borderColor: '#d97706',
                  color: '#fff',
                  padding: '8px 20px'
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

      {/* MODAL DIALOG: EXCEL IMPORT & EXPORT */}
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
                {lang === 'ar' ? '📥 استيراد مشرفي التحضير' : '📥 Import Prep Supervisors'}
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
                      onClick={() => document.getElementById('supervisor-excel-file-uploader').click()}
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
                        id="supervisor-excel-file-uploader"
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
                      {isImporting ? (lang === 'ar' ? 'جاري الاستيراد...' : 'Importing...') : (lang === 'ar' ? 'بدء الاستيراد' : 'Start Import')}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '16px', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--color-text)' }}>
                      {lang === 'ar' ? '1. تحميل نموذج Excel فارغ' : '1. Download Empty Excel Template'}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
                      {lang === 'ar' ? 'قم بتحميل القالب لتعبئة بيانات مشرفي التحضير (الرقم الوظيفي، الاسم، رقم الجوال، والفصول المكلف بها).' : 'Download template to fill in prep supervisors data.'}
                    </p>
                    <button
                      type="button"
                      className="btn-accent"
                      onClick={handleDownloadTemplate}
                      disabled={isLoadingTemplate}
                      style={{ height: '42px', padding: '0 20px', backgroundColor: '#31859C', borderColor: '#31859C' }}
                    >
                      {isLoadingTemplate ? (lang === 'ar' ? 'جاري التحميل...' : 'Downloading...') : (lang === 'ar' ? 'تحميل القالب (.xlsx)' : 'Download Template (.xlsx)')}
                    </button>
                  </div>

                  <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '16px', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--color-text)' }}>
                      {lang === 'ar' ? '2. تصدير بيانات مشرفي التحضير الحالية' : '2. Export Current Prep Supervisors Data'}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
                      {lang === 'ar' ? 'تصدير كافة مشرفي التحضير المسجلين في النظام مع الفصول المكلفين بها بصيغة CSV تدعم اللغة العربية.' : 'Export all registered prep supervisors into an Arabic-friendly CSV file.'}
                    </p>
                    <button
                      type="button"
                      className="btn-filled"
                      onClick={handleExport}
                      disabled={isExporting}
                      style={{ height: '42px', padding: '0 20px', backgroundColor: '#31859C', borderColor: '#31859C' }}
                    >
                      {isExporting ? (lang === 'ar' ? 'جاري التصدير...' : 'Exporting...') : (lang === 'ar' ? 'تصدير البيانات' : 'Export Data')}
                    </button>
                  </div>

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
    </>
  );
}
