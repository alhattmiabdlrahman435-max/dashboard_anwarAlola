import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FinanceContext } from './FinanceContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { financeService } from '../../services/finance/finance.service';
import { smsBus } from '../../utils/smsBus';

export default function FinanceProvider({ children }) {
  const { lang, t, setToastMessage } = useApp();
  const { isAuthenticated } = useAuth();

  const [tuitionFees, setTuitionFees] = useState({ baseFees: {}, payments: [], studentsFees: [] });
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(true);

  const [financePagination, setFinancePagination] = useState({
    total: 0, lastPage: 1, from: 0, to: 0, currentPage: 1, perPage: 20
  });

  const [financeStats, setFinanceStats] = useState({
    total_required: 0, total_paid: 0, total_remaining: 0
  });

  const fetchRequestRef = useRef(0);
  const financeAbortRef = useRef(null);

  const fetchFinanceData = useCallback((arg) => {
    const isForce = arg === true;
    const isQueryString = typeof arg === 'string';
    const queryString = isQueryString ? arg : '?page=1&per_page=20';

    const activeToken = localStorage.getItem('auth_token');
    if (!activeToken) return;

    if (!isForce && !isQueryString && !isStale && tuitionFees.payments.length > 0) return;

    if (financeAbortRef.current) financeAbortRef.current.abort();
    const controller = new AbortController();
    financeAbortRef.current = controller;

    const reqId = ++fetchRequestRef.current;
    setLoading(true);

    // Fetch aggregates
    financeService.getFinanceStats()
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data.success) {
          setFinanceStats(data.stats);
        }
      })
      .catch(err => console.error("Error loading finance stats:", err));

    // Fetch paginated student list
    financeService.getFinanceStudents(queryString)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (reqId !== fetchRequestRef.current) return;
        if (!localStorage.getItem('auth_token')) return;
        if (data.success) {
          const allPayments = [];
          data.students_fees.forEach((rec) => {
            if (rec.payments) {
              rec.payments.forEach((p) => {
                allPayments.push({
                  id: p.id,
                  studentId: Number(p.student_id),
                  amount: Number(p.amount),
                  paymentDate: p.payment_date,
                  referenceNo: p.reference_no,
                  status: "completed",
                });
              });
            }
          });

          setTuitionFees({
            baseFees: {
              "الصف الأول": 5000,
              "الصف الثاني": 5500,
              "الصف الثالث": 6000,
            },
            payments: allPayments,
            studentsFees: data.students_fees,
          });
          setIsStale(false);

          const pg = data.pagination || data.meta || {};
          setFinancePagination({
            total:       pg.total        ?? data.total        ?? data.students_fees.length,
            lastPage:    pg.last_page    ?? data.last_page    ?? 1,
            from:        pg.from         ?? data.from         ?? 1,
            to:          pg.to           ?? data.to           ?? data.students_fees.length,
            currentPage: pg.current_page ?? data.current_page ?? 1,
            perPage:     pg.per_page     ?? data.per_page     ?? data.students_fees.length,
          });
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        if (reqId !== fetchRequestRef.current) return;
        console.error("Error fetching finance data:", err);
      })
      .finally(() => {
        if (reqId === fetchRequestRef.current) {
          setLoading(false);
          financeAbortRef.current = null;
        }
      });
  }, [isStale, tuitionFees.payments.length]);

  const handleAddPayment = useCallback((newPayment, students) => {
    const token = localStorage.getItem("auth_token");

    const student = students.find((s) => s.id === newPayment.studentId);
    const smsText =
      lang === "ar"
        ? `تم استلام دفعة مالية بقيمة ${newPayment.amount} ريال للسند رقم ${newPayment.referenceNo} بخصوص الطالب ${student?.name}. شكراً لكم. رياض و مدارس انوار العلى.`
        : `Payment of ${newPayment.amount} R.Y (Receipt: ${newPayment.referenceNo}) received for student ${student?.nameEn}. Thank you. Riyadh & Anwar Al-Ola.`;

    if (token) {
      return financeService.addPayment({
          student_id: Number(newPayment.studentId),
          amount: Number(newPayment.amount),
          payment_date: newPayment.paymentDate,
          reference_no: newPayment.referenceNo,
        })
        .then((data) => {
          if (data.success) {
            fetchFinanceData(token, true);
            setToastMessage(t.paymentSuccessToast);
            setTimeout(() => setToastMessage(""), 4000);
            
            smsBus.emit((logs) => [
              {
                id: Date.now(),
                studentId: newPayment.studentId,
                recipient: student?.phone,
                text: smsText,
                time: "11:30",
                type: "present",
              },
              ...logs,
            ]);
            return { success: true };
          } else {
            const msg = lang === "ar" ? `فشل إضافة الدفعة: ${data.message}` : `Failed to add payment: ${data.message}`;
            setToastMessage(msg);
            setTimeout(() => setToastMessage(""), 6000);
            return { success: false, message: msg };
          }
        })
        .catch((err) => {
          console.error("Error adding payment:", err);
          const msg = lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(""), 6000);
          return { success: false, message: msg };
        });
    } else {
      setTuitionFees((prev) => ({
        ...prev,
        payments: [...prev.payments, newPayment],
      }));
      setToastMessage(t.paymentSuccessToast);
      setTimeout(() => setToastMessage(""), 3000);
      return Promise.resolve({ success: true });
    }
  }, [lang, t, setToastMessage, fetchFinanceData]);

  useEffect(() => {
    if (!isAuthenticated) {
      setTuitionFees({ baseFees: {}, payments: [] });
      setIsStale(true);
    }
  }, [isAuthenticated]);

  const financeContextValue = useMemo(() => ({
    tuitionFees,
    setTuitionFees,
    financePagination,
    financeStats,
    loading,
    fetchFinanceData,
    handleAddPayment,
  }), [
    tuitionFees,
    financePagination,
    financeStats,
    loading,
    fetchFinanceData,
    handleAddPayment,
  ]);

  return (
    <FinanceContext.Provider value={financeContextValue}>
      {children}
    </FinanceContext.Provider>
  );
}
