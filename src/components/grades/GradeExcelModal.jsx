import React, { useState, useRef } from 'react';
import { api } from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  RefreshCw,
  Info,
  ChevronRight
} from 'lucide-react';

export default function GradeExcelModal({
  isOpen,
  onClose,
  selectedClassId,
  selectedClassName,
  selectedTerm = 'term1',
  lang = 'ar',
  onImportSuccess
}) {
  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'success'
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successStats, setSuccessStats] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const termNumeric = selectedTerm === 'term2' || selectedTerm === '2' ? 2 : 1;
  const termLabel = termNumeric === 1
    ? (lang === 'ar' ? 'الفصل الدراسي الأول' : 'Term 1')
    : (lang === 'ar' ? 'الفصل الدراسي الثاني' : 'Term 2');

  // 1. Export Template
  const handleExportTemplate = async () => {
    if (!selectedClassId) {
      alert(lang === 'ar' ? 'يرجى تحديد الشعبة أولاً' : 'Please select a class first');
      return;
    }
    try {
      setIsExporting(true);
      const res = await api.get(`/api/grades/excel/template?class_id=${selectedClassId}&term=${termNumeric}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.message || (lang === 'ar' ? 'فشل تصدير القالب' : 'Failed to export template'));
        setIsExporting(false);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `قالب_رصد_درجات_${selectedClassName || 'شعبة'}_فصل_${termNumeric}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert(lang === 'ar' ? 'حدث خطأ أثناء تحميل القالب' : 'Error downloading template');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Handle File Drop / Select
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setErrorMessage('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setErrorMessage('');
    }
  };

  // 3. Upload & Preview
  const handlePreview = async () => {
    if (!file) {
      setErrorMessage(lang === 'ar' ? 'يرجى اختيار ملف الإكسل أولاً' : 'Please select an Excel file first');
      return;
    }
    if (!selectedClassId) {
      setErrorMessage(lang === 'ar' ? 'يرجى تحديد الشعبة' : 'Please select a class');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('class_id', selectedClassId);
      formData.append('term', termNumeric);

      const res = await api.post('/api/grades/excel/preview', formData);
      if (!res.success) {
        setErrorMessage(res.message || (lang === 'ar' ? 'فشل تحليل الملف' : 'Failed to parse file'));
        setIsLoading(false);
        return;
      }

      setPreviewData(res);
      setStep('preview');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || (lang === 'ar' ? 'حدث خطأ في الاتصال بالخادم' : 'Server connection error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Confirm Import
  const handleConfirm = async () => {
    if (!previewData?.import_token) return;

    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await api.post('/api/grades/excel/confirm', {
        import_token: previewData.import_token,
        overwrite_existing: overwriteExisting
      });

      if (!res.success) {
        setErrorMessage(res.message || (lang === 'ar' ? 'فشل حفظ الدرجات' : 'Failed to save grades'));
        setIsLoading(false);
        return;
      }

      setSuccessStats(res.stats);
      setStep('success');
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || (lang === 'ar' ? 'حدث خطأ أثناء حفظ الدرجات' : 'Error saving grades'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setPreviewData(null);
    setErrorMessage('');
    setSuccessStats(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface, #ffffff)',
          color: 'var(--color-text-primary, #0f172a)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: step === 'preview' ? '1050px' : '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                {lang === 'ar' ? 'استيراد وتصدير كشوفات الدرجات (Excel)' : 'Grade Import & Export (Excel)'}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                {selectedClassName} • {termLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '18px'
              }}
            >
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD & DOWNLOAD TEMPLATE */}
          {step === 'upload' && (
            <div>
              {/* Option A: Download template banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '22px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb'
                    }}
                  >
                    <Download size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1e3a8a' }}>
                      {lang === 'ar' ? 'تصدير قالب الرصد الرسمي للشعبة' : 'Export Official Grade Template'}
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#475569' }}>
                      {lang === 'ar'
                        ? 'يحتوي القالب على أسماء الطلاب مرتبة أبجدياً (أ-ي) والمواد المسندة، لتعبئته بسهولة.'
                        : 'Template has student names sorted alphabetically with exact subject columns.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportTemplate}
                  disabled={isExporting}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: '#1d4ed8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)'
                  }}
                >
                  {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                  {lang === 'ar' ? 'تحميل القالب (.xlsx)' : 'Download (.xlsx)'}
                </button>
              </div>

              {/* Option B: File Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? '#10b981' : '#cbd5e1'}`,
                  backgroundColor: isDragging ? '#f0fdf4' : '#f8fafc',
                  borderRadius: '16px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: file ? '#dcfce7' : '#e2e8f0',
                    color: file ? '#15803d' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: file ? '0 4px 12px rgba(22, 163, 74, 0.2)' : 'none'
                  }}
                >
                  {file ? <FileCheck size={28} /> : <Upload size={28} />}
                </div>

                {file ? (
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#166534' }}>
                      {file.name}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {(file.size / 1024).toFixed(1)} KB • {lang === 'ar' ? 'انقر لتغيير الملف' : 'Click to change file'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '15px' }}>
                      {lang === 'ar' ? 'اسحب ملف الإكسل هنا، أو انقر للاختيار' : 'Drag & drop Excel file here, or click to browse'}
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {lang === 'ar'
                        ? 'يدعم ملفات قالب النظام أو ملف كشوفات المدرسة المعتمد (.xlsx, .xls)'
                        : 'Supports system template or school master sheet (.xlsx, .xls)'}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#3b82f6' }} />
                <span>
                  {lang === 'ar'
                    ? 'الأمان التام: لن يتم تعديل أو حفظ أي درجة مباشرة، بل ستظهر لك شاشة معاينة ذكية لمطابقة الطلاب والتحقق من الدرجات قبل الحفظ النهائي.'
                    : 'Complete safety: No data is saved immediately. A full preview will be presented to confirm matched students and validated grades before saving.'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION */}
          {step === 'preview' && previewData && (
            <div>
              {/* Summary Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#166534' }}>
                    {previewData.summary?.matched_students || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '600', marginTop: '2px' }}>
                    {lang === 'ar' ? 'طلاب مطابقون' : 'Matched Students'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e40af' }}>
                    {previewData.summary?.total_grades || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>
                    {lang === 'ar' ? 'إجمالي الدرجات' : 'Total Grades'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f766e' }}>
                    {previewData.summary?.new_grades || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0d9488', fontWeight: '600', marginTop: '2px' }}>
                    {lang === 'ar' ? 'درجات جديدة' : 'New Grades'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#b45309' }}>
                    {previewData.summary?.update_grades || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#d97706', fontWeight: '600', marginTop: '2px' }}>
                    {lang === 'ar' ? 'ستُحدّث' : 'Will Update'}
                  </div>
                </div>

                {previewData.summary?.unmatched_rows > 0 && (
                  <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#c2410c' }}>
                      {previewData.summary?.unmatched_rows}
                    </div>
                    <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: '600', marginTop: '2px' }}>
                      {lang === 'ar' ? 'غير مسجلين (تخطي)' : 'Unmatched'}
                    </div>
                  </div>
                )}
              </div>

              {/* Warnings List */}
              {previewData.warnings && previewData.warnings.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    maxHeight: '90px',
                    overflowY: 'auto'
                  }}
                >
                  <p style={{ margin: '0 0 6px', fontWeight: '700', fontSize: '12px', color: '#b45309' }}>
                    ⚠️ {lang === 'ar' ? 'ملاحظات وتنبيهات الاستيراد:' : 'Import Notices:'}
                  </p>
                  <ul style={{ margin: 0, paddingInlineStart: '18px', fontSize: '12px', color: '#92400e' }}>
                    {previewData.warnings.slice(0, 5).map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                    {previewData.warnings.length > 5 && (
                      <li>... {lang === 'ar' ? `و ${previewData.warnings.length - 5} تنبيهات أخرى تم تخطيها بأمان.` : `and ${previewData.warnings.length - 5} more notices skipped.`}</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Overwrite Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>
                    {lang === 'ar' ? 'تحديث الدرجات السابقة المسجلة' : 'Overwrite Existing Grades'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {lang === 'ar'
                      ? 'عند التفعيل، سيتم استبدال أي درجة قديمة بالقيمة الجديدة في الملف.'
                      : 'When enabled, existing grades for matched students will be replaced with new values.'}
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: overwriteExisting ? '#10b981' : '#cbd5e1',
                      borderRadius: '26px',
                      transition: '0.3s'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      content: '""',
                      height: '20px',
                      width: '20px',
                      left: overwriteExisting ? '25px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </label>
              </div>

              {/* Students Preview Table */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  maxHeight: '340px',
                  overflow: 'auto',
                  backgroundColor: 'white'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9', zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #cbd5e1', width: '50px' }}>#</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #cbd5e1', minWidth: '180px' }}>
                        {lang === 'ar' ? 'اسم الطالب' : 'Student Name'}
                      </th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #cbd5e1', width: '80px' }}>
                        {lang === 'ar' ? 'الحالة' : 'Status'}
                      </th>
                      {(previewData.subjects || []).map((sub) => (
                        <th
                          key={sub.id}
                          style={{
                            padding: '10px 12px',
                            textAlign: 'center',
                            borderBottom: '1px solid #cbd5e1',
                            minWidth: '110px'
                          }}
                        >
                          <div>{sub.name_ar}</div>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>
                            {lang === 'ar' ? 'أعمال | اختبار' : 'Work | Exam'}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(previewData.rows || []).map((row, index) => {
                      const gradeMap = {};
                      (row.grades || []).forEach(g => { gradeMap[g.subject_id] = g; });

                      return (
                        <tr
                          key={row.student_id}
                          style={{
                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                            borderBottom: '1px solid #f1f5f9'
                          }}
                        >
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: '600' }}>
                            {row.student_name}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: row.status === 'ready' ? '#dcfce7' : '#fee2e2',
                                color: row.status === 'ready' ? '#15803d' : '#b91c1c'
                              }}
                            >
                              {row.status === 'ready' ? (lang === 'ar' ? 'جاهز' : 'Ready') : (lang === 'ar' ? 'خطأ' : 'Error')}
                            </span>
                          </td>
                          {(previewData.subjects || []).map((sub) => {
                            const g = gradeMap[sub.id];
                            return (
                              <td key={sub.id} style={{ padding: '8px 12px', textAlign: 'center' }}>
                                {g ? (
                                  <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                                    <span style={{ color: '#0f766e' }}>{g.work !== null ? g.work : '—'}</span>
                                    <span style={{ color: '#cbd5e1', margin: '0 4px' }}>/</span>
                                    <span style={{ color: '#2563eb' }}>{g.exam !== null ? g.exam : '—'}</span>
                                  </span>
                                ) : (
                                  <span style={{ color: '#cbd5e1' }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 16px rgba(22, 163, 74, 0.2)'
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#166534' }}>
                {lang === 'ar' ? 'تم استيراد وحفظ الدرجات بنجاح!' : 'Grades Successfully Imported!'}
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>
                {lang === 'ar'
                  ? 'تم تحديث سجلات الدرجات وحساب محصلة الفصل والتقارير والشهادات بأمان تام.'
                  : 'Grades and coursework have been safely saved and synchronized.'}
              </p>

              {successStats && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    marginBottom: '24px',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 18px', borderRadius: '10px' }}>
                    <span style={{ color: '#64748b' }}>{lang === 'ar' ? 'درجات جديدة: ' : 'New: '}</span>
                    <strong style={{ color: '#166534' }}>{successStats.inserted || 0}</strong>
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 18px', borderRadius: '10px' }}>
                    <span style={{ color: '#64748b' }}>{lang === 'ar' ? 'درجات محدثة: ' : 'Updated: '}</span>
                    <strong style={{ color: '#1e40af' }}>{successStats.updated || 0}</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 28px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {lang === 'ar' ? 'تم، إغلاق النافذة' : 'Done, Close Window'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step !== 'success' && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}
          >
            {step === 'preview' ? (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                {lang === 'ar' ? '← اختيار ملف آخر' : '← Choose another file'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            )}

            {step === 'upload' ? (
              <button
                type="button"
                onClick={handlePreview}
                disabled={!file || isLoading}
                style={{
                  padding: '10px 24px',
                  backgroundColor: file && !isLoading ? '#10b981' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: file && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: file ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                {lang === 'ar' ? 'معاينة والتحقق من الدرجات' : 'Preview & Validate'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                style={{
                  padding: '10px 26px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {lang === 'ar' ? 'تأكيد وحفظ الدرجات في النظام' : 'Confirm & Save Grades'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
