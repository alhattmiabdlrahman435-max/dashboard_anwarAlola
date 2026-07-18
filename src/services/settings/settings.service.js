import { api } from '../api';

export const settingsService = {
  getSchedules: () => {
    return api.get("/api/schedules");
  },
  
  saveSchedules: (payload) => {
    return api.post("/api/schedules", payload);
  },
  
  getGradesControl: () => {
    return api.get("/api/grades/control");
  },
  
  updateControlGrade: (studentId, payload) => {
    return api.put(`/api/grades/control/${studentId}`, payload);
  },
  
  generateControlCodes: (payload) => {
    return api.post("/api/grades/generate-codes", payload);
  },
  
  getAssignments: () => {
    return api.get("/api/assignments");
  },
  
  saveAssignments: (payload) => {
    return api.post("/api/grades/detailed", payload);
  },
  
  deleteAssignment: (assignmentId) => {
    return api.delete(`/api/assignments/${assignmentId}`);
  },
  
  deleteAllAssignments: () => {
    return api.delete("/api/assignments-delete-all");
  },
  
  getClassGrades: (classId) => {
    return api.get(`/api/grades/class/${classId}`);
  },
  
  getDetailedGrades: (studentId) => {
    return api.get(`/api/grades/detailed/${studentId}`);
  },
  
  saveDetailedGrade: (payload) => {
    return api.post("/api/grades/detailed", payload);
  },
  
  getExamSchedules: () => {
    return api.get("/api/exam-schedules");
  },
  
  addExamSchedule: (payload) => {
    return api.post("/api/exam-schedules", payload);
  },
  
  editExamSchedule: (id, payload) => {
    return api.put(`/api/exam-schedules/${id}`, payload);
  },
  
  deleteExamSchedule: (id) => {
    return api.delete(`/api/exam-schedules/${id}`);
  }
};
