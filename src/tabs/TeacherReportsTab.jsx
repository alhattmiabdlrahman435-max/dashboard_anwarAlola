import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileWarning, CheckCircle, XCircle, Clock, Eye, Image, Filter, RefreshCw } from 'lucide-react';

const TYPE_LABELS = {
  academic: { ar: 'أكاديمي', en: 'Academic', color: 'var(--color-primary-ui)' },
  behavioral: { ar: 'سلوكي', en: 'Behavioral', color: 'var(--color-warning)' },
  homework: { ar: 'واجبات', en: 'Homework', color: '#0ea5e9' },
  psychological: { ar: 'نفسي', en: 'Psychological', color: '#a855f7' },
};

const STATUS_LABELS = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', badgeClass: 'on-bus', icon: <Clock size={13} /> },
  approved: { ar: 'تمت الموافقة', en: 'Approved', badgeClass: 'reached', icon: <CheckCircle size={13} /> },
  rejected: { ar: 'مرفوض', en: 'Rejected', badgeClass: 'absent', icon: <XCircle size={13} /> },
  reviewed: { ar: 'تمت المراجعة', en: 'Reviewed', badgeClass: 'checked-in', icon: <Eye size={13} /> },
  archived: { ar: 'مؤرشف', en: 'Archived', badgeClass: '', icon: <Clock size={13} /> },
};

