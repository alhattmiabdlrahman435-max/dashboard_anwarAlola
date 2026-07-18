import { api } from '../api';

export const studentsService = {
  getStudents: () => {
    return api.get("/api/students");
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

  exportStudents: () => {
    return api.get('/api/students/export');
  },

  importStudents: (formData) => {
    return api.post('/api/students/import', formData);
  },

  downloadTemplate: () => {
    return api.get('/api/students/template');
  }
};
