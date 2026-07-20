import { api } from '../api';

export const attendanceService = {
  getAttendance: (queryString = '') => {
    return api.get(`/api/attendance${queryString}`);
  },
  
  getAbsenceRequests: (queryString = '') => {
    return api.get(`/api/absence-requests${queryString}`);
  },
  
  saveAttendance: (payload) => {
    return api.post("/api/attendance", payload);
  },
  
  updateAbsenceRequestStatus: (endpoint, payload) => {
    return api.post(endpoint, payload);
  }
};
