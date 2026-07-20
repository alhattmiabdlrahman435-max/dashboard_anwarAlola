import { api } from '../api';

export const parentsService = {
  getParents: (queryString = '') => {
    return api.get(`/api/parents${queryString}`);
  },
  
  createParent: (payload) => {
    return api.post("/api/parents", payload);
  },
  
  updateParent: (parentId, payload) => {
    return api.put(`/api/parents/${parentId}`, payload);
  },
  
  deleteParent: (parentId) => {
    return api.delete(`/api/parents/${parentId}`);
  },
  
  exportParents: () => {
    return api.get("/api/parents/export");
  },
  
  importParents: (formData) => {
    return api.post("/api/parents/import", formData);
  },
  
  downloadTemplate: () => {
    return api.get("/api/parents/template");
  }
};
