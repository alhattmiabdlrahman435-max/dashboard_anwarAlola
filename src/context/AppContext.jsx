import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import sloganLogo from "../assets/slogan.jpeg";

const AppContext = createContext();

import { dictionary } from "../locales/dictionary";
export { dictionary };
import { api } from "../services/api";
import {
  initialStudents,
  initialParentUsers,
  initialSupervisors,
  initialTeachers,
  initialSubjects,
  initialClasses,
  initialSchedule,
  initialGrades,
  initialAbsenceRequests,
  initialAssignments,
  defaultDetailedGradeObj,
  initialDetailedGrades,
  initialNotifications,
} from "../data/initialData";

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState("ar");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("active_tab") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("active_tab", activeTab);
  }, [activeTab]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Modal & Printing UI States
  const [showCardVisualizerModal, setShowCardVisualizerModal] = useState(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState("subject"); // 'month' | 'subject' | 'term'
  const [printSelectedMonth, setPrintSelectedMonth] = useState("m1"); // 'm1' | 'm2' | 'm3'
  const [selectedGradeStudentId, setSelectedGradeStudentId] = useState(202601);
  const [selectedGradeTerm, setSelectedGradeTerm] = useState("term1");
  const [selectedGradeSubject, setSelectedGradeSubject] = useState("الرياضيات");
  const [printStudentObject, setPrintStudentObject] = useState(null);

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  // School core data states
  const [students, setStudents] = useState(initialStudents);
  const [supervisors, setSupervisors] = useState(initialSupervisors);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [schedules, setSchedules] = useState(initialSchedule);
  const [grades, setGrades] = useState(initialGrades);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [classes, setClasses] = useState(initialClasses);

  // Dynamic available classes and sections configuration
  const [availableGrades, setAvailableGrades] = useState([
    "تمهيدي أول",
    "تمهيدي ثاني",
    "الصف الأول",
    "الصف الثاني",
    "الصف الثالث",
    "الصف الرابع",
    "الصف الخامس",
    "الصف السادس",
    "الصف الأول المتوسط",
    "الصف الثاني المتوسط",
    "الصف الثالث المتوسط",
    "الصف الأول الثانوي",
    "الصف الثاني الثانوي",
    "الصف الثالث الثانوي",
  ]);
  const [availableSections, setAvailableSections] = useState([
    "أ",
    "ب",
    "ج",
    "د",
    "هـ",
    "و",
    "ز",
  ]);

  // Standalone parent accounts database
  const [parentUsers, setParentUsers] = useState(initialParentUsers);

  // New integrated features states
  const [absenceRequests, setAbsenceRequests] = useState(
    initialAbsenceRequests,
  );
  const [assignments, setAssignments] = useState(initialAssignments);
  const [detailedGrades, setDetailedGrades] = useState(initialDetailedGrades);
  const [examSchedules, setExamSchedules] = useState([]);
  const [tuitionFees, setTuitionFees] = useState({ baseFees: {}, payments: [] });
  const [notifications, setNotifications] = useState(initialNotifications);
  const [teacherReports, setTeacherReports] = useState([]);

  // Vice Principals (Supervisors) state
  const [vicePrincipals, setVicePrincipals] = useState([]);

  // Permission helper: check if user has view access to a module
  const hasPermission = useCallback((module) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role !== 'supervisor') return false;
    const perms = currentUser.permissions;
    if (!perms) return false;
    if (perms.full_access) return true;
    if (!perms[module]) return false;
    const mp = perms[module];
    if (Array.isArray(mp) && !mp.actions) return mp.includes('view');
    if (mp.actions) return mp.actions.includes('view');
    return false;
  }, [currentUser]);

  // Permission helper: check if user can perform a specific action on a module
  const canAction = useCallback((module, action) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role !== 'supervisor') return false;
    const perms = currentUser.permissions;
    if (!perms) return false;
    if (perms.full_access) return true;
    if (!perms[module]) return false;
    const mp = perms[module];
    if (Array.isArray(mp) && !mp.actions) return mp.includes(action);
    if (mp.actions) return mp.actions.includes(action);
    return false;
  }, [currentUser]);

  const [toast, setToast] = useState({ message: "", type: "success" });
  const toastMessage = toast.message;
  const toastType = toast.type;

  const setToastMessage = useCallback((msg, type = "success") => {
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

  const triggerConfirm = ({ title, message, type, onConfirm, onCancel }) => {
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
  };
  // Gate Scanner Simulator states
  const [smsLogs, setSmsLogs] = useState([]);
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] =
    useState(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    });

  // Attendance records (from backend / API)
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Digital Control states
  const [isGradesEncrypted, setIsGradesEncrypted] = useState(false);
  const [controlPrefix, setControlPrefix] = useState("SEC-");
  const [controlMultiplier, setControlMultiplier] = useState(3);
  const [controlOffset, setControlOffset] = useState(1000);
  const [controlModulo, setControlModulo] = useState(10000);

  const t = dictionary[lang];

  // Auto-login using saved Sanctum token
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      api.get("/api/me")
        .then((data) => {
          if (data.success) {
            setIsAuthenticated(true);
            // Convert from database fields to frontend structure if necessary
            const mappedUser = {
              id: data.user.id,
              name: data.user.name,
              name_ar: data.user.name_ar,
              name_en: data.user.name_en,
              username: data.user.username,
              role: data.user.role,
              photo: data.user.photo_url || "أ ع",
              email: null,
            };
            setCurrentUser(mappedUser);
          } else {
            localStorage.removeItem("auth_token");
          }
        })
        .catch((err) => {
          console.error("API Auto-Login error:", err);
        });
    }
  }, []);

  const fetchNotifications = (token) => {
    api.get("/api/notifications")
      .then((data) => {
        if (data.success) {
          const mapped = data.notifications.map((notif) => {
            let type = "parents";
            if (notif.target_type === "by_class") type = "class";
            else if (notif.target_type === "by_student") type = "student";
            else if (notif.target_type === "specific_teacher") type = "teacher";

            let studentName = null;
            let studentNameEn = null;
            if (notif.target_type === "by_student" && notif.target_id) {
              const foundStudent = students.find(
                (s) => s.id === Number(notif.target_id),
              );
              if (foundStudent) {
                studentName = foundStudent.name;
                studentNameEn = foundStudent.nameEn;
              }
            }

            let teacherName = null;
            let teacherNameEn = null;
            if (notif.target_type === "specific_teacher" && notif.target_id) {
              const foundTeacher = teachers.find(
                (t) => t.id === Number(notif.target_id),
              );
              if (foundTeacher) {
                teacherName = foundTeacher.name;
                teacherNameEn = foundTeacher.nameEn;
              }
            }

            let gradeName = null;
            if (notif.target_type === "by_class" && notif.target_id) {
              const foundClass = classes.find(
                (c) =>
                  Number(String(c.id).replace("cls-", "")) ===
                  Number(notif.target_id),
              );
              if (foundClass) {
                gradeName = foundClass.name;
              }
            }

            return {
              id: notif.id,
              title: notif.title,
              content: notif.content,
              date: notif.created_at
                ? notif.created_at.substring(0, 16).replace("T", " ")
                : "",
              type: type,
              isRead: !!notif.is_read,
              studentId:
                notif.target_type === "by_student" ? notif.target_id : null,
              studentName: studentName,
              studentNameEn: studentNameEn,
              teacherId:
                notif.target_type === "specific_teacher"
                  ? notif.target_id
                  : null,
              teacherName: teacherName,
              teacherNameEn: teacherNameEn,
              grade: gradeName,
            };
          });
          setNotifications(mapped);
        }
      })
      .catch((err) => console.error("Error fetching notifications:", err));
  };

  const fetchSubjects = (token) => {
    api.get("/api/subjects")
      .then((data) => {
        if (data.success) {
          const mapped = data.subjects.map((sub) => ({
            id: `sub-${sub.id}`,
            name: sub.name_ar,
            nameEn: sub.name_en,
          }));
          setSubjects(mapped);
        }
      })
      .catch((err) => console.error("Error fetching subjects:", err));
  };

  const fetchClasses = (token) => {
    api.get("/api/classes")
      .then((data) => {
        if (data.success) {
          const mapped = data.classes.map((cls) => {
            const classSubjects = cls.subjects
              ? cls.subjects.map((sub) => sub.name_ar)
              : [];
            return {
              id: `cls-${cls.id}`,
              name: `${cls.grade_ar} - ${cls.section_ar}`,
              nameEn: `${cls.grade_en} - ${cls.section_en}`,
              grade: cls.grade_ar,
              gradeEn: cls.grade_en,
              section: cls.section_ar,
              sectionEn: cls.section_en,
              subjects: classSubjects,
            };
          });
          setClasses(mapped);

          // Update availableSections (merge with existing to prevent deletion)
          const dbSections = data.classes.map((c) => c.section_ar);
          if (dbSections.length > 0) {
            setAvailableSections((prev) => {
              const merged = new Set([...prev, ...dbSections]);
              return Array.from(merged);
            });
          }
        }
      })
      .catch((err) => console.error("Error fetching classes:", err));
  };

  const fetchStudents = (token) => {
    api.get("/api/students")
      .then((data) => {
        if (data.success) {
          const mapped = data.students.map((st) => ({
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
            parentPhoto: "🧔",
          }));
          setStudents(mapped);
        }
      })
      .catch((err) => console.error("Error fetching students:", err));
  };

  const fetchParents = (token) => {
    api.get("/api/parents")
      .then((data) => {
        if (data.success) {
          const mapped = data.parents.map((p) => ({
            id: p.id,
            nationalId: p.national_id,
            name: p.name_ar || p.name,
            nameEn: p.name_en || p.name,
            phone: p.phone,
            username: p.username,
            password: "parent_password123",
            photo: p.photo_url || "🧔",
          }));
          setParentUsers(mapped);
        }
      })
      .catch((err) => console.error("Error fetching parents:", err));
  };

  const fetchAttendance = (token) => {
    api.get("/api/attendance")
      .then((data) => {
        if (data.success) {
          const mapped = data.attendance.map((rec) => ({
            id: rec.id,
            studentId: Number(rec.student_id),
            date: rec.record_date,
            status: rec.status,
            time: rec.arrival_time ? rec.arrival_time.substring(0, 5) : "--:--",
          }));
          setAttendanceRecords(mapped);
        }
      })
      .catch((err) => console.error("Error fetching attendance:", err));
  };

  const fetchAbsenceRequests = (token) => {
    api.get("/api/absence-requests")
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
  };

  const fetchControlGrades = (token) => {
    api.get("/api/grades/control")
      .then((data) => {
        if (data.success) {
          const mapped = data.control_grades.map((g) => ({
            studentId: Number(g.student_id),
            name: g.student ? g.student.name_ar : "",
            nameEn: g.student ? g.student.name_en : "",
            secretCode: g.secret_code || "",
            math: g.math !== null ? Number(g.math) : null,
            science: g.science !== null ? Number(g.science) : null,
            arabic: g.arabic !== null ? Number(g.arabic) : null,
            english: g.english !== null ? Number(g.english) : null,
          }));
          setGrades(mapped);
        }
      })
      .catch((err) => console.error("Error fetching control grades:", err));
  };

  const fetchFinanceData = (token) => {
    api.get("/api/finance/students")
      .then((data) => {
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
          });
        }
      })
      .catch((err) => console.error("Error fetching finance data:", err));
  };

  const fetchDashboardStats = (token) => {
    api.get("/api/dashboard/stats")
      .then((data) => {
        if (data.success) {
          setDashboardStats(data.stats);
        }
      })
      .catch((err) => console.error("Error fetching dashboard stats:", err));
  };

  const fetchWeeklySchedules = (token) => {
    api.get("/api/schedules")
      .then((data) => {
        if (data.success && data.schedules && Object.keys(data.schedules).length > 0) {
          setSchedules(data.schedules);
        }
      })
      .catch((err) => console.error("Error fetching weekly schedules:", err));
  };

  const fetchTeacherReports = (token) => {
    api.get("/api/reports")
      .then((data) => {
        if (data.success) {
          setTeacherReports(data.reports);
        }
      })
      .catch((err) => console.error("Error fetching teacher reports:", err));
  };

  const fetchAssignments = (token) => {
    api.get("/api/assignments")
      .then((data) => {
        if (data.success) {
          const mapped = data.assignments.map((ass) => {
            const classObj = ass.school_class || {};
            const subjObj = ass.subject || {};
            const teacherObj = ass.teacher || {};
            const subs = (ass.submissions || []).map((sub) => {
              let status = "notSubmitted";
              if (sub.status === "submitted") status = "submitted";
              else if (sub.status === "submitted_late") status = "submittedLate";
              else if (sub.status === "not_submitted") status = "notSubmitted";
              return {
                studentId: Number(sub.student_id),
                studentName: sub.student ? sub.student.name_ar : "",
                status: status,
                teacherNote: sub.teacher_note || "",
              };
            });

            return {
              id: ass.id,
              grade: classObj.grade_ar || "",
              section: classObj.section_ar || "",
              subjectName: subjObj.name_ar || "",
              subjectNameEn: subjObj.name_en || "",
              teacherName: teacherObj.name_ar || teacherObj.name_en || "",
              teacherNameEn: teacherObj.name_en || teacherObj.name_ar || "",
              teacherId: teacherObj.id || null,
              title: ass.title,
              content: ass.content || "",
              dateCreated: ass.date_created || (ass.created_at ? ass.created_at.split('T')[0] : ""),
              dueDate: ass.due_date,
              attachments: ass.attachment_url ? [ass.attachment_url] : [],
              submissions: subs,
            };
          });
          setAssignments(mapped);
        }
      })
      .catch((err) => console.error("Error fetching assignments:", err));
  };

  const fetchExamSchedules = (token) => {
    api.get("/api/exam-schedules")
      .then((data) => {
        if (data.success) {
          const mapped = data.exam_schedules.map((sch) => {
            const classObj = sch.class || {};
            const subs = (sch.subjects || []).map((sub) => ({
              id: sub.id,
              subjectName: sub.name_ar,
              date: sub.exam_date,
              time: sub.exam_time,
              note: sub.note || "",
            }));

            return {
              id: sch.id,
              grade: classObj.grade_ar || "",
              section: classObj.section_ar || "",
              term: sch.term === "term1" ? "الفصل الأول" : (sch.term === "term2" ? "الفصل الثاني" : sch.term),
              termEn: sch.term === "term1" ? "First Term" : (sch.term === "term2" ? "Second Term" : sch.term),
              period: sch.title,
              periodEn: sch.title,
              subjects: subs,
            };
          });
          setExamSchedules(mapped);
        }
      })
      .catch((err) => console.error("Error fetching exam schedules:", err));
  };

  const fetchTeachers = (token) => {
    api.get("/api/teachers")
      .then((data) => {
        if (data.success) {
          const mapped = data.teachers.map((t) => {
            const classNames = [];
            const subjectNames = [];
            const teachingAssignments = [];

            if (t.assignments) {
              t.assignments.forEach((assign) => {
                const className = assign.school_class
                  ? assign.school_class.name_ar || assign.school_class.name
                  : "";
                const subjectName = assign.subject
                  ? assign.subject.name_ar || assign.subject.name
                  : "";

                if (className && !classNames.includes(className)) {
                  classNames.push(className);
                }
                if (subjectName && !subjectNames.includes(subjectName)) {
                  subjectNames.push(subjectName);
                }
                if (className && subjectName) {
                  teachingAssignments.push({
                    subject: subjectName,
                    class: className,
                  });
                }
              });
            }

            return {
              id: t.id,
              jobId: t.job_id,
              phone: t.phone || "",
              address: t.address || "",
              name: t.name_ar || t.name_en || "",
              nameEn: t.name_en || t.name_ar || "",
              subject: subjectNames.join("، "),
              subjectEn: subjectNames.join(", "),
              subjects: subjectNames,
              classes: classNames,
              teachingAssignments: teachingAssignments,
              gradesEntered: t.grades_entered || 0,
              assignments: t.assignments_count || 0,
              photo: t.photo_url || "👨‍🏫",
            };
          });
          setTeachers(mapped);
        }
      })
      .catch((err) => console.error("Error fetching teachers:", err));
  };
  const fetchSupervisors = (token) => {
    api.get("/api/supervisors")
      .then((data) => {
        if (data.success) {
          setSupervisors(data.supervisors);
        }
      })
      .catch((err) => console.error("Error fetching supervisors:", err));
  };

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        fetchNotifications(token);
        fetchTeachers(token);
        fetchSupervisors(token);
        fetchSubjects(token);
        fetchClasses(token);
        fetchStudents(token);
        fetchParents(token);
        fetchAttendance(token);
        fetchAbsenceRequests(token);
        fetchControlGrades(token);
        fetchAssignments(token);
        fetchExamSchedules(token);
        fetchFinanceData(token);
        fetchDashboardStats(token);
        fetchWeeklySchedules(token);
        fetchTeacherReports(token);
      }
    }
  }, [isAuthenticated]);

  // Load detailed grades dynamically for the selected student
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && selectedGradeStudentId) {
      api.get(`/api/grades/detailed/${selectedGradeStudentId}`)
        .then((data) => {
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

            data.grades.forEach((g) => {
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
              const student = students.find(s => s.id === selectedGradeStudentId);
              return [
                ...filtered,
                {
                  studentId: selectedGradeStudentId,
                  studentName: student ? student.name : "",
                  grades: gradesMap,
                }
              ];
            });
          }
        })
        .catch((err) => console.error("Error fetching detailed grades:", err));
    }
  }, [selectedGradeStudentId, isAuthenticated, students]);

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

  // Auto trigger absent parent SMS log alert after 10 AM (simulated)
  useEffect(() => {
    const triggerAbsentAlerts = () => {
      const absents = students.filter((s) => s.status === "absent");
      absents.forEach((student) => {
        // Send SMS to parents if not already sent
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
  }, [students, lang, smsLogs]);

  // Render photo utility helper
  const renderAvatar = (photo, defaultEmoji, customStyle = {}) => {
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
  };

  const handleAddStudentAction = (newStudent, newGradeRow, newParentObj) => {
    const token = localStorage.getItem("auth_token");
    
    // Resolve class ID
    const foundClass = classes.find(
      (c) => c.grade === newStudent.grade && c.section === newStudent.section
    );
    const classId = foundClass ? Number(String(foundClass.id).replace("cls-", "")) : null;
    
    const saveStudent = (parentId) => {
      if (!classId || !parentId) {
        console.error("Missing classId or parentId", { classId, parentId });
        return;
      }
      
      if (token) {
        api.post("/api/students", {
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
              // Update local state with the returned student (including database ID)
              const addedStudent = {
                ...newStudent,
                id: Number(data.student.id),
                tuition_fee: Number(data.student.tuition_fee || newStudent.tuitionFee || 10000),
              };
              setStudents((prev) => [...prev, addedStudent]);
              
              // Also update grades array
              const addedGrade = {
                ...newGradeRow,
                studentId: Number(data.student.id),
              };
              setGrades((prev) => [...prev, addedGrade]);
              
              setToastMessage(t.successToast);
              setTimeout(() => setToastMessage(""), 4000);
            } else {
              setToastMessage(lang === "ar" ? "فشل إضافة الطالب في قاعدة البيانات" : "Failed to add student to database");
              setTimeout(() => setToastMessage(""), 4000);
            }
          })
          .catch((err) => {
            console.error("Error storing student:", err);
            setToastMessage(lang === "ar" ? `فشل إضافة الطالب: ${err.message}` : `Failed to add student: ${err.message}`);
            setTimeout(() => setToastMessage(""), 5000);
          });
      } else {
        // Fallback for mock environment
        setStudents((prev) => [...prev, newStudent]);
        setGrades((prev) => [...prev, newGradeRow]);
        setToastMessage(t.successToast);
        setTimeout(() => setToastMessage(""), 4000);
      }
    };

    if (newParentObj) {
      if (token) {
        // First create parent on backend
        api.post("/api/parents", {
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
              
              // Now save student with the created parent's ID
              saveStudent(createdParentId);
            } else {
              setToastMessage(lang === "ar" ? "فشل إضافة ولي الأمر في قاعدة البيانات" : "Failed to add parent to database");
              setTimeout(() => setToastMessage(""), 4000);
            }
          })
          .catch((err) => {
            console.error("Error storing parent:", err);
            setToastMessage(lang === "ar" ? `فشل إضافة ولي الأمر: ${err.message}` : `Failed to add parent: ${err.message}`);
            setTimeout(() => setToastMessage(""), 5000);
          });
      } else {
        // Fallback
        setParentUsers((prev) => [...prev, newParentObj]);
        saveStudent(newStudent.id); // temporary mockup ID
      }
    } else {
      // Parent already exists, find backend ID
      const existingParent = parentUsers.find(p => p.nationalId === newStudent.parentNationalId);
      if (existingParent && existingParent.id) {
        saveStudent(existingParent.id);
      } else {
        // Fallback or missing parent ID mapping
        console.error("Existing parent database ID not found");
        saveStudent(1); // default fallback
      }
    }
  };

  const handleEditStudentAction = (studentId, updatedData) => {
    const token = localStorage.getItem("auth_token");
    
    const foundClass = classes.find(
      (c) => c.grade === updatedData.grade && c.section === updatedData.section
    );
    const classId = foundClass ? Number(String(foundClass.id).replace("cls-", "")) : null;

    if (token) {
      api.put(`/api/students/${studentId}`, {
        name_ar: updatedData.name,
        name_en: updatedData.nameEn,
        class_id: classId,
        tuition_fee: Number(updatedData.tuitionFee),
        photo_url: updatedData.photo,
        is_active: updatedData.isActive !== undefined ? updatedData.isActive : true
      })
      .then((data) => {
        if (data.success) {
          setStudents((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, ...updatedData } : s))
          );
          setToastMessage(
            lang === "ar"
              ? "تم تحديث بيانات الطالب بنجاح!"
              : "Student details updated successfully!",
          );
          setTimeout(() => setToastMessage(""), 3000);
        } else {
          setToastMessage(lang === "ar" ? "فشل تحديث بيانات الطالب" : "Failed to update student details");
          setTimeout(() => setToastMessage(""), 3000);
        }
      })
      .catch((err) => {
        console.error("Error updating student:", err);
        setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
        setTimeout(() => setToastMessage(""), 3000);
      });
    } else {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...updatedData } : s))
      );
      setToastMessage(
        lang === "ar"
          ? "تم تحديث بيانات الطالب بنجاح!"
          : "Student details updated successfully!",
      );
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleDeleteStudentAction = (studentId) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      api.delete(`/api/students/${studentId}`)
        .then((data) => {
          if (data.success) {
            setStudents((prev) => prev.filter((s) => s.id !== studentId));
            setGrades((prev) => prev.filter((g) => g.studentId !== studentId));
            setToastMessage(
              lang === "ar"
                ? "تم حذف الطالب بنجاح!"
                : "Student deleted successfully!",
            );
            setTimeout(() => setToastMessage(""), 3000);
          } else {
            setToastMessage(lang === "ar" ? "فشل حذف الطالب" : "Failed to delete student");
            setTimeout(() => setToastMessage(""), 3000);
          }
        })
        .catch((err) => {
          console.error("Error deleting student:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 3000);
        });
    } else {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setGrades((prev) => prev.filter((g) => g.studentId !== studentId));
      setToastMessage(
        lang === "ar"
          ? "تم حذف الطالب بنجاح!"
          : "Student deleted successfully!",
      );
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleDeleteParentAction = (parentId) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      api.delete(`/api/parents/${parentId}`)
        .then((data) => {
          if (data.success) {
            const parent = parentUsers.find((p) => p.id === parentId);
            if (parent) {
              setParentUsers((prev) => prev.filter((p) => p.id !== parentId));
              setStudents((prev) =>
                prev.map((s) => {
                  if (s.parentNationalId === parent.nationalId) {
                    return {
                      ...s,
                      parentName: "",
                      parentNameEn: "",
                      phone: "",
                      parentNationalId: "",
                    };
                  }
                  return s;
                }),
              );
            }
            setToastMessage(
              lang === "ar"
                ? "تم حذف ولي الأمر بنجاح!"
                : "Parent deleted successfully!",
            );
            setTimeout(() => setToastMessage(""), 3000);
          } else {
            setToastMessage(lang === "ar" ? "فشل حذف ولي الأمر" : "Failed to delete parent");
            setTimeout(() => setToastMessage(""), 3000);
          }
        })
        .catch((err) => {
          console.error("Error deleting parent:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 3000);
        });
    } else {
      const parent = parentUsers.find((p) => p.id === parentId);
      if (parent) {
        setParentUsers((prev) => prev.filter((p) => p.id !== parentId));
        setStudents((prev) =>
          prev.map((s) => {
            if (s.parentNationalId === parent.nationalId) {
              return {
                ...s,
                parentName: "",
                parentNameEn: "",
                phone: "",
                parentNationalId: "",
              };
            }
            return s;
          }),
        );
      }
      setToastMessage(
        lang === "ar"
          ? "تم حذف ولي الأمر بنجاح!"
          : "Parent deleted successfully!",
      );
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleAddTeacherAction = (newTeacher) => {
    const token = localStorage.getItem("auth_token");
    setTeachers((prev) => [...prev, newTeacher]);
    setToastMessage(
      lang === "ar" ? "تم تسجيل المعلم بنجاح!" : "Teacher added successfully!",
    );
    setTimeout(() => setToastMessage(""), 4000);

    if (token) {
      // Find subject_id and class_id from names
      const apiAssignments = newTeacher.teachingAssignments.map(a => {
        const sub = subjects.find(s => s.name === a.subject);
        const cls = classes.find(c => c.name === a.class);
        let subjectId = sub?.id;
        if (subjectId && typeof subjectId === 'string' && subjectId.startsWith('sub-')) {
          subjectId = parseInt(subjectId.replace('sub-', ''), 10);
        }
        let classId = cls?.id;
        if (classId && typeof classId === 'string' && classId.startsWith('cls-')) {
          classId = parseInt(classId.replace('cls-', ''), 10);
        }
        return { subject_id: subjectId, class_id: classId };
      }).filter(a => a.subject_id && a.class_id);

      api.post("/api/teachers", {
          job_id: newTeacher.jobId,
          name_ar: newTeacher.name,
          name_en: newTeacher.nameEn,
          phone: newTeacher.phone,
          address: newTeacher.address,
          photo_url: newTeacher.photo,
          assignments: apiAssignments,
        })
      .then(data => {
        if (data.success) {
          fetchTeachers(token);
        } else {
          console.error("Failed to save teacher:", data.message);
        }
      })
      .catch(err => console.error("Error saving teacher:", err));
    }
  };

  const handleAddParentAction = (newParent) => {
    setParentUsers((prev) => [...prev, newParent]);
    setToastMessage(
      lang === "ar"
        ? "تم تسجيل حساب ولي الأمر بنجاح!"
        : "Parent account registered successfully!",
    );
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleEditParentAction = (
    updatedParent,
    linkedNameSync,
    parentNationalId,
  ) => {
    const parent = parentUsers.find(p => p.nationalId === parentNationalId);
    const parentId = parent?.id;
    const token = localStorage.getItem("auth_token");

    if (token && parentId) {
      api.put(`/api/parents/${parentId}`, {
        name_ar: updatedParent.name,
        name_en: updatedParent.nameEn,
        phone: updatedParent.phone,
        photo_url: updatedParent.photo,
      })
      .then((data) => {
        if (data.success) {
          const finalParent = {
            ...updatedParent,
            id: parentId,
          };
          setParentUsers((prev) =>
            prev.map((p) => (p.nationalId === parentNationalId ? finalParent : p)),
          );
          setStudents((prev) =>
            prev.map((s) => {
              if (s.parentNationalId === parentNationalId) {
                return {
                  ...s,
                  parentName: updatedParent.name,
                  parentNameEn: updatedParent.nameEn,
                  phone: updatedParent.phone,
                };
              }
              return s;
            }),
          );
          setToastMessage(
            lang === "ar"
              ? "تم تحديث حساب ولي الأمر وتعديل بيانات الاتصال بنجاح!"
              : "Parent account details updated successfully!",
          );
          setTimeout(() => setToastMessage(""), 4000);
        } else {
          setToastMessage(lang === "ar" ? "فشل تحديث بيانات ولي الأمر" : "Failed to update parent details");
          setTimeout(() => setToastMessage(""), 4000);
        }
      })
      .catch((err) => {
        console.error("Error updating parent:", err);
        setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
        setTimeout(() => setToastMessage(""), 4000);
      });
    } else {
      setParentUsers((prev) =>
        prev.map((p) => (p.nationalId === parentNationalId ? updatedParent : p)),
      );
      setStudents((prev) =>
        prev.map((s) => {
          if (s.parentNationalId === parentNationalId) {
            return {
              ...s,
              parentName: updatedParent.name,
              parentNameEn: updatedParent.nameEn,
              phone: updatedParent.phone,
            };
          }
          return s;
        }),
      );
      setToastMessage(
        lang === "ar"
          ? "تم تحديث حساب ولي الأمر وتعديل بيانات الاتصال بنجاح!"
          : "Parent account details updated successfully!",
      );
      setTimeout(() => setToastMessage(""), 4000);
    }
  };

  const handleEditTeacherAction = (updatedTeacher, teacherId) => {
    const token = localStorage.getItem("auth_token");
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? updatedTeacher : t)),
    );
    setToastMessage(
      lang === "ar"
        ? "تم تحديث بيانات المعلم بنجاح!"
        : "Teacher details updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 4000);

    if (token) {
      const apiAssignments = (updatedTeacher.teachingAssignments || []).map(a => {
        const sub = subjects.find(s => s.name === a.subject);
        const cls = classes.find(c => c.name === a.class);
        let subjectId = sub?.id;
        if (subjectId && typeof subjectId === 'string' && subjectId.startsWith('sub-')) {
          subjectId = parseInt(subjectId.replace('sub-', ''), 10);
        }
        let classId = cls?.id;
        if (classId && typeof classId === 'string' && classId.startsWith('cls-')) {
          classId = parseInt(classId.replace('cls-', ''), 10);
        }
        return { subject_id: subjectId, class_id: classId };
      }).filter(a => a.subject_id && a.class_id);

      api.put(`/api/teachers/${teacherId}`, {
          name_ar: updatedTeacher.name,
          name_en: updatedTeacher.nameEn,
          phone: updatedTeacher.phone,
          address: updatedTeacher.address,
          photo_url: updatedTeacher.photo,
          assignments: apiAssignments,
        })
      .then(data => {
        if (data.success) {
          fetchTeachers(token);
        } else {
          console.error("Failed to update teacher:", data.message);
        }
      })
      .catch(err => console.error("Error updating teacher:", err));
    }
  };

  const handleAddSupervisorAction = (newSupervisor) => {
    const token = localStorage.getItem("auth_token");
    setSupervisors(prev => [...prev, newSupervisor]);
    setToastMessage(lang === 'ar' ? 'تم تسجيل مشرف التحضير بنجاح!' : 'Prep supervisor added successfully!');
    setTimeout(() => setToastMessage(''), 4000);

    if (token) {
      api.post("/api/supervisors", {
          jobId: newSupervisor.jobId,
          name: newSupervisor.name,
          phone: newSupervisor.phone,
          password: newSupervisor.password,
          classes: newSupervisor.classes,
          photo: newSupervisor.photo
        })
      .then(data => {
        if (data.success) {
          setSupervisors(prev => prev.map(s => s.jobId === newSupervisor.jobId ? data.supervisor : s));
        } else {
          console.error("Failed to save supervisor:", data.message);
        }
      })
      .catch(err => console.error("Error saving supervisor:", err));
    }
  };

  const handleEditSupervisorAction = (updatedSupervisor, supervisorId) => {
    const token = localStorage.getItem("auth_token");
    setSupervisors(prev => prev.map(s => s.id === supervisorId ? updatedSupervisor : s));
    setToastMessage(lang === 'ar' ? 'تم تحديث بيانات المشرف بنجاح!' : 'Supervisor details updated successfully!');
    setTimeout(() => setToastMessage(''), 4000);

    if (token) {
      api.put(`/api/supervisors/${supervisorId}`, {
          jobId: updatedSupervisor.jobId,
          name: updatedSupervisor.name,
          phone: updatedSupervisor.phone,
          password: updatedSupervisor.password !== "teacher_password123" ? updatedSupervisor.password : undefined,
          classes: updatedSupervisor.classes,
          photo: updatedSupervisor.photo
        })
      .then(data => {
        if (!data.success) {
          console.error("Failed to update supervisor:", data.message);
        }
      })
      .catch(err => console.error("Error updating supervisor:", err));
    }
  };

  const handleDeleteSupervisorAction = (supervisorId) => {
    const token = localStorage.getItem("auth_token");
    setSupervisors(prev => prev.filter(s => s.id !== supervisorId));
    setToastMessage(lang === 'ar' ? 'تم حذف المشرف بنجاح!' : 'Supervisor deleted successfully!');
    setTimeout(() => setToastMessage(''), 4000);

    if (token) {
      api.delete(`/api/supervisors/${supervisorId}`)
      .then(data => {
        if (!data.success) {
          console.error("Failed to delete supervisor:", data.message);
        }
      })
      .catch(err => console.error("Error deleting supervisor:", err));
    }
  };

  const handleAddClassAction = (newClass) => {
    setClasses((prev) => [...prev, newClass]);
    setToastMessage(
      lang === "ar"
        ? "تمت إضافة الفصل الدراسي بنجاح!"
        : "Class created successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleEditClassAction = (updatedClass, classId) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? updatedClass : c)),
    );
    setToastMessage(
      lang === "ar"
        ? "تم تحديث بيانات الفصل بنجاح!"
        : "Class details updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDeleteClassAction = (id) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setToastMessage(
      lang === "ar" ? "تم حذف الفصل بنجاح" : "Class deleted successfully",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddSubjectAction = (newSubject, classesListToUpdate) => {
    setSubjects((prev) => [...prev, newSubject]);
    setClasses((prev) =>
      prev.map((c) => {
        if (classesListToUpdate.includes(c.name)) {
          if (!c.subjects.includes(newSubject.name)) {
            return { ...c, subjects: [...c.subjects, newSubject.name] };
          }
        } else {
          return {
            ...c,
            subjects: c.subjects.filter((s) => s !== newSubject.name),
          };
        }
        return c;
      }),
    );
    setToastMessage(
      lang === "ar"
        ? "تمت إضافة المادة بنجاح!"
        : "Subject created successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleEditSubjectAction = (
    updatedSubject,
    subjectId,
    oldName,
    newName,
    classesListToUpdate,
  ) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? updatedSubject : s)),
    );
    setClasses((prev) =>
      prev.map((c) => {
        let classSubjects = c.subjects;
        if (classesListToUpdate.includes(c.name)) {
          if (classSubjects.includes(oldName)) {
            classSubjects = classSubjects.map((s) =>
              s === oldName ? newName : s,
            );
          } else {
            classSubjects = [...classSubjects, newName];
          }
        } else {
          classSubjects = classSubjects.filter(
            (s) => s !== oldName && s !== newName,
          );
        }
        return { ...c, subjects: classSubjects };
      }),
    );
    setTeachers((prev) =>
      prev.map((t) => {
        let tSubs = t.subjects || [];
        if (tSubs.includes(oldName)) {
          tSubs = tSubs.map((s) => (s === oldName ? newName : s));
        }
        const tSub = t.subject === oldName ? newName : t.subject;
        return { ...t, subject: tSub, subjects: tSubs };
      }),
    );
    setToastMessage(
      lang === "ar"
        ? "تم تحديث المادة بنجاح!"
        : "Subject details updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDeleteSubjectAction = (id, subName) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        subjects: c.subjects.filter((s) => s !== subName),
      })),
    );
    setToastMessage(
      lang === "ar" ? "تم حذف المادة بنجاح" : "Subject deleted successfully",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddGradeAction = (gradeName) => {
    setAvailableGrades((prev) => [...prev, gradeName]);
    setToastMessage(
      lang === "ar"
        ? `تمت إضافة الصف الدراسي: ${gradeName}`
        : `Grade level added: ${gradeName}`,
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRemoveGradeAction = (gradeName) => {
    setAvailableGrades((prev) => prev.filter((g) => g !== gradeName));
    setToastMessage(
      lang === "ar"
        ? `تم حذف الصف الدراسي: ${gradeName}`
        : `Grade level removed: ${gradeName}`,
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddSectionAction = (sectionInput) => {
    const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز'];
    const englishLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const secMap = {
      'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E', 'و': 'F', 'ز': 'G',
      'A': 'أ', 'B': 'ب', 'C': 'ج', 'D': 'د', 'E': 'هـ', 'F': 'و', 'G': 'ز'
    };

    if (availableSections.length >= 7) {
      setToastMessage(
        lang === "ar"
          ? "عذراً، لا يمكن إضافة أكثر من 7 شعب دراسية!"
          : "Sorry, you cannot add more than 7 class sections!"
      );
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    let targetSection = "";
    const trimmedInput = (sectionInput || "").trim().toUpperCase();

    if (!trimmedInput) {
      // Auto-name: find the first unused letter from arabicLetters
      targetSection = arabicLetters.find(l => !availableSections.includes(l));
      if (!targetSection) {
        setToastMessage(
          lang === "ar"
            ? "عذراً، لا يمكن إضافة أكثر من 7 شعب دراسية!"
            : "Sorry, you cannot add more than 7 class sections!"
        );
        setTimeout(() => setToastMessage(""), 3000);
        return;
      }
    } else {
      // User typed something
      if (englishLetters.includes(trimmedInput)) {
        targetSection = secMap[trimmedInput];
      } else if (arabicLetters.includes(trimmedInput)) {
        targetSection = trimmedInput;
      } else {
        targetSection = trimmedInput.slice(0, 2);
      }

      if (availableSections.includes(targetSection)) {
        setToastMessage(
          lang === "ar"
            ? `الشعبة "${targetSection}" مضافة بالفعل!`
            : `Section "${targetSection}" is already added!`
        );
        setTimeout(() => setToastMessage(""), 3000);
        return;
      }
    }

    setAvailableSections((prev) => [...prev, targetSection]);
    const displayVal = lang === "ar" ? targetSection : (secMap[targetSection] || targetSection);
    setToastMessage(
      lang === "ar"
        ? `تمت إضافة الشعبة: ${displayVal}`
        : `Section added: ${displayVal}`,
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRemoveSectionAction = (sectionName) => {
    setAvailableSections((prev) => prev.filter((s) => s !== sectionName));
    setToastMessage(
      lang === "ar"
        ? `تم حذف الشعبة: ${sectionName}`
        : `Section removed: ${sectionName}`,
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleManualAttendanceChangeAction = (
    studentId,
    newStatus,
    rosterDate,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            status: newStatus,
            time:
              newStatus === "present"
                ? "07:30"
                : newStatus === "late"
                  ? "08:00"
                  : "--:--",
          };
        }
        return s;
      }),
    );

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
      setSmsLogs((prev) => [newSms, ...prev]);
    }

    setToastMessage(
      lang === "ar"
        ? "تم تحديث حالة حضور الطالب بنجاح!"
        : "Attendance status updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleManualAttendanceNoteChangeAction = (studentId, noteText) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, attendanceNote: noteText } : s,
      ),
    );
  };

  const handleCellAttendanceChangeAction = (
    studentId,
    date,
    newStatus,
    rosterDate,
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

    if (date === rosterDate) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            return {
              ...s,
              status: newStatus || "absent",
              time:
                newStatus === "present"
                  ? "07:30"
                  : newStatus === "late"
                    ? "07:55"
                    : "--:--",
            };
          }
          return s;
        }),
      );
    }

    if (token && newStatus) {
      api.post("/api/attendance", {
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
  };

  const handleToggleDayAttendanceAction = (
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
  };

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

  const handleAbsenceDecisionAction = (requestId, newStatus, adminNoteText) => {
    const token = localStorage.getItem("auth_token");

    setAbsenceRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          if (newStatus === "approved") {
            setStudents((studs) =>
              studs.map((s) => {
                if (s.id === req.studentId) {
                  return { ...s, status: "present", time: "07:30" };
                }
                return s;
              }),
            );
            const student = students.find((s) => s.id === req.studentId);
            const smsText =
              lang === "ar"
                ? `نفيدكم بقبول طلب الغياب المقدم للابن ${student?.name} لتاريخ ${req.requestedDate} وتم اعتماده بعذر.`
                : `Leave request for your son ${student?.nameEn} on ${req.requestedDate} is approved.`;
            setSmsLogs((logs) => [
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
            setSmsLogs((logs) => [
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
      api.post(endpoint, {
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
  };

  const handleAddAssignmentAction = (newAssignment, matchingTeacherId) => {
    setAssignments((prev) => [newAssignment, ...prev]);
    if (matchingTeacherId) {
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === matchingTeacherId
            ? { ...t, assignments: t.assignments + 1 }
            : t,
        ),
      );
    }
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
      setSmsLogs((logs) => [
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
  };

  const handleUpdateSubmissionStatusAction = (
    assignmentId,
    studentId,
    newStatus,
    note,
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
  };

  const getStudentDetailedGrades = (studentId, subject, term) => {
    const record = detailedGrades.find((r) => r.studentId === studentId);
    if (!record || !record.grades[term] || !record.grades[term][subject]) {
      return defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
    }
    return record.grades[term][subject];
  };

  const handleDetailedGradeChangeAction = (
    studentId,
    subject,
    term,
    monthKey,
    field,
    rawNum,
  ) => {
    const token = localStorage.getItem("auth_token");
    const num = rawNum === "" ? 0 : (parseFloat(rawNum) || 0);

    setDetailedGrades((prev) => {
      let studentRecord = prev.find((r) => r.studentId === studentId);
      if (!studentRecord) {
        const student = students.find((s) => s.id === studentId);
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

    if (token) {
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

            api.post("/api/grades/detailed", reqBody)
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
  };

  const syncGeneralGradesAction = (studentId) => {
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
  };

  const handlePublishExamScheduleAction = (newSchedule) => {
    const token = localStorage.getItem("auth_token");

    // Resolve class ID
    const foundClass = classes.find(
      (c) => c.grade === newSchedule.grade && c.section === newSchedule.section
    );
    const classId = foundClass ? Number(String(foundClass.id).replace("cls-", "")) : null;

    // Resolve term key (term1 / term2)
    const termKey = (newSchedule.term === "الفصل الثاني" || newSchedule.term === "2") ? "term2" : "term1";

    // Mapped subjects array
    const mappedSubjects = newSchedule.subjects.map((sub) => {
      const foundSub = subjects.find(s => s.name === sub.subjectName || s.id === sub.subjectName);
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;
      
      return {
        subject_id: subjectId || 1,
        exam_date: sub.date,
        exam_time: sub.time,
        note: sub.note || "",
      };
    });

    setExamSchedules((prev) => [newSchedule, ...prev]);
    setToastMessage(
      lang === "ar"
        ? "تم نشر جدول الاختبارات بنجاح!"
        : "Exam schedule published successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);

    const classStudents = students.filter(
      (s) => s.grade === newSchedule.grade && s.section === newSchedule.section,
    );
    classStudents.forEach((student) => {
      const smsText =
        lang === "ar"
          ? `تم نشر جدول اختبارات جديد (${newSchedule.period} - ${newSchedule.term}) للصف ${newSchedule.grade}. يرجى مراجعته في تطبيق ولي الأمر.`
          : `New exam schedule published (${newSchedule.periodEn} - ${newSchedule.termEn}) for ${newSchedule.grade}. Please review it in the Parent App.`;
      setSmsLogs((logs) => [
        {
          id: Date.now() + Math.random(),
          studentId: student.id,
          recipient: student.phone,
          text: smsText,
          time: "15:00",
          type: "present",
        },
        ...logs,
      ]);
    });

    if (token && classId) {
      api.post("/api/exam-schedules", {
          title: newSchedule.period,
          class_id: classId,
          term: termKey,
          subjects: mappedSubjects,
        })
        .then((data) => {
          if (data.success) {
            fetchExamSchedules(token);
          } else {
            console.error("Failed to store exam schedule:", data.message);
          }
        })
        .catch((err) => console.error("Error storing exam schedule:", err));
    }
  };

  const handleDeleteExamScheduleAction = (id) => {
    const token = localStorage.getItem("auth_token");
    triggerConfirm({
      title: lang === 'ar' ? 'حذف جدول الاختبارات' : 'Delete Exam Schedule',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الجدول نهائياً؟' : 'Are you sure you want to permanently delete this schedule?',
      onConfirm: () => {
        setExamSchedules((prev) => prev.filter((sch) => sch.id !== id));
        setToastMessage(
          lang === "ar"
            ? "تم حذف جدول الاختبارات بنجاح"
            : "Exam schedule deleted successfully",
        );
        setTimeout(() => setToastMessage(""), 3000);

        if (token) {
          api.delete(`/api/exam-schedules/${id}`)
            .then((data) => {
              if (!data.success) {
                console.error("Failed to delete exam schedule from backend:", data.message);
              }
            })
            .catch((err) => console.error("Error deleting exam schedule:", err));
        }
      }
    });
  };

  const handleUpdateExamScheduleAction = (id, updatedSchedule) => {
    const token = localStorage.getItem("auth_token");

    // Resolve class ID
    const foundClass = classes.find(
      (c) => c.grade === updatedSchedule.grade && c.section === updatedSchedule.section
    );
    const classId = foundClass ? Number(String(foundClass.id).replace("cls-", "")) : null;

    // Resolve term key (term1 / term2)
    const termKey = (updatedSchedule.term === "الفصل الثاني" || updatedSchedule.term === "2") ? "term2" : "term1";

    // Mapped subjects array
    const mappedSubjects = updatedSchedule.subjects.map((sub) => {
      const foundSub = subjects.find(s => s.name === sub.subjectName || s.id === sub.subjectName);
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;
      
      return {
        subject_id: subjectId || 1,
        exam_date: sub.date,
        exam_time: sub.time,
        note: sub.note || "",
      };
    });

    setExamSchedules((prev) =>
      prev.map((sch) => (sch.id === id ? { ...sch, ...updatedSchedule } : sch))
    );
    setToastMessage(
      lang === "ar"
        ? "تم تحديث جدول الاختبارات بنجاح!"
        : "Exam schedule updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);

    if (token) {
      api.put(`/api/exam-schedules/${id}`, {
          title: updatedSchedule.period,
          class_id: classId,
          term: termKey,
          subjects: mappedSubjects,
        })
        .then((data) => {
          if (data.success) {
            fetchExamSchedules(token);
          } else {
            console.error("Failed to update exam schedule:", data.message);
          }
        })
        .catch((err) => console.error("Error updating exam schedule:", err));
    }
  };



  const handleAddPaymentAction = (newPayment) => {
    const token = localStorage.getItem("auth_token");

    setTuitionFees((prev) => ({
      ...prev,
      payments: [...prev.payments, newPayment],
    }));
    setToastMessage(t.paymentSuccessToast);
    setTimeout(() => setToastMessage(""), 3000);

    const student = students.find((s) => s.id === newPayment.studentId);
    const smsText =
      lang === "ar"
        ? `تم استلام دفعة مالية بقيمة ${newPayment.amount} ريال للسند رقم ${newPayment.referenceNo} بخصوص الطالب ${student?.name}. شكراً لكم. رياض و مدارس انوار العلى.`
        : `Payment of ${newPayment.amount} R.Y (Receipt: ${newPayment.referenceNo}) received for student ${student?.nameEn}. Thank you. Riyadh & Anwar Al-Ola.`;
    setSmsLogs((logs) => [
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

    if (token) {
      api.post("/api/finance/payment", {
          student_id: Number(newPayment.studentId),
          amount: Number(newPayment.amount),
          payment_date: newPayment.paymentDate,
          reference_no: newPayment.referenceNo,
        })
        .then((data) => {
          if (data.success) {
            fetchFinanceData(token);
          } else {
            console.error("Failed to add payment:", data.message);
          }
        })
        .catch((err) => console.error("Error adding payment:", err));
    }
  };

  const handleSendNotificationAction = (newNotification, extraLogs = []) => {
    const token = localStorage.getItem("auth_token");

    let targetType = "all_parents";
    let targetId = null;

    if (newNotification.type === "student") {
      targetType = "by_student";
      targetId = newNotification.studentId;
    } else if (newNotification.type === "class") {
      targetType = "by_class";
      const foundClass = classes.find(
        (c) =>
          c.name === newNotification.grade ||
          c.name_ar === newNotification.grade,
      );
      targetId = foundClass
        ? Number(String(foundClass.id).replace("cls-", ""))
        : null;
    } else if (newNotification.type === "teacher") {
      targetType = "specific_teacher";
      targetId = newNotification.teacherId;
    } else if (newNotification.type === "teachers") {
      targetType = "all_teachers";
    }

    if (token) {
      api.post("/api/notifications/send", {
          title: newNotification.title,
          content: newNotification.content,
          target_type: targetType,
          target_id: targetId,
        })
        .then((data) => {
          if (data.success) {
            setToastMessage(t.notificationSuccessToast);
            setTimeout(() => setToastMessage(""), 3000);
            fetchNotifications(token);
          }
        })
        .catch((err) => {
          console.error("Error sending notification via API:", err);
          setNotifications((prev) => [newNotification, ...prev]);
          setToastMessage(t.notificationSuccessToast);
          setTimeout(() => setToastMessage(""), 3000);
        });
    } else {
      setNotifications((prev) => [newNotification, ...prev]);
      setToastMessage(t.notificationSuccessToast);
      setTimeout(() => setToastMessage(""), 3000);
    }

    if (extraLogs.length > 0) {
      setSmsLogs((logs) => [...extraLogs, ...logs]);
    }
  };

  const handleMarkNotificationAsReadAction = (id) => {
    const token = localStorage.getItem("auth_token");
    
    // Update local state immediately (optimistic UI)
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );

    if (token) {
      api.put(`/api/notifications/${id}/read`)
        .then((data) => {
          if (!data.success) {
            console.error("Failed to mark notification as read:", data.message);
          }
        })
        .catch((err) => console.error("Error marking notification as read:", err));
    }
  };

  const handleUpdateReportStatusAction = (reportId, newStatus) => {
    const token = localStorage.getItem("auth_token");
    
    // Optimistic UI update
    setTeacherReports((prev) =>
      prev.map((r) => (r.id === String(reportId) ? { ...r, status: newStatus } : r))
    );

    if (token) {
      api.put(`/api/reports/${reportId}`, {
          status: newStatus,
        })
        .then((data) => {
          if (data.success) {
            setToastMessage(lang === "ar" ? "تم تحديث حالة البلاغ بنجاح." : "Report status updated successfully.");
            setTimeout(() => setToastMessage(""), 3000);
            fetchTeacherReports(token);
          } else {
            console.error("Failed to update report status:", data.message);
          }
        })
        .catch((err) => console.error("Error updating report status:", err));
    }
  };

  const handleScheduleChangeAction = (
    dayKey,
    periodIdx,
    val,
    selectedScheduleGrade,
  ) => {
    // Build the updated schedule FIRST (synchronously) before setState
    setSchedules((prev) => {
      const gradeSchedule = { ...prev[selectedScheduleGrade] };
      const dayClasses = [...(gradeSchedule[dayKey] || [])];
      dayClasses[periodIdx] = val;
      gradeSchedule[dayKey] = dayClasses;

      // Send to API inside the updater to get the latest value
      const token = localStorage.getItem("auth_token");
      if (token) {
        api.post("/api/schedules", {
            class_name: selectedScheduleGrade,
            schedule: gradeSchedule,
          })
          .then((data) => {
            if (!data.success) {
              console.error("Failed to save schedule to backend:", data.message);
              setToastMessage(
                lang === "ar"
                  ? `فشل حفظ التعديل: ${data.message || ""}`
                  : `Failed to save changes: ${data.message || ""}`,
                "error"
              );
              setTimeout(() => setToastMessage(""), 5000);
            }
          })
          .catch((err) => {
            console.error("Error saving schedule to backend:", err);
            setToastMessage(
              lang === "ar"
                ? `فشل حفظ التعديل: ${err.message || ""}`
                : `Failed to save changes: ${err.message || ""}`,
              "error"
            );
            setTimeout(() => setToastMessage(""), 5000);
          });
      }

      return { ...prev, [selectedScheduleGrade]: gradeSchedule };
    });
  };

  const handleGradeCellChangeAction = (studentId, subject, val) => {
    const token = localStorage.getItem("auth_token");
    const num = val === "" ? 0 : Math.min(100, Math.max(0, parseInt(val) || 0));
    
    setGrades((prev) =>
      prev.map((row) => {
        if (row.studentId === studentId) {
          return { ...row, [subject]: num };
        }
        return row;
      }),
    );

    if (token) {
      api.put(`/api/grades/control/${studentId}`, {
          [subject]: num,
        })
        .then((data) => {
          if (!data.success) {
            console.error("Failed to update control grade:", data.message);
          }
        })
        .catch((err) => console.error("Error updating control grade:", err));
    }
  };

  const handleCalculateSecretCodesAction = () => {
    const token = localStorage.getItem("auth_token");

    setGrades((prev) =>
      prev.map((row) => {
        const calculatedCode =
          row.studentId * Number(controlMultiplier) + Number(controlOffset);
        return { ...row, secretCode: calculatedCode.toString() };
      }),
    );
    setIsGradesEncrypted(true);
    setToastMessage(
      lang === "ar"
        ? "تم توليد الأرقام السرية وتشفير الكشف بنجاح!"
        : "Secret codes generated and grading sheet encrypted successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);

    if (token) {
      api.post("/api/grades/generate-codes", {
          prefix: controlPrefix,
          multiplier: Number(controlMultiplier),
          offset: Number(controlOffset),
          modulo: Number(controlModulo),
        })
        .then((data) => {
          if (data.success) {
            fetchControlGrades(token);
          } else {
            console.error("Failed to generate secret codes:", data.message);
          }
        })
        .catch((err) => console.error("Error generating secret codes:", err));
    }
  };

  const handleEnterGradeBySecretCodeAction = (
    secretCodeInput,
    secretGradeInput,
    secretSubjectInput,
    secretTermInput,
  ) => {
    const token = localStorage.getItem("auth_token");
    const valNum = Math.min(30, Math.max(0, parseFloat(secretGradeInput) || 0));
    const studentGradeRow = grades.find(
      (g) => g.secretCode === secretCodeInput.trim(),
    );
    if (!studentGradeRow) {
      setToastMessage(
        lang === "ar"
          ? "عذراً، الرقم السري غير صحيح أو غير موجود!"
          : "Sorry, secret code is incorrect or not found!",
      );
      setTimeout(() => setToastMessage(""), 3000);
      return false;
    }

    const studentId = studentGradeRow.studentId;

    setDetailedGrades((prev) => {
      let studentRecord = prev.find((r) => r.studentId === studentId);
      if (!studentRecord) {
        const student = students.find((s) => s.id === studentId);
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

      const updatedList = prev.map((r) => {
        if (r.studentId === studentId) {
          const updatedGrades = { ...r.grades };
          const termGrades = { ...updatedGrades[secretTermInput] };
          const subjectGrades = { ...termGrades[secretSubjectInput] };

          subjectGrades.finalExam = valNum;

          termGrades[secretSubjectInput] = subjectGrades;
          updatedGrades[secretTermInput] = termGrades;
          return { ...r, grades: updatedGrades };
        }
        return r;
      });

      const record = updatedList.find((r) => r.studentId === studentId);
      const subjectsMap = {
        الرياضيات: "math",
        العلوم: "science",
        "اللغة العربية": "arabic",
        "اللغة الإنجليزية": "english",
      };

      setGrades((prevGrades) =>
        prevGrades.map((row) => {
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

      return updatedList;
    });

    if (token) {
      const foundSub = subjects.find(
        (s) => s.name === secretSubjectInput || s.id === secretSubjectInput,
      );
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;

      if (subjectId) {
        api.post("/api/grades/detailed", {
            student_id: Number(studentId),
            subject_id: subjectId,
            term: secretTermInput === "term1" ? "1" : "2",
            month: "final",
            final_exam: valNum,
          })
          .then((data) => {
            if (!data.success) {
              console.error("Failed to save grade via secret code:", data.message);
            }
          })
          .catch((err) => console.error("Error saving grade via secret code:", err));
      }
    }

    setToastMessage(
      lang === "ar"
        ? `تم رصد الدرجة (${valNum}/30) لمادة ${secretSubjectInput} بنجاح للطالب ذو الرقم السري: ${secretCodeInput}`
        : `Successfully entered grade (${valNum}/30) for subject ${secretSubjectInput} (Secret Code: ${secretCodeInput})`,
    );
    setTimeout(() => setToastMessage(""), 4000);
    return true;
  };

  const handleQrScanAction = (scannedStudentId) => {
    const token = localStorage.getItem("auth_token");
    const student = students.find((s) => s.id === scannedStudentId);
    if (!student) return false;

    const arrivalTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const isLate = arrivalTime > "07:45"; // school late threshold is 7:45 AM
    const finalStatus = isLate ? "late" : "present";

    setStudents((prev) =>
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

    const todayStr = new Date().toISOString().split("T")[0];
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
      api.post(`/api/students/${scannedStudentId}/scan`)
        .then((data) => {
          if (!data.success) {
            console.error("Gate scan backend error:", data.message);
          }
        })
        .catch((err) => console.error("Error sending gate scan to API:", err));
    }

    return { student, finalStatus, arrivalTime };
  };

  const handleLogoutAction = () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      api.post("/api/logout").catch((err) => console.error("API Logout error:", err));
    }
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab("dashboard");
    setToastMessage(
      lang === "ar" ? "تم تسجيل الخروج بنجاح!" : "Logged out successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        darkMode,
        setDarkMode,
        activeTab,
        setActiveTab,
        handleLogout: handleLogoutAction,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        showNotificationsDropdown,
        setShowNotificationsDropdown,
        showProfileDropdown,
        setShowProfileDropdown,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        students,
        setStudents,
        teachers,
        setTeachers,
        supervisors,
        setSupervisors,
        schedules,
        setSchedules,
        grades,
        setGrades,
        subjects,
        setSubjects,
        classes,
        setClasses,
        availableGrades,
        setAvailableGrades,
        availableSections,
        setAvailableSections,
        parentUsers,
        setParentUsers,
        absenceRequests,
        setAbsenceRequests,
        assignments,
        setAssignments,
        detailedGrades,
        setDetailedGrades,
        examSchedules,
        setExamSchedules,
        tuitionFees,
        setTuitionFees,
        notifications,
        setNotifications,
        teacherReports,
        setTeacherReports,
        toastMessage,
        toastType,
        setToastMessage,
        confirmState,
        triggerConfirm,
        smsLogs,
        setSmsLogs,
        attendanceRecords,
        setAttendanceRecords,
        selectedAttendanceMonth,
        setSelectedAttendanceMonth,
        isGradesEncrypted,
        setIsGradesEncrypted,
        controlPrefix,
        setControlPrefix,
        controlMultiplier,
        setControlMultiplier,
        controlOffset,
        setControlOffset,
        controlModulo,
        setControlModulo,
        renderAvatar,
        dashboardStats,
        fetchDashboardStats,
        fetchWeeklySchedules,
        fetchTeacherReports,
        handleUpdateReportStatus: handleUpdateReportStatusAction,

        // Actions
        handleAddStudent: handleAddStudentAction,
        handleEditStudent: handleEditStudentAction,
        handleDeleteStudent: handleDeleteStudentAction,
        handleAddTeacher: handleAddTeacherAction,
        handleAddParent: handleAddParentAction,
        handleEditParent: handleEditParentAction,
        handleDeleteParent: handleDeleteParentAction,
        handleEditTeacher: handleEditTeacherAction,
        handleAddSupervisor: handleAddSupervisorAction,
        handleEditSupervisor: handleEditSupervisorAction,
        handleDeleteSupervisor: handleDeleteSupervisorAction,
        handleAddClass: handleAddClassAction,
        handleEditClass: handleEditClassAction,
        handleDeleteClass: handleDeleteClassAction,
        handleAddSubject: handleAddSubjectAction,
        handleEditSubject: handleEditSubjectAction,
        handleDeleteSubject: handleDeleteSubjectAction,
        handleAddGrade: handleAddGradeAction,
        handleRemoveGrade: handleRemoveGradeAction,
        handleAddSection: handleAddSectionAction,
        handleRemoveSection: handleRemoveSectionAction,
        handleManualAttendanceChange: handleManualAttendanceChangeAction,
        handleManualAttendanceNoteChange:
          handleManualAttendanceNoteChangeAction,
        handleCellAttendanceChange: handleCellAttendanceChangeAction,
        handleToggleDayAttendance: handleToggleDayAttendanceAction,
        calculateStudentStats,
        handleAbsenceDecision: handleAbsenceDecisionAction,
        handleAddAssignment: handleAddAssignmentAction,
        handleUpdateSubmissionStatus: handleUpdateSubmissionStatusAction,
        getStudentDetailedGrades,
        handleDetailedGradeChange: handleDetailedGradeChangeAction,
        syncGeneralGrades: syncGeneralGradesAction,
        handlePublishExamSchedule: handlePublishExamScheduleAction,
        handleUpdateExamSchedule: handleUpdateExamScheduleAction,
        handleDeleteExamSchedule: handleDeleteExamScheduleAction,
        handleAddPayment: handleAddPaymentAction,
        handleSendNotification: handleSendNotificationAction,
        handleMarkNotificationAsRead: handleMarkNotificationAsReadAction,
        handleScheduleChange: handleScheduleChangeAction,
        handleGradeCellChange: handleGradeCellChangeAction,
        handleCalculateSecretCodes: handleCalculateSecretCodesAction,
        handleEnterGradeBySecretCode: handleEnterGradeBySecretCodeAction,
        handleQrScan: handleQrScanAction,
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
        selectedGradeStudentId,
        setSelectedGradeStudentId,
        selectedGradeTerm,
        setSelectedGradeTerm,
        selectedGradeSubject,
        setSelectedGradeSubject,
        printStudentObject,
        setPrintStudentObject,
        // Vice Principals & Permissions
        vicePrincipals,
        setVicePrincipals,
        hasPermission,
        canAction,
        // Refresh functions
        fetchStudents,
        fetchParents,
        fetchTeachers,
        fetchControlGrades,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
