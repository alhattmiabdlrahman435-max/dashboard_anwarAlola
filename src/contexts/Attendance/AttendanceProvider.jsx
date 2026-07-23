import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AttendanceContext } from './AttendanceContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { attendanceService } from '../../services/attendance/attendance.service';
import { smsBus } from '../../utils/smsBus';

export default function AttendanceProvider({ children }) {
  const { lang, t, setToastMessage } = useApp();
  const { isAuthenticated } = useAuth();

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState("2026-03");
  const [attendanceRosterDate, setAttendanceRosterDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [absenceRequests, setAbsenceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(true);

  const [attendancePagination, setAttendancePagination] = useState({
    total: 0, lastPage: 1, from: 0, to: 0, currentPage: 1, perPage: 20
  });
  const [absenceRequestsPagination, setAbsenceRequestsPagination] = useState({
    total: 0, lastPage: 1, from: 0, to: 0, currentPage: 1, perPage: 20
  });

  const fetchAttendanceRequestRef = useRef(0);
  const fetchAbsenceRequestsRequestRef = useRef(0);
  const attendanceAbortRef = useRef(null);
  const absenceAbortRef = useRef(null);

  const fetchAttendance = useCallback((arg) => {
    const isForce = arg === true;
    const isQueryString = typeof arg === 'string';
    const queryString = isQueryString ? arg : '?page=1&per_page=20';

    const activeToken = localStorage.getItem('auth_token');
    if (!activeToken) return;

    if (!isForce && !isQueryString && !isStale && attendanceRecords.length > 0) return;

    if (attendanceAbortRef.current) attendanceAbortRef.current.abort();
    const controller = new AbortController();
    attendanceAbortRef.current = controller;

    const reqId = ++fetchAttendanceRequestRef.current;
    setLoading(true);
    attendanceService.getAttendance(queryString)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (reqId !== fetchAttendanceRequestRef.current) return;
        if (!localStorage.getItem('auth_token')) return;
        if (data.success) {
          const mapped = (data.attendance || []).map((rec) => ({
            id: rec.id,
            studentId: Number(rec.student_id),
            date: rec.record_date,
            status: rec.status, // 'present', 'absent'
            time: rec.arrival_time ? rec.arrival_time.substring(0, 5) : '--:--',
            student: rec.student,
          }));
          setAttendanceRecords(mapped);
          setIsStale(false);

          const pg = data.pagination || data.meta || {};
          setAttendancePagination({
            total:       pg.total        ?? data.total        ?? mapped.length,
            lastPage:    pg.last_page    ?? data.last_page    ?? 1,
            from:        pg.from         ?? data.from         ?? 1,
            to:          pg.to           ?? data.to           ?? mapped.length,
            currentPage: pg.current_page ?? data.current_page ?? 1,
            perPage:     pg.per_page     ?? data.per_page     ?? mapped.length,
          });
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        if (reqId !== fetchAttendanceRequestRef.current) return;
        console.error('Error fetching attendance:', err);
        setToastMessage(err.message, "error");
      })
      .finally(() => {
        if (reqId === fetchAttendanceRequestRef.current) {
          setLoading(false);
          attendanceAbortRef.current = null;
        }
      });
  }, [isStale, attendanceRecords.length]);

  const fetchAbsenceRequests = useCallback((arg) => {
    const isForce = arg === true;
    const isQueryString = typeof arg === 'string';
    const queryString = isQueryString ? arg : '?page=1&per_page=20';

    const activeToken = localStorage.getItem('auth_token');
    if (!activeToken) return;

    if (!isForce && !isQueryString && !isStale && absenceRequests.length > 0) return;

    if (absenceAbortRef.current) absenceAbortRef.current.abort();
    const controller = new AbortController();
    absenceAbortRef.current = controller;

    const reqId = ++fetchAbsenceRequestsRequestRef.current;
    setLoading(true);
    attendanceService.getAbsenceRequests(queryString)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (reqId !== fetchAbsenceRequestsRequestRef.current) return;
        if (!localStorage.getItem('auth_token')) return;
        if (data.success) {
          const mapped = (data.absence_requests || data.absenceRequests || []).map((req) => {
            const studentName = req.student ? req.student.name_ar : '';
            const className = req.student && req.student.school_class
              ? `${req.student.school_class.grade_ar} - ${req.student.school_class.section_ar}`
              : '';
            return {
              id: req.id,
              studentId: Number(req.student_id),
              studentName: studentName,
              className: className,
              requestedDate: req.requested_date || req.start_date,
              reason: req.reason_ar,
              reasonEn: req.reason_en,
              status: req.status,
              attachment: req.attachment_url,
              studentPhoto: req.student ? (req.student.photo_url || '👨‍🎓') : '👨‍🎓',
              adminNoteAr: req.admin_note_ar,
              adminNoteEn: req.admin_note_en,
            };
          });
          setAbsenceRequests(mapped);
          setIsStale(false);

          const pg = data.pagination || data.meta || {};
          setAbsenceRequestsPagination({
            total:       pg.total        ?? data.total        ?? mapped.length,
            lastPage:    pg.last_page    ?? data.last_page    ?? 1,
            from:        pg.from         ?? data.from         ?? 1,
            to:          pg.to           ?? data.to           ?? mapped.length,
            currentPage: pg.current_page ?? data.current_page ?? 1,
            perPage:     pg.per_page     ?? data.per_page     ?? mapped.length,
          });
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        if (reqId !== fetchAbsenceRequestsRequestRef.current) return;
        console.error('Error fetching absence requests:', err);
      })
      .finally(() => {
        if (reqId === fetchAbsenceRequestsRequestRef.current) {
          setLoading(false);
          absenceAbortRef.current = null;
        }
      });
  }, [isStale, absenceRequests.length]);

  const handleManualAttendanceChange = useCallback((
    studentId,
    newStatus,
    rosterDate,
    students,
  ) => {
    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (r) => r.studentId === studentId && r.date === rosterDate,
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status: newStatus };
        return updated;
      } else {
        return [
          ...prev,
          {
            studentId,
            date: rosterDate,
            status: newStatus,
            time:
              newStatus === "present"
                ? "07:30"
                : newStatus === "late"
                  ? "08:00"
                  : "--:--",
          },
        ];
      }
    });

    const student = students.find((s) => s.id === studentId);
    if (!student) return Promise.resolve({ success: false, message: "Student not found" });

    if (newStatus === "absent") {
      const hasExcuse = absenceRequests.some(
        (r) =>
          r.studentId === studentId &&
          r.requestedDate === rosterDate &&
          r.status === "approved",
      );
      const smsText = hasExcuse
        ? lang === "ar"
          ? `سعادة ولي أمر الطالب ${student.name}: تم تسجيل ابنكم غائباً بعذر مقبول لهذا اليوم ${rosterDate}.`
          : `Dear parent of ${student.nameEn}: Your child has been marked as absent (excused) for today ${rosterDate}.`
        : lang === "ar"
          ? `عاجل من رياض و مدارس انوار العلى: نفيدكم بغياب ابنكم ${student.name} اليوم ${rosterDate} دون عذر مسبق. يرجى التواصل مع الإدارة.`
          : `Urgent from Riyadh & Anwar Al-Ola International Model Schools: Your child ${student.nameEn} is absent today ${rosterDate} without an excuse. Please contact administration.`;

      const newSms = {
        id: Date.now(),
        studentId: studentId,
        studentName: student.name,
        phone: student.phone,
        message: smsText,
        timestamp: new Date().toLocaleTimeString(),
      };
      smsBus.emit((prev) => [newSms, ...prev]);
    }

    setToastMessage(
      lang === "ar"
        ? "تم تحديث حالة حضور الطالب بنجاح!"
        : "Attendance status updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
    return Promise.resolve({ success: true });
  }, [absenceRequests, lang, setToastMessage]);

  const handleCellAttendanceChange = useCallback((
    studentId,
    date,
    newStatus,
  ) => {
    const token = localStorage.getItem("auth_token");

    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.studentId === studentId && r.date === date,
      );
      if (existingIdx > -1) {
        if (!newStatus) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status: newStatus };
        return updated;
      } else {
        if (!newStatus) return prev;
        return [
          ...prev,
          {
            studentId,
            date,
            status: newStatus,
            time:
              newStatus === "present"
                ? "07:30"
                : newStatus === "late"
                  ? "07:55"
                  : "--:--",
          },
        ];
      }
    });

    if (token) {
      const syncStatus = !newStatus || newStatus === "unmarked" ? "unmarked" : (newStatus === "late" ? "present" : newStatus);
      return attendanceService.saveAttendance({
          student_id: Number(studentId),
          date: date,
          status: syncStatus,
          arrival_time: syncStatus === "present" ? "07:30:00" : (syncStatus === "late" ? "07:55:00" : null),
          note: "تم التعديل يدوياً من لوحة الإدارة",
        })
        .then((data) => {
          if (data.success) {
            return { success: true };
          } else {
            console.error("Failed to sync attendance to backend:", data.message);
            return { success: false, message: data.message };
          }
        })
        .catch((err) => {
          console.error("Error syncing attendance:", err);
          return { success: false, message: err.message };
        });
    } else {
      return Promise.resolve({ success: true });
    }
  }, []);

  const handleToggleDayAttendance = useCallback((
    studentId,
    dateStr,
    currentStatus,
  ) => {
    let nextStatus = "present";
    if (currentStatus) {
      if (currentStatus === "present") nextStatus = "absent";
      else if (currentStatus === "absent") nextStatus = null;
    }

    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.studentId === studentId && r.date === dateStr,
      );
      if (existingIdx > -1) {
        if (!nextStatus) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status: nextStatus };
        return updated;
      } else {
        if (!nextStatus) return prev;
        return [
          ...prev,
          {
            studentId,
            date: dateStr,
            status: nextStatus,
            time:
              nextStatus === "present"
                ? "07:30"
                : nextStatus === "late"
                  ? "07:55"
                  : "--:--",
          },
        ];
      }
    });
  }, []);

  const calculateStudentStats = useCallback(
    (studentId) => {
      const records = attendanceRecords.filter(
        (r) =>
          r.studentId === studentId &&
          r.date.startsWith(selectedAttendanceMonth),
      );
      const total = records.length;
      const present = records.filter((r) => r.status === "present").length;
      const absent = records.filter((r) => r.status === "absent").length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;
      return { total, present, late: 0, absent, rate };
    },
    [attendanceRecords, selectedAttendanceMonth],
  );

  const handleAbsenceDecision = useCallback((requestId, newStatus, adminNoteText, students) => {
    const token = localStorage.getItem("auth_token");

    setAbsenceRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          if (newStatus === "approved") {
            const student = students.find((s) => s.id === req.studentId);
            const smsText =
              lang === "ar"
                ? `نفيدكم بقبول طلب الغياب المقدم للابن ${student?.name} لتاريخ ${req.requestedDate} وتم اعتماده بعذر.`
                : `Leave request for your son ${student?.nameEn} on ${req.requestedDate} is approved.`;
            smsBus.emit((logs) => [
              {
                id: Date.now(),
                studentId: req.studentId,
                recipient: student?.phone,
                text: smsText,
                time: "08:30",
                type: "present",
              },
              ...logs,
            ]);
          } else if (newStatus === "rejected") {
            const student = students.find((s) => s.id === req.studentId);
            const smsText =
              lang === "ar"
                ? `نفيدكم برفض طلب الغياب المقدم للابن ${student?.name} لتاريخ ${req.requestedDate}. ملاحظة الإدارة: ${adminNoteText || "الرجاء التواصل معنا"}`
                : `Leave request for your son ${student?.nameEn} on ${req.requestedDate} is rejected. Admin Note: ${adminNoteText || "Contact admin"}`;
            smsBus.emit((logs) => [
              {
                id: Date.now(),
                studentId: req.studentId,
                recipient: student?.phone,
                text: smsText,
                time: "08:30",
                type: "absent",
              },
              ...logs,
            ]);
          }
          return {
            ...req,
            status: newStatus,
            adminNote:
              adminNoteText ||
              (newStatus === "approved"
                ? "تمت الموافقة بعذر مقبول"
                : "مرفوض لعدم اكتمال المبررات"),
            adminNoteEn:
              adminNoteText ||
              (newStatus === "approved"
                ? "Approved with excuse"
                : "Rejected due to insufficient details"),
          };
        }
        return req;
      }),
    );
    const successMsg = newStatus === "approved"
      ? (lang === "ar" ? "تم قبول طلب الغياب بنجاح" : "Absence request approved successfully")
      : (lang === "ar" ? "تم رفض طلب الغياب بنجاح" : "Absence request rejected successfully");
    setToastMessage(successMsg);
    setTimeout(() => setToastMessage(""), 3000);

    if (token) {
      const action = newStatus === "approved" ? "approve" : "reject";
      const endpoint = `/api/absence-requests/${requestId}/${action}`;
      return attendanceService.updateAbsenceRequestStatus(endpoint, {
          admin_note_ar: adminNoteText,
        })
        .then((data) => {
          if (data.success) {
            fetchAbsenceRequests(true);
            if (newStatus === "approved") {
              fetchAttendance(true);
            }
            return { success: true };
          } else {
            console.error("Failed to update leave request status:", data.message);
            return { success: false, message: data.message };
          }
        })
        .catch((err) => {
          console.error("Error updating absence decision:", err);
          return { success: false, message: err.message };
        });
    } else {
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage, fetchAbsenceRequests, fetchAttendance]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAttendanceRecords([]);
      setAbsenceRequests([]);
      setIsStale(true);
    }
  }, [isAuthenticated]);

  const attendanceContextValue = useMemo(() => ({
    attendanceRecords,
    setAttendanceRecords,
    attendancePagination,
    selectedAttendanceMonth,
    setSelectedAttendanceMonth,
    attendanceRosterDate,
    setAttendanceRosterDate,
    absenceRequests,
    setAbsenceRequests,
    absenceRequestsPagination,
    loading,
    fetchAttendance,
    fetchAbsenceRequests,
    handleManualAttendanceChange,
    handleCellAttendanceChange,
    handleToggleDayAttendance,
    calculateStudentStats,
    handleAbsenceDecision,
  }), [
    attendanceRecords,
    attendancePagination,
    selectedAttendanceMonth,
    attendanceRosterDate,
    absenceRequests,
    absenceRequestsPagination,
    loading,
    fetchAttendance,
    fetchAbsenceRequests,
    handleManualAttendanceChange,
    handleCellAttendanceChange,
    handleToggleDayAttendance,
    calculateStudentStats,
    handleAbsenceDecision,
  ]);

  return (
    <AttendanceContext.Provider value={attendanceContextValue}>
      {children}
    </AttendanceContext.Provider>
  );
}
