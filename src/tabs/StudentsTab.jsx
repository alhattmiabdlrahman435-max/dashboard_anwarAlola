import { SLOGAN_BASE64 } from '../assets/sloganBase64';
import { studentsService } from "../services/students/students.service";
import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import { useStudents } from '../contexts/Students/useStudents';
import { useClasses } from '../contexts/Classes/useClasses';
import { useAllowedClasses } from '../hooks/useAllowedClasses';
import { useParents } from '../contexts/Parents/useParents';
import { useSettings } from '../contexts/Settings/useSettings';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';
import { Plus, Search, Eye, Edit2, Trash2, CreditCard, Download, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, RefreshCw, X, User, Camera, Printer } from 'lucide-react';
import { processAndCompressFile } from '../utils/fileCompressor';

export default function StudentsTab() {
  const {
    lang, t,
    renderAvatar,
    canAction, setToastMessage, triggerConfirm
  } = useApp();
  const { controlMultiplier, controlOffset } = useSettings();

  const { classes, fetchClasses } = useClasses();
  const { allowedClasses } = useAllowedClasses('students');
  const { parentUsers, fetchParents } = useParents();
  const {
    students,
    studentsPagination,
    setSelectedStudentForCard,
    setShowCardVisualizerModal,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    fetchStudents,
    loading
  } = useStudents();
  const { currentUser } = useAuth();

  const {
    page,
    perPage,
    search,
    sort,
    direction,
    filters,
    setPage,
    setPerPage,
    setSort,
    setSearch,
    setFilters,
    buildQueryString,
    goToPrevIfEmpty,
  } = usePagination({
    moduleKey: 'students',
    defaultFilters: { status: 'all', class_id: 'all' },
  });

  const classFilter = filters.class_id || 'all';
  const statusFilter = filters.status || 'all';

  const qs = buildQueryString();

  useEffect(() => {
    fetchStudents(qs);
  }, [fetchStudents, qs]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const importIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (importIntervalRef.current) {
        clearInterval(importIntervalRef.current);
      }
    };
  }, []);

  // Local UI states
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search);

  // Sync search input with URL params on back/forward
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  const [showStudentModal, setShowStudentModal] = useState(false);

  // Excel Modal States
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelModalTab, setExcelModalTab] = useState('import'); // 'import' | 'export'
  const [excelDefaultClassId, setExcelDefaultClassId] = useState('');
  const [excelTemplateClassId, setExcelTemplateClassId] = useState('');
  const [excelExportClassId, setExcelExportClassId] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  const [importWarnings, setImportWarnings] = useState([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // Print Modal States
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printClassId, setPrintClassId] = useState('');
  const [printRosterType, setPrintRosterType] = useState('without_code'); // 'without_code' | 'with_code'
  const [isPrintingRoster, setIsPrintingRoster] = useState(false);

  // ── Print Roster Handler (مع أكليشة المدرسة الرسمية وكافة التفاصيل) ────────
  const handlePrintRoster = async () => {
    if (!printClassId) {
      if (setToastMessage) setToastMessage(lang === 'ar' ? 'الرجاء اختيار الصف والشعبة أولاً' : 'Please select class and section first');
      return;
    }

    setIsPrintingRoster(true);

    try {
      const selectedClass = (allowedClasses || []).find(c => {
        const numId = typeof c.id === 'string' && c.id.startsWith('cls-') ? c.id.replace('cls-', '') : String(c.id);
        return numId === String(printClassId) || String(c.id) === String(printClassId);
      });

      const className = selectedClass 
        ? (lang === 'ar' ? selectedClass.name : (selectedClass.nameEn || selectedClass.name))
        : '';

      const numericId = String(printClassId).replace(/\D/g, '');

      // جلب جميع طلاب الفصل المحدد من الخادم لضمان عدم اقتصار الكشف على الصفحة الحالية فقط
      let classStudents = [];
      try {
        const response = await studentsService.getStudents(`?class_id=${numericId}&per_page=500`);
        const rawList = response?.data?.students || response?.data?.data || response?.students || [];
        classStudents = rawList.map(st => ({
          id: st.id,
          name: st.name_ar || st.name || '',
          nameEn: st.name_en || st.nameEn || '',
          studentCode: st.student_code || st.qrCode || st.id || '',
        }));
      } catch (err) {
        console.warn('Fallback to context students:', err);
      }

      // في حال تعذر الاتصال أو كان الرد فارغاً، الاعتماد على بيانات الواجهة كخيار بديل
      if (!classStudents || classStudents.length === 0) {
        classStudents = (students || [])
          .filter(s => {
            const sClassId = String(s.class_id || s.classId || '').replace(/\D/g, '');
            return sClassId === numericId || String(s.class_id) === String(printClassId);
          })
          .map(st => ({
            id: st.id,
            name: st.name || st.name_ar || '',
            nameEn: st.nameEn || st.name_en || '',
            studentCode: st.qrCode || st.student_code || st.id || '',
          }));
      }

      // الترتيب الأبجدي الدقيق للأسماء العربية (مع توحيد الهمزات والتشكيل)
      const normalizeArabic = (str = '') => {
        return str
          .replace(/[ً-ٰٟ]/g, '') // إزالة التشكيل
          .replace(/[إأآٱ]/g, 'ا')               // توحيد الألفات
          .replace(/ة/g, 'ه')                    // توحيد التاء المربوطة
          .replace(/ى/g, 'ي')                    // توحيد الياء
          .trim();
      };

      classStudents.sort((a, b) => {
        const normA = normalizeArabic(a.name || '');
        const normB = normalizeArabic(b.name || '');
        const cmp = normA.localeCompare(normB, 'ar');
        return cmp !== 0 ? cmp : (a.name || '').localeCompare(b.name || '', 'ar');
      });

      const withCode = printRosterType === 'with_code';
      const rosterTitle = withCode
        ? 'كشف أسماء الطلاب مع الرقم الأكاديمي'
        : 'كشف بأسماء الطلاب بدون الرقم الأكاديمي';

      const todayStr = new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });

      const rowsHtml = classStudents.length > 0 ? classStudents.map((st, idx) => `
        <tr>
          <td class="col-num">${idx + 1}</td>
          ${withCode ? `<td class="col-code">${st.studentCode}</td>` : ''}
          <td class="col-name">${st.name}</td>
          <td class="col-notes">&nbsp;</td>
        </tr>
      `).join('') : `
        <tr>
          <td colspan="${withCode ? 4 : 3}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
            لا توجد بيانات طلاب مسجلة في هذا الفصل
          </td>
        </tr>
      `;

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>${rosterTitle} - ${className}</title>
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
  .sr-main-title {
    font-size: 16.5px;
    font-weight: 800;
    color: #1e3a8a;
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
    text-align: center;
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
    width: 110px;
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
    min-width: 180px;
    text-align: right;
    background-color: #ffffff;
  }
  .sr-signatures {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    text-align: center;
    gap: 12px;
    margin-top: 28px;
    padding-top: 10px;
    page-break-inside: avoid;
  }
  .sr-sig-box strong {
    display: block;
    font-size: 11px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 25px;
  }
  .sr-sig-box .sig-line {
    border-bottom: 1px dashed #94a3b8;
    width: 80%;
    margin: 0 auto;
  }
  .sr-stamp-box {
    border: 1.5px dashed #1e3a8a;
    border-radius: 8px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 10px;
    font-weight: 700;
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
        <div class="sr-meta-item">الفصل الدراسي: <strong>${className}</strong></div>
        <div class="sr-meta-item">العام الدراسي: <strong>1447-1448هـ (2025-2026م)</strong></div>
        <div class="sr-meta-item">إجمالي الطلاب: <strong>${classStudents.length} طالب</strong></div>
        <div class="sr-meta-item">التاريخ: <strong>${todayStr}</strong></div>
      </div>
    </div>

    <table class="roster-table">
      <thead>
        <tr>
          <th style="width: 36px;">م</th>
          ${withCode ? '<th style="width: 110px;">الرقم الأكاديمي</th>' : ''}
          <th style="text-align: right;">اسم الطالب</th>
          <th style="width: 220px; text-align: right;">الملاحظات</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- تم تعطيل مربعات التوقيعات والختم لأنها لم تُطلب في المتطلبات
    <div class="sr-signatures">
      <div class="sr-sig-box">
        <strong>رائد / مربي الفصل</strong>
        <div class="sig-line"></div>
      </div>
      <div class="sr-sig-box">
        <strong>المرشد الطلابي / المشرف</strong>
        <div class="sig-line"></div>
      </div>
      <div class="sr-sig-box">
        <strong>مدير المدرسة</strong>
        <div class="sig-line"></div>
      </div>
      <div class="sr-stamp-box">
        ختم الإدارة المدرسية
      </div>
    </div>
    -->

    <div class="sr-footer">
      <div>تم إصدار الكشف آلياً عبر نظام إدارة رياض ومدارس أنوار العلى الدولية النموذجية</div>
      <div>صفحة 1 من 1</div>
    </div>
  </div>
</body>
</html>`;

      const frame = document.createElement('iframe');
      frame.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0;opacity:0;';
      document.body.appendChild(frame);
      const doc = frame.contentDocument;
      doc.open();
      doc.write(html);
      doc.close();

      const cleanup = () => {
        try {
          if (frame.parentNode) document.body.removeChild(frame);
        } catch (e) {}
        setIsPrintingRoster(false);
      };

      frame.contentWindow.addEventListener('afterprint', cleanup, { once: true });

      const images = [...doc.images].map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      }));

      Promise.all(images).then(() => {
        setTimeout(() => {
          frame.contentWindow.focus();
          frame.contentWindow.print();
          setShowPrintModal(false);
          setTimeout(cleanup, 60000);
        }, 150);
      }).catch(() => {
        frame.contentWindow.focus();
        frame.contentWindow.print();
        setShowPrintModal(false);
        setTimeout(cleanup, 60000);
      });

    } catch (err) {
      console.error('Print Error:', err);
      if (setToastMessage) setToastMessage(lang === 'ar' ? 'حدث خطأ أثناء إعداد كشف الطباعة' : 'Error generating print sheet');
      setIsPrintingRoster(false);
    }
  };


  // Student Form states
  const [modalStudentName, setModalStudentName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  // Edit Student Form states
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editStudentPhoto, setEditStudentPhoto] = useState('');
  const [editTuitionFee, setEditTuitionFee] = useState('0');
  const [editFormError, setEditFormError] = useState('');
  const [editParentNationalId, setEditParentNationalId] = useState('');
  const [editParentSearchText, setEditParentSearchText] = useState('');
  const [modalParentNationalId, setModalParentNationalId] = useState('');
  const [modalParentName, setModalParentName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalStudentPhoto, setModalStudentPhoto] = useState('');
  const [modalParentPhoto, setModalParentPhoto] = useState('');
  const [modalTuitionFee, setModalTuitionFee] = useState('0');
  const [formError, setFormError] = useState('');
  const [selectedParentLinkOption, setSelectedParentLinkOption] = useState('');
  const [parentSearchText, setParentSearchText] = useState('');

  useEffect(() => {
    if (showStudentModal || showEditStudentModal) {
      fetchParents('?per_page=1000');
    }
  }, [showStudentModal, showEditStudentModal, fetchParents]);


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

    const classObj = classes.find(c => c.id === selectedClassId);
    if (!classObj) {
      setFormError(lang === 'ar' ? 'الرجاء اختيار فصل دراسي صالح!' : 'Please select a valid class!');
      return;
    }

    const getStageIndex = (className) => {
      if (className.includes("تمهيدي أول") || className.includes("KG1") || className.includes("الروضة الأولى")) return "1";
      if (className.includes("تمهيدي ثاني") || className.includes("KG2") || className.includes("الروضة الثانية")) return "2";
      if (className.includes("الأول") && !className.includes("المتوسط") && !className.includes("الثانوي")) return "3";
      if (className.includes("الثاني") && !className.includes("المتوسط") && !className.includes("الثانوي")) return "4";
      if (className.includes("الثالث") && !className.includes("المتوسط") && !className.includes("الثانوي")) return "5";
      if (className.includes("الرابع")) return "6";
      if (className.includes("الخامس")) return "7";
      if (className.includes("السادس")) return "8";
      if (className.includes("المتوسط") && className.includes("الأول")) return "9";
      if (className.includes("المتوسط") && className.includes("الثاني")) return "10";
      if (className.includes("المتوسط") && className.includes("الثالث")) return "11";
      if (className.includes("الثانوي") && className.includes("الأول")) return "12";
      if (className.includes("الثانوي") && className.includes("الثاني")) return "13";
      if (className.includes("الثانوي") && className.includes("الثالث")) return "14";
      return "3";
    };

    const stageIndex = getStageIndex(classObj.grade);
    const existingCodes = students.map(s => parseInt(s.qrCode || s.student_code || 0, 10)).filter(n => !isNaN(n));
    const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 202630;
    const baseCode = parseInt(`2026${stageIndex}1`, 10);
    const nextCodeNum = Math.max(baseCode, maxCode + 1);
    const generatedStudentCode = String(nextCodeNum);
    const newId = Number(generatedStudentCode);

    const nameEnFallback = modalStudentName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    
    const newStudent = {
      id: newId,
      name: modalStudentName,
      nameEn: nameEnFallback,
      grade: classObj.grade,
      gradeEn: classObj.gradeEn || classObj.grade,
      section: classObj.section,
      sectionEn: classObj.sectionEn || classObj.section,
      parentName: parentNameVal,
      parentNameEn: parentNameVal,
      parentNationalId: parentNationalIdVal,
      phone: parentPhoneVal,
      status: 'absent', // registers as absent initially until scanned
      time: '--:--',
      qrCode: generatedStudentCode,
      photo: modalStudentPhoto,
      parentPhoto: parentPhotoVal,
      tuitionFee: Number(modalTuitionFee || 0)
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
    setIsSaving(true);
    handleAddStudent(newStudent, newGradeRow, newParentObj)
      .then((res) => {
        if (res && res.success) {
          setShowStudentModal(false);
          setPage(1);
          fetchStudents(buildQueryString({ page: 1 }));
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

  const openEditModal = (student) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name);
    const studentClass = classes.find(c => c.grade === student.grade && c.section === student.section);
    setEditClassId(studentClass ? studentClass.id : '');
    setEditStudentPhoto(student.photo || '');
    setEditTuitionFee(String(student.tuitionFee ?? student.tuition_fee ?? 0));
    setEditParentNationalId(student.parentNationalId || '');
    setEditParentSearchText('');
    setEditFormError('');
    setShowEditStudentModal(true);
  };

  const onEditSubmit = (e) => {
    e.preventDefault();
    setEditFormError('');

    if (!editStudentName.trim()) {
      setEditFormError(t.emptyError);
      return;
    }

    if (!editStudentPhoto) {
      setEditFormError(t.photoErrorStudent);
      return;
    }

    const classObj = classes.find(c => c.id === editClassId);
    if (!classObj) {
      setEditFormError(lang === 'ar' ? 'الرجاء اختيار فصل دراسي صالح!' : 'Please select a valid class!');
      return;
    }

    const selectedParent = parentUsers.find(p => p.nationalId === editParentNationalId);

    setIsSaving(true);
    handleEditStudent(editingStudentId, {
      name: editStudentName,
      grade: classObj.grade,
      gradeEn: classObj.gradeEn || classObj.grade,
      section: classObj.section,
      sectionEn: classObj.sectionEn || classObj.section,
      photo: editStudentPhoto,
      tuitionFee: Number(editTuitionFee || 0),
      parentId: selectedParent ? selectedParent.id : null,
      parentNationalId: editParentNationalId || null,
      parentName: selectedParent ? selectedParent.name : undefined,
      phone: selectedParent ? selectedParent.phone : undefined
    })
      .then((res) => {
        if (res && res.success) {
          setShowEditStudentModal(false);
          // Reset inputs on success only
          setModalStudentName('');
          if (classes.length > 0) {
            setSelectedClassId(classes[0].id);
          } else {
            setSelectedClassId('');
          }
          setModalParentNationalId('');
          setModalParentName('');
          setModalPhone('');
          setModalStudentPhoto('');
          setModalParentPhoto('');
          setModalTuitionFee('0');
          setSelectedParentLinkOption('');
          setParentSearchText('');
          fetchStudents(buildQueryString());
        } else {
          setEditFormError(res?.message || (lang === 'ar' ? 'فشلت العملية' : 'Operation failed'));
        }
      })
      .catch((err) => {
        setEditFormError(err.message || 'Error occurred');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleExportExcel = async (classId = '') => {
    try {
      setIsExporting(true);
      const res = await studentsService.exportStudents(classId);
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تصدير البيانات' : 'Failed to export data');
        setIsExporting(false);
        return;
      }
      const blob = await res.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = 'students_export.xlsx';
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

  const handleDownloadExcelTemplate = async (classId = '') => {
    try {
      setIsLoadingTemplate(true);
      const res = await studentsService.downloadTemplate(classId);
      if (!res.ok) {
        alert(lang === 'ar' ? 'فشل تحميل النموذج' : 'Failed to download template');
        setIsLoadingTemplate(false);
        return;
      }
      const blob = await res.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = 'students_template.xlsx';
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
    e.preventDefault();
    if (!importFile) {
      alert(lang === 'ar' ? 'يرجى اختيار ملف أولاً' : 'Please select a file first');
      return;
    }

    setIsImporting(true);
    setImportProgress(10);
    setImportStatus(lang === 'ar' ? 'جاري رفع الملف...' : 'Uploading file...');
    setImportErrors([]);
    setImportWarnings([]);
    setImportSuccess(false);

    const formData = new FormData();
    formData.append('file', importFile);
    if (excelDefaultClassId) {
      formData.append('class_id', excelDefaultClassId);
    }

    // Mock progress animation
    importIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        clearInterval(importIntervalRef.current);
        importIntervalRef.current = null;
        return;
      }
      setImportProgress(prev => {
        if (prev >= 85) {
          if (importIntervalRef.current) {
            clearInterval(importIntervalRef.current);
            importIntervalRef.current = null;
          }
          return 85;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const data = await studentsService.importStudents(formData);
      if (importIntervalRef.current) {
        clearInterval(importIntervalRef.current);
        importIntervalRef.current = null;
      }
      if (!isMountedRef.current) return;
      setImportProgress(100);
      if (data.success) {
        setImportSuccess(true);
        setImportStatus(data.message);
        if (data.errors && data.errors.length > 0) {
          setImportErrors(data.errors);
        }
        if (data.warnings && data.warnings.length > 0) {
          setImportWarnings(data.warnings);
        }
        setToastMessage(data.message);
        fetchStudents(localStorage.getItem('auth_token'));
      } else {
        setImportStatus(lang === 'ar' ? 'فشل استيراد البيانات' : 'Import failed');
        if (data.errors && data.errors.length > 0) {
          setImportErrors(data.errors);
        } else {
          setImportErrors([data.message || (lang === 'ar' ? 'فشل استيراد البيانات' : 'Import failed')]);
        }
      }
    } catch (err) {
      if (importIntervalRef.current) {
        clearInterval(importIntervalRef.current);
        importIntervalRef.current = null;
      }
      if (!isMountedRef.current) return;
      setImportProgress(100);
      setImportStatus(lang === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم' : 'Error communicating with server');
      setImportErrors([err.message || 'Error']);
      console.error(err);
    } finally {
      if (isMountedRef.current) {
        setIsImporting(false);
      }
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (currentUser?.role === 'parent' && student.parentNationalId !== currentUser.username) {
        return false;
      }
      if (statusFilter === 'present') {
        return student.status === 'present' || student.status === 'late';
      }
      if (statusFilter === 'absent') {
        return student.status !== 'present' && student.status !== 'late';
      }
      return true;
    });
  }, [students, currentUser, statusFilter]);

  const filteredParentUsers = useMemo(() => {
    return parentUsers.filter(p => {
      const term = parentSearchText.trim().toLowerCase();
      if (!term) return true;
      return p.name.toLowerCase().includes(term) || p.nationalId.includes(term);
    });
  }, [parentUsers, parentSearchText]);

  const filteredEditParentUsers = useMemo(() => {
    return parentUsers.filter(p => {
      const term = editParentSearchText.trim().toLowerCase();
      if (!term) return true;
      return p.name.toLowerCase().includes(term) || (p.nationalId && p.nationalId.includes(term));
    });
  }, [parentUsers, editParentSearchText]);

  const selectedEditParentObj = useMemo(() => {
    return parentUsers.find(p => p.nationalId === editParentNationalId);
  }, [parentUsers, editParentNationalId]);

  const editParentNameMismatchInfo = useMemo(() => {
    if (!editStudentName.trim() || !selectedEditParentObj?.name) return null;
    const studentParts = editStudentName.trim().split(/\s+/);
    if (studentParts.length < 2) return null;
    const fatherName = studentParts[1];
    const parentParts = selectedEditParentObj.name.trim().split(/\s+/);
    const parentFirstName = parentParts[0];
    const isCompound = ['عبد', 'ابو', 'أبو', 'زين', 'شمس', 'مجيب', 'عماد', 'امير', 'آية', 'تالين', 'نوره'].some(p => fatherName.startsWith(p));
    if (fatherName !== parentFirstName && !isCompound) {
      return {
        fatherName,
        parentFirstName,
        parentFullName: selectedEditParentObj.name,
      };
    }
    return null;
  }, [editStudentName, selectedEditParentObj]);

  const suggestedEditParent = useMemo(() => {
    if (!editStudentName.trim() || !parentUsers.length) return null;
    const parts = editStudentName.trim().split(/\s+/);
    if (parts.length < 3) return null;
    const fatherFullName = parts.slice(1).join(' ');
    const match = parentUsers.find(p => {
      if (p.nationalId === editParentNationalId) return false;
      const pName = p.name.trim();
      return pName.includes(fatherFullName) || fatherFullName.includes(pName);
    });
    return match || null;
  }, [editStudentName, parentUsers, editParentNationalId]);

  const selectedAddParentObj = useMemo(() => {
    return parentUsers.find(p => p.nationalId === selectedParentLinkOption);
  }, [parentUsers, selectedParentLinkOption]);

  const addParentNameMismatchInfo = useMemo(() => {
    if (!modalStudentName.trim() || !selectedAddParentObj?.name) return null;
    const studentParts = modalStudentName.trim().split(/\s+/);
    if (studentParts.length < 2) return null;
    const fatherName = studentParts[1];
    const parentParts = selectedAddParentObj.name.trim().split(/\s+/);
    const parentFirstName = parentParts[0];
    const isCompound = ['عبد', 'ابو', 'أبو', 'زين', 'شمس', 'مجيب', 'عماد', 'امير', 'آية', 'تالين', 'نوره'].some(p => fatherName.startsWith(p));
    if (fatherName !== parentFirstName && !isCompound) {
      return {
        fatherName,
        parentFirstName,
        parentFullName: selectedAddParentObj.name,
      };
    }
    return null;
  }, [modalStudentName, selectedAddParentObj]);

  const suggestedAddParent = useMemo(() => {
    if (!modalStudentName.trim() || !parentUsers.length) return null;
    const parts = modalStudentName.trim().split(/\s+/);
    if (parts.length < 3) return null;
    const fatherFullName = parts.slice(1).join(' ');
    const match = parentUsers.find(p => {
      if (p.nationalId === selectedParentLinkOption) return false;
      const pName = p.name.trim();
      return pName.includes(fatherFullName) || fatherFullName.includes(pName);
    });
    return match || null;
  }, [modalStudentName, parentUsers, selectedParentLinkOption]);

  return (
    <>
      <div className="section-card">
        <div className="section-card-header no-print">
          <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
            {lang === 'ar' ? 'سجل شؤون الطلاب والبطاقات الذكية' : 'Student Registry & Smart Cards'}
          </h3>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Print Roster Button */}
            <button
              className="btn-elevated"
              onClick={() => {
                const initialClassId = allowedClasses.length > 0
                  ? (typeof allowedClasses[0].id === 'string' && allowedClasses[0].id.startsWith('cls-') ? allowedClasses[0].id.replace('cls-', '') : String(allowedClasses[0].id))
                  : '';
                setPrintClassId(initialClassId);
                setPrintRosterType('without_code');
                setShowPrintModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(234, 88, 12, 0.08)',
                borderColor: 'rgba(234, 88, 12, 0.25)',
                color: '#ea580c'
              }}
            >
              <Printer size={16} />
              {lang === 'ar' ? 'طباعة كشف' : 'Print Roster'}
            </button>
            {(canAction('students', 'export') || canAction('students', 'import')) && (
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
                  if (allowedClasses.length > 0) {
                    setSelectedClassId(allowedClasses[0].id);
                  } else {
                    setSelectedClassId('');
                  }
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
        <div className="students-controls no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            <div className="search-box" style={{ margin: 0, minWidth: '280px' }}>
              <Search size={18} />
              <input 
                id="search-students"
                name="search"
                type="text"
                className="text-field"
                placeholder={lang === 'ar' ? 'البحث باسم الطالب، الرقم الأكاديمي، أو هوية ولي الأمر...' : 'Search by student name, number, or parent national ID...'}
                value={searchQuery}
                aria-label={lang === 'ar' ? 'البحث باسم الطالب' : 'Search students'}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearch(e.target.value);
                }}
              />
            </div>

            {/* Class Filter Dropdown */}
            <select 
              id="filter-students-class"
              name="class_filter"
              aria-label={lang === 'ar' ? 'تصفية حسب الفصل' : 'Filter by class'}
              className="text-field"
              value={classFilter}
              onChange={(e) => setFilters({ class_id: e.target.value })}
              style={{ fontSize: '13px', padding: '0 12px', height: '42px', width: 'auto', minWidth: '180px', borderRadius: '10px' }}
            >
              <option value="all">{lang === 'ar' ? '🔍 كل الفصول' : '🔍 All Classes'}</option>
              {(allowedClasses || []).map(cls => {
                // Ensure cls.id is clean numeric ID for the backend filter
                const numericId = typeof cls.id === 'string' && cls.id.startsWith('cls-')
                  ? cls.id.replace('cls-', '')
                  : cls.id;
                return (
                  <option key={cls.id} value={numericId}>
                    🏫 {lang === 'ar' ? cls.name : cls.nameEn}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className={`chip ${statusFilter === 'all' ? 'selected' : ''}`}
              onClick={() => setFilters({ status: 'all' })}
            >
              {t.filterAll}
            </button>
            <button 
              className={`chip ${statusFilter === 'present' ? 'selected' : ''}`}
              onClick={() => setFilters({ status: 'present' })}
            >
              {t.present}
            </button>
            <button 
              className={`chip ${statusFilter === 'absent' ? 'selected' : ''}`}
              onClick={() => setFilters({ status: 'absent' })}
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
                <th className="sticky-col-1">{t.studentId}</th>
                <th className="sticky-col-2">{t.studentName}</th>
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
                    <td className="sticky-col-1" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{student.qrCode || student.id}</td>
                    <td className="sticky-col-2" style={{ fontWeight: '600', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ flexShrink: 0 }}>{renderAvatar(student.photo, "👨‍🎓")}</span>
                        <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{lang === 'ar' ? student.name : student.nameEn}</span>
                      </div>
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          className="btn-elevated"
                          style={{ padding: '6px 12px', fontSize: '12px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => {
                            setSelectedStudentForCard(student);
                            setShowCardVisualizerModal(true);
                          }}
                        >
                          🪪 {t.viewCard}
                        </button>
                        
                        {canAction('students', 'update', student.class_id) && (
                          <button 
                            onClick={() => openEditModal(student)} 
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
                            <Edit2 size={15} />
                          </button>
                        )}

                        {canAction('students', 'delete', student.class_id) && (
                          <button 
                            onClick={() => {
                              triggerConfirm({
                                title: lang === 'ar' ? 'حذف الطالب' : 'Delete Student',
                                message: lang === 'ar' ? `هل أنت متأكد من حذف الطالب ${student.name}؟` : `Are you sure you want to delete ${student.name}?`,
                                onConfirm: () => {
                                  handleDeleteStudent(student.id).then((res) => {
                                    if (res && res.success) {
                                      const nextQs = goToPrevIfEmpty(students.length - 1);
                                      fetchStudents(nextQs);
                                    }
                                  });
                                }
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '32px' }}>
                        {search ? "🔍" : (filters.class_id && filters.class_id !== 'all') ? "ℹ️" : "📂"}
                      </span>
                      <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                        {search 
                          ? (lang === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matching search results found')
                          : (filters.class_id && filters.class_id !== 'all')
                            ? (lang === 'ar' ? 'لا توجد نتائج تطابق التصفية المحددة' : 'No matching filter results found')
                            : (lang === 'ar' ? 'لا يوجد طلاب مسجلين حالياً' : 'No students registered yet')
                        }
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {search 
                          ? (lang === 'ar' ? 'جرب البحث بكلمة مفتاحية مختلفة' : 'Try searching for a different keyword')
                          : (filters.class_id && filters.class_id !== 'all')
                            ? (lang === 'ar' ? 'جرب تغيير خيارات التصفية' : 'Try changing your filter selections')
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
        <div className="no-print" style={{ padding: '0 var(--space-md)' }}>
          <PaginationBar
            page={page}
            lastPage={studentsPagination.lastPage}
            total={studentsPagination.total}
            from={studentsPagination.from}
            to={studentsPagination.to}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            loading={loading}
            lang={lang}
          />
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
                  <label htmlFor="add-student-name" className="form-label">{t.formStudentName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    id="add-student-name"
                    name="name"
                    type="text" 
                    className="text-field"
                    placeholder="مثال: عبدالمجيد بن فهد العتيبي"
                    value={modalStudentName}
                    onChange={(e) => setModalStudentName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="add-student-class" className="form-label">{lang === 'ar' ? 'الفصل الدراسي والشعبة' : 'Class & Section'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <select 
                    id="add-student-class"
                    name="class_id"
                    className="text-field"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    required
                  >
                    <option value="">{lang === 'ar' ? '-- اختر الفصل --' : '-- Select Class --'}</option>
                    {allowedClasses.map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ar' ? c.name : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="add-student-tuition" className="form-label">{lang === 'ar' ? 'الرسوم الدراسية السنوية (ر.ي)' : 'Annual Tuition Fee (R.Y)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    id="add-student-tuition"
                    name="tuition"
                    type="number" 
                    className="text-field"
                    placeholder="0"
                    value={modalTuitionFee}
                    onChange={(e) => setModalTuitionFee(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                  <label htmlFor="add-student-parent-search" className="form-label">{lang === 'ar' ? 'ربط بحساب ولي أمر' : 'Link to Parent Account'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  
                  {/* Parent Search Input */}
                  <input
                    id="add-student-parent-search"
                    name="parent_search"
                    type="text"
                    className="text-field"
                    style={{ marginBottom: '8px' }}
                    placeholder={lang === 'ar' ? '🔍 اكتب اسم ولي الأمر أو الرقم الوطني للبحث...' : '🔍 Type parent name or national ID to search...'}
                    value={parentSearchText}
                    onChange={(e) => setParentSearchText(e.target.value)}
                    aria-label={lang === 'ar' ? 'البحث عن ولي أمر' : 'Search parent'}
                  />

                  <select
                    id="add-student-parent-select"
                    name="parent_national_id"
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
                      📞 {lang === 'ar' ? 'رقم الجوال: ' : 'Phone Number: '} {modalPhone}
                    </div>

                    {/* Real-time Mismatch Advisory Note */}
                    {addParentNameMismatchInfo && (
                      <div style={{
                        marginTop: '8px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(234, 179, 8, 0.08)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        color: '#854d0e',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        lineHeight: '1.5'
                      }}>
                        <span style={{ fontSize: '14px', marginTop: '1px' }}>ℹ️</span>
                        <div>
                          {lang === 'ar' ? (
                            <>
                              <strong>ملاحظة للتأكيد:</strong> اسم ولي الأمر المختار (<strong>{addParentNameMismatchInfo.parentFirstName}</strong>) يختلف عن اسم والد الطالب (<strong>{addParentNameMismatchInfo.fatherName}</strong>).
                              <div style={{ fontSize: '11px', marginTop: '3px', opacity: 0.9 }}>
                                إذا كان ولي الأمر عمه أو خاله أو كفيله فهذا طبيعي؛ يرجى فقط التأكد قبل الحفظ.
                              </div>
                            </>
                          ) : (
                            <>
                              <strong>Note:</strong> Selected parent ({addParentNameMismatchInfo.parentFirstName}) differs from student father's name ({addParentNameMismatchInfo.fatherName}).
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sibling / Father Suggestion Helper for Add Student */}
                {suggestedAddParent && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#15803d',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      💡 {lang === 'ar' ? 'تم العثور على ولي أمر يطابق اسم والد الطالب:' : 'Found parent matching student father:'}{' '}
                      <strong>{suggestedAddParent.name}</strong> ({suggestedAddParent.nationalId})
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedParentLinkOption(suggestedAddParent.nationalId);
                        setModalParentNationalId(suggestedAddParent.nationalId);
                        setModalParentName(suggestedAddParent.name);
                        setModalPhone(suggestedAddParent.phone);
                        setModalParentPhoto(suggestedAddParent.photo || '🧔');
                      }}
                    >
                      {lang === 'ar' ? 'ربط بهذا الولي' : 'Link to this parent'}
                    </button>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">
                      {t.formPhoto} (Student) <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
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
                      
                      <div style={{ position: 'relative' }}>
                        {/* Circle Container */}
                        <label 
                          htmlFor="student-photo-input" 
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            border: modalStudentPhoto ? '2px solid var(--color-primary)' : '2px dashed var(--color-border)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            backgroundColor: 'var(--color-surface)',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          className="avatar-upload-label"
                        >
                          {modalStudentPhoto ? (
                            <>
                              <img 
                                src={modalStudentPhoto} 
                                alt="Student Preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              {/* Hover overlay to change image */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                color: '#ffffff',
                                fontSize: '11px'
                              }} className="avatar-hover-overlay">
                                <Camera size={20} style={{ marginBottom: '4px' }} />
                                <span>{lang === 'ar' ? 'تغيير الصورة' : 'Change'}</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                              <User size={36} style={{ strokeWidth: 1.5, marginBottom: '4px', color: 'var(--color-text-tertiary)' }} />
                              <span style={{ fontSize: '11px', fontWeight: '500' }}>
                                {lang === 'ar' ? 'رفع الصورة' : 'Upload'}
                              </span>
                            </div>
                          )}
                        </label>

                        {/* Delete / Clear button */}
                        {modalStudentPhoto && (
                          <button
                            type="button"
                            onClick={() => {
                              setModalStudentPhoto(null);
                              const fileInput = document.getElementById('student-photo-input');
                              if (fileInput) fileInput.value = '';
                            }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: '#ef4444',
                              color: '#ffffff',
                              border: '2px solid #ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                              zIndex: 10,
                              padding: 0
                            }}
                            title={lang === 'ar' ? 'إزالة الصورة' : 'Remove Photo'}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '4px' }}>
                        {lang === 'ar' ? 'صيغ الصور المدعومة: JPG, PNG. الحد الأقصى 5MB.' : 'Supported formats: JPG, PNG. Max 5MB.'}
                      </span>
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

      {/* MODAL DIALOG 3: EDIT STUDENT FORM */}
      {showEditStudentModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container">
            <header className="modal-header">
              <h2 className="headline-small" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {lang === 'ar' ? '✏️ تعديل بيانات الطالب' : '✏️ Edit Student Details'}
              </h2>
              <button 
                className="btn-text" 
                onClick={() => setShowEditStudentModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={onEditSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {editFormError && (
                  <div style={{ color: 'var(--color-error)', fontSize: '13px', fontWeight: '600', padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '6px' }}>
                    ⚠️ {editFormError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="edit-student-name" className="form-label">{t.studentName} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    id="edit-student-name"
                    name="name"
                    type="text" 
                    className="text-field"
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: ياسر بن محمد الرويلي' : 'e.g. Yasser bin Mohammed'}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-student-class" className="form-label">{lang === 'ar' ? 'الفصل الدراسي والشعبة' : 'Class & Section'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <select 
                    id="edit-student-class"
                    name="class_id"
                    className="text-field"
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
                    required
                  >
                    <option value="">{lang === 'ar' ? '-- اختر الفصل --' : '-- Select Class --'}</option>
                    {allowedClasses.map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ar' ? c.name : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-student-tuition" className="form-label">{lang === 'ar' ? 'الرسوم الدراسية السنوية (ر.ي)' : 'Annual Tuition Fee (R.Y)'} <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    id="edit-student-tuition"
                    name="tuition"
                    type="number" 
                    className="text-field"
                    value={editTuitionFee}
                    onChange={(e) => setEditTuitionFee(e.target.value)}
                    required
                  />
                </div>

                {/* Parent Selection for Edit Student */}
                <div className="form-group">
                  <label htmlFor="edit-student-parent-search" className="form-label">
                    {lang === 'ar' ? 'بحث عن ولي أمر الطالب' : 'Search for Parent'}
                  </label>
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <Search size={16} style={{ position: 'absolute', top: '14px', [lang === 'ar' ? 'right' : 'left']: '12px', color: 'var(--color-text-secondary)', pointerEvents: 'none' }} />
                    <input
                      id="edit-student-parent-search"
                      type="text"
                      className="text-field"
                      style={{ paddingInlineStart: '36px' }}
                      placeholder={lang === 'ar' ? 'ابحث بالاسم أو رقم الهوية الوطنية...' : 'Search by name or National ID...'}
                      value={editParentSearchText}
                      onChange={(e) => setEditParentSearchText(e.target.value)}
                    />
                  </div>

                  <label htmlFor="edit-student-parent-select" className="form-label">
                    {lang === 'ar' ? 'ولي الأمر المرتبط' : 'Linked Parent'} <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <select
                    id="edit-student-parent-select"
                    name="edit_parent_national_id"
                    className="text-field"
                    value={editParentNationalId}
                    onChange={(e) => setEditParentNationalId(e.target.value)}
                    required
                  >
                    <option value="">{lang === 'ar' ? '-- اختر ولي الأمر --' : '-- Select Parent --'}</option>
                    {filteredEditParentUsers.map(p => (
                      <option key={p.nationalId} value={p.nationalId}>
                        {p.name} ({p.nationalId})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEditParentObj && (
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
                      {renderAvatar(selectedEditParentObj.photo, "🧔")}
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedEditParentObj.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'الرقم الوطني لولي الأمر: ' : 'National ID: '}{selectedEditParentObj.nationalId}
                        </div>
                      </div>
                    </div>
                    {selectedEditParentObj.phone && (
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📞 {lang === 'ar' ? 'رقم الجوال: ' : 'Phone Number: '} {selectedEditParentObj.phone}
                      </div>
                    )}

                    {/* Real-time Mismatch Advisory Note */}
                    {editParentNameMismatchInfo && (
                      <div style={{
                        marginTop: '8px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(234, 179, 8, 0.08)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        color: '#854d0e',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        lineHeight: '1.5'
                      }}>
                        <span style={{ fontSize: '14px', marginTop: '1px' }}>ℹ️</span>
                        <div>
                          {lang === 'ar' ? (
                            <>
                              <strong>ملاحظة للتأكيد:</strong> اسم ولي الأمر المختار (<strong>{editParentNameMismatchInfo.parentFirstName}</strong>) يختلف عن اسم والد الطالب (<strong>{editParentNameMismatchInfo.fatherName}</strong>).
                              <div style={{ fontSize: '11px', marginTop: '3px', opacity: 0.9 }}>
                                إذا كان ولي الأمر عمه أو خاله أو كفيله فهذا طبيعي؛ يرجى فقط التأكد قبل الحفظ.
                              </div>
                            </>
                          ) : (
                            <>
                              <strong>Note:</strong> Selected parent ({editParentNameMismatchInfo.parentFirstName}) differs from student father's name ({editParentNameMismatchInfo.fatherName}).
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sibling / Father Suggestion Helper for Edit Student */}
                {suggestedEditParent && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#15803d',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      💡 {lang === 'ar' ? 'تم العثور على ولي أمر يطابق اسم والد الطالب:' : 'Found parent matching student father:'}{' '}
                      <strong>{suggestedEditParent.name}</strong> ({suggestedEditParent.nationalId})
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setEditParentNationalId(suggestedEditParent.nationalId);
                      }}
                    >
                      {lang === 'ar' ? 'ربط بهذا الولي' : 'Link to this parent'}
                    </button>
                  </div>
                )}


                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">
                      {t.formPhoto} (Student) <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        id="edit-student-photo-input"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditStudentPhoto(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      
                      <div style={{ position: 'relative' }}>
                        <label 
                          htmlFor="edit-student-photo-input" 
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            border: editStudentPhoto ? '2px solid var(--color-primary)' : '2px dashed var(--color-border)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            backgroundColor: 'var(--color-surface)',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          className="avatar-upload-label"
                        >
                          {editStudentPhoto ? (
                            <>
                              <img 
                                src={editStudentPhoto} 
                                alt="Student Preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                color: '#ffffff',
                                fontSize: '11px'
                              }} className="avatar-hover-overlay">
                                <Camera size={20} style={{ marginBottom: '4px' }} />
                                <span>{lang === 'ar' ? 'تغيير الصورة' : 'Change'}</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                              <User size={36} style={{ strokeWidth: 1.5, marginBottom: '4px', color: 'var(--color-text-tertiary)' }} />
                              <span style={{ fontSize: '11px', fontWeight: '500' }}>
                                {lang === 'ar' ? 'رفع الصورة' : 'Upload'}
                              </span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button 
                  type="button" 
                  className="btn-elevated" 
                  onClick={() => setShowEditStudentModal(false)}
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
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
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
                {lang === 'ar' ? '📥 استيراد الطلاب' : '📥 Import Students'}
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
                   {/* Select Default Class */}
                  <div className="form-group">
                    <label htmlFor="import-target-class" className="form-label" style={{ fontWeight: '600' }}>
                      {lang === 'ar' ? 'حدد الفصل الدراسي المستهدف للاستيراد:' : 'Target Class for Import:'} <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <select
                      id="import-target-class"
                      name="import_class_id"
                      className="text-field"
                      value={excelDefaultClassId}
                      onChange={(e) => setExcelDefaultClassId(e.target.value)}
                      required
                    >
                      <option value="">{lang === 'ar' ? '-- اختر الفصل الدراسي --' : '-- Select Class --'}</option>
                      {allowedClasses.map(c => (
                        <option key={c.id} value={c.id}>
                          {lang === 'ar' ? c.name : c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Drag-n-drop file container */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600' }}>
                      {lang === 'ar' ? 'ملف Excel المراد استيراده (.xlsx)' : 'Excel File to Import (.xlsx)'}
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
                        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                          setImportFile(file);
                        } else {
                          alert(lang === 'ar' ? 'يرجى اختيار ملف Excel بصيغة xlsx.' : 'Please choose an Excel file with xlsx extension.');
                        }
                      }}
                    >
                      <input 
                        type="file" 
                        id="excel-file-uploader" 
                        accept=".xlsx, .xls"
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
                              {lang === 'ar' ? 'صيغة الملف المدعومة: Excel (.xlsx)' : 'Supported extension: Excel (.xlsx)'}
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

                      {/* Warnings list (Yellow/Advisory) */}
                      {importWarnings.length > 0 && (
                        <div style={{ marginTop: '14px', borderTop: '1px dashed var(--color-border)', paddingTop: '12px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <span>💡 {lang === 'ar' ? 'تنبيهات تدقيق أولياء الأمور (يرجى مراجعتها):' : 'Parent Audit Advisories (Please review):'}</span>
                          </div>
                          <ul style={{ 
                            maxHeight: '140px', 
                            overflowY: 'auto', 
                            paddingInlineStart: '16px', 
                            margin: 0, 
                            fontSize: '12px', 
                            color: '#92400e',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            backgroundColor: 'rgba(234, 179, 8, 0.05)',
                            padding: '8px 12px',
                            borderRadius: '8px'
                          }}>
                            {importWarnings.map((warn, i) => (
                              <li key={i} style={{ direction: 'rtl', textAlign: 'right' }}>{warn}</li>
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
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--color-text)' }}>
                      {lang === 'ar' ? '1. تحميل نموذج Excel فارغ' : '1. Download Empty Excel Template'}
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'اختر الفصل لتخصيص القالب (اختياري):' : 'Select Class for Custom Template (Optional):'}
                        </label>
                        <select
                          className="text-field"
                          value={excelTemplateClassId}
                          onChange={(e) => setExcelTemplateClassId(e.target.value)}
                          style={{ height: '42px', padding: '0 12px' }}
                        >
                          <option value="">{lang === 'ar' ? '-- الصف الافتراضي (ثالث ثانوي) --' : '-- Default Class (Grade 3) --'}</option>
                          {allowedClasses.map(c => (
                            <option key={c.id} value={c.id}>
                              {lang === 'ar' ? c.name : c.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="btn-accent"
                        onClick={() => handleDownloadExcelTemplate(excelTemplateClassId)}
                        disabled={isLoadingTemplate}
                        style={{ height: '42px', padding: '0 20px', backgroundColor: '#31859C', borderColor: '#31859C' }}
                      >
                        {isLoadingTemplate ? (
                          lang === 'ar' ? 'جاري التحميل...' : 'Downloading...'
                        ) : (
                          lang === 'ar' ? 'تحميل القالب' : 'Download Template'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Export Students Box */}
                  <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '16px', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--color-text)' }}>
                      {lang === 'ar' ? '2. تصدير بيانات الطلاب الحالية' : '2. Export Current Students Data'}
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                          {lang === 'ar' ? 'تصدير طلاب فصل محدد أو الكل:' : 'Export Class Students or All:'}
                        </label>
                        <select
                          className="text-field"
                          value={excelExportClassId}
                          onChange={(e) => setExcelExportClassId(e.target.value)}
                          style={{ height: '42px', padding: '0 12px' }}
                        >
                          <option value="">{lang === 'ar' ? '🔍 تصدير كل الطلاب' : '🔍 Export All Students'}</option>
                          {allowedClasses.map(c => (
                            <option key={c.id} value={c.id}>
                              🏫 {lang === 'ar' ? c.name : c.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="btn-filled"
                        onClick={() => handleExportExcel(excelExportClassId)}
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
      {/* ─── Print Roster Modal ─────────────────────────────────────── */}
      {showPrintModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1050,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={20} style={{ color: '#ea580c' }} />
                {lang === 'ar' ? 'طباعة كشف الطلاب' : 'Print Student Roster'}
              </h3>
              <button onClick={() => setShowPrintModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Class Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'اختر الصف والشعبة' : 'Select Class'}
              </label>
              <select
                className="text-field"
                value={printClassId}
                onChange={e => setPrintClassId(e.target.value)}
                style={{ width: '100%', height: '44px', borderRadius: '10px', fontSize: '14px', padding: '0 12px' }}
              >
                <option value="">{lang === 'ar' ? '-- اختر الفصل --' : '-- Select Class --'}</option>
                {(allowedClasses || []).map(cls => {
                  const numId = typeof cls.id === 'string' && cls.id.startsWith('cls-') ? cls.id.replace('cls-', '') : String(cls.id);
                  return (
                    <option key={cls.id} value={numId}>
                      {lang === 'ar' ? cls.name : (cls.nameEn || cls.name)}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Roster Type */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'نوع الكشف' : 'Roster Type'}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { value: 'without_code', ar: 'كشف بأسماء الطلاب بدون الرقم الأكاديمي', en: 'Student roster without academic number' },
                  { value: 'with_code',    ar: 'كشف أسماء الطلاب مع الرقم الأكاديمي', en: 'Student roster with academic number' }
                ].map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
                    padding: '12px 14px', borderRadius: '10px', border: `2px solid ${printRosterType === opt.value ? '#ea580c' : 'var(--color-border)'}`,
                    background: printRosterType === opt.value ? 'rgba(234,88,12,0.06)' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}>
                    <input
                      type="radio"
                      name="rosterType"
                      value={opt.value}
                      checked={printRosterType === opt.value}
                      onChange={() => setPrintRosterType(opt.value)}
                      style={{ marginTop: '2px', accentColor: '#ea580c' }}
                    />
                    <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{lang === 'ar' ? opt.ar : opt.en}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-elevated"
                onClick={() => setShowPrintModal(false)}
                style={{ height: '44px', padding: '0 18px' }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handlePrintRoster}
                disabled={!printClassId || isPrintingRoster}
                style={{
                  height: '44px', padding: '0 22px', borderRadius: '10px',
                  background: (!printClassId || isPrintingRoster) ? '#ccc' : '#ea580c',
                  color: '#fff', border: 'none', cursor: (!printClassId || isPrintingRoster) ? 'not-allowed' : 'pointer',
                  fontWeight: '600', fontSize: '14px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                {isPrintingRoster ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    {lang === 'ar' ? 'جاري تجهيز الكشف...' : 'Preparing Roster...'}
                  </>
                ) : (
                  <>
                    <Printer size={16} />
                    {lang === 'ar' ? 'طباعة' : 'Print'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}