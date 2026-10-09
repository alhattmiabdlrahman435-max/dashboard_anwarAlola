import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import { useReports } from '../contexts/Reports/useReports';
import {
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  TrendingUp,
  Award,
  BookOpen,
  FileText,
  Bell,
  RefreshCw,
  ArrowUpRight,
  Layers,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import './DashboardTab.css';

export default function DashboardTab() {
  const { lang } = useApp();
  const { dashboardStats, fetchDashboardStats } = useReports();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const isAr = lang === 'ar';
  const text = (ar, en) => (isAr ? ar : en);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDashboardStats();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [fetchDashboardStats]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Aggregated KPIs
  const totalStudents = dashboardStats?.total_students ?? 0;
  const activeTeachers = dashboardStats?.total_teachers ?? 0;
  const totalClasses = dashboardStats?.total_classes ?? 0;

  const presentCount = dashboardStats?.present_today ?? 0;
  const absentCount = dashboardStats?.absent_today ?? Math.max(0, totalStudents - presentCount);
  const lateCount = dashboardStats?.late_today ?? 0;

  const attendanceRate = totalStudents > 0
    ? Math.min(100, Math.round((presentCount / totalStudents) * 100))
    : 100;

  const pendingAbsences = dashboardStats?.pending_absences ?? 0;

  const totalTuitionRequired = dashboardStats?.total_required_fees ?? 0;
  const totalTuitionPaid = dashboardStats?.total_paid_fees ?? 0;
  const collectionRate = dashboardStats?.collection_rate ?? 0;
  const paidStudentsCount = dashboardStats?.paid_students_count ?? 0;
  const outstandingFees = Math.max(0, totalTuitionRequired - totalTuitionPaid);

  const mathAvg = dashboardStats?.subject_averages?.math ?? 0;
  const scienceAvg = dashboardStats?.subject_averages?.science ?? 0;
  const arabicAvg = dashboardStats?.subject_averages?.arabic ?? 0;
  const englishAvg = dashboardStats?.subject_averages?.english ?? 0;

  const studentAverages = dashboardStats?.top_students ?? [];

  const formattedDate = new Date().toLocaleDateString(isAr ? 'ar-YE' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="db-container" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Welcome & Operational Status Banner */}
      <section className="db-welcome-banner">
        <div className="db-welcome-info">
          <div className="db-welcome-title-row">
            <h1 className="db-welcome-title">
              {text('لوحة القيادة الميدانية للمدرسة', 'School Executive Dashboard')}
            </h1>
            <span className="db-status-badge">
              <span className="db-pulse-dot" />
              <span>{text('النظام نشط ومحدث', 'System Live & Active')}</span>
            </span>
          </div>
          <div className="db-welcome-subtitle">
            <span>
              <Calendar size={15} />
              {formattedDate}
            </span>
            <span>
              <ShieldCheck size={15} />
              {text('مدارس أنوار العلا الأهلية النموذجية', 'Anwar Al-Ola International Model Schools')}
            </span>
          </div>
        </div>

        <div className="db-welcome-actions">
          <button
            type="button"
            className="db-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title={text('تحديث المؤشرات الحية', 'Refresh live metrics')}
          >
            <RefreshCw size={15} className={refreshing ? 'db-spin-icon' : ''} />
            <span>{refreshing ? text('جارٍ التحديث…', 'Syncing…') : text('تحديث فوري', 'Live Sync')}</span>
          </button>
        </div>
      </section>

      {/* 2. Urgent Operations Alert Bar (If pending requests exist) */}
      {pendingAbsences > 0 && (
        <section className="db-alert-bar" role="alert">
          <div className="db-alert-content">
            <Bell size={18} />
            <span>
              {text(
                `تنبيه إداري: يوجد ${pendingAbsences} طلبات استئذان وغياب معلقة بانتظار اعتماد الإدارة`,
                `Administrative Notice: ${pendingAbsences} pending absence requests awaiting review`
              )}
            </span>
          </div>
          <button
            type="button"
            className="db-alert-action-btn"
            onClick={() => navigate('/absence-requests')}
          >
            <span>{text('مراجعة الطلبات', 'Review Requests')}</span>
            <ArrowUpRight size={14} />
          </button>
        </section>
      )}

      {/* 3. Top Key Performance Indicators (Bento KPIs) */}
      <section className="db-kpis-grid">
        {/* KPI 1: Students */}
        <div className="db-kpi-card" style={{ '--kpi-accent': 'var(--color-primary-ui, #2563eb)' }}>
          <div className="db-kpi-card-top">
            <div className="db-kpi-icon-wrap">
              <Users size={22} />
            </div>
            <span className="db-kpi-tag">{text('القيد الإجمالي', 'Total Roster')}</span>
          </div>
          <div className="db-kpi-card-body">
            <span className="db-kpi-value">{totalStudents.toLocaleString()}</span>
            <span className="db-kpi-label">{text('إجمالي الطلاب المقيدين', 'Enrolled Students')}</span>
          </div>
          <div className="db-kpi-card-foot">
            <span>{text('الشعب الدراسية النشطة:', 'Active Classes:')}</span>
            <strong className="db-kpi-submetric">{totalClasses} {text('شعبة', 'classes')}</strong>
          </div>
        </div>

        {/* KPI 2: Teaching Staff */}
        <div className="db-kpi-card" style={{ '--kpi-accent': '#0d9488' }}>
          <div className="db-kpi-card-top">
            <div className="db-kpi-icon-wrap">
              <GraduationCap size={22} />
            </div>
            <span className="db-kpi-tag">{text('الهيئة التعليمية', 'Faculty')}</span>
          </div>
          <div className="db-kpi-card-body">
            <span className="db-kpi-value">{activeTeachers.toLocaleString()}</span>
            <span className="db-kpi-label">{text('أعضاء هيئة التدريس', 'Active Teachers')}</span>
          </div>
          <div className="db-kpi-card-foot">
            <span>{text('حالة الكادر:', 'Staff Status:')}</span>
            <strong className="db-kpi-submetric" style={{ color: '#0d9488' }}>{text('مكتمل النصاب', 'Full Roster')}</strong>
          </div>
        </div>

        {/* KPI 3: Today's Attendance */}
        <div className="db-kpi-card" style={{ '--kpi-accent': '#16a34a' }}>
          <div className="db-kpi-card-top">
            <div className="db-kpi-icon-wrap">
              <CheckCircle2 size={22} />
            </div>
            <span className="db-kpi-tag" style={{ color: '#16a34a' }}>{text('حضور اليوم', 'Today')}</span>
          </div>
          <div className="db-kpi-card-body">
            <span className="db-kpi-value">{attendanceRate}%</span>
            <span className="db-kpi-label">{text('نسبة الحضور الميداني', 'Attendance Rate')}</span>
          </div>
          <div className="db-kpi-card-foot">
            <span>{text('الحاضرون:', 'Present:')} <strong className="db-kpi-submetric" style={{ color: '#16a34a' }}>{presentCount}</strong></span>
            <span>{text('الغياب:', 'Absent:')} <strong className="db-kpi-submetric" style={{ color: '#dc2626' }}>{absentCount}</strong></span>
          </div>
        </div>

        {/* KPI 4: Financial Collection */}
        <div className="db-kpi-card" style={{ '--kpi-accent': '#d97706' }}>
          <div className="db-kpi-card-top">
            <div className="db-kpi-icon-wrap">
              <Wallet size={22} />
            </div>
            <span className="db-kpi-tag">{text('المحصلة المالية', 'Collection')}</span>
          </div>
          <div className="db-kpi-card-body">
            <span className="db-kpi-value">{collectionRate}%</span>
            <span className="db-kpi-label">{text('نسبة تحصيل الرسوم', 'Fees Collection')}</span>
          </div>
          <div className="db-kpi-card-foot">
            <span>{text('الطلاب المسددين:', 'Paid Students:')}</span>
            <strong className="db-kpi-submetric">{paidStudentsCount} / {totalStudents}</strong>
          </div>
        </div>
      </section>

      {/* 4. Quick Actions Launcher Strip */}
      <section className="db-quick-actions-bar" aria-label={text('روابط الوصول السريع', 'Quick links')}>
        <div className="db-quick-title">
          <Sparkles size={16} />
          <span>{text('إجراءات سريعة:', 'Quick Actions:')}</span>
        </div>
        <button type="button" className="db-quick-btn" onClick={() => navigate('/attendance')}>
          <CheckCircle2 size={15} />
          <span>{text('رصد الحضور اليومي', 'Take Attendance')}</span>
        </button>
        <button type="button" className="db-quick-btn" onClick={() => navigate('/reports')}>
          <FileText size={15} />
          <span>{text('مركز التقارير المدرسية', 'Reports Center')}</span>
        </button>
        <button type="button" className="db-quick-btn" onClick={() => navigate('/students')}>
          <Users size={15} />
          <span>{text('شؤون وقيد الطلاب', 'Students Roster')}</span>
        </button>
        <button type="button" className="db-quick-btn" onClick={() => navigate('/control')}>
          <BookOpen size={15} />
          <span>{text('كنترول الاختبارات', 'Control Grades')}</span>
        </button>
        <button type="button" className="db-quick-btn" onClick={() => navigate('/finance')}>
          <Wallet size={15} />
          <span>{text('التحصيل المالي والرسوم', 'Tuition Finance')}</span>
        </button>
        <button type="button" className="db-quick-btn" onClick={() => navigate('/absence-requests')}>
          <Bell size={15} />
          <span>{text('طلبات الاستئذان', 'Absence Requests')}</span>
        </button>
      </section>

      {/* 5. Main Operational Bento Grid */}
      <div className="db-bento-grid">
        {/* Column 1: Academic & Operational Analytics */}
        <div className="db-column">
          {/* Card A: Attendance Breakdown */}
          <div className="db-panel-card">
            <div className="db-panel-head">
              <h2 className="db-panel-title">
                <CheckCircle2 size={18} />
                <span>{text('تحليلات الحضور والانضباط المدرسي اليوم', 'Daily Attendance & Discipline Analytics')}</span>
              </h2>
              <button
                type="button"
                className="db-panel-link"
                onClick={() => navigate('/attendance')}
              >
                <span>{text('فتح سجل الحضور', 'Open Attendance')}</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="db-attendance-widget">
              {/* Radial Dial */}
              <div className="db-radial-box">
                <svg className="db-radial-svg" viewBox="0 0 100 100">
                  <circle
                    className="db-radial-bg"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    strokeWidth="9"
                  />
                  <circle
                    className="db-radial-progress"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    strokeWidth="9"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - attendanceRate / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="db-radial-center">
                  <span className="db-radial-number">{attendanceRate}%</span>
                  <span className="db-radial-sub">{text('نسبة الحضور', 'Rate')}</span>
                </div>
              </div>

              {/* Status Breakdown Chips */}
              <div className="db-attendance-chips-list">
                <div className="db-attendance-chip-item" style={{ '--chip-color': '#16a34a' }}>
                  <div className="db-chip-title-wrap">
                    <span className="db-chip-dot" />
                    <span>{text('الطلاب الحاضرون في الفصول', 'Present Students')}</span>
                  </div>
                  <strong className="db-chip-val">{presentCount} {text('طالب', 'students')}</strong>
                </div>

                <div className="db-attendance-chip-item" style={{ '--chip-color': '#dc2626' }}>
                  <div className="db-chip-title-wrap">
                    <span className="db-chip-dot" />
                    <span>{text('الطلاب الغائبون المسجلون', 'Absent Students')}</span>
                  </div>
                  <strong className="db-chip-val">{absentCount} {text('طالب', 'students')}</strong>
                </div>

                <div className="db-attendance-chip-item" style={{ '--chip-color': '#d97706' }}>
                  <div className="db-chip-title-wrap">
                    <span className="db-chip-dot" />
                    <span>{text('حالات التأخر الصباحي', 'Late Arrivals')}</span>
                  </div>
                  <strong className="db-chip-val">{lateCount} {text('طالب', 'students')}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Control Subject Academic Averages */}
          <div className="db-panel-card">
            <div className="db-panel-head">
              <h2 className="db-panel-title">
                <TrendingUp size={18} />
                <span>{text('مؤشرات أداء المواد في الكنترول', 'Control Subject Performance Averages')}</span>
              </h2>
              <button
                type="button"
                className="db-panel-link"
                onClick={() => navigate('/control')}
              >
                <span>{text('معاينة الكنترول', 'View Control')}</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="db-subjects-bars">
              {/* Arabic */}
              <div className="db-subject-bar-item">
                <div className="db-bar-track">
                  <div
                    className="db-bar-fill"
                    style={{ height: `${arabicAvg}%`, '--bar-color': 'var(--color-primary-ui, #2563eb)' }}
                  >
                    <span className="db-bar-value-pill">{arabicAvg}%</span>
                  </div>
                </div>
                <span className="db-subject-name">{text('اللغة العربية', 'Arabic')}</span>
              </div>

              {/* Math */}
              <div className="db-subject-bar-item">
                <div className="db-bar-track">
                  <div
                    className="db-bar-fill"
                    style={{ height: `${mathAvg}%`, '--bar-color': '#0284c7' }}
                  >
                    <span className="db-bar-value-pill">{mathAvg}%</span>
                  </div>
                </div>
                <span className="db-subject-name">{text('الرياضيات', 'Math')}</span>
              </div>

              {/* Science */}
              <div className="db-subject-bar-item">
                <div className="db-bar-track">
                  <div
                    className="db-bar-fill"
                    style={{ height: `${scienceAvg}%`, '--bar-color': '#059669' }}
                  >
                    <span className="db-bar-value-pill">{scienceAvg}%</span>
                  </div>
                </div>
                <span className="db-subject-name">{text('العلوم', 'Science')}</span>
              </div>

              {/* English */}
              <div className="db-subject-bar-item">
                <div className="db-bar-track">
                  <div
                    className="db-bar-fill"
                    style={{ height: `${englishAvg}%`, '--bar-color': '#7c3aed' }}
                  >
                    <span className="db-bar-value-pill">{englishAvg}%</span>
                  </div>
                </div>
                <span className="db-subject-name">{text('اللغة الإنجليزية', 'English')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Honor Roll & Financial Health */}
        <div className="db-column">
          {/* Card C: Top Students Honor Roll */}
          <div className="db-panel-card">
            <div className="db-panel-head">
              <h2 className="db-panel-title">
                <Award size={18} />
                <span>{text('لوحة الشرف لأوائل الطلاب', 'Top Students Honor Roll')}</span>
              </h2>
              <button
                type="button"
                className="db-panel-link"
                onClick={() => navigate('/reports')}
              >
                <span>{text('كشوف الأوائل', 'Full Rank List')}</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="db-honor-list">
              {studentAverages.length > 0 ? (
                studentAverages.slice(0, 3).map((st, idx) => {
                  const rankClass = idx === 0 ? 'db-rank-1' : idx === 1 ? 'db-rank-2' : 'db-rank-3';
                  const rankText = idx === 0 ? '1' : idx === 1 ? '2' : '3';

                  return (
                    <div key={st.student_id || idx} className="db-honor-card">
                      <div className="db-honor-student-info">
                        <div className={`db-rank-badge ${rankClass}`}>
                          {rankText}
                        </div>
                        <div className="db-student-names">
                          <span className="db-student-name">
                            {isAr ? st.name_ar || st.name : st.name_en || st.nameEn || st.name}
                          </span>
                          <span className="db-student-class">
                            {isAr ? `${st.grade} — ${st.section}` : `${st.gradeEn || st.grade} — ${st.sectionEn || st.section}`}
                          </span>
                        </div>
                      </div>
                      <div className="db-honor-score">
                        <span className="db-score-num">{st.average}%</span>
                        <span className="db-score-label">{text('المعدل العام', 'Average')}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  {text('لا توجد درجات مرصودة حالياً لعرض لوحة الشرف', 'No control grades available for honor roll')}
                </div>
              )}
            </div>
          </div>

          {/* Card D: Tuition Fees Collection Summary */}
          <div className="db-panel-card">
            <div className="db-panel-head">
              <h2 className="db-panel-title">
                <Wallet size={18} />
                <span>{text('متابعة التحصيل المالي للرسوم', 'Tuition Fees Collection')}</span>
              </h2>
              <button
                type="button"
                className="db-panel-link"
                onClick={() => navigate('/finance')}
              >
                <span>{text('إدارة المالية', 'Finance Management')}</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="db-finance-overview">
              <div className="db-finance-radial-row">
                <div className="db-finance-dial">
                  <svg viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="var(--color-border, #e2e8f0)"
                      strokeWidth="7"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="var(--color-success, #16a34a)"
                      strokeWidth="7"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - collectionRate / 100)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
                    />
                  </svg>
                  <span className="db-finance-pct">{collectionRate}%</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    {text('نسبة إجمالي التحصيل', 'Overall Collection Rate')}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {text('الطلاب المسددين:', 'Paid Students:')}{' '}
                    <strong style={{ color: 'var(--color-text-primary)' }}>
                      {paidStudentsCount} / {totalStudents}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="db-finance-stats-cards">
                <div className="db-fin-stat-item collected">
                  <span>{text('المبالغ المحصلة:', 'Collected Amount:')}</span>
                  <strong>{totalTuitionPaid.toLocaleString()} {text('ر.ي', 'YER')}</strong>
                </div>
                <div className="db-fin-stat-item outstanding">
                  <span>{text('المتبقي المستحق:', 'Outstanding Balance:')}</span>
                  <strong>{outstandingFees.toLocaleString()} {text('ر.ي', 'YER')}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
