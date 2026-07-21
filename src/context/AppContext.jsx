import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

const AppContext = createContext();

import { dictionary } from "../locales/dictionary";
import { defaultDetailedGradeObj } from "../data/initialData";
import { useAuth } from "../contexts/Auth/useAuth";






import { settingsService } from "../services/settings/settings.service";
import { smsBus } from "../utils/smsBus";

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState("ar");
  const [darkMode, setDarkMode] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Modal & Printing UI States
  const [selectedGradeStudentId, setSelectedGradeStudentId] = useState(null);
  const [selectedGradeTerm, setSelectedGradeTerm] = useState("term1");
  const [selectedGradeSubject, setSelectedGradeSubject] = useState("الرياضيات");

  // Authentication states
  const { isAuthenticated, currentUser } = useAuth();

  // School core data states
  const [grades, setGrades] = useState([]);

  // New integrated features states
  const [assignments, setAssignments] = useState([]);
  const [detailedGrades, setDetailedGrades] = useState([]);
  const [isStaleControl, setIsStaleControl] = useState(true);
  const [isStaleAssignments, setIsStaleAssignments] = useState(true);
  const [assignmentsPagination, setAssignmentsPagination] = useState({
    total: 0, lastPage: 1, from: 0, to: 0, currentPage: 1, perPage: 20
  });
  const [controlPagination, setControlPagination] = useState({
    total: 0, lastPage: 1, from: 0, to: 0, currentPage: 1, perPage: 20
  });

  const fetchControlGradesRequestRef = useRef(0);
  const fetchAssignmentsRequestRef   = useRef(0);
  const assignmentsAbortRef          = useRef(null);
  // Stable refs to avoid stale-closure deps in fetchAssignments
  const isStaleAssignmentsRef = useRef(true);
  const assignmentsCountRef   = useRef(0);


  // Vice Principals (Supervisors) state
  const [vicePrincipals, setVicePrincipals] = useState([]);

  // Permission helper: check if user has view access to a module
  const hasPermission = useCallback((module) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;

    // Parents default allowed modules
    if (currentUser.role === 'parent') {
      const allowedModules = ['students', 'schedule', 'scanner', 'absenceRequests', 'assignments', 'examSchedules', 'detailedGrades', 'communications'];
      return allowedModules.includes(module);
    }

    // Teachers default allowed modules
    if (currentUser.role === 'teacher') {
      const allowedModules = ['students', 'parents', 'teachers', 'classes', 'subjects', 'schedule', 'scanner', 'absenceRequests', 'assignments', 'examSchedules', 'detailedGrades', 'teacherReports', 'communications'];
      return allowedModules.includes(module);
    }

    // Preparation Supervisors default allowed modules
    if (currentUser.role === 'preparation_supervisor') {
      const allowedModules = ['students', 'parents', 'classes', 'schedule', 'scanner', 'absenceRequests', 'communications'];
      return allowedModules.includes(module);
    }

    // Supervisors access via custom JSON permissions
    if (currentUser.role === 'supervisor') {
      const perms = currentUser.permissions;
      if (!perms) return false;
      if (perms.full_access) return true;
      if (!perms[module]) return false;
      const mp = perms[module];
      if (Array.isArray(mp) && !mp.actions) return mp.includes('view');
      if (mp.actions) return mp.actions.includes('view');
      return false;
    }

    return false;
  }, [currentUser]);

  // Permission helper: check if user can perform a specific action on a module
  const canAction = useCallback((module, action) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;

    // Parent actions
    if (currentUser.role === 'parent') {
      if (module === 'absenceRequests' && ['view', 'create', 'delete'].includes(action)) return true;
      return action === 'view';
    }

    // Teacher actions
    if (currentUser.role === 'teacher') {
      if (module === 'assignments' && ['view', 'create', 'update', 'delete'].includes(action)) return true;
      if (module === 'teacherReports' && ['view', 'create'].includes(action)) return true;
      return action === 'view' || action === 'update';
    }

    // Preparation Supervisor actions
    if (currentUser.role === 'preparation_supervisor') {
      if (module === 'absenceRequests' && ['view', 'approve', 'reject'].includes(action)) return true;
      if (module === 'scanner' && ['view', 'create'].includes(action)) return true;
      return action === 'view';
    }

    // Supervisor actions via permissions JSON
    if (currentUser.role === 'supervisor') {
      const perms = currentUser.permissions;
      if (!perms) return false;
      if (perms.full_access) return true;
      if (!perms[module]) return false;
      const mp = perms[module];
      if (Array.isArray(mp) && !mp.actions) return mp.includes(action);
      if (mp.actions) return mp.actions.includes(action);
      return false;
    }

    return false;
  }, [currentUser]);

  const [toast, setToast] = useState({ message: "", type: "success" });
  const toastMessage = toast.message;
  const toastType = toast.type;

  const setToastMessage = useCallback((msg, type = "success") => {
    // Robustly ignore AbortError objects if passed directly
    if (msg && (msg.name === "AbortError" || msg.isCancelled === true)) {
      return;
    }

    if (!msg) {
      setToast({ message: "", type: "success" });
    } else if (typeof msg === "object") {
      setToast({ message: msg.message || "", type: msg.type || "success" });
    } else {
      setToast({ message: msg, type: type });
    }
  }, []);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const triggerConfirm = useCallback(({ title, message, type, onConfirm, onCancel }) => {
    setConfirmState({
      isOpen: true,
      title: title || (lang === 'ar' ? 'تأكيد الإجراء' : 'Confirm Action'),
      message,
      type: type || 'danger',
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [lang, setConfirmState]);
  // Gate Scanner Simulator states



  const t = dictionary[lang];





  const fetchControlGrades = useCallback((arg) => {
    const isForce = arg === true;
    const isQueryString = typeof arg === 'string';
    const qs = isQueryString ? arg : '';

    if (!isForce && !isQueryString && !isStaleControl && grades.length > 0) {
      return;
    }
    const reqId = ++fetchControlGradesRequestRef.current;
    settingsService.getGradesControl(qs)
      .then((data) => {
        // Guard: ignore response if user has logged out
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchControlGradesRequestRef.current) return;
        if (data.success) {
          const mapped = data.control_grades.map((g) => ({
            studentId: Number(g.student_id),
            name: g.student ? g.student.name_ar : "",
            nameEn: g.student ? g.student.name_en : "",
            secretCode: g.secret_code || "",
            class_name_ar: g.class_name_ar || "",
            class_name_en: g.class_name_en || "",
            math: g.math !== null ? Number(g.math) : null,
            science: g.science !== null ? Number(g.science) : null,
            arabic: g.arabic !== null ? Number(g.arabic) : null,
            english: g.english !== null ? Number(g.english) : null,
          }));
          setGrades(mapped);
          setControlPagination({
            total: data.total || 0,
            lastPage: data.last_page || 1,
            currentPage: data.current_page || 1,
            perPage: data.per_page || 20,
            from: (data.current_page - 1) * data.per_page + 1,
            to: Math.min(data.current_page * data.per_page, data.total || 0)
          });
          setIsStaleControl(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (reqId === fetchControlGradesRequestRef.current) {
          console.error("Error fetching control grades:", err);
          setToastMessage(err.message, "error");
        }
      });
  }, [isStaleControl, grades.length, setGrades, setControlPagination]);

  const fetchAssignments = useCallback((arg) => {
    const isForce       = arg === true;
    const isQueryString = typeof arg === 'string';
    const queryString   = isQueryString ? arg : '?page=1&per_page=20';

    // Use stable refs — no re-creation when assignments change
    if (!isForce && !isQueryString && !isStaleAssignmentsRef.current && assignmentsCountRef.current > 0) return;

    if (assignmentsAbortRef.current) assignmentsAbortRef.current.abort();
    const controller = new AbortController();
    assignmentsAbortRef.current = controller;

    const reqId = ++fetchAssignmentsRequestRef.current;
    settingsService.getAssignments(queryString)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (reqId !== fetchAssignmentsRequestRef.current) return;
        if (!localStorage.getItem('auth_token')) return;
        if (data.success) {
          const rawList = data.assignments || data.data || [];
          const mapped = rawList.map((ass) => {
            const classObj   = ass.school_class || {};
            const subjObj    = ass.subject      || {};
            const teacherObj = ass.teacher      || {};
            const subs = (ass.submissions || []).map((sub) => {
              let status = 'notSubmitted';
              if (sub.status === 'submitted')      status = 'submitted';
              else if (sub.status === 'submitted_late') status = 'submittedLate';
              else if (sub.status === 'not_submitted')  status = 'notSubmitted';
              return {
                studentId:   Number(sub.student_id),
                studentName: sub.student ? sub.student.name_ar : '',
                status,
                teacherNote: sub.teacher_note || '',
              };
            });
            return {
              id:            ass.id,
              grade:         classObj.grade_ar   || '',
              section:       classObj.section_ar || '',
              subjectName:   subjObj.name_ar     || '',
              subjectNameEn: subjObj.name_en     || '',
              teacherName:   teacherObj.name_ar  || teacherObj.name_en || '',
              teacherNameEn: teacherObj.name_en  || teacherObj.name_ar || '',
              teacherId:     teacherObj.id       || null,
              title:         ass.title,
              content:       ass.content         || '',
              dateCreated:   ass.date_created    || (ass.created_at ? ass.created_at.split('T')[0] : ''),
              dueDate:       ass.due_date,
              attachments:   ass.attachment_url  ? [ass.attachment_url] : [],
              submissions:   subs,
            };
          });
          // Update stable refs first
          isStaleAssignmentsRef.current = false;
          assignmentsCountRef.current   = mapped.length;
          setAssignments(mapped);
          setIsStaleAssignments(false);

          const pg = data.pagination || data.meta || {};
          setAssignmentsPagination({
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
        if (reqId !== fetchAssignmentsRequestRef.current) return;
        console.error('Error fetching assignments:', err);
        setToastMessage(err.message, 'error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // ← stable: refs keep state without re-creating the function

  useEffect(() => {
    if (!isAuthenticated) {
      setGrades([]);
      setAssignments([]);
      setDetailedGrades([]);
      setIsStaleControl(true);
      setIsStaleAssignments(true);
      // Reset stable refs on logout
      isStaleAssignmentsRef.current = true;
      assignmentsCountRef.current   = 0;
    }
  }, [isAuthenticated]);

  // Load detailed grades dynamically for the selected student
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("auth_token");
    if (token && selectedGradeStudentId) {
      settingsService.getDetailedGrades(selectedGradeStudentId)
        .then((data) => {
          if (!active) return;
          if (data.success) {
            const gradesMap = {
              term1: {
                الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              },
              term2: {
                الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              },
            };

            (Array.isArray(data.grades) ? data.grades : []).forEach((g) => {
              const termKey = g.term; // 'term1' or 'term2'
              const subjName = g.subject ? g.subject.name_ar : null;
              if (subjName && gradesMap[termKey] && gradesMap[termKey][subjName]) {
                const monthKey = g.month; // 'm1', 'm2', 'm3', or 'final'
                if (monthKey === 'final') {
                  gradesMap[termKey][subjName].finalExam = Number(g.final_exam) || 0;
                } else if (gradesMap[termKey][subjName][monthKey]) {
                  gradesMap[termKey][subjName][monthKey] = {
                    homework: Number(g.hw_grade) || 0,
                    attendance: Number(g.att_grade) || 0,
                    behavior: Number(g.beh_grade) || 0,
                    oral: Number(g.oral_grade) || 0,
                    written: Number(g.wrt_grade) || 0,
                  };
                }
              }
            });

            setDetailedGrades((prev) => {
              const filtered = prev.filter(item => item.studentId !== selectedGradeStudentId);
              return [
                ...filtered,
                {
                  studentId: selectedGradeStudentId,
                  studentName: "",
                  grades: gradesMap,
                }
              ];
            });
          }
        })
        .catch((err) => console.error("Error fetching detailed grades:", err));
    }
    return () => {
      active = false;
    };
  }, [selectedGradeStudentId, isAuthenticated]);

  // Set html page direction
  useEffect(() => {
    document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);

  // Set dark mode HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showNotificationsDropdown &&
        !e.target.closest(".notifications-dropdown-container") &&
        !e.target.closest(".notifications-btn")
      ) {
        setShowNotificationsDropdown(false);
      }
      if (
        showProfileDropdown &&
        !e.target.closest(".profile-dropdown-container") &&
        !e.target.closest(".profile-btn")
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showNotificationsDropdown, showProfileDropdown]);

  // Render photo utility helper
  const renderAvatar = useCallback((photo, defaultEmoji, customStyle = {}) => {
    if (photo && typeof photo === "string") {
      const resolvedPhoto = photo.trim();
      if (
        resolvedPhoto.startsWith("data:") ||
        resolvedPhoto.startsWith("http") ||
        resolvedPhoto.startsWith("/") ||
        resolvedPhoto.includes("/uploads/avatars/")
      ) {
        let finalSrc = resolvedPhoto;
        if (resolvedPhoto.includes("/uploads/avatars/") && !resolvedPhoto.startsWith("http")) {
          const index = resolvedPhoto.indexOf("/uploads/avatars/");
          finalSrc = resolvedPhoto.substring(index);
        }
        return (
          <img
            src={finalSrc}
            alt="Avatar"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              objectFit: "cover",
              verticalAlign: "middle",
              marginInlineEnd: customStyle.marginInlineEnd !== undefined ? customStyle.marginInlineEnd : "8px",
              ...customStyle,
            }}
          />
        );
      }
    }
    return (
      <span
        style={{
          fontSize: customStyle.fontSize || "18px",
          marginInlineEnd: customStyle.marginInlineEnd !== undefined ? customStyle.marginInlineEnd : "8px",
          verticalAlign: "middle",
          ...customStyle,
        }}
      >
        {photo || defaultEmoji}
      </span>
    );
  }, []);

  const handleAddAssignmentAction = useCallback((newAssignment, matchingTeacherId, students) => {
    setAssignments((prev) => [newAssignment, ...prev]);

    setToastMessage(t.assignmentSuccessToast);
    setTimeout(() => setToastMessage(""), 3000);

    const classStudents = students.filter(
      (s) =>
        s.grade === newAssignment.grade && s.section === newAssignment.section,
    );
    classStudents.forEach((student) => {
      const smsText =
        lang === "ar"
          ? `تم نشر واجب جديد للمادة ${newAssignment.subjectName}: "${newAssignment.title}". موعد التسليم: ${newAssignment.dueDate}. رياض و مدارس انوار العلى.`
          : `New homework assignment published for ${newAssignment.subjectName}: "${newAssignment.title}". Due: ${newAssignment.dueDate}. Riyadh & Anwar Al-Ola.`;
      smsBus.emit((logs) => [
        {
          id: Date.now() + Math.random(),
          studentId: student.id,
          recipient: student.phone,
          text: smsText,
          time: "14:30",
          type: "present",
        },
        ...logs,
      ]);
    });
  }, [lang, t, setToastMessage]);

  const handleUpdateSubmissionStatusAction = useCallback((
    assignmentId,
    studentId,
    newStatus,
    note,
    students,
  ) => {
    setAssignments((prev) =>
      prev.map((assign) => {
        if (assign.id === assignmentId) {
          const updatedSubs = assign.submissions.map((sub) => {
            if (sub.studentId === studentId) {
              return { ...sub, status: newStatus, teacherNote: note };
            }
            return sub;
            });
          const exists = assign.submissions.some(
            (sub) => sub.studentId === studentId,
          );
          if (!exists) {
            const student = students.find((s) => s.id === studentId);
            updatedSubs.push({
              studentId,
              studentName: student ? student.name : "",
              status: newStatus,
              teacherNote: note,
            });
          }
          return { ...assign, submissions: updatedSubs };
        }
        return assign;
      }),
    );
  }, []);

  const handleDeleteAssignmentAction = useCallback((assignmentId) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      return settingsService.deleteAssignment(assignmentId)
        .then((data) => {
          if (data.success) {
            setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
            setToastMessage(lang === "ar" ? "تم حذف الواجب بنجاح." : "Assignment deleted successfully.");
            setTimeout(() => setToastMessage(""), 3000);
            return { success: true };
          } else {
            setToastMessage(lang === "ar" ? `فشل الحذف: ${data.message}` : `Delete failed: ${data.message}`);
            setTimeout(() => setToastMessage(""), 4000);
            return { success: false };
          }
        })
        .catch((err) => {
          console.error("Error deleting assignment:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 4000);
          return { success: false };
        });
    } else {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      setToastMessage(lang === "ar" ? "تم حذف الواجب بنجاح." : "Assignment deleted successfully.");
      setTimeout(() => setToastMessage(""), 3000);
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage]);

  const handleDeleteAllAssignmentsAction = useCallback(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      return settingsService.deleteAllAssignments()
        .then((data) => {
          if (data.success) {
            setAssignments([]);
            setToastMessage(lang === "ar" ? "تم حذف جميع الواجبات بنجاح." : "All assignments deleted successfully.");
            setTimeout(() => setToastMessage(""), 3000);
            return { success: true };
          } else {
            setToastMessage(lang === "ar" ? `فشل الحذف: ${data.message}` : `Delete failed: ${data.message}`);
            setTimeout(() => setToastMessage(""), 4000);
            return { success: false };
          }
        })
        .catch((err) => {
          console.error("Error deleting all assignments:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 4000);
          return { success: false };
        });
    } else {
      setAssignments([]);
      setToastMessage(lang === "ar" ? "تم حذف جميع الواجبات بنجاح." : "All assignments deleted successfully.");
      setTimeout(() => setToastMessage(""), 3000);
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage]);

  const getStudentDetailedGrades = useCallback((studentId, subject, term) => {
    const record = detailedGrades.find((r) => r.studentId === studentId);
    if (!record || !record.grades[term] || !record.grades[term][subject]) {
      return defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
    }
    return record.grades[term][subject];
  }, [detailedGrades]);

  const handleDetailedGradeChangeAction = useCallback((
    studentId,
    subject,
    term,
    monthKey,
    field,
    rawNum,
    students,
    subjects,
  ) => {
    const token = localStorage.getItem("auth_token");
    const num = rawNum === "" ? 0 : (parseFloat(rawNum) || 0);

    setDetailedGrades((prev) => {
      let studentRecord = prev.find((r) => r.studentId === studentId);
      if (!studentRecord) {
        const student = (students || []).find((s) => s.id === studentId);
        studentRecord = {
          studentId,
          studentName: student ? student.name : "",
          grades: {
            term1: {
              الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
            },
            term2: {
              الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
            },
          },
        };
        prev = [...prev, studentRecord];
      }

      return prev.map((r) => {
        if (r.studentId === studentId) {
          const updatedGrades = { ...r.grades };
          const termGrades = { ...updatedGrades[term] };
          const subjectGrades = { ...termGrades[subject] };

          if (monthKey === "finalExam") {
            subjectGrades.finalExam = num;
          } else {
            subjectGrades[monthKey] = {
              ...subjectGrades[monthKey],
              [field]: num,
            };
          }

          termGrades[subject] = subjectGrades;
          updatedGrades[term] = termGrades;
          return { ...r, grades: updatedGrades };
        }
        return r;
      });
    });

    if (token && subjects) {
      const foundSub = subjects.find((s) => s.name === subject || s.id === subject);
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;

      if (subjectId) {
        setDetailedGrades((currentDetailed) => {
          const rec = currentDetailed.find((r) => r.studentId === studentId);
          if (rec && rec.grades[term] && rec.grades[term][subject]) {
            const subjGrades = rec.grades[term][subject];

            const reqBody = {
              student_id: Number(studentId),
              subject_id: subjectId,
              term: term === "term1" ? "1" : "2",
              month: monthKey === "finalExam" ? "final" : monthKey,
            };

            if (monthKey === "finalExam") {
              reqBody.final_exam = subjGrades.finalExam;
            } else {
              const mObj = subjGrades[monthKey];
              reqBody.hw_grade = mObj.homework;
              reqBody.att_grade = mObj.attendance;
              reqBody.beh_grade = mObj.behavior;
              reqBody.oral_grade = mObj.oral;
              reqBody.wrt_grade = mObj.written;
            }

            settingsService.saveDetailedGrade(reqBody)
              .then((data) => {
                if (!data.success) {
                  console.error("Failed to save grade:", data.message);
                }
              })
              .catch((err) => console.error("Error saving grade:", err));
          }
          return currentDetailed;
        });
      }
    }
  }, [setDetailedGrades]);

  const syncGeneralGradesAction = useCallback((studentId) => {
    const record = detailedGrades.find((r) => r.studentId === studentId);
    if (!record) return;

    const subjectsMap = {
      الرياضيات: "math",
      العلوم: "science",
      "اللغة العربية": "arabic",
      "اللغة الإنجليزية": "english",
    };

    setGrades((prev) =>
      prev.map((row) => {
        if (row.studentId === studentId) {
          const updatedRow = { ...row };
          Object.keys(subjectsMap).forEach((subName) => {
            const field = subjectsMap[subName];

            const t1 =
              record.grades.term1[subName] ||
              defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
            const t1_m1 =
              t1.m1.homework +
              t1.m1.attendance +
              t1.m1.behavior +
              t1.m1.oral +
              t1.m1.written;
            const t1_m2 =
              t1.m2.homework +
              t1.m2.attendance +
              t1.m2.behavior +
              t1.m2.oral +
              t1.m2.written;
            const t1_m3 =
              t1.m3.homework +
              t1.m3.attendance +
              t1.m3.behavior +
              t1.m3.oral +
              t1.m3.written;
            const t1_avg = (t1_m1 + t1_m2 + t1_m3) / 15;
            const t1_total = t1_avg + t1.finalExam;

            const t2 =
              record.grades.term2[subName] ||
              defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
            const t2_m1 =
              t2.m1.homework +
              t2.m1.attendance +
              t2.m1.behavior +
              t2.m1.oral +
              t2.m1.written;
            const t2_m2 =
              t2.m2.homework +
              t2.m2.attendance +
              t2.m2.behavior +
              t2.m2.oral +
              t2.m2.written;
            const t2_m3 =
              t2.m3.homework +
              t2.m3.attendance +
              t2.m3.behavior +
              t2.m3.oral +
              t2.m3.written;
            const t2_avg = (t2_m1 + t2_m2 + t2_m3) / 15;
            const t2_total = t2_avg + t2.finalExam;

            const yearly = Math.round(t1_total + t2_total);
            updatedRow[field] = yearly;
          });
          return updatedRow;
        }
        return row;
      }),
    );
  }, [detailedGrades, setGrades]);

  const handleGradeCellChangeAction = useCallback((studentId, subject, val) => {
    const num = val === '' ? 0 : Math.min(100, Math.max(0, parseInt(val) || 0));
    setGrades(prev => prev.map(row => {
      if (row.studentId === studentId) {
        return { ...row, [subject]: num };
      }
      return row;
    }));
  }, [setGrades]);

  const fetchClassGrades = useCallback((classId) => {
    const token = localStorage.getItem("auth_token");
    if (!token || !classId) return;
    settingsService.getClassGrades(classId)
      .then((data) => {
        if (data.success && Array.isArray(data.students)) {
          setDetailedGrades((prev) => {
            const incomingIds = data.students.map(s => Number(s.studentId));
            const filtered = prev.filter(r => !incomingIds.includes(Number(r.studentId)));
            return [
              ...filtered,
              ...data.students.map(s => ({
                studentId: Number(s.studentId),
                studentName: s.studentName || "",
                // The backend (/api/grades/class/{id}) already returns grades as a
                // pre-processed nested object: { term1: { Subject: { m1, m2, m3, finalExam } } }
                // Use it directly — do NOT iterate it as a flat array.
                grades: s.grades || {},
              }))
            ];
          });
        }
      })
      .catch((err) => console.error("Error fetching class grades:", err));
  }, [setDetailedGrades]);

  const appContextValue = useMemo(() => ({
    lang,
    setLang,
    t,
    darkMode,
    setDarkMode,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showProfileDropdown,
    setShowProfileDropdown,

    grades,
    setGrades,
    assignments,
    setAssignments,
    assignmentsPagination,
    detailedGrades,
    setDetailedGrades,
    fetchClassGrades,

    toastMessage,
    toastType,
    setToastMessage,
    confirmState,
    triggerConfirm,
    renderAvatar,
    // Actions
    handleAddAssignment: handleAddAssignmentAction,
    handleUpdateSubmissionStatus: handleUpdateSubmissionStatusAction,
    getStudentDetailedGrades,
    handleDetailedGradeChange: handleDetailedGradeChangeAction,
    syncGeneralGrades: syncGeneralGradesAction,
    handleDeleteAssignment: handleDeleteAssignmentAction,
    handleDeleteAllAssignments: handleDeleteAllAssignmentsAction,
    handleGradeCellChange: handleGradeCellChangeAction,
    selectedGradeStudentId,
    setSelectedGradeStudentId,
    selectedGradeTerm,
    setSelectedGradeTerm,
    selectedGradeSubject,
    setSelectedGradeSubject,
    // Vice Principals & Permissions
    vicePrincipals,
    setVicePrincipals,
    hasPermission,
    canAction,
    // Refresh functions
    fetchControlGrades,
    fetchAssignments,
    controlPagination,
    setControlPagination,
  }), [
    lang,
    t,
    darkMode,
    isSidebarCollapsed,
    isMobileMenuOpen,
    showProfileDropdown,
    grades,
    assignments,
    assignmentsPagination,
    controlPagination,
    setControlPagination,
    detailedGrades,
    fetchClassGrades,
    toastMessage,
    toastType,
    setToastMessage,
    confirmState,
    triggerConfirm,
    renderAvatar,
    handleAddAssignmentAction,
    handleUpdateSubmissionStatusAction,
    getStudentDetailedGrades,
    handleDetailedGradeChangeAction,
    syncGeneralGradesAction,
    handleDeleteAssignmentAction,
    handleDeleteAllAssignmentsAction,
    handleGradeCellChangeAction,
    selectedGradeStudentId,
    selectedGradeTerm,
    selectedGradeSubject,
    vicePrincipals,
    hasPermission,
    canAction,
    fetchControlGrades,
    fetchAssignments,
  ]);

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
