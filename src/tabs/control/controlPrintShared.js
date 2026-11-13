import { useEffect, useState } from 'react';
import { controlBoardService } from '../../services/control/controlBoard.service';
import { useAllowedClasses } from '../../hooks/useAllowedClasses';
import { useClasses } from '../../contexts/Classes/useClasses';

/** مشترك بين نوافذ الطباعة: كشوفات المناداة – البطائق – المرايا */
export const SCHOOL_NAME = 'مدارس انوار العلى الدولية النموذجية';

export function classNumericId(cls) {
  return Number(cls?.numericId || String(cls?.id ?? '').replace(/\D/g, ''));
}

/** قيمة فارغة تظهر خانة فارغة (وليس null) */
export function cell(v) {
  return v === null || v === undefined ? '' : String(v);
}

export function seatSortValue(v) {
  const n = Number(v);
  return v === null || v === undefined || v === '' || Number.isNaN(n) ? Number.POSITIVE_INFINITY : n;
}

/** تجميع الطلاب حسب الصف والشعبة مع الحفاظ على ترتيب الخادم (الصف ثم الاسم) */
export function groupByClass(students) {
  const groups = [];
  const index = new Map();
  (students || []).forEach((s) => {
    const key = String(s.class_id ?? '');
    let g = index.get(key);
    if (!g) {
      g = { classId: s.class_id, label: s.class_name || [s.grade_ar, s.section_ar].filter(Boolean).join(' - '), students: [] };
      index.set(key, g);
      groups.push(g);
    }
    g.students.push(s);
  });
  return groups;
}

/** قائمة الصفوف المسموحة (صلاحية control) */
export function useControlClasses() {
  const { allowedClasses } = useAllowedClasses('control');
  const { fetchClasses } = useClasses();
  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  return allowedClasses || [];
}

/** تحميل طلاب الكنترول: classId = 'all' أو رقم الشعبة */
export function useControlStudents(classId) {
  const [result, setResult] = useState({ key: null, students: [], error: '' });
  const key = String(classId || 'all');

  useEffect(() => {
    let cancelled = false;
    controlBoardService.getStudents(key)
      .then((res) => {
        if (cancelled) return;
        setResult({ key, students: Array.isArray(res?.students) ? res.students : [], error: '' });
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setResult({ key, students: [], error: err?.message || 'تعذر تحميل الطلاب' });
      });
    return () => { cancelled = true; };
  }, [key]);

  const ready = result.key === key;
  return {
    students: ready ? result.students : [],
    loading: !ready,
    error: ready ? result.error : '',
  };
}
