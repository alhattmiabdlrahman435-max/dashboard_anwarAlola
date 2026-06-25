import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PrintHeader from '../components/PrintHeader';

export default function ScannerTab() {
  const {
    lang,
    t,
    students,
    attendanceRecords,
    handleCellAttendanceChange,
    calculateStudentStats,
    renderAvatar,
    setPrintStudentObject,
    availableGrades,
    availableSections,
    selectedAttendanceMonth,
    setSelectedAttendanceMonth
  } = useApp();

  // Local navigation and filters
  const [attendanceSubTab, setAttendanceSubTab] = useState('monthlySheet');
  const [attendanceMonthGrade, setAttendanceMonthGrade] = useState('الصف الأول');
  const [attendanceMonthSection, setAttendanceMonthSection] = useState('أ');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');

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
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--color-surface)', padding: '4px', borderRadius: 'var(--radius-button)', border: '1px solid var(--color-border)' }}>
          <button 
            type="button"
            className={`chip ${attendanceSubTab === 'monthlySheet' ? 'selected' : ''}`}
            onClick={() => setAttendanceSubTab('monthlySheet')}
            style={{ margin: 0, padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
          >
            📅 {lang === 'ar' ? 'كشف الحضور الشهري' : 'Monthly Registry'}
          </button>
          <button 
            type="button"
            className={`chip ${attendanceSubTab === 'statsSummary' ? 'selected' : ''}`}
            onClick={() => setAttendanceSubTab('statsSummary')}
            style={{ margin: 0, padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
          >
            📊 {lang === 'ar' ? 'إحصائيات الحضور والغياب' : 'Attendance Stats'}
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Monthly Attendance Registry */}
      {attendanceSubTab === 'monthlySheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
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
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.formGrade}</label>
                <select 
                  value={attendanceMonthGrade} 
                  onChange={(e) => setAttendanceMonthGrade(e.target.value)} 
                  className="text-field"
                  style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
                >
                  {availableGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.formSection}</label>
                <select 
                  value={attendanceMonthSection} 
                  onChange={(e) => setAttendanceMonthSection(e.target.value)} 
                  className="text-field"
                  style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
                >
                  {availableSections.map(s => (
                    <option key={s} value={s}>{s}</option>
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
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.searchPlaceholder}</label>
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  value={attendanceSearchQuery} 
                  onChange={(e) => setAttendanceSearchQuery(e.target.value)} 
                  className="text-field"
                  style={{ height: '36px', padding: '0 12px', fontSize: '12px', width: '160px' }}
                />
              </div>

            </div>

            <button 
              type="button"
              className="btn-filled"
              onClick={() => window.print()}
              style={{ height: '36px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              🖨️ {lang === 'ar' ? 'طباعة كشف الفصل' : 'Print Class Sheet'}
            </button>
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

            if (filteredStudentsForAttendance.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)' }}>
                  🔍 {lang === 'ar' ? 'لا يوجد طلاب يطابقون خيارات البحث والتصفية' : 'No students matching filters'}
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
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  userSelect: 'none',
                                  borderLeft: '1px solid var(--color-border)',
                                  borderBottom: '1px solid var(--color-border)',
                                  textAlign: 'center'
                                }}
                                onClick={() => handleToggleDayAttendance(student.id, day)}
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
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.formGrade}</label>
              <select 
                value={attendanceMonthGrade} 
                onChange={(e) => setAttendanceMonthGrade(e.target.value)} 
                className="text-field"
                style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
              >
                {availableGrades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.formSection}</label>
              <select 
                value={attendanceMonthSection} 
                onChange={(e) => setAttendanceMonthSection(e.target.value)} 
                className="text-field"
                style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
              >
                {availableSections.map(s => (
                  <option key={s} value={s}>{s}</option>
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
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)' }}>
                  🔍 {lang === 'ar' ? 'لا يوجد طلاب بهذه الشعبة' : 'No students in this class section'}
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
    </div>
  );
}
