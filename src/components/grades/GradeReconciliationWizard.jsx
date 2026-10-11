import React, { useState, useRef, useMemo } from 'react';
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
  ChevronRight,
  ChevronLeft,
  Link2,
  Unlink,
  Search,
  Filter,
  Check,
  Edit2,
  Trash2,
  Layers,
  ArrowRight,
  Eye,
  HelpCircle,
  UserCheck,
  UserX,
  Users
} from 'lucide-react';

export default function GradeReconciliationWizard({
  isOpen,
  onClose,
  selectedClassId,
  selectedClassName,
  selectedTerm = 'term1',
  lang = 'ar',
  onImportSuccess
}) {
  // Wizard Steps: 1: 'file', 2: 'mapping', 3: 'reconciliation', 4: 'commit', 5: 'success'
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1 State: File & Sheet
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileToken, setFileToken] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const fileInputRef = useRef(null);

  // Step 2 State: Column & Subject Mapping
  const [headerRowInfo, setHeaderRowInfo] = useState(null);
  const [nameCol, setNameCol] = useState(3);
  const [codeCol, setCodeCol] = useState(null);
  const [idCol, setIdCol] = useState(null);
  const [subjectMappings, setSubjectMappings] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);
  const [showSamplePreview, setShowSamplePreview] = useState(false);

  // Step 3 State: Reconciliation
  const [reconciledRows, setReconciledRows] = useState([]);
  const [missingClassStudents, setMissingClassStudents] = useState([]);
  const [allClassStudents, setAllClassStudents] = useState([]);
  const [reconSummary, setReconSummary] = useState(null);
  const [reconFilter, setReconFilter] = useState('all'); // 'all' | 'matched' | 'unmatched' | 'excluded' | 'missing'
  const [reconSearch, setReconSearch] = useState('');
  const [activeStudentLinkModal, setActiveStudentLinkModal] = useState(null); // row_id being linked

  // Step 4 State: Commit Options & Success
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [commitStats, setCommitStats] = useState(null);

  const termNumeric = selectedTerm === 'term2' || selectedTerm === '2' ? 2 : 1;
  const termLabel = termNumeric === 1
    ? (lang === 'ar' ? 'الفصل الدراسي الأول' : 'Term 1')
    : (lang === 'ar' ? 'الفصل الدراسي الثاني' : 'Term 2');

  // ==========================================
  // HANDLERS FOR STEP 1: UPLOAD & INSPECT
  // ==========================================
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

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setErrorMessage('');
    }
  };

  const handleInspectFile = async () => {
    if (!file) {
      setErrorMessage(lang === 'ar' ? 'يرجى اختيار ملف الإكسل' : 'Please select an Excel file');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('file', file);
      if (selectedClassId) {
        formData.append('class_id', selectedClassId);
      }

      const res = await api.post('/api/grades/excel/inspect', formData);
      if (!res.success) {
        setErrorMessage(res.message || (lang === 'ar' ? 'فشل فحص الملف' : 'Failed to inspect file'));
        setIsLoading(false);
        return;
      }

      setFileToken(res.file_token);
      setAvailableSheets(res.sheets || []);
      setSelectedSheet(res.recommended_sheet || res.sheets?.[0] || '');

      // Automatically proceed to fetch mappings for the recommended sheet
      await fetchColumnMappings(res.file_token, res.recommended_sheet || res.sheets?.[0]);
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || (lang === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error'));
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HANDLERS FOR STEP 2: COLUMN & SUBJECT MAPPING
  // ==========================================
  const fetchColumnMappings = async (tokenToUse, sheetToUse) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await api.post('/api/grades/excel/map-columns', {
        file_token: tokenToUse || fileToken,
        sheet_name: sheetToUse || selectedSheet,
        class_id: selectedClassId,
        term: termNumeric
      });

      if (!res.success) {
        setErrorMessage(res.message || (lang === 'ar' ? 'فشل استخراج الأعمدة' : 'Failed to map columns'));
        setIsLoading(false);
        return;
      }

      setHeaderRowInfo(res.header_row);
      setNameCol(res.name_col);
      setCodeCol(res.code_col);
      setIdCol(res.id_col);
      setSubjectMappings(res.mappings || []);
      setAvailableSubjects(res.available_subjects || []);
      setSampleRows(res.sample_rows || []);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || (lang === 'ar' ? 'حدث خطأ في تحليل الأعمدة' : 'Column mapping error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetChange = async (newSheet) => {
    setSelectedSheet(newSheet);
    if (fileToken) {
      await fetchColumnMappings(fileToken, newSheet);
    }
  };

  const updateSubjectMapping = (index, field, value) => {
    setSubjectMappings(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Proceed to Step 3: Run Reconciliation
  const handleProceedToReconciliation = async () => {
    const includedMappings = subjectMappings.filter(m => m.is_included);
    if (includedMappings.length === 0) {
      setErrorMessage(lang === 'ar' ? 'يرجى تضمين مادة واحدة على الأقل للاستيراد' : 'Please include at least one subject');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await api.post('/api/grades/excel/reconcile', {
        file_token: fileToken,
        sheet_name: selectedSheet,
        class_id: selectedClassId,
        term: termNumeric,
        mappings: subjectMappings,
        name_col: nameCol,
        code_col: codeCol,
        id_col: idCol,
        header_row: headerRowInfo
      });

      if (!res.success) {
        setErrorMessage(res.message || (lang === 'ar' ? 'فشلت تسوية البيانات' : 'Reconciliation failed'));
        setIsLoading(false);
        return;
      }

      setReconciledRows(res.rows || []);
      setMissingClassStudents(res.missing_students || []);
      setAllClassStudents(res.all_class_students || []);
      setReconSummary(res.summary);
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || (lang === 'ar' ? 'حدث خطأ أثناء التسوية' : 'Reconciliation error'));
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HANDLERS FOR STEP 3: RECONCILIATION EDITING
  // ==========================================
  const toggleRowInclusion = (rowId) => {
    setReconciledRows(prev =>
      prev.map(r => r.row_id === rowId ? { ...r, is_included: !r.is_included } : r)
    );
  };

  const unlinkStudent = (rowId) => {
    setReconciledRows(prev =>
      prev.map(r => r.row_id === rowId ? { ...r, matched_student: null, match_confidence: 'none', is_included: false } : r)
    );
  };

  const linkStudentToRow = (rowId, studentObj) => {
    setReconciledRows(prev =>
      prev.map(r => {
        if (r.row_id === rowId) {
          return {
            ...r,
            matched_student: studentObj,
            match_confidence: 'manual',
            is_included: true
          };
        }
        return r;
      })
    );
    setActiveStudentLinkModal(null);
  };

  const handleGradeChange = (rowId, subjectId, gradeType, newVal) => {
    setReconciledRows(prev =>
      prev.map(r => {
        if (r.row_id === rowId) {
          const currentGrades = { ...r.grades };
          if (currentGrades[subjectId]) {
            const numVal = newVal === '' ? null : parseFloat(newVal);
            const maxVal = gradeType === 'work' ? 20 : 30;
            const hasError = numVal !== null && (isNaN(numVal) || numVal < 0 || numVal > maxVal);

            currentGrades[subjectId] = {
              ...currentGrades[subjectId],
              [gradeType]: numVal,
              [`${gradeType}_error`]: hasError ? `الدرجة يجب أن تكون بين 0 و ${maxVal}` : null
            };
          }
          return { ...r, grades: currentGrades };
        }
        return r;
      })
    );
  };

  // Filtered rows for Reconciliation view
  const filteredRows = useMemo(() => {
    return reconciledRows.filter(row => {
      // 1. Tab filter
      if (reconFilter === 'matched' && (!row.matched_student || !row.is_included)) return false;
      if (reconFilter === 'unmatched' && row.matched_student !== null) return false;
      if (reconFilter === 'excluded' && row.is_included) return false;

      // 2. Search query filter
      if (reconSearch.trim()) {
        const q = reconSearch.toLowerCase().trim();
        const excelName = (row.excel_name || '').toLowerCase();
        const sysName = (row.matched_student?.name_ar || '').toLowerCase();
        const code = (row.excel_code || row.matched_student?.student_code || '').toLowerCase();
        return excelName.includes(q) || sysName.includes(q) || code.includes(q);
      }
      return true;
    });
  }, [reconciledRows, reconFilter, reconSearch]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const total = reconciledRows.length;
    const matched = reconciledRows.filter(r => r.matched_student !== null && r.is_included).length;
    const unmatched = reconciledRows.filter(r => r.matched_student === null).length;
    const excluded = reconciledRows.filter(r => !r.is_included && r.matched_student !== null).length;
    const missing = missingClassStudents.length;
    return { total, matched, unmatched, excluded, missing };
  }, [reconciledRows, missingClassStudents]);

  // ==========================================
  // HANDLERS FOR STEP 4: COMMIT
  // ==========================================
  const handleFinalCommit = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await api.post('/api/grades/excel/commit', {
        class_id: selectedClassId,
        term: termNumeric,
        overwrite_existing: overwriteExisting,
        rows: reconciledRows
      });

      if (!res.success) {
        setErrorMessage(res.message || (lang === 'ar' ? 'فشل حفظ الدرجات' : 'Failed to commit grades'));
        setIsLoading(false);
        return;
      }

      setCommitStats(res.stats);
      setCurrentStep(5);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || (lang === 'ar' ? 'حدث خطأ أثناء اعتماد الدرجات' : 'Commit error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAll = () => {
    setCurrentStep(1);
    setFile(null);
    setFileToken(null);
    setAvailableSheets([]);
    setSelectedSheet('');
    setSubjectMappings([]);
    setReconciledRows([]);
    setMissingClassStudents([]);
    setErrorMessage('');
    setCommitStats(null);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          width: '100%',
          maxWidth: currentStep === 3 ? '1280px' : (currentStep === 2 ? '950px' : '720px'),
          height: currentStep === 3 ? '92vh' : 'auto',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(226, 232, 240, 0.9)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Stepper */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Layers size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  {lang === 'ar' ? 'معالج تسوية ومطابقة درجات الإكسل' : 'Grade Reconciliation & Mapping Wizard'}
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
                display: 'flex',
                transition: 'color 0.2s'
              }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Stepper Indicator */}
          {currentStep <= 4 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
              {[
                { num: 1, title: lang === 'ar' ? '1. رفع الملف والورقة' : '1. File & Sheet' },
                { num: 2, title: lang === 'ar' ? '2. مطابقة المواد' : '2. Subject Mapping' },
                { num: 3, title: lang === 'ar' ? '3. تسوية الطلاب والدرجات' : '3. Reconciliation' },
                { num: 4, title: lang === 'ar' ? '4. الاعتماد النهائي' : '4. Final Review' }
              ].map((s, idx) => {
                const isActive = currentStep === s.num;
                const isPassed = currentStep > s.num;

                return (
                  <React.Fragment key={s.num}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: isActive ? '#059669' : (isPassed ? '#10b981' : '#94a3b8'),
                        fontWeight: isActive ? '700' : '500',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: isActive ? '#10b981' : (isPassed ? '#dcfce7' : '#f1f5f9'),
                          color: isActive ? 'white' : (isPassed ? '#15803d' : '#64748b')
                        }}
                      >
                        {isPassed ? <Check size={14} /> : s.num}
                      </div>
                      <span>{s.title}</span>
                    </div>
                    {idx < 3 && (
                      <div
                        style={{
                          flex: 1,
                          height: '2px',
                          backgroundColor: isPassed ? '#10b981' : '#e2e8f0',
                          borderRadius: '2px',
                          transition: 'backgroundColor 0.3s'
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Wizard Main Content Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {errorMessage && (
            <div
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '18px'
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: FILE UPLOAD & TEMPLATE DOWNLOAD & SHEET SELECTOR */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Template Download Option */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #eff6ff)',
                  border: '1px solid #bbf7d0',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#16a34a'
                    }}
                  >
                    <Download size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#166534' }}>
                      {lang === 'ar' ? 'تحميل قالب الإكسل الرسمي للشعبة' : 'Download Class Excel Template'}
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#475569' }}>
                      {lang === 'ar'
                        ? 'قالب منسق وجاهز بأسماء طلاب الشعبة مرتبة أبجدياً (أ-ي) والمواد المسندة لتعبئتها مباشرة.'
                        : 'Pre-formatted template with students sorted alphabetically and assigned subjects.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportTemplate}
                  disabled={isExporting}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  {isExporting ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
                  {lang === 'ar' ? 'تحميل القالب (.xlsx)' : 'Download Template'}
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? '#10b981' : (file ? '#10b981' : '#cbd5e1')}`,
                  backgroundColor: isDragging ? '#f0fdf4' : (file ? '#f8fafc' : '#f8fafc'),
                  borderRadius: '18px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const sel = e.target.files?.[0];
                    if (sel) { setFile(sel); setErrorMessage(''); }
                  }}
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: file ? '#dcfce7' : '#e2e8f0',
                    color: file ? '#15803d' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: file ? '0 4px 14px rgba(22, 163, 74, 0.25)' : 'none'
                  }}
                >
                  {file ? <FileCheck size={32} /> : <Upload size={30} />}
                </div>

                {file ? (
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#166534' }}>
                      {file.name}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {(file.size / 1024).toFixed(1)} KB • {lang === 'ar' ? 'جاهز للفحص (انقر لتغيير الملف)' : 'Ready to inspect'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>
                      {lang === 'ar' ? 'اسحب كشف درجات المدرسة أو القالب هنا' : 'Drop grades sheet or template here'}
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {lang === 'ar'
                        ? 'يدعم ملفات الإكسل (.xlsx, .xls) سواء بصفحة واحدة أو متعددة الصفحات (مثل كشوفات الرصد).'
                        : 'Supports single-sheet or multi-sheet workbooks (.xlsx, .xls)'}
                    </p>
                  </div>
                )}
              </div>

              {/* Safety reassurance */}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Info size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <span>
                  {lang === 'ar'
                    ? 'الأمان وضمان البيانات: هذا المعالج يتيح لك معاينة وتعديل وتوفيق كل اسم وكل درجة قبل حفظها نهائياً في النظام.'
                    : 'Data guarantee: You will be able to review, link, adjust, and reconcile every student and grade before saving.'}
                </span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: COLUMN & SUBJECT MAPPING & SHEET SELECTOR */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Sheet Selector Bar (if multi-sheet) */}
              {availableSheets.length > 1 && (
                <div
                  style={{
                    padding: '14px 18px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} style={{ color: '#059669' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>
                      {lang === 'ar' ? 'ورقة العمل المختارة في الملف:' : 'Selected Sheet:'}
                    </span>
                  </div>

                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    disabled={isLoading}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {availableSheets.map(sh => (
                      <option key={sh} value={sh}>
                        {sh} {sh === selectedSheet ? ` (${lang === 'ar' ? 'المقترحة للشعبة' : 'Recommended'})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Instructions header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
                    {lang === 'ar' ? 'مطابقة المواد والأعمدة المكتشفة' : 'Matched Subjects & Columns'}
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                    {lang === 'ar'
                      ? 'تم ربط الأعمدة بمواد النظام تلقائياً. يمكنك تغيير ربط أي مادة، أو إلغاء تضمينها من الاستيراد.'
                      : 'Columns were automatically mapped to subjects. You can modify any mapping or exclude columns.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSamplePreview(!showSamplePreview)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Eye size={14} />
                  {showSamplePreview
                    ? (lang === 'ar' ? 'إخفاء المعاينة الأولية' : 'Hide Sample')
                    : (lang === 'ar' ? 'معاينة 3 أسطر نموذجية' : 'Preview 3 Rows')}
                </button>
              </div>

              {/* Collapsible Sample Preview */}
              {showSamplePreview && sampleRows.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '11px',
                    overflowX: 'auto'
                  }}
                >
                  <div style={{ fontWeight: '700', marginBottom: '8px', color: '#475569' }}>
                    {lang === 'ar' ? 'عينة من أول 3 صفوف في ورقة الإكسل:' : 'Sample of first 3 rows in sheet:'}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e2e8f0' }}>
                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                        {subjectMappings.filter(m => m.is_included).map(m => (
                          <th key={m.subject_id} style={{ padding: '6px 10px', textAlign: 'center' }}>
                            {m.subject_name} ({lang === 'ar' ? 'م1 | ن1' : 'Work | Exam'})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleRows.map((sr, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                          <td style={{ padding: '6px 10px', fontWeight: '600' }}>{sr.excel_name}</td>
                          {subjectMappings.filter(m => m.is_included).map(m => {
                            const c = sr.cells[m.subject_id];
                            return (
                              <td key={m.subject_id} style={{ padding: '6px 10px', textAlign: 'center', fontFamily: 'monospace' }}>
                                {c ? `${c.work ?? '—'} | ${c.exam ?? '—'}` : '—'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Subject Mapping Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '14px',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  padding: '2px'
                }}
              >
                {subjectMappings.map((mapItem, idx) => (
                  <div
                    key={mapItem.subject_id}
                    style={{
                      border: `1.5px solid ${mapItem.is_included ? '#10b981' : '#cbd5e1'}`,
                      backgroundColor: mapItem.is_included ? '#ffffff' : '#f8fafc',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: mapItem.is_included ? '0 2px 8px rgba(16, 185, 129, 0.08)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: mapItem.is_included ? '#10b981' : '#94a3b8'
                          }}
                        />
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {lang === 'ar' ? 'العمود في الإكسل:' : 'Excel Header:'}
                        </span>
                        <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                          {mapItem.header_text}
                        </strong>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        <input
                          type="checkbox"
                          checked={mapItem.is_included}
                          onChange={(e) => updateSubjectMapping(idx, 'is_included', e.target.checked)}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span style={{ color: mapItem.is_included ? '#15803d' : '#94a3b8', fontWeight: '600' }}>
                          {mapItem.is_included ? (lang === 'ar' ? 'تضمين' : 'Include') : (lang === 'ar' ? 'تجاهل' : 'Ignore')}
                        </span>
                      </label>
                    </div>

                    {/* Target Subject Selector */}
                    {mapItem.is_included && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          {lang === 'ar' ? 'ربط مع مادة النظام:' : 'Link to System Subject:'}
                        </label>
                        <select
                          value={mapItem.subject_id}
                          onChange={(e) => {
                            const newSubId = parseInt(e.target.value);
                            const foundSub = availableSubjects.find(s => s.id === newSubId);
                            updateSubjectMapping(idx, 'subject_id', newSubId);
                            if (foundSub) {
                              updateSubjectMapping(idx, 'subject_name', foundSub.name_ar);
                            }
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            fontWeight: '600',
                            backgroundColor: '#f8fafc',
                            width: '100%'
                          }}
                        >
                          {availableSubjects.map(sub => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name_ar} {sub.is_assigned ? ` ★ (${lang === 'ar' ? 'مسندة للشعبة' : 'Assigned'})` : ''}
                            </option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                          <span>أعمال (م1): عمود {mapItem.work_col || '—'}</span>
                          <span>اختبار (ن1): عمود {mapItem.exam_col || '—'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: INTERACTIVE STUDENT RECONCILIATION ENGINE */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0 }}>
              {/* Reconciliation Filter Tabs & Search */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                  {[
                    { id: 'all', label: lang === 'ar' ? 'جميع الصفوف' : 'All', count: tabCounts.total },
                    { id: 'matched', label: lang === 'ar' ? 'مطابقون' : 'Matched', count: tabCounts.matched, color: '#16a34a' },
                    { id: 'unmatched', label: lang === 'ar' ? 'يحتاج مراجعة' : 'Unmatched', count: tabCounts.unmatched, color: '#ea580c' },
                    { id: 'excluded', label: lang === 'ar' ? 'مستبعدون' : 'Excluded', count: tabCounts.excluded, color: '#64748b' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReconFilter(tab.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: reconFilter === tab.id ? '#ffffff' : 'transparent',
                        color: reconFilter === tab.id ? (tab.color || '#0f172a') : '#64748b',
                        boxShadow: reconFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span
                        style={{
                          backgroundColor: reconFilter === tab.id ? (tab.color ? `${tab.color}15` : '#f1f5f9') : '#e2e8f0',
                          color: tab.color || '#475569',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontSize: '10px'
                        }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search in Reconciliation */}
                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={15} style={{ position: 'absolute', right: '12px', top: '10px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={reconSearch}
                    onChange={(e) => setReconSearch(e.target.value)}
                    placeholder={lang === 'ar' ? 'بحث عن طالب في الكشف...' : 'Search student...'}
                    style={{
                      width: '100%',
                      padding: '7px 34px 7px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Missing Class Students Notice (Students in DB not in sheet) */}
              {missingClassStudents.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af' }}>
                    <Info size={16} />
                    <span>
                      {lang === 'ar'
                        ? `تنبيه: يوجد ${missingClassStudents.length} طلاب مسجلين في الشعبة بالنظام لم تظهر لهم أسماء في هذا الكشف:`
                        : `Notice: ${missingClassStudents.length} students enrolled in class were not found in this sheet:`}
                      {' '}
                      <strong>{missingClassStudents.map(s => s.name_ar).slice(0, 3).join('، ')}</strong>
                      {missingClassStudents.length > 3 && ` و ${missingClassStudents.length - 3} آخرين.`}
                    </span>
                  </div>
                </div>
              )}

              {/* Interactive Reconciliation Grid */}
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '14px',
                  flex: 1,
                  overflow: 'auto',
                  backgroundColor: 'white',
                  minHeight: '260px'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9', zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1.5px solid #cbd5e1', width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={reconciledRows.length > 0 && reconciledRows.every(r => r.is_included)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setReconciledRows(prev => prev.map(r => ({ ...r, is_included: checked && r.matched_student !== null })));
                          }}
                          style={{ accentColor: '#10b981' }}
                        />
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1.5px solid #cbd5e1', minWidth: '170px' }}>
                        {lang === 'ar' ? 'الاسم في الإكسل' : 'Excel Name'}
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1.5px solid #cbd5e1', minWidth: '220px' }}>
                        {lang === 'ar' ? 'الطالب المطابق في النظام' : 'Matched System Student'}
                      </th>
                      <th style={{ padding: '10px 10px', textAlign: 'center', borderBottom: '1.5px solid #cbd5e1', width: '80px' }}>
                        {lang === 'ar' ? 'الربط' : 'Link'}
                      </th>
                      {subjectMappings.filter(m => m.is_included).map(sub => (
                        <th
                          key={sub.subject_id}
                          style={{
                            padding: '8px 12px',
                            textAlign: 'center',
                            borderBottom: '1.5px solid #cbd5e1',
                            minWidth: '120px'
                          }}
                        >
                          <div style={{ fontWeight: '700' }}>{sub.subject_name}</div>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>
                            أعمال (20) | اختبار (30)
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, idx) => {
                      const isMatched = row.matched_student !== null;

                      return (
                        <tr
                          key={row.row_id}
                          style={{
                            backgroundColor: !row.is_included ? '#f8fafc' : (idx % 2 === 0 ? '#ffffff' : '#fdfdfe'),
                            borderBottom: '1px solid #f1f5f9',
                            opacity: !row.is_included ? 0.65 : 1,
                            transition: 'all 0.15s'
                          }}
                        >
                          {/* Inclusion Checkbox */}
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={row.is_included}
                              disabled={!isMatched}
                              onChange={() => toggleRowInclusion(row.row_id)}
                              style={{ accentColor: '#10b981', cursor: isMatched ? 'pointer' : 'not-allowed' }}
                            />
                          </td>

                          {/* Excel Row Info */}
                          <td style={{ padding: '8px 14px' }}>
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>
                              {row.excel_name}
                            </div>
                            {row.excel_code && (
                              <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                                رقم: {row.excel_code}
                              </div>
                            )}
                          </td>

                          {/* Matched System Student */}
                          <td style={{ padding: '8px 14px' }}>
                            {isMatched ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <UserCheck size={14} />
                                    <span>{row.matched_student.name_ar}</span>
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                                    كود: {row.matched_student.student_code}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveStudentLinkModal(row.row_id)}
                                  style={{
                                    padding: '3px 8px',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    color: '#475569',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {lang === 'ar' ? 'تغيير' : 'Change'}
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: '#ea580c', fontWeight: '600', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <UserX size={14} />
                                  {lang === 'ar' ? 'غير مطابق' : 'Unmatched'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveStudentLinkModal(row.row_id)}
                                  style={{
                                    padding: '3px 10px',
                                    backgroundColor: '#ea580c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {lang === 'ar' ? 'ربط الآن' : 'Link'}
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Unlink Action */}
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            {isMatched ? (
                              <button
                                type="button"
                                onClick={() => unlinkStudent(row.row_id)}
                                title={lang === 'ar' ? 'إلغاء الربط واستبعاد' : 'Unlink & Exclude'}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#94a3b8',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '6px'
                                }}
                              >
                                <Unlink size={16} />
                              </button>
                            ) : (
                              <span style={{ color: '#cbd5e1' }}>—</span>
                            )}
                          </td>

                          {/* Editable Grade Inputs for Each Subject */}
                          {subjectMappings.filter(m => m.is_included).map(sub => {
                            const g = row.grades[sub.subject_id] || {};
                            const hasError = g.work_error || g.exam_error;

                            return (
                              <td key={sub.subject_id} style={{ padding: '6px 8px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                  {/* Work Grade Input */}
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                    disabled={!row.is_included}
                                    value={g.work ?? ''}
                                    onChange={(e) => handleGradeChange(row.row_id, sub.subject_id, 'work', e.target.value)}
                                    placeholder="م1"
                                    style={{
                                      width: '46px',
                                      padding: '3px 4px',
                                      textAlign: 'center',
                                      borderRadius: '6px',
                                      border: `1px solid ${g.work_error ? '#ef4444' : '#cbd5e1'}`,
                                      backgroundColor: g.work_error ? '#fee2e2' : '#ffffff',
                                      fontSize: '12px',
                                      fontFamily: 'monospace',
                                      fontWeight: '600',
                                      color: '#0f766e'
                                    }}
                                  />
                                  <span style={{ color: '#cbd5e1', fontSize: '10px' }}>/</span>
                                  {/* Exam Grade Input */}
                                  <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    step="0.5"
                                    disabled={!row.is_included}
                                    value={g.exam ?? ''}
                                    onChange={(e) => handleGradeChange(row.row_id, sub.subject_id, 'exam', e.target.value)}
                                    placeholder="ن1"
                                    style={{
                                      width: '46px',
                                      padding: '3px 4px',
                                      textAlign: 'center',
                                      borderRadius: '6px',
                                      border: `1px solid ${g.exam_error ? '#ef4444' : '#cbd5e1'}`,
                                      backgroundColor: g.exam_error ? '#fee2e2' : '#ffffff',
                                      fontSize: '12px',
                                      fontFamily: 'monospace',
                                      fontWeight: '600',
                                      color: '#2563eb'
                                    }}
                                  />
                                </div>
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

          {/* ========================================================= */}
          {/* STEP 4: FINAL REVIEW & COMMIT */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Summary Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '14px'
                }}
              >
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#166534' }}>
                    {reconciledRows.filter(r => r.is_included && r.matched_student !== null).length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '700', marginTop: '4px' }}>
                    {lang === 'ar' ? 'طلاب معتمدون للاستيراد' : 'Approved Students'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#475569' }}>
                    {reconciledRows.filter(r => !r.is_included || r.matched_student === null).length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginTop: '4px' }}>
                    {lang === 'ar' ? 'طلاب مستبعدون' : 'Excluded Rows'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#1e40af' }}>
                    {subjectMappings.filter(m => m.is_included).length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', marginTop: '4px' }}>
                    {lang === 'ar' ? 'مواد دراسية مشمولة' : 'Included Subjects'}
                  </div>
                </div>
              </div>

              {/* Overwrite toggle switch */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>
                    {lang === 'ar' ? 'تحديث واستبدال الدرجات المسجلة مسبقاً' : 'Overwrite Existing Grades'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                    {lang === 'ar'
                      ? 'عند التفعيل، سيتم استبدال أي درجة قديمة للطلاب المحددين بالقيم الجديدة في هذا الملف.'
                      : 'When enabled, existing grades will be replaced by the values in this sheet.'}
                  </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer' }}>
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
                      borderRadius: '28px',
                      transition: '0.3s'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      height: '22px',
                      width: '22px',
                      left: overwriteExisting ? '27px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </label>
              </div>

              {/* Ready to commit guarantee */}
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '16px',
                  border: '1px solid #bbf7d0',
                  fontSize: '13px',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span>
                  {lang === 'ar'
                    ? 'جاهز للاعتماد الآمن: سيتم إدراج الدرجات داخل عملية ذرية محصنة (DB Transaction) لتحديث شهادات وتقارير الطلاب وتطبيق ولي الأمر فوراً.'
                    : 'Ready for commit: Grades will be saved atomically and reflected across all student reports.'}
                </span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: SUCCESS STATE */}
          {/* ========================================================= */}
          {currentStep === 5 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', margin: 'auto' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.25)'
                }}
              >
                <CheckCircle2 size={42} />
              </div>
              <h3 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: '800', color: '#166534' }}>
                {lang === 'ar' ? 'تمت التسوية واستيراد الدرجات بنجاح تام!' : 'Reconciliation & Import Complete!'}
              </h3>
              <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748b' }}>
                {lang === 'ar'
                  ? 'تم حفظ واعتماد الدرجات لجميع الطلاب المحددين وحساب محصلة الفصل والتقارير بدقة متناهية.'
                  : 'All grades and coursework have been safely saved to the system.'}
              </p>

              {commitStats && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    marginBottom: '28px',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 24px', borderRadius: '12px' }}>
                    <span style={{ color: '#64748b' }}>{lang === 'ar' ? 'الطلاب: ' : 'Students: '}</span>
                    <strong style={{ color: '#166534' }}>{commitStats.students_count || 0}</strong>
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 24px', borderRadius: '12px' }}>
                    <span style={{ color: '#64748b' }}>{lang === 'ar' ? 'درجات جديدة: ' : 'New: '}</span>
                    <strong style={{ color: '#1e40af' }}>{commitStats.inserted || 0}</strong>
                  </div>
                  <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '12px 24px', borderRadius: '12px' }}>
                    <span style={{ color: '#64748b' }}>{lang === 'ar' ? 'محدثة: ' : 'Updated: '}</span>
                    <strong style={{ color: '#d97706' }}>{commitStats.updated || 0}</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 36px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                {lang === 'ar' ? 'إغلاق النافذة' : 'Close Wizard'}
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* FOOTER WIZARD NAVIGATION BUTTONS */}
        {/* ========================================================= */}
        {currentStep <= 4 && (
          <div
            style={{
              padding: '18px 28px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}
          >
            {/* Back Button */}
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={isLoading}
                style={{
                  padding: '9px 18px',
                  backgroundColor: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ChevronRight size={16} />
                {lang === 'ar' ? 'الخطوة السابقة' : 'Previous Step'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  padding: '9px 18px',
                  backgroundColor: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            )}

            {/* Next / Proceed Button */}
            {currentStep === 1 && (
              <button
                type="button"
                onClick={handleInspectFile}
                disabled={!file || isLoading}
                style={{
                  padding: '11px 26px',
                  backgroundColor: file && !isLoading ? '#10b981' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: file && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: file ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <ChevronLeft size={16} />}
                {lang === 'ar' ? 'فحص الملف ومتابعة المطابقة' : 'Inspect & Continue'}
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleProceedToReconciliation}
                disabled={isLoading}
                style={{
                  padding: '11px 26px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <ChevronLeft size={16} />}
                {lang === 'ar' ? 'الانتقال إلى واجهة تسوية الطلاب' : 'Proceed to Reconciliation'}
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={isLoading || reconciledRows.filter(r => r.is_included && r.matched_student !== null).length === 0}
                style={{
                  padding: '11px 26px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <ChevronLeft size={16} />
                {lang === 'ar' ? 'متابعة المراجعة النهائية' : 'Review & Finalize'}
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={handleFinalCommit}
                disabled={isLoading}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '800',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                }}
              >
                {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {lang === 'ar' ? 'اعتماد وحفظ الدرجات رسمياً' : 'Commit & Save Grades'}
              </button>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STUDENT LINK SELECTOR MODAL (Popup over Step 3) */}
        {/* ========================================================= */}
        {activeStudentLinkModal !== null && (
          <StudentLinkModal
            isOpen={true}
            onClose={() => setActiveStudentLinkModal(null)}
            allStudents={allClassStudents}
            currentMatchedId={reconciledRows.find(r => r.row_id === activeStudentLinkModal)?.matched_student?.id}
            excelName={reconciledRows.find(r => r.row_id === activeStudentLinkModal)?.excel_name}
            onSelect={(student) => linkStudentToRow(activeStudentLinkModal, student)}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

// Sub-component: Searchable Student Link Modal
function StudentLinkModal({ isOpen, onClose, allStudents, currentMatchedId, excelName, onSelect, lang }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = allStudents.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (s.name_ar || '').toLowerCase().includes(q) || (s.student_code || '').toLowerCase().includes(q);
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
              {lang === 'ar' ? 'ربط الطالب مع النظام' : 'Link Student'}
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              {lang === 'ar' ? `الاسم في الكشف: "${excelName}"` : `Sheet name: "${excelName}"`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث بالاسم أو كود الطالب...' : 'Search student...'}
              style={{
                width: '100%',
                padding: '8px 36px 8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ padding: '8px', overflowY: 'auto', flex: 1, maxHeight: '350px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              {lang === 'ar' ? 'لم يتم العثور على طالب بهذا الاسم' : 'No student found'}
            </div>
          ) : (
            filtered.map(s => {
              const isSelected = s.id === currentMatchedId;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelect(s)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                    border: `1px solid ${isSelected ? '#bbf7d0' : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: isSelected ? '#166534' : '#1e293b' }}>
                      {s.name_ar}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                      كود: {s.student_code} • ID: {s.id}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>
                      ✓ {lang === 'ar' ? 'مرتبط حالياً' : 'Current'}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
