import { useState, useEffect, useMemo } from 'react';
import { useAllowedClasses } from '../hooks/useAllowedClasses';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import { useStudents } from '../contexts/Students/useStudents';
import { useClasses } from '../contexts/Classes/useClasses';
import { useAttendance } from '../contexts/Attendance/useAttendance';
import PrintHeader from '../components/PrintHeader';
import { SLOGAN_BASE64 } from '../assets/sloganBase64';
import { X, Calendar, BarChart3, Printer, Clock, Search } from 'lucide-react';

export default function ScannerTab() {
  const {
    lang,
    t,
    renderAvatar,
    canAction,
  } = useApp();

  const { currentUser } = useAuth();

  const {
    classes,
    availableGrades,
    availableSections,
    fetchClasses,
  } = useClasses();

  const {
    attendanceRecords,
    handleCellAttendanceChange,
    selectedAttendanceMonth,
    setSelectedAttendanceMonth,
    setAttendanceRosterDate,
    fetchAttendance,
  } = useAttendance();

  const {
    students,
    calculateStudentStats,
    setPrintStudentObject,
    fetchStudents,
  } = useStudents();

  const handlePrintStudentAttendanceReport = (student) => {
    if (!student) return;
    const stats = calculateStudentStats(student.id);
    const studentName = (lang === 'ar' ? student.name : student.nameEn) || student.name || '-';
    const gradeName = student.grade || attendanceMonthGrade || '-';
    const sectionName = student.section || attendanceMonthSection || '-';
    const studentNationalId = student.nationalId || student.idNumber || student.id || '-';
    const todayStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    const studentRecords = (attendanceRecords || [])
      .filter(r => String(r.studentId) === String(student.id) && r.date && r.date.startsWith(selectedAttendanceMonth))
      .sort((a, b) => a.date.localeCompare(b.date));

    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const rowsHtml = studentRecords.length > 0
      ? studentRecords.map((rec, idx) => {
          const dObj = new Date(rec.date + 'T00:00:00');
          const dayLabel = !isNaN(dObj.getTime()) ? arabicDays[dObj.getDay()] : '-';
          const isPresent = rec.status === 'present';
          const statusLabel = isPresent ? 'حاضر' : (rec.status === 'absent' ? 'غائب' : (rec.status || '-'));
          const statusStyle = isPresent
            ? 'color:#15803d;font-weight:800;background:#dcfce7;padding:2px 10px;border-radius:12px;display:inline-block;'
            : 'color:#b91c1c;font-weight:800;background:#fee2e2;padding:2px 10px;border-radius:12px;display:inline-block;';
          return `
            <tr>
              <td style="text-align:center;font-weight:700;">${idx + 1}</td>
              <td style="text-align:center;font-weight:700;">${dayLabel}</td>
              <td style="text-align:center;font-family:monospace;font-size:13px;" dir="ltr">${rec.date}</td>
              <td style="text-align:center;"><span style="${statusStyle}">${statusLabel}</span></td>
              <td style="text-align:center;font-family:monospace;" dir="ltr">${rec.arrivalTime && rec.arrivalTime !== '-' ? rec.arrivalTime : '—'}</td>
              <td>${rec.excuseReason || ''}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="6" style="text-align:center;padding:18px;color:#64748b;font-weight:700;">لا توجد سجلات حضور أو غياب مرصودة لهذا الطالب في الشهر المحدد</td></tr>';

    const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>تقرير حضور وغياب الطالب - ${studentName}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Cairo', 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif;
      direction: rtl;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sr-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px double #1e3a8a;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .sr-header-col {
      width: 33%;
      font-size: 12px;
      line-height: 1.6;
      font-weight: 700;
      color: #1e293b;
    }
    .sr-header-right { text-align: right; }
    .sr-header-center { text-align: center; display: flex; flex-direction: column; align-items: center; }
    .sr-header-left { text-align: left; direction: ltr; }
    .sr-logo { width: 72px; height: 72px; object-fit: contain; }
    .sr-meta {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 14px;
      margin-bottom: 12px;
      font-size: 12.5px;
      font-weight: 700;
    }
    .sr-kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .sr-kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
      background: #f8fafc;
    }
    .sr-kpi-title { font-size: 11.5px; color: #475569; font-weight: 700; margin-bottom: 4px; }
    .sr-kpi-val { font-size: 18px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    th, td { border: 1px solid #334155; padding: 6px 8px; text-align: right; vertical-align: middle; }
    th { background-color: #e2e8f0 !important; color: #0f172a; font-weight: 800; text-align: center; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    tr { page-break-inside: avoid; }
    .sr-footer {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      font-weight: 700;
      padding: 0 20px;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="sr-header">
    <div class="sr-header-col sr-header-right">
      <div>الجمهورية اليمنية</div>
      <div>وزارة التربية والتعليم</div>
      <div>رياض ومدارس أنوار العلى الدولية النموذجية</div>
    </div>
    <div class="sr-header-col sr-header-center">
      <img src="${SLOGAN_BASE64}" alt="شعار المدرسة" class="sr-logo" />
    </div>
    <div class="sr-header-col sr-header-left">
      <div>Republic of Yemen</div>
      <div>Ministry of Education</div>
      <div>Anwar Al-Ola International Model Schools</div>
    </div>
  </div>

  <div class="sr-meta">
    <div>اسم الطالب: <strong>${studentName}</strong></div>
    <div>الصف والشعبة: <strong>${gradeName} (${sectionName})</strong></div>
    <div>رقم الهوية / الأكاديمي: <strong dir="ltr">${studentNationalId}</strong></div>
    <div>الشهر: <strong dir="ltr">${selectedAttendanceMonth}</strong></div>
    <div>تاريخ الإصدار: <strong>${todayStr}</strong></div>
  </div>

  <div class="sr-kpis">
    <div class="sr-kpi-card">
      <div class="sr-kpi-title">أيام الحضور</div>
      <div class="sr-kpi-val" style="color:#15803d;">${stats.present}</div>
    </div>
    <div class="sr-kpi-card">
      <div class="sr-kpi-title">أيام الغياب</div>
      <div class="sr-kpi-val" style="color:#b91c1c;">${stats.absent}</div>
    </div>
    <div class="sr-kpi-card">
      <div class="sr-kpi-title">إجمالي الأيام المرصودة</div>
      <div class="sr-kpi-val" style="color:#1e3a8a;">${stats.total ?? stats.totalDays ?? 0}</div>
    </div>
    <div class="sr-kpi-card">
      <div class="sr-kpi-title">نسبة الانضباط</div>
      <div class="sr-kpi-val" style="color:${stats.rate >= 90 ? '#15803d' : stats.rate >= 75 ? '#d97706' : '#b91c1c'};">${stats.rate}%</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:45px;">م</th>
        <th style="width:95px;">اليوم</th>
        <th style="width:120px;">التاريخ</th>
        <th style="width:110px;">حالة الحضور</th>
        <th style="width:110px;">وقت الوصول</th>
        <th>ملاحظات / سبب الغياب</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="sr-footer">
    <div>مشرف التحضير / شؤون الطلاب: ............................</div>
    <div>اعتماد إدارة المدرسة: ............................</div>
  </div>
</body>
</html>`;

    let iframe = document.getElementById('student-attendance-print-frame');
    if (iframe) {
      document.body.removeChild(iframe);
    }
    iframe = document.createElement('iframe');
    iframe.id = 'student-attendance-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 350);
  };

  const getTodayLocalParts = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return {
      fullDate: `${yyyy}-${mm}-${dd}`,
      yearMonth: `${yyyy}-${mm}`,
      dayNum: now.getDate(),
    };
  };

  // Local navigation and filters
  const [attendanceSubTab, setAttendanceSubTab] = useState('monthlySheet');
  const [attendanceMonthGrade, setAttendanceMonthGrade] = useState('الصف الأول');
  const [attendanceMonthSection, setAttendanceMonthSection] = useState('أ');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState(() => getTodayLocalParts().fullDate);

  const { allowedClasses, allowedGrades, allowedSections } = useAllowedClasses('scanner');

  const activeClass = allowedClasses.find(c => c.grade === attendanceMonthGrade && c.section === attendanceMonthSection) || (allowedClasses.length > 0 ? allowedClasses[0] : null);

  // Auto-update Day, Month, and Year immediately upon opening the Attendance Log
  useEffect(() => {
    const today = getTodayLocalParts();
    setSelectedAttendanceDate(today.fullDate);
    setSelectedAttendanceMonth(today.yearMonth);
    if (setAttendanceRosterDate) {
      setAttendanceRosterDate(today.fullDate);
    }
    setQuickDate(today.fullDate);
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allowedClasses.length > 0) {
      const match = allowedClasses.find(c => c.grade === attendanceMonthGrade && c.section === attendanceMonthSection);
      if (!match) {
        setAttendanceMonthGrade(allowedClasses[0].grade);
        setAttendanceMonthSection(allowedClasses[0].section);
      }
    }
  }, [allowedClasses]);

  useEffect(() => {
    if (activeClass) {
      const cleanClassId = activeClass.numericId || String(activeClass.id).replace(/\D/g, '');
      fetchStudents(`?class_id=${cleanClassId}&per_page=500`);
      fetchAttendance(`?class_id=${cleanClassId}&per_page=1000`);
    } else {
      fetchStudents(`?per_page=500`);
      fetchAttendance(`?per_page=1000`);
    }
  }, [activeClass, fetchStudents, fetchAttendance]);
  
  // Quick Attendance Modal States
  const [showQuickAttendanceModal, setShowQuickAttendanceModal] = useState(false);
  const [quickGrade, setQuickGrade] = useState('الصف الأول');
  const [quickSection, setQuickSection] = useState('أ');
  const [quickStudentId, setQuickStudentId] = useState('');
  const [quickDate, setQuickDate] = useState(() => getTodayLocalParts().fullDate);
  const [quickStatus, setQuickStatus] = useState('present');

  // Auto-sync students selection for quick attendance modal when class/section changes
  useEffect(() => {
    if (showQuickAttendanceModal && students) {
      const targetClass = allowedClasses.find(c => c.grade === quickGrade && c.section === quickSection);
      const targetNumericId = targetClass ? (targetClass.numericId || String(targetClass.id).replace(/\D/g, '')) : null;
      const filtered = students.filter(s => {
        const matchesClassId = targetNumericId && s.class_id && Number(s.class_id) === Number(targetNumericId);
        const matchesGradeSec = s.grade === quickGrade && s.section === quickSection;
        return matchesClassId || matchesGradeSec;
      });
      const listToUse = filtered.length > 0 ? filtered : students;
      if (listToUse.length > 0) {
        if (!quickStudentId || !listToUse.some(s => String(s.id) === String(quickStudentId))) {
          setQuickStudentId(listToUse[0].id);
        }
      } else {
        setQuickStudentId('');
      }
    }
  }, [showQuickAttendanceModal, students, quickGrade, quickSection, allowedClasses]);

  // Check if date is locked (> 24 hours passed for non-admins / non-permitted supervisors)
  const isDate24HoursPassed = (dateStr) => {
    if (currentUser?.role === 'admin') return false;
    if (currentUser?.role === 'vice_principal' || currentUser?.role === 'supervisor') {
      if (canAction('scanner', 'update') || canAction('scanner', 'create') || currentUser?.permissions?.full_access) {
        return false;
      }
    }
    const targetEnd = new Date(`${dateStr}T23:59:59`);
    const now = new Date();
    const cutoff = new Date(targetEnd.getTime() + 24 * 60 * 60 * 1000);
    return now > cutoff;
  };

  const handleToggleDayAttendance = (studentId, dayNum) => {
    const dateStr = `${selectedAttendanceMonth}-${String(dayNum).padStart(2, '0')}`;

    if (isDate24HoursPassed(dateStr)) {
      alert(lang === 'ar' 
        ? 'عفواً، لا يمكن تحضير أو تعديل الحضور والغياب لمرور أكثر من 24 ساعة على هذا التاريخ.' 
        : 'Attendance for this date is locked (> 24 hours passed).');
      return;
    }
    
    const existingRecord = attendanceRecords.find(r => r.studentId === studentId && r.date === dateStr);
    
    let nextStatus = 'present';
    if (existingRecord) {
      if (existingRecord.status === 'present' || existingRecord.status === 'late') {
        nextStatus = 'absent'; // Click 2: absent
      } else if (existingRecord.status === 'absent') {
        nextStatus = null; // Click 3: Reset to unmarked (initial state)
      }
    }
    
    handleCellAttendanceChange(studentId, dateStr, nextStatus);
  };

  return (
    <div className="section-card">
      {/* Header Tab Switchers (no-print) */}
      <div className="section-card-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          📋 {lang === 'ar' ? 'سجل الحضور والغياب الموحد' : 'Unified Attendance Log'}
        </h3>
        <div className="segment-control">
          <button 
            type="button"
            className={`segment-btn ${attendanceSubTab === 'monthlySheet' ? 'active' : ''}`}
            onClick={() => setAttendanceSubTab('monthlySheet')}
          >
            <Calendar size={16} />
            {lang === 'ar' ? 'كشف الحضور الشهري' : 'Monthly Registry'}
          </button>
          <button 
            type="button"
            className={`segment-btn ${attendanceSubTab === 'statsSummary' ? 'active' : ''}`}
            onClick={() => setAttendanceSubTab('statsSummary')}
          >
            <BarChart3 size={16} />
            {lang === 'ar' ? 'إحصائيات الحضور والغياب' : 'Attendance Stats'}
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Monthly Attendance Registry */}
      {attendanceSubTab === 'monthlySheet' && (
        <div className="printable-area" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Force Landscape Print Orientation dynamically when this tab is active */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page {
                size: landscape;
                margin: 1cm;
              }
            }
          `}} />
          <PrintHeader 
            title="كشف حضور وغياب الطلاب الشهري"
            subtitle={lang === 'ar' 
              ? `الصف الدراسي: ${attendanceMonthGrade} | الشعبة: ${attendanceMonthSection} | التاريخ: ${selectedAttendanceDate}`
              : `Grade: ${attendanceMonthGrade} | Section: ${attendanceMonthSection} | Date: ${selectedAttendanceDate}`
            }
          />
          {/* Filters bar (no-print) */}
          <div className="students-controls no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-md)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                  {lang === 'ar' ? 'الفصل الدراسي' : 'Class'}
                </label>
                <select 
                  value={`${attendanceMonthGrade} - ${attendanceMonthSection}`} 
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    const parts = selectedVal.split(' - ');
                    if (parts.length >= 2) {
                      setAttendanceMonthGrade(parts[0]);
                      setAttendanceMonthSection(parts[1]);
                    }
                  }} 
                  className="text-field"
                  style={{ height: '36px', padding: '0 8px', fontSize: '12px', minWidth: '180px' }}
                >
                  {(allowedClasses || []).map(cls => (
                    <option key={cls.id} value={cls.name}>
                      {lang === 'ar' ? cls.name : cls.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'التاريخ (اليوم / الشهر / السنة)' : 'Date (Day / Month / Year)'}</label>
                <input 
                  type="date" 
                  value={selectedAttendanceDate} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setSelectedAttendanceDate(val);
                      setSelectedAttendanceMonth(val.substring(0, 7));
                      if (setAttendanceRosterDate) setAttendanceRosterDate(val);
                      setQuickDate(val);
                    }
                  }} 
                  className="text-field"
                  style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'الشهر والسنة' : 'Month & Year'}</label>
                <input 
                  type="month" 
                  value={selectedAttendanceMonth} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setSelectedAttendanceMonth(val);
                      const today = getTodayLocalParts();
                      const nextDate = val === today.yearMonth ? today.fullDate : `${val}-01`;
                      setSelectedAttendanceDate(nextDate);
                      if (setAttendanceRosterDate) setAttendanceRosterDate(nextDate);
                    }
                  }} 
                  className="text-field"
                  style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'البحث عن طالب' : 'Search Student'}</label>
                <div className="search-box" style={{ margin: 0, minWidth: '200px' }}>
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder={lang === 'ar' ? 'اسم الطالب...' : 'Search student...'}
                    value={attendanceSearchQuery} 
                    onChange={(e) => setAttendanceSearchQuery(e.target.value)} 
                    className="text-field"
                    style={{ height: '36px', fontSize: '12px' }}
                  />
                </div>
              </div>

            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                type="button"
                className="btn-filled"
                onClick={() => window.print()}
                style={{ minHeight: '36px', height: '36px', padding: '0 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Printer size={16} />
                {lang === 'ar' ? 'طباعة كشف الفصل' : 'Print Class Sheet'}
              </button>

              {canAction('scanner', 'create') && (
                <button 
                  type="button"
                  className="btn-accent"
                  onClick={() => {
                    const currentAllowed = allowedClasses.find(c => c.grade === attendanceMonthGrade && c.section === attendanceMonthSection) || (allowedClasses.length > 0 ? allowedClasses[0] : null);
                    const defaultGrade = currentAllowed ? currentAllowed.grade : (allowedGrades.length > 0 ? allowedGrades[0] : 'الصف الأول');
                    const defaultSec = currentAllowed ? currentAllowed.section : (allowedSections.length > 0 ? allowedSections[0] : 'أ');
                    const targetNumericId = currentAllowed ? (currentAllowed.numericId || String(currentAllowed.id).replace(/\D/g, '')) : null;
                    const initialStudents = students.filter(s => {
                      const matchesClassId = targetNumericId && s.class_id && Number(s.class_id) === Number(targetNumericId);
                      const matchesGradeSec = s.grade === defaultGrade && s.section === defaultSec;
                      return matchesClassId || matchesGradeSec;
                    });

                    setQuickGrade(defaultGrade);
                    setQuickSection(defaultSec);
                    setQuickStudentId(initialStudents.length > 0 ? initialStudents[0].id : '');
                    setQuickDate(selectedAttendanceDate || getTodayLocalParts().fullDate);
                    setQuickStatus('present');
                    setShowQuickAttendanceModal(true);
                  }}
                  style={{ minHeight: '36px', height: '36px', padding: '0 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Clock size={16} />
                  {lang === 'ar' ? 'تحضير سريع (منفرد)' : 'Quick Attendance'}
                </button>
              )}
            </div>
          </div>

          {/* Monthly Sheet Matrix Table */}
          {(() => {
            const yearNum = Number(selectedAttendanceMonth.split('-')[0]) || 2026;
            const monthNum = Number(selectedAttendanceMonth.split('-')[1]) || 6;
            const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
            const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            
            const getDayOfWeek = (day) => new Date(yearNum, monthNum - 1, day).getDay();
            const checkIsWeekend = (day) => {
              const dow = getDayOfWeek(day);
              return dow === 4 || dow === 5; // Thursday and Friday
            };
            const getDayLetter = (day) => {
              const dow = getDayOfWeek(day);
              if (lang === 'ar') {
                const arDays = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
                return arDays[dow];
              } else {
                const enDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                return enDays[dow];
              }
            };

            const filteredStudentsForAttendance = students.filter(s => {
              const numericClassId = activeClass ? (activeClass.numericId || String(activeClass.id).replace(/\D/g, '')) : null;
              const matchesClassId = numericClassId && s.class_id && (Number(s.class_id) === Number(numericClassId));
              const matchesGradeSection = (s.grade === attendanceMonthGrade && s.section === attendanceMonthSection);
              const matchesClassName = (s.grade + ' - ' + s.section) === (attendanceMonthGrade + ' - ' + attendanceMonthSection);
              
              const matchesClass = matchesClassId || matchesGradeSection || matchesClassName || !activeClass;

              const matchesSearch = !attendanceSearchQuery || 
                                    (s.name && s.name.toLowerCase().includes(attendanceSearchQuery.toLowerCase())) ||
                                    (s.nameEn && s.nameEn.toLowerCase().includes(attendanceSearchQuery.toLowerCase()));
              return matchesClass && matchesSearch;
            });

            if (students.length === 0) {
              return (
                <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px' }}>📂</span>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                      {lang === 'ar' ? 'لا يوجد طلاب مسجلين حالياً' : 'No students registered yet'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? 'يرجى تسجيل الطلاب في النظام أولاً لبدء رصد الغياب.' : 'Please register students in the system first to begin tracking attendance.'}
                    </span>
                  </div>
                </div>
              );
            }

            if (filteredStudentsForAttendance.length === 0) {
              const hasSearch = attendanceSearchQuery !== '';
              return (
                <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px' }}>{hasSearch ? '🔍' : 'ℹ️'}</span>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                      {hasSearch 
                        ? (lang === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matching search results found')
                        : (lang === 'ar' ? 'لا توجد نتائج تطابق التصفية المحددة' : 'No matching filter results found')
                      }
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {hasSearch 
                        ? (lang === 'ar' ? 'جرب البحث بكلمة مفتاحية مختلفة' : 'Try searching for a different keyword')
                        : (lang === 'ar' ? 'جرب تغيير خيارات التصفية' : 'Try changing your filter selections')
                      }
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', backgroundColor: 'var(--color-surface-alt)' }}>
                  <table className="schedule-table monthly-attendance-table" style={{ width: '100%', minWidth: '1000px', fontSize: '11px' }}>
                    <thead>
                      <tr>
                        <th className="sticky-student-name" style={{ textAlign: 'start', padding: '10px var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
                          {lang === 'ar' ? 'اسم الطالب' : 'Student Name'}
                        </th>
                        {daysArray.filter(day => !checkIsWeekend(day)).map(day => {
                          const dayDateStr = `${selectedAttendanceMonth}-${String(day).padStart(2, '0')}`;
                          const isSelectedDay = dayDateStr === selectedAttendanceDate;
                          return (
                            <th 
                              key={day} 
                              style={{ 
                                padding: '8px 2px', 
                                background: isSelectedDay ? 'rgba(30, 80, 142, 0.14)' : 'var(--color-surface)',
                                color: isSelectedDay ? 'var(--color-primary-ui)' : 'var(--color-text-primary)',
                                minWidth: '28px',
                                borderBottom: isSelectedDay ? '2px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                                borderLeft: '1px solid var(--color-border)'
                              }}
                            >
                              <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '2px', fontWeight: 'normal' }}>{getDayLetter(day)}</div>
                              <div style={{ fontWeight: isSelectedDay ? '800' : '700' }}>{day}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudentsForAttendance.map(student => (
                        <tr key={student.id}>
                          <td className="sticky-student-name" style={{ textAlign: 'start', fontWeight: 'bold', padding: '8px var(--space-md)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                            <span style={{ fontSize: '12px' }}>{lang === 'ar' ? student.name : student.nameEn}</span>
                          </td>
                          {daysArray.filter(day => !checkIsWeekend(day)).map(day => {
                            const dateStr = `${selectedAttendanceMonth}-${String(day).padStart(2, '0')}`;
                            const isSelectedDay = dateStr === selectedAttendanceDate;
                            const record = attendanceRecords.find(r => r.studentId === student.id && r.date === dateStr);
                            const isLocked = isDate24HoursPassed(dateStr);
                            
                            let statusIcon = <span style={{ color: '#cbd5e1', fontSize: '11px' }}>⚪</span>;
                            let cellTitle = lang === 'ar' ? 'غير مرصود' : 'No record';
                            
                            if (record) {
                              if (record.status === 'present' || record.status === 'late') { 
                                statusIcon = <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '14px' }}>✓</span>; 
                                cellTitle = lang === 'ar' ? 'حاضر' : 'Present'; 
                              } else if (record.status === 'absent') { 
                                statusIcon = <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>✗</span>; 
                                cellTitle = lang === 'ar' ? 'غائب' : 'Absent'; 
                              }
                            }

                            if (isLocked) {
                              cellTitle += lang === 'ar' ? ' - [مغلق: مضى أكثر من 24 ساعة]' : ' - [Locked: >24h]';
                            }

                            return (
                              <td 
                                key={day} 
                                title={`${student.name}: ${cellTitle} (${dateStr})`}
                                style={{ 
                                  padding: '6px 2px', 
                                  backgroundColor: isLocked ? 'rgba(0,0,0,0.02)' : (isSelectedDay ? 'rgba(30, 80, 142, 0.06)' : 'transparent'),
                                  opacity: isLocked ? 0.65 : 1,
                                  cursor: isLocked ? 'not-allowed' : (canAction('scanner', 'update') ? 'pointer' : 'default'),
                                  fontSize: '12px',
                                  userSelect: 'none',
                                  borderLeft: '1px solid var(--color-border)',
                                  borderBottom: '1px solid var(--color-border)',
                                  textAlign: 'center'
                                }}
                                onClick={() => canAction('scanner', 'update') && handleToggleDayAttendance(student.id, day)}
                              >
                                {statusIcon}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Print-only Footer Signatures */}
                <div className="printable-only-footer" style={{ 
                  display: 'none', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  gap: '24px', 
                  marginTop: '40px', 
                  fontSize: '12px',
                  fontWeight: '600',
                  direction: 'rtl'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div>مربي الفصل</div>
                    <div style={{ marginTop: '35px', borderTop: '1px dotted #000000', width: '80%', marginInline: 'auto', paddingTop: '4px' }}>التوقيع:</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div>مراقب الحضور والغياب</div>
                    <div style={{ marginTop: '35px', borderTop: '1px dotted #000000', width: '80%', marginInline: 'auto', paddingTop: '4px' }}>التوقيع:</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div>مدير المدرسة</div>
                    <div style={{ marginTop: '35px', borderTop: '1px dotted #000000', width: '80%', marginInline: 'auto', paddingTop: '4px' }}>التوقيع والختم:</div>
                  </div>
                </div>

                {/* Legend key indicator (no-print) */}
                <div className="no-print" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface)', fontSize: '11px', justifyContent: 'center', marginTop: '4px' }}>
                  <span><strong>{lang === 'ar' ? 'دليل الرموز:' : 'Legend:'}</strong></span>
                  <span><span style={{ color: '#16a34a', fontWeight: 'bold', marginInlineEnd: '4px', fontSize: '14px' }}>✓</span>{lang === 'ar' ? 'حاضر' : 'Present'}</span>
                  <span><span style={{ color: '#dc2626', fontWeight: 'bold', marginInlineEnd: '4px', fontSize: '14px' }}>✗</span>{lang === 'ar' ? 'غائب' : 'Absent'}</span>
                  <span><span style={{ color: '#cbd5e1', marginInlineEnd: '4px', fontSize: '11px' }}>⚪</span>{lang === 'ar' ? 'غير مرصود (انقر للتعديل)' : 'Unrecorded (click to set)'}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Sub-tab 2: Class Attendance Statistics */}
      {attendanceSubTab === 'statsSummary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Filters bar */}
          <div className="students-controls no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', padding: 'var(--space-md)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {lang === 'ar' ? 'الفصل الدراسي' : 'Class'}
              </label>
              <select 
                value={`${attendanceMonthGrade} - ${attendanceMonthSection}`} 
                onChange={(e) => {
                  const selectedVal = e.target.value;
                  const parts = selectedVal.split(' - ');
                  if (parts.length >= 2) {
                    setAttendanceMonthGrade(parts[0]);
                    setAttendanceMonthSection(parts[1]);
                  }
                }} 
                className="text-field"
                style={{ height: '36px', padding: '0 8px', fontSize: '12px', minWidth: '180px' }}
              >
                {(allowedClasses || []).map(cls => (
                  <option key={cls.id} value={cls.name}>
                    {lang === 'ar' ? cls.name : cls.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'التاريخ (اليوم / الشهر / السنة)' : 'Date (Day / Month / Year)'}</label>
              <input 
                type="date" 
                value={selectedAttendanceDate} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setSelectedAttendanceDate(val);
                    setSelectedAttendanceMonth(val.substring(0, 7));
                    if (setAttendanceRosterDate) setAttendanceRosterDate(val);
                  }
                }} 
                className="text-field"
                style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'الشهر والسنة' : 'Month & Year'}</label>
              <input 
                type="month" 
                value={selectedAttendanceMonth} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setSelectedAttendanceMonth(val);
                    const today = getTodayLocalParts();
                    const nextDate = val === today.yearMonth ? today.fullDate : `${val}-01`;
                    setSelectedAttendanceDate(nextDate);
                  }
                }} 
                className="text-field"
                style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Calculations & Summary Cards */}
          {(() => {
            const filteredStudentsForAttendance = students.filter(s => s.grade === attendanceMonthGrade && s.section === attendanceMonthSection);
            
            const classRecords = attendanceRecords.filter(r => {
              const studentObj = students.find(s => String(s.id) === String(r.studentId));
              return studentObj && studentObj.grade === attendanceMonthGrade && studentObj.section === attendanceMonthSection && r.date && r.date.startsWith(selectedAttendanceMonth);
            });
            
            const classTotal = classRecords.length;
            const classPresent = classRecords.filter(r => r.status === 'present' || r.status === 'late').length;
            const classAbsent = classRecords.filter(r => r.status === 'absent').length;
            
            const classAttendanceRate = (classPresent + classAbsent) > 0 ? Math.round((classPresent / (classPresent + classAbsent)) * 100) : 0;
            const classAbsenceRate = (classPresent + classAbsent) > 0 ? Math.round((classAbsent / (classPresent + classAbsent)) * 100) : 0;

            if (filteredStudentsForAttendance.length === 0) {
              return (
                <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px' }}>📂</span>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                      {lang === 'ar' ? 'لا يوجد طلاب بهذه الشعبة' : 'No students in this class section'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? 'يرجى تسجيل طلاب وتعيينهم لهذه الشعبة في صفحة الطلاب.' : 'Please register students and assign them to this class section.'}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <div className="card-kpi" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'متوسط نسبة الحضور للشعبة' : 'Average Attendance Rate'}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)', marginTop: '4px' }}>🟢 {classAttendanceRate}%</div>
                  </div>
                  <div className="card-kpi" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'متوسط نسبة الغياب للشعبة' : 'Average Absence Rate'}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-error)', marginTop: '4px' }}>🔴 {classAbsenceRate}%</div>
                  </div>
                  <div className="card-kpi" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'إجمالي أيام الحضور للشعبة' : 'Total Present Days'}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)', marginTop: '4px' }}>🟢 {classPresent} {lang === 'ar' ? 'يوم' : 'Days'}</div>
                  </div>
                  <div className="card-kpi" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'إجمالي أيام الغياب للشعبة' : 'Total Absent Days'}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-error)', marginTop: '4px' }}>🔴 {classAbsent} {lang === 'ar' ? 'يوم' : 'Days'}</div>
                  </div>
                  <div className="card-kpi" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'الطلاب المقيدين بالشعبة' : 'Registered Students'}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary-ui)', marginTop: '4px' }}>👨‍🎓 {filteredStudentsForAttendance.length}</div>
                  </div>
                </div>

                {/* Summary statistics list */}
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th className="sticky-col-name">{t.studentName}</th>
                        <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'أيام الحضور (🟢)' : 'Days Present (🟢)'}</th>
                        <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'أيام الغياب (🔴)' : 'Days Absent (🔴)'}</th>
                        <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'نسبة الانضباط' : 'Discipline Rate'}</th>
                        <th className="no-print" style={{ textAlign: 'center' }}>{t.action}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudentsForAttendance.map(student => {
                        const stats = calculateStudentStats(student.id);
                        return (
                          <tr key={student.id}>
                            <td className="sticky-col-name" style={{ fontWeight: '600' }}>
                              {renderAvatar(student.photo, "👨‍🎓")}
                              <span>{lang === 'ar' ? student.name : student.nameEn}</span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>{stats.present}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-error)' }}>{stats.absent}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge-status ${stats.rate >= 90 ? 'checked-in' : stats.rate >= 75 ? 'on-bus' : 'absent'}`}>
                                {stats.rate}%
                              </span>
                            </td>
                            <td className="no-print" style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn-elevated"
                                style={{ fontSize: '11px', height: '28px', padding: '0 8px' }}
                                onClick={() => handlePrintStudentAttendanceReport(student)}
                              >
                                🖨️ {lang === 'ar' ? 'طباعة التقرير الفردي' : 'Print Report'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}
      {/* QUICK ATTENDANCE POPUP MODAL */}
      {showQuickAttendanceModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <header className="modal-header">
              <h3 className="modal-title">⏱️ {lang === 'ar' ? 'تسجيل حضور سريع' : 'Quick Attendance Entry'}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowQuickAttendanceModal(false)}
                aria-label="Close Quick Attendance Dialog"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!quickStudentId) return;
              handleCellAttendanceChange(Number(quickStudentId), quickDate, quickStatus);
              setShowQuickAttendanceModal(false);
            }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    {lang === 'ar' ? 'الفصل الدراسي والشعبة المصرحة' : 'Allowed Class & Section'}
                  </label>
                  <select 
                    className="text-field"
                    value={`${quickGrade} - ${quickSection}`} 
                    onChange={(e) => {
                      const parts = e.target.value.split(' - ');
                      if (parts.length >= 2) {
                        const newG = parts[0];
                        const newS = parts[1];
                        setQuickGrade(newG);
                        setQuickSection(newS);
                        setAttendanceMonthGrade(newG);
                        setAttendanceMonthSection(newS);
                      }
                    }}
                    style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
                  >
                    {(allowedClasses || []).map((c) => (
                      <option key={c.id} value={`${c.grade} - ${c.section}`}>
                        {lang === 'ar' ? `${c.grade} - شعبة (${c.section})` : `${c.grade} - Section (${c.section})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</label>
                  <select 
                    className="text-field"
                    value={quickStudentId} 
                    onChange={(e) => setQuickStudentId(e.target.value)}
                    required
                    style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
                  >
                    <option value="">{lang === 'ar' ? '-- اختر الطالب --' : '-- Select Student --'}</option>
                    {(() => {
                      const targetClass = allowedClasses.find(c => c.grade === quickGrade && c.section === quickSection);
                      const targetNumericId = targetClass ? (targetClass.numericId || String(targetClass.id).replace(/\D/g, '')) : null;
                      return students.filter(s => {
                        const matchesClassId = targetNumericId && s.class_id && Number(s.class_id) === Number(targetNumericId);
                        const matchesGradeSec = s.grade === quickGrade && s.section === quickSection;
                        return matchesClassId || matchesGradeSec;
                      }).map(student => (
                        <option key={student.id} value={student.id}>{lang === 'ar' ? student.name : student.nameEn}</option>
                      ));
                    })()}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'تاريخ التحضير' : 'Attendance Date'}</label>
                  <input 
                    type="date" 
                    className="text-field"
                    value={quickDate} 
                    onChange={(e) => setQuickDate(e.target.value)}
                    required
                    style={{ height: '36px', padding: '0 12px', fontSize: '12px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'الحالة' : 'Status'}</label>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input 
                        type="radio" 
                        name="quickStatus" 
                        value="present" 
                        checked={quickStatus === 'present'} 
                        onChange={() => setQuickStatus('present')} 
                      />
                      <span>🟢 {lang === 'ar' ? 'حاضر' : 'Present'}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input 
                        type="radio" 
                        name="quickStatus" 
                        value="absent" 
                        checked={quickStatus === 'absent'} 
                        onChange={() => setQuickStatus('absent')} 
                      />
                      <span>🔴 {lang === 'ar' ? 'غائب' : 'Absent'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <footer className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn-elevated"
                  onClick={() => setShowQuickAttendanceModal(false)}
                  style={{ height: '38px', fontSize: '12px' }}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="btn-filled"
                  style={{ height: '38px', fontSize: '12px' }}
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
