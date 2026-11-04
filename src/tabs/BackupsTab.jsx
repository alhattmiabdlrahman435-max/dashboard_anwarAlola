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
  GraduationCap,
  X,
  FileText,
  Laptop,
  FileSpreadsheet,
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
    retention_days: 365,
    keep_daily_days: 365,
    db_connection: 'mysql',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [backupType, setBackupType] = useState('db'); // 'db' = Database only | 'full' = Full (DB + Uploads)
  const [searchTerm, setSearchTerm] = useState('');

  // Academic Year Offline Archive Modal States
  const [showYearModal, setShowYearModal] = useState(false);
  const [academicYearInput, setAcademicYearInput] = useState('2026-2027م');
  const [archiveFormat, setArchiveFormat] = useState('excel'); // 'excel' | 'zip' | 'html'
  const [isExportingYear, setIsExportingYear] = useState(false);

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

  // Trigger Academic Year Archive Export (Excel / ZIP / HTML)
  const handleExportYearArchive = async (overrideFormat = null) => {
    setIsExportingYear(true);
    const formatToUse = (typeof overrideFormat === 'string' && overrideFormat) ? overrideFormat : archiveFormat;
    try {
      const res = await backupsService.exportAcademicYearArchive(academicYearInput, formatToUse);
      if (res && res.success) {
        const formatLabel =
          formatToUse === 'excel'
            ? 'ملف إكسل (.xlsx)'
            : formatToUse === 'html'
            ? 'تطبيق الأرشيف (.html)'
            : 'حزمة الأرشيف الكاملة (.zip)';

        setToastMessage(
          lang === 'ar'
            ? `تم تصدير وتجهيز ${formatLabel} بنجاح! جاري التنزيل تلقائياً...`
            : 'Archive exported successfully! Downloading...'
        );
        setShowYearModal(false);
        await fetchBackups(true);

        // Trigger immediate browser download
        if (res.file_name) {
          await backupsService.downloadBackup(res.file_name);
        }
      } else {
        setToastMessage(
          res?.message ||
            (lang === 'ar'
              ? 'حدث خطأ أثناء تصدير أرشيف العام الدراسي.'
              : 'Failed to export academic year archive.')
        );
      }
    } catch (err) {
      console.error('Export year archive error:', err);
      setToastMessage(
        err.message ||
          (lang === 'ar'
            ? 'فشل تصدير أرشيف العام الدراسي.'
            : 'Archive export failed.')
      );
    } finally {
      setIsExportingYear(false);
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

        {/* Metric 4: Automated Schedule & Retention */}
        <div className="backup-stat-card">
          <div className="backup-stat-top">
            <span className="backup-stat-label">
              {lang === 'ar' ? 'سياسة الاحتفاظ بالنسخ' : 'Retention Policy'}
            </span>
            <div className="backup-stat-icon-wrap warning">
              <Clock size={18} />
            </div>
          </div>
          <div
            className="backup-stat-value"
            style={{ fontSize: '18px', fontWeight: '800' }}
          >
            {stats.retention_days} {lang === 'ar' ? 'يوماً (عام كامل)' : 'days'}
          </div>
          <div className="backup-stat-subtext">
            <span className="status-pulse-dot" />
            <span style={{ fontWeight: 700, color: '#10b981' }}>
              {lang === 'ar' ? 'حفظ تلقائي لجميع السنوات' : 'Year-round retention'}
            </span>
          </div>
        </div>
      </div>

      {/* 2.5 Academic Year Offline Archive Special Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.08) 0%, rgba(15, 118, 110, 0.08) 100%)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', maxWidth: '780px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 6px 16px rgba(30, 58, 138, 0.25)',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
                {lang === 'ar'
                  ? 'نسخة نهاية العام الدراسي الشاملة (تعمل بدون إنترنت)'
                  : 'Academic Year Comprehensive Offline Archive'}
              </h3>
              <span
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: '1px solid #86efac',
                }}
              >
                ✔ مرجع أساسي للكمبيوتر والفلاشة
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '6px 0 0 0', lineHeight: 1.6 }}>
              {lang === 'ar'
                ? 'تتيح هذه النافذة تصدير نسخة أرشيفية كاملة ومستقلة لكل ما يخص العام الدراسي (الطلاب، الدرجات، الكنترول، أولياء الأمور، المعلمين، الفصول، السجل المالي، والحضور). يمكن فتحها وتصفحها والبحث والطباعة منها في أي كمبيوتر أو فلاشة أو هارد خارجي بدون الحاجة إلى إنترنت نهائياً.'
                : 'Export a complete standalone offline archive for the entire academic year (students, grades, control sheet, parents, teachers, finance, and attendance) that opens and runs on any PC/USB flash drive without internet.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleExportYearArchive('excel')}
            disabled={isExportingYear}
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: isExportingYear ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 18px rgba(22, 163, 74, 0.25)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => !isExportingYear && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <FileSpreadsheet size={18} />
            <span>
              {isExportingYear && archiveFormat === 'excel'
                ? (lang === 'ar' ? 'جاري تجهيز الإكسل...' : 'Generating Excel...')
                : (lang === 'ar' ? 'تصدير إكسل فوري (.xlsx)' : 'Export Instant Excel (.xlsx)')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowYearModal(true)}
            disabled={isExportingYear}
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: isExportingYear ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 18px rgba(30, 58, 138, 0.25)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => !isExportingYear && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Laptop size={18} />
            <span>
              {lang === 'ar'
                ? 'خيارات الأرشيف الكامل (ZIP / HTML)'
                : 'All Archive Options (ZIP/HTML)'}
            </span>
          </button>
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
                ? 'يقوم النظام تلقائياً بأخذ نسخة احتياطية لقاعدة البيانات كل ليلة عند الساعة 02:00 صباحاً ويحتفظ بها لمدة عام دراسي كامل (365 يوماً). يمكنك في أي وقت إنشاء نسخة يدوية فورية لحفظ أحدث التعديلات والبيانات.'
                : 'The system automatically creates a daily database backup at 02:00 AM and keeps records for 365 days. You can also trigger an immediate manual snapshot anytime.'}
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
              {lang === 'ar' ? 'سجل ملفات النسخ الاحتياطي والأرشيف' : 'Backup Archives Archive'}
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
                filteredBackups.map((backup) => {
                  const isExcel = backup.format === 'excel' || backup.file_name.toLowerCase().endsWith('.xlsx');
                  const isHtml = backup.format === 'html' || backup.file_name.toLowerCase().endsWith('.html');
                  const isYearZip = backup.is_year_archive && !isExcel && !isHtml;

                  return (
                    <tr key={backup.file_name}>
                      <td>
                        <div className="backup-file-cell">
                          <div
                            className="backup-file-icon"
                            style={{
                              background: isExcel
                                ? 'rgba(22, 163, 74, 0.15)'
                                : isHtml
                                ? 'rgba(3, 105, 161, 0.15)'
                                : isYearZip
                                ? 'rgba(15, 118, 110, 0.15)'
                                : undefined,
                              color: isExcel
                                ? '#16a34a'
                                : isHtml
                                ? '#0369a1'
                                : isYearZip
                                ? '#0f766e'
                                : undefined,
                            }}
                          >
                            {isExcel ? (
                              <FileSpreadsheet size={18} />
                            ) : isHtml ? (
                              <FileText size={18} />
                            ) : backup.is_year_archive ? (
                              <GraduationCap size={18} />
                            ) : (
                              <FileArchive size={18} />
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className="backup-file-name">{backup.file_name}</span>
                            <span
                              style={{
                                fontSize: '11px',
                                color: isExcel
                                  ? '#16a34a'
                                  : isHtml
                                  ? '#0369a1'
                                  : backup.is_year_archive
                                  ? '#0f766e'
                                  : '#10b981',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 600,
                              }}
                            >
                              {isExcel ? (
                                <>
                                  <Check size={11} />
                                  <span>{lang === 'ar' ? 'مصنف إكسل شامل ومبوب (7 أوراق عمل)' : 'Multi-Tab Excel Workbook'}</span>
                                </>
                              ) : isHtml ? (
                                <>
                                  <Check size={11} />
                                  <span>{lang === 'ar' ? 'تطبيق ويب مستقل أوفلاين (HTML)' : 'Offline Interactive Viewer'}</span>
                                </>
                              ) : isYearZip ? (
                                <>
                                  <Check size={11} />
                                  <span>{lang === 'ar' ? 'حزمة أرشيف شاملة (إكسل + HTML + SQL)' : 'Complete Archive Package'}</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={11} />
                                  <span>{lang === 'ar' ? 'مشفر بكلمة سر (AES-256)' : 'AES-256 Protected'}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`backup-type-badge ${
                            backup.is_year_archive ? 'full' : backup.is_db_only ? 'db' : 'full'
                          }`}
                          style={{
                            background: isExcel
                              ? '#dcfce7'
                              : isHtml
                              ? '#e0f2fe'
                              : isYearZip
                              ? '#ccfbf1'
                              : undefined,
                            color: isExcel
                              ? '#15803d'
                              : isHtml
                              ? '#0369a1'
                              : isYearZip
                              ? '#0f766e'
                              : undefined,
                            border: isExcel
                              ? '1px solid #86efac'
                              : isHtml
                              ? '1px solid #7dd3fc'
                              : isYearZip
                              ? '1px solid #99f6e4'
                              : undefined,
                          }}
                        >
                          {backup.type_label}
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
                            title={lang === 'ar' ? 'تنزيل وحفظ الملف' : 'Download File'}
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
                  );
                })
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

      {/* 6. Academic Year Offline Archive Modal Window */}
      {showYearModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div
            className="modal-container"
            style={{
              maxWidth: '620px',
              width: '95%',
              background: 'var(--color-surface)',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              border: '1.5px solid var(--color-border)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)',
                color: 'white',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                    {lang === 'ar'
                      ? 'أرشيف نهاية العام الدراسي المرجعي'
                      : 'End-of-Year Reference Archive'}
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#bfdbfe' }}>
                    {lang === 'ar'
                      ? 'نسخة مرجعية شاملة يمكن فتحها والتعامل معها بدون إنترنت'
                      : 'Comprehensive reference copy that works completely offline'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isExportingYear && setShowYearModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Year Input */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  {lang === 'ar' ? 'العام الدراسي المرجعي:' : 'Academic Year Reference:'}
                </label>
                <input
                  type="text"
                  value={academicYearInput}
                  onChange={(e) => setAcademicYearInput(e.target.value)}
                  className="text-field"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                  placeholder="مثال: 2026-2027م"
                />
              </div>

              {/* Format Choice */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  {lang === 'ar' ? 'نوع وتنسيق النسخة المحفوظة:' : 'Archive Package Format:'}
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Option 1: Excel */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '10px',
                      border: archiveFormat === 'excel' ? '2px solid #16a34a' : '1px solid var(--color-border)',
                      background: archiveFormat === 'excel' ? 'rgba(22, 163, 74, 0.06)' : 'var(--color-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="archive_format"
                      checked={archiveFormat === 'excel'}
                      onChange={() => setArchiveFormat('excel')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📊 {lang === 'ar' ? 'مصنف إكسل كامل ومبوب (.xlsx) — مستحسن للبيانات' : 'Multi-Tab Excel Workbook (.xlsx) — Recommended'}
                      </strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {lang === 'ar'
                          ? 'ملف إكسل منظم ومنسق باللغة العربية (RTL) يحتوي على 7 أوراق عمل: الملخص العام، سجل الطلاب، أولياء الأمور، المعلمين، الشعب والفصول، كشف الدرجات والكنترول، والسجل المالي.'
                          : 'Complete RTL Excel spreadsheet with 7 distinct worksheets: Summary, Students, Parents, Teachers, Classes, Grades, and Finance.'}
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Full ZIP */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '10px',
                      border: archiveFormat === 'zip' ? '2px solid var(--color-primary-ui)' : '1px solid var(--color-border)',
                      background: archiveFormat === 'zip' ? 'rgba(37, 99, 235, 0.05)' : 'var(--color-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="archive_format"
                      checked={archiveFormat === 'zip'}
                      onChange={() => setArchiveFormat('zip')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '13.5px', color: 'var(--color-text-primary)' }}>
                        📦 {lang === 'ar' ? 'حزمة الأرشيف الشاملة المتكاملة (.zip)' : 'Complete Archive Package (.zip)'}
                      </strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {lang === 'ar'
                          ? 'الحزمة القصوى المتكاملة: تحتوي على ملف الإكسل المبوب + تطبيق الأرشيف التفاعلي المستقل (HTML) + قاعدة بيانات SQL الخام + ملفات JSON الشاملة.'
                          : 'All-in-one archive bundle: Excel workbook + Offline interactive HTML viewer + raw MySQL database backup + JSON data.'}
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Standalone HTML */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '10px',
                      border: archiveFormat === 'html' ? '2px solid #0284c7' : '1px solid var(--color-border)',
                      background: archiveFormat === 'html' ? 'rgba(2, 132, 199, 0.05)' : 'var(--color-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="archive_format"
                      checked={archiveFormat === 'html'}
                      onChange={() => setArchiveFormat('html')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '13.5px', color: 'var(--color-text-primary)' }}>
                        🌐 {lang === 'ar' ? 'ملف تطبيق أرشيف مستقل (.html) مباشر' : 'Single Standalone HTML Application (.html)'}
                      </strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {lang === 'ar'
                          ? 'ملف ويب واحد مستقل بنقرة زر يفتح مباشرة في أي كمبيوتر بدون فك ضغط ويعمل بدون إنترنت نهائياً مع إمكانية البحث والفرز والطباعة.'
                          : 'A single interactive file that opens directly in any browser without extraction and 100% offline capability.'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Instructions Notice */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '12px',
                  color: '#475569',
                  lineHeight: 1.6,
                }}
              >
                💡 <strong>{lang === 'ar' ? 'أين يمكنك حفظ هذه النسخة؟' : 'Where can you store this?'}</strong>
                <br />
                {lang === 'ar'
                  ? 'بمجرد النقر على الزر بالأسفل سيقوم المتصفح بتحميل النسخة مباشرة إلى جهازك، ويمكنك نقلها والاحتفاظ بها في أي قرص في اللابتوب أو فلاشة USB أو هارد ديسك خارجي كمرجع دائم للسنوات القادمة.'
                  : 'The file will be downloaded directly by your browser. You can save or copy it to any laptop drive, USB flash stick, or external hard drive.'}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                background: 'var(--color-surface-alt)',
              }}
            >
              <button
                type="button"
                className="btn-elevated"
                onClick={() => setShowYearModal(false)}
                disabled={isExportingYear}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                className="btn-filled"
                onClick={handleExportYearArchive}
                disabled={isExportingYear}
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)',
                  padding: '10px 22px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '700',
                }}
              >
                {isExportingYear ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{lang === 'ar' ? 'جاري تجهيز وتصدير الأرشيف...' : 'Exporting Archive...'}</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>{lang === 'ar' ? 'تصدير وحفظ النسخة المرجعية الآن' : 'Export & Save Archive Now'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