export default function TeacherReportsTab() {
  const { lang, t, teacherReports, handleUpdateReportStatus, fetchTeacherReports } = useApp();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewImage, setViewImage] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const filtered = (teacherReports || []).filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    return true;
  });

  const handleStatusChange = async (reportId, newStatus) => {
    setLoadingId(reportId);
    await handleUpdateReportStatus(reportId, newStatus);
    setLoadingId(null);
  };

  const handleRefresh = () => {
    const token = localStorage.getItem('auth_token');
    if (token) fetchTeacherReports(token);
  };

  const countByStatus = (status) => (teacherReports || []).filter(r => r.status === status).length;

  const typeLabel = (type) => TYPE_LABELS[type]?.[lang] ?? type;
  const statusInfo = (status) => STATUS_LABELS[status] ?? STATUS_LABELS.pending;

  return (
    <div className="section-card">
      {/* Header */}
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          <FileWarning size={20} style={{ display: 'inline', marginLeft: '8px', marginRight: '8px', verticalAlign: 'middle' }} />
          {lang === 'ar' ? t.teacherReportsTitle : t.teacherReportsTitle}
        </h3>
        <button className="btn-elevated" onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} />
          {lang === 'ar' ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {[
          { label: lang === 'ar' ? 'قيد الانتظار' : 'Pending', count: countByStatus('pending'), color: 'var(--color-warning)', icon: '⏳' },
          { label: lang === 'ar' ? 'تمت الموافقة' : 'Approved', count: countByStatus('approved'), color: 'var(--color-success)', icon: '✅' },
          { label: lang === 'ar' ? 'مرفوض' : 'Rejected', count: countByStatus('rejected'), color: 'var(--color-error)', icon: '❌' },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-card)',
              background: 'var(--color-surface-alt)',
              border: `2px solid ${card.color}20`,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '28px' }}>{card.icon}</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: card.color }}>{card.count}</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>{card.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-lg)', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--color-text-secondary)' }} />
        <select
          className="text-field"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ minHeight: '36px', fontSize: '13px', width: 'auto' }}
        >
          <option value="all">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
          <option value="pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
          <option value="approved">{lang === 'ar' ? 'تمت الموافقة' : 'Approved'}</option>
          <option value="rejected">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</option>
        </select>
        <select
          className="text-field"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ minHeight: '36px', fontSize: '13px', width: 'auto' }}
        >
          <option value="all">{lang === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
          <option value="academic">{lang === 'ar' ? 'أكاديمي' : 'Academic'}</option>
          <option value="behavioral">{lang === 'ar' ? 'سلوكي' : 'Behavioral'}</option>
          <option value="homework">{lang === 'ar' ? 'واجبات' : 'Homework'}</option>
          <option value="psychological">{lang === 'ar' ? 'نفسي' : 'Psychological'}</option>
        </select>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {lang === 'ar' ? `إجمالي النتائج: ${filtered.length}` : `Total: ${filtered.length} report(s)`}
        </span>
      </div>

      {/* Reports list */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px var(--space-md)',
          color: 'var(--color-text-secondary)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-card)',
        }}>
          <FileWarning size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontSize: '15px', fontWeight: '600' }}>
            {lang === 'ar' ? 'لا توجد بلاغات تطابق الفلتر المحدد.' : 'No reports match the selected filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {filtered.map((report) => {
            const typeInfo = TYPE_LABELS[report.type];
            const sInfo = statusInfo(report.status);
            const isLoading = loadingId === report.id;

            return (
              <div
                key={report.id}
                style={{
                  padding: 'var(--space-lg)',
                  backgroundColor: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  borderInlineStart: `4px solid ${typeInfo?.color ?? 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  opacity: isLoading ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                      👨‍🎓 {report.studentName}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      🏫 {report.className || (lang === 'ar' ? 'غير محدد' : 'N/A')}
                      {' — '}
                      👨‍🏫 {report.teacherName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Type badge */}
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: `${typeInfo?.color ?? '#999'}20`,
                        color: typeInfo?.color ?? '#999',
                        fontWeight: '700',
                        border: `1px solid ${typeInfo?.color ?? '#999'}40`,
                      }}
                    >
                      {typeLabel(report.type)}
                    </span>
                    {/* Status badge */}
                    <span
                      className={`badge-status ${sInfo.badgeClass}`}
                      style={{ fontSize: '11px', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {sInfo.icon}
                      {sInfo[lang] ?? report.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: '1.6', margin: 0 }}>
                  {report.description}
                </p>

                {/* Image + footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    🕒 {report.createdAt ? new Date(report.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US') : ''}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {report.imageUrl && (
                      <button
                        className="btn-elevated"
                        style={{ fontSize: '12px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => setViewImage(report.imageUrl)}
                      >
                        <Image size={13} />
                        {lang === 'ar' ? 'عرض الصورة' : 'View Image'}
                      </button>
                    )}
                    {report.status === 'pending' && (
                      <>
                        <button
                          className="btn-filled"
                          style={{ fontSize: '12px', padding: '5px 14px', background: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleStatusChange(report.id, 'approved')}
                          disabled={isLoading}
                        >
                          <CheckCircle size={13} />
                          {lang === 'ar' ? 'قبول' : 'Approve'}
                        </button>
                        <button
                          className="btn-filled"
                          style={{ fontSize: '12px', padding: '5px 14px', background: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleStatusChange(report.id, 'rejected')}
                          disabled={isLoading}
                        >
                          <XCircle size={13} />
                          {lang === 'ar' ? 'رفض' : 'Reject'}
                        </button>
                      </>
                    )}
                    {report.status !== 'pending' && (
                      <button
                        className="btn-elevated"
                        style={{ fontSize: '12px', padding: '5px 12px' }}
                        onClick={() => handleStatusChange(report.id, 'pending')}
                        disabled={isLoading}
                      >
                        {lang === 'ar' ? 'إعادة للانتظار' : 'Reset to Pending'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image preview modal */}
      {viewImage && (
        <div
          className="modal-overlay no-print"
          onClick={() => setViewImage(null)}
        >
          <div
            className="modal-container"
            style={{ maxWidth: '700px', background: 'var(--color-surface)', padding: 'var(--space-xl)', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: 'var(--space-md)' }}>
              {lang === 'ar' ? 'صورة إثبات البلاغ' : 'Report Proof Image'}
            </h4>
            <img
              src={viewImage}
              alt="report-proof"
              style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 'var(--radius-card)', objectFit: 'contain' }}
            />
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <button className="btn-elevated" onClick={() => setViewImage(null)}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
