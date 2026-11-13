import { lazy } from 'react';

/**
 * lazy() آمن: إذا تم بناء/رفع نسخة جديدة من اللوحة والصفحة مفتوحة، تصبح ملفات النوافذ القديمة غير موجودة (404).
 * بدل ظهور خطأ، نعيد تحميل الصفحة مرة واحدة لتجلب الملفات الجديدة (مع حماية من التكرار اللانهائي).
 */
const KEY = 'chunk-reload-at';

export function safeLazy(importFn) {
  return lazy(async () => {
    try {
      const mod = await importFn();
      try { sessionStorage.removeItem(KEY); } catch { /* تخزين غير متاح */ }
      return mod;
    } catch (error) {
      let last = 0;
      try { last = Number(sessionStorage.getItem(KEY)) || 0; } catch { /* تخزين غير متاح */ }
      if (Date.now() - last > 15000) {
        try { sessionStorage.setItem(KEY, String(Date.now())); } catch { /* تخزين غير متاح */ }
        window.location.reload();
        return new Promise(() => {});
      }
      throw error; // فشل حقيقي بعد إعادة التحميل — نُظهره بدل التكرار
    }
  });
}
