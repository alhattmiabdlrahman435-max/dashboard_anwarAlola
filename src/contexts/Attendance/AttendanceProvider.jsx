import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const fetchAttendance = useCallback((token) => {
    const activeToken = token || localStorage.getItem("auth_token");
    if (!activeToken) return;

    setLoading(true);
    attendanceService.getAttendance()
      .then((data) => {
        if (data.success) {
          const mapped = data.attendance.map((rec) => ({
            id: rec.id,
            studentId: Number(rec.student_id),
            date: rec.record_date,
            status: rec.status, // 'present', 'absent'
            time: rec.arrival_time ? rec.arrival_time.substring(0, 5) : "--:--",
          }));
          setAttendanceRecords(mapped);
        }
      })
      .catch((err) => console.error("Error fetching attendance:", err))
      .finally(() => setLoading(false));
  }, []);

  const fetchAbsenceRequests = useCallback((token) => {
    const activeToken = token || localStorage.getItem("auth_token");
    if (!activeToken) return;

    attendanceService.getAbsenceRequests()
      .then((data) => {
        if (data.success) {
          const mapped = data.absence_requests.map((req) => {
            const studentName = req.student ? req.student.name_ar : "";
            const className = req.student && req.student.school_class
              ? `${req.student.school_class.grade_ar} - ${req.student.school_class.section_ar}`
              : "";
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
              adminNote: req.admin_note_ar,
              adminNoteEn: req.admin_note_en,
            };
          });
          setAbsenceRequests(mapped);
        }
      })
      .catch((err) => console.error("Error fetching absence requests:", err));
  }, []);

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
    if (!student) return;

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

    if (token && newStatus) {
      attendanceService.saveAttendance({
          student_id: Number(studentId),
          date: date,
          status: newStatus === "late" ? "present" : newStatus,
          arrival_time: newStatus === "present" ? "07:30:00" : (newStatus === "late" ? "07:55:00" : null),
          note: "تم التعديل يدوياً من لوحة الإدارة",
        })
        .then((data) => {
          if (!data.success) {
            console.error("Failed to sync attendance to backend:", data.message);
          }
        })
        .catch((err) => console.error("Error syncing attendance:", err));
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
    setToastMessage(
      newStatus === "approved" ? t.approvedNoteToast : t.rejectedNoteToast,
    );
    setTimeout(() => setToastMessage(""), 3000);

    if (token) {
      const action = newStatus === "approved" ? "approve" : "reject";
      const endpoint = `/api/absence-requests/${requestId}/${action}`;
      attendanceService.updateAbsenceRequestStatus(endpoint, {
          admin_note_ar: adminNoteText,
        })
        .then((data) => {
          if (data.success) {
            fetchAbsenceRequests(token);
            if (newStatus === "approved") {
              fetchAttendance(token);
            }
          } else {
            console.error("Failed to update leave request status:", data.message);
          }
        })
        .catch((err) => console.error("Error updating absence decision:", err));
    }
  }, [lang, t, setToastMessage, fetchAbsenceRequests, fetchAttendance]);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("auth_token");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAttendance(token);
      fetchAbsenceRequests(token);
    }
  }, [isAuthenticated, fetchAttendance, fetchAbsenceRequests]);

  const attendanceContextValue = useMemo(() => ({
    attendanceRecords,
    setAttendanceRecords,
    selectedAttendanceMonth,
    setSelectedAttendanceMonth,
    attendanceRosterDate,
    setAttendanceRosterDate,
    absenceRequests,
    setAbsenceRequests,
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
    selectedAttendanceMonth,
    attendanceRosterDate,
    absenceRequests,
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
