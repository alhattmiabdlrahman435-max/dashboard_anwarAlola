import { api } from '../api';

export const teachersService = {
  getTeachers: () => {
    return api.get("/api/teachers");
  },
  
  createTeacher: (payload) => {
    return api.post("/api/teachers", payload);
  },
  
  updateTeacher: (teacherId, payload) => {
    return api.put(`/api/teachers/${teacherId}`, payload);
  },

  getSupervisors: () => {
    return api.get("/api/supervisors");
  },

  createSupervisor: (payload) => {
    return api.post("/api/supervisors", payload);
  },

  updateSupervisor: (supervisorId, payload) => {
    return api.put(`/api/supervisors/${supervisorId}`, payload);
  },

  deleteSupervisor: (supervisorId) => {
    return api.delete(`/api/supervisors/${supervisorId}`);
  },

  exportTeachers: () => {
    return api.get("/api/teachers/export");
  },

  importTeachers: (formData) => {
    return api.post("/api/teachers/import", formData);
  },

  downloadTemplate: () => {
    return api.get("/api/teachers/template");
  }
};
