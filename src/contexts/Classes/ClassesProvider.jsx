import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ClassesContext from './ClassesContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { classesService } from '../../services/classes/classes.service';

export default function ClassesProvider({ children }) {
  const { lang, setToastMessage } = useApp();
  const { isAuthenticated } = useAuth();

  // ─── Classes state ────────────────────────────────────────────────
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(true);

  const fetchRequestRef = useRef(0);

  // ─── Available grades & sections configuration ────────────────────
  const [availableGrades, setAvailableGrades] = useState([
    'تمهيدي أول',
    'تمهيدي ثاني',
    'الصف الأول',
    'الصف الثاني',
    'الصف الثالث',
    'الصف الرابع',
    'الصف الخامس',
    'الصف السادس',
    'الصف الأول المتوسط',
    'الصف الثاني المتوسط',
    'الصف الثالث المتوسط',
  ]);

  const [availableSections, setAvailableSections] = useState([
    'أ',
    'ب',
    'ج',
    'د',
  ]);

  // ─── Fetch Classes ────────────────────────────────────────────────
  const fetchClasses = useCallback((...args) => {
    const force = args.find(a => typeof a === 'boolean') || false;
    if (!force && !isStale && classes.length > 0) {
      return;
    }
    const reqId = ++fetchRequestRef.current;
    setLoading(true);
    classesService.getClasses()
      .then((data) => {
        // Guard: ignore response if user has logged out
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchRequestRef.current) return;
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
          setIsStale(false);

          // Merge DB sections into availableSections to prevent deletion
          const dbSections = data.classes.map((c) => c.section_ar);
          if (dbSections.length > 0) {
            setAvailableSections((prev) => {
              const merged = new Set([...prev, ...dbSections]);
              return Array.from(merged);
            });
          }
        }
      })
      .catch((err) => {
        if (reqId === fetchRequestRef.current) {
          console.error('Error fetching classes:', err);
        }
      })
      .finally(() => {
        if (reqId === fetchRequestRef.current) {
          setLoading(false);
        }
      });
  }, [isStale, classes.length]);

  // ─── Auto-fetch on auth ───────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setClasses([]);
      setIsStale(true);
    }
  }, [isAuthenticated]);

  // ─── CRUD: Classes ────────────────────────────────────────────────
  const handleAddClass = useCallback((newClass) => {
    setClasses((prev) => [...prev, newClass]);
    setToastMessage(lang === 'ar' ? 'تمت إضافة الفصل الدراسي بنجاح!' : 'Class created successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  }, [lang, setToastMessage]);

  const handleEditClass = useCallback((updatedClass, classId) => {
    setClasses((prev) => prev.map((c) => (c.id === classId ? updatedClass : c)));
    setToastMessage(lang === 'ar' ? 'تم تحديث بيانات الفصل بنجاح!' : 'Class details updated successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  }, [lang, setToastMessage]);

  const handleDeleteClass = useCallback((id) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setToastMessage(lang === 'ar' ? 'تم حذف الفصل بنجاح' : 'Class deleted successfully');
    setTimeout(() => setToastMessage(''), 3000);
  }, [lang, setToastMessage]);

  // ─── Update class subjects (used by ScheduleTab & SubjectsTab) ────
  const updateClassSubjects = useCallback((classId, subjects) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, subjects } : c))
    );
  }, []);

  // Called by SubjectsTab when a new subject is added/edited/deleted
  const applySubjectToClasses = useCallback((classesListToUpdate, subjectName, action, oldName) => {
    setClasses((prev) =>
      prev.map((c) => {
        let subs = c.subjects || [];
        if (action === 'add') {
          if (classesListToUpdate.includes(c.name)) {
            if (!subs.includes(subjectName)) subs = [...subs, subjectName];
          } else {
            subs = subs.filter((s) => s !== subjectName);
          }
        } else if (action === 'edit') {
          if (classesListToUpdate.includes(c.name)) {
            if (subs.includes(oldName)) {
              subs = subs.map((s) => (s === oldName ? subjectName : s));
            } else {
              subs = [...subs, subjectName];
            }
          } else {
            subs = subs.filter((s) => s !== oldName && s !== subjectName);
          }
        } else if (action === 'delete') {
          subs = subs.filter((s) => s !== subjectName);
        }
        return { ...c, subjects: subs };
      })
    );
  }, []);

  // ─── Grade management ─────────────────────────────────────────────
  const handleAddGrade = useCallback((gradeName) => {
    setAvailableGrades((prev) => [...prev, gradeName]);
    setToastMessage(
      lang === 'ar' ? `تمت إضافة الصف الدراسي: ${gradeName}` : `Grade level added: ${gradeName}`
    );
    setTimeout(() => setToastMessage(''), 3000);
  }, [lang, setToastMessage]);

  const handleRemoveGrade = useCallback((gradeName) => {
    setAvailableGrades((prev) => prev.filter((g) => g !== gradeName));
    setToastMessage(
      lang === 'ar' ? `تم حذف الصف الدراسي: ${gradeName}` : `Grade level removed: ${gradeName}`
    );
    setTimeout(() => setToastMessage(''), 3000);
  }, [lang, setToastMessage]);

  // ─── Section management ───────────────────────────────────────────
  const handleAddSection = useCallback((sectionInput) => {
    const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز'];
    const englishLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const secMap = {
      'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E', 'و': 'F', 'ز': 'G',
      'A': 'أ', 'B': 'ب', 'C': 'ج', 'D': 'د', 'E': 'هـ', 'F': 'و', 'G': 'ز',
    };

    setAvailableSections((prev) => {
      if (prev.length >= 7) {
        setToastMessage(
          lang === 'ar'
            ? 'عذراً، لا يمكن إضافة أكثر من 7 شعب دراسية!'
            : 'Sorry, you cannot add more than 7 class sections!'
        );
        setTimeout(() => setToastMessage(''), 3000);
        return prev;
      }

      let targetSection;
      const trimmedInput = (sectionInput || '').trim().toUpperCase();

      if (!trimmedInput) {
        targetSection = arabicLetters.find((l) => !prev.includes(l));
        if (!targetSection) {
          setToastMessage(
            lang === 'ar'
              ? 'عذراً، لا يمكن إضافة أكثر من 7 شعب دراسية!'
              : 'Sorry, you cannot add more than 7 class sections!'
          );
          setTimeout(() => setToastMessage(''), 3000);
          return prev;
        }
      } else {
        if (englishLetters.includes(trimmedInput)) {
          targetSection = secMap[trimmedInput];
        } else if (arabicLetters.includes(trimmedInput)) {
          targetSection = trimmedInput;
        } else {
          targetSection = trimmedInput.slice(0, 2);
        }

        if (prev.includes(targetSection)) {
          setToastMessage(
            lang === 'ar'
              ? `الشعبة "${targetSection}" مضافة بالفعل!`
              : `Section "${targetSection}" is already added!`
          );
          setTimeout(() => setToastMessage(''), 3000);
          return prev;
        }
      }

      const displayVal = lang === 'ar' ? targetSection : (secMap[targetSection] || targetSection);
      setToastMessage(
        lang === 'ar' ? `تمت إضافة الشعبة: ${displayVal}` : `Section added: ${displayVal}`
      );
      setTimeout(() => setToastMessage(''), 3000);
      return [...prev, targetSection];
    });
  }, [lang, setToastMessage]);

  const handleRemoveSection = useCallback((sectionName) => {
    setAvailableSections((prev) => prev.filter((s) => s !== sectionName));
    setToastMessage(
      lang === 'ar' ? `تم حذف الشعبة: ${sectionName}` : `Section removed: ${sectionName}`
    );
    setTimeout(() => setToastMessage(''), 3000);
  }, [lang, setToastMessage]);

  const classesContextValue = useMemo(() => ({
    // State
    classes,
    setClasses,
    loading,
    availableGrades,
    setAvailableGrades,
    availableSections,
    setAvailableSections,
    // Fetch
    fetchClasses,
    // Class CRUD
    handleAddClass,
    handleEditClass,
    handleDeleteClass,
    // Subject-class sync helpers
    updateClassSubjects,
    applySubjectToClasses,
    // Grade management
    handleAddGrade,
    handleRemoveGrade,
    // Section management
    handleAddSection,
    handleRemoveSection,
  }), [
    classes,
    loading,
    availableGrades,
    availableSections,
    fetchClasses,
    handleAddClass,
    handleEditClass,
    handleDeleteClass,
    updateClassSubjects,
    applySubjectToClasses,
    handleAddGrade,
    handleRemoveGrade,
    handleAddSection,
    handleRemoveSection,
  ]);

  return (
    <ClassesContext.Provider value={classesContextValue}>
      {children}
    </ClassesContext.Provider>
  );
}
