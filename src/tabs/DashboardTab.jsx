import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import { useStudents } from '../contexts/Students/useStudents';
import { useTeachers } from '../contexts/Teachers/useTeachers';
import { useFinance } from '../contexts/Finance/useFinance';
import { useReports } from '../contexts/Reports/useReports';
import { Users, User, ClipboardCheck, DollarSign } from 'lucide-react';

export default function DashboardTab() {
  const {
    lang,
    grades,
    fetchControlGrades,
  } = useApp();
  const { dashboardStats, fetchDashboardStats } = useReports();
  const { tuitionFees, fetchFinanceData } = useFinance();
  const { students, fetchStudents } = useStudents();
  const { teachers } = useTeachers();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
    fetchStudents();
    fetchFinanceData();
    fetchControlGrades();
  }, [fetchDashboardStats, fetchStudents, fetchFinanceData, fetchControlGrades]);

  // Calculate school aggregates dynamically or use API stats
  const totalStudents = dashboardStats ? dashboardStats.total_students : students.length;
  const activeTeachers = dashboardStats ? dashboardStats.total_teachers : teachers.length;

  const presentCount = dashboardStats ? dashboardStats.present_today : students.filter(s => s.status === 'present').length;
  const dynamicTotalStudents = students.length;
  const attendanceRate = dashboardStats 
    ? (dashboardStats.total_students > 0 ? Math.round((dashboardStats.present_today / dashboardStats.total_students) * 100) : 100)
    : (dynamicTotalStudents > 0 ? Math.round((students.filter(s => s.status === 'present').length / dynamicTotalStudents) * 100) : 100);

  const totalTuitionRequired = students.reduce((sum, s) => sum + (tuitionFees.baseFees[s.grade] || 0), 0);
  const totalTuitionPaid = tuitionFees.payments.reduce((sum, p) => sum + p.amount, 0);
  const collectionRate = totalTuitionRequired > 0 ? Math.round((totalTuitionPaid / totalTuitionRequired) * 100) : 0;

  const mathAvg = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.math, 0) / grades.length) : 0;
  const scienceAvg = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.science, 0) / grades.length) : 0;
  const arabicAvg = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.arabic, 0) / grades.length) : 0;
  const englishAvg = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.english, 0) / grades.length) : 0;

  const studentAverages = grades.map(g => {
    const avg = Math.round((g.math + g.science + g.arabic + g.english) / 4);
    return { ...g, average: avg };
  }).sort((a, b) => b.average - a.average);

  return (
    <>
      {/* Stat Metric Cards */}
      <div className="stats-grid no-print animate-slide-up">
        <div className="stat-card glass-panel" style={{ boxShadow: '0 8px 30px rgba(30, 80, 142, 0.06)' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(30, 80, 142, 0.1)', color: 'var(--color-primary-ui)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">{lang === 'ar' ? 'إجمالي الطلاب المسجلين' : 'Total Enrolled Students'}</div>
          </div>
          <div className="sparkline-wrapper">
            <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkline-grad-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary-ui)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-primary-ui)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 25 Q 20 10, 40 18 T 80 5 T 100 12 L 100 30 L 0 30 Z" fill="url(#sparkline-grad-1)" />
              <path d="M 0 25 Q 20 10, 40 18 T 80 5 T 100 12" fill="none" stroke="var(--color-primary-ui)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ boxShadow: '0 8px 30px rgba(16, 185, 129, 0.06)' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
            <User size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{activeTeachers}</div>
            <div className="stat-label">{lang === 'ar' ? 'أعضاء هيئة التدريس' : 'Active Teachers'}</div>
          </div>
          <div className="sparkline-wrapper">
            <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkline-grad-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 15 Q 30 25, 50 10 T 80 18 T 100 5 L 100 30 L 0 30 Z" fill="url(#sparkline-grad-2)" />
              <path d="M 0 15 Q 30 25, 50 10 T 80 18 T 100 5" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ boxShadow: '0 8px 30px rgba(245, 158, 11, 0.06)' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
            <ClipboardCheck size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{attendanceRate}%</div>
            <div className="stat-label">{lang === 'ar' ? 'نسبة حضور اليوم' : "Today's Attendance Rate"}</div>
          </div>
          <div className="sparkline-wrapper">
            <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkline-grad-3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-warning)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-warning)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 20 Q 25 15, 50 25 T 75 10 T 100 8 L 100 30 L 0 30 Z" fill="url(#sparkline-grad-3)" />
              <path d="M 0 20 Q 25 15, 50 25 T 75 10 T 100 8" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ boxShadow: '0 8px 30px rgba(239, 68, 68, 0.06)' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{collectionRate}%</div>
            <div className="stat-label">{lang === 'ar' ? 'تحصيل الرسوم الدراسية' : 'Tuition Fees Collection'}</div>
          </div>
          <div className="sparkline-wrapper">
            <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkline-grad-4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-error)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-error)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 28 Q 20 22, 40 15 T 75 8 T 100 20 L 100 30 L 0 30 Z" fill="url(#sparkline-grad-4)" />
              <path d="M 0 28 Q 20 22, 40 15 T 75 8 T 100 20" fill="none" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-main-grid">
        {currentUser?.role === 'admin' || currentUser?.role === 'supervisor' ? (
          <>
            {/* Left Side: Important School Statistics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {/* Attendance Statistics card */}
              <div className="section-card glass-panel">
                <div className="section-card-header">
                  <h2 className="section-card-title headline-small" style={{ fontSize: '16px', fontWeight: '800' }}>
                    📊 {lang === 'ar' ? 'تحليلات الحضور اليومي والغياب' : 'Daily Attendance Analytics'}
                  </h2>
                </div>
                
                {/* Radial Donut Chart instead of progress bar */}
                <div className="donut-chart-container">
                  <div className="donut-graphic">
                    <svg width="120" height="120" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        fill="none" 
                        stroke="var(--color-success)" 
                        strokeWidth="8" 
                        strokeDasharray={2 * Math.PI * 42} 
                        strokeDashoffset={2 * Math.PI * 42 * (1 - attendanceRate / 100)} 
                        strokeLinecap="round" 
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                      />
                    </svg>
                    <div className="donut-text">
                      <div className="donut-percentage">{attendanceRate}%</div>
                      <div className="donut-label">{lang === 'ar' ? 'نسبة الحضور' : 'Attendance'}</div>
                    </div>
                  </div>
                  <div className="attendance-legend">
                    <div className="attendance-legend-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="legend-dot" style={{ backgroundColor: 'var(--color-success)' }}></span>
                        <span>{lang === 'ar' ? 'الطلاب الحاضرين' : 'Present'}</span>
                      </div>
                      <span style={{ color: 'var(--color-success)' }}>{presentCount}</span>
                    </div>
                    <div className="attendance-legend-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="legend-dot" style={{ backgroundColor: 'var(--color-error)' }}></span>
                        <span>{lang === 'ar' ? 'الطلاب الغائبين' : 'Absent'}</span>
                      </div>
                      <span style={{ color: 'var(--color-error)' }}>{totalStudents - presentCount}</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Trend sparkline */}
                <div className="attendance-history-card">
                  <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', color: 'var(--color-text)' }}>
                    📈 {lang === 'ar' ? 'معدل الحضور الأسبوعي (5 أيام الماضية)' : 'Weekly Attendance Trend (Last 5 Days)'}
                  </h4>
                  <div style={{ height: '90px', width: '100%', position: 'relative' }}>
                    <svg viewBox="0 0 400 100" width="100%" height="100%" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="20" x2="400" y2="20" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                      <line x1="0" y1="50" x2="400" y2="50" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                      <path d="M 0 90 Q 50 15, 100 25 T 200 15 T 300 45 T 400 20 L 400 100 L 0 100 Z" fill="url(#area-grad)" />
                      <path d="M 0 90 Q 50 15, 100 25 T 200 15 T 300 45 T 400 20" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="100" cy="25" r="4.5" fill="var(--color-success)" stroke="#fff" strokeWidth="1.5" />
                      <circle cx="200" cy="15" r="4.5" fill="var(--color-success)" stroke="#fff" strokeWidth="1.5" />
                      <circle cx="300" cy="45" r="4.5" fill="var(--color-success)" stroke="#fff" strokeWidth="1.5" />
                      <circle cx="400" cy="20" r="4.5" fill="var(--color-success)" stroke="#fff" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', marginTop: '8px' }}>
                    <span>{lang === 'ar' ? 'الأحد (90%)' : 'Sun (90%)'}</span>
                    <span>{lang === 'ar' ? 'الإثنين (95%)' : 'Mon (95%)'}</span>
                    <span>{lang === 'ar' ? 'الثلاثاء (97%)' : 'Tue (97%)'}</span>
                    <span>{lang === 'ar' ? 'الأربعاء (83%)' : 'Wed (83%)'}</span>
                    <span>{lang === 'ar' ? 'الخميس (حالي)' : 'Thu (Today)'}</span>
                  </div>
                </div>
              </div>

              {/* Academic Performance Averages card (Vertical Bar Chart) */}
              <div className="section-card glass-panel">
                <div className="section-card-header">
                  <h2 className="section-card-title headline-small" style={{ fontSize: '16px', fontWeight: '800' }}>
                    🎯 {lang === 'ar' ? 'متوسط درجات المواد في الكنترول' : 'Control Subject Performance Averages'}
                  </h2>
                </div>

                <div className="academic-bars-grid">
                  <div className="academic-grid-lines">
                    <div className="academic-grid-line" data-value="100%"></div>
                    <div className="academic-grid-line" data-value="80%"></div>
                    <div className="academic-grid-line" data-value="60%"></div>
                    <div className="academic-grid-line" data-value="40%"></div>
                    <div className="academic-grid-line" data-value="20%"></div>
                  </div>
                  
                  {/* Arabic */}
                  <div className="academic-bar-col">
                    <div className="academic-bar" style={{ height: `${arabicAvg}%`, backgroundColor: 'var(--color-primary-ui)' }}>
                      <div className="academic-bar-tooltip">{arabicAvg}%</div>
                    </div>
                    <div className="academic-bar-label">{lang === 'ar' ? 'العربية' : 'Arabic'}</div>
                  </div>

                  {/* Math */}
                  <div className="academic-bar-col">
                    <div className="academic-bar" style={{ height: `${mathAvg}%`, backgroundColor: '#2563eb' }}>
                      <div className="academic-bar-tooltip">{mathAvg}%</div>
                    </div>
                    <div className="academic-bar-label">{lang === 'ar' ? 'الرياضيات' : 'Math'}</div>
                  </div>

                  {/* Science */}
                  <div className="academic-bar-col">
                    <div className="academic-bar" style={{ height: `${scienceAvg}%`, backgroundColor: '#059669' }}>
                      <div className="academic-bar-tooltip">{scienceAvg}%</div>
                    </div>
                    <div className="academic-bar-label">{lang === 'ar' ? 'العلوم' : 'Science'}</div>
                  </div>

                  {/* English */}
                  <div className="academic-bar-col">
                    <div className="academic-bar" style={{ height: `${englishAvg}%`, backgroundColor: '#7c3aed' }}>
                      <div className="academic-bar-tooltip">{englishAvg}%</div>
                    </div>
                    <div className="academic-bar-label">{lang === 'ar' ? 'الانجليزية' : 'English'}</div>
                  </div>
                </div>
              </div>

              {/* Top Students Honor Roll card */}
              <div className="section-card glass-panel">
                <div className="section-card-header">
                  <h2 className="section-card-title headline-small" style={{ fontSize: '16px', fontWeight: '800' }}>
                    🏆 {lang === 'ar' ? 'لوحة الشرف لأوائل الطلاب المتفوقين' : 'Top Performing Students Honor Roll'}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {studentAverages.slice(0, 3).map((st, index) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    const borderColors = ["#eab308", "#94a3b8", "#b45309"];
                    const bgColors = ["rgba(234, 179, 8, 0.05)", "rgba(148, 163, 184, 0.05)", "rgba(180, 83, 9, 0.05)"];
                    const sObj = students.find(s => s.id === st.studentId);
                    
                    // Simple avatar initials generator
                    const nameParts = st.name.trim().split(' ');
                    const initials = nameParts.length > 1 
                      ? `${nameParts[0][0] || ''}${nameParts[1][0] || ''}`
                      : `${nameParts[0][0] || ''}${nameParts[0][1] || ''}`;

                    return (
                      <div 
                        key={st.studentId} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '12px 16px', 
                          backgroundColor: bgColors[index], 
                          border: `1px solid ${borderColors[index]}22`, 
                          borderRadius: '16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: borderColors[index],
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            border: '2px solid #ffffff',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--color-text)' }}>
                              {lang === 'ar' ? st.name : st.nameEn}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px', fontWeight: '600' }}>
                              {lang === 'ar' ? sObj?.grade : sObj?.gradeEn} - {lang === 'ar' ? sObj?.section : sObj?.sectionEn}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: borderColors[index], fontWeight: '900', fontSize: '15px', fontFamily: 'var(--font-mono)' }}>
                            {st.average}%
                          </span>
                          <span style={{ fontSize: '20px' }}>{medals[index]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Side: Financial collection progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {/* Financial Collection card */}
              <div className="section-card glass-panel">
                <div className="section-card-header">
                  <h2 className="section-card-title headline-small" style={{ fontSize: '16px', fontWeight: '800' }}>
                    💳 {lang === 'ar' ? 'سجل تحصيل الرسوم الدراسية' : 'Tuition Fees Collection Summary'}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-border)" strokeWidth="6" />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="32" 
                        fill="none" 
                        stroke="var(--color-success)" 
                        strokeWidth="6" 
                        strokeDasharray={2 * Math.PI * 32} 
                        strokeDashoffset={2 * Math.PI * 32 * (1 - collectionRate / 100)} 
                        strokeLinecap="round" 
                        transform="rotate(-90 40 40)"
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: '900', fontSize: '14px', color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                      {collectionRate}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text)', fontWeight: '800' }}>
                      {lang === 'ar' ? 'نسبة التحصيل الإجمالية للرسوم' : 'Overall Collection Progress'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                      <span>{lang === 'ar' ? 'الطلاب المسددين:' : 'Paid Students:'}</span>
                      <span style={{ color: 'var(--color-text)', fontWeight: 'bold' }}>{tuitionFees.payments.length}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'rgba(16, 185, 129, 0.04)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.08)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>{lang === 'ar' ? 'المبالغ المحصلة' : 'Collected'}</span>
                    <strong style={{ fontSize: '13px', color: 'var(--color-success)' }}>{totalTuitionPaid.toLocaleString()} {lang === 'ar' ? 'ر.ي' : 'R.Y'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'rgba(239, 68, 68, 0.04)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.08)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>{lang === 'ar' ? 'المتبقي المستحق' : 'Outstanding'}</span>
                    <strong style={{ fontSize: '13px', color: 'var(--color-error)' }}>{(totalTuitionRequired - totalTuitionPaid).toLocaleString()} {lang === 'ar' ? 'ر.ي' : 'R.Y'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
