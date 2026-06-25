import React from 'react';
import { useApp } from '../context/AppContext';

export default function ReportsTab() {
  const { lang, t } = useApp();

  return (
    <div className="section-card">
      <h3 className="headline-small" style={{ fontSize: '18px', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-sm)' }}>
        {t.reportsTitle}
      </h3>

      <div className="reports-kpi-grid">
        
        {/* Attendance rate progress display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="title-medium" style={{ color: 'var(--color-primary-ui)' }}>{t.attendanceRate}</h4>
          
          {/* Visual progress bars conforming to modern CSS specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="body-medium" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{lang === 'ar' ? 'نسبة حضور اليوم' : 'Daily Attendance Rate'}</span>
              <span style={{ fontWeight: 'bold' }}>80%</span>
            </div>
            <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', background: 'var(--color-success)' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="body-medium" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{lang === 'ar' ? 'نسبة التأخير اليوم' : 'Daily Lateness Rate'}</span>
              <span style={{ fontWeight: 'bold' }}>20%</span>
            </div>
            <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: '20%', height: '100%', background: 'var(--color-warning)' }}></div>
            </div>
          </div>
        </div>

        {/* Homework statistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="title-medium" style={{ color: 'var(--color-primary-ui)' }}>{t.homeworkCompletionRate}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>🟢 {t.homeworkCompleted}</span>
              <span style={{ fontWeight: 'bold' }}>82%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>🟡 {t.homeworkDelayed}</span>
              <span style={{ fontWeight: 'bold' }}>12%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>🔴 {t.homeworkUnsubmitted}</span>
              <span style={{ fontWeight: 'bold' }}>6%</span>
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
          
          {/* High Absence warning */}
          <div className="reports-alert-card">
            <div className="reports-alert-info">
              <span className="reports-alert-title">
                {lang === 'ar' ? 'عبدالعزيز بن عبدالله القحطاني' : 'Abdulaziz bin Abdullah Al-Qahtani'}
              </span>
              <span className="reports-alert-desc">
                {t.highAbsenceDesc}
              </span>
            </div>
            <span className="reports-alert-badge">
              {t.absenceDaysCount.replace('{count}', '4')}
            </span>
          </div>

          {/* Low Performance warning */}
          <div className="reports-alert-card warning">
            <div className="reports-alert-info">
              <span className="reports-alert-title">
                {lang === 'ar' ? 'عبدالعزيز بن عبدالله القحطاني' : 'Abdulaziz bin Abdullah Al-Qahtani'}
              </span>
              <span className="reports-alert-desc">
                {t.lowPerformanceDesc}
              </span>
            </div>
            <span className="reports-alert-badge">
              {t.performanceAverage.replace('{average}', '49')}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
