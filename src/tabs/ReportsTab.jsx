import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useStudents } from '../contexts/Students/useStudents';
import { useAttendance } from '../contexts/Attendance/useAttendance';

export default function ReportsTab() {
  const { lang, t, grades, assignments, fetchControlGrades, fetchAssignments } = useApp();
  const { attendanceRecords, fetchAttendance } = useAttendance();
  const { students, fetchStudents } = useStudents();

  useEffect(() => {
    fetchControlGrades();
    fetchAssignments();
    fetchAttendance();
    fetchStudents();
  }, [fetchControlGrades, fetchAssignments, fetchAttendance, fetchStudents]);

  // 1. Attendance Rates
  const totalStudents = students.length;
  const presentToday = students.filter(s => s.status === 'present').length;
  const lateToday = students.filter(s => s.status === 'late').length;

  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 100;
  const latenessRate = totalStudents > 0 ? Math.round((lateToday / totalStudents) * 100) : 0;

  // 2. Homework Statistics
  let totalSubmissions = 0;
  let completedCount = 0;
  let delayedCount = 0;
  let unsubmittedCount = 0;

  assignments.forEach(ass => {
    if (ass.submissions) {
      ass.submissions.forEach(sub => {
        totalSubmissions++;
        if (sub.status === 'submitted') {
          completedCount++;
        } else if (sub.status === 'submittedLate') {
          delayedCount++;
        } else {
          unsubmittedCount++;
        }
      });
    }
  });

  const completedPct = totalSubmissions > 0 ? Math.round((completedCount / totalSubmissions) * 100) : 80;
  const delayedPct = totalSubmissions > 0 ? Math.round((delayedCount / totalSubmissions) * 100) : 12;
  const unsubmittedPct = totalSubmissions > 0 ? Math.round((unsubmittedCount / totalSubmissions) * 100) : 8;

  // 3. Dynamic Alerts
  const studentAbsenceCounts = {};
  attendanceRecords.forEach(rec => {
    if (rec.status === 'absent') {
      studentAbsenceCounts[rec.studentId] = (studentAbsenceCounts[rec.studentId] || 0) + 1;
    }
  });

  const highAbsenceAlerts = [];
  Object.keys(studentAbsenceCounts).forEach(sId => {
    const count = studentAbsenceCounts[sId];
    if (count >= 3) {
      const student = students.find(s => String(s.id) === String(sId));
      if (student) {
        highAbsenceAlerts.push({
          id: student.id,
          name: student.name,
          nameEn: student.nameEn,
          count: count
        });
      }
    }
  });

  const lowPerformanceAlerts = [];
  grades.forEach(g => {
    const subjectsCount = [g.math, g.science, g.arabic, g.english].filter(val => val !== null).length;
    if (subjectsCount > 0) {
      const totalScore = (g.math || 0) + (g.science || 0) + (g.arabic || 0) + (g.english || 0);
      const avg = totalScore / subjectsCount;
      if (avg < 60) {
        const student = students.find(s => String(s.id) === String(g.studentId));
        lowPerformanceAlerts.push({
          id: g.studentId,
          name: g.name || (student ? student.name : 'غير معروف'),
          nameEn: student ? student.nameEn : '',
          average: Math.round(avg)
        });
      }
    }
  });

  return (
    <div className="section-card">
      <h3 className="headline-small" style={{ fontSize: '18px', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-sm)' }}>
        {t.reportsTitle}
      </h3>

      <div className="reports-kpi-grid">
        
        {/* Attendance rate progress display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="title-medium" style={{ color: 'var(--color-primary-ui)' }}>{t.attendanceRate}</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="body-medium" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{lang === 'ar' ? 'نسبة حضور اليوم' : 'Daily Attendance Rate'}</span>
              <span style={{ fontWeight: 'bold' }}>{attendanceRate}%</span>
            </div>
            <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${attendanceRate}%`, height: '100%', background: 'var(--color-success)' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="body-medium" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{lang === 'ar' ? 'نسبة التأخير اليوم' : 'Daily Lateness Rate'}</span>
              <span style={{ fontWeight: 'bold' }}>{latenessRate}%</span>
            </div>
            <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${latenessRate}%`, height: '100%', background: 'var(--color-warning)' }}></div>
            </div>
          </div>
        </div>

        {/* Homework statistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="title-medium" style={{ color: 'var(--color-primary-ui)' }}>{t.homeworkCompletionRate}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>🟢 {t.homeworkCompleted}</span>
              <span style={{ fontWeight: 'bold' }}>{completedPct}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>🟡 {t.homeworkDelayed}</span>
              <span style={{ fontWeight: 'bold' }}>{delayedPct}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>🔴 {t.homeworkUnsubmitted}</span>
              <span style={{ fontWeight: 'bold' }}>{unsubmittedPct}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Automatic absence and grades warning list */}
      <div style={{ marginTop: 'var(--space-md)' }}>
        <h4 className="title-large" style={{ marginBottom: 'var(--space-md)' }}>
          ⚠️ {t.absenceAlertTitle}
        </h4>

        <div className="reports-alert-list">
          {highAbsenceAlerts.length === 0 && lowPerformanceAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-md)' }}>
              {lang === 'ar' ? 'لا توجد تنبيهات غياب أو ضعف أداء حالياً.' : 'No active absence or low performance alerts.'}
            </div>
          ) : (
            <>
              {/* High Absence warning */}
              {highAbsenceAlerts.map(alert => (
                <div key={`absence-${alert.id}`} className="reports-alert-card">
                  <div className="reports-alert-info">
                    <span className="reports-alert-title">
                      {lang === 'ar' ? alert.name : (alert.nameEn || alert.name)}
                    </span>
                    <span className="reports-alert-desc">
                      {t.highAbsenceDesc}
                    </span>
                  </div>
                  <span className="reports-alert-badge">
                    {t.absenceDaysCount.replace('{count}', alert.count)}
                  </span>
                </div>
              ))}

              {/* Low Performance warning */}
              {lowPerformanceAlerts.map(alert => (
                <div key={`perf-${alert.id}`} className="reports-alert-card warning">
                  <div className="reports-alert-info">
                    <span className="reports-alert-title">
                      {lang === 'ar' ? alert.name : (alert.nameEn || alert.name)}
                    </span>
                    <span className="reports-alert-desc">
                      {t.lowPerformanceDesc}
                    </span>
                  </div>
                  <span className="reports-alert-badge">
                    {t.performanceAverage.replace('{average}', alert.average)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
