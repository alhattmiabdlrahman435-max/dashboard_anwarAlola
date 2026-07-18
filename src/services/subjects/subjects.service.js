import { api } from '../api';

export const subjectsService = {
  getSubjects: () => {
    return api.get("/api/subjects");
  },
  createSubject: (data) => {
    return api.post("/api/subjects", data);
  },
  updateSubject: (id, data) => {
    return api.put(`/api/subjects/${id}`, data);
  },
  deleteSubject: (id) => {
    return api.delete(`/api/subjects/${id}`);
  },
  syncClasses: (id, classes) => {
    return api.post(`/api/subjects/${id}/classes`, { classes });
  }
};
