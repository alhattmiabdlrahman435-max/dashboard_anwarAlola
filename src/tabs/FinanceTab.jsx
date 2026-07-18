import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import { useStudents } from '../contexts/Students/useStudents';
import { useClasses } from '../contexts/Classes/useClasses';
import { useFinance } from '../contexts/Finance/useFinance';
import { X } from 'lucide-react';

export default function FinanceTab() {
  const {
    lang,
    t,
    renderAvatar,
    setToastMessage
  } = useApp();
  const { classes } = useClasses();
  const { tuitionFees, handleAddPayment } = useFinance();
  const { students } = useStudents();
  const { currentUser } = useAuth();

  const currencySymbol = lang === 'ar' ? 'ر.ي' : 'R.Y';

  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);

  // Helper to convert numbers to Arabic words (Tafqeet)
  const tafqeetArabic = (num) => {
    if (!num || num === 0) return 'صفر ريال يمني لا غير';
    
    const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    
    function convertLessThanThousand(n) {
      let result = '';
      const h = Math.floor(n / 100);
      const remainder = n % 100;
      const t = Math.floor(remainder / 10);
      const u = remainder % 10;
      
      if (h > 0) {
        result += hundreds[h];
      }
      
      if (remainder > 0) {
        if (result !== '') result += ' و ';
        
        if (remainder < 11) {
          result += units[remainder];
        } else if (remainder < 20) {
          result += teens[remainder - 10];
        } else {
          if (u > 0) {
            result += units[u] + ' و ';
          }
          result += tens[t];
        }
      }
      
      return result;
    }
    
    let result = '';
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    
    if (thousands > 0) {
      if (thousands === 1) {
        result += 'ألف';
      } else if (thousands === 2) {
        result += 'ألفان';
      } else if (thousands >= 3 && thousands <= 10) {
        result += convertLessThanThousand(thousands) + ' آلاف';
      } else {
        result += convertLessThanThousand(thousands) + ' ألف';
      }
    }
    
    if (remainder > 0) {
      if (result !== '') result += ' و ';
      result += convertLessThanThousand(remainder);
    }
    
    return result + ' ريال يمني لا غير';
  };

  const parentStudents = useMemo(() => {
    return currentUser?.role === 'parent'
      ? students.filter(s => s.parentNationalId === currentUser.username)
      : students;
  }, [students, currentUser]);

  const [selectedFinanceStudentId, setSelectedFinanceStudentId] = useState(
    parentStudents.length > 0 ? parentStudents[0].id : null
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalPaymentAmount, setModalPaymentAmount] = useState('');
  const [modalPaymentDate, setModalPaymentDate] = useState('');
  const [modalPaymentRef, setModalPaymentRef] = useState('');

  const filteredStudents = useMemo(() => {
    return parentStudents.filter(s => {
      const name = s.name || '';
      const nameEn = s.nameEn || '';
      const idStr = String(s.id);
      const searchLower = searchTerm.toLowerCase();
      return name.toLowerCase().includes(searchLower) || 
             nameEn.toLowerCase().includes(searchLower) || 
             idStr.includes(searchLower);
    });
  }, [parentStudents, searchTerm]);

  // Update selection if the parent students list changes or filter updates
  useEffect(() => {
    if (filteredStudents.length > 0 && (!selectedFinanceStudentId || !filteredStudents.some(s => s.id === selectedFinanceStudentId))) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFinanceStudentId(filteredStudents[0].id);
    } else if (filteredStudents.length === 0) {
      setSelectedFinanceStudentId(null);
    }
  }, [filteredStudents, selectedFinanceStudentId, setSelectedFinanceStudentId]);

  // Auto-populate current date and generate unique reference when modal opens
  useEffect(() => {
    if (showPaymentModal) {
      const today = new Date().toISOString().split('T')[0];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModalPaymentDate(today);
      const randomId = Math.floor(100000 + Math.random() * 900000);
      setModalPaymentRef(`PAY-${randomId}`);
    }
  }, [showPaymentModal]);

  const onAddPaymentSubmit = (e) => {
    e.preventDefault();
    if (!modalPaymentAmount || !modalPaymentDate || !modalPaymentRef.trim()) {
      setToastMessage(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Please fill all required fields');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const newPayment = {
      id: Date.now(),
      studentId: Number(selectedFinanceStudentId),
      amount: parseFloat(modalPaymentAmount),
      paymentDate: modalPaymentDate,
      referenceNo: modalPaymentRef.trim(),
      status: 'completed'
    };

    handleAddPayment(newPayment, students);
    
    // Reset modal states
    setShowPaymentModal(false);
    setModalPaymentAmount('');
    setModalPaymentDate('');
    setModalPaymentRef('');
  };

  // Calculate aggregates
  // Calculate aggregates
  const parentStudentIds = useMemo(() => parentStudents.map(s => s.id), [parentStudents]);
  
  const globalRequired = useMemo(() => {
    return parentStudents.reduce((sum, s) => sum + (s.tuition_fee ?? s.tuitionFee ?? 10000), 0);
  }, [parentStudents]);

  const globalPaid = useMemo(() => {
    return tuitionFees.payments
      .filter(p => parentStudentIds.includes(p.studentId))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [tuitionFees.payments, parentStudentIds]);

  const globalRemaining = useMemo(() => globalRequired - globalPaid, [globalRequired, globalPaid]);

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedFinanceStudentId);
  }, [students, selectedFinanceStudentId]);

  const selectedRequired = useMemo(() => {
    return selectedStudent ? (selectedStudent.tuition_fee ?? selectedStudent.tuitionFee ?? 10000) : 0;
  }, [selectedStudent]);

  const selectedPayments = useMemo(() => {
    return selectedStudent
      ? tuitionFees.payments.filter(p => p.studentId === selectedStudent.id)
      : [];
  }, [tuitionFees.payments, selectedStudent]);

  const selectedPaid = useMemo(() => {
    return selectedPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [selectedPayments]);

  const selectedRemaining = useMemo(() => selectedRequired - selectedPaid, [selectedRequired, selectedPaid]);

  const selectedStudentClass = useMemo(() => {
    return selectedStudent ? classes.find(c => c.id === selectedStudent.classId) : null;
  }, [selectedStudent, classes]);

  const selectedStudentClassName = useMemo(() => {
    return selectedStudentClass ? (lang === 'ar' ? selectedStudentClass.name : selectedStudentClass.nameEn) : '';
  }, [selectedStudentClass, lang]);

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          💵 {t.financeTitle}
        </h3>
      </div>

      {/* Financial Dashboard Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-lg)'
      }} className="no-print">
        
        <div className="stat-card" style={{ borderTop: '4px solid var(--color-primary-ui)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
          <div className="stat-icon-wrapper" style={{ fontSize: '24px' }}>🏦</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.totalRequiredFees}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>{globalRequired.toLocaleString()} {currencySymbol}</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid var(--color-success)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
          <div className="stat-icon-wrapper" style={{ fontSize: '24px', color: 'var(--color-success)', backgroundColor: 'rgba(22, 163, 74, 0.08)' }}>💰</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.totalPaidFees}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>{globalPaid.toLocaleString()} {currencySymbol}</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid var(--color-error)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
          <div className="stat-icon-wrapper" style={{ fontSize: '24px', color: 'var(--color-error)', backgroundColor: 'rgba(220, 38, 38, 0.08)' }}>⚖️</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.totalRemainingFees}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--color-error)' }}>{globalRemaining.toLocaleString()} {currencySymbol}</div>
          </div>
        </div>

      </div>

      {/* Main Ledger Split Layout */}
      <div className="finance-ledger-grid" style={{ marginTop: 'var(--space-lg)' }}>
        
        {/* Students Balance Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', margin: 0 }}>
            👥 {lang === 'ar' ? 'كشوفات الحساب المالية للطلاب' : 'Student Accounts List'}
          </h4>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder={lang === 'ar' ? '🔍 ابحث باسم الطالب أو الرقم الأكاديمي...' : '🔍 Search student by name or ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-field"
              style={{
                width: '100%',
                padding: '10px 14px',
                paddingInlineStart: '36px',
                borderRadius: '10px',
                fontSize: '13px',
                border: '1px solid var(--color-border)',
                outline: 'none',
                background: 'var(--color-surface)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  left: lang === 'ar' ? '12px' : 'auto',
                  right: lang === 'ar' ? 'auto' : '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="students-table-container" style={{ maxHeight: '420px', overflowY: 'auto', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <table className="students-table">
              <thead>
                <tr>
                  <th>{t.studentName}</th>
                  <th>{lang === 'ar' ? 'الرسوم' : 'Tuition'}</th>
                  <th>{lang === 'ar' ? 'المتبقي' : 'Remaining'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(s => {
                    const required = s.tuition_fee ?? s.tuitionFee ?? 10000;
                    const paid = tuitionFees.payments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + p.amount, 0);
                    const remaining = required - paid;
                    const isSelected = selectedFinanceStudentId === s.id;
                    
                    return (
                      <tr 
                        key={s.id}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(30, 80, 142, 0.05)' : ''
                        }}
                        onClick={() => setSelectedFinanceStudentId(s.id)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                            {renderAvatar(s.photo, "👨‍🎓")}
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600' }}>{lang === 'ar' ? s.name : s.nameEn}</div>
                              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{s.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{required}</td>
                        <td style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '13px',
                          fontWeight: 'bold',
                          color: remaining === 0 ? 'var(--color-success)' : 'var(--color-error)'
                        }}>
                          {remaining} {remaining === 0 ? '✓' : currencySymbol}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      {lang === 'ar' ? '🔍 لا توجد نتائج مطابقة للبحث' : '🔍 No matching student accounts found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Student Details and Log payment */}
        {selectedStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{
              padding: '24px var(--space-lg)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              background: 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-alt))'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>👤</span>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--color-primary-ui)' }}>
                    {lang === 'ar' ? selectedStudent.name : selectedStudent.nameEn}
                  </span>
                </div>
                {currentUser?.role !== 'parent' && (
                  <button 
                    className="btn-accent"
                    style={{ height: '36px', minHeight: '36px', padding: '0 16px', fontSize: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => setShowPaymentModal(true)}
                  >
                    💵 {t.logPaymentBtn}
                  </button>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--color-surface)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--color-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>{lang === 'ar' ? 'المستحق' : 'Required'}</div>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '15px' }}>{selectedRequired.toLocaleString()} {currencySymbol}</strong>
                </div>
                <div style={{ background: 'rgba(22, 163, 74, 0.04)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(22, 163, 74, 0.15)', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                  <div style={{ color: '#16a34a', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>{lang === 'ar' ? 'المدفوع' : 'Paid'}</div>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#16a34a', fontSize: '15px' }}>{selectedPaid.toLocaleString()} {currencySymbol}</strong>
                </div>
                <div style={{ 
                  background: selectedRemaining > 0 ? 'rgba(220, 38, 38, 0.04)' : 'rgba(22, 163, 74, 0.04)', 
                  padding: '14px 10px', 
                  borderRadius: '12px', 
                  textAlign: 'center', 
                  border: selectedRemaining > 0 ? '1px solid rgba(220, 38, 38, 0.15)' : '1px solid rgba(22, 163, 74, 0.15)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                }}>
                  <div style={{ color: selectedRemaining > 0 ? '#dc2626' : '#16a34a', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>{lang === 'ar' ? 'المتبقي' : 'Remaining'}</div>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: selectedRemaining > 0 ? '#dc2626' : '#16a34a', fontSize: '15px' }}>{selectedRemaining.toLocaleString()} {currencySymbol}</strong>
                </div>
              </div>
            </div>

            {/* Student Payment Ledger List */}
            <h5 style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '6px' }}>📜 {t.paymentsHistoryTitle}</h5>
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{t.referenceNoLabel}</th>
                    <th>{t.paymentAmountLabel}</th>
                    <th>{t.paymentDateLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPayments.length > 0 ? (
                    selectedPayments.map(pay => (
                      <tr 
                        key={pay.id} 
                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onClick={() => setSelectedPaymentForReceipt(pay)}
                        title={lang === 'ar' ? 'انقر لعرض وطباعة السند المالي' : 'Click to view & print receipt'}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                      >
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-primary-ui)' }}>📄 {pay.referenceNo}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)', fontWeight: 'bold' }}>+{pay.amount.toLocaleString()} {currencySymbol}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {pay.paymentDate}
                          <span style={{ fontSize: '12px', color: 'var(--color-primary-ui)', opacity: 0.8 }} className="no-print-element">🖨️</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        ⚠️ {t.noPayments}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* MODAL DIALOG: LOG PAYMENT */}
      {showPaymentModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">💵 {t.logPaymentBtn}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowPaymentModal(false)}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={onAddPaymentSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {selectedStudent && (
                  <div style={{ padding: '10px var(--space-md)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                    <strong>{lang === 'ar' ? selectedStudent.name : selectedStudent.nameEn}</strong>
                    <span style={{ marginInlineStart: '8px', fontSize: '12px', opacity: 0.8 }}>({selectedStudent.id})</span>
                  </div>
                )}

                {/* Amount */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.paymentAmountLabel}</label>
                  <input 
                    type="number" 
                    value={modalPaymentAmount} 
                    onChange={(e) => setModalPaymentAmount(e.target.value)}
                    placeholder="مثال: 1500"
                    className="text-field"
                    required
                  />
                </div>

                {/* Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.paymentDateLabel}</label>
                  <input 
                    type="date" 
                    value={modalPaymentDate} 
                    onChange={(e) => setModalPaymentDate(e.target.value)}
                    className="text-field"
                    required
                  />
                </div>

                {/* Reference No */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.referenceNoLabel}</label>
                  <input 
                    type="text" 
                    value={modalPaymentRef} 
                    onChange={(e) => setModalPaymentRef(e.target.value)}
                    placeholder="REC-XXXXX"
                    className="text-field"
                    required
                  />
                </div>
              </div>

              <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: 'var(--space-lg) var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
                <button 
                  type="button" 
                  className="btn-elevated"
                  onClick={() => setShowPaymentModal(false)}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="btn-filled"
                >
                  💾 {lang === 'ar' ? 'حفظ السند المالي' : 'Save Receipt'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: PRINT RECEIPT */}
      {selectedPaymentForReceipt && (
        <div className="modal-overlay no-print-element">
          <div className="modal-container print-receipt-modal" style={{ maxWidth: '650px', background: '#fff', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '0', overflow: 'hidden' }}>
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .print-receipt-modal, .print-receipt-modal * {
                  visibility: visible !important;
                }
                .print-receipt-modal {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: white !important;
                  color: black !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .no-print-element {
                  background: transparent !important;
                  border: none !important;
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
              }
            `}</style>
            
            {/* Modal Header (No Print) */}
            <header className="modal-header no-print-element" style={{ padding: 'var(--space-md) var(--space-xl)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}>
              <h3 className="modal-title" style={{ fontSize: '15px', fontWeight: 'bold' }}>📄 {lang === 'ar' ? 'عرض وطباعة سند القبض المالي' : 'View & Print Receipt'}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedPaymentForReceipt(null)}
              >
                <X size={20} />
              </button>
            </header>
            
            {/* Receipt Body */}
            <div className="modal-body print-receipt-modal" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '0', direction: 'rtl', fontFamily: 'system-ui, sans-serif', backgroundColor: '#fff', position: 'relative' }}>
              
              {/* Background Watermark */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ fontSize: '300px', filter: 'grayscale(100%)' }}>🏫</div>
              </div>

              {/* Receipt Outer Border */}
              <div style={{ border: '2px solid #1e293b', padding: '2px', borderRadius: '4px', zIndex: 1, position: 'relative', backgroundColor: 'transparent' }}>
                <div style={{ border: '1px solid #1e293b', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: 'transparent' }}>
                  
                  {/* Document Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1e293b', paddingBottom: '16px' }}>
                    
                    {/* Arabic Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right', flex: 1 }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>الجمهورية اليمنية</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>وزارة التربية والتعليم</span>
                      <h2 style={{ fontSize: '16px', fontWeight: '900', margin: '4px 0 0 0', color: '#0f172a' }}>رياض ومدارس أنوار العلى الأهلية النموذجية</h2>
                    </div>
                    
                    {/* Logo Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', flexShrink: 0 }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', backgroundColor: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                        🏫
                      </div>
                    </div>
                    
                    {/* English Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', flex: 1, direction: 'ltr' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>Republic of Yemen</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>Ministry of Education</span>
                      <h2 style={{ fontSize: '16px', fontWeight: '900', margin: '4px 0 0 0', color: '#0f172a' }}>Anwar Al-Ola Model Schools</h2>
                    </div>
                  </div>
                  
                  {/* Receipt Meta & Title */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <strong style={{ color: '#0f172a', width: '80px' }}>رقم السند:</strong> 
                        <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', color: '#dc2626' }}>{selectedPaymentForReceipt.referenceNo}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <strong style={{ color: '#0f172a', width: '80px' }}>التاريخ:</strong> 
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{selectedPaymentForReceipt.paymentDate}</span>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ border: '2px solid #1e293b', padding: '8px 32px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '1px' }}>سند قبض مالي</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', color: '#64748b', marginTop: '4px' }}>CASH RECEIPT</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', width: '70px', height: '70px', borderRadius: '4px', backgroundColor: '#f8fafc', padding: '4px' }}>
                       {/* Placeholder for QR Code */}
                       <div style={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                         {Array(16).fill(0).map((_, i) => <div key={i} style={{ width: 'calc(25% - 2px)', height: 'calc(25% - 2px)', backgroundColor: (i * 7 + 3) % 2 === 0 ? '#1e293b' : 'transparent' }} />)}
                       </div>
                    </div>
                  </div>
                  
                  {/* Receipt Fields Table Structure */}
                  <div style={{ border: '1px solid #1e293b', borderRadius: '4px', overflow: 'hidden', marginTop: '12px' }}>
                    
                    {/* Row 1: Student Name */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #1e293b' }}>
                      <div style={{ width: '140px', backgroundColor: '#f1f5f9', padding: '12px', fontWeight: 'bold', color: '#0f172a', borderLeft: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
                        استلمنا من الأخ/ـت:
                      </div>
                      <div style={{ flex: 1, padding: '12px', fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>
                        {lang === 'ar' ? selectedStudent?.name : selectedStudent?.nameEn}
                      </div>
                      <div style={{ width: '100px', backgroundColor: '#f1f5f9', padding: '12px', fontWeight: 'bold', color: '#0f172a', borderRight: '1px solid #1e293b', borderLeft: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
                        الصف الدراسي:
                      </div>
                      <div style={{ width: '150px', padding: '12px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center' }}>
                        {selectedStudentClassName || (lang === 'ar' ? 'غير محدد' : 'N/A')}
                      </div>
                    </div>
                    
                    {/* Row 2: Amount Number & Text */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #1e293b' }}>
                      <div style={{ width: '140px', backgroundColor: '#f1f5f9', padding: '12px', fontWeight: 'bold', color: '#0f172a', borderLeft: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
                        مبلغ وقدره:
                      </div>
                      <div style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ backgroundColor: '#1e293b', color: '#fff', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '18px', letterSpacing: '1px' }}>
                          {selectedPaymentForReceipt.amount.toLocaleString()} <span style={{ fontSize: '14px' }}>{currencySymbol}</span>
                        </div>
                        <div style={{ flex: 1, borderBottom: '1px dashed #94a3b8', paddingBottom: '4px', paddingLeft: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: '#334155' }}>فقط: </span>
                          <span style={{ color: '#0f172a', fontStyle: 'italic', fontWeight: '700', fontSize: '15px' }}>{tafqeetArabic(selectedPaymentForReceipt.amount)} لا غير.</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Row 3: Payment Reason */}
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '140px', backgroundColor: '#f1f5f9', padding: '12px', fontWeight: 'bold', color: '#0f172a', borderLeft: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
                        وذلك مقابل:
                      </div>
                      <div style={{ flex: 1, padding: '12px', color: '#1e293b', fontWeight: '600' }}>
                        قسط من الرسوم الدراسية المقررة للعام الدراسي 2026/2027
                      </div>
                    </div>

                  </div>
                  
                  {/* Footer Signatures Area */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', position: 'relative' }}>
                    {/* Decorator Line */}
                    <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', backgroundColor: '#cbd5e1' }}></div>
                    
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', flex: 1 }}>
                      <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>المستلم (الطالب/ولي الأمر)</span>
                      <div style={{ borderBottom: '1px dashed #64748b', width: '150px' }}></div>
                    </div>
                    
                    {/* Official Stamp Placeholder */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                       <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-15deg)' }}>
                         <span style={{ color: 'rgba(220, 38, 38, 0.4)', fontWeight: 'bold', fontSize: '12px', border: '1px solid rgba(220, 38, 38, 0.3)', padding: '4px', borderRadius: '4px' }}>الختم الرسمي</span>
                       </div>
                    </div>

                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', flex: 1 }}>
                      <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>أمين الصندوق / المحاسب</span>
                      <div style={{ borderBottom: '1px dashed #64748b', width: '150px' }}></div>
                    </div>
                  </div>
                  
                  {/* Footer Note */}
                  <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#64748b', backgroundColor: '#f8fafc', padding: '6px', borderRadius: '4px' }}>
                    ملاحظة: هذا السند إلكتروني ومعتمد، يرجى الاحتفاظ به للمراجعة عند الحاجة.
                  </div>

                </div>
              </div>
            </div>
            
            {/* Modal Footer (No Print) */}
            <footer className="modal-footer no-print-element" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: 'var(--space-md) var(--space-xl)', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}>
              <button 
                type="button" 
                className="btn-elevated"
                onClick={() => setSelectedPaymentForReceipt(null)}
              >
                {t.cancel}
              </button>
              <button 
                type="button" 
                className="btn-filled"
                onClick={() => window.print()}
              >
                🖨️ {lang === 'ar' ? 'طباعة السند' : 'Print Receipt'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
