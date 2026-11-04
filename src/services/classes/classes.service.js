import { api } from '../api';

export const classesService = {
  getClasses: () => {
    return api.get("/api/classes");
  },

  createClass: (payload) => {
    return api.post("/api/classes", payload);
  },

  updateClass: (id, payload) => {
    return api.put(`/api/classes/${id}`, payload);
  },

  deleteClass: (id) => {
    return api.delete(`/api/classes/${id}`);
  },

  syncSubjects: (classId, subjects) => {
    return api.post(`/api/classes/${classId}/subjects`, { subjects });
  },

  exportClasses: () => {
    return api.get("/api/classes/export");
  },

  importClasses: (formData) => {
    return api.post("/api/classes/import", formData);
  },

  downloadTemplate: () => {
    return api.get("/api/classes/template");
  },
};
