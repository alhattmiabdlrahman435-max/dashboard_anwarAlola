import { useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useClasses } from '../../contexts/Classes/useClasses';
import { useAllowedClasses } from '../../hooks/useAllowedClasses';

/** نص رسالة الخطأ القادمة من الخادم (ApiError.message) */
export function errorText(err, fallback = 'حدث خطأ غير متوقع') {
  return (err && err.message) || fallback;
}

export function isAbort(err) {
  return err && err.name === 'AbortError';
}

/** رسالة منبثقة تختفي تلقائياً */
export function useControlToast() {
  const { setToastMessage } = useApp();
  return useCallback(
    (msg) => {
      if (!setToastMessage) return;
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 3500);
    },
    [setToastMessage],
  );
}

/** الصفوف والشعب المسموحة لوحدة الكنترول */
export function useControlClasses() {
  const { allowedClasses } = useAllowedClasses('control');
  const { fetchClasses } = useClasses();
  useEffect(() => {
    fetchClasses(true);
  }, [fetchClasses]);
  return allowedClasses || [];
}

export function classValue(cls) {
  return String(cls.numericId ?? String(cls.id).replace(/\D/g, ''));
}

export function classLabel(cls, lang) {
  return lang === 'ar' || !cls.gradeEn ? `${cls.grade} - ${cls.section}` : `${cls.gradeEn} - ${cls.sectionEn}`;
}
