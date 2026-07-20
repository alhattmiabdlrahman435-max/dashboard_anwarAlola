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
  const [teachersPagination, setTeachersPagination] = useState({
    total: 0, lastPage: 1, from: 0, to: 0, currentPage: 1, perPage: 20,
  });
  const [supervisorsPagination, setSupervisorsPagination] = useState({
    total: 0, lastPage: 1, from: 0, to: 0, currentPage: 1, perPage: 20,
  });

  const fetchTeachersRequestRef = useRef(0);
  const fetchSupervisorsRequestRef = useRef(0);
  const teachersAbortRef = useRef(null);
  const supervisorsAbortRef = useRef(null);

  const lastTeachersQueryRef = useRef(null);

  // ─── Fetch Teachers ────────────────────────────────────────────────
  const fetchTeachers = useCallback((arg) => {
    const isForce = arg === true;
    const isQueryString = typeof arg === 'string';
    const queryString = isQueryString ? arg : '?page=1&per_page=20';

    const activeToken = localStorage.getItem('auth_token');
    if (!activeToken) return;

    if (!isForce && !isStale && teachers.length > 0 && lastTeachersQueryRef.current === queryString) return;
    lastTeachersQueryRef.current = queryString;

    if (teachersAbortRef.current) teachersAbortRef.current.abort();
    const controller = new AbortController();
    teachersAbortRef.current = controller;

    const reqId = ++fetchTeachersRequestRef.current;
    setLoading(true);
    teachersService.getTeachers(queryString)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (reqId !== fetchTeachersRequestRef.current) return;
        if (!localStorage.getItem('auth_token')) return;
        if (data.success) {
          const mapped = (data.teachers || []).map((t) => {
            const classNames = [];
            const classIds = [];
            const subjectNames = [];
            const subjectIds = [];
            const teachingAssignments = [];

            if (t.assignments) {
              t.assignments.forEach((assign) => {
                const sc = assign.school_class;
                const className = sc
                  ? (sc.name_ar || sc.name || `${sc.grade_ar || ''} - ${sc.section_ar || ''}`.trim())
                  : '';
                const classId = sc ? sc.id : null;
                const sub = assign.subject;
                const subjectName = sub
                  ? (sub.name_ar || sub.name)
                  : '';
                const subjectId = sub ? sub.id : null;

                if (className && !classNames.includes(className)) classNames.push(className);
                if (classId && !classIds.includes(classId)) classIds.push(classId);
                if (subjectName && !subjectNames.includes(subjectName)) subjectNames.push(subjectName);
                if (subjectId && !subjectIds.includes(subjectId)) subjectIds.push(subjectId);
                if (className || subjectName) {
                  teachingAssignments.push({
                    subject: subjectName,
                    subjectId,
                    class: className,
                    classId
                  });
                }
              });
            }

            return {
              id: t.id,
              jobId: t.job_id,
              phone: t.phone || '',
              address: t.address || '',
              name: t.name_ar || t.name_en || '',
              nameEn: t.name_en || t.name_ar || '',
              subject: subjectNames.join('، '),
              subjectEn: subjectNames.join(', '),
              subjects: subjectNames,
              subjectIds: subjectIds,
              classes: classNames,
              classIds: classIds,
              teachingAssignments: teachingAssignments,
              gradesEntered: t.grades_entered || 0,
              assignments: t.assignments_count || 0,
              photo: t.photo_url || '👨‍🏫',
            };
          });
          setTeachers(mapped);
          setIsStale(false);
          const pg = data.pagination || data.meta || {};
          setTeachersPagination({
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
        if (reqId !== fetchTeachersRequestRef.current) return;
        console.error('Error fetching teachers:', err);
      })
      .finally(() => {
        if (reqId === fetchTeachersRequestRef.current) {
          setLoading(false);
          teachersAbortRef.current = null;
        }
      });
  }, [isStale, teachers.length]);

  // ─── Fetch Supervisors ─────────────────────────────────────────────
  const fetchSupervisors = useCallback((arg) => {
    const isForce = arg === true;
    const isQueryString = typeof arg === 'string';
    const queryString = isQueryString ? arg : '?page=1&per_page=20';

    if (!isForce && !isQueryString && !isStale && supervisors.length > 0) return;

    if (supervisorsAbortRef.current) supervisorsAbortRef.current.abort();
    const controller = new AbortController();
    supervisorsAbortRef.current = controller;

    const reqId = ++fetchSupervisorsRequestRef.current;
    teachersService.getSupervisors(queryString)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (reqId !== fetchSupervisorsRequestRef.current) return;
        if (!localStorage.getItem('auth_token')) return;
        if (data.success) {
          setSupervisors(data.supervisors || []);
          const pg = data.pagination || data.meta || {};
          setSupervisorsPagination({
            total:       pg.total        ?? data.total        ?? (data.supervisors || []).length,
            lastPage:    pg.last_page    ?? data.last_page    ?? 1,
            from:        pg.from         ?? data.from         ?? 1,
            to:          pg.to           ?? data.to           ?? (data.supervisors || []).length,
            currentPage: pg.current_page ?? data.current_page ?? 1,
            perPage:     pg.per_page     ?? data.per_page     ?? (data.supervisors || []).length,
          });
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        if (reqId !== fetchSupervisorsRequestRef.current) return;
        console.error('Error fetching supervisors:', err);
      })
      .finally(() => {
        if (reqId === fetchSupervisorsRequestRef.current) supervisorsAbortRef.current = null;
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
    teachersPagination,
    handleAddTeacher,
    handleEditTeacher,
    // Supervisors
    supervisors,
    setSupervisors,
    fetchSupervisors,
    supervisorsPagination,
    handleAddSupervisor,
    handleEditSupervisor,
    handleDeleteSupervisor,
  }), [
    teachers,
    setTeachers,
    loading,
    fetchTeachers,
    teachersPagination,
    handleAddTeacher,
    handleEditTeacher,
    supervisors,
    fetchSupervisors,
    supervisorsPagination,
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
