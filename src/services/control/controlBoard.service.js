import { api } from '../api';

/**
 * الكنترول (ملحق المدرسة) — واجهات الخادم.
 * الطالب: { id, name_ar, class_id, class_name, grade_ar, section_ar, seat_number, secret_number, committee_number, photo_url }
 * الرقم السري secret_number = نفسه المستخدم في "رصد درجات الاختبار النهائي بالرقم السري".
 */
export const controlBoardService = {
  /** classId: رقم الشعبة أو 'all' */
  getStudents: (classId = 'all') => api.get(`/api/control/board/students?class_id=${classId}`),

  /** بدء الترقيم: field = 'seat' | 'secret' */
  autoNumber: (classId, field, start) => api.post('/api/control/board/number', { class_id: Number(classId), field, start: Number(start) }),

  /** تعديل رقم طالب: { seat_number?, secret_number?, committee_number? } */
  updateStudent: (id, payload) => api.put(`/api/control/board/students/${id}`, payload),

  /** اللجان: [{ number, students_count }] */
  getCommittees: () => api.get('/api/control/board/committees'),

  /** ترقيم اللجان: عدد اللجان */
  saveCommittees: (count) => api.post('/api/control/board/committees', { count: Number(count) }),

  /** توزيع الطلاب في اللجان: [{ student_id, committee_number|null }] */
  saveAssignments: (assignments) => api.put('/api/control/board/committee-assignments', { assignments }),
};
