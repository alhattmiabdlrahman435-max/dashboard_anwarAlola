import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

export default function FinanceTab() {
  const {
    lang,
    t,
    students,
    tuitionFees,
    currentUser,
    renderAvatar,
    handleAddPayment,
    setToastMessage
  } = useApp();

  const parentStudents = currentUser?.role === 'parent'
    ? students.filter(s => s.parentNationalId === currentUser.username)
    : students;

  const [selectedFinanceStudentId, setSelectedFinanceStudentId] = useState(
    parentStudents.length > 0 ? parentStudents[0].id : null
  );

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalPaymentAmount, setModalPaymentAmount] = useState('');
  const [modalPaymentDate, setModalPaymentDate] = useState('');
  const [modalPaymentRef, setModalPaymentRef] = useState('');

  // Update selection if the parent students list changes
  useEffect(() => {
    if (parentStudents.length > 0 && (!selectedFinanceStudentId || !parentStudents.some(s => s.id === selectedFinanceStudentId))) {
      setSelectedFinanceStudentId(parentStudents[0].id);
    }
  }, [students, currentUser]);

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

    handleAddPayment(newPayment);
    
    // Reset modal states
    setShowPaymentModal(false);
    setModalPaymentAmount('');
    setModalPaymentDate('');
    setModalPaymentRef('');
  };

  // Calculate aggregates
  const parentStudentIds = parentStudents.map(s => s.id);
  const globalRequired = parentStudents.reduce((sum, s) => sum + (tuitionFees.baseFees[s.grade] || 0), 0);
  const globalPaid = tuitionFees.payments
    .filter(p => parentStudentIds.includes(p.studentId))
    .reduce((sum, p) => sum + p.amount, 0);
  const globalRemaining = globalRequired - globalPaid;

  const selectedStudent = students.find(s => s.id === selectedFinanceStudentId);
  const selectedRequired = selectedStudent ? (tuitionFees.baseFees[selectedStudent.grade] || 0) : 0;
  const selectedPayments = selectedStudent
    ? tuitionFees.payments.filter(p => p.studentId === selectedStudent.id)
    : [];
  const selectedPaid = selectedPayments.reduce((sum, p) => sum + p.amount, 0);
  const selectedRemaining = selectedRequired - selectedPaid;

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
        
        <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderTop: '4px solid var(--color-primary-ui)', borderRadius: 'var(--radius-card)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ fontSize: '32px' }}>🏦</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.totalRequiredFees}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>{globalRequired} {lang === 'ar' ? 'ر.س' : 'SAR'}</div>
          </div>
        </div>

        <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderTop: '4px solid var(--color-success)', borderRadius: 'var(--radius-card)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ fontSize: '32px' }}>💰</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.totalPaidFees}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>{globalPaid} {lang === 'ar' ? 'ر.س' : 'SAR'}</div>
          </div>
        </div>

        <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderTop: '4px solid var(--color-warning)', borderRadius: 'var(--radius-card)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ fontSize: '32px' }}>⚖️</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{t.totalRemainingFees}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--color-warning)' }}>{globalRemaining} {lang === 'ar' ? 'ر.س' : 'SAR'}</div>
          </div>
        </div>

      </div>

      {/* Main Ledger Split Layout */}
      <div className="dashboard-main-grid" style={{ marginTop: 'var(--space-lg)' }}>
        
        {/* Students Balance Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            👥 {lang === 'ar' ? 'كشوفات الحساب المالية للطلاب' : 'Student Accounts List'}
          </h4>

          <div className="students-table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="students-table">
              <thead>
                <tr>
                  <th>{t.studentName}</th>
                  <th>{lang === 'ar' ? 'الرسوم' : 'Tuition'}</th>
                  <th>{lang === 'ar' ? 'المتبقي' : 'Remaining'}</th>
                </tr>
              </thead>
              <tbody>
                {parentStudents.map(s => {
                  const required = tuitionFees.baseFees[s.grade] || 0;
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
                        {remaining} {remaining === 0 ? '✓' : (lang === 'ar' ? 'ر.س' : 'SAR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Student Details and Log payment */}
        {selectedStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{
              padding: 'var(--space-lg)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary-ui)' }}>
                  {lang === 'ar' ? selectedStudent.name : selectedStudent.nameEn}
                </span>
                {currentUser?.role !== 'parent' && (
                  <button 
                    className="btn-accent"
                    style={{ height: '36px', minHeight: '36px', padding: '0 16px', fontSize: '12px' }}
                    onClick={() => setShowPaymentModal(true)}
                  >
                    💵 {t.logPaymentBtn}
                  </button>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px', textAlign: 'center' }}>
                <div style={{ borderInlineEnd: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'المستحق' : 'Required'}</div>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedRequired} {lang === 'ar' ? 'ر.س' : 'SAR'}</strong>
                </div>
                <div style={{ borderInlineEnd: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'المدفوع' : 'Paid'}</div>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>{selectedPaid} {lang === 'ar' ? 'ر.س' : 'SAR'}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? 'المتبقي' : 'Remaining'}</div>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: selectedRemaining > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{selectedRemaining} {lang === 'ar' ? 'ر.س' : 'SAR'}</strong>
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
                      <tr key={pay.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>📄 {pay.referenceNo}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)', fontWeight: 'bold' }}>+{pay.amount} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{pay.paymentDate}</td>
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
    </div>
  );
}
