import { api } from '../api';

export const reportsService = {
  getReports: (queryString = '') => {
    return api.get(`/api/reports${queryString}`);
  },
  
  updateReportStatus: (reportId, payload) => {
    return api.put(`/api/reports/${reportId}`, payload);
  },
  
  deleteReport: (reportId) => {
    return api.delete(`/api/reports/${reportId}`);
  },
  
  deleteAllReports: () => {
    return api.delete("/api/reports-delete-all");
  }
};
