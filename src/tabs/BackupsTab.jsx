import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { backupsService } from '../services/backups/backups.service';
import {
  Database,
  HardDrive,
  Layers,
  Clock,
  CheckCircle2,
  Download,
  Trash2,
  RefreshCw,
  FileArchive,
  Sparkles,
  Search,
  FolderArchive,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
} from 'lucide-react';
import './BackupsTab.css';

export default function BackupsTab() {
  const navigate = useNavigate();
  const { lang, t, setToastMessage, triggerConfirm } = useApp();

  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState({
    total_count: 0,
    total_size: '0 B',
    last_backup_date: '-',
    last_backup_formatted: '-',
    backup_name: 'anwar-alola',
    disk_name: 'local',
    schedule_time: 'يومياً 02:00 صباحاً',
    cleanup_time: 'يومياً 02:30 صباحاً',
    retention_days: 7,
    keep_daily_days: 16,
    db_connection: 'mysql',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [backupType, setBackupType] = useState('db'); // 'db' = Database only | 'full' = Full (DB + Uploads)
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch backups from API
  const fetchBackups = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await backupsService.getBackups();
      if (response && response.success) {
        setBackups(response.backups || []);
        if (response.stats) {
          setStats(response.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load backups:', err);
      if (!silent) {
        setToastMessage(
          lang === 'ar'
            ? 'تعذر تحميل قائمة النسخ الاحتياطية. يرجى المحاولة لاحقاً.'
            : 'Failed to load backup archives.'
        );
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  // Filter backups by search term
  const filteredBackups = useMemo(() => {
    if (!searchTerm.trim()) return backups;
    const term = searchTerm.toLowerCase();
    return backups.filter(
      (b) =>
        b.file_name.toLowerCase().includes(term) ||
        (b.created_at_formatted && b.created_at_formatted.toLowerCase().includes(term))
    );
  }, [backups, searchTerm]);

  // Trigger manual backup
  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const isOnlyDb = backupType === 'db';
      const res = await backupsService.createBackup(isOnlyDb);
      if (res && res.success) {
        setToastMessage(
          res.message ||
            (lang === 'ar'
              ? 'تم إنشاء النسخة الاحتياطية بنجاح!'
              : 'Backup archive created successfully!')
        );
        await fetchBackups(true);
      } else {
        setToastMessage(
          res?.message ||
            (lang === 'ar'
              ? 'حدث خطأ أثناء إنشاء النسخة الاحتياطية.'
              : 'Failed to create backup.')
        );
      }
    } catch (err) {
      console.error('Create backup error:', err);
      setToastMessage(
        err.message ||
          (lang === 'ar'
            ? 'فشلت عملية النسخ الاحتياطي. راجع سجلات النظام.'
            : 'Backup execution failed.')
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Trigger cleanup
  const handleCleanBackups = async () => {
    setIsCleaning(true);
    try {
      const res = await backupsService.cleanBackups();
      if (res && res.success) {
        setToastMessage(
          res.message ||
            (lang === 'ar'
              ? 'تم تنظيف النسخ القديمة بنجاح وفق سياسة الاحتفاظ.'
              : 'Old backups cleaned successfully.')
        );
        await fetchBackups(true);
      }
    } catch (err) {
      console.error('Clean backups error:', err);
      setToastMessage(
        err.message ||
          (lang === 'ar' ? 'فشل تنظيف النسخ القديمة.' : 'Failed to clean old backups.')
      );
    } finally {
      setIsCleaning(false);
    }
  };

  // Download backup archive
  const handleDownload = async (fileName) => {
    try {
      setToastMessage(
        lang === 'ar' ? 'جاري بدء تحميل الملف...' : 'Starting file download...'
      );
      await backupsService.downloadBackup(fileName);
    } catch (err) {
      console.error('Download error:', err);
      setToastMessage(
        lang === 'ar' ? 'تعذر تحميل ملف النسخة الاحتياطية.' : 'Failed to download file.'
      );
    }
  };

  // Delete backup archive with confirmation
  const handleDelete = (backup) => {
    triggerConfirm({
      title: lang === 'ar' ? 'حذف نسخة احتياطية' : 'Delete Backup Archive',
      message:
        lang === 'ar'
          ? `هل أنت متأكد من حذف النسخة الاحتياطية (${backup.file_name}) نهائياً من القرص؟`
          : `Are you sure you want to permanently delete (${backup.file_name})?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await backupsService.deleteBackup(backup.file_name);
          if (res && res.success) {
            setToastMessage(
              res.message ||
                (lang === 'ar'
                  ? 'تم حذف النسخة الاحتياطية بنجاح.'
                  : 'Backup deleted successfully.')
            );
            await fetchBackups(true);
          } else {
            setToastMessage(
              res?.message || (lang === 'ar' ? 'تعذر حذف النسخة.' : 'Delete failed.')
            );
          }
        } catch (err) {
          console.error('Delete error:', err);
          setToastMessage(
            lang === 'ar' ? 'حدث خطأ أثناء حذف الملف.' : 'Error deleting backup file.'
          );
        }
      },
    });
  };
  return (
    <div className="backups-container no-print">
      {/* 1. Header Section */}
      <div className="backups-header">
        <div className="backups-header-info">
          <h2>
            <Database className="text-primary-ui" size={26} />
            {lang === 'ar' ? 'إدارة النسخ الاحتياطي للنظام' : 'System Backup & Recovery'}
          </h2>
          <p>
            {lang === 'ar'
              ? 'النسخ الاحتياطي التلقائي اليومي لقاعدة البيانات والملفات، مع خيارات الاستعادة والأرشفة الآمنة.'
              : 'Automated daily database and storage backups with secure archiving and disaster recovery.'}
          </p>
        </div>

        <div className="backups-header-actions">
          <button
            type="button"
            className="btn-header-secondary"
            onClick={() => fetchBackups()}
            disabled={isLoading}
            title={lang === 'ar' ? 'تحديث القائمة' : 'Refresh'}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>{lang === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            className="btn-header-back"
            onClick={() => navigate('/settings')}
          >
            {lang === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{lang === 'ar' ? 'العودة للإعدادات' : 'Back to Settings'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Bento Metrics Grid */}
      <div className="backups-stats-grid">
        {/* Metric 1: Total Backups Count */}
        <div className="backup-stat-card">
          <div className="backup-stat-top">
            <span className="backup-stat-label">
              {lang === 'ar' ? 'إجمالي النسخ المحفوظة' : 'Total Backups'}
            </span>
            <div className="backup-stat-icon-wrap primary">
              <Layers size={18} />
            </div>
          </div>
          <div className="backup-stat-value">{stats.total_count}</div>
          <div className="backup-stat-subtext">
            <span>{lang === 'ar' ? 'ملفات أرشيف ZIP مؤمنة' : 'Secured ZIP archives'}</span>
          </div>
        </div>

        {/* Metric 2: Total Size */}
        <div className="backup-stat-card">
          <div className="backup-stat-top">
            <span className="backup-stat-label">
              {lang === 'ar' ? 'إجمالي المساحة المستخدمة' : 'Storage Used'}
            </span>
            <div className="backup-stat-icon-wrap info">
              <HardDrive size={18} />
            </div>
          </div>
          <div className="backup-stat-value">{stats.total_size}</div>
          <div className="backup-stat-subtext">
            <span>
              {lang === 'ar' ? 'القرص المحلي (Local Storage)' : 'Local disk partition'}
            </span>
          </div>
        </div>

        {/* Metric 3: Last Backup Time */}
        <div className="backup-stat-card">
          <div className="backup-stat-top">
            <span className="backup-stat-label">
              {lang === 'ar' ? 'آخر نسخة احتياطية' : 'Latest Backup'}
            </span>
            <div className="backup-stat-icon-wrap success">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div
            className="backup-stat-value"
            style={{ fontSize: '18px', fontWeight: '800' }}
          >
            {stats.last_backup_date}
          </div>
          <div className="backup-stat-subtext" style={{ fontFamily: 'monospace' }}>
            <span>{stats.last_backup_formatted}</span>
          </div>
        </div>

        {/* Metric 4: Automated Schedule */}
        <div className="backup-stat-card">
          <div className="backup-stat-top">
            <span className="backup-stat-label">
              {lang === 'ar' ? 'الجدولة التلقائية اليومية' : 'Automated Schedule'}
            </span>
            <div className="backup-stat-icon-wrap warning">
              <Clock size={18} />
            </div>
          </div>
          <div
            className="backup-stat-value"
            style={{ fontSize: '18px', fontWeight: '800' }}
          >
            {stats.schedule_time}
          </div>
          <div className="backup-stat-subtext">
            <span className="status-pulse-dot" />
            <span style={{ fontWeight: 700, color: '#10b981' }}>
              {lang === 'ar' ? 'مجدول ونشط تلقائياً' : 'Active & Running'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Action Hero Section (Trigger Manual / Instant Backup) */}
      <div className="backup-hero-panel">
        <div className="backup-hero-content">
          <div className="backup-hero-info">
            <div className="backup-badge-pill" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}>
              <Lock size={13} />
              <span>
                {lang === 'ar'
                  ? 'ملفات الأرشيف مشفرة ومؤمنة بكلمة سر (AES-256 Encrypted)'
                  : 'Archives Password-Protected & AES-256 Encrypted'}
              </span>
            </div>
            <h3>
              {lang === 'ar'
                ? 'إنشاء نسخة احتياطية فورية الآن'
                : 'Create Instant System Backup'}
            </h3>
            <p>
              {lang === 'ar'
                ? 'يقوم النظام تلقائياً بأخذ نسخة احتياطية لقاعدة البيانات كل ليلة عند الساعة 02:00 صباحاً ويحتفظ بها لمدة 7 أيام. يمكنك في أي وقت إنشاء نسخة يدوية فورية لحفظ أحدث التعديلات والبيانات.'
                : 'The system automatically creates a daily database backup at 02:00 AM and keeps records for 7 days. You can also trigger an immediate manual snapshot anytime.'}
            </p>

            {/* Selectable Backup Types: 2 Clear Cards */}
            <div className="backup-choice-cards">
              {/* Option 1: Database Only */}
              <div
                className={`backup-choice-card ${backupType === 'db' ? 'selected' : ''}`}
                onClick={() => !isCreating && setBackupType('db')}
              >
                <div className="backup-choice-header">
                  <div className="backup-choice-icon db">
                    <Database size={20} />
                  </div>
                  <div className="backup-choice-radio">
                    {backupType === 'db' && <Check size={14} />}
                  </div>
                </div>
                <div className="backup-choice-body">
                  <h4>{lang === 'ar' ? 'قاعدة البيانات فقط' : 'Database Only'}</h4>
                  <p>
                    {lang === 'ar'
                      ? 'نسخ جميع الجداول الـ 30 والدرجات والبيانات والعمليات المالية (سريعة وخفيفة الحجم).'
                      : 'All 30 MySQL tables, marks, transactions, and logs (fast & lightweight).'}
                  </p>
                </div>
              </div>

              {/* Option 2: Full System Backup */}
              <div
                className={`backup-choice-card ${backupType === 'full' ? 'selected' : ''}`}
                onClick={() => !isCreating && setBackupType('full')}
              >
                <div className="backup-choice-header">
                  <div className="backup-choice-icon full">
                    <FolderArchive size={20} />
                  </div>
                  <div className="backup-choice-radio">
                    {backupType === 'full' && <Check size={14} />}
                  </div>
                </div>
                <div className="backup-choice-body">
                  <h4>{lang === 'ar' ? 'نسخة شاملة (قاعدة البيانات + المرفقات)' : 'Full System Backup'}</h4>
                  <p>
                    {lang === 'ar'
                      ? 'قاعدة البيانات كاملة بالإضافة لجميع صور الطلاب، التقارير، والواجبات المرفوعة.'
                      : 'Complete MySQL database plus all student avatars, report PDFs, and uploads.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="backup-hero-action-box">
            <button
              type="button"
              className={`backup-run-btn ${backupType === 'full' ? 'full-mode' : 'db-mode'}`}
              onClick={handleCreateBackup}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>
                    {lang === 'ar'
                      ? 'جاري إنشاء النسخة الاحتياطية وضغط الملفات...'
                      : 'Creating Backup Archive...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>
                    {backupType === 'full'
                      ? lang === 'ar'
                        ? 'بدء النسخ الاحتياطي الشامل الآن'
                        : 'Start Full Backup Now'
                      : lang === 'ar'
                      ? 'بدء نسخ قاعدة البيانات الآن'
                      : 'Start Database Backup Now'}
                  </span>
                </>
              )}
            </button>

            {isCreating && (
              <div className="backup-in-progress-note">
                <span className="status-pulse-dot" />
                <span>
                  {backupType === 'full'
                    ? lang === 'ar'
                      ? 'جاري تفريغ قاعدة البيانات وضغط مجلدات المرفقات وتشفير الأرشيف بـ AES-256، يرجى الانتظار...'
                      : 'Dumping database and compressing upload files with AES-256 encryption, please wait...'
                    : lang === 'ar'
                    ? 'جاري تصدير قاعدة بيانات MySQL بدون إيقاف النظام وتشفير الأرشيف...'
                    : 'Exporting MySQL database snapshot with AES-256 encryption...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Backups Table & Search Toolbar */}
      <div className="backups-toolbar">
        <div className="backups-search-box">
          <Search size={16} style={{ opacity: 0.5 }} />
          <input
            type="text"
            placeholder={
              lang === 'ar'
                ? 'البحث في ملفات النسخ الاحتياطي بالاسم أو التاريخ...'
                : 'Search backup archives by name or date...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="backups-path-badge">
          <FolderArchive size={14} className="text-primary-ui" />
          <span>storage/app/private/{stats.backup_name}</span>
        </div>
      </div>

      <div className="backups-table-card">
        <div className="backups-table-header">
          <div className="backups-table-title">
            <FileArchive size={18} className="text-primary-ui" />
            <span>
              {lang === 'ar' ? 'سجل ملفات النسخ الاحتياطي' : 'Backup Archives Archive'}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginInlineStart: '6px',
              }}
            >
              ({filteredBackups.length})
            </span>
          </div>
        </div>

        <div className="backups-table-wrapper">
          <table className="backups-table">
            <thead>
              <tr>
                <th>{lang === 'ar' ? 'اسم ملف الأرشيف' : 'Archive Name'}</th>
                <th>{lang === 'ar' ? 'نوع النسخة' : 'Type'}</th>
                <th>{lang === 'ar' ? 'حجم الملف' : 'File Size'}</th>
                <th>{lang === 'ar' ? 'تاريخ ووقت الإنشاء' : 'Created At'}</th>
                <th>{lang === 'ar' ? 'الوقت النسبي' : 'Age'}</th>
                <th style={{ textAlign: 'center' }}>
                  {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={18} className="animate-spin text-primary-ui" />
                      <span>{lang === 'ar' ? 'جاري تحميل الأرشيف...' : 'Loading archives...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBackups.length > 0 ? (
                filteredBackups.map((backup) => (
                  <tr key={backup.file_name}>
                    <td>
                      <div className="backup-file-cell">
                        <div className="backup-file-icon">
                          <FileArchive size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="backup-file-name">{backup.file_name}</span>
                          <span style={{ fontSize: '11px', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <Lock size={11} />
                            <span>{lang === 'ar' ? 'مشفر بكلمة سر (AES-256)' : 'AES-256 Protected'}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`backup-type-badge ${
                          backup.is_db_only ? 'db' : 'full'
                        }`}
                      >
                        {backup.is_db_only
                          ? lang === 'ar'
                            ? 'قاعدة بيانات'
                            : 'Database'
                          : lang === 'ar'
                          ? 'شامل'
                          : 'Full'}
                      </span>
                    </td>

                    <td>
                      <span className="backup-size-badge">{backup.size_formatted}</span>
                    </td>

                    <td style={{ fontFamily: 'monospace' }}>
                      {backup.created_at_formatted}
                    </td>

                    <td style={{ color: 'var(--color-text-secondary)' }}>
                      {backup.created_at_human}
                    </td>

                    <td>
                      <div className="backup-actions-group">
                        <button
                          type="button"
                          className="btn-action-download"
                          onClick={() => handleDownload(backup.file_name)}
                          title={lang === 'ar' ? 'تنزيل الأرشيف' : 'Download Archive'}
                        >
                          <Download size={13} />
                          <span>{lang === 'ar' ? 'تنزيل' : 'Download'}</span>
                        </button>

                        <button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDelete(backup)}
                          title={lang === 'ar' ? 'حذف من السيرفر' : 'Delete'}
                        >
                          <Trash2 size={13} />
                          <span>{lang === 'ar' ? 'حذف' : 'Delete'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="backups-empty-state">
                      <div className="backups-empty-icon">
                        <Database size={32} />
                      </div>
                      <h4 className="backups-empty-title">
                        {searchTerm
                          ? lang === 'ar'
                            ? 'لا توجد نتائج مطابقة لبحثك'
                            : 'No matching backups found'
                          : lang === 'ar'
                          ? 'لا توجد نسخ احتياطية حتى الآن'
                          : 'No backup archives yet'}
                      </h4>
                      <p className="backups-empty-desc">
                        {searchTerm
                          ? lang === 'ar'
                            ? 'جرّب كتابة مصطلح بحث آخر أو مسح حقل البحث.'
                            : 'Try searching with a different term.'
                          : lang === 'ar'
                          ? 'يمكنك إنشاء أول نسخة احتياطية الآن بالنقر على زر "بدء نسخ قاعدة البيانات الآن" بالأعلى.'
                          : 'Click the "Start Backup Now" button above to generate your first backup.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
