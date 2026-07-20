import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StudentsContext } from './StudentsContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { useClasses } from '../Classes/useClasses';
import { useParents } from '../Parents/useParents';
import { useAttendance } from '../Attendance/useAttendance';
import { useNotifications } from '../Notifications/useNotifications';
import { studentsService } from '../../services/students/students.service';
import { parentsService } from '../../services/parents/parents.service';

export default function StudentsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { classes } = useClasses();
  const { parentUsers, setParentUsers } = useParents();
  const { attendanceRecords, setAttendanceRecords, selectedAttendanceMonth } = useAttendance();
  const { smsLogs, setSmsLogs } = useNotifications();
  const {
    setGrades,
    setToastMessage,
    t,
    lang,
  } = useApp();

  const [rawStudents, setRawStudents] = useState([]);
  const [isStale, setIsStale] = useState(true);
  const [loading, setLoading] = useState(false);
  const [studentsPagination, setStudentsPagination] = useState({
    total: 0,
    lastPage: 1,
    from: 0,
    to: 0,
    currentPage: 1,
    perPage: 20,
  });

  const fetchRequestRef = useRef(0);
  // AbortController for in-flight student fetch
  const abortRef = useRef(null);

  // Print & Modal states
  const [showCardVisualizerModal, setShowCardVisualizerModal] = useState(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState("all"); // 'all' or 'single'
  const [printSelectedMonth, setPrintSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [printStudentObject, setPrintStudentObject] = useState(null);

  /**
   * fetchStudents — supports two call signatures:
   *   fetchStudents()           — legacy: uses stale guard, fetches page 1
   *   fetchStudents(queryString) — paginated: fetches with full query string
   *   fetchStudents(true)       — force refresh with current queryString
   */
  const lastStudentsQueryRef = useRef(null);

  const fetchStudents = useCallback((arg) => {
    const isForce = arg === true;
    const isQueryString = typeof arg === 'string';
    const queryString = isQueryString ? arg : '?page=1&per_page=20';

    if (!isForce && !isStale && rawStudents.length > 0 && lastStudentsQueryRef.current === queryString) {
      return;
    }
    lastStudentsQueryRef.current = queryString;

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const reqId = ++fetchRequestRef.current;
    setLoading(true);
    studentsService.getStudents(queryString)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (reqId !== fetchRequestRef.current) return;
        if (!localStorage.getItem('auth_token')) return;
        if (data.success) {
          const mapped = (data.students || []).map((st) => ({
            id: Number(st.id),
            name: st.name_ar,
            nameEn: st.name_en,
            grade: st.grade,
            gradeEn: st.gradeEn,
            section: st.section,
            sectionEn: st.sectionEn,
            parentName: st.parentName,
            parentNameEn: st.parentNameEn,
            parentNationalId: st.parentNationalId,
            phone: st.phone,
            status: st.status,
            time: st.time,
            qrCode: st.qrCode,
            photo: st.photo,
            parentPhoto: '🧔',
          }));
          setRawStudents(mapped);
          setIsStale(false);

          // Update pagination metadata
          const pg = data.pagination || data.meta || {};
          setStudentsPagination({
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
        if (reqId !== fetchRequestRef.current) return;
        console.error('Error fetching students:', err);
        setToastMessage(err.message, "error");
      })
      .finally(() => {
        if (reqId === fetchRequestRef.current) {
          setLoading(false);
          abortRef.current = null;
        }
      });
  }, [isStale, rawStudents.length]);

  // Fetch students when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setRawStudents([]);
      setIsStale(true);
    }
  }, [isAuthenticated]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Derived student representation from raw students + parent info + attendance
  const students = useMemo(() => {
    return rawStudents.map(s => {
      let parentName = s.parentName;
      let parentNameEn = s.parentNameEn;
      let phone = s.phone;
      let parentNationalId = s.parentNationalId;

      if (parentNationalId) {
        const parent = parentUsers.find(p => p.nationalId === parentNationalId);
        if (parent) {
          parentName = parent.name;
          parentNameEn = parent.nameEn;
          phone = parent.phone;
        }
      }

      const record = attendanceRecords.find(r => r.studentId === s.id && r.date === todayStr);
      const status = record ? record.status : "absent";
      const time = record ? record.time : "--:--";

      return {
        ...s,
        parentName,
        parentNameEn,
        phone,
        status,
        time,
      };
    });
  }, [rawStudents, parentUsers, attendanceRecords, todayStr]);

  // Auto trigger absent parent SMS log alert after 10 AM (simulated)
  useEffect(() => {
    const triggerAbsentAlerts = () => {
      const absents = students.filter((s) => s.status === "absent");
      absents.forEach((student) => {
        const alreadySent = smsLogs.some(
          (log) => log.studentId === student.id && log.type === "absent",
        );
        if (!alreadySent) {
          const smsText =
            lang === "ar"
              ? `نفيدكم بأن ابنكم ${student.name} غائب عن المدرسة اليوم الأحد. رياض و مدارس انوار العلى الدولية النموذجية.`
              : `We inform you that your son ${student.nameEn} is absent from school today. Riyadh & Anwar Al-Ola International Model Schools.`;

          const newSms = {
            id: Date.now() + student.id,
            studentId: student.id,
            recipient: student.phone,
            text: smsText,
            time: "10:00",
            type: "absent",
          };
          setSmsLogs((prev) => [newSms, ...prev]);
        }
      });
    };

    const timer = setTimeout(triggerAbsentAlerts, 2000);
    return () => clearTimeout(timer);
  }, [students, lang, smsLogs, setSmsLogs]);

  // CRUD actions
  const handleAddStudent = useCallback((newStudent, newGradeRow, newParentObj) => {
    const token = localStorage.getItem("auth_token");
    
    // Resolve class ID
    const foundClass = classes.find(
      (c) => c.grade === newStudent.grade && c.section === newStudent.section
    );
    const classId = foundClass ? Number(String(foundClass.id).replace("cls-", "")) : null;
    
    const saveStudent = (parentId) => {
      if (!classId || !parentId) {
        console.error("Missing classId or parentId", { classId, parentId });
        return Promise.resolve({ success: false, message: "Missing classId or parentId" });
      }
      
      if (token) {
        return studentsService.createStudent({
            student_code: newStudent.qrCode,
            name_ar: newStudent.name,
            name_en: newStudent.nameEn,
            class_id: classId,
            parent_id: parentId,
            photo_url: newStudent.photo,
            qr_code: newStudent.qrCode,
            secret_code: newGradeRow.secretCode,
            tuition_fee: Number(newStudent.tuitionFee || 10000),
          })
          .then((data) => {
            if (data.success) {
              const addedStudent = {
                ...newStudent,
                id: Number(data.student.id),
                tuition_fee: Number(data.student.tuition_fee || newStudent.tuitionFee || 10000),
              };
              setRawStudents((prev) => [...prev, addedStudent]);
              
              const addedGrade = {
                ...newGradeRow,
                studentId: Number(data.student.id),
              };
              setGrades((prev) => [...prev, addedGrade]);
              
              setToastMessage(t.successToast);
              setTimeout(() => setToastMessage(""), 4000);
              return { success: true, student: data.student };
            } else {
              const msg = lang === "ar" ? "فشل إضافة الطالب في قاعدة البيانات" : "Failed to add student to database";
              setToastMessage(msg);
              setTimeout(() => setToastMessage(""), 4000);
              return { success: false, message: msg };
            }
          })
          .catch((err) => {
            console.error("Error storing student:", err);
            const msg = lang === "ar" ? `فشل إضافة الطالب: ${err.message}` : `Failed to add student: ${err.message}`;
            setToastMessage(msg);
            setTimeout(() => setToastMessage(""), 5000);
            return { success: false, message: msg };
          });
      } else {
        setRawStudents((prev) => [...prev, newStudent]);
        setGrades((prev) => [...prev, newGradeRow]);
        setToastMessage(t.successToast);
        setTimeout(() => setToastMessage(""), 4000);
        return Promise.resolve({ success: true });
      }
    };

    if (newParentObj) {
      if (token) {
        return parentsService.createParent({
            national_id: newParentObj.nationalId,
            name_ar: newParentObj.name,
            name_en: newParentObj.nameEn,
            phone: newParentObj.phone,
            photo_url: newParentObj.photo,
          })
          .then((data) => {
            if (data.success) {
              const createdParentId = data.parent.id;
              const mappedParent = {
                ...newParentObj,
                id: createdParentId,
              };
              setParentUsers((prev) => [...prev, mappedParent]);
              return saveStudent(createdParentId);
            } else {
              const msg = lang === "ar" ? "فشل إضافة ولي الأمر في قاعدة البيانات" : "Failed to add parent to database";
              setToastMessage(msg);
              setTimeout(() => setToastMessage(""), 4000);
              return { success: false, message: msg };
            }
          })
          .catch((err) => {
            console.error("Error storing parent:", err);
            const msg = lang === "ar" ? `فشل إضافة ولي الأمر: ${err.message}` : `Failed to add parent: ${err.message}`;
            setToastMessage(msg);
            setTimeout(() => setToastMessage(""), 5000);
            return { success: false, message: msg };
          });
      } else {
        setParentUsers((prev) => [...prev, newParentObj]);
        return saveStudent(newStudent.id);
      }
    } else {
      const existingParent = parentUsers.find(p => p.nationalId === newStudent.parentNationalId);
      if (existingParent && existingParent.id) {
        return saveStudent(existingParent.id);
      } else {
        console.error("Existing parent database ID not found");
        return saveStudent(1);
      }
    }
  }, [classes, parentUsers, setRawStudents, setGrades, setParentUsers, setToastMessage, lang, t]);

  const handleEditStudent = useCallback((studentId, updatedData) => {
    const token = localStorage.getItem("auth_token");
    
    const foundClass = classes.find(
      (c) => c.grade === updatedData.grade && c.section === updatedData.section
    );
    const classId = foundClass ? Number(String(foundClass.id).replace("cls-", "")) : null;

    if (token) {
      return studentsService.updateStudent(studentId, {
        name_ar: updatedData.name,
        name_en: updatedData.nameEn,
        class_id: classId,
        tuition_fee: Number(updatedData.tuitionFee),
        photo_url: updatedData.photo,
        is_active: updatedData.isActive !== undefined ? updatedData.isActive : true
      })
      .then((data) => {
        if (data.success) {
          setRawStudents((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, ...updatedData } : s))
          );
          setToastMessage(
            lang === "ar"
              ? "تم تحديث بيانات الطالب بنجاح!"
              : "Student details updated successfully!",
          );
          setTimeout(() => setToastMessage(""), 3000);
          return { success: true };
        } else {
          const msg = lang === "ar" ? "فشل تحديث بيانات الطالب" : "Failed to update student details";
          setToastMessage(msg);
          setTimeout(() => setToastMessage(""), 3000);
          return { success: false, message: msg };
        }
      })
      .catch((err) => {
        console.error("Error updating student:", err);
        const msg = lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
        return { success: false, message: msg };
      });
    } else {
      setRawStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...updatedData } : s))
      );
      setToastMessage(
        lang === "ar"
          ? "تم تحديث بيانات الطالب بنجاح!"
          : "Student details updated successfully!",
      );
      setTimeout(() => setToastMessage(""), 3000);
      return Promise.resolve({ success: true });
    }
  }, [classes, setRawStudents, setToastMessage, lang]);

  const handleDeleteStudent = useCallback((studentId) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return studentsService.deleteStudent(studentId)
        .then((data) => {
          if (data.success) {
            setRawStudents((prev) => prev.filter((s) => s.id !== studentId));
            setGrades((prev) => prev.filter((g) => g.studentId !== studentId));
            setToastMessage(
              lang === "ar"
                ? "تم حذف الطالب بنجاح!"
                : "Student deleted successfully!",
            );
            setTimeout(() => setToastMessage(""), 3000);
            return { success: true };
          } else {
            const msg = lang === "ar" ? "فشل حذف الطالب" : "Failed to delete student";
            setToastMessage(msg);
            setTimeout(() => setToastMessage(""), 3000);
            return { success: false, message: msg };
          }
        })
        .catch((err) => {
          console.error("Error deleting student:", err);
          const msg = lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(""), 3000);
          return { success: false, message: msg };
        });
    } else {
      setRawStudents((prev) => prev.filter((s) => s.id !== studentId));
      setGrades((prev) => prev.filter((g) => g.studentId !== studentId));
      setToastMessage(
        lang === "ar"
          ? "تم حذف الطالب بنجاح!"
          : "Student deleted successfully!",
      );
      setTimeout(() => setToastMessage(""), 3000);
      return Promise.resolve({ success: true });
    }
  }, [setRawStudents, setGrades, setToastMessage, lang]);

  const handleQrScan = useCallback((scannedStudentId) => {
    const token = localStorage.getItem("auth_token");
    const student = students.find((s) => s.id === scannedStudentId);
    if (!student) return false;

    const arrivalTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const isLate = arrivalTime > "07:45";
    const finalStatus = isLate ? "late" : "present";

    setRawStudents((prev) =>
      prev.map((s) => {
        if (s.id === scannedStudentId) {
          return {
            ...s,
            status: finalStatus,
            time: arrivalTime,
          };
        }
        return s;
      }),
    );

    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (r) => r.studentId === scannedStudentId && r.date === todayStr,
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          status: finalStatus,
          time: arrivalTime,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            studentId: scannedStudentId,
            date: todayStr,
            status: finalStatus,
            time: arrivalTime,
          },
        ];
      }
    });

    const smsText =
      finalStatus === "late"
        ? lang === "ar"
          ? `نفيدكم بتأخر ابنكم ${student.name} عن الطابور الصباحي، حيث حضر الساعة ${arrivalTime}. رياض و مدارس انوار العلى.`
          : `We inform you that your child ${student.nameEn} arrived late at school today at ${arrivalTime}. Riyadh & Anwar Al-Ola.`
        : lang === "ar"
          ? `تم تسجيل دخول ابنكم ${student.name} للمدرسة بنجاح، وقت الحضور ${arrivalTime}. يوم سعيد! رياض و مدارس انوار العلى.`
          : `Your child ${student.nameEn} entered school successfully today at ${arrivalTime}. Have a great day! Riyadh & Anwar Al-Ola.`;

    const newSms = {
      id: Date.now(),
      studentId: scannedStudentId,
      recipient: student.phone,
      text: smsText,
      time: arrivalTime,
      type: finalStatus,
    };
    setSmsLogs((prev) => [newSms, ...prev]);

    if (token) {
      studentsService.gateScan(scannedStudentId)
        .then((data) => {
          if (!data.success) {
            console.error("Gate scan backend error:", data.message);
          }
        })
        .catch((err) => console.error("Error sending gate scan to API:", err));
    }

    return { student, finalStatus, arrivalTime };
  }, [students, lang, todayStr, setSmsLogs, setAttendanceRecords, setRawStudents]);

  const handleGateScan = handleQrScan;

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

  const handleManualAttendanceNoteChange = useCallback((studentId, noteText) => {
    setRawStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, attendanceNote: noteText } : s,
      ),
    );
  }, [setRawStudents]);

  const studentsContextValue = useMemo(() => ({
    handleManualAttendanceNoteChange,
    students,
    setStudents: setRawStudents,
    loading,
    fetchStudents,
    studentsPagination,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleQrScan,
    handleGateScan,
    calculateStudentStats,
    showCardVisualizerModal,
    setShowCardVisualizerModal,
    selectedStudentForCard,
    setSelectedStudentForCard,
    showPrintModal,
    setShowPrintModal,
    printMode,
    setPrintMode,
    printSelectedMonth,
    setPrintSelectedMonth,
    printStudentObject,
    setPrintStudentObject,
  }), [
    handleManualAttendanceNoteChange,
    students,
    loading,
    fetchStudents,
    studentsPagination,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleQrScan,
    handleGateScan,
    calculateStudentStats,
    showCardVisualizerModal,
    selectedStudentForCard,
    showPrintModal,
    printMode,
    printSelectedMonth,
    printStudentObject,
  ]);

  return (
    <StudentsContext.Provider value={studentsContextValue}>
      {children}
    </StudentsContext.Provider>
  );
}
