import { api } from '../api';

export const attendanceService = {
  getAttendance: () => {
    return api.get("/api/attendance");
  },
  
  getAbsenceRequests: () => {
    return api.get("/api/absence-requests");
  },
  
  saveAttendance: (payload) => {
    return api.post("/api/attendance", payload);
  },
  
  updateAbsenceRequestStatus: (endpoint, payload) => {
    return api.post(endpoint, payload);
  }
};
