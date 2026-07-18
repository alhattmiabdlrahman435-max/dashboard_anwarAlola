import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useReports } from '../contexts/Reports/useReports';
import { 
  FileWarning, CheckCircle, XCircle, Clock, Eye, Image as ImageIcon, Filter, RefreshCw, 
  User, School, GraduationCap, Calendar, RotateCcw, Trash2
} from 'lucide-react';

const TYPE_LABELS = {
  academic: { ar: 'أكاديمي', en: 'Academic', color: 'var(--color-primary-ui, #3b82f6)' },
  behavioral: { ar: 'سلوكي', en: 'Behavioral', color: 'var(--color-warning, #f59e0b)' },
  homework: { ar: 'واجبات', en: 'Homework', color: '#0ea5e9' },
  psychological: { ar: 'نفسي', en: 'Psychological', color: '#a855f7' },
};

const STATUS_LABELS = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', badgeClass: 'on-bus', icon: <Clock size={13} /> },
  approved: { ar: 'تمت الموافقة', en: 'Approved', badgeClass: 'checked-in', icon: <CheckCircle size={13} /> },
  rejected: { ar: 'مرفوض', en: 'Rejected', badgeClass: 'absent', icon: <XCircle size={13} /> },
  reviewed: { ar: 'تمت المراجعة', en: 'Reviewed', badgeClass: 'reached', icon: <Eye size={13} /> },
  archived: { ar: 'مؤرشف', en: 'Archived', badgeClass: '', icon: <Clock size={13} /> },
};

