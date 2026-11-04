import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTeachers } from '../contexts/Teachers/useTeachers';
import { useClasses } from '../contexts/Classes/useClasses';
import { useSubjects } from '../contexts/Subjects/useSubjects';
import { teachersService } from '../services/teachers/teachers.service';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';
import { Plus, Search, X, Trash2, Edit3, Download, Upload, FileSpreadsheet, Printer } from 'lucide-react';
import { SLOGAN_BASE64 } from '../assets/sloganBase64';

export default function TeachersTab() {
  const {
    lang, t, renderAvatar,
    setToastMessage, canAction, triggerConfirm
  } = useApp();

  const { classes, fetchClasses } = useClasses();
  const { subjects, fetchSubjects } = useSubjects();

  const {
    teachers,
    loading,
    teachersPagination,
    fetchTeachers,
    handleAddTeacher,
    handleEditTeacher,
    handleDeleteTeacher
  } = useTeachers();

  const {
    page,
    perPage,
    search,
    setPage,
    setPerPage,
    setSearch,
    buildQueryString,
    goToPrevIfEmpty,
  } = usePagination({
    moduleKey: 'teachers',
  });

  const qs = buildQueryString();

  const onDeleteTeacher = (teacher) => {
    triggerConfirm({
      title: lang === 'ar' ? 'حذف المعلم' : 'Delete Teacher',
      message: lang === 'ar'
        ? `هل أنت متأكد من حذف المعلم "${teacher.name}" نهائياً من النظام؟`
        : `Are you sure you want to permanently delete teacher "${teacher.name}"?`,
      type: 'danger',
      onConfirm: () => {
        handleDeleteTeacher(teacher.id).then((res) => {
          if (res && res.success) {
            const nextQs = goToPrevIfEmpty(teachers.length - 1);
            fetchTeachers(nextQs);
          }
        });
      }
    });
  };

  useEffect(() => {
    fetchTeachers(qs);
  }, [fetchTeachers, qs]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Print Roster Modal States for Teachers
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printRosterType, setPrintRosterType] = useState('with_job_id');
  const [printClassId, setPrintClassId] = useState('all');
  const [isPrintingRoster, setIsPrintingRoster] = useState(false);

  const handlePrintRoster = async () => {
    setIsPrintingRoster(true);
    try {
      let teachersToPrint = [];
      const useClassFilter = printRosterType === 'with_full_assignments' && printClassId && printClassId !== 'all';
      const numericClassId = useClassFilter ? String(printClassId).replace(/\D/g, '') : '';

      try {
        const query = numericClassId ? `?class_id=${numericClassId}&per_page=1000` : '?per_page=1000';
        const res = await teachersService.getTeachers(query);
        if (Array.isArray(res?.teachers)) {
          teachersToPrint = res.teachers;
        } else if (Array.isArray(res?.data?.teachers)) {
          teachersToPrint = res.data.teachers;
        } else if (Array.isArray(res?.data)) {
          teachersToPrint = res.data;
        } else if (Array.isArray(res)) {
          teachersToPrint = res;
        }
      } catch (e) {
        console.warn('API teachers fetch failed, falling back to local state:', e);
      }

      if (teachersToPrint.length === 0 && teachers.length > 0) {
        teachersToPrint = [...teachers];
      }

      // Normalize teacher objects and group assignments per class/section
      teachersToPrint = teachersToPrint.map((tObj) => {
        const jobId = tObj.job_id || tObj.jobId || '';
        const name = tObj.name_ar || tObj.name || tObj.name_en || '';
        const phone = tObj.phone || '';
        const classSubjectMap = new Map();

        if (Array.isArray(tObj.assignments)) {
          tObj.assignments.forEach((assign) => {
            const sc = assign.school_class;
            const cId = sc ? String(sc.id) : (assign.class_id ? String(assign.class_id) : '');
            if (numericClassId && cId && cId !== String(numericClassId)) {
              return;
            }
            const className = sc
              ? (sc.name_ar || sc.name || `${sc.grade_ar || ''} - ${sc.section_ar || ''}`.trim())
              : '';
            const sub = assign.subject;
            const subjectName = sub ? (sub.name_ar || sub.name || '') : '';
            if (className) {
              if (!classSubjectMap.has(className)) {
                classSubjectMap.set(className, []);
              }
              if (subjectName && !classSubjectMap.get(className).includes(subjectName)) {
                classSubjectMap.get(className).push(subjectName);
              }
            }
          });
        } else if (Array.isArray(tObj.teachingAssignments)) {
          tObj.teachingAssignments.forEach((assign) => {
            const cId = assign.classId ? String(assign.classId).replace(/\D/g, '') : '';
            if (numericClassId && cId && cId !== String(numericClassId)) {
              return;
            }
            const className = assign.class || '';
            const subjectName = assign.subject || '';
            if (className) {
              if (!classSubjectMap.has(className)) {
                classSubjectMap.set(className, []);
              }
              if (subjectName && !classSubjectMap.get(className).includes(subjectName)) {
                classSubjectMap.get(className).push(subjectName);
              }
            }
          });
        }

        const classGroups = Array.from(classSubjectMap.entries()).map(([clsName, subs]) => ({
          className: clsName,
          subjects: subs
        }));

        return {
          id: tObj.id,
          jobId,
          name,
          phone,
          classGroups
        };
      });

      if (numericClassId) {
        const selectedClassObj = classes.find((c) => {
          const cNum = typeof c.id === 'string' && c.id.startsWith('cls-') ? c.id.replace('cls-', '') : (c.numericId || c.id);
          return String(cNum) === String(numericClassId);
        });
        const targetClassName = selectedClassObj ? selectedClassObj.name : '';
        if (targetClassName) {
          teachersToPrint = teachersToPrint
            .map((tObj) => ({
              ...tObj,
              classGroups: tObj.classGroups.filter((cg) => cg.className === targetClassName)
            }))
            .filter((tObj) => tObj.classGroups.length > 0);
        }
      }

      const normalizeArabic = (text) => {
        if (!text) return '';
        return text
          .replace(/[\u064B-\u065F\u0670]/g, '')
          .replace(/[إأآٱ]/g, 'ا')
          .replace(/ة/g, 'ه')
          .replace(/ى/g, 'ي')
          .trim();
      };

      teachersToPrint.sort((a, b) => {
        const normA = normalizeArabic(a.name || '');
        const normB = normalizeArabic(b.name || '');
        const cmp = normA.localeCompare(normB, 'ar');
        return cmp !== 0 ? cmp : (a.name || '').localeCompare(b.name || '', 'ar');
      });

      const selectedClassObj = classes.find((c) => {
        const cNum = typeof c.id === 'string' && c.id.startsWith('cls-') ? c.id.replace('cls-', '') : (c.numericId || c.id);
        return String(cNum) === String(numericClassId);
      });
      const classLabel = selectedClassObj ? selectedClassObj.name : 'جميع الفصول والشعب';

      const todayStr = new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });

      let theadHtml = '';
      if (printRosterType === 'with_job_id') {
        theadHtml = `
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 135px; text-align: center;">الرقم الوظيفي</th>
            <th style="text-align: right;">اسم المعلم</th>
            <th style="width: 220px; text-align: right;">الملاحظات</th>
          </tr>
        `;
      } else if (printRosterType === 'with_phone') {
        theadHtml = `
          <tr>
            <th style="width: 38px;">م</th>
            <th style="text-align: right;">اسم المعلم</th>
            <th style="width: 145px; text-align: center;">رقم التلفون</th>
            <th style="width: 220px; text-align: right;">الملاحظات</th>
          </tr>
        `;
      } else if (printRosterType === 'with_job_id_phone') {
        theadHtml = `
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 130px; text-align: center;">الرقم الوظيفي</th>
            <th style="text-align: right;">اسم المعلم</th>
            <th style="width: 135px; text-align: center;">رقم التلفون</th>
            <th style="width: 195px; text-align: right;">الملاحظات</th>
          </tr>
        `;
      } else {
        theadHtml = `
          <tr>
            <th style="width: 34px;">م</th>
            <th style="width: 105px; text-align: center;">الرقم الوظيفي</th>
            <th style="width: 165px; text-align: right;">اسم المعلم</th>
            <th style="width: 110px; text-align: center;">رقم التلفون</th>
            <th style="width: 130px; text-align: center;">الصف والشعبة</th>
            <th style="text-align: right;">المواد المسندة</th>
            <th style="width: 135px; text-align: right;">الملاحظات</th>
          </tr>
        `;
      }

      let rowsHtml = '';
      if (teachersToPrint.length === 0) {
        const colSpanMap = {
          with_job_id: 4,
          with_phone: 4,
          with_job_id_phone: 5,
          with_full_assignments: 7
        };
        rowsHtml = `
          <tr>
            <td colspan="${colSpanMap[printRosterType] || 4}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد بيانات معلمين مسجلة لهذا النطاق
            </td>
          </tr>
        `;
      } else {
        rowsHtml = teachersToPrint.map((tch, idx) => {
          if (printRosterType === 'with_job_id') {
            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-code">${tch.jobId}</td>
                <td class="col-name">${tch.name}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;
          } else if (printRosterType === 'with_phone') {
            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-name">${tch.name}</td>
                <td class="col-phone">${tch.phone}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;
          } else if (printRosterType === 'with_job_id_phone') {
            return `
              <tr>
                <td class="col-num">${idx + 1}</td>
                <td class="col-code">${tch.jobId}</td>
                <td class="col-name">${tch.name}</td>
                <td class="col-phone">${tch.phone}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;
          } else {
            const groups = tch.classGroups && tch.classGroups.length > 0
              ? tch.classGroups
              : [{ className: 'غير مكلف بفصول', subjects: [] }];
            const rowSpan = groups.length;

            return groups.map((grp, gIdx) => {
              const subjectsText = grp.subjects && grp.subjects.length > 0
                ? grp.subjects.join('، ')
                : '—';
              if (gIdx === 0) {
                return `
                  <tr>
                    <td class="col-num" rowspan="${rowSpan}">${idx + 1}</td>
                    <td class="col-code" rowspan="${rowSpan}">${tch.jobId}</td>
                    <td class="col-name" rowspan="${rowSpan}">${tch.name}</td>
                    <td class="col-phone" rowspan="${rowSpan}">${tch.phone}</td>
                    <td style="text-align:center;font-weight:700;font-size:11px;">${grp.className}</td>
                    <td style="text-align:right;font-weight:600;font-size:11px;">${subjectsText}</td>
                    <td class="col-notes">&nbsp;</td>
                  </tr>
                `;
              } else {
                return `
                  <tr>
                    <td style="text-align:center;font-weight:700;font-size:11px;">${grp.className}</td>
                    <td style="text-align:right;font-weight:600;font-size:11px;">${subjectsText}</td>
                    <td class="col-notes">&nbsp;</td>
                  </tr>
                `;
              }
            }).join('');
          }
        }).join('');
      }

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>كشف المعلمين</title>
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
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    vertical-align: middle;
  }
  table.roster-table tbody tr:nth-child(even) {
    background-color: #f8fafc;
  }
  .col-num {
    width: 36px;
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
        ${useClassFilter ? `<div class="sr-meta-item">الصف والشعبة: <strong>${classLabel}</strong></div>` : ''}
        <div class="sr-meta-item">العام الدراسي: <strong>1447-1448هـ (2025-2026م)</strong></div>
        <div class="sr-meta-item">إجمالي المعلمين: <strong>${teachersToPrint.length} معلم</strong></div>
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

      let iframe = document.getElementById('teachers-print-frame');
      if (iframe) iframe.remove();
      iframe = document.createElement('iframe');
      iframe.id = 'teachers-print-frame';
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', right: lang === 'ar' ? '12px' : 'auto', left: lang === 'ar' ? 'auto' : '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input
              id="search-teachers"
              name="search"
              type="text"
              className="text-field"
              style={{ paddingRight: lang === 'ar' ? '36px' : '12px', paddingLeft: lang === 'ar' ? '12px' : '36px', height: '40px', fontSize: '13px' }}
              placeholder={lang === 'ar' ? 'البحث عن معلم بالاسم أو الرقم الوظيفي...' : 'Search teacher by name or job ID...'}
              value={search}
              aria-label={lang === 'ar' ? 'البحث عن معلمين' : 'Search teachers'}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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

      <div className="students-table-container responsive-hide-on-mobile" style={{ width: '100%', overflowX: 'auto' }}>
        <table className="students-table" style={{ width: '100%', minWidth: '100%' }}>
          <thead>
            <tr>
              <th className="sticky-col-1" style={{ width: '95px', whiteSpace: 'nowrap' }}>{lang === 'ar' ? 'الرقم الوظيفي' : 'Job ID'}</th>
              <th className="sticky-col-2" style={{ minWidth: '140px' }}>{t.teacherName}</th>
              <th style={{ maxWidth: '170px' }}>{t.subject}</th>
              <th style={{ maxWidth: '160px' }}>{t.assignedClasses}</th>
              <th style={{ width: '100px' }}>{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'}</th>
              <th style={{ maxWidth: '100px' }}>{lang === 'ar' ? 'عنوان السكن' : 'Home Address'}</th>
              <th style={{ width: '75px', textAlign: 'center' }}>{t.gradesEntered}</th>
              <th style={{ width: '75px', textAlign: 'center' }}>{t.assignmentsPublished}</th>
              <th className="no-print" style={{ width: '85px', textAlign: 'center' }}>{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="sticky-col-1" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '12px' }}>{teacher.jobId || `T${teacher.id}`}</td>
                  <td className="sticky-col-2" style={{ fontWeight: '600', fontSize: '13px' }}>
                    {renderAvatar(teacher.photo, "👨‍🏫")}
                    {lang === 'ar' ? teacher.name : teacher.nameEn}
                  </td>
                  <td style={{ whiteSpace: 'normal', maxWidth: '170px' }}>
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', maxHeight: '54px', overflowY: 'auto' }}>
                        {teacher.subjects.slice(0, 3).map((sub, idx) => (
                          <span key={idx} style={{
                            padding: '2px 7px',
                            background: 'rgba(30, 80, 142, 0.08)',
                            color: 'var(--color-primary-ui)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            lineHeight: '1.3'
                          }}>
                            {sub}
                          </span>
                        ))}
                        {teacher.subjects.length > 3 && (
                          <span title={teacher.subjects.join(', ')} style={{
                            padding: '2px 7px',
                            background: 'rgba(30, 80, 142, 0.15)',
                            color: 'var(--color-primary-ui)',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: '700',
                            cursor: 'help'
                          }}>
                            +{teacher.subjects.length - 3} {lang === 'ar' ? 'أخرى' : 'more'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{
                        padding: '2px 7px',
                        background: 'rgba(30, 80, 142, 0.08)',
                        color: 'var(--color-primary-ui)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {lang === 'ar' ? teacher.subject : teacher.subjectEn}
                      </span>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'normal', maxWidth: '180px' }}>
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', maxHeight: '54px', overflowY: 'auto' }}>
                      {teacher.classes && teacher.classes.length > 0 ? (
                        <>
                          {teacher.classes.slice(0, 3).map((c, idx) => (
                            <span key={idx} className="chip" style={{ cursor: 'default', fontSize: '10px', padding: '1px 6px', lineHeight: '1.3' }}>
                              {c}
                            </span>
                          ))}
                          {teacher.classes.length > 3 && (
                            <span title={teacher.classes.join(', ')} className="chip" style={{ cursor: 'help', fontSize: '10px', padding: '1px 6px', lineHeight: '1.3', background: 'var(--color-primary-ui)', color: '#fff', fontWeight: 'bold' }}>
                              +{teacher.classes.length - 3} {lang === 'ar' ? 'فصول أخرى' : 'more'}
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{teacher.phone || '—'}</td>
                  <td style={{ fontSize: '12px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teacher.address || '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', textAlign: 'center', fontSize: '12px' }}>{teacher.gradesEntered} %</td>
                  <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'center', fontSize: '12px' }}>{teacher.assignments}</td>
                  <td className="no-print" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {canAction('teachers', 'update') && (
                        <button 
                          className="btn-filled"
                          style={{
                            padding: '6px 14px',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            minHeight: '34px',
                            boxShadow: 'var(--shadow-sm)'
                          }}
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
                          title={t.editBtn}
                        >
                          <Edit3 size={15} />
                          <span>{t.editBtn}</span>
                        </button>
                      )}

                      {canAction('teachers', 'delete') && (
                        <button 
                          type="button"
                          style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            minHeight: '34px',
                            border: '1px solid rgba(220, 38, 38, 0.25)',
                            background: 'rgba(220, 38, 38, 0.08)',
                            color: '#dc2626',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.16)';
                            e.currentTarget.style.borderColor = '#dc2626';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.25)';
                          }}
                          onClick={() => onDeleteTeacher(teacher)}
                          title={lang === 'ar' ? 'حذف المعلم' : 'Delete Teacher'}
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

      {/* Mobile Teacher Cards View (Mobile-First / Touch-First System) */}
      <div className="teacher-mobile-cards-grid no-print">
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <div key={teacher.id} className="teacher-mobile-card">
              <div className="teacher-card-top">
                <div className="teacher-card-avatar">
                  {renderAvatar(teacher.photo, "👨‍🏫")}
                </div>
                <div className="teacher-card-identity">
                  <h4 className="teacher-card-name">
                    {lang === 'ar' ? teacher.name : (teacher.nameEn || teacher.name)}
                  </h4>
                  <div className="teacher-card-badges">
                    <span className="teacher-job-badge">{teacher.jobId || `T${teacher.id}`}</span>
                    <span className="teacher-subject-badge">
                      {lang === 'ar' ? (teacher.subject || 'معلم') : (teacher.subjectEn || 'Teacher')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="teacher-card-body">
                <div className="teacher-card-info-row">
                  <span className="info-label">📱 {lang === 'ar' ? 'رقم الجوال:' : 'Phone:'}</span>
                  {teacher.phone ? (
                    <a href={`tel:${teacher.phone}`} className="info-value-phone">{teacher.phone}</a>
                  ) : (
                    <span className="info-value-phone" style={{ opacity: 0.5 }}>—</span>
                  )}
                </div>
                <div className="teacher-card-info-row">
                  <span className="info-label">🏠 {lang === 'ar' ? 'العنوان:' : 'Address:'}</span>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{teacher.address || '—'}</span>
                </div>
                <div className="teacher-card-info-row">
                  <span className="info-label">📊 {lang === 'ar' ? 'نسبة رصد الدرجات:' : 'Grades:'}</span>
                  <span className="info-value-grade">{teacher.gradesEntered}%</span>
                </div>

                <div className="teacher-card-classes-section">
                  <span className="classes-title">🎯 {lang === 'ar' ? 'الفصول المكلف بها:' : 'Assigned Classes:'}</span>
                  <div className="classes-chips-wrapper">
                    {teacher.classes && teacher.classes.length > 0 ? (
                      teacher.classes.map((c, idx) => (
                        <span key={idx} className="teacher-class-pill">{c}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>—</span>
                    )}
                  </div>
                </div>
              </div>

              {(canAction('teachers', 'update') || canAction('teachers', 'delete')) && (
                <div className="teacher-card-actions">
                  {canAction('teachers', 'update') && (
                    <button
                      type="button"
                      className="teacher-action-btn edit-btn"
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
                      }}
                    >
                      <Edit3 size={16} />
                      <span>{t.editBtn}</span>
                    </button>
                  )}
                  {canAction('teachers', 'delete') && (
                    <button
                      type="button"
                      className="teacher-action-btn delete-btn"
                      onClick={() => onDeleteTeacher(teacher)}
                    >
                      <Trash2 size={16} />
                      <span>{lang === 'ar' ? 'حذف' : 'Delete'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: '32px 16px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>📂</span>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>
              {lang === 'ar' ? 'لا يوجد معلمون مسجلون حالياً' : 'No teachers registered yet'}
            </span>
          </div>
        )}
      </div>

      <PaginationBar
        page={teachersPagination.currentPage || page}
        lastPage={teachersPagination.lastPage || 1}
        total={teachersPagination.total || teachers.length}
        from={teachersPagination.from || 1}
        to={teachersPagination.to || teachers.length}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        loading={loading}
        lang={lang}
      />

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
                       onClick={() => document.getElementById('add-teacher-photo-input').click()}
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
                      id="add-teacher-photo-input"
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
                  <label htmlFor="add-teacher-name" className="form-label">{t.formTeacherName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    id="add-teacher-name"
                    name="name"
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
                    <label htmlFor="add-teacher-job-id" className="form-label">
                      {lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <input 
                      id="add-teacher-job-id"
                      name="job_id"
                      type="text" 
                      className="text-field"
                      placeholder={lang === 'ar' ? 'مثال: T101 أو 101111' : 'e.g. T101 or 101111'}
                      value={modalTeacherJobId}
                      onChange={(e) => setModalTeacherJobId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="add-teacher-phone" className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      id="add-teacher-phone"
                      name="phone"
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
                  <label htmlFor="add-teacher-address" className="form-label">{lang === 'ar' ? 'عنوان السكن' : 'Home Address'}</label>
                  <input 
                    id="add-teacher-address"
                    name="address"
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
                      <label htmlFor="edit-teacher-subject" className="form-label" style={{ fontSize: '11px' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</label>
                      <select 
                        id="edit-teacher-subject"
                        name="subject"
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
                      <label htmlFor="edit-teacher-class" className="form-label" style={{ fontSize: '11px' }}>{lang === 'ar' ? 'الفصل الدراسي' : 'Class'}</label>
                      <select 
                        id="edit-teacher-class"
                        name="class"
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
                  <label htmlFor="edit-teacher-name" className="form-label">{t.formTeacherName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input id="edit-teacher-name" name="name" type="text" className="text-field" value={modalTeacherName} onChange={(e) => setModalTeacherName(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label htmlFor="edit-teacher-job-id" className="form-label">
                      {lang === 'ar' ? 'الرقم الوظيفي (Job ID)' : 'Job ID'} <span style={{ color: 'var(--color-error)' }}>*</span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginInlineStart: '6px' }}>🔒 {lang === 'ar' ? '(ثابت لا يمكن تعديله)' : '(Read-Only)'}</span>
                    </label>
                    <input 
                      id="edit-teacher-job-id" 
                      name="job_id" 
                      type="text" 
                      className="text-field" 
                      value={modalTeacherJobId} 
                      readOnly={true}
                      disabled={true}
                      tabIndex={-1}
                      style={{ 
                        opacity: 0.75, 
                        cursor: 'not-allowed', 
                        backgroundColor: '#e2e8f0', 
                        color: '#334155', 
                        fontWeight: 'bold', 
                        pointerEvents: 'none', 
                        userSelect: 'none',
                        border: '1.5px solid #cbd5e1'
                      }}
                      title={lang === 'ar' ? 'الرقم الوظيفي للقراءة فقط وغير قابل للتعديل' : 'Job ID is read-only'}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-teacher-phone" className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone Number'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input id="edit-teacher-phone" name="phone" type="text" className="text-field" value={modalTeacherPhone} onChange={(e) => setModalTeacherPhone(e.target.value)} placeholder="7XXXXXXXX" required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-teacher-address" className="form-label">{lang === 'ar' ? 'عنوان السكن' : 'Home Address'}</label>
                  <input id="edit-teacher-address" name="address" type="text" className="text-field" value={modalTeacherAddress} onChange={(e) => setModalTeacherAddress(e.target.value)} placeholder={lang === 'ar' ? 'مثال: صنعاء، شارع حدة' : 'e.g. Sanaa, Hadda St'} />
                </div>
                
                <div style={{ padding: '14px', background: 'rgba(30, 80, 142, 0.03)', border: '1px solid var(--color-border)', borderRadius: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary-ui)' }}>
                    🎯 {lang === 'ar' ? 'تكليفات تدريس المناهج بالفصول' : 'Class-Subject Teaching Assignments'}
                  </h4>

                  {/* Add Row Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr auto', gap: '8px', alignItems: 'end', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="add-teacher-subject" className="form-label" style={{ fontSize: '11px' }}>{lang === 'ar' ? 'المادة الدراسية' : 'Subject'}</label>
                      <select 
                        id="add-teacher-subject"
                        name="subject"
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
                      <label htmlFor="add-teacher-class" className="form-label" style={{ fontSize: '11px' }}>{lang === 'ar' ? 'الفصل الدراسي' : 'Class'}</label>
                      <select 
                        id="add-teacher-class"
                        name="class"
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

      {showPrintModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '600px', width: '92%' }}>
            <header className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={20} color="#d97706" />
                <span>{lang === 'ar' ? 'طباعة كشوفات المعلمين الجاهزة' : 'Print Teachers Rosters'}</span>
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
                      id: 'with_job_id',
                      title: '1. كشف بأسماء المعلمين مع الأرقام الوظيفية وعمود الملاحظات',
                      desc: 'يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم المعلم، وعمود الملاحظات'
                    },
                    {
                      id: 'with_phone',
                      title: '2. كشف بأسماء المعلمين مع أرقام التلفونات وعمود الملاحظات',
                      desc: 'يحتوي على: الرقم التسلسلي (م)، اسم المعلم، رقم التلفون، وعمود الملاحظات'
                    },
                    {
                      id: 'with_job_id_phone',
                      title: '3. كشف بأسماء المعلمين مع أرقام التلفونات والأرقام الوظيفية مع عمود الملاحظات',
                      desc: 'يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم المعلم، رقم التلفون، وعمود الملاحظات'
                    },
                    {
                      id: 'with_full_assignments',
                      title: '4. كشف بأسماء المعلمين مع أرقام التلفونات والأرقام الوظيفية والفصول والشعب المكلفون بها مع المواد وعمود الملاحظات لكل صف وشعبة',
                      desc: 'يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم المعلم، رقم التلفون، الصف والشعبة، المواد المسندة، وعمود الملاحظات لكل صف وشعبة'
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
                          name="teacher_print_roster_type"
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

              {printRosterType === 'with_full_assignments' && (
                <div className="form-group" style={{ marginBottom: 0, padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <label className="form-label" style={{ fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    {lang === 'ar' ? 'تحديد الصف والشعبة (اختياري):' : 'Filter by Class & Section (Optional):'}
                  </label>
                  <select
                    className="select-field"
                    value={printClassId}
                    onChange={(e) => setPrintClassId(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="all">{lang === 'ar' ? '-- جميع الصفوف والشعب --' : '-- All Classes & Sections --'}</option>
                    {classes.map((cls) => {
                      const numId = typeof cls.id === 'string' && cls.id.startsWith('cls-') ? cls.id.replace('cls-', '') : (cls.numericId || cls.id);
                      return (
                        <option key={cls.id} value={String(numId)}>
                          {lang === 'ar' ? cls.name : (cls.nameEn || cls.name)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
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
    </div>
  );
}
