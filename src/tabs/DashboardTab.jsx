import { useApp } from '../context/AppContext';
import { Users, User, ClipboardCheck, DollarSign } from 'lucide-react';

export default function DashboardTab() {
  const {
    lang,
    students,
    teachers,
    tuitionFees,
    grades,
    currentUser
  } = useApp();

  // Calculate school aggregates dynamically
  const presentCount = students.filter(s => s.status === 'present').length;
  const totalStudents = students.length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 100;

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
      <div className="stats-grid no-print">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(30, 80, 142, 0.1)', color: 'var(--color-primary-ui)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">{lang === 'ar' ? 'إجمالي الطلاب المسجلين' : 'Total Enrolled Students'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
            <User size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{teachers.length}</div>
            <div className="stat-label">{lang === 'ar' ? 'أعضاء هيئة التدريس' : 'Active Teachers'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
            <ClipboardCheck size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{attendanceRate}%</div>
            <div className="stat-label">{lang === 'ar' ? 'نسبة حضور اليوم' : "Today's Attendance Rate"}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{collectionRate}%</div>
            <div className="stat-label">{lang === 'ar' ? 'تحصيل الرسوم الدراسية' : 'Tuition Fees Collection'}</div>
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
              <div className="section-card">
                <div className="section-card-header">
                  <h2 className="section-card-title headline-small" style={{ fontSize: '16px', fontWeight: '800' }}>
                    📊 {lang === 'ar' ? 'تحليلات الحضور اليومي والغياب' : 'Daily Attendance Analytics'}
                  </h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="body-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? 'الطلاب الحاضرين اليوم:' : 'Present Students Today:'}
                    </span>
                    <strong style={{ color: 'var(--color-success)', fontSize: '15px' }}>{presentCount} / {totalStudents}</strong>
                  </div>
                  <div className="progress-bar-container" style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${attendanceRate}%`, height: '100%', backgroundColor: 'var(--color-success)', borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    <span>🟢 {lang === 'ar' ? `حاضر: ${presentCount}` : `Present: ${presentCount}`}</span>
                    <span>🔴 {lang === 'ar' ? `غائب: ${totalStudents - presentCount}` : `Absent: ${totalStudents - presentCount}`}</span>
                  </div>
                </div>
              </div>

              {/* Academic Performance Averages card */}
              <div className="section-card">
                <div className="section-card-header">
                  <h2 className="section-card-title headline-small" style={{ fontSize: '16px', fontWeight: '800' }}>
                    🎯 {lang === 'ar' ? 'متوسط درجات المواد في الكنترول' : 'Control Subject Performance Averages'}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Arabic */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{lang === 'ar' ? 'اللغة العربية' : 'Arabic Language'}</span>
                      <strong style={{ color: 'var(--color-primary-ui)' }}>{arabicAvg}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${arabicAvg}%`, height: '100%', backgroundColor: 'var(--color-primary-ui)', borderRadius: '3px' }}></div>
                    </div>
                  </div>

                  {/* Math */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{lang === 'ar' ? 'الرياضيات' : 'Mathematics'}</span>
                      <strong style={{ color: '#2563eb' }}>{mathAvg}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${mathAvg}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '3px' }}></div>
                    </div>
                  </div>

                  {/* Science */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{lang === 'ar' ? 'العلوم والفيزياء' : 'Science & Physics'}</span>
                      <strong style={{ color: '#059669' }}>{scienceAvg}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${scienceAvg}%`, height: '100%', backgroundColor: '#059669', borderRadius: '3px' }}></div>
                    </div>
                  </div>

                  {/* English */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{lang === 'ar' ? 'اللغة الإنجليزية' : 'English Language'}</span>
                      <strong style={{ color: '#7c3aed' }}>{englishAvg}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${englishAvg}%`, height: '100%', backgroundColor: '#7c3aed', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Students Honor Roll card */}
              <div className="section-card">
                <div className="section-card-header">
                  <h2 className="section-card-title headline-small" style={{ fontSize: '16px', fontWeight: '800' }}>
                    🏆 {lang === 'ar' ? 'لوحة الشرف لأوائل الطلاب المتفوقين' : 'Top Performing Students Honor Roll'}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {studentAverages.slice(0, 3).map((st, index) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    const colors = ["#eab308", "#94a3b8", "#b45309"];
                    const sObj = students.find(s => s.id === st.studentId);
                    return (
                      <div key={st.studentId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{medals[index]}</span>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{lang === 'ar' ? st.name : st.nameEn}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                              {lang === 'ar' ? sObj?.grade : sObj?.gradeEn}
                            </div>
                          </div>
                        </div>
                        <span style={{ color: colors[index], fontWeight: '900', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                          {st.average}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Side: Financial collection progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {/* Financial Collection card */}
              <div className="section-card">
                <div className="section-card-header">
                  <h2 className="section-card-title headline-small" style={{ fontSize: '16px', fontWeight: '800' }}>
                    💳 {lang === 'ar' ? 'سجل تحصيل الرسوم الدراسية' : 'Tuition Fees Collection Summary'}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '10px', borderRadius: 'var(--radius-input)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>{lang === 'ar' ? 'المبالغ المحصلة' : 'Collected'}</div>
                      <div style={{ fontWeight: '900', fontSize: '15px', color: 'var(--color-success)', marginTop: '2px' }}>{totalTuitionPaid} ر.س</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: 'var(--radius-input)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>{lang === 'ar' ? 'المتبقي المستحق' : 'Outstanding'}</div>
                      <div style={{ fontWeight: '900', fontSize: '15px', color: 'var(--color-error)', marginTop: '2px' }}>{totalTuitionRequired - totalTuitionPaid} ر.س</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      <span>{lang === 'ar' ? 'نسبة التحصيل الإجمالية:' : 'Overall Collection Progress:'}</span>
                      <strong>{collectionRate}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${collectionRate}%`, height: '100%', backgroundColor: 'var(--color-success)', borderRadius: '4px' }}></div>
                    </div>
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