export default function TeacherReportsTab() {
  const { lang, t, triggerConfirm, canAction } = useApp();
  const { teacherReports, handleUpdateReportStatus, fetchTeacherReports, handleDeleteTeacherReport, handleDeleteAllTeacherReports } = useReports();

  useEffect(() => {
    fetchTeacherReports();
  }, [fetchTeacherReports]);
  const onDeleteReportClick = (e, reportId) => {
    e.stopPropagation();
    triggerConfirm({
      title: lang === 'ar' ? 'حذف البلاغ' : 'Delete Report',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا البلاغ نهائياً؟' : 'Are you sure you want to permanently delete this report?',
      onConfirm: () => {
        handleDeleteTeacherReport(reportId);
      }
    });
  };

  const onDeleteAllReportsClick = () => {
    triggerConfirm({
      title: lang === 'ar' ? 'حذف جميع البلاغات' : 'Delete All Reports',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف جميع البلاغات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!' : 'Are you sure you want to delete all reports permanently? This action cannot be undone!',
      onConfirm: () => {
        handleDeleteAllTeacherReports();
      }
    });
  };

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [viewImage, setViewImage] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const filtered = (teacherReports || []).filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    
    // Filter by specific report date (YYYY-MM-DD format)
    if (filterDate) {
      const reportDate = r.createdAt ? r.createdAt.substring(0, 10) : '';
      if (reportDate !== filterDate) return false;
    }
    
    // Filter by Teacher name or Student name
    if (searchTeacher.trim()) {
      const teacherMatches = (r.teacherName || '').toLowerCase().includes(searchTeacher.toLowerCase());
      const studentMatches = (r.studentName || '').toLowerCase().includes(searchTeacher.toLowerCase());
      if (!teacherMatches && !studentMatches) return false;
    }
    
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
    <div className="section-card animate-fade-in" style={{ gap: 'var(--space-xl)' }}>
      {/* Header */}
      <div className="section-card-header no-print" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-lg)' }}>
        <h3 className="section-card-title headline-small" style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileWarning size={22} className="color-primary-ui" style={{ color: 'var(--color-primary-ui)' }} />
          {lang === 'ar' ? t.teacherReportsTitle : t.teacherReportsTitle}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {teacherReports.length > 0 && canAction('teacherReports', 'delete') && (
            <button
              className="btn-elevated"
              style={{
                borderRadius: '10px',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                paddingInline: '16px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              onClick={onDeleteAllReportsClick}
            >
              <Trash2 size={15} />
              <span>{lang === 'ar' ? 'حذف الكل' : 'Delete All'}</span>
            </button>
          )}

          <button className="btn-elevated" onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}>
            <RefreshCw size={15} />
            {lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Summary cards (Bento style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)' }}>
        {[
          { 
            label: lang === 'ar' ? 'قيد الانتظار' : 'Pending', 
            count: countByStatus('pending'), 
            color: '#f59e0b', 
            bg: 'linear-gradient(135deg, var(--color-surface-alt) 70%, rgba(245, 158, 11, 0.05) 100%)',
            icon: <Clock size={24} /> 
          },
          { 
            label: lang === 'ar' ? 'تمت الموافقة' : 'Approved', 
            count: countByStatus('approved'), 
            color: '#10b981', 
            bg: 'linear-gradient(135deg, var(--color-surface-alt) 70%, rgba(16, 185, 129, 0.05) 100%)',
            icon: <CheckCircle size={24} /> 
          },
          { 
            label: lang === 'ar' ? 'مرفوض' : 'Rejected', 
            count: countByStatus('rejected'), 
            color: '#ef4444', 
            bg: 'linear-gradient(135deg, var(--color-surface-alt) 70%, rgba(239, 68, 68, 0.05) 100%)',
            icon: <XCircle size={24} /> 
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: '24px 20px',
              borderRadius: '20px',
              background: card.bg,
              border: `1px solid var(--color-border)`,
              borderTop: `4px solid ${card.color}`,
              boxShadow: 'var(--color-shadow)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.3s ease',
            }}
            className="stat-card"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                {card.label}
              </span>
              <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {card.count}
              </span>
            </div>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: `${card.color}15`,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-md)', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        padding: '16px', 
        backgroundColor: 'var(--color-surface)', 
        borderRadius: '16px', 
        border: '1px solid var(--color-border)' 
      }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '700' }}>
          <Filter size={16} />
          <span>{lang === 'ar' ? 'تصفية النتائج:' : 'Filters:'}</span>
        </div>
        
        <select
          className="text-field"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ minHeight: '40px', fontSize: '13px', width: 'auto', borderRadius: '10px', paddingInline: '12px' }}
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
          style={{ minHeight: '40px', fontSize: '13px', width: 'auto', borderRadius: '10px', paddingInline: '12px' }}
        >
          <option value="all">{lang === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
          <option value="academic">{lang === 'ar' ? 'أكاديمي' : 'Academic'}</option>
          <option value="behavioral">{lang === 'ar' ? 'سلوكي' : 'Behavioral'}</option>
          <option value="homework">{lang === 'ar' ? 'واجبات' : 'Homework'}</option>
          <option value="psychological">{lang === 'ar' ? 'نفسي' : 'Psychological'}</option>
        </select>

        {/* Date Filter */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="date"
            className="text-field"
            style={{ 
              minHeight: '40px', 
              fontSize: '13px', 
              width: 'auto', 
              borderRadius: '10px', 
              paddingInline: '12px',
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text-primary)',
              border: '1.5px solid var(--color-border)',
              cursor: 'pointer'
            }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            title={lang === 'ar' ? 'اختر التاريخ لتصفية البلاغات' : 'Choose Date'}
          />
          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate('')}
              style={{
                position: 'absolute',
                left: lang === 'ar' ? '8px' : 'auto',
                right: lang === 'ar' ? 'auto' : '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <XCircle size={14} />
            </button>
          )}
        </div>

        {/* Search Teacher/Student */}
        <input 
          type="text"
          className="text-field"
          placeholder={lang === 'ar' ? 'البحث باسم المعلم أو الطالب...' : 'Search teacher or student...'}
          value={searchTeacher}
          onChange={(e) => setSearchTeacher(e.target.value)}
          style={{ 
            minHeight: '40px', 
            fontSize: '13px', 
            width: '200px', 
            borderRadius: '10px', 
            paddingInline: '12px',
            backgroundColor: 'var(--color-surface-alt)',
            color: 'var(--color-text-primary)',
            border: '1.5px solid var(--color-border)'
          }}
        />

        <div style={{ marginInlineStart: 'auto', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
          {lang === 'ar' ? `إجمالي البلاغات: ${filtered.length}` : `Total Reports: ${filtered.length}`}
        </div>
      </div>

      {/* Reports list */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px var(--space-md)',
          color: 'var(--color-text-secondary)',
          border: '2px dashed var(--color-border)',
          borderRadius: '24px',
          backgroundColor: 'var(--color-surface)',
        }}>
          <FileWarning size={56} style={{ marginBottom: '16px', opacity: 0.25 }} />
          <p style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
            {lang === 'ar' ? 'لا توجد بلاغات تطابق خيارات التصفية الحالية.' : 'No reports match the selected filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {filtered.map((report) => {
            const typeInfo = TYPE_LABELS[report.type];
            const sInfo = statusInfo(report.status);
            const isLoading = loadingId === report.id;

            return (
              <div
                key={report.id}
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  borderInlineStart: `5px solid ${typeInfo?.color ?? 'var(--color-border)'}`,
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  opacity: isLoading ? 0.6 : 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'var(--color-shadow)',
                }}
                className="hover-card-y"
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GraduationCap size={18} style={{ color: 'var(--color-text-secondary)' }} />
                      {report.studentName}
                    </span>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <School size={14} />
                        {report.className || (lang === 'ar' ? 'غير محدد' : 'N/A')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} />
                        {report.teacherName}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Type badge */}
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '4px 12px',
                        borderRadius: '30px',
                        background: `${typeInfo?.color ?? '#999'}12`,
                        color: typeInfo?.color ?? '#999',
                        fontWeight: '800',
                        border: `1px solid ${typeInfo?.color ?? '#999'}30`,
                      }}
                    >
                      {typeLabel(report.type)}
                    </span>
                    {/* Status badge */}
                    <span
                      className={`badge-status ${sInfo.badgeClass}`}
                      style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}
                    >
                      {sInfo.icon}
                      {sInfo[lang] ?? report.status}
                    </span>
                  </div>
                </div>

                {/* Description Body */}
                <div style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--color-border)',
                  fontSize: '13px', 
                  color: 'var(--color-text-primary)', 
                  lineHeight: '1.6', 
                  fontWeight: '500' 
                }}>
                  {report.description}
                </div>

                {/* Footer and Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '8px', borderTop: '1px dashed var(--color-border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                    <Calendar size={14} />
                    {report.createdAt ? new Date(report.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US') : ''}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {report.imageUrl && (
                      <button
                        className="btn-elevated"
                        style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                        onClick={() => setViewImage(report.imageUrl)}
                      >
                        <ImageIcon size={14} />
                        {lang === 'ar' ? 'عرض المرفق' : 'View Attachment'}
                      </button>
                    )}
                    {report.status === 'pending' && (
                      <>
                        {canAction('teacherReports', 'approve') && (
                          <button
                            className="btn-filled"
                            style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '10px', background: 'var(--gradient-success, #10b981)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: '700' }}
                            onClick={() => handleStatusChange(report.id, 'approved')}
                            disabled={isLoading}
                          >
                            <CheckCircle size={14} />
                            {lang === 'ar' ? 'اعتماد' : 'Approve'}
                          </button>
                        )}
                        {canAction('teacherReports', 'reject') && (
                          <button
                            className="btn-filled"
                            style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '10px', background: 'var(--gradient-error, #ef4444)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: '700' }}
                            onClick={() => handleStatusChange(report.id, 'rejected')}
                            disabled={isLoading}
                          >
                            <XCircle size={14} />
                            {lang === 'ar' ? 'رفض' : 'Reject'}
                          </button>
                        )}
                      </>
                    )}
                    {report.status !== 'pending' && (canAction('teacherReports', 'approve') || canAction('teacherReports', 'reject')) && (
                      <button
                        className="btn-elevated"
                        style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                        onClick={() => handleStatusChange(report.id, 'pending')}
                        disabled={isLoading}
                      >
                        <RotateCcw size={14} />
                        {lang === 'ar' ? 'إعادة للمراجعة' : 'Reset to Pending'}
                      </button>
                    )}
                    
                    {/* Delete Report Button */}
                    {canAction('teacherReports', 'delete') && (
                      <button
                        className="btn-elevated"
                        style={{ 
                          fontSize: '12px', 
                          padding: '6px 14px', 
                          borderRadius: '10px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontWeight: '700',
                          color: 'var(--color-error)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          backgroundColor: 'rgba(239, 68, 68, 0.05)'
                        }}
                        onClick={(e) => onDeleteReportClick(e, report.id)}
                        disabled={isLoading}
                        title={lang === 'ar' ? 'حذف البلاغ نهائياً' : 'Delete Report'}
                      >
                        <Trash2 size={14} />
                        {lang === 'ar' ? 'حذف' : 'Delete'}
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
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-container glass-panel animate-scale-up"
            style={{ maxWidth: '650px', background: 'var(--color-surface)', padding: '24px', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ImageIcon size={20} className="color-primary-ui" />
              {lang === 'ar' ? 'المرفقات والصور المرفقة' : 'Attached Proof Image'}
            </h4>
            <img
              src={viewImage}
              alt="report-proof"
              style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '16px', objectFit: 'contain', border: '1px solid var(--color-border)', boxShadow: 'var(--color-shadow)' }}
            />
            <div style={{ marginTop: '20px' }}>
              <button className="btn-filled" style={{ borderRadius: '10px', padding: '8px 24px' }} onClick={() => setViewImage(null)}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
