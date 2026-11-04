import { useState, useMemo, useEffect } from 'react';
import { Printer, X, FileSpreadsheet, Calendar, Layers, Award, CheckCircle2, FileCheck2, Eye } from 'lucide-react';
import SearchableSelect from '../SearchableSelect';
import { SLOGAN_BASE64 } from '../../assets/sloganBase64';
import { calculateMonthTotal } from '../../utils/gradesHelper';

const getGradeEstimate = (total, max = 100) => {
  if (total === null || total === undefined || isNaN(total) || max <= 0) return '-';
  const ratio = (total / max) * 100;
  if (ratio >= 90) return 'ممتاز';
  if (ratio >= 80) return 'جيد جداً';
  if (ratio >= 65) return 'جيد';
  if (ratio >= 50) return 'مقبول';
  return 'ضعيف';
};

const formatDenseHeader = (title) => {
  if (!title) return '';
  const words = String(title).trim().split(/\s+/);
  if (words.length <= 1) {
    return `<span class="col-term-word">${words[0]}</span>`;
  }
  return words.map(w => `<span class="col-term-word">${w}</span>`).join('');
};

export default function GradesDirectPrintModal({
  isOpen,
  onClose,
  lang = 'ar',
  classes = [],
  students = [],
  subjects = [],
  selectedClass = '',
  selectedGradeTerm = 'term1',
  selectedMonth = 'm1',
  selectedGradeStudentId = null,
  detailedGrades = [],
  fetchClassGrades,
  initialTemplate = 'template_1_blank_year',
}) {
  const [activeTemplate, setActiveTemplate] = useState(initialTemplate);
  const [scopeType, setScopeType] = useState('section'); // 'section' | 'grade' | 'student'
  const [targetSection, setTargetSection] = useState(selectedClass || '');
  const [targetGrade, setTargetGrade] = useState('');
  const [targetStudentId, setTargetStudentId] = useState(selectedGradeStudentId || '');
  const [targetTerm, setTargetTerm] = useState(selectedGradeTerm || 'term1'); // 'term1' | 'term2' | 'yearly'
  const [targetMonth, setTargetMonth] = useState(selectedMonth || 'm1'); // 'm1' | 'm2' | 'm3'
  const [targetSubjectMode, setTargetSubjectMode] = useState('all'); // 'all' or specific subject name
  const [orientationMode, setOrientationMode] = useState('auto'); // 'auto' | 'landscape' | 'portrait'
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Sync defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTemplate) setActiveTemplate(initialTemplate);
      if (selectedClass) setTargetSection(selectedClass);
      if (selectedGradeTerm) setTargetTerm(selectedGradeTerm);
      if (selectedMonth) setTargetMonth(selectedMonth);
      if (selectedGradeStudentId) setTargetStudentId(selectedGradeStudentId);
    }
  }, [isOpen, initialTemplate, selectedClass, selectedGradeTerm, selectedMonth, selectedGradeStudentId]);

  // Unique grades list
  const uniqueGradesList = useMemo(() => {
    const set = new Set();
    classes.forEach(c => {
      const g = c.grade || c.grade_ar;
      if (g) set.add(g);
    });
    return Array.from(set);
  }, [classes]);

  useEffect(() => {
    if (!targetGrade && uniqueGradesList.length > 0) {
      const matchedClass = classes.find(c => `${c.grade} - ${c.section}` === targetSection || c.name === targetSection);
      setTargetGrade(matchedClass ? (matchedClass.grade || matchedClass.grade_ar) : uniqueGradesList[0]);
    }
  }, [uniqueGradesList, targetGrade, targetSection, classes]);

  const sectionsList = useMemo(() => {
    return classes.map(c => `${c.grade} - ${c.section}`);
  }, [classes]);

  useEffect(() => {
    if (!targetSection && sectionsList.length > 0) {
      setTargetSection(sectionsList[0]);
    }
  }, [sectionsList, targetSection]);

  useEffect(() => {
    if (!targetStudentId && students.length > 0) {
      setTargetStudentId(students[0].id);
    }
  }, [students, targetStudentId]);

  // Automatically adjust valid scope when switching templates
  useEffect(() => {
    if (
      activeTemplate === 'template_1_blank_year' ||
      activeTemplate === 'template_2_monthly_sheet' ||
      activeTemplate === 'template_3_three_months' ||
      activeTemplate === 'template_4_term_final'
    ) {
      if (scopeType === 'student') {
        setScopeType('section');
      }
      if (targetTerm === 'yearly') {
        setTargetTerm(selectedGradeTerm || 'term1');
      }
    }
  }, [activeTemplate, scopeType, targetTerm, selectedGradeTerm]);

  // Determine subjects list for the selected class/grade
  const activeSubjectsList = useMemo(() => {
    let classObj = null;
    if (scopeType === 'section') {
      classObj = classes.find(c => `${c.grade} - ${c.section}` === targetSection || c.name === targetSection);
    } else if (scopeType === 'grade') {
      classObj = classes.find(c => (c.grade || c.grade_ar) === targetGrade && Array.isArray(c.subjects) && c.subjects.length > 0)
        || classes.find(c => (c.grade || c.grade_ar) === targetGrade);
    } else if (scopeType === 'student') {
      const st = students.find(s => Number(s.id) === Number(targetStudentId));
      if (st) {
        classObj = classes.find(c =>
          (st.class_id && Number(String(c.id).replace(/\D/g, '')) === Number(String(st.class_id).replace(/\D/g, ''))) ||
          `${c.grade} - ${c.section}` === `${st.grade} - ${st.section}`
        );
      }
    }

    if (classObj && Array.isArray(classObj.subjects) && classObj.subjects.length > 0) {
      return classObj.subjects;
    }
    if (Array.isArray(subjects) && subjects.length > 0) {
      return subjects.map(s => s.name || s.name_ar).filter(Boolean);
    }
    return ['القرآن الكريم', 'التربية الإسلامية', 'اللغة العربية', 'اللغة الإنجليزية', 'الرياضيات', 'العلوم'];
  }, [scopeType, targetSection, targetGrade, targetStudentId, classes, students, subjects]);

  useEffect(() => {
    if (targetSubjectMode !== 'all' && !activeSubjectsList.includes(targetSubjectMode)) {
      setTargetSubjectMode('all');
    }
  }, [activeSubjectsList, targetSubjectMode]);

  // Resolve target classes and students sorted alphabetically in Arabic
  const { matchedClasses, sortedStudents } = useMemo(() => {
    let mClasses = [];
    let mStudents = [];

    if (scopeType === 'section') {
      const clsObj = classes.find(c =>
        c.name === targetSection ||
        `${c.grade} - ${c.section}` === targetSection ||
        `${c.grade_ar} - ${c.section_ar}` === targetSection
      );
      if (clsObj) mClasses = [clsObj];
      const targetNumericId = clsObj ? Number(String(clsObj.id).replace(/\D/g, '')) : null;

      mStudents = students.filter(s => {
        if (targetNumericId && s.class_id && Number(String(s.class_id).replace(/\D/g, '')) === targetNumericId) {
          return true;
        }
        const sClassStr = `${s.grade} - ${s.section}`;
        const sClassArStr = `${s.grade_ar || s.grade} - ${s.section_ar || s.section}`;
        return sClassStr === targetSection || sClassArStr === targetSection;
      });
    } else if (scopeType === 'grade') {
      mClasses = classes.filter(c => (c.grade || c.grade_ar) === targetGrade);
      const classIdsSet = new Set(
        mClasses
          .map(c => Number(String(c.id).replace(/\D/g, '')))
          .filter(n => !isNaN(n) && n > 0)
      );
      mStudents = students.filter(s => {
        if (s.class_id && classIdsSet.has(Number(String(s.class_id).replace(/\D/g, '')))) {
          return true;
        }
        return (s.grade || s.grade_ar) === targetGrade;
      });
    } else if (scopeType === 'student') {
      const st = students.find(s => Number(s.id) === Number(targetStudentId));
      if (st) {
        mStudents = [st];
        const clsObj = classes.find(c =>
          (st.class_id && Number(String(c.id).replace(/\D/g, '')) === Number(String(st.class_id).replace(/\D/g, ''))) ||
          `${c.grade} - ${c.section}` === `${st.grade} - ${st.section}`
        );
        if (clsObj) mClasses = [clsObj];
      }
    }

    const sStudents = [...mStudents].sort((a, b) => {
      if (scopeType === 'grade') {
        const secComp = String(a.section || '').localeCompare(String(b.section || ''), 'ar');
        if (secComp !== 0) return secComp;
      }
      return String(a.name || '').localeCompare(String(b.name || ''), 'ar');
    });

    return { matchedClasses: mClasses, sortedStudents: sStudents };
  }, [scopeType, targetSection, targetGrade, targetStudentId, classes, students]);

  // Automatically fetch fresh grades when target classes change while modal is open
  useEffect(() => {
    if (!isOpen || !fetchClassGrades || matchedClasses.length === 0) return;
    matchedClasses.forEach(c => {
      const cid = String(c.id).replace(/\D/g, '');
      if (cid) fetchClassGrades(cid);
    });
  }, [isOpen, matchedClasses, fetchClassGrades]);

  if (!isOpen) return null;

  const templatesList = [
    {
      id: 'template_1_blank_year',
      number: '1',
      title: 'كشف أسماء الطلاب عمودياً والمواد أفقياً (فارغ من الدرجات طوال العام)',
      desc: 'قالب كشف فارغ متكامل جاهز للطباعة والكتابة اليدوية طوال العام الدراسي مع الترويسة والشعار وصفوف الخلاصة.',
      icon: <FileSpreadsheet size={18} />
    },
    {
      id: 'template_2_monthly_sheet',
      number: '2',
      title: 'كشف درجات الشهر المحدد مع المجموع ومحصلة الشهر',
      desc: 'يتضمن أسماء الطلاب عمودياً والمواد أفقياً وتظهر فيه درجات الشهر المحدد مع المجموع ومحصلة الشهر والإحصائيات.',
      icon: <Calendar size={18} />
    },
    {
      id: 'template_3_three_months',
      number: '3',
      title: 'كشف شامل للثلاثة الأشهر (الشهر الأول والثاني والثالث)',
      desc: 'يتضمن أسماء الطلاب ودرجات ومجموع ومحصلة الشهر الأول والثاني والثالث في كشف واحد شامل ومكتمل.',
      icon: <Layers size={18} />
    },
    {
      id: 'template_4_term_final',
      number: '4',
      title: 'كشف محصلة نهاية الترم مع درجات النصفي / نهاية الفصل',
      desc: 'يتضمن محصلة الأعمال الفصلية (٢٠) مع درجات اختبار النصفي/نهاية الترم (٣٠) والمجموع (٥٠) لكل مادة وخلاصة الفصل.',
      icon: <CheckCircle2 size={18} />
    },
    {
      id: 'template_5_direct_result',
      number: '5',
      title: 'طباعة نتيجة مباشرة (لصف أو شعبة أو طالب) بشكلها النهائي',
      desc: 'نموذج نتيجة نهائي مكتمل جاهز للطباعة مع الترويسة والشعار والتوقيعات بعد إدراج جميع المحصلات والاختبارات.',
      icon: <FileCheck2 size={18} />
    },
    {
      id: 'template_6_official_certificate',
      number: '6',
      title: 'طباعة نموذج شهادة معتمد جاهز للطباعة بالدرجات المرصودة',
      desc: 'شهادة مدرسية رسمية معتمدة بإطار رسمي تتضمن كافة الدرجات المرصودة مسبقاً والمجموع والتقدير والتوقيعات.',
      icon: <Award size={18} />
    }
  ];

  // Build HTML for either live preview or direct print
  const buildDocumentData = (customLookupMap = null) => {
    const gradesLookup = customLookupMap || (() => {
      const map = new Map();
      (detailedGrades || []).forEach(item => {
        map.set(Number(item.studentId), item.grades || {});
      });
      return map;
    })();

    const getGradeObj = (studentId, subjectName, termKey) => {
      const studentGrades = gradesLookup.get(Number(studentId)) || {};
      const termObj = studentGrades[termKey] || {};
      if (termObj[subjectName]) return termObj[subjectName];
      if (subjectName === 'لغتي' && termObj['اللغة العربية']) return termObj['اللغة العربية'];
      if (subjectName === 'اللغة العربية' && termObj['لغتي']) return termObj['لغتي'];
      return {
        m1: { homework: 0, attendance: 0, behavior: 0, oral: 0, written: 0 },
        m2: { homework: 0, attendance: 0, behavior: 0, oral: 0, written: 0 },
        m3: { homework: 0, attendance: 0, behavior: 0, oral: 0, written: 0 },
        finalExam: 0,
        coursework: null
      };
    };

    const getCoursework20 = (sData) => {
      if (sData && sData.coursework !== undefined && sData.coursework !== null && sData.coursework !== '') {
        return parseFloat(Number(sData.coursework).toFixed(2));
      }
      const m1 = calculateMonthTotal(sData?.m1);
      const m2 = calculateMonthTotal(sData?.m2);
      const m3 = calculateMonthTotal(sData?.m3);
      return parseFloat(((m1 + m2 + m3) / 15).toFixed(2));
    };

    const getTermTotal50 = (sData) => {
      const cw = getCoursework20(sData);
      const fe = Number(sData?.finalExam) || 0;
      return parseFloat((cw + fe).toFixed(2));
    };

    const todayStr = new Date().toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const termLabel = targetTerm === 'term1'
      ? 'الفصل الدراسي الأول'
      : targetTerm === 'term2'
        ? 'الفصل الدراسي الثاني'
        : 'العام الدراسي الكامل (الفصلين الأول والثاني)';

    const monthLabel = targetMonth === 'm1'
      ? 'الشهر الأول'
      : targetMonth === 'm2'
        ? 'الشهر الثاني'
        : 'الشهر الثالث';

    const scopeLabel = scopeType === 'section'
      ? `الفصل / الشعبة: ${targetSection}`
      : scopeType === 'grade'
        ? `الصف الدراسي: ${targetGrade} (جميع الشعب)`
        : (() => {
            const st = sortedStudents[0];
            return st ? `الطالب: ${st.name} (${st.grade} - ${st.section})` : '';
          })();

    const renderOfficialHeader = (leftSubtitle1 = '', leftSubtitle2 = '') => `
      <div class="official-header">
        <div class="header-right">
          <div class="rep-title">الجمهورية اليمنية</div>
          <div class="min-title">وزارة التربية والتعليم</div>
          <div class="sch-title">رياض ومدارس أنوار العلى الدولية النموذجية</div>
        </div>
        <div class="header-center">
          <img src="${SLOGAN_BASE64}" alt="شعار المدرسة" class="school-logo" />
        </div>
        <div class="header-left">
          <div><strong>التاريخ:</strong> ${todayStr}</div>
          <div><strong>العام الدراسي:</strong> 2025 / 2026 م</div>
          ${leftSubtitle1 ? `<div>${leftSubtitle1}</div>` : ''}
          ${leftSubtitle2 ? `<div>${leftSubtitle2}</div>` : ''}
        </div>
      </div>
    `;

    const renderOfficialSignatures = () => `
      <div class="signatures-footer">
        <div class="sig-box">
          <div class="sig-title">مربي الفصل / معلم المادة</div>
          <div class="sig-line">...................................</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">رئيس لجنة الكنترول</div>
          <div class="sig-line">...................................</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">وكيل الشؤون التعليمية</div>
          <div class="sig-line">...................................</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">مدير المدرسة والختم</div>
          <div class="sig-line">...................................</div>
        </div>
      </div>
    `;

    // Smart orientation: all multi-column class rosters or yearly wide certificates use Landscape automatically unless overridden
    const autoIsLandscape = !(
      (activeTemplate === 'template_5_direct_result' && scopeType === 'student' && targetTerm !== 'yearly') ||
      (activeTemplate === 'template_6_official_certificate' && targetTerm !== 'yearly')
    );
    const isLandscape = orientationMode === 'landscape'
      ? true
      : orientationMode === 'portrait'
        ? false
        : autoIsLandscape;

    let bodyContentHtml = '';

    // =========================================================================
    // TEMPLATE 1: كشف يتضمن أسماء الطلاب عمودياً وأسماء المواد أفقياً فارغ من الدرجات طوال العام
    // =========================================================================
    if (activeTemplate === 'template_1_blank_year') {
      if (targetSubjectMode !== 'all') {
        const subj = targetSubjectMode;
        const extraBlankCols = 24;
        const rowsHtml = sortedStudents.length > 0
          ? sortedStudents.map((st, idx) => `
              <tr>
                <td class="col-num sticky-print-col-1">${idx + 1}</td>
                <td class="col-name sticky-print-col-2">${st.name || ''}</td>
                ${scopeType === 'grade' ? `<td class="col-sec">${st.section || ''}</td>` : ''}
                ${Array.from({ length: extraBlankCols }).map(() => `<td class="blank-cell">&nbsp;</td>`).join('')}
              </tr>
            `).join('')
          : `<tr><td colspan="${scopeType === 'grade' ? 27 : 26}" style="padding:18px;text-align:center;">لا يوجد طلاب مسجلين في هذا النطاق</td></tr>`;

        bodyContentHtml = `
          <div class="print-page fit-single-page">
            ${renderOfficialHeader(`<strong>${scopeLabel}</strong>`, `<strong>المادة:</strong> ${subj}`)}
            <div class="meta-strip">
              <span><strong>نوع الكشف:</strong> كشف رصد درجات فارغ طوال العام الدراسي — تفصيل مادة (${subj})</span>
              <span><strong>${scopeLabel}</strong></span>
              <span><strong>إجمالي الطلاب:</strong> ${sortedStudents.length} طالباً</span>
            </div>
            <div class="preview-scroll-wrapper">
              <table class="roster-table ultra-compact-table">
                <thead>
                  <tr>
                    <th rowspan="2" class="sticky-print-col-1" style="width:2.5%;min-width:28px;">م</th>
                    <th rowspan="2" class="sticky-print-col-2" style="width:14.5%;min-width:130px;text-align:right;">اسم الطالب</th>
                    ${scopeType === 'grade' ? `<th rowspan="2" style="width:3.8%;min-width:35px;">الشعبة</th>` : ''}
                    <th colspan="7" style="background:#e0f2fe;color:#1e3a8a;">الشهر الأول</th>
                    <th colspan="7" style="background:#fce7f3;color:#831843;">الشهر الثاني</th>
                    <th colspan="7" style="background:#fef3c7;color:#78350f;">الشهر الثالث</th>
                    <th rowspan="2" style="min-width:34px;background:#dbeafe;color:#1e3a8a;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">(20)</span></th>
                    <th rowspan="2" style="min-width:34px;background:#f1f5f9;"><span class="col-sub-term">اختبار</span><span class="col-sub-num">(30)</span></th>
                    <th rowspan="2" style="min-width:36px;background:#dcfce7;color:#065f46;"><span class="col-sub-term">المجموع</span><span class="col-sub-num">(50)</span></th>
                  </tr>
                  <tr>
                    <th style="min-width:28px;"><span class="col-sub-term">واجب</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">مواظبة</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">سلوك</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">شفوي</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">تحريري</span><span class="col-sub-num">50</span></th>
                    <th style="min-width:30px;background:#f1f5f9;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">100</span></th>
                    <th style="min-width:30px;background:#dbeafe;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">واجب</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">مواظبة</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">سلوك</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">شفوي</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">تحريري</span><span class="col-sub-num">50</span></th>
                    <th style="min-width:30px;background:#f1f5f9;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">100</span></th>
                    <th style="min-width:30px;background:#fce7f3;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">واجب</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">مواظبة</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">سلوك</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">شفوي</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">تحريري</span><span class="col-sub-num">50</span></th>
                    <th style="min-width:30px;background:#f1f5f9;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">100</span></th>
                    <th style="min-width:30px;background:#fef3c7;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📊</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">مجموع درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${Array.from({ length: extraBlankCols }).map(() => `<td class="blank-cell">&nbsp;</td>`).join('')}
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📈</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">متوسط درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${Array.from({ length: extraBlankCols }).map(() => `<td class="blank-cell">&nbsp;</td>`).join('')}
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">✅</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">نسبة النجاح بالمادة (≥ ٥٠%):</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${Array.from({ length: extraBlankCols }).map(() => `<td class="blank-cell">&nbsp;</td>`).join('')}
                  </tr>
                </tbody>
              </table>
            </div>
            ${renderOfficialSignatures()}
          </div>
        `;
      } else {
        const subjCount = Math.max(activeSubjectsList.length, 1);
        const fixedColsPct = 2.8 + 5.2 + 16 + (scopeType === 'grade' ? 4 : 0) + 5 + 5 + 4.5 + 4.5 + 6;
        const perSubjPct = ((100 - fixedColsPct) / subjCount).toFixed(2);

        const rowsHtml = sortedStudents.length > 0
          ? sortedStudents.map((st, idx) => `
              <tr>
                <td class="col-num sticky-print-col-1">${idx + 1}</td>
                <td class="col-code">${st.student_code || st.id}</td>
                <td class="col-name sticky-print-col-2">${st.name || ''}</td>
                ${scopeType === 'grade' ? `<td class="col-sec">${st.section || ''}</td>` : ''}
                ${activeSubjectsList.map(() => `<td class="blank-cell">&nbsp;</td>`).join('')}
                <td class="blank-cell">&nbsp;</td>
                <td class="blank-cell">&nbsp;</td>
                <td class="blank-cell">&nbsp;</td>
                <td class="blank-cell">&nbsp;</td>
                <td class="blank-cell">&nbsp;</td>
              </tr>
            `).join('')
          : `<tr><td colspan="${activeSubjectsList.length + (scopeType === 'grade' ? 9 : 8)}" style="padding:18px;text-align:center;">لا يوجد طلاب مسجلين في هذا النطاق</td></tr>`;

        bodyContentHtml = `
          <div class="print-page fit-single-page">
            ${renderOfficialHeader(`<strong>${scopeLabel}</strong>`, `<strong>إجمالي الطلاب:</strong> ${sortedStudents.length}`)}
            <div class="meta-strip">
              <span><strong>نوع الكشف:</strong> كشف رصد درجات فارغ طوال العام الدراسي (جميع المواد الدراسية)</span>
              <span><strong>${scopeLabel}</strong></span>
              <span><strong>عدد المواد المقررة:</strong> ${activeSubjectsList.length} مواد</span>
              <span><strong>إجمالي الطلاب المقيدين:</strong> ${sortedStudents.length} طالباً</span>
            </div>
            <div class="preview-scroll-wrapper">
              <table class="roster-table">
                <thead>
                  <tr>
                    <th class="sticky-print-col-1" style="width:2.8%;min-width:28px;">م</th>
                    <th style="width:5.2%;min-width:50px;">رقم القيد</th>
                    <th class="sticky-print-col-2" style="width:16%;min-width:140px;text-align:right;">اسم الطالب</th>
                    ${scopeType === 'grade' ? `<th style="width:4%;min-width:38px;">الشعبة</th>` : ''}
                    ${activeSubjectsList.map(subj => `<th style="min-width:55px;"><span class="col-term-title">${subj}</span></th>`).join('')}
                    <th style="min-width:44px;background:#f1f5f9;"><span class="col-sub-term">المجموع</span></th>
                    <th style="min-width:44px;background:#dbeafe;color:#1e3a8a;"><span class="col-sub-term">المحصلة</span></th>
                    <th style="min-width:42px;"><span class="col-sub-term">المعدل %</span></th>
                    <th style="min-width:42px;"><span class="col-sub-term">التقدير</span></th>
                    <th style="min-width:55px;"><span class="col-sub-term">ملاحظات</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📊</td>
                    <td>-</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">مجموع درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${activeSubjectsList.map(() => `<td class="blank-cell">&nbsp;</td>`).join('')}
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📈</td>
                    <td>-</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">متوسط درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${activeSubjectsList.map(() => `<td class="blank-cell">&nbsp;</td>`).join('')}
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">✅</td>
                    <td>-</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">نسبة النجاح بالمادة (≥ ٥٠%):</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${activeSubjectsList.map(() => `<td class="blank-cell">&nbsp;</td>`).join('')}
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                    <td class="blank-cell">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </div>
            ${renderOfficialSignatures()}
          </div>
        `;
      }
    }

    // =========================================================================
    // TEMPLATE 2: كشف درجات الشهر المحدد مع المجموع ومحصلة الشهر
    // =========================================================================
    else if (activeTemplate === 'template_2_monthly_sheet') {
      const count = sortedStudents.length || 1;

      if (targetSubjectMode !== 'all') {
        const subj = targetSubjectMode;
        let hwSum = 0, attSum = 0, behSum = 0, oralSum = 0, wrtSum = 0, totSum = 0, assSum = 0;
        let passCount = 0, maxScore = 0, minScore = sortedStudents.length > 0 ? 100 : 0;

        const rowsHtml = sortedStudents.length > 0
          ? sortedStudents.map((st, idx) => {
              const gObj = getGradeObj(st.id, subj, targetTerm);
              const m = gObj[targetMonth] || {};
              const hw = Number(m.homework) || 0;
              const att = Number(m.attendance) || 0;
              const beh = Number(m.behavior) || 0;
              const oral = Number(m.oral) || 0;
              const wrt = Number(m.written) || 0;
              const mTot = hw + att + beh + oral + wrt;
              const mAss20 = parseFloat((mTot / 5).toFixed(2));

              hwSum += hw; attSum += att; behSum += beh; oralSum += oral; wrtSum += wrt;
              totSum += mTot; assSum += mAss20;
              if (mTot >= 50) passCount++;
              if (mTot > maxScore) maxScore = mTot;
              if (mTot < minScore) minScore = mTot;

              return `
                <tr>
                  <td class="col-num sticky-print-col-1">${idx + 1}</td>
                  <td class="col-code">${st.student_code || st.id}</td>
                  <td class="col-name sticky-print-col-2">${st.name || ''}</td>
                  ${scopeType === 'grade' ? `<td class="col-sec">${st.section || ''}</td>` : ''}
                  <td>${hw}</td>
                  <td>${att}</td>
                  <td>${beh}</td>
                  <td>${oral}</td>
                  <td>${wrt}</td>
                  <td style="font-weight:800;background:#f8fafc;color:${mTot >= 50 ? '#0f172a' : '#b91c1c'};">${mTot}</td>
                  <td style="font-weight:900;background:#eff6ff;color:#1e3a8a;">${mAss20}</td>
                  <td style="font-weight:700;">${getGradeEstimate(mTot, 100)}</td>
                  <td style="font-weight:700;color:${mTot >= 50 ? '#047857' : '#b91c1c'};">${mTot >= 50 ? 'مجتاز' : 'غير مجتاز'}</td>
                </tr>
              `;
            }).join('')
          : `<tr><td colspan="${scopeType === 'grade' ? 13 : 12}" style="padding:18px;text-align:center;">لا يوجد طلاب مسجلين في هذا النطاق</td></tr>`;

        const passRate = parseFloat(((passCount / count) * 100).toFixed(1));
        const avgTot = parseFloat((totSum / count).toFixed(1));
        const avgAss = parseFloat((assSum / count).toFixed(2));

        bodyContentHtml = `
          <div class="print-page fit-single-page">
            ${renderOfficialHeader(`<strong>${termLabel}</strong>`, `<strong>الفترة:</strong> ${monthLabel} — ${subj}`)}
            <div class="meta-strip">
              <span><strong>نوع الكشف:</strong> كشف درجات ومحصلة ${monthLabel} التفصيلي — مادة (${subj})</span>
              <span><strong>الفصل الدراسي:</strong> ${termLabel}</span>
              <span><strong>${scopeLabel}</strong></span>
              <span><strong>عدد الطلاب:</strong> ${sortedStudents.length} طالباً</span>
            </div>
            <div class="preview-scroll-wrapper">
              <table class="roster-table">
                <thead>
                  <tr>
                    <th class="sticky-print-col-1" style="width:3.5%;min-width:28px;">م</th>
                    <th style="width:6.5%;min-width:52px;">رقم القيد</th>
                    <th class="sticky-print-col-2" style="width:19%;min-width:140px;text-align:right;">اسم الطالب</th>
                    ${scopeType === 'grade' ? `<th style="width:5%;min-width:40px;">الشعبة</th>` : ''}
                    <th style="min-width:50px;"><span class="col-sub-term">الواجبات</span><span class="col-sub-num">(15)</span></th>
                    <th style="min-width:50px;"><span class="col-sub-term">المواظبة</span><span class="col-sub-num">(15)</span></th>
                    <th style="min-width:45px;"><span class="col-sub-term">السلوك</span><span class="col-sub-num">(10)</span></th>
                    <th style="min-width:45px;"><span class="col-sub-term">الشفوي</span><span class="col-sub-num">(10)</span></th>
                    <th style="min-width:50px;"><span class="col-sub-term">التحريري</span><span class="col-sub-num">(50)</span></th>
                    <th style="min-width:58px;background:#f1f5f9;"><span class="col-sub-term">مجموع الشهر</span><span class="col-sub-num">(100)</span></th>
                    <th style="min-width:58px;background:#dbeafe;color:#1e3a8a;"><span class="col-sub-term">محصلة الشهر</span><span class="col-sub-num">(20)</span></th>
                    <th style="min-width:45px;"><span class="col-sub-term">التقدير</span></th>
                    <th style="min-width:45px;"><span class="col-sub-term">الحالة</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📊</td>
                    <td>-</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">مجموع درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    <td>${parseFloat(hwSum.toFixed(1))}</td>
                    <td>${parseFloat(attSum.toFixed(1))}</td>
                    <td>${parseFloat(behSum.toFixed(1))}</td>
                    <td>${parseFloat(oralSum.toFixed(1))}</td>
                    <td>${parseFloat(wrtSum.toFixed(1))}</td>
                    <td style="font-weight:900;color:#1e3a8a;">${parseFloat(totSum.toFixed(1))}</td>
                    <td style="font-weight:900;color:#1e3a8a;">${parseFloat(assSum.toFixed(1))}</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📈</td>
                    <td>-</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">متوسط درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    <td>${parseFloat((hwSum / count).toFixed(1))}</td>
                    <td>${parseFloat((attSum / count).toFixed(1))}</td>
                    <td>${parseFloat((behSum / count).toFixed(1))}</td>
                    <td>${parseFloat((oralSum / count).toFixed(1))}</td>
                    <td>${parseFloat((wrtSum / count).toFixed(1))}</td>
                    <td style="font-weight:900;color:#047857;">${avgTot}</td>
                    <td style="font-weight:900;color:#1e3a8a;">${avgAss}</td>
                    <td>${getGradeEstimate(avgTot, 100)}</td>
                    <td>-</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">✅</td>
                    <td>-</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">نسبة النجاح بالمادة (≥ ٥٠%):</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    <td colspan="7" style="font-weight:900;color:#047857;text-align:center;">
                      نسبة الاجتياز في المادة: ${passRate}% (${passCount} ناجح من إجمالي ${sortedStudents.length} طلاب)
                    </td>
                    <td>-</td>
                    <td>${passRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="stats-footer-strip">
              <span><strong>إجمالي الطلاب المقيدين:</strong> ${sortedStudents.length}</span>
              <span><strong>عدد المجتازين (≥ 50%):</strong> ${passCount}</span>
              <span><strong>غير المجتازين:</strong> ${sortedStudents.length - passCount}</span>
              <span><strong>نسبة النجاح العامة:</strong> ${passRate}%</span>
              <span><strong>أعلى درجة:</strong> ${maxScore} / 100</span>
              <span><strong>أدنى درجة:</strong> ${minScore} / 100</span>
            </div>
            ${renderOfficialSignatures()}
          </div>
        `;
      } else {
        const subjCount = Math.max(activeSubjectsList.length, 1);
        const maxSum = subjCount * 100;

        const subjectSums = {};
        const subjectPassCounts = {};
        activeSubjectsList.forEach(s => {
          subjectSums[s] = 0;
          subjectPassCounts[s] = 0;
        });

        let grandMonthSumAll = 0;
        let grandAssSumAll = 0;
        let grandPctSumAll = 0;
        let overallPassStudents = 0;
        let highestSum = 0;
        let lowestSum = sortedStudents.length > 0 ? maxSum : 0;

        const fixedColsPct = 2.8 + 5.2 + 16 + (scopeType === 'grade' ? 4 : 0) + 5.8 + 5.8 + 5 + 5.4;
        const perSubjPct = ((100 - fixedColsPct) / subjCount).toFixed(2);

        const rowsHtml = sortedStudents.length > 0
          ? sortedStudents.map((st, idx) => {
              let studentMonthSum = 0;
              const subjCells = activeSubjectsList.map(subj => {
                const gObj = getGradeObj(st.id, subj, targetTerm);
                const mTot = calculateMonthTotal(gObj[targetMonth]);
                studentMonthSum += mTot;
                subjectSums[subj] = (subjectSums[subj] || 0) + mTot;
                if (mTot >= 50) subjectPassCounts[subj] = (subjectPassCounts[subj] || 0) + 1;
                return `<td style="font-weight:700;color:${mTot >= 50 ? '#0f172a' : '#b91c1c'};">${mTot}</td>`;
              }).join('');

              const avgPercent = subjCount > 0
                ? parseFloat((studentMonthSum / subjCount).toFixed(1))
                : 0;
              const avgAssessment20 = subjCount > 0
                ? parseFloat((avgPercent / 5).toFixed(2))
                : 0;

              grandMonthSumAll += studentMonthSum;
              grandAssSumAll += avgAssessment20;
              grandPctSumAll += avgPercent;
              if (avgPercent >= 50) overallPassStudents++;
              if (studentMonthSum > highestSum) highestSum = studentMonthSum;
              if (studentMonthSum < lowestSum) lowestSum = studentMonthSum;

              return `
                <tr>
                  <td class="col-num sticky-print-col-1">${idx + 1}</td>
                  <td class="col-code">${st.student_code || st.id}</td>
                  <td class="col-name sticky-print-col-2">${st.name || ''}</td>
                  ${scopeType === 'grade' ? `<td class="col-sec">${st.section || ''}</td>` : ''}
                  ${subjCells}
                  <td style="font-weight:800;background:#f8fafc;">${studentMonthSum}</td>
                  <td style="font-weight:900;color:#1e3a8a;background:#eff6ff;">${avgAssessment20}</td>
                  <td style="font-weight:800;color:${avgPercent >= 50 ? '#047857' : '#b91c1c'};">${avgPercent}%</td>
                  <td style="font-weight:700;">${getGradeEstimate(avgPercent, 100)}</td>
                </tr>
              `;
            }).join('')
          : `<tr><td colspan="${activeSubjectsList.length + (scopeType === 'grade' ? 8 : 7)}" style="padding:18px;text-align:center;">لا يوجد طلاب مسجلين في هذا النطاق</td></tr>`;

        const classAvgSum = parseFloat((grandMonthSumAll / count).toFixed(1));
        const classAvgAss20 = parseFloat((grandAssSumAll / count).toFixed(2));
        const classAvgPct = parseFloat((grandPctSumAll / count).toFixed(1));
        const classPassRate = parseFloat(((overallPassStudents / count) * 100).toFixed(1));

        bodyContentHtml = `
          <div class="print-page fit-single-page">
            ${renderOfficialHeader(`<strong>${termLabel}</strong>`, `<strong>الفترة:</strong> ${monthLabel}`)}
            <div class="meta-strip">
              <span><strong>نوع الكشف:</strong> كشف درجات ومحصلة ${monthLabel} (${termLabel}) — جميع المواد</span>
              <span><strong>${scopeLabel}</strong></span>
              <span><strong>عدد المواد:</strong> ${activeSubjectsList.length} مواد</span>
              <span><strong>عدد الطلاب:</strong> ${sortedStudents.length} طالباً</span>
            </div>
            <div class="preview-scroll-wrapper">
              <table class="roster-table">
                <thead>
                  <tr>
                    <th class="sticky-print-col-1" style="width:2.8%;min-width:28px;">م</th>
                    <th style="width:5.2%;min-width:50px;">رقم القيد</th>
                    <th class="sticky-print-col-2" style="width:16%;min-width:140px;text-align:right;">اسم الطالب</th>
                    ${scopeType === 'grade' ? `<th style="width:4%;min-width:38px;">الشعبة</th>` : ''}
                    ${activeSubjectsList.map(subj => `<th style="min-width:55px;"><span class="col-term-title">${subj}</span><span class="col-sub-num">(100)</span></th>`).join('')}
                    <th style="min-width:55px;background:#f1f5f9;"><span class="col-sub-term">مجموع الشهر</span><span class="col-sub-num">(${maxSum})</span></th>
                    <th style="min-width:55px;background:#dbeafe;color:#1e3a8a;"><span class="col-sub-term">محصلة الشهر</span><span class="col-sub-num">(20)</span></th>
                    <th style="min-width:44px;"><span class="col-sub-term">المعدل</span><span class="col-sub-num">(%)</span></th>
                    <th style="min-width:45px;"><span class="col-sub-term">التقدير</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📊</td>
                    <td>-</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">مجموع درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${activeSubjectsList.map(subj => `<td style="font-weight:800;color:#1e3a8a;">${subjectSums[subj] || 0}</td>`).join('')}
                    <td style="font-weight:900;color:#1e3a8a;">${grandMonthSumAll}</td>
                    <td style="font-weight:800;color:#1e3a8a;">${parseFloat(grandAssSumAll.toFixed(1))}</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📈</td>
                    <td>-</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">متوسط درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${activeSubjectsList.map(subj => `<td style="font-weight:800;color:#0f766e;">${parseFloat(((subjectSums[subj] || 0) / count).toFixed(1))}</td>`).join('')}
                    <td style="font-weight:900;color:#0f766e;">${classAvgSum}</td>
                    <td style="font-weight:900;color:#1e3a8a;">${classAvgAss20}</td>
                    <td style="font-weight:900;color:#047857;">${classAvgPct}%</td>
                    <td>${getGradeEstimate(classAvgPct, 100)}</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">✅</td>
                    <td>-</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">نسبة النجاح بالمادة (≥ ٥٠%):</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${activeSubjectsList.map(subj => {
                      const pRate = parseFloat((((subjectPassCounts[subj] || 0) / count) * 100).toFixed(0));
                      return `<td style="font-weight:800;color:${pRate >= 50 ? '#047857' : '#b91c1c'};">${pRate}%</td>`;
                    }).join('')}
                    <td>-</td>
                    <td>-</td>
                    <td style="font-weight:900;color:#047857;">${classPassRate}%</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="stats-footer-strip">
              <span><strong>إجمالي الطلاب المقيدين:</strong> ${sortedStudents.length}</span>
              <span><strong>عدد المجتازين (≥ 50%):</strong> ${overallPassStudents}</span>
              <span><strong>غير المجتازين:</strong> ${sortedStudents.length - overallPassStudents}</span>
              <span><strong>نسبة النجاح العامة:</strong> ${classPassRate}%</span>
              <span><strong>أعلى مجموع:</strong> ${highestSum} / ${maxSum}</span>
              <span><strong>أدنى مجموع:</strong> ${lowestSum} / ${maxSum}</span>
            </div>
            ${renderOfficialSignatures()}
          </div>
        `;
      }
    }

    // =========================================================================
    // TEMPLATE 3: كشف شامل للثلاثة الأشهر (درجات ومجموع ومحصلة الشهر الأول والثاني والثالث)
    // =========================================================================
    else if (activeTemplate === 'template_3_three_months') {
      const count = sortedStudents.length || 1;

      if (targetSubjectMode !== 'all') {
        const subj = targetSubjectMode;
        const colSums = Array(23).fill(0);
        let passCount = 0;

        const rowsHtml = sortedStudents.map((st, idx) => {
          const gObj = getGradeObj(st.id, subj, targetTerm);
          const m1 = gObj.m1 || {};
          const m2 = gObj.m2 || {};
          const m3 = gObj.m3 || {};
          const m1Tot = calculateMonthTotal(m1);
          const m2Tot = calculateMonthTotal(m2);
          const m3Tot = calculateMonthTotal(m3);
          const m1Ass = parseFloat((m1Tot / 5).toFixed(1));
          const m2Ass = parseFloat((m2Tot / 5).toFixed(1));
          const m3Ass = parseFloat((m3Tot / 5).toFixed(1));
          const threeMonthsSum = m1Tot + m2Tot + m3Tot;
          const finalCw20 = getCoursework20(gObj);

          const vals = [
            m1.homework || 0, m1.attendance || 0, m1.behavior || 0, m1.oral || 0, m1.written || 0, m1Tot, m1Ass,
            m2.homework || 0, m2.attendance || 0, m2.behavior || 0, m2.oral || 0, m2.written || 0, m2Tot, m2Ass,
            m3.homework || 0, m3.attendance || 0, m3.behavior || 0, m3.oral || 0, m3.written || 0, m3Tot, m3Ass,
            threeMonthsSum, finalCw20
          ];
          vals.forEach((v, i) => { colSums[i] += Number(v) || 0; });
          if (finalCw20 >= 10) passCount++;

          return `
            <tr>
              <td class="col-num sticky-print-col-1">${idx + 1}</td>
              <td class="col-name sticky-print-col-2">${st.name || ''}</td>
              <td>${m1.homework || 0}</td><td>${m1.attendance || 0}</td><td>${m1.behavior || 0}</td><td>${m1.oral || 0}</td><td>${m1.written || 0}</td>
              <td style="font-weight:800;background:#f8fafc;">${m1Tot}</td>
              <td style="font-weight:800;color:#1e3a8a;background:#eff6ff;">${m1Ass}</td>
              <td>${m2.homework || 0}</td><td>${m2.attendance || 0}</td><td>${m2.behavior || 0}</td><td>${m2.oral || 0}</td><td>${m2.written || 0}</td>
              <td style="font-weight:800;background:#f8fafc;">${m2Tot}</td>
              <td style="font-weight:800;color:#9d174d;background:#fdf2f8;">${m2Ass}</td>
              <td>${m3.homework || 0}</td><td>${m3.attendance || 0}</td><td>${m3.behavior || 0}</td><td>${m3.oral || 0}</td><td>${m3.written || 0}</td>
              <td style="font-weight:800;background:#f8fafc;">${m3Tot}</td>
              <td style="font-weight:800;color:#92400e;background:#fffbeb;">${m3Ass}</td>
              <td style="font-weight:800;background:#fef3c7;">${threeMonthsSum}</td>
              <td style="font-weight:900;color:#047857;background:#ecfdf5;">${finalCw20}</td>
              <td style="font-weight:700;">${getGradeEstimate(finalCw20, 20)}</td>
            </tr>
          `;
        }).join('');

        const passRate = parseFloat(((passCount / count) * 100).toFixed(1));

        bodyContentHtml = `
          <div class="print-page fit-single-page">
            ${renderOfficialHeader(`<strong>${termLabel}</strong>`, `<strong>المادة:</strong> ${subj}`)}
            <div class="meta-strip">
              <span><strong>نوع الكشف:</strong> كشف شامل للأشهر الثلاثة (الأول والثاني والثالث) — مادة (${subj})</span>
              <span><strong>${scopeLabel}</strong></span>
              <span><strong>عدد الطلاب:</strong> ${sortedStudents.length} طالباً</span>
            </div>
            <div class="preview-scroll-wrapper">
              <table class="roster-table ultra-compact-table">
                <thead>
                  <tr>
                    <th rowspan="2" class="sticky-print-col-1" style="width:2.5%;min-width:28px;">م</th>
                    <th rowspan="2" class="sticky-print-col-2" style="width:14.5%;min-width:130px;text-align:right;">اسم الطالب</th>
                    <th colspan="7" style="background:#e0f2fe;color:#1e3a8a;">الشهر الأول (الدرجات + المجموع + المحصلة)</th>
                    <th colspan="7" style="background:#fce7f3;color:#831843;">الشهر الثاني (الدرجات + المجموع + المحصلة)</th>
                    <th colspan="7" style="background:#fef3c7;color:#78350f;">الشهر الثالث (الدرجات + المجموع + المحصلة)</th>
                    <th rowspan="2" style="min-width:36px;background:#fef3c7;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">(300)</span></th>
                    <th rowspan="2" style="min-width:36px;background:#d1fae5;color:#065f46;"><span class="col-sub-term">المحصلة</span><span class="col-sub-num">(20)</span></th>
                    <th rowspan="2" style="min-width:36px;"><span class="col-sub-term">التقدير</span></th>
                  </tr>
                  <tr>
                    <th style="min-width:28px;"><span class="col-sub-term">واجب</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">مواظبة</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">سلوك</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">شفوي</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">تحريري</span><span class="col-sub-num">50</span></th>
                    <th style="min-width:30px;background:#f1f5f9;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">100</span></th>
                    <th style="min-width:30px;background:#dbeafe;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">واجب</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">مواظبة</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">سلوك</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">شفوي</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">تحريري</span><span class="col-sub-num">50</span></th>
                    <th style="min-width:30px;background:#f1f5f9;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">100</span></th>
                    <th style="min-width:30px;background:#fce7f3;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">واجب</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">مواظبة</span><span class="col-sub-num">15</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">سلوك</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">شفوي</span><span class="col-sub-num">10</span></th>
                    <th style="min-width:28px;"><span class="col-sub-term">تحريري</span><span class="col-sub-num">50</span></th>
                    <th style="min-width:30px;background:#f1f5f9;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">100</span></th>
                    <th style="min-width:30px;background:#fef3c7;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📊</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">مجموع درجات الفصل:</td>
                    ${colSums.map(s => `<td style="font-weight:800;color:#1e3a8a;">${parseFloat(s.toFixed(1))}</td>`).join('')}
                    <td>-</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📈</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">متوسط درجات الفصل:</td>
                    ${colSums.map(s => `<td style="font-weight:800;color:#0f766e;">${parseFloat((s / count).toFixed(1))}</td>`).join('')}
                    <td>${getGradeEstimate(colSums[22] / count, 20)}</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">✅</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">نسبة النجاح بالمادة (≥ ٥٠%):</td>
                    <td colspan="23" style="text-align:center;font-weight:900;color:#047857;">
                      نسبة النجاح في محصلة الأشهر الثلاثة: ${passRate}% (${passCount} من ${sortedStudents.length} طلاب)
                    </td>
                    <td>${passRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            ${renderOfficialSignatures()}
          </div>
        `;
      } else {
        // Comprehensive 3-months sheet across all subjects
        const subjCount = Math.max(activeSubjectsList.length, 1);
        const maxMonthSum = subjCount * 100;
        const maxThreeMonthsSum = subjCount * 300;
        const totalDataCols = 3 * (subjCount + 2) + 3;
        const colSums = Array(totalDataCols).fill(0);
        const colPassCounts = Array(totalDataCols).fill(0);

        const fixedNameAndNumPct = 2.0 + 11.5 + (scopeType === 'grade' ? 3.2 : 0);
        const perDataColPct = ((100 - fixedNameAndNumPct) / totalDataCols).toFixed(3);

        const rowsHtml = sortedStudents.map((st, idx) => {
          let m1Sum = 0, m2Sum = 0, m3Sum = 0;
          let cPtr = 0;

          const m1Cells = activeSubjectsList.map(subj => {
            const tot = calculateMonthTotal(getGradeObj(st.id, subj, targetTerm).m1);
            m1Sum += tot;
            colSums[cPtr] += tot;
            if (tot >= 50) colPassCounts[cPtr]++;
            cPtr++;
            return `<td>${tot}</td>`;
          }).join('');
          const m1Ass = parseFloat((m1Sum / (subjCount * 5)).toFixed(1));
          colSums[cPtr] += m1Sum; if (m1Sum >= maxMonthSum * 0.5) colPassCounts[cPtr]++; cPtr++;
          colSums[cPtr] += m1Ass; if (m1Ass >= 10) colPassCounts[cPtr]++; cPtr++;

          const m2Cells = activeSubjectsList.map(subj => {
            const tot = calculateMonthTotal(getGradeObj(st.id, subj, targetTerm).m2);
            m2Sum += tot;
            colSums[cPtr] += tot;
            if (tot >= 50) colPassCounts[cPtr]++;
            cPtr++;
            return `<td>${tot}</td>`;
          }).join('');
          const m2Ass = parseFloat((m2Sum / (subjCount * 5)).toFixed(1));
          colSums[cPtr] += m2Sum; if (m2Sum >= maxMonthSum * 0.5) colPassCounts[cPtr]++; cPtr++;
          colSums[cPtr] += m2Ass; if (m2Ass >= 10) colPassCounts[cPtr]++; cPtr++;

          const m3Cells = activeSubjectsList.map(subj => {
            const tot = calculateMonthTotal(getGradeObj(st.id, subj, targetTerm).m3);
            m3Sum += tot;
            colSums[cPtr] += tot;
            if (tot >= 50) colPassCounts[cPtr]++;
            cPtr++;
            return `<td>${tot}</td>`;
          }).join('');
          const m3Ass = parseFloat((m3Sum / (subjCount * 5)).toFixed(1));
          colSums[cPtr] += m3Sum; if (m3Sum >= maxMonthSum * 0.5) colPassCounts[cPtr]++; cPtr++;
          colSums[cPtr] += m3Ass; if (m3Ass >= 10) colPassCounts[cPtr]++; cPtr++;

          const threeMonthsTotal = m1Sum + m2Sum + m3Sum;
          const overallCw20 = parseFloat((threeMonthsTotal / (subjCount * 15)).toFixed(1));
          const overallPercent = parseFloat((threeMonthsTotal / (subjCount * 3)).toFixed(1));

          colSums[cPtr] += threeMonthsTotal; if (threeMonthsTotal >= maxThreeMonthsSum * 0.5) colPassCounts[cPtr]++; cPtr++;
          colSums[cPtr] += overallCw20; if (overallCw20 >= 10) colPassCounts[cPtr]++; cPtr++;
          colSums[cPtr] += overallPercent; if (overallPercent >= 50) colPassCounts[cPtr]++; cPtr++;

          return `
            <tr>
              <td class="col-num sticky-print-col-1">${idx + 1}</td>
              <td class="col-name sticky-print-col-2">${st.name || ''}</td>
              ${scopeType === 'grade' ? `<td class="col-sec">${st.section || ''}</td>` : ''}
              ${m1Cells}
              <td style="font-weight:800;background:#f8fafc;">${m1Sum}</td>
              <td style="font-weight:800;color:#1e3a8a;background:#eff6ff;">${m1Ass}</td>
              ${m2Cells}
              <td style="font-weight:800;background:#f8fafc;">${m2Sum}</td>
              <td style="font-weight:800;color:#9d174d;background:#fdf2f8;">${m2Ass}</td>
              ${m3Cells}
              <td style="font-weight:800;background:#f8fafc;">${m3Sum}</td>
              <td style="font-weight:800;color:#92400e;background:#fffbeb;">${m3Ass}</td>
              <td style="font-weight:800;background:#f1f5f9;">${threeMonthsTotal}</td>
              <td style="font-weight:900;color:#065f46;background:#ecfdf5;">${overallCw20}</td>
              <td style="font-weight:800;color:${overallPercent >= 50 ? '#047857' : '#b91c1c'};">${overallPercent}%</td>
            </tr>
          `;
        }).join('');

        bodyContentHtml = `
          <div class="print-page fit-single-page">
            ${renderOfficialHeader(`<strong>${termLabel}</strong>`, `<strong>شامل الثلاثة الأشهر</strong>`)}
            <div class="meta-strip">
              <span><strong>نوع الكشف:</strong> كشف شامل لدرجات ومجموع ومحصلة الأشهر الثلاثة (الشهر الأول + الشهر الثاني + الشهر الثالث)</span>
              <span><strong>${scopeLabel}</strong></span>
              <span><strong>عدد المواد:</strong> ${activeSubjectsList.length} مواد</span>
              <span><strong>عدد الطلاب:</strong> ${sortedStudents.length} طالباً</span>
            </div>
            <div class="preview-scroll-wrapper">
              <table class="roster-table dense-3months-table">
                <thead>
                  <tr>
                    <th rowspan="2" class="sticky-print-col-1" style="width:2.0%;min-width:26px;">م</th>
                    <th rowspan="2" class="sticky-print-col-2" style="width:11.5%;min-width:130px;text-align:right;">اسم الطالب</th>
                    ${scopeType === 'grade' ? `<th rowspan="2" style="width:3.2%;min-width:35px;">الشعبة</th>` : ''}
                    <th colspan="${activeSubjectsList.length + 2}" style="background:#e0f2fe;color:#1e3a8a;">الشهر الأول (درجات المواد + المجموع + المحصلة)</th>
                    <th colspan="${activeSubjectsList.length + 2}" style="background:#fce7f3;color:#831843;">الشهر الثاني (درجات المواد + المجموع + المحصلة)</th>
                    <th colspan="${activeSubjectsList.length + 2}" style="background:#fef3c7;color:#78350f;">الشهر الثالث (درجات المواد + المجموع + المحصلة)</th>
                    <th colspan="3" style="background:#d1fae5;color:#065f46;">خلاصة الـ3 أشهر</th>
                  </tr>
                  <tr>
                    ${activeSubjectsList.map(s => `<th class="subj-dense-col">${formatDenseHeader(s)}</th>`).join('')}
                    <th class="subj-dense-col" style="background:#f1f5f9;"><span class="col-term-word">مجموع</span><span class="col-term-word">(${maxMonthSum})</span></th>
                    <th class="subj-dense-col" style="background:#dbeafe;"><span class="col-term-word">محصلة</span><span class="col-term-word">(20)</span></th>
                    ${activeSubjectsList.map(s => `<th class="subj-dense-col">${formatDenseHeader(s)}</th>`).join('')}
                    <th class="subj-dense-col" style="background:#f1f5f9;"><span class="col-term-word">مجموع</span><span class="col-term-word">(${maxMonthSum})</span></th>
                    <th class="subj-dense-col" style="background:#fce7f3;"><span class="col-term-word">محصلة</span><span class="col-term-word">(20)</span></th>
                    ${activeSubjectsList.map(s => `<th class="subj-dense-col">${formatDenseHeader(s)}</th>`).join('')}
                    <th class="subj-dense-col" style="background:#f1f5f9;"><span class="col-term-word">مجموع</span><span class="col-term-word">(${maxMonthSum})</span></th>
                    <th class="subj-dense-col" style="background:#fef3c7;"><span class="col-term-word">محصلة</span><span class="col-term-word">(20)</span></th>
                    <th class="subj-dense-col" style="background:#f1f5f9;"><span class="col-term-word">المجموع</span><span class="col-term-word">(${maxThreeMonthsSum})</span></th>
                    <th class="subj-dense-col" style="background:#d1fae5;"><span class="col-term-word">المحصلة</span><span class="col-term-word">(20)</span></th>
                    <th class="subj-dense-col"><span class="col-term-word">المعدل</span><span class="col-term-word">(%)</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📊</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">مجموع الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${colSums.map((s, i) => `<td style="font-weight:800;color:#1e3a8a;">${i === colSums.length - 1 ? '-' : parseFloat(s.toFixed(0))}</td>`).join('')}
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📈</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">متوسط الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${colSums.map((s, i) => `<td style="font-weight:800;color:#0f766e;">${parseFloat((s / count).toFixed(1))}${i === colSums.length - 1 ? '%' : ''}</td>`).join('')}
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">✅</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">نسبة النجاح %:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${colPassCounts.map(c => {
                      const p = parseFloat(((c / count) * 100).toFixed(0));
                      return `<td style="font-weight:800;color:${p >= 50 ? '#047857' : '#b91c1c'};">${p}%</td>`;
                    }).join('')}
                  </tr>
                </tbody>
              </table>
            </div>
            ${renderOfficialSignatures()}
          </div>
        `;
      }
    }

    // =========================================================================
    // TEMPLATE 4: كشف يتضمن محصلة نهاية الترم مع درجات النصفي / النهائي
    // =========================================================================
    else if (activeTemplate === 'template_4_term_final') {
      const count = sortedStudents.length || 1;
      const subjCount = Math.max(activeSubjectsList.length, 1);
      const maxTermTotal = subjCount * 50;
      const totalSubjCols = subjCount * 3;
      const colSums = Array(totalSubjCols).fill(0);
      const colPassCounts = Array(totalSubjCols).fill(0);

      let grandTotalSumAll = 0;
      let grandPctSumAll = 0;
      let passStudentsCount = 0;

      const fixedColsPct = 2.2 + 12.8 + (scopeType === 'grade' ? 3.5 : 0) + 4.5 + 4.0 + 4.2 + 3.2 + 4.6;
      const perSubColPct = ((100 - fixedColsPct) / totalSubjCols).toFixed(3);

      const studentRecords = sortedStudents.map((st) => {
        let studentGrandTotal = 0;
        let failedSubjCount = 0;
        const triplets = activeSubjectsList.map((subj) => {
          const gObj = getGradeObj(st.id, subj, targetTerm);
          const cw20 = getCoursework20(gObj);
          const exam30 = Number(gObj.finalExam) || 0;
          const tot50 = parseFloat((cw20 + exam30).toFixed(1));
          studentGrandTotal += tot50;
          if (tot50 < 25) failedSubjCount++;
          return { cw20, exam30, tot50 };
        });
        const grandTotalRounded = parseFloat(studentGrandTotal.toFixed(1));
        const percentage = maxTermTotal > 0 ? parseFloat(((grandTotalRounded / maxTermTotal) * 100).toFixed(1)) : 0;
        return { st, triplets, grandTotalRounded, percentage, failedSubjCount };
      });

      const sortedScores = [...studentRecords].map(r => r.grandTotalRounded).sort((a, b) => b - a);

      const rowsHtml = studentRecords.map((rec, idx) => {
        const { st, triplets, grandTotalRounded, percentage, failedSubjCount } = rec;
        const rank = grandTotalRounded > 0 ? (sortedScores.indexOf(grandTotalRounded) + 1) : '-';

        grandTotalSumAll += grandTotalRounded;
        grandPctSumAll += percentage;
        if (failedSubjCount === 0 && grandTotalRounded > 0) passStudentsCount++;

        const subjTripletsHtml = triplets.map((t, sIdx) => {
          const baseIdx = sIdx * 3;
          colSums[baseIdx] += t.cw20; if (t.cw20 >= 10) colPassCounts[baseIdx]++;
          colSums[baseIdx + 1] += t.exam30; if (t.exam30 >= 15) colPassCounts[baseIdx + 1]++;
          colSums[baseIdx + 2] += t.tot50; if (t.tot50 >= 25) colPassCounts[baseIdx + 2]++;
          return `
            <td>${t.cw20}</td>
            <td>${t.exam30}</td>
            <td style="font-weight:800;background:#f8fafc;color:${t.tot50 >= 25 ? '#1e3a8a' : '#b91c1c'};">${t.tot50}</td>
          `;
        }).join('');

        return `
          <tr>
            <td class="col-num sticky-print-col-1">${idx + 1}</td>
            <td class="col-name sticky-print-col-2">${st.name || ''}</td>
            ${scopeType === 'grade' ? `<td class="col-sec">${st.section || ''}</td>` : ''}
            ${subjTripletsHtml}
            <td style="font-weight:900;background:#eff6ff;color:#1e3a8a;">${grandTotalRounded}</td>
            <td style="font-weight:800;">${percentage}%</td>
            <td style="font-weight:800;">${getGradeEstimate(percentage, 100)}</td>
            <td style="font-weight:800;color:#1e3a8a;">${rank}</td>
            <td style="font-weight:800;color:${failedSubjCount === 0 ? '#047857' : '#b91c1c'};">${failedSubjCount === 0 ? 'ناجح' : `مكمل (${failedSubjCount})`}</td>
          </tr>
        `;
      }).join('');

      const overallPassRate = parseFloat(((passStudentsCount / count) * 100).toFixed(1));
      const classAvgTotal = parseFloat((grandTotalSumAll / count).toFixed(1));
      const classAvgPct = parseFloat((grandPctSumAll / count).toFixed(1));

      bodyContentHtml = `
        <div class="print-page fit-single-page">
          ${renderOfficialHeader(`<strong>${termLabel}</strong>`, `<strong>${scopeLabel}</strong>`)}
          <div class="meta-strip">
            <span><strong>نوع الكشف:</strong> كشف محصلة نهاية الترم (٢٠) مع درجات الاختبار النصفي / النهائي (٣٠) والمجموع (٥٠)</span>
            <span><strong>الفصل الدراسي:</strong> ${termLabel}</span>
            <span><strong>${scopeLabel}</strong></span>
            <span><strong>عدد الطلاب:</strong> ${sortedStudents.length} طالباً</span>
          </div>
          <div class="preview-scroll-wrapper">
            <table class="roster-table dense-3months-table">
              <thead>
                <tr>
                  <th rowspan="2" class="sticky-print-col-1" style="width:2.2%;min-width:26px;">م</th>
                  <th rowspan="2" class="sticky-print-col-2" style="width:12.8%;min-width:130px;text-align:right;">اسم الطالب</th>
                  ${scopeType === 'grade' ? `<th rowspan="2" style="width:3.5%;min-width:35px;">الشعبة</th>` : ''}
                  ${activeSubjectsList.map(subj => `<th colspan="3" style="background:#f1f5f9;white-space:nowrap;font-size:9.5px;font-weight:800;padding:4px 2px;">${subj}</th>`).join('')}
                  <th rowspan="2" style="min-width:44px;background:#dbeafe;color:#1e3a8a;"><span class="col-sub-term">المجموع</span><span class="col-sub-num">(${maxTermTotal})</span></th>
                  <th rowspan="2" style="min-width:38px;"><span class="col-sub-term">النسبة</span><span class="col-sub-num">(%)</span></th>
                  <th rowspan="2" style="min-width:40px;"><span class="col-sub-term">التقدير</span></th>
                  <th rowspan="2" style="min-width:34px;"><span class="col-sub-term">الترتيب</span></th>
                  <th rowspan="2" style="min-width:44px;"><span class="col-sub-term">النتيجة</span></th>
                </tr>
                <tr>
                  ${activeSubjectsList.map(() => `
                    <th style="min-width:34px;padding:2px 1px;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                    <th style="min-width:34px;padding:2px 1px;"><span class="col-sub-term">نصفي</span><span class="col-sub-num">30</span></th>
                    <th style="min-width:34px;padding:2px 1px;background:#e2e8f0;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">50</span></th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr class="summary-row">
                  <td class="sticky-print-col-1">📊</td>
                  <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">مجموع درجات الفصل:</td>
                  ${scopeType === 'grade' ? `<td>-</td>` : ''}
                  ${colSums.map(s => `<td style="font-weight:800;color:#1e3a8a;">${parseFloat(s.toFixed(0))}</td>`).join('')}
                  <td style="font-weight:900;color:#1e3a8a;">${parseFloat(grandTotalSumAll.toFixed(0))}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr class="summary-row">
                  <td class="sticky-print-col-1">📈</td>
                  <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">متوسط درجات الفصل:</td>
                  ${scopeType === 'grade' ? `<td>-</td>` : ''}
                  ${colSums.map(s => `<td style="font-weight:800;color:#0f766e;">${parseFloat((s / count).toFixed(1))}</td>`).join('')}
                  <td style="font-weight:900;color:#0f766e;">${classAvgTotal}</td>
                  <td style="font-weight:900;color:#047857;">${classAvgPct}%</td>
                  <td>${getGradeEstimate(classAvgPct, 100)}</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr class="summary-row">
                  <td class="sticky-print-col-1">✅</td>
                  <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">نسبة النجاح (≥ ٥٠%):</td>
                  ${scopeType === 'grade' ? `<td>-</td>` : ''}
                  ${colPassCounts.map(c => {
                    const p = parseFloat(((c / count) * 100).toFixed(0));
                    return `<td style="font-weight:800;color:${p >= 50 ? '#047857' : '#b91c1c'};">${p}%</td>`;
                  }).join('')}
                  <td>-</td>
                  <td style="font-weight:900;color:#047857;">${overallPassRate}%</td>
                  <td>-</td>
                  <td>-</td>
                  <td style="font-weight:900;color:#047857;">${overallPassRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="stats-footer-strip">
            <span><strong>إجمالي الطلاب المقيدين:</strong> ${sortedStudents.length}</span>
            <span><strong>عدد الناجحين:</strong> ${passStudentsCount}</span>
            <span><strong>عدد المكملين / غير المجتازين:</strong> ${sortedStudents.length - passStudentsCount}</span>
            <span><strong>نسبة النجاح العامة:</strong> ${overallPassRate}%</span>
            <span><strong>متوسط مجموع الفصل:</strong> ${classAvgTotal} / ${maxTermTotal} (${classAvgPct}%)</span>
          </div>
          ${renderOfficialSignatures()}
        </div>
      `;
    }

    // =========================================================================
    // TEMPLATE 5: طباعة نتيجة لصف أو شعبة أو طالب بشكل مباشر (نموذج جاهز للطباعة)
    // =========================================================================
    else if (activeTemplate === 'template_5_direct_result') {
      if (scopeType === 'student') {
        const st = sortedStudents[0];
        if (!st) {
          bodyContentHtml = `<div class="print-page"><p style="text-align:center;padding:40px;">يرجى اختيار طالب لطباعة نتيجته.</p></div>`;
        } else {
          const isYearly = targetTerm === 'yearly';
          let sumEarned = 0;
          let sumMax = 0;
          let sumM1 = 0, sumM2 = 0, sumM3 = 0, sumCw = 0, sumEx = 0;
          let sumT1 = 0, sumT2 = 0;
          let failedSubjectsCount = 0;

          const subjRows = activeSubjectsList.map((subj, idx) => {
            if (!isYearly) {
              const gObj = getGradeObj(st.id, subj, targetTerm);
              const m1Tot = calculateMonthTotal(gObj.m1);
              const m2Tot = calculateMonthTotal(gObj.m2);
              const m3Tot = calculateMonthTotal(gObj.m3);
              const cw20 = getCoursework20(gObj);
              const exam30 = Number(gObj.finalExam) || 0;
              const tot50 = parseFloat((cw20 + exam30).toFixed(1));
              sumM1 += m1Tot; sumM2 += m2Tot; sumM3 += m3Tot;
              sumCw += cw20; sumEx += exam30;
              sumEarned += tot50;
              sumMax += 50;
              if (tot50 < 25) failedSubjectsCount++;

              return `
                <tr>
                  <td class="col-num sticky-print-col-1">${idx + 1}</td>
                  <td class="sticky-print-col-2" style="text-align:right;font-weight:800;">${subj}</td>
                  <td>50</td>
                  <td>25</td>
                  <td>${m1Tot}</td>
                  <td>${m2Tot}</td>
                  <td>${m3Tot}</td>
                  <td style="font-weight:700;background:#f8fafc;">${cw20}</td>
                  <td style="font-weight:700;background:#f8fafc;">${exam30}</td>
                  <td style="font-weight:900;color:#1e3a8a;background:#eff6ff;font-size:12.5px;">${tot50}</td>
                  <td>${getGradeEstimate(tot50, 50)}</td>
                  <td style="font-weight:700;color:${tot50 >= 25 ? '#047857' : '#b91c1c'};">${tot50 >= 25 ? 'ناجح' : 'غير مجتاز'}</td>
                </tr>
              `;
            } else {
              const g1 = getGradeObj(st.id, subj, 'term1');
              const g2 = getGradeObj(st.id, subj, 'term2');
              const t1Cw = getCoursework20(g1);
              const t1Ex = Number(g1.finalExam) || 0;
              const t1Tot = parseFloat((t1Cw + t1Ex).toFixed(1));
              const t2Cw = getCoursework20(g2);
              const t2Ex = Number(g2.finalExam) || 0;
              const t2Tot = parseFloat((t2Cw + t2Ex).toFixed(1));
              const yearlyTot = Math.round(t1Tot + t2Tot);
              sumT1 += t1Tot; sumT2 += t2Tot;
              sumEarned += yearlyTot;
              sumMax += 100;
              if (yearlyTot < 50) failedSubjectsCount++;

              return `
                <tr>
                  <td class="col-num sticky-print-col-1">${idx + 1}</td>
                  <td class="sticky-print-col-2" style="text-align:right;font-weight:800;">${subj}</td>
                  <td>100</td>
                  <td>50</td>
                  <td>${t1Cw}</td>
                  <td>${t1Ex}</td>
                  <td style="font-weight:700;background:#f8fafc;">${t1Tot}</td>
                  <td>${t2Cw}</td>
                  <td>${t2Ex}</td>
                  <td style="font-weight:700;background:#f8fafc;">${t2Tot}</td>
                  <td style="font-weight:900;color:#1e3a8a;background:#eff6ff;font-size:12.5px;">${yearlyTot}</td>
                  <td>${getGradeEstimate(yearlyTot, 100)}</td>
                  <td style="font-weight:700;color:${yearlyTot >= 50 ? '#047857' : '#b91c1c'};">${yearlyTot >= 50 ? 'ناجح' : 'راسب'}</td>
                </tr>
              `;
            }
          }).join('');

          const pct = sumMax > 0 ? parseFloat(((sumEarned / sumMax) * 100).toFixed(1)) : 0;
          const finalStatus = failedSubjectsCount === 0 ? 'ناجح' : `مكمل (${failedSubjectsCount} مواد)`;
          const subjCount = activeSubjectsList.length || 1;

          bodyContentHtml = `
            <div class="print-page fit-single-page">
              ${renderOfficialHeader(`<strong>إشعار نتيجة طالب</strong>`, `<strong>${termLabel}</strong>`)}
              <div class="result-title-banner">
                كشف نتيجة الطالب النهائية المعتمدة — ${termLabel}
              </div>
              <div class="student-info-grid">
                <div><strong>اسم الطالب:</strong> ${st.name || ''}</div>
                <div><strong>رقم القيد:</strong> ${st.student_code || st.id}</div>
                <div><strong>الصف الدراسي:</strong> ${st.grade || ''}</div>
                <div><strong>الشعبة:</strong> ${st.section || ''}</div>
              </div>
              <div class="preview-scroll-wrapper">
                <table class="roster-table">
                  <thead>
                    ${!isYearly ? `
                      <tr>
                        <th class="sticky-print-col-1" style="width:4%;">م</th>
                        <th class="sticky-print-col-2" style="text-align:right;width:18%;">المادة الدراسية</th>
                        <th>العظمى</th>
                        <th>الصغرى</th>
                        <th>الشهر الأول<br/>(100)</th>
                        <th>الشهر الثاني<br/>(100)</th>
                        <th>الشهر الثالث<br/>(100)</th>
                        <th>محصلة الفصل<br/>(20)</th>
                        <th>اختبار الفصل<br/>(30)</th>
                        <th style="background:#dbeafe;color:#1e3a8a;">المجموع النهائي<br/>(50)</th>
                        <th>التقدير</th>
                        <th>النتيجة</th>
                      </tr>
                    ` : `
                      <tr>
                        <th class="sticky-print-col-1" style="width:4%;">م</th>
                        <th class="sticky-print-col-2" style="text-align:right;width:18%;">المادة الدراسية</th>
                        <th>العظمى</th>
                        <th>الصغرى</th>
                        <th>محصلة ف1<br/>(20)</th>
                        <th>اختبار ف1<br/>(30)</th>
                        <th>مجموع ف1<br/>(50)</th>
                        <th>محصلة ف2<br/>(20)</th>
                        <th>اختبار ف2<br/>(30)</th>
                        <th>مجموع ف2<br/>(50)</th>
                        <th style="background:#dbeafe;color:#1e3a8a;">المجموع السنوي<br/>(100)</th>
                        <th>التقدير</th>
                        <th>النتيجة</th>
                      </tr>
                    `}
                  </thead>
                  <tbody>
                    ${subjRows}
                    ${!isYearly ? `
                      <tr class="summary-row">
                        <td class="sticky-print-col-1">📊</td>
                        <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">المجموع الكلي للدرجات:</td>
                        <td>${sumMax}</td>
                        <td>${sumMax / 2}</td>
                        <td>${sumM1} / ${subjCount * 100}</td>
                        <td>${sumM2} / ${subjCount * 100}</td>
                        <td>${sumM3} / ${subjCount * 100}</td>
                        <td>${parseFloat(sumCw.toFixed(1))} / ${subjCount * 20}</td>
                        <td>${parseFloat(sumEx.toFixed(1))} / ${subjCount * 30}</td>
                        <td style="font-weight:900;color:#1e3a8a;background:#dbeafe;">${parseFloat(sumEarned.toFixed(1))} / ${sumMax}</td>
                        <td>${getGradeEstimate(pct, 100)}</td>
                        <td style="color:${failedSubjectsCount === 0 ? '#047857' : '#b91c1c'};">${finalStatus}</td>
                      </tr>
                    ` : `
                      <tr class="summary-row">
                        <td class="sticky-print-col-1">📊</td>
                        <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">المجموع الكلي للدرجات:</td>
                        <td>${sumMax}</td>
                        <td>${sumMax / 2}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>${parseFloat(sumT1.toFixed(1))} / ${subjCount * 50}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>${parseFloat(sumT2.toFixed(1))} / ${subjCount * 50}</td>
                        <td style="font-weight:900;color:#1e3a8a;background:#dbeafe;">${parseFloat(sumEarned.toFixed(1))} / ${sumMax}</td>
                        <td>${getGradeEstimate(pct, 100)}</td>
                        <td style="color:${failedSubjectsCount === 0 ? '#047857' : '#b91c1c'};">${finalStatus}</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
              <div class="summary-boxes-row">
                <div class="summary-kpi-box">
                  <div class="kpi-lbl">المجموع الكلي للدرجات</div>
                  <div class="kpi-val">${parseFloat(sumEarned.toFixed(1))} / ${sumMax}</div>
                </div>
                <div class="summary-kpi-box">
                  <div class="kpi-lbl">النسبة المئوية العامة</div>
                  <div class="kpi-val">${pct}%</div>
                </div>
                <div class="summary-kpi-box">
                  <div class="kpi-lbl">التقدير العام</div>
                  <div class="kpi-val">${getGradeEstimate(pct, 100)}</div>
                </div>
                <div class="summary-kpi-box">
                  <div class="kpi-lbl">النتيجة النهائية</div>
                  <div class="kpi-val" style="color:${failedSubjectsCount === 0 ? '#047857' : '#b91c1c'};">${finalStatus}</div>
                </div>
              </div>
              ${renderOfficialSignatures()}
            </div>
          `;
        }
      } else {
        // Direct Final Result Sheet for a Full Grade (`صف كامل`) or a Section (`شعبة`)
        const count = sortedStudents.length || 1;
        const subjCount = Math.max(activeSubjectsList.length, 1);
        const isYearly = targetTerm === 'yearly';
        const maxPerSubj = isYearly ? 100 : 50;
        const passMarkPerSubj = isYearly ? 50 : 25;
        const maxOverall = subjCount * maxPerSubj;
        const totalSubjSubCols = subjCount * 3;
        const colSums = Array(totalSubjSubCols).fill(0);
        const colPassCounts = Array(totalSubjSubCols).fill(0);

        let grandTotalSumAll = 0;
        let grandPctSumAll = 0;

        const fixedColsPct = 2.2 + 12.8 + (scopeType === 'grade' ? 3.5 : 0) + 4.5 + 4.0 + 4.2 + 3.2 + 4.6;
        const perSubColPct = ((100 - fixedColsPct) / totalSubjSubCols).toFixed(3);

        const studentComputed = sortedStudents.map(st => {
          let grandTotal = 0;
          let failedCount = 0;
          const perSubject = {};

          activeSubjectsList.forEach(subj => {
            if (!isYearly) {
              const gObj = getGradeObj(st.id, subj, targetTerm);
              const cw = getCoursework20(gObj);
              const ex = Number(gObj.finalExam) || 0;
              const tot = parseFloat((cw + ex).toFixed(1));
              perSubject[subj] = { c1: cw, c2: ex, tot };
              grandTotal += tot;
              if (tot < passMarkPerSubj) failedCount++;
            } else {
              const g1 = getGradeObj(st.id, subj, 'term1');
              const g2 = getGradeObj(st.id, subj, 'term2');
              const t1 = getTermTotal50(g1);
              const t2 = getTermTotal50(g2);
              const tot = Math.round(t1 + t2);
              perSubject[subj] = { c1: t1, c2: t2, tot };
              grandTotal += tot;
              if (tot < passMarkPerSubj) failedCount++;
            }
          });

          const roundedTotal = parseFloat(grandTotal.toFixed(1));
          const pct = maxOverall > 0 ? parseFloat(((roundedTotal / maxOverall) * 100).toFixed(1)) : 0;
          return {
            student: st,
            perSubject,
            grandTotal: roundedTotal,
            pct,
            failedCount,
            passed: failedCount === 0 && roundedTotal > 0
          };
        });

        const sortedByScore = [...studentComputed]
          .map(item => item.grandTotal)
          .sort((a, b) => b - a);

        const passStudentsCount = studentComputed.filter(x => x.passed).length;
        const passRateOverall = studentComputed.length > 0
          ? parseFloat(((passStudentsCount / studentComputed.length) * 100).toFixed(1))
          : 0;

        const rowsHtml = studentComputed.map((item, idx) => {
          const st = item.student;
          const rank = item.grandTotal > 0 ? (sortedByScore.indexOf(item.grandTotal) + 1) : '-';

          grandTotalSumAll += item.grandTotal;
          grandPctSumAll += item.pct;

          const subjCells = activeSubjectsList.map((subj, sIdx) => {
            const sInfo = item.perSubject[subj];
            const baseIdx = sIdx * 3;
            colSums[baseIdx] += sInfo.c1;
            colSums[baseIdx + 1] += sInfo.c2;
            colSums[baseIdx + 2] += sInfo.tot;
            if (sInfo.c1 >= (isYearly ? 25 : 10)) colPassCounts[baseIdx]++;
            if (sInfo.c2 >= (isYearly ? 25 : 15)) colPassCounts[baseIdx + 1]++;
            if (sInfo.tot >= passMarkPerSubj) colPassCounts[baseIdx + 2]++;

            return `
              <td>${sInfo.c1}</td>
              <td>${sInfo.c2}</td>
              <td style="font-weight:800;background:#f8fafc;color:${sInfo.tot >= passMarkPerSubj ? '#1e3a8a' : '#b91c1c'};">${sInfo.tot}</td>
            `;
          }).join('');

          return `
            <tr>
              <td class="col-num sticky-print-col-1">${idx + 1}</td>
              <td class="col-name sticky-print-col-2">${st.name || ''}</td>
              ${scopeType === 'grade' ? `<td class="col-sec">${st.section || ''}</td>` : ''}
              ${subjCells}
              <td style="font-weight:900;background:#eff6ff;color:#1e3a8a;">${item.grandTotal}</td>
              <td style="font-weight:800;">${item.pct}%</td>
              <td style="font-weight:700;">${getGradeEstimate(item.pct, 100)}</td>
              <td style="font-weight:800;color:#1e3a8a;">${rank}</td>
              <td style="font-weight:800;color:${item.failedCount === 0 ? '#047857' : '#b91c1c'};">
                ${item.failedCount === 0 ? 'ناجح' : `راسب (${item.failedCount})`}
              </td>
            </tr>
          `;
        }).join('');

        const classAvgGrand = parseFloat((grandTotalSumAll / count).toFixed(1));
        const classAvgPct = parseFloat((grandPctSumAll / count).toFixed(1));

        bodyContentHtml = `
          <div class="print-page fit-single-page">
            ${renderOfficialHeader(`<strong>كشف النتيجة النهائية</strong>`, `<strong>${termLabel}</strong>`)}
            <div class="meta-strip">
              <span><strong>كشف النتيجة النهائية المعتمد:</strong> ${termLabel}</span>
              <span><strong>${scopeLabel}</strong></span>
              <span><strong>إجمالي الطلاب:</strong> ${studentComputed.length}</span>
              <span><strong>عدد الناجحين:</strong> ${passStudentsCount} (${passRateOverall}%)</span>
            </div>
            <div class="preview-scroll-wrapper">
              <table class="roster-table dense-3months-table">
                <thead>
                  <tr>
                    <th rowspan="2" class="sticky-print-col-1" style="width:2.2%;min-width:26px;">م</th>
                    <th rowspan="2" class="sticky-print-col-2" style="width:12.8%;min-width:130px;text-align:right;">اسم الطالب</th>
                    ${scopeType === 'grade' ? `<th rowspan="2" style="width:3.5%;min-width:35px;">الشعبة</th>` : ''}
                    ${activeSubjectsList.map(subj => `<th colspan="3" style="background:#f1f5f9;white-space:nowrap;font-size:9.5px;font-weight:800;padding:4px 2px;">${subj}</th>`).join('')}
                    <th rowspan="2" style="min-width:44px;background:#dbeafe;color:#1e3a8a;"><span class="col-sub-term">المجموع</span><span class="col-sub-num">(${maxOverall})</span></th>
                    <th rowspan="2" style="min-width:38px;"><span class="col-sub-term">النسبة</span><span class="col-sub-num">(%)</span></th>
                    <th rowspan="2" style="min-width:40px;"><span class="col-sub-term">التقدير</span></th>
                    <th rowspan="2" style="min-width:34px;"><span class="col-sub-term">الترتيب</span></th>
                    <th rowspan="2" style="min-width:44px;"><span class="col-sub-term">النتيجة</span></th>
                  </tr>
                  <tr>
                    ${activeSubjectsList.map(() => !isYearly ? `
                      <th style="min-width:34px;padding:2px 1px;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                      <th style="min-width:34px;padding:2px 1px;"><span class="col-sub-term">اختبار</span><span class="col-sub-num">30</span></th>
                      <th style="min-width:34px;padding:2px 1px;background:#e2e8f0;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">50</span></th>
                    ` : `
                      <th style="min-width:34px;padding:2px 1px;"><span class="col-sub-term">ف1</span><span class="col-sub-num">50</span></th>
                      <th style="min-width:34px;padding:2px 1px;"><span class="col-sub-term">ف2</span><span class="col-sub-num">50</span></th>
                      <th style="min-width:34px;padding:2px 1px;background:#e2e8f0;"><span class="col-sub-term">مجموع</span><span class="col-sub-num">100</span></th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📊</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">مجموع درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${colSums.map(s => `<td style="font-weight:800;color:#1e3a8a;">${parseFloat(s.toFixed(0))}</td>`).join('')}
                    <td style="font-weight:900;color:#1e3a8a;">${parseFloat(grandTotalSumAll.toFixed(0))}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">📈</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">متوسط درجات الفصل:</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${colSums.map(s => `<td style="font-weight:800;color:#0f766e;">${parseFloat((s / count).toFixed(1))}</td>`).join('')}
                    <td style="font-weight:900;color:#0f766e;">${classAvgGrand}</td>
                    <td style="font-weight:900;color:#047857;">${classAvgPct}%</td>
                    <td>${getGradeEstimate(classAvgPct, 100)}</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="sticky-print-col-1">✅</td>
                    <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">نسبة النجاح (≥ ٥٠%):</td>
                    ${scopeType === 'grade' ? `<td>-</td>` : ''}
                    ${colPassCounts.map(c => {
                      const p = parseFloat(((c / count) * 100).toFixed(0));
                      return `<td style="font-weight:800;color:${p >= 50 ? '#047857' : '#b91c1c'};">${p}%</td>`;
                    }).join('')}
                    <td>-</td>
                    <td style="font-weight:900;color:#047857;">${passRateOverall}%</td>
                    <td>-</td>
                    <td>-</td>
                    <td style="font-weight:900;color:#047857;">${passRateOverall}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="stats-footer-strip">
              <span><strong>إجمالي الطلاب المقيدين:</strong> ${studentComputed.length}</span>
              <span><strong>عدد الناجحين:</strong> ${passStudentsCount}</span>
              <span><strong>عدد المكملين / الراسبين:</strong> ${studentComputed.length - passStudentsCount}</span>
              <span><strong>نسبة النجاح العامة:</strong> ${passRateOverall}%</span>
              <span><strong>متوسط مجموع الفصل:</strong> ${classAvgGrand} / ${maxOverall} (${classAvgPct}%)</span>
            </div>
            ${renderOfficialSignatures()}
          </div>
        `;
      }
    }

    // =========================================================================
    // TEMPLATE 6: أمر طباعة نموذج شهادة معتمد كقالب جاهز للطباعة يتضمن الدرجات المرصودة مسبقاً
    // =========================================================================
    else if (activeTemplate === 'template_6_official_certificate') {
      const isYearly = targetTerm === 'yearly';
      const subjCount = Math.max(activeSubjectsList.length, 1);

      if (sortedStudents.length === 0) {
        bodyContentHtml = `<div class="print-page"><p style="text-align:center;padding:40px;">لا يوجد طلاب في هذا النطاق لطباعة الشهادات.</p></div>`;
      } else {
        bodyContentHtml = sortedStudents.map((st, stIdx) => {
          let sumEarned = 0;
          let sumMax = 0;
          let sumM1 = 0, sumM2 = 0, sumM3 = 0, sumCw = 0, sumEx = 0;
          let sumT1M1 = 0, sumT1M2 = 0, sumT1M3 = 0, sumT1Cw = 0, sumT1Ex = 0, sumT1Tot = 0;
          let sumT2M1 = 0, sumT2M2 = 0, sumT2M3 = 0, sumT2Cw = 0, sumT2Ex = 0, sumT2Tot = 0;
          let failedCount = 0;

          const certRows = activeSubjectsList.map((subj, idx) => {
            if (!isYearly) {
              const gObj = getGradeObj(st.id, subj, targetTerm);
              const m1Tot = calculateMonthTotal(gObj.m1);
              const m2Tot = calculateMonthTotal(gObj.m2);
              const m3Tot = calculateMonthTotal(gObj.m3);
              const cw20 = getCoursework20(gObj);
              const exam30 = Number(gObj.finalExam) || 0;
              const tot50 = parseFloat((cw20 + exam30).toFixed(1));
              sumM1 += m1Tot; sumM2 += m2Tot; sumM3 += m3Tot;
              sumCw += cw20; sumEx += exam30;
              sumEarned += tot50;
              sumMax += 50;
              if (tot50 < 25) failedCount++;

              return `
                <tr>
                  <td class="col-num sticky-print-col-1">${idx + 1}</td>
                  <td class="sticky-print-col-2" style="text-align:right;font-weight:800;font-size:11.5px;">${subj}</td>
                  <td>50</td>
                  <td>25</td>
                  <td>${m1Tot}</td>
                  <td>${m2Tot}</td>
                  <td>${m3Tot}</td>
                  <td style="font-weight:700;background:#f8fafc;">${cw20}</td>
                  <td style="font-weight:700;background:#f8fafc;">${exam30}</td>
                  <td style="font-weight:900;font-size:12px;color:#1e3a8a;background:#eff6ff;">${tot50}</td>
                  <td style="font-weight:700;">${getGradeEstimate(tot50, 50)}</td>
                  <td style="font-weight:700;color:${tot50 >= 25 ? '#047857' : '#b91c1c'};">${tot50 >= 25 ? 'مجتاز' : 'غير مجتاز'}</td>
                </tr>
              `;
            } else {
              const g1 = getGradeObj(st.id, subj, 'term1');
              const g2 = getGradeObj(st.id, subj, 'term2');
              const t1m1 = calculateMonthTotal(g1.m1);
              const t1m2 = calculateMonthTotal(g1.m2);
              const t1m3 = calculateMonthTotal(g1.m3);
              const t1Cw = getCoursework20(g1);
              const t1Ex = Number(g1.finalExam) || 0;
              const t1Tot = parseFloat((t1Cw + t1Ex).toFixed(1));

              const t2m1 = calculateMonthTotal(g2.m1);
              const t2m2 = calculateMonthTotal(g2.m2);
              const t2m3 = calculateMonthTotal(g2.m3);
              const t2Cw = getCoursework20(g2);
              const t2Ex = Number(g2.finalExam) || 0;
              const t2Tot = parseFloat((t2Cw + t2Ex).toFixed(1));

              const yearlyTot = Math.round(t1Tot + t2Tot);
              sumT1M1 += t1m1; sumT1M2 += t1m2; sumT1M3 += t1m3; sumT1Cw += t1Cw; sumT1Ex += t1Ex; sumT1Tot += t1Tot;
              sumT2M1 += t2m1; sumT2M2 += t2m2; sumT2M3 += t2m3; sumT2Cw += t2Cw; sumT2Ex += t2Ex; sumT2Tot += t2Tot;
              sumEarned += yearlyTot;
              sumMax += 100;
              if (yearlyTot < 50) failedCount++;

              return `
                <tr>
                  <td class="col-num sticky-print-col-1">${idx + 1}</td>
                  <td class="sticky-print-col-2" style="text-align:right;font-weight:800;font-size:11px;">${subj}</td>
                  <td>100</td>
                  <td>50</td>
                  <td>${t1m1}</td>
                  <td>${t1m2}</td>
                  <td>${t1m3}</td>
                  <td>${t1Cw}</td>
                  <td>${t1Ex}</td>
                  <td style="font-weight:800;background:#f8fafc;color:#1e3a8a;">${t1Tot}</td>
                  <td>${t2m1}</td>
                  <td>${t2m2}</td>
                  <td>${t2m3}</td>
                  <td>${t2Cw}</td>
                  <td>${t2Ex}</td>
                  <td style="font-weight:800;background:#f8fafc;color:#1e3a8a;">${t2Tot}</td>
                  <td style="font-weight:900;font-size:12px;color:#065f46;background:#ecfdf5;">${yearlyTot}</td>
                  <td style="font-weight:700;">${getGradeEstimate(yearlyTot, 100)}</td>
                  <td style="font-weight:700;color:${yearlyTot >= 50 ? '#047857' : '#b91c1c'};">${yearlyTot >= 50 ? 'ناجح' : 'راسب'}</td>
                </tr>
              `;
            }
          }).join('');

          const pct = sumMax > 0 ? parseFloat(((sumEarned / sumMax) * 100).toFixed(1)) : 0;
          const estimate = getGradeEstimate(pct, 100);
          const decisionText = failedCount === 0
            ? (isYearly ? 'ناجح ومنقول إلى الصف الأعلى' : 'ناجح في الفصل الدراسي')
            : `مكمل / غير مجتاز في (${failedCount}) مواد`;

          return `
            <div class="certificate-page fit-single-page" style="${stIdx < sortedStudents.length - 1 ? 'page-break-after: always; break-after: page;' : ''}">
              <div class="certificate-outer-frame">
                <div class="certificate-inner-frame">
                  ${renderOfficialHeader(`<strong>رقم القيد:</strong> ${st.student_code || st.id}`, `<strong>الشهادة المعتمدة</strong>`)}

                  <div class="certificate-banner">
                    <div class="cert-main-title">شهادة تقييم ونتيجة الطالب المعتمدة</div>
                    <div class="cert-sub-title">${termLabel} — للعام الدراسي 2025 / 2026 م</div>
                  </div>

                  <div class="student-info-grid cert-student-box">
                    <div><strong>اسم الطالب الرباعي:</strong> <span style="color:#1e3a8a;font-size:13px;font-weight:900;">${st.name || ''}</span></div>
                    <div><strong>الصف الدراسي:</strong> ${st.grade || ''}</div>
                    <div><strong>الشعبة:</strong> ${st.section || ''}</div>
                    <div><strong>رقم القيد الأكاديمي:</strong> ${st.student_code || st.id}</div>
                  </div>

                  <div class="preview-scroll-wrapper">
                    <table class="roster-table cert-grades-table ${isYearly ? 'dense-3months-table' : ''}">
                      <thead>
                        ${!isYearly ? `
                          <tr>
                            <th class="sticky-print-col-1" style="width:4%;min-width:28px;">م</th>
                            <th class="sticky-print-col-2" style="text-align:right;width:18%;min-width:140px;">المادة الدراسية</th>
                            <th style="min-width:45px;"><span class="col-sub-term">الدرجة العظمى</span></th>
                            <th style="min-width:45px;"><span class="col-sub-term">الدرجة الصغرى</span></th>
                            <th style="min-width:48px;"><span class="col-sub-term">الشهر الأول</span><span class="col-sub-num">(100)</span></th>
                            <th style="min-width:48px;"><span class="col-sub-term">الشهر الثاني</span><span class="col-sub-num">(100)</span></th>
                            <th style="min-width:48px;"><span class="col-sub-term">الشهر الثالث</span><span class="col-sub-num">(100)</span></th>
                            <th style="min-width:48px;"><span class="col-sub-term">محصلة الفصل</span><span class="col-sub-num">(20)</span></th>
                            <th style="min-width:48px;"><span class="col-sub-term">اختبار الفصل</span><span class="col-sub-num">(30)</span></th>
                            <th style="min-width:52px;background:#dbeafe;color:#1e3a8a;"><span class="col-sub-term">الدرجة النهائية</span><span class="col-sub-num">(50)</span></th>
                            <th style="min-width:46px;"><span class="col-sub-term">التقدير اللفظي</span></th>
                            <th style="min-width:44px;"><span class="col-sub-term">حالة المادة</span></th>
                          </tr>
                        ` : `
                          <tr>
                            <th rowspan="2" class="sticky-print-col-1" style="width:3%;min-width:26px;">م</th>
                            <th rowspan="2" class="sticky-print-col-2" style="text-align:right;width:15%;min-width:130px;">المادة الدراسية</th>
                            <th rowspan="2" style="min-width:42px;"><span class="col-sub-term">العظمى</span><span class="col-sub-num">(100)</span></th>
                            <th rowspan="2" style="min-width:42px;"><span class="col-sub-term">الصغرى</span><span class="col-sub-num">(50)</span></th>
                            <th colspan="6" style="background:#e0f2fe;color:#1e3a8a;">الفصل الدراسي الأول</th>
                            <th colspan="6" style="background:#fce7f3;color:#831843;">الفصل الدراسي الثاني</th>
                            <th rowspan="2" style="min-width:48px;background:#d1fae5;color:#065f46;"><span class="col-sub-term">المجموع السنوي</span><span class="col-sub-num">(100)</span></th>
                            <th rowspan="2" style="min-width:40px;"><span class="col-sub-term">التقدير</span></th>
                            <th rowspan="2" style="min-width:40px;"><span class="col-sub-term">النتيجة</span></th>
                          </tr>
                          <tr>
                            <th style="min-width:32px;"><span class="col-sub-term">ش1</span><span class="col-sub-num">100</span></th>
                            <th style="min-width:32px;"><span class="col-sub-term">ش2</span><span class="col-sub-num">100</span></th>
                            <th style="min-width:32px;"><span class="col-sub-term">ش3</span><span class="col-sub-num">100</span></th>
                            <th style="min-width:32px;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                            <th style="min-width:32px;"><span class="col-sub-term">اختبار</span><span class="col-sub-num">30</span></th>
                            <th style="min-width:34px;background:#dbeafe;"><span class="col-sub-term">مجموع ف1</span><span class="col-sub-num">50</span></th>
                            <th style="min-width:32px;"><span class="col-sub-term">ش1</span><span class="col-sub-num">100</span></th>
                            <th style="min-width:32px;"><span class="col-sub-term">ش2</span><span class="col-sub-num">100</span></th>
                            <th style="min-width:32px;"><span class="col-sub-term">ش3</span><span class="col-sub-num">100</span></th>
                            <th style="min-width:32px;"><span class="col-sub-term">محصلة</span><span class="col-sub-num">20</span></th>
                            <th style="min-width:32px;"><span class="col-sub-term">اختبار</span><span class="col-sub-num">30</span></th>
                            <th style="min-width:34px;background:#fce7f3;"><span class="col-sub-term">مجموع ف2</span><span class="col-sub-num">50</span></th>
                          </tr>
                        `}
                      </thead>
                      <tbody>
                        ${certRows}
                        ${!isYearly ? `
                          <tr class="summary-row">
                            <td class="sticky-print-col-1">📊</td>
                            <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">المجموع الكلي للدرجات:</td>
                            <td>${sumMax}</td>
                            <td>${sumMax / 2}</td>
                            <td>${sumM1} / ${subjCount * 100}</td>
                            <td>${sumM2} / ${subjCount * 100}</td>
                            <td>${sumM3} / ${subjCount * 100}</td>
                            <td>${parseFloat(sumCw.toFixed(1))} / ${subjCount * 20}</td>
                            <td>${parseFloat(sumEx.toFixed(1))} / ${subjCount * 30}</td>
                            <td style="font-weight:900;color:#1e3a8a;background:#dbeafe;">${parseFloat(sumEarned.toFixed(1))} / ${sumMax}</td>
                            <td>${estimate}</td>
                            <td style="color:${failedCount === 0 ? '#047857' : '#b91c1c'};">${failedCount === 0 ? 'ناجح' : 'مكمل'}</td>
                          </tr>
                        ` : `
                          <tr class="summary-row">
                            <td class="sticky-print-col-1">📊</td>
                            <td class="sticky-print-col-2" style="text-align:right;font-weight:900;">المجموع الكلي للدرجات:</td>
                            <td>${sumMax}</td>
                            <td>${sumMax / 2}</td>
                            <td>${sumT1M1}</td><td>${sumT1M2}</td><td>${sumT1M3}</td>
                            <td>${parseFloat(sumT1Cw.toFixed(1))}</td><td>${parseFloat(sumT1Ex.toFixed(1))}</td>
                            <td style="font-weight:900;color:#1e3a8a;">${parseFloat(sumT1Tot.toFixed(1))}</td>
                            <td>${sumT2M1}</td><td>${sumT2M2}</td><td>${sumT2M3}</td>
                            <td>${parseFloat(sumT2Cw.toFixed(1))}</td><td>${parseFloat(sumT2Ex.toFixed(1))}</td>
                            <td style="font-weight:900;color:#831843;">${parseFloat(sumT2Tot.toFixed(1))}</td>
                            <td style="font-weight:900;color:#065f46;background:#d1fae5;">${parseFloat(sumEarned.toFixed(1))} / ${sumMax}</td>
                            <td>${estimate}</td>
                            <td style="color:${failedCount === 0 ? '#047857' : '#b91c1c'};">${failedCount === 0 ? 'ناجح' : 'راسب'}</td>
                          </tr>
                        `}
                      </tbody>
                    </table>
                  </div>

                  <div class="summary-boxes-row" style="margin-top:8px;">
                    <div class="summary-kpi-box">
                      <div class="kpi-lbl">المجموع العام للدرجات</div>
                      <div class="kpi-val">${parseFloat(sumEarned.toFixed(1))} من ${sumMax}</div>
                    </div>
                    <div class="summary-kpi-box">
                      <div class="kpi-lbl">النسبة المئوية</div>
                      <div class="kpi-val">${pct}%</div>
                    </div>
                    <div class="summary-kpi-box">
                      <div class="kpi-lbl">التقدير العام</div>
                      <div class="kpi-val" style="color:#1e3a8a;">${estimate}</div>
                    </div>
                    <div class="summary-kpi-box">
                      <div class="kpi-lbl">المواظبة والسلوك</div>
                      <div class="kpi-val" style="color:#047857;">ممتاز</div>
                    </div>
                    <div class="summary-kpi-box" style="flex:1.4;">
                      <div class="kpi-lbl">القرار النهائي والنتيجة</div>
                      <div class="kpi-val" style="color:${failedCount === 0 ? '#047857' : '#b91c1c'};font-size:11.5px;">${decisionText}</div>
                    </div>
                  </div>

                  <div class="cert-signatures-row">
                    <div class="sig-box">
                      <div class="sig-title">مربي الفصل</div>
                      <div class="sig-line">................................</div>
                    </div>
                    <div class="sig-box">
                      <div class="sig-title">رئيس لجنة الكنترول</div>
                      <div class="sig-line">................................</div>
                    </div>
                    <div class="stamp-circle">
                      <span>الختم الرسمي</span>
                      <small>أنوار العلى</small>
                    </div>
                    <div class="sig-box">
                      <div class="sig-title">يعتمد / مدير المدرسة</div>
                      <div class="sig-line">................................</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    const sharedStyles = `
      .print-page {
        width: 100%;
        max-width: 100%;
        padding: 2px;
        direction: rtl;
        font-family: 'Cairo', 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif;
        color: #0f172a;
        background: #ffffff;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .official-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #1e3a8a;
        padding-bottom: 5px;
        margin-bottom: 5px;
      }
      .header-right {
        text-align: right;
        line-height: 1.35;
        flex: 1;
      }
      .rep-title { font-size: 11.5px; font-weight: 800; color: #0f172a; }
      .min-title { font-size: 11px; font-weight: 700; color: #1e3a8a; }
      .sch-title { font-size: 12px; font-weight: 900; color: #0f172a; }
      .header-center {
        flex: 0 0 70px;
        text-align: center;
      }
      .school-logo {
        width: 54px;
        height: 54px;
        object-fit: contain;
      }
      .header-left {
        flex: 1;
        text-align: left;
        font-size: 10.5px;
        line-height: 1.35;
        color: #1e293b;
      }
      .meta-strip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 5px;
        padding: 4px 10px;
        margin-bottom: 5px;
        font-size: 10px;
      }
      .stats-footer-strip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        background: #f1f5f9;
        border: 1px solid #94a3b8;
        border-radius: 5px;
        padding: 4px 10px;
        margin-top: 5px;
        font-size: 10px;
        page-break-inside: avoid;
      }
      .roster-table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 9.2px;
        direction: rtl;
        table-layout: auto !important;
      }
      .roster-table.ultra-compact-table {
        font-size: 8px;
      }
      .roster-table.dense-3months-table {
        font-size: 7.2px;
      }
      .roster-table th,
      .roster-table td {
        border: 1px solid #334155;
        padding: 2.5px 2px;
        text-align: center;
        vertical-align: middle;
        white-space: normal;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
        word-wrap: normal !important;
        hyphens: none !important;
        line-height: 1.15;
      }
      .roster-table.ultra-compact-table th,
      .roster-table.ultra-compact-table td {
        padding: 2px 1px;
        line-height: 1.1;
      }
      .roster-table.dense-3months-table th,
      .roster-table.dense-3months-table td {
        padding: 1.6px 1px;
        line-height: 1.05;
      }
      .roster-table th {
        background-color: #e2e8f0;
        color: #0f172a;
        font-weight: 800;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
      }
      .col-sub-term {
        display: block !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
        font-size: 8px !important;
        font-weight: 700 !important;
        line-height: 1.1 !important;
      }
      .col-sub-num {
        display: block !important;
        white-space: nowrap !important;
        overflow-wrap: normal !important;
        font-size: 8px !important;
        font-weight: 800 !important;
        line-height: 1.1 !important;
      }
      .col-term-word {
        display: block !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
        font-size: 7.2px !important;
        font-weight: 700 !important;
        line-height: 1.05 !important;
        letter-spacing: -0.2px !important;
      }
      .col-term-title {
        display: inline-block !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
        font-size: 8.8px !important;
        font-weight: 800 !important;
      }
      .subj-dense-col {
        min-width: 32px !important;
        padding: 1.5px 1px !important;
        text-align: center !important;
        vertical-align: middle !important;
      }
      .roster-table td.col-num {
        font-weight: 700;
        background: #f8fafc;
        white-space: nowrap !important;
      }
      .roster-table td.col-code {
        font-family: monospace;
        font-size: 8.8px;
        color: #334155;
        white-space: nowrap !important;
      }
      .roster-table td.col-name {
        text-align: right !important;
        padding-right: 6px !important;
        padding-left: 4px !important;
        font-weight: 800;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
      }
      .roster-table td.blank-cell {
        height: 19px;
      }
      .roster-table tr.summary-row td {
        background-color: #f8fafc;
        font-weight: 800;
        border-top: 1.5px solid #1e293b;
      }
      .signatures-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-top: 10px;
        padding-top: 4px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .sig-box {
        text-align: center;
        flex: 1;
      }
      .sig-title {
        font-size: 10.5px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 12px;
      }
      .sig-line {
        font-size: 9.5px;
        color: #64748b;
      }
      .result-title-banner {
        background: #1e3a8a;
        color: #ffffff;
        text-align: center;
        font-size: 13px;
        font-weight: 900;
        padding: 5px;
        border-radius: 5px;
        margin-bottom: 6px;
      }
      .student-info-grid {
        display: grid;
        grid-template-columns: 2fr 1.1fr 0.8fr 1.1fr;
        gap: 6px;
        background: #f8fafc;
        border: 1.5px solid #cbd5e1;
        border-radius: 6px;
        padding: 6px 10px;
        margin-bottom: 7px;
        font-size: 11px;
        align-items: center;
      }
      .summary-boxes-row {
        display: flex;
        gap: 6px;
        margin-top: 7px;
        page-break-inside: avoid;
      }
      .summary-kpi-box {
        flex: 1;
        border: 1.5px solid #94a3b8;
        background: #f8fafc;
        border-radius: 6px;
        padding: 5px;
        text-align: center;
      }
      .kpi-lbl {
        font-size: 9.5px;
        font-weight: 700;
        color: #475569;
        margin-bottom: 2px;
      }
      .kpi-val {
        font-size: 12.5px;
        font-weight: 900;
        color: #0f172a;
      }
      .certificate-page {
        width: 100%;
        padding: 3px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .certificate-outer-frame {
        border: 3px double #1e3a8a;
        padding: 4px;
        border-radius: 8px;
        background: #ffffff;
      }
      .certificate-inner-frame {
        border: 1.5px solid #1e3a8a;
        padding: 9px 12px;
        border-radius: 5px;
        background: radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%);
      }
      .certificate-banner {
        text-align: center;
        background: linear-gradient(90deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%);
        border: 1.5px solid #1e3a8a;
        border-radius: 6px;
        padding: 4px 12px;
        margin: 4px auto 7px;
        max-width: 85%;
      }
      .cert-main-title {
        font-size: 14.5px;
        font-weight: 900;
        color: #1e3a8a;
      }
      .cert-sub-title {
        font-size: 10.5px;
        font-weight: 700;
        color: #334155;
        margin-top: 1px;
      }
      .cert-grades-table th,
      .cert-grades-table td {
        padding: 3.5px 4px;
        font-size: 10.5px;
      }
      .cert-signatures-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        padding-top: 5px;
      }
      .stamp-circle {
        width: 68px;
        height: 68px;
        border: 1.5px dashed #1e3a8a;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #1e3a8a;
        font-weight: 800;
        font-size: 9.5px;
        text-align: center;
        opacity: 0.75;
      }
    `;

    return { bodyContentHtml, sharedStyles, isLandscape };
  };

  // Trigger iframe print with automatic pre-print width & height fit verification
  const openPrintIframe = (htmlContent, isLandscape) => {
    const oldIframe = document.getElementById('grades-direct-print-iframe');
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'grades-direct-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '-9999px';
    iframe.style.bottom = '0';
    // Give the iframe the exact A4 printable width in pixels so table scrollWidth / offsetHeight measurements are 100% accurate
    iframe.style.width = isLandscape ? '1065px' : '740px';
    iframe.style.height = isLandscape ? '710px' : '1040px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        try {
          const targetWidth = isLandscape ? 1055 : 730;
          const targetHeight = isLandscape ? 695 : 1015;
          const pages = doc.querySelectorAll('.fit-single-page');

          pages.forEach(page => {
            const table = page.querySelector('table');
            const contentW = Math.max(page.scrollWidth, table ? table.scrollWidth : 0);
            let scaleW = 1;
            if (contentW > targetWidth) {
              scaleW = targetWidth / contentW;
            }

            // If number of students is <= 20 (or it's a single student certificate), ensure it also fits vertically on 1 single page without spilling rows/signatures onto page 2
            let scaleH = 1;
            const currentH = page.scrollHeight * scaleW;
            if (sortedStudents.length <= 20 || page.classList.contains('certificate-page')) {
              if (currentH > targetHeight) {
                scaleH = targetHeight / page.scrollHeight;
              }
            }

            const finalZoom = Math.min(scaleW, scaleH, 1);
            if (finalZoom < 0.995) {
              page.style.zoom = String(Math.max(finalZoom, 0.58));
            }
          });
        } catch (e) {
          console.error('Auto-fit print calculation warning:', e);
        }

        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 250);
    };
  };

  const handleExecutePrint = async () => {
    setIsPreparingPrint(true);
    try {
      const gradesLookup = new Map();
      (detailedGrades || []).forEach(item => {
        gradesLookup.set(Number(item.studentId), item.grades || {});
      });

      if (fetchClassGrades && matchedClasses.length > 0) {
        const classIdsToFetch = matchedClasses
          .map(c => String(c.id).replace(/\D/g, ''))
          .filter(Boolean);

        const fetchedArrays = await Promise.all(
          classIdsToFetch.map(cid => fetchClassGrades(cid))
        );

        fetchedArrays.forEach(arr => {
          if (Array.isArray(arr)) {
            arr.forEach(item => {
              gradesLookup.set(Number(item.studentId), item.grades || {});
            });
          }
        });
      }

      const { bodyContentHtml, sharedStyles, isLandscape } = buildDocumentData(gradesLookup);

      const fullHtml = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>طباعة كشوفات ونتائج الدرجات - رياض ومدارس أنوار العلى الدولية النموذجية</title>
          <style>
            @page {
              size: A4 ${isLandscape ? 'landscape' : 'portrait'};
              margin: 5mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              font-family: 'Cairo', 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              direction: rtl;
              width: 100%;
            }
            .preview-scroll-wrapper {
              width: 100%;
              overflow: visible !important;
            }
            ${sharedStyles}
          </style>
        </head>
        <body>
          ${bodyContentHtml}
        </body>
        </html>
      `;

      openPrintIframe(fullHtml, isLandscape);
    } finally {
      setIsPreparingPrint(false);
    }
  };

  const allowStudentScope = activeTemplate === 'template_5_direct_result' || activeTemplate === 'template_6_official_certificate';
  const allowYearlyTerm = activeTemplate === 'template_5_direct_result' || activeTemplate === 'template_6_official_certificate';
  const allowSubjectModeFilter = activeTemplate === 'template_1_blank_year' || activeTemplate === 'template_2_monthly_sheet' || activeTemplate === 'template_3_three_months';

  const previewData = buildDocumentData();

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1120px',
          width: '96%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '18px',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 22px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Printer size={22} />
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                {lang === 'ar'
                  ? 'الطباعة المباشرة للكشوفات والنتائج والشهادات المعتمدة'
                  : 'Direct Print of Grade Sheets, Results & Accredited Certificates'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#ffffff',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Step 1: Select Template (1 to 6) */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '10px' }}>
              📋 اختر القالب المطلوب للطباعة المباشرة:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '10px' }}>
              {templatesList.map((tpl) => {
                const isSelected = activeTemplate === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setActiveTemplate(tpl.id)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #1d4ed8' : '1px solid var(--color-border, #cbd5e1)',
                      backgroundColor: isSelected ? 'rgba(29, 78, 216, 0.06)' : 'var(--color-surface, #ffffff)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#1d4ed8' : '#e2e8f0',
                        color: isSelected ? '#ffffff' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '13px',
                        flexShrink: 0
                      }}
                    >
                      {tpl.number}
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: isSelected ? '#1e3a8a' : 'var(--color-text-primary)', lineHeight: 1.4 }}>
                        {tpl.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Filter & Target Scope Controls */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg-container, #f8fafc)',
              border: '1px solid var(--color-border, #e2e8f0)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px'
            }}
          >
            {/* Scope Type Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                🎯 نطاق الطباعة (صف / شعبة / طالب):
              </label>
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface, #fff)',
                  color: 'var(--color-text-primary)',
                  fontWeight: '700',
                  fontSize: '13px'
                }}
              >
                <option value="section">🏫 شعبة دراسية محددة (فصل)</option>
                <option value="grade">🏛️ صف دراسي كامل (جميع الشعب)</option>
                {allowStudentScope && <option value="student">👨‍🎓 طالب محدد</option>}
              </select>
            </div>

            {/* Dynamic Target Picker based on Scope */}
            {scopeType === 'section' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                  🏫 اختر الفصل / الشعبة:
                </label>
                <SearchableSelect
                  options={sectionsList.map(c => ({ value: c, label: c }))}
                  value={targetSection}
                  onChange={(val) => setTargetSection(val)}
                  placeholder="اختر الشعبة..."
                />
              </div>
            )}

            {scopeType === 'grade' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                  🏛️ اختر الصف الدراسي:
                </label>
                <SearchableSelect
                  options={uniqueGradesList.map(g => ({ value: g, label: g }))}
                  value={targetGrade}
                  onChange={(val) => setTargetGrade(val)}
                  placeholder="اختر الصف..."
                />
              </div>
            )}

            {scopeType === 'student' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                  👨‍🎓 اختر الطالب:
                </label>
                <SearchableSelect
                  options={students.map(s => ({
                    value: s.id,
                    label: `${s.name} (${s.grade} - ${s.section})`
                  }))}
                  value={targetStudentId}
                  onChange={(val) => setTargetStudentId(Number(val))}
                  placeholder="ابحث عن اسم الطالب..."
                />
              </div>
            )}

            {/* Term Selector (for templates 2..6) */}
            {activeTemplate !== 'template_1_blank_year' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                  📅 الفصل الدراسي:
                </label>
                <select
                  value={targetTerm}
                  onChange={(e) => setTargetTerm(e.target.value)}
                  style={{
                    height: '40px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface, #fff)',
                    color: 'var(--color-text-primary)',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}
                >
                  <option value="term1">الفصل الدراسي الأول</option>
                  <option value="term2">الفصل الدراسي الثاني</option>
                  {allowYearlyTerm && <option value="yearly">النتيجة النهائية السنوية (الفصلين الأول والثاني)</option>}
                </select>
              </div>
            )}

            {/* Month Selector (specifically for Template 2) */}
            {activeTemplate === 'template_2_monthly_sheet' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                  🗓️ حدد الشهر المطلوب:
                </label>
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  style={{
                    height: '40px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface, #fff)',
                    color: 'var(--color-text-primary)',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}
                >
                  <option value="m1">الشهر الأول</option>
                  <option value="m2">الشهر الثاني</option>
                  <option value="m3">الشهر الثالث</option>
                </select>
              </div>
            )}

            {/* Subject Mode Selector (for Templates 1, 2, 3) */}
            {allowSubjectModeFilter && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                  📚 عرض المواد في الكشف:
                </label>
                <select
                  value={targetSubjectMode}
                  onChange={(e) => setTargetSubjectMode(e.target.value)}
                  style={{
                    height: '40px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface, #fff)',
                    color: 'var(--color-text-primary)',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}
                >
                  <option value="all">📊 جميع المواد أفقياً (شامل كافة المواد)</option>
                  {activeSubjectsList.map(subj => (
                    <option key={subj} value={subj}>📝 تفصيل فروع مادة: {subj}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Orientation Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                📄 اتجاه ورقة الطباعة (A4):
              </label>
              <select
                value={orientationMode}
                onChange={(e) => setOrientationMode(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface, #fff)',
                  color: 'var(--color-text-primary)',
                  fontWeight: '700',
                  fontSize: '13px'
                }}
              >
                <option value="auto">🔄 تلقائي ذكي (بالعرض للكشوفات العريضة)</option>
                <option value="landscape">↔️ بالعرض دائماً (A4 Landscape)</option>
                <option value="portrait">↕️ بالطول (A4 Portrait)</option>
              </select>
            </div>
          </div>

          {/* Step 3: Live Complete Table Preview inside Modal (with Sticky Student Name on Horizontal Scroll) */}
          <div style={{ border: '1px solid var(--color-border, #cbd5e1)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                backgroundColor: '#f1f5f9',
                borderBottom: '1px solid #cbd5e1'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '13px', color: '#1e3a8a' }}>
                <Eye size={16} />
                <span>معاينة حية ومكتملة للكشف قبل الطباعة (عمود اسم الطالب ثابت عند السحب يميناً ويساراً)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePreview(prev => !prev)}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: '1px solid #94a3b8',
                  background: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                {showLivePreview ? 'إخفاء المعاينة' : 'إظهار المعاينة'}
              </button>
            </div>

            {showLivePreview && (
              <div style={{ padding: '12px', maxHeight: '420px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
                <style>{`
                  ${previewData.sharedStyles}
                  .preview-scroll-wrapper {
                    width: 100%;
                    max-width: 100%;
                    overflow-x: auto !important;
                    -webkit-overflow-scrolling: touch;
                    padding-bottom: 6px;
                  }
                  .preview-scroll-wrapper .roster-table {
                    min-width: 860px;
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                  }
                  .preview-scroll-wrapper .roster-table.ultra-compact-table {
                    min-width: 1100px;
                  }
                  .preview-scroll-wrapper .roster-table.dense-3months-table {
                    min-width: 1320px;
                  }
                  .preview-scroll-wrapper .roster-table th.sticky-print-col-1,
                  .preview-scroll-wrapper .roster-table td.sticky-print-col-1 {
                    position: -webkit-sticky !important;
                    position: sticky !important;
                    right: 0 !important;
                    width: 34px !important;
                    min-width: 34px !important;
                    max-width: 34px !important;
                    z-index: 15 !important;
                    background-color: #f8fafc !important;
                  }
                  .preview-scroll-wrapper .roster-table th.sticky-print-col-2,
                  .preview-scroll-wrapper .roster-table td.sticky-print-col-2 {
                    position: -webkit-sticky !important;
                    position: sticky !important;
                    right: 34px !important;
                    min-width: 140px !important;
                    max-width: 175px !important;
                    z-index: 15 !important;
                    background-color: #ffffff !important;
                    box-shadow: -3px 0 6px rgba(0,0,0,0.08) !important;
                  }
                  .preview-scroll-wrapper .roster-table thead th.sticky-print-col-1,
                  .preview-scroll-wrapper .roster-table thead th.sticky-print-col-2 {
                    background-color: #e2e8f0 !important;
                    z-index: 20 !important;
                  }
                  .preview-scroll-wrapper .roster-table tr.summary-row td.sticky-print-col-1,
                  .preview-scroll-wrapper .roster-table tr.summary-row td.sticky-print-col-2 {
                    background-color: #f1f5f9 !important;
                  }
                `}</style>
                <div dangerouslySetInnerHTML={{ __html: previewData.bodyContentHtml }} />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--color-border, #e2e8f0)',
            backgroundColor: 'var(--color-surface, #ffffff)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: 'transparent',
                color: 'var(--color-text-primary)',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleExecutePrint}
              disabled={isPreparingPrint}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '14px',
                cursor: isPreparingPrint ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Printer size={18} />
              {isPreparingPrint ? 'جاري تجهيز الكشف للطباعة...' : 'طباعة مباشرة الآن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
