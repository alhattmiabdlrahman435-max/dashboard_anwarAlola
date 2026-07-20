import { api } from '../api';

export const studentsService = {
  getStudents: (queryString = '') => {
    return api.get(`/api/students${queryString}`);
  },
  
  createStudent: (payload) => {
    return api.post("/api/students", payload);
  },
  
  updateStudent: (studentId, payload) => {
    return api.put(`/api/students/${studentId}`, payload);
  },
  
  deleteStudent: (studentId) => {
    return api.delete(`/api/students/${studentId}`);
  },
  
  gateScan: (scannedStudentId) => {
    return api.post(`/api/students/${scannedStudentId}/scan`);
  },

  exportStudents: (classId = '') => {
    return api.get(`/api/students/export` + (classId ? `?class_id=${classId}` : ''));
  },

  importStudents: (formData) => {
    return api.post('/api/students/import', formData);
  },

  downloadTemplate: (classId = '') => {
    return api.get(`/api/students/template` + (classId ? `?class_id=${classId}` : ''));
  }
};
