import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import TeachersContext from './TeachersContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { useClasses } from '../Classes/useClasses';
import { useSubjects } from '../Subjects/useSubjects';
import { teachersService } from '../../services/teachers/teachers.service';

export default function TeachersProvider({ children }) {
  const { lang, setToastMessage } = useApp();
  const { classes } = useClasses();
  const { subjects } = useSubjects();
  const { isAuthenticated } = useAuth();
  // Teachers & Supervisors state
  const [teachers, setTeachers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(true);

  const fetchTeachersRequestRef = useRef(0);
  const fetchSupervisorsRequestRef = useRef(0);

  // ─── Fetch Teachers ────────────────────────────────────────────────
  const fetchTeachers = useCallback((...args) => {
    const force = args.find(a => typeof a === 'boolean') || false;
    const tokenArg = args.find(a => typeof a === 'string');
    const activeToken = tokenArg || localStorage.getItem("auth_token");
    if (!activeToken) return;

    if (!force && !isStale && teachers.length > 0) {
      return;
    }

    const reqId = ++fetchTeachersRequestRef.current;
    setLoading(true);
    teachersService.getTeachers()
      .then((data) => {
        // Guard: ignore response if user has logged out
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchTeachersRequestRef.current) return;
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
                  teachingAssignments.push({ subject: subjectName, class: className });
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
          setIsStale(false);
        }
      })
      .catch((err) => {
        if (reqId === fetchTeachersRequestRef.current) {
          console.error("Error fetching teachers:", err);
        }
      })
      .finally(() => {
        if (reqId === fetchTeachersRequestRef.current) {
          setLoading(false);
        }
      });
  }, [isStale, teachers.length]);

  // ─── Fetch Supervisors ─────────────────────────────────────────────
  const fetchSupervisors = useCallback((...args) => {
    const force = args.find(a => typeof a === 'boolean') || false;
    if (!force && !isStale && supervisors.length > 0) {
      return;
    }
    const reqId = ++fetchSupervisorsRequestRef.current;
    teachersService.getSupervisors()
      .then((data) => {
        // Guard: ignore response if user has logged out
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchSupervisorsRequestRef.current) return;
        if (data.success) {
          setSupervisors(data.supervisors);
        }
      })
      .catch((err) => {
        if (reqId === fetchSupervisorsRequestRef.current) {
          console.error("Error fetching supervisors:", err);
        }
      });
  }, [isStale, supervisors.length]);

  // ─── Auto-fetch on authentication ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setTeachers([]);
      setSupervisors([]);
      setIsStale(true);
    }
  }, [isAuthenticated]);

  // ─── Teacher CRUD ──────────────────────────────────────────────────
  const handleAddTeacher = useCallback((newTeacher) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
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

      return teachersService.createTeacher({
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
          fetchTeachers(token, true);
          setToastMessage(lang === "ar" ? "تم تسجيل المعلم بنجاح!" : "Teacher added successfully!");
          setTimeout(() => setToastMessage(""), 4000);
          return { success: true };
        } else {
          const msg = lang === "ar" ? `فشل تسجيل المعلم: ${data.message}` : `Failed to add teacher: ${data.message}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(""), 6000);
          return { success: false, message: msg };
        }
      })
      .catch(err => {
        console.error("Error saving teacher:", err);
        const msg = lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 6000);
        return { success: false, message: msg };
      });
    } else {
      setTeachers((prev) => [...prev, newTeacher]);
      setToastMessage(lang === "ar" ? "تم تسجيل المعلم بنجاح!" : "Teacher added successfully!");
      setTimeout(() => setToastMessage(""), 4000);
      return Promise.resolve({ success: true });
    }
  }, [subjects, classes, lang, setToastMessage, fetchTeachers]);

  const handleEditTeacher = useCallback((updatedTeacher, teacherId) => {
    const token = localStorage.getItem("auth_token");

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

      return teachersService.updateTeacher(teacherId, {
        name_ar: updatedTeacher.name,
        name_en: updatedTeacher.nameEn,
        phone: updatedTeacher.phone,
        address: updatedTeacher.address,
        photo_url: updatedTeacher.photo,
        assignments: apiAssignments,
      })
      .then(data => {
        if (data.success) {
          fetchTeachers(token, true);
          setToastMessage(lang === "ar" ? "تم تحديث بيانات المعلم بنجاح!" : "Teacher details updated successfully!");
          setTimeout(() => setToastMessage(""), 4000);
          return { success: true };
        } else {
          const msg = lang === "ar" ? `فشل تحديث المعلم: ${data.message}` : `Failed to update teacher: ${data.message}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(""), 6000);
          return { success: false, message: msg };
        }
      })
      .catch(err => {
        console.error("Error updating teacher:", err);
        const msg = lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 6000);
        return { success: false, message: msg };
      });
    } else {
      setTeachers((prev) => prev.map((t) => (t.id === teacherId ? updatedTeacher : t)));
      setToastMessage(lang === "ar" ? "تم تحديث بيانات المعلم بنجاح!" : "Teacher details updated successfully!");
      setTimeout(() => setToastMessage(""), 4000);
      return Promise.resolve({ success: true });
    }
  }, [subjects, classes, lang, setToastMessage, fetchTeachers]);

  // ─── Supervisor CRUD ───────────────────────────────────────────────
  const handleAddSupervisor = useCallback((newSupervisor) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      return teachersService.createSupervisor({
        jobId: newSupervisor.jobId,
        name: newSupervisor.name,
        phone: newSupervisor.phone,
        password: newSupervisor.password,
        classes: newSupervisor.classes,
        photo: newSupervisor.photo,
      })
      .then(data => {
        if (data.success) {
          setSupervisors(prev => [...prev, data.supervisor]);
          setToastMessage(lang === 'ar' ? 'تم تسجيل مشرف التحضير بنجاح!' : 'Prep supervisor added successfully!');
          setTimeout(() => setToastMessage(''), 4000);
          return { success: true };
        } else {
          const msg = lang === 'ar' ? `فشل تسجيل المشرف: ${data.message}` : `Failed to add supervisor: ${data.message}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(''), 6000);
          return { success: false, message: msg };
        }
      })
      .catch(err => {
        console.error("Error saving supervisor:", err);
        const msg = lang === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 6000);
        return { success: false, message: msg };
      });
    } else {
      setSupervisors(prev => [...prev, newSupervisor]);
      setToastMessage(lang === 'ar' ? 'تم تسجيل مشرف التحضير بنجاح!' : 'Prep supervisor added successfully!');
      setTimeout(() => setToastMessage(''), 4000);
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage]);

  const handleEditSupervisor = useCallback((updatedSupervisor, supervisorId) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      return teachersService.updateSupervisor(supervisorId, {
        jobId: updatedSupervisor.jobId,
        name: updatedSupervisor.name,
        phone: updatedSupervisor.phone,
        password: updatedSupervisor.password !== "teacher_password123" ? updatedSupervisor.password : undefined,
        classes: updatedSupervisor.classes,
        photo: updatedSupervisor.photo,
      })
      .then(data => {
        if (data.success) {
          setSupervisors(prev => prev.map(s => s.id === supervisorId ? { ...s, ...updatedSupervisor } : s));
          setToastMessage(lang === 'ar' ? 'تم تحديث بيانات المشرف بنجاح!' : 'Supervisor details updated successfully!');
          setTimeout(() => setToastMessage(''), 4000);
          return { success: true };
        } else {
          const msg = lang === 'ar' ? `فشل تحديث المشرف: ${data.message}` : `Failed to update supervisor: ${data.message}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(''), 6000);
          return { success: false, message: msg };
        }
      })
      .catch(err => {
        console.error("Error updating supervisor:", err);
        const msg = lang === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 6000);
        return { success: false, message: msg };
      });
    } else {
      setSupervisors(prev => prev.map(s => s.id === supervisorId ? updatedSupervisor : s));
      setToastMessage(lang === 'ar' ? 'تم تحديث بيانات المشرف بنجاح!' : 'Supervisor details updated successfully!');
      setTimeout(() => setToastMessage(''), 4000);
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage]);

  const handleDeleteSupervisor = useCallback((supervisorId) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      return teachersService.deleteSupervisor(supervisorId)
      .then(data => {
        if (data.success) {
          setSupervisors(prev => prev.filter(s => s.id !== supervisorId));
          setToastMessage(lang === 'ar' ? 'تم حذف المشرف بنجاح!' : 'Supervisor deleted successfully!');
          setTimeout(() => setToastMessage(''), 4000);
          return { success: true };
        } else {
          const msg = lang === 'ar' ? `فشل حذف المشرف: ${data.message}` : `Failed to delete supervisor: ${data.message}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(''), 6000);
          return { success: false, message: msg };
        }
      })
      .catch(err => {
        console.error("Error deleting supervisor:", err);
        const msg = lang === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 6000);
        return { success: false, message: msg };
      });
    } else {
      setSupervisors(prev => prev.filter(s => s.id !== supervisorId));
      setToastMessage(lang === 'ar' ? 'تم حذف المشرف بنجاح!' : 'Supervisor deleted successfully!');
      setTimeout(() => setToastMessage(''), 4000);
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage]);

  const teachersContextValue = useMemo(() => ({
    // Teachers
    teachers,
    setTeachers,
    loading,
    fetchTeachers,
    handleAddTeacher,
    handleEditTeacher,
    // Supervisors
    supervisors,
    setSupervisors,
    fetchSupervisors,
    handleAddSupervisor,
    handleEditSupervisor,
    handleDeleteSupervisor,
  }), [
    teachers,
    setTeachers,
    loading,
    fetchTeachers,
    handleAddTeacher,
    handleEditTeacher,
    supervisors,
    fetchSupervisors,
    handleAddSupervisor,
    handleEditSupervisor,
    handleDeleteSupervisor,
  ]);

  return (
    <TeachersContext.Provider value={teachersContextValue}>
      {children}
    </TeachersContext.Provider>
  );
}
