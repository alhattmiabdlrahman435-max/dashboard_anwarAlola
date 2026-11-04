import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTeachers } from '../contexts/Teachers/useTeachers';
import { useStudents } from '../contexts/Students/useStudents';
import { useClasses } from '../contexts/Classes/useClasses';
import { useSubjects } from '../contexts/Subjects/useSubjects';
import { classesService } from '../services/classes/classes.service';
import { Plus, Search, X, Printer, Upload } from 'lucide-react';
import { teachersService } from '../services/teachers/teachers.service';
import { SLOGAN_BASE64 } from '../assets/sloganBase64';

export default function ClassesTab() {
  const {
    lang,
    t,
    setToastMessage,
    triggerConfirm,
    renderAvatar,
    canAction,
  } = useApp();

  const { subjects, fetchSubjects } = useSubjects();

  const {
    classes,
    setClasses,
    availableGrades,
    availableSections,
    fetchClasses,
  } = useClasses();

  const { teachers, fetchTeachers } = useTeachers();
  const { students, fetchStudents } = useStudents();

  useEffect(() => {
    fetchClasses(true);
    fetchTeachers('?per_page=1000');
    fetchStudents();
    fetchSubjects(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Local state for searching & modals
  const [isSaving, setIsSaving] = useState(false);
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  
  // Modals visibility
  const [showClassModal, setShowClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showClassDetailsModal, setShowClassDetailsModal] = useState(false);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState(null);
  const [selectedClassIdForEdit, setSelectedClassIdForEdit] = useState(null);

  // Form Fields
  // eslint-disable-next-line no-unused-vars
  const [modalClassNameAr, setModalClassNameAr] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [modalClassNameEn, setModalClassNameEn] = useState('');
  const [modalClassGrade, setModalClassGrade] = useState('الصف الأول');
  const [modalClassGradeEn, setModalClassGradeEn] = useState('Grade 1');
  const [modalClassSection, setModalClassSection] = useState('أ');
  const [modalClassSectionEn, setModalClassSectionEn] = useState('A');
  const [modalClassSubjects, setModalClassSubjects] = useState([]);

  // Print Roster Modal States
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printRosterType, setPrintRosterType] = useState('classes_students_count');
  const [printClassId, setPrintClassId] = useState('all');
  const [isPrintingRoster, setIsPrintingRoster] = useState(false);

  // Excel Import & Export Modal States
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
      const res = await classesService.exportClasses();
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تصدير البيانات' : 'Failed to export data');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'classes_export.csv';
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
      const res = await classesService.downloadTemplate();
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تحميل النموذج' : 'Failed to download template');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'classes_template.xlsx';
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
      const data = await classesService.importClasses(formData);
      clearInterval(interval);
      setImportProgress(100);
      if (data.success) {
        setImportSuccess(true);
        setImportStatus(data.message);
        if (data.errors && data.errors.length > 0) {
          setImportErrors(data.errors);
        }
        setToastMessage(data.message);
        fetchClasses(true);
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
      let rawClassesList = [];
      let allTeachersList = [...teachers];

      try {
        const res = await classesService.getClasses();
        if (Array.isArray(res?.classes)) {
          rawClassesList = res.classes;
        }
      } catch (e) {
        console.warn('API classes fetch failed, falling back to local state:', e);
      }

      if (allTeachersList.length === 0) {
        try {
          const tRes = await teachersService.getTeachers('?per_page=1000');
          if (Array.isArray(tRes?.teachers)) {
            allTeachersList = tRes.teachers;
          }
        } catch (e) {
          console.warn('API teachers fetch failed:', e);
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

      let classesToPrint = [];
      if (rawClassesList.length > 0) {
        classesToPrint = rawClassesList.map((cls) => {
          const numericId = cls.id;
          const grade = cls.grade_ar || cls.grade || '';
          const section = cls.section_ar || cls.section || '';
          const name = `${grade} - ${section}`;
          const subNames = Array.isArray(cls.subjects)
            ? cls.subjects.map(s => typeof s === 'string' ? s : (s.name_ar || s.name || '')).filter(Boolean)
            : [];
          const studentCount = typeof cls.students_count === 'number'
            ? cls.students_count
            : students.filter(s => Number(s.class_id) === Number(numericId) || (s.grade === grade && s.section === section)).length;
          return {
            numericId,
            grade,
            section,
            name,
            studentsCount: studentCount,
            subjects: subNames,
            subjectTeachers: cls.subject_teachers || {}
          };
        });
      } else {
        classesToPrint = classes.map((cls) => {
          const numericId = cls.numericId || parseInt(String(cls.id).replace(/\D/g, ''), 10);
          const studentCount = (typeof cls.studentsCount === 'number' && cls.studentsCount > 0)
            ? cls.studentsCount
            : students.filter(s => Number(s.class_id) === Number(numericId) || (s.grade === cls.grade && s.section === cls.section)).length;
          return {
            numericId,
            grade: cls.grade || '',
            section: cls.section || '',
            name: cls.name || `${cls.grade} - ${cls.section}`,
            studentsCount: studentCount,
            subjects: Array.isArray(cls.subjects) ? [...cls.subjects] : [],
            subjectTeachers: cls.subjectTeachers || {}
          };
        });
      }

      // Filter by specific class if chosen
      const useClassFilter = printClassId && printClassId !== 'all';
      const targetNumericClassId = useClassFilter ? String(printClassId).replace(/\D/g, '') : '';
      if (targetNumericClassId) {
        classesToPrint = classesToPrint.filter(c => String(c.numericId) === String(targetNumericClassId));
      }

      // Sort classes by grade order then section
      const gradeOrder = availableGrades || [];
      classesToPrint.sort((a, b) => {
        const idxA = gradeOrder.indexOf(a.grade);
        const idxB = gradeOrder.indexOf(b.grade);
        if (idxA !== -1 && idxB !== -1 && idxA !== idxB) {
          return idxA - idxB;
        }
        const gradeCmp = normalizeArabic(a.grade).localeCompare(normalizeArabic(b.grade), 'ar');
        if (gradeCmp !== 0) return gradeCmp;
        return normalizeArabic(a.section).localeCompare(normalizeArabic(b.section), 'ar');
      });

      // Helper to resolve teacher name for a given class and subject
      const resolveTeacherForSubject = (clsObj, subName) => {
        if (clsObj.subjectTeachers && clsObj.subjectTeachers[subName]) {
          return clsObj.subjectTeachers[subName];
        }
        const matchedTeachers = [];
        allTeachersList.forEach((t) => {
          const tName = t.name_ar || t.name || '';
          if (Array.isArray(t.teachingAssignments)) {
            const hasMatch = t.teachingAssignments.some(a =>
              a.subject === subName &&
              (a.class === clsObj.name || (a.classId && Number(a.classId) === Number(clsObj.numericId)))
            );
            if (hasMatch && tName && !matchedTeachers.includes(tName)) {
              matchedTeachers.push(tName);
            }
          } else if (Array.isArray(t.assignments)) {
            const hasMatch = t.assignments.some(a => {
              const sName = a.subject ? (a.subject.name_ar || a.subject.name) : '';
              const cId = a.school_class ? a.school_class.id : a.class_id;
              return sName === subName && Number(cId) === Number(clsObj.numericId);
            });
            if (hasMatch && tName && !matchedTeachers.includes(tName)) {
              matchedTeachers.push(tName);
            }
          }
        });
        return matchedTeachers.length > 0 ? matchedTeachers.join('، ') : 'غير مسند';
      };

      const totalStudentsAll = classesToPrint.reduce((sum, c) => sum + (Number(c.studentsCount) || 0), 0);

      const todayStr = new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });

      let theadHtml = '';
      if (printRosterType === 'classes_students_count') {
        theadHtml = `
          <tr>
            <th style="width: 42px;">م</th>
            <th style="text-align: right;">الصف</th>
            <th style="width: 140px; text-align: center;">الشعبة</th>
            <th style="width: 160px; text-align: center;">عدد الطلاب</th>
          </tr>
        `;
      } else {
        theadHtml = `
          <tr>
            <th style="width: 36px;">م</th>
            <th style="width: 135px; text-align: right;">الصف</th>
            <th style="width: 65px; text-align: center;">الشعبة</th>
            <th style="width: 75px; text-align: center;">عدد الطلاب</th>
            <th style="width: 150px; text-align: right;">المادة الدراسية</th>
            <th style="width: 170px; text-align: right;">اسم المعلم</th>
            <th style="text-align: right;">الملاحظات</th>
          </tr>
        `;
      }

      let rowsHtml = '';
      if (classesToPrint.length === 0) {
        const colSpan = printRosterType === 'classes_students_count' ? 4 : 7;
        rowsHtml = `
          <tr>
            <td colspan="${colSpan}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد فصول دراسية مسجلة لهذا النطاق
            </td>
          </tr>
        `;
      } else if (printRosterType === 'classes_students_count') {
        rowsHtml = classesToPrint.map((cls, idx) => `
          <tr>
            <td class="col-num">${idx + 1}</td>
            <td class="col-name">${cls.grade}</td>
            <td style="text-align:center;font-weight:800;font-size:12px;">${cls.section}</td>
            <td style="text-align:center;font-weight:800;font-size:12px;color:#1e3a8a;">${cls.studentsCount}</td>
          </tr>
        `).join('') + `
          <tr style="background-color:#e2e8f0;font-weight:800;">
            <td colspan="3" style="text-align:center;padding:8px 10px;color:#0f2e5a;font-size:12px;">الإجمالي الكلي للطلاب في جميع الشعب</td>
            <td style="text-align:center;padding:8px 10px;color:#0f2e5a;font-size:12.5px;">${totalStudentsAll} طالب</td>
          </tr>
        `;
      } else {
        rowsHtml = classesToPrint.map((cls, idx) => {
          const sortedSubjects = [...(cls.subjects || [])].sort((a, b) =>
            normalizeArabic(a).localeCompare(normalizeArabic(b), 'ar')
          );
          const subList = sortedSubjects.length > 0 ? sortedSubjects : ['لا توجد مواد مقررة'];
          const rowSpan = subList.length;

          return subList.map((subName, sIdx) => {
            const teacherName = sortedSubjects.length > 0
              ? resolveTeacherForSubject(cls, subName)
              : '—';

            if (sIdx === 0) {
              return `
                <tr>
                  <td class="col-num" rowspan="${rowSpan}">${idx + 1}</td>
                  <td class="col-name" rowspan="${rowSpan}">${cls.grade}</td>
                  <td style="text-align:center;font-weight:800;font-size:11.5px;" rowspan="${rowSpan}">${cls.section}</td>
                  <td style="text-align:center;font-weight:800;font-size:11.5px;color:#1e3a8a;" rowspan="${rowSpan}">${cls.studentsCount}</td>
                  <td style="text-align:right;font-weight:700;font-size:11px;">${subName}</td>
                  <td style="text-align:right;font-weight:600;font-size:11px;">${teacherName}</td>
                  <td class="col-notes">&nbsp;</td>
                </tr>
              `;
            } else {
              return `
                <tr>
                  <td style="text-align:right;font-weight:700;font-size:11px;">${subName}</td>
                  <td style="text-align:right;font-weight:600;font-size:11px;">${teacherName}</td>
                  <td class="col-notes">&nbsp;</td>
                </tr>
              `;
            }
          }).join('');
        }).join('');
      }

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>كشف الفصول الدراسية والشعب</title>
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
        <div class="sr-meta-item">العام الدراسي: <strong>1447-1448هـ (2025-2026م)</strong></div>
        <div class="sr-meta-item">إجمالي الشعب الدراسية: <strong>${classesToPrint.length} شعبة</strong></div>
        <div class="sr-meta-item">إجمالي الطلاب: <strong>${totalStudentsAll} طالب</strong></div>
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

      let iframe = document.getElementById('classes-print-frame');
      if (iframe) iframe.remove();
      iframe = document.createElement('iframe');
      iframe.id = 'classes-print-frame';
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

  // CRUD Handlers
  const handleAddClass = (e) => {
    e.preventDefault();
    setFormError('');
    
    const nameAr = `${modalClassGrade} - ${modalClassSection}`;
    const nameEn = `${modalClassGradeEn} - ${modalClassSectionEn}`;

    // Check if name already exists
    if (classes.some(c => c.name === nameAr)) {
      setFormError(lang === 'ar' ? 'هذا الفصل مسجل بالفعل!' : 'Class name already exists!');
      return;
    }

    const token = localStorage.getItem("auth_token");
    setIsSaving(true);
    if (token) {
      classesService.createClass({
        grade_ar: modalClassGrade,
        grade_en: modalClassGradeEn,
        section_ar: modalClassSection,
        section_en: modalClassSectionEn
      })
      .then(data => {
        if (data.success) {
          // Sync subjects with database
          return classesService.syncSubjects(data.class.id, modalClassSubjects)
          .then(() => {
            const addedClass = {
              id: `cls-${data.class.id}`,
              name: `${data.class.grade_ar} - ${data.class.section_ar}`,
              nameEn: `${data.class.grade_en} - ${data.class.section_en}`,
              grade: data.class.grade_ar,
              gradeEn: data.class.grade_en,
              section: data.class.section_ar,
              sectionEn: data.class.section_en,
              subjects: modalClassSubjects
            };
            setClasses(prev => [...prev, addedClass]);
            fetchTeachers(token);
            setShowClassModal(false);
            setToastMessage(lang === 'ar' ? 'تمت إضافة الفصل الدراسي بنجاح!' : 'Class created successfully!');
            setTimeout(() => setToastMessage(''), 3000);
          })
          .catch(err => {
            console.error("Error syncing class subjects:", err);
            const addedClass = {
              id: `cls-${data.class.id}`,
              name: `${data.class.grade_ar} - ${data.class.section_ar}`,
              nameEn: `${data.class.grade_en} - ${data.class.section_en}`,
              grade: data.class.grade_ar,
              gradeEn: data.class.grade_en,
              section: data.class.section_ar,
              sectionEn: data.class.section_en,
              subjects: modalClassSubjects
            };
            setClasses(prev => [...prev, addedClass]);
            setShowClassModal(false);
          });
        } else {
          setFormError(data.message || 'Error');
        }
      })
      .catch(err => {
        console.error("Error creating class:", err);
        setFormError(lang === 'ar' ? 'حدث خطأ أثناء حفظ الفصل.' : 'Error saving class.');
      })
      .finally(() => {
        setIsSaving(false);
      });
    } else {
      const newClass = {
        id: 'cls-' + Date.now(),
        name: nameAr,
        nameEn: nameEn,
        grade: modalClassGrade,
        gradeEn: modalClassGradeEn,
        section: modalClassSection,
        sectionEn: modalClassSectionEn,
        subjects: modalClassSubjects
      };
      setClasses(prev => [...prev, newClass]);
      setShowClassModal(false);
      setToastMessage(lang === 'ar' ? 'تمت إضافة الفصل الدراسي بنجاح!' : 'Class created successfully!');
      setTimeout(() => setToastMessage(''), 3000);
      setIsSaving(false);
    }
  };

  const handleEditClass = (e) => {
    e.preventDefault();
    setFormError('');
    
    const nameAr = `${modalClassGrade} - ${modalClassSection}`;
    const nameEn = `${modalClassGradeEn} - ${modalClassSectionEn}`;

    if (classes.some(c => c.id !== selectedClassIdForEdit && c.name === nameAr)) {
      setFormError(lang === 'ar' ? 'هذا الفصل مسجل بالفعل!' : 'Class name already exists!');
      return;
    }

    const token = localStorage.getItem("auth_token");
    setIsSaving(true);
    if (token) {
      const numericId = Number(String(selectedClassIdForEdit).replace("cls-", ""));
      classesService.updateClass(numericId, {
        grade_ar: modalClassGrade,
        grade_en: modalClassGradeEn,
        section_ar: modalClassSection,
        section_en: modalClassSectionEn
      })
      .then(data => {
        if (data.success) {
          return classesService.syncSubjects(numericId, modalClassSubjects)
          .then(() => {
            setClasses(prev => prev.map(c => {
              if (c.id === selectedClassIdForEdit) {
                return {
                  ...c,
                  name: nameAr,
                  nameEn: nameEn,
                  grade: modalClassGrade,
                  gradeEn: modalClassGradeEn,
                  section: modalClassSection,
                  sectionEn: modalClassSectionEn,
                  subjects: modalClassSubjects
                };
              }
              return c;
            }));
            fetchClasses(true);
            fetchTeachers(token);
            setShowEditClassModal(false);
            setToastMessage(lang === 'ar' ? 'تم تحديث بيانات الفصل بنجاح!' : 'Class details updated successfully!');
            setTimeout(() => setToastMessage(''), 3000);
          })
          .catch(err => {
            console.error("Error syncing class subjects during update:", err);
            setClasses(prev => prev.map(c => {
              if (c.id === selectedClassIdForEdit) {
                return {
                  ...c,
                  name: nameAr,
                  nameEn: nameEn,
                  grade: modalClassGrade,
                  gradeEn: modalClassGradeEn,
                  section: modalClassSection,
                  sectionEn: modalClassSectionEn,
                  subjects: modalClassSubjects
                };
              }
              return c;
            }));
            setShowEditClassModal(false);
          });
        } else {
          setFormError(data.message || 'Error');
        }
      })
      .catch(err => {
        console.error("Error updating class:", err);
        setFormError(lang === 'ar' ? 'حدث خطأ أثناء تحديث بيانات الفصل.' : 'Error updating class details.');
      })
      .finally(() => {
        setIsSaving(false);
      });
    } else {
      setClasses(prev => prev.map(c => {
        if (c.id === selectedClassIdForEdit) {
          return {
            ...c,
            name: nameAr,
            nameEn: nameEn,
            grade: modalClassGrade,
            gradeEn: modalClassGradeEn,
            section: modalClassSection,
            sectionEn: modalClassSectionEn,
            subjects: modalClassSubjects
          };
        }
        return c;
      }));
      setShowEditClassModal(false);
      setToastMessage(lang === 'ar' ? 'تم تحديث بيانات الفصل بنجاح!' : 'Class details updated successfully!');
      setTimeout(() => setToastMessage(''), 3000);
      setIsSaving(false);
    }
  };

  const handleDeleteClass = (id) => {
    triggerConfirm({
      title: lang === 'ar' ? 'حذف الفصل الدراسي' : 'Delete Class',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الفصل؟ سيتم فصل طلابه وتكليفات المعلمين المرتبطة به.' : 'Are you sure you want to delete this class? Connected students and teacher assignments will be unlinked.',
      onConfirm: () => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          const numericId = Number(String(id).replace("cls-", ""));
          classesService.deleteClass(numericId)
          .then(data => {
            if (data.success) {
              setClasses(prev => prev.filter(c => c.id !== id));
              setToastMessage(lang === 'ar' ? 'تم حذف الفصل بنجاح' : 'Class deleted successfully');
              setTimeout(() => setToastMessage(''), 3000);
            }
          })
          .catch(err => {
            console.error("Error deleting class:", err);
            alert(lang === 'ar' ? 'فشل حذف الفصل من قاعدة البيانات' : 'Failed to delete class from database');
          });
        } else {
          setClasses(prev => prev.filter(c => c.id !== id));
          setToastMessage(lang === 'ar' ? 'تم حذف الفصل بنجاح' : 'Class deleted successfully');
          setTimeout(() => setToastMessage(''), 3000);
        }
      }
    });
  };

  return (
    <>
      <div className="section-card">
      <div className="section-card-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px', margin: 0 }}>
          {lang === 'ar' ? 'سجل الفصول الدراسية والشُعب' : 'Classes & Sections Registry'}
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
          {canAction('classes', 'create') && (
            <button 
              className="btn-accent"
              onClick={() => {
                setFormError('');
                setModalClassNameAr('');
                setModalClassNameEn('');
                setModalClassGrade('الصف الأول');
                setModalClassGradeEn('Grade 1');
                setModalClassSection('أ');
                setModalClassSectionEn('A');
                setModalClassSubjects([]);
                setShowClassModal(true);
              }}
            >
              <Plus size={18} strokeWidth={2.5} style={{ marginInlineEnd: '4px' }} />
              {lang === 'ar' ? 'إضافة فصل جديد' : 'Add New Class'}
            </button>
          )}
        </div>
      </div>

      {/* Search Box */}
      <div className="students-controls no-print" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text"
            className="text-field"
            placeholder={lang === 'ar' ? 'ابحث عن فصل...' : 'Search for a class...'}
            value={classSearchQuery}
            onChange={(e) => setClassSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Classes grid container */}
      <div className="classes-grid">
        {(() => {
          const filtered = classes.filter(cls => {
            const query = classSearchQuery.toLowerCase();
            return (
              cls.name.toLowerCase().includes(query) ||
              (cls.nameEn && cls.nameEn.toLowerCase().includes(query)) ||
              cls.grade.toLowerCase().includes(query)
            );
          });

          if (filtered.length === 0) {
            return (
              <div style={{ gridColumn: '1 / -1', padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)', background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '32px' }}>
                    {classSearchQuery ? "🔍" : "📂"}
                  </span>
                  <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                    {classSearchQuery 
                      ? (lang === 'ar' ? 'لا توجد فصول تطابق بحثك' : 'No matching classes found')
                      : (lang === 'ar' ? 'لا يوجد فصول دراسية مسجلة حالياً' : 'No classes registered yet')
                    }
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {classSearchQuery 
                      ? (lang === 'ar' ? 'جرب البحث بكلمة مفتاحية مختلفة' : 'Try searching for a different keyword')
                      : (lang === 'ar' ? 'لم يتم إضافة أي بيانات بعد' : 'No records have been added yet')
                    }
                  </span>
                </div>
              </div>
            );
          }

          return filtered.map(cls => {
            // Calculate students count in this class
            const numericClassId = cls.numericId || (cls.id ? parseInt(String(cls.id).replace(/\D/g, ''), 10) : null);
            const studentCount = (typeof cls.studentsCount === 'number' && cls.studentsCount > 0)
              ? cls.studentsCount
              : students.filter(s =>
                  (s.class_id && Number(s.class_id) === Number(numericClassId)) ||
                  (s.grade === cls.grade && s.section === cls.section)
                ).length;
            // Find teachers teaching in this class by name or ID
            const rawClassId = cls.id ? parseInt(String(cls.id).replace(/\D/g, ''), 10) : null;
            const classTeachers = teachers.filter(t => 
              (t.classes && t.classes.includes(cls.name)) ||
              (t.classIds && rawClassId && t.classIds.includes(rawClassId))
            );

            return (
              <div className="class-card" key={cls.id}>
                <div className="class-card-icon" style={{ fontSize: '24px', color: 'var(--color-primary-ui)' }}>
                  🏫
                </div>
                <div className="class-card-header-info">
                  <h4 className="title-large" style={{ margin: 0, fontWeight: '700' }}>
                    {lang === 'ar' ? cls.name : (cls.nameEn || cls.name)}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {lang === 'ar' ? `المرحلة: ${cls.grade}` : `Grade: ${cls.gradeEn || cls.grade}`}
                  </span>
                </div>
                
                <div className="class-card-body" style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>👥 {lang === 'ar' ? 'الطلاب:' : 'Students:'}</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{studentCount} {lang === 'ar' ? 'طالب' : 'students'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                    <span>👨‍🏫 {lang === 'ar' ? 'المعلمون:' : 'Teachers:'}</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{classTeachers.length} {lang === 'ar' ? 'معلم' : 'teachers'}</strong>
                  </div>

                  {/* Subjects count & preview */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                      📚 {lang === 'ar' ? 'المواد المقررة:' : 'Assigned Subjects:'}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxHeight: '55px', overflowY: 'auto' }}>
                      {cls.subjects && cls.subjects.length > 0 ? (
                        cls.subjects.map((subName, sIdx) => (
                          <span key={sIdx} className="chip" style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(30, 80, 142, 0.05)', color: 'var(--color-primary-ui)', cursor: 'default', border: '1px solid rgba(30, 80, 142, 0.1)' }}>
                            {subName}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'لا يوجد مواد' : 'No subjects assigned'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teachers preview */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                      🎓 {lang === 'ar' ? 'المدرسون:' : 'Instructors:'}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {classTeachers.length > 0 ? (
                        classTeachers.map((teach, tIdx) => (
                          <span 
                            key={tIdx} 
                            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'rgba(30, 80, 142, 0.04)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                            title={lang === 'ar' ? teach.subject : teach.subjectEn}
                          >
                            {renderAvatar(teach.photo, "👨‍🏫", { width: '20px', height: '20px', fontSize: '13px', marginInlineEnd: 0 })}
                            <span style={{ fontWeight: '500' }}>{lang === 'ar' ? teach.name : (teach.nameEn || teach.name)}</span>
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'لا يوجد معلمون' : 'No teachers assigned'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="class-card-actions" style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <button 
                    className="btn-elevated"
                    style={{ flex: 1, padding: '8px 4px', fontSize: '12px' }}
                    onClick={() => {
                      setSelectedClassForDetails(cls);
                      setShowClassDetailsModal(true);
                    }}
                  >
                    🔍 {lang === 'ar' ? 'عرض التفاصيل' : 'Details'}
                  </button>
                  {canAction('classes', 'update', cls.id) && (
                    <button 
                      className="btn-elevated"
                      style={{ padding: '8px 10px', fontSize: '12px' }}
                      onClick={() => {
                        setFormError('');
                        setSelectedClassIdForEdit(cls.id);
                        setModalClassNameAr(cls.name);
                        setModalClassNameEn(cls.nameEn || '');
                        setModalClassGrade(cls.grade);
                        setModalClassGradeEn(cls.gradeEn || '');
                        setModalClassSection(cls.section);
                        setModalClassSectionEn(cls.sectionEn || '');
                        setModalClassSubjects(cls.subjects || []);
                        setShowEditClassModal(true);
                      }}
                    >
                      📝
                    </button>
                  )}
                  {canAction('classes', 'delete', cls.id) && (
                    <button 
                      className="btn-elevated danger"
                      style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--color-error)' }}
                      onClick={() => handleDeleteClass(cls.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          });
        })()}
      </div>
      </div>

      {/* MODAL DIALOG: ADD CLASS */}
      {showClassModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">🏫 {lang === 'ar' ? 'إنشاء فصل دراسي جديد' : 'Create New Class'}</h3>
              <button className="modal-close-btn" onClick={() => setShowClassModal(false)}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <form onSubmit={handleAddClass}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الصف' : 'Grade'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field" 
                      value={modalClassGrade} 
                      onChange={(e) => {
                        setModalClassGrade(e.target.value);
                        const gradeMap = {
                          'تمهيدي أول': 'KG1',
                          'تمهيدي ثاني': 'KG2',
                          'الصف الأول': 'Grade 1',
                          'الصف الثاني': 'Grade 2',
                          'الصف الثالث': 'Grade 3',
                          'الصف الرابع': 'Grade 4',
                          'الصف الخامس': 'Grade 5',
                          'الصف السادس': 'Grade 6',
                          'الصف الأول المتوسط': 'Grade 7',
                          'الصف الثاني المتوسط': 'Grade 8',
                          'الصف الثالث المتوسط': 'Grade 9',
                          'الصف الأول الثانوي': 'Grade 10',
                          'الصف الثاني الثانوي': 'Grade 11',
                          'الصف الثالث الثانوي': 'Grade 12'
                        };
                        setModalClassGradeEn(gradeMap[e.target.value] || 'Grade 1');
                      }}
                    >
                      {availableGrades.map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الشعبة (القسم)' : 'Section'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field" 
                      value={modalClassSection} 
                      onChange={(e) => {
                        setModalClassSection(e.target.value);
                        const secMap = {
                          'أ': 'A',
                          'ب': 'B',
                          'ج': 'C',
                          'د': 'D',
                          'هـ': 'E',
                          'و': 'F',
                          'ز': 'G'
                        };
                        setModalClassSectionEn(secMap[e.target.value] || 'A');
                      }}
                    >
                      {availableSections.map((s, idx) => {
                        const secMap = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E', 'و': 'F', 'ز': 'G' };
                        return (
                          <option key={idx} value={s}>{lang === 'ar' ? s : (secMap[s] || s)}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'المواد المقررة للفصل' : 'Assigned Subjects'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-input)' }}>
                    {subjects.map(sub => (
                      <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={modalClassSubjects.includes(sub.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModalClassSubjects(prev => [...prev, sub.name]);
                            } else {
                              setModalClassSubjects(prev => prev.filter(s => s !== sub.name));
                            }
                          }}
                        />
                        {lang === 'ar' ? sub.name : sub.nameEn}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowClassModal(false)} style={{ height: '48px' }} disabled={isSaving}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: EDIT CLASS */}
      {showEditClassModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">
                🏫 {lang === 'ar' ? `تعديل مواد وبيانات الفصل: ${modalClassGrade} - ${modalClassSection}` : `Edit Class & Subjects: ${modalClassGrade} - ${modalClassSection}`}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowEditClassModal(false)}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <form onSubmit={handleEditClass}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-chip)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الصف' : 'Grade'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field" 
                      value={modalClassGrade} 
                      onChange={(e) => {
                        setModalClassGrade(e.target.value);
                        const gradeMap = {
                          'تمهيدي أول': 'KG1',
                          'تمهيدي ثاني': 'KG2',
                          'الصف الأول': 'Grade 1',
                          'الصف الثاني': 'Grade 2',
                          'الصف الثالث': 'Grade 3',
                          'الصف الرابع': 'Grade 4',
                          'الصف الخامس': 'Grade 5',
                          'الصف السادس': 'Grade 6',
                          'الصف الأول المتوسط': 'Grade 7',
                          'الصف الثاني المتوسط': 'Grade 8',
                          'الصف الثالث المتوسط': 'Grade 9',
                          'الصف الأول الثانوي': 'Grade 10',
                          'الصف الثاني الثانوي': 'Grade 11',
                          'الصف الثالث الثانوي': 'Grade 12'
                        };
                        setModalClassGradeEn(gradeMap[e.target.value] || 'Grade 1');
                      }}
                    >
                      {Array.from(new Set([...availableGrades, modalClassGrade])).filter(Boolean).map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الشعبة (القسم)' : 'Section'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <select 
                      className="text-field" 
                      value={modalClassSection} 
                      onChange={(e) => {
                        setModalClassSection(e.target.value);
                        const secMap = {
                          'أ': 'A',
                          'ب': 'B',
                          'ج': 'C',
                          'د': 'D',
                          'هـ': 'E',
                          'و': 'F',
                          'ز': 'G'
                        };
                        setModalClassSectionEn(secMap[e.target.value] || 'A');
                      }}
                    >
                      {availableSections.map((s, idx) => {
                        const secMap = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E', 'و': 'F', 'ز': 'G' };
                        return (
                          <option key={idx} value={s}>{lang === 'ar' ? s : (secMap[s] || s)}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'المواد المقررة للفصل' : 'Assigned Subjects'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-input)' }}>
                    {subjects.map(sub => (
                      <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={modalClassSubjects.includes(sub.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModalClassSubjects(prev => [...prev, sub.name]);
                            } else {
                              setModalClassSubjects(prev => prev.filter(s => s !== sub.name));
                            }
                          }}
                        />
                        {lang === 'ar' ? sub.name : sub.nameEn}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-elevated" onClick={() => setShowEditClassModal(false)} style={{ height: '48px' }} disabled={isSaving}>{t.cancel}</button>
                <button type="submit" className="btn-filled" style={{ height: '48px', opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: CLASS DETAILS & STUDENTS LIST */}
      {showClassDetailsModal && selectedClassForDetails && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '650px' }}>
            <header className="modal-header">
              <h3 className="modal-title">🏫 {lang === 'ar' ? `تفاصيل الفصل: ${selectedClassForDetails.name}` : `Class Details: ${selectedClassForDetails.nameEn || selectedClassForDetails.name}`}</h3>
              <button className="modal-close-btn" onClick={() => { setShowClassDetailsModal(false); setSelectedClassForDetails(null); }}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <div className="modal-body">
              {/* Quick Class Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {students.filter(s => s.grade === selectedClassForDetails.grade && s.section === selectedClassForDetails.section).length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'الطلاب المقيدون' : 'Enrolled Students'}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {selectedClassForDetails.subjects ? selectedClassForDetails.subjects.length : 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'المواد المقررة' : 'Assigned Subjects'}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {teachers.filter(t => t.classes.includes(selectedClassForDetails.name)).length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'المعلمون الفاعلون' : 'Active Teachers'}</div>
                </div>
              </div>

              {/* Students List */}
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>👥 {lang === 'ar' ? 'قائمة الطلاب المقيدين بالفصل:' : 'Enrolled Students List:'}</h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '12px', marginBottom: '16px' }}>
                <table className="students-table" style={{ margin: 0, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>ID</th>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>{t.studentName}</th>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.grade === selectedClassForDetails.grade && s.section === selectedClassForDetails.section).length > 0 ? (
                      students
                        .filter(s => s.grade === selectedClassForDetails.grade && s.section === selectedClassForDetails.section)
                        .map(student => (
                          <tr key={student.id}>
                            <td style={{ padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{student.id}</td>
                            <td style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}>
                              {renderAvatar(student.photo, "👨‍🎓")}
                              {lang === 'ar' ? student.name : student.nameEn}
                            </td>
                            <td style={{ padding: '6px 12px', fontSize: '12px' }}>
                              <span className={`badge-status ${student.status === 'present' ? 'checked-in' : 'absent'}`} style={{ padding: '2px 8px', fontSize: '10px' }}>
                                {student.status === 'present' ? t.present : t.absent}
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                          {lang === 'ar' ? 'لا يوجد طلاب مقيدين في هذا الفصل' : 'No students enrolled in this class'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Class Teachers & Subjects mapping */}
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>👨‍🏫 {lang === 'ar' ? 'المعلمون والمواد المقررة:' : 'Teachers & Course Schedule:'}</h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                <table className="students-table" style={{ margin: 0, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>{t.subject}</th>
                      <th style={{ padding: '6px 12px', fontSize: '12px' }}>{t.teacherName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClassForDetails.subjects && selectedClassForDetails.subjects.length > 0 ? (
                      selectedClassForDetails.subjects.map((subName, index) => {
                        const subjectObj = subjects.find(s => s.name === subName);
                        const subNameEn = subjectObj ? subjectObj.nameEn : subName;
                        const rawDetailsClassId = selectedClassForDetails.id ? parseInt(String(selectedClassForDetails.id).replace(/\D/g, ''), 10) : null;
                        const teacherObj = teachers.find(t => 
                          t.teachingAssignments && 
                          t.teachingAssignments.some(a => 
                            (a.subject === subName || (subjectObj && a.subjectId === subjectObj.id)) && 
                            (a.class === selectedClassForDetails.name || (rawDetailsClassId && a.classId === rawDetailsClassId))
                          )
                        );
                        return (
                          <tr key={index}>
                            <td style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold' }}>
                              {lang === 'ar' ? subName : subNameEn}
                            </td>
                            <td style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}>
                              {teacherObj ? (
                                <>
                                  {renderAvatar(teacherObj.photo, "👨‍🏫")}
                                  {lang === 'ar' ? teacherObj.name : teacherObj.nameEn}
                                </>
                              ) : (
                                <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                  {lang === 'ar' ? 'غير مسند' : 'Not Assigned'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                          {lang === 'ar' ? 'لا توجد مواد مقرر في هذا الفصل' : 'No subjects assigned to this class'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <footer className="modal-footer">
              <button className="btn-filled" onClick={() => { setShowClassDetailsModal(false); setSelectedClassForDetails(null); }}>
                {lang === 'ar' ? 'إغلاق النافذة' : 'Close'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: PRINT ROSTER */}
      {showPrintModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '600px', width: '92%' }}>
            <header className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={20} color="#d97706" />
                <span>{lang === 'ar' ? 'طباعة كشوفات الفصول الدراسية الجاهزة' : 'Print Classes Rosters'}</span>
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
                      id: 'classes_students_count',
                      title: '1. كشف بالصفوف والشعب وعدد الطلاب في كل شعبة',
                      desc: 'يحتوي على: الرقم التسلسلي (م)، الصف، الشعبة، وعدد الطلاب في كل شعبة مع الإجمالي العام'
                    },
                    {
                      id: 'classes_subjects_teachers',
                      title: '2. كشف بالصفوف والشعب وعدد الطلاب في كل شعبة ويوضح المواد لكل شعبة وأسماء المعلمين أمام كل مادة مع عمود الملاحظات',
                      desc: 'يحتوي على: الرقم التسلسلي (م)، الصف، الشعبة، عدد الطلاب، المادة الدراسية، اسم المعلم أمام كل مادة، وعمود الملاحظات'
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
                          name="class_print_roster_type"
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
                {lang === 'ar' ? '📥 استيراد الفصول الدراسية' : '📥 Import Classes'}
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
                      onClick={() => document.getElementById('classes-excel-file-uploader').click()}
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
                        id="classes-excel-file-uploader"
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
                      {lang === 'ar' ? 'قم بتحميل القالب لتعبئة بيانات الفصول الدراسية والشعب.' : 'Download template to fill in classes and sections data.'}
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
                      {lang === 'ar' ? '2. تصدير بيانات الفصول الدراسية الحالية' : '2. Export Current Classes Data'}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
                      {lang === 'ar' ? 'تصدير كافة الفصول والشعب مع عدد الطلاب والمواد المقررة بصيغة CSV تدعم اللغة العربية.' : 'Export all registered classes into an Arabic-friendly CSV file.'}
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
