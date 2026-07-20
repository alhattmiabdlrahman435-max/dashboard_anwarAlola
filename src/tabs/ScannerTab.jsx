import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useStudents } from '../contexts/Students/useStudents';
import { useClasses } from '../contexts/Classes/useClasses';
import { useAttendance } from '../contexts/Attendance/useAttendance';
import PrintHeader from '../components/PrintHeader';
import { X, Calendar, BarChart3, Printer, Clock, Search } from 'lucide-react';

export default function ScannerTab() {
  const {
    lang,
    t,
    renderAvatar,
    canAction,
  } = useApp();

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
    fetchAttendance,
  } = useAttendance();

  const {
    students,
    calculateStudentStats,
    setPrintStudentObject,
    fetchStudents,
  } = useStudents();
  // Local navigation and filters
  const [attendanceSubTab, setAttendanceSubTab] = useState('monthlySheet');
  const [attendanceMonthGrade, setAttendanceMonthGrade] = useState('الصف الأول');
  const [attendanceMonthSection, setAttendanceMonthSection] = useState('أ');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');

  const activeClass = classes.find(c => c.grade === attendanceMonthGrade && c.section === attendanceMonthSection);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (activeClass) {
      fetchStudents(`?class_id=${activeClass.id}&per_page=100`);
      fetchAttendance(`?class_id=${activeClass.id}&per_page=100`);
    }
  }, [activeClass, fetchStudents, fetchAttendance]);
  
  // Quick Attendance Modal States
  const [showQuickAttendanceModal, setShowQuickAttendanceModal] = useState(false);
  const [quickGrade, setQuickGrade] = useState('الصف الأول');
  const [quickSection, setQuickSection] = useState('أ');
  const [quickStudentId, setQuickStudentId] = useState('');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().substring(0, 10));
  const [quickStatus, setQuickStatus] = useState('present');

  const handleToggleDayAttendance = (studentId, dayNum) => {
    const dateStr = `${selectedAttendanceMonth}-${String(dayNum).padStart(2, '0')}`;
    const existingRecord = attendanceRecords.find(r => r.studentId === studentId && r.date === dateStr);
    
    let nextStatus = 'present';
    if (existingRecord) {
      if (existingRecord.status === 'present') nextStatus = 'absent';
      else if (existingRecord.status === 'absent') nextStatus = null; // Clear status
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
              ? `الصف الدراسي: ${attendanceMonthGrade} | الشعبة: ${attendanceMonthSection} | الشهر: ${selectedAttendanceMonth}`
              : `Grade: ${attendanceMonthGrade} | Section: ${attendanceMonthSection} | Month: ${selectedAttendanceMonth}`
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
                  {(classes || []).map(cls => (
                    <option key={cls.id} value={cls.name}>
                      {lang === 'ar' ? cls.name : cls.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'الشهر المالي' : 'Month'}</label>
                <input 
                  type="month" 
                  value={selectedAttendanceMonth} 
                  onChange={(e) => setSelectedAttendanceMonth(e.target.value)} 
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
                    const initialStudents = students.filter(s => s.grade === attendanceMonthGrade && s.section === attendanceMonthSection);
                    setQuickGrade(attendanceMonthGrade);
                    setQuickSection(attendanceMonthSection);
                    setQuickStudentId(initialStudents.length > 0 ? initialStudents[0].id : '');
                    setQuickDate(new Date().toISOString().substring(0, 10));
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
              const matchesGrade = s.grade === attendanceMonthGrade;
              const matchesSection = s.section === attendanceMonthSection;
              const matchesSearch = s.name.toLowerCase().includes(attendanceSearchQuery.toLowerCase()) ||
                                    s.nameEn.toLowerCase().includes(attendanceSearchQuery.toLowerCase());
              return matchesGrade && matchesSection && matchesSearch;
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
                <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', backgroundColor: 'var(--color-surface-alt)' }}>
                  <table className="schedule-table monthly-attendance-table" style={{ width: '100%', minWidth: '1000px', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ position: 'sticky', left: 0, zIndex: 10, background: 'var(--color-surface)', textAlign: 'start', minWidth: '160px', padding: '10px var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
                          {lang === 'ar' ? 'اسم الطالب' : 'Student Name'}
                        </th>
                        {daysArray.filter(day => !checkIsWeekend(day)).map(day => {
                          return (
                            <th 
                              key={day} 
                              style={{ 
                                padding: '8px 2px', 
                                background: 'var(--color-surface)',
                                color: 'var(--color-text-primary)',
                                minWidth: '26px',
                                borderBottom: '1px solid var(--color-border)',
                                borderLeft: '1px solid var(--color-border)'
                              }}
                            >
                              <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '2px', fontWeight: 'normal' }}>{getDayLetter(day)}</div>
                              <div>{day}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudentsForAttendance.map(student => (
                        <tr key={student.id}>
                          <td style={{ position: 'sticky', left: 0, zIndex: 10, background: 'var(--color-surface-alt)', textAlign: 'start', fontWeight: 'bold', padding: '8px var(--space-md)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                            <span style={{ fontSize: '12px' }}>{lang === 'ar' ? student.name : student.nameEn}</span>
                          </td>
                          {daysArray.filter(day => !checkIsWeekend(day)).map(day => {
                            const dateStr = `${selectedAttendanceMonth}-${String(day).padStart(2, '0')}`;
                            const record = attendanceRecords.find(r => r.studentId === student.id && r.date === dateStr);
                            
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

                            return (
                              <td 
                                key={day} 
                                title={`${student.name}: ${cellTitle} (${dateStr})`}
                                style={{ 
                                  padding: '6px 2px', 
                                  backgroundColor: 'transparent',
                                  cursor: canAction('scanner', 'update') ? 'pointer' : 'default',
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
                {(classes || []).map(cls => (
                  <option key={cls.id} value={cls.name}>
                    {lang === 'ar' ? cls.name : cls.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'ar' ? 'الشهر المالي' : 'Month'}</label>
              <input 
                type="month" 
                value={selectedAttendanceMonth} 
                onChange={(e) => setSelectedAttendanceMonth(e.target.value)} 
                className="text-field"
                style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Calculations & Summary Cards */}
          {(() => {
            const filteredStudentsForAttendance = students.filter(s => s.grade === attendanceMonthGrade && s.section === attendanceMonthSection);
            
            const classRecords = attendanceRecords.filter(r => {
              const studentObj = students.find(s => s.id === r.studentId);
              return studentObj && studentObj.grade === attendanceMonthGrade && studentObj.section === attendanceMonthSection && r.date.startsWith(selectedAttendanceMonth);
            });
            
            const classTotal = classRecords.length;
            const classPresent = classRecords.filter(r => r.status === 'present').length;
            const classAbsent = classRecords.filter(r => r.status === 'absent').length;
            
            const classAttendanceRate = classTotal > 0 ? Math.round((classPresent / classTotal) * 100) : 100;

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="card-kpi" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'متوسط نسبة الحضور للشعبة' : 'Average Attendance Rate'}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)', marginTop: '4px' }}>🟢 {classAttendanceRate}%</div>
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
                        <th>{t.studentName}</th>
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
                            <td style={{ fontWeight: '600' }}>
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
                                onClick={() => setPrintStudentObject(student)}
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
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.formGrade}</label>
                    <select 
                      className="text-field"
                      value={quickGrade} 
                      onChange={(e) => {
                        const newGrade = e.target.value;
                        setQuickGrade(newGrade);
                        const filtered = students.filter(s => s.grade === newGrade && s.section === quickSection);
                        setQuickStudentId(filtered.length > 0 ? filtered[0].id : '');
                      }}
                      style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
                    >
                      {availableGrades.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.formSection}</label>
                    <select 
                      className="text-field"
                      value={quickSection} 
                      onChange={(e) => {
                        const newSec = e.target.value;
                        setQuickSection(newSec);
                        const filtered = students.filter(s => s.grade === quickGrade && s.section === newSec);
                        setQuickStudentId(filtered.length > 0 ? filtered[0].id : '');
                      }}
                      style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
                    >
                      {availableSections.map(s => {
                        const secMap = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E', 'و': 'F', 'ز': 'G' };
                        return (
                          <option key={s} value={s}>{lang === 'ar' ? s : (secMap[s] || s)}</option>
                        );
                      })}
                    </select>
                  </div>
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
                    {students.filter(s => s.grade === quickGrade && s.section === quickSection).map(student => (
                      <option key={student.id} value={student.id}>{lang === 'ar' ? student.name : student.nameEn}</option>
                    ))}
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
