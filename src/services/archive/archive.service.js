import { api } from '../api';

/** قسم الأرشيف — الاحصائية وبيانات الطلاب */
export const archiveService = {
  /** [{ class_id, class_name, short_name, stage, branch, males, females, unknown, total }] */
  getStatistics: () => api.get('/api/archive/statistics'),

  /** نموذج بيانات الطلاب لشعبة */
  getStudents: (classId, { missingGender = false } = {}) => api.get(`/api/archive/students?class_id=${classId === 'all' ? 'all' : Number(classId)}${missingGender ? '&missing_gender=1' : ''}`),

  /** حفظ النموذج: [{ id, birth_date, governorate, address, phone_call, phone_whatsapp, phone_other, guardian_national_id, archive_notes }] */
  saveStudents: (students) => api.put('/api/archive/students', { students }),

  /** تحديد الجنس: [{ id, gender: 'male' | 'female' }] */
  saveGenders: (students) => api.put('/api/archive/genders', { students }),
};
